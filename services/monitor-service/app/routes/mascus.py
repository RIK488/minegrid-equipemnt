"""Admin endpoints for Mascus equipment import."""
from __future__ import annotations
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import require_admin
from app.config import get_settings
from app.ingestion.connectors.mascus import MascusConnector
from app.ingestion.machine_upsert import upsert_machines, MachineIngestResult

logger = logging.getLogger("monitor.routes.mascus")

router = APIRouter(
    prefix="/admin/mascus",
    tags=["mascus"],
    dependencies=[Depends(require_admin)],
)


class MascusRunRequest(BaseModel):
    search_queries: list[str] | None = None
    country: str | None = None
    max_pages: int = 5


class MascusRunResponse(BaseModel):
    inserted: int = 0
    updated: int = 0
    skipped: int = 0
    errors: int = 0
    total_fetched: int = 0
    details: list[str] = []


@router.post("/run", response_model=MascusRunResponse)
async def run_mascus_import(body: MascusRunRequest | None = None):
    """Trigger a Mascus import via Piloterr API."""
    settings = get_settings()
    config: dict = {}

    if body:
        if body.search_queries:
            config["search_queries"] = body.search_queries
        if body.country:
            config["country"] = body.country
        config["max_pages"] = body.max_pages

    connector = MascusConnector(config=config)
    machines = await connector.fetch_machines()

    if not machines:
        details = list(getattr(connector, "last_errors", []) or [])
        return MascusRunResponse(
            total_fetched=0,
            errors=len(details),
            details=details[:20],
        )

    result: MachineIngestResult = await upsert_machines(machines)

    return MascusRunResponse(
        inserted=result.inserted,
        updated=result.updated,
        skipped=result.skipped,
        errors=result.errors,
        total_fetched=len(machines),
        details=result.details[:20],
    )


@router.get("/status")
async def mascus_status():
    """Check if Mascus connector is properly configured."""
    settings = get_settings()
    import os
    has_key = bool(os.environ.get("PILOTERR_API_KEY", ""))
    has_supabase = bool(settings.supabase_url and settings.supabase_service_role_key)

    return {
        "piloterr_api_key_configured": has_key,
        "supabase_configured": has_supabase,
        "ready": has_key and has_supabase,
    }
