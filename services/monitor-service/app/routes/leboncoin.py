"""Admin endpoints to run Leboncoin import via Piloterr."""

from __future__ import annotations

import logging
import os
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth import require_admin
from app.config import get_settings
from app.ingestion.connectors.leboncoin import LeboncoinConnector
from app.ingestion.machine_upsert import upsert_machines, MachineIngestResult

logger = logging.getLogger("monitor.routes.leboncoin")

router = APIRouter(
    prefix="/admin/leboncoin",
    tags=["leboncoin"],
    dependencies=[Depends(require_admin)],
)


class LeboncoinRunRequest(BaseModel):
    search_queries: list[str] | None = None
    max_pages: int = 1


class LeboncoinRunResponse(BaseModel):
    inserted: int = 0
    updated: int = 0
    skipped: int = 0
    errors: int = 0
    total_fetched: int = 0
    details: list[str] = []


@router.post("/run", response_model=LeboncoinRunResponse)
async def run_leboncoin_import(body: LeboncoinRunRequest | None = None):
    """Trigger a Leboncoin import via Piloterr API."""
    config: dict = {}
    if body:
        if body.search_queries:
            config["search_queries"] = body.search_queries
        config["max_pages"] = body.max_pages

    connector = LeboncoinConnector(config=config)
    machines = await connector.fetch_machines()

    if not machines:
        details = list(getattr(connector, "last_errors", []) or [])
        return LeboncoinRunResponse(
            total_fetched=0,
            errors=len(details),
            details=details[:20],
        )

    result: MachineIngestResult = await upsert_machines(machines)

    return LeboncoinRunResponse(
        inserted=result.inserted,
        updated=result.updated,
        skipped=result.skipped,
        errors=result.errors,
        total_fetched=len(machines),
        details=result.details[:20],
    )


@router.get("/status")
async def leboncoin_status():
    """Check if Leboncoin connector is properly configured."""
    settings = get_settings()
    has_key = bool(os.environ.get("PILOTERR_API_KEY", ""))
    has_supabase = bool(settings.supabase_url and settings.supabase_service_role_key)
    return {
        "piloterr_api_key_configured": has_key,
        "supabase_configured": has_supabase,
        "ready": has_key and has_supabase,
    }

