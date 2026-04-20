"""Upsert machine listings to Supabase via REST API.

Uses the Supabase service-role key to insert/upsert directly into the
`machines` table. Deduplication is based on (source, source_id).
"""
from __future__ import annotations
import logging
from dataclasses import dataclass

import httpx

from app.config import get_settings
from app.ingestion.machine_asset import MachineAsset

logger = logging.getLogger("monitor.machine_upsert")

MASCUS_SYSTEM_SELLER_ID = "00000000-0000-0000-0000-000000000001"


@dataclass
class MachineIngestResult:
    inserted: int = 0
    updated: int = 0
    skipped: int = 0
    errors: int = 0
    details: list[str] | None = None

    def __post_init__(self):
        if self.details is None:
            self.details = []

    def to_dict(self) -> dict:
        return {
            "inserted": self.inserted,
            "updated": self.updated,
            "skipped": self.skipped,
            "errors": self.errors,
            "details": (self.details or [])[:20],
        }


async def upsert_machines(
    assets: list[MachineAsset],
    seller_id: str = MASCUS_SYSTEM_SELLER_ID,
    batch_size: int = 50,
) -> MachineIngestResult:
    """Insert or update machines in Supabase. Dedup by source + source_id."""
    settings = get_settings()
    result = MachineIngestResult()

    if not settings.supabase_url or not settings.supabase_service_role_key:
        logger.error("Supabase credentials not configured — cannot upsert machines")
        result.errors += 1
        result.details.append("Supabase credentials missing")
        return result

    base = settings.supabase_url.rstrip("/")
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        for i in range(0, len(assets), batch_size):
            batch = assets[i : i + batch_size]
            rows = []
            for asset in batch:
                row = asset.to_supabase_row(seller_id)
                rows.append(row)

            try:
                existing = await _find_existing(client, base, headers, batch)
                to_insert = []
                to_update = []

                for row, asset in zip(rows, batch):
                    key = f"{asset.source}|{asset.source_id}"
                    if key in existing:
                        row["id"] = existing[key]
                        to_update.append(row)
                    else:
                        to_insert.append(row)

                if to_insert:
                    resp = await client.post(
                        f"{base}/rest/v1/machines",
                        json=to_insert,
                        headers=headers,
                    )
                    if resp.status_code in (200, 201):
                        result.inserted += len(to_insert)
                    else:
                        snippet = (resp.text or "").strip()[:300]
                        logger.warning("Insert failed %d: %s", resp.status_code, resp.text[:300])
                        result.errors += len(to_insert)
                        result.details.append(f"Insert batch error: {resp.status_code} {snippet}")

                for row in to_update:
                    machine_id = row.pop("id")
                    resp = await client.patch(
                        f"{base}/rest/v1/machines?id=eq.{machine_id}",
                        json=row,
                        headers=headers,
                    )
                    if resp.status_code in (200, 204):
                        result.updated += 1
                    else:
                        snippet = (resp.text or "").strip()[:200]
                        logger.warning("Update %s failed %d: %s", machine_id, resp.status_code, resp.text[:200])
                        result.errors += 1
                        result.details.append(f"Update error: {resp.status_code} {snippet}")

            except Exception as exc:
                logger.warning("Batch upsert error: %s", exc)
                result.errors += len(batch)
                result.details.append(f"Batch error: {exc}")

    logger.info(
        "Machine upsert: inserted=%d updated=%d skipped=%d errors=%d",
        result.inserted, result.updated, result.skipped, result.errors,
    )
    return result


async def _find_existing(
    client: httpx.AsyncClient,
    base: str,
    headers: dict,
    assets: list[MachineAsset],
) -> dict[str, str]:
    """Query Supabase for existing machines by (source, source_id). Returns {key: id}."""
    if not assets:
        return {}

    source_ids = [a.source_id for a in assets if a.source_id]
    if not source_ids:
        return {}

    source_val = assets[0].source
    id_filter = ",".join(source_ids[:100])

    try:
        resp = await client.get(
            f"{base}/rest/v1/machines",
            params={
                "select": "id,source_id,source",
                "source": f"eq.{source_val}",
                "source_id": f"in.({id_filter})",
            },
            headers=headers,
        )
        if resp.status_code != 200:
            return {}

        data = resp.json()
        return {
            f"{row['source']}|{row['source_id']}": row["id"]
            for row in data
            if row.get("source_id")
        }
    except Exception as exc:
        logger.warning("Existing lookup error: %s", exc)
        return {}
