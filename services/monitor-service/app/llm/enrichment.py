"""
LLM enrichment pipeline — summarize, extract metadata, propose equipment needs.

Never called from the frontend. Always runs server-side via admin endpoint or batch job.
"""
from __future__ import annotations
import json
import logging
import re
import hashlib
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from uuid import UUID

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Project, ProjectEntity, EquipmentNeed
from app.llm.client import get_llm_client
from app.llm.prompts import EXTRACT_PROMPT, EQUIPMENT_PROMPT

logger = logging.getLogger("monitor.llm.enrichment")

_EQUIPMENT_CATEGORY_ALIASES = {
    "excavatrice": "excavator",
    "pelle_hydraulique": "excavator",
    "pelle": "excavator",
    "tracked_excavator": "tracked_excavator",
    "wheel_excavator": "wheel_excavator",
    "pelle_sur_chenilles": "tracked_excavator",
    "pelle_sur_pneus": "wheel_excavator",
    "chargeuse": "loader",
    "bulldozer": "dozer",
    "niveleuse": "grader",
    "compacteur": "compactor",
    "camion_benne": "dump_truck",
    "concasseur": "crusher",
    "forage": "drill",
    "grue_mobile": "mobile_crane",
    "chariot_telecopique": "telehandler",
    "nacelle": "aerial_platform",
    "finisseur": "paver",
    "betonniere": "concrete_mixer",
    "pompe_beton": "concrete_pump",
    "centrale_enrobage": "asphalt_plant",
    "centrale_beton": "batching_plant",
}

_NON_MACHINE_KEYWORDS = {
    "textile", "cuir", "caoutchouc", "plastique",
    "assurance", "audit", "formation", "documentation", "imprim",
    "nettoyage", "gardiennage", "restauration", "fourniture",
    "produits", "médical", "pharmaceutique", "littér", "buanderie",
    "sport", "médailles", "articles artistiques", "services courants",
}
_WORKS_KEYWORDS = {
    "chantier", "terrassement", "excavation", "construction", "génie civil",
    "genie civil", "route", "autoroute", "pont", "barrage", "mine", "carrière",
    "carriere", "port", "rail", "voirie", "enrobé", "enrobe", "fondation",
    "pavage", "asphalte", "béton", "beton", "grutage", "levage",
}


def _safe_date(val: str | None) -> date | None:
    if not val:
        return None
    try:
        return date.fromisoformat(val)
    except (ValueError, TypeError):
        return None


def _safe_decimal(val) -> Decimal | None:
    if val is None:
        return None
    try:
        return Decimal(str(val))
    except (InvalidOperation, ValueError):
        return None


def _normalize_equipment_category(raw: str | None) -> str:
    if not isinstance(raw, str):
        return ""
    normalized = raw.strip().lower().replace("-", "_").replace(" ", "_")
    return _EQUIPMENT_CATEGORY_ALIASES.get(normalized, normalized)


def _is_non_machine_project(project: Project, raw_text: str, source_text: str) -> bool:
    title = (project.title or "").lower()
    corpus = f"{title} {raw_text} {source_text}".lower()
    title_has_non_machine_signal = any(k in title for k in _NON_MACHINE_KEYWORDS)
    title_has_works_signal = any(k in title for k in _WORKS_KEYWORDS)
    if title_has_non_machine_signal and not title_has_works_signal:
        return True
    has_non_machine_signal = any(k in corpus for k in _NON_MACHINE_KEYWORDS)
    has_works_signal = any(k in corpus for k in _WORKS_KEYWORDS)
    # Prioritize textual evidence: non-machine tenders (supplies/services)
    # should not receive construction-machine proposals even if project type is noisy.
    return has_non_machine_signal and not has_works_signal


async def _fetch_source_context(url: str | None, limit_chars: int = 3000) -> str:
    """Fetch source URL and return a compact text snippet for LLM context."""
    if not url or not isinstance(url, str):
        return ""
    if not (url.startswith("http://") or url.startswith("https://")):
        return ""
    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            res = await client.get(url, headers={"User-Agent": "MinegridMonitor/1.0"})
        if res.status_code < 200 or res.status_code >= 300:
            return ""
        content_type = (res.headers.get("content-type") or "").lower()
        if "text/html" not in content_type and "text/plain" not in content_type and "application/json" not in content_type:
            return ""
        raw = res.text or ""
        # Very lightweight HTML cleanup without external deps.
        text = re.sub(r"<script[\s\S]*?</script>", " ", raw, flags=re.IGNORECASE)
        text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text[:limit_chars]
    except Exception:
        return ""


async def enrich_project(db: AsyncSession, project: Project) -> dict:
    """
    Run the full LLM enrichment pipeline on a single project.
    Returns a summary dict of what was updated.
    """
    client = get_llm_client()
    result = {"project_id": str(project.id), "steps": []}

    raw_text = ""
    if project.raw:
        raw_text = json.dumps(project.raw, ensure_ascii=False, default=str)[:4000]
    source_text = await _fetch_source_context(project.source_url)

    user_context = (
        f"Titre: {project.title}\n"
        f"Type: {project.type or 'inconnu'}\n"
        f"Phase: {project.phase or 'inconnue'}\n"
        f"Pays: {project.country or 'inconnu'}\n"
        f"Région: {project.region or ''}\n"
        f"Budget: {project.budget_usd or 'inconnu'} USD\n"
        f"Source URL: {project.source_url or 'n/a'}\n"
        f"Données brutes (extrait): {raw_text[:2000]}\n"
        f"Contenu source (extrait): {source_text[:2000]}"
    )

    # Step 1: Extract metadata (dates, budget, actors, locations)
    try:
        extract_resp = await client.complete(EXTRACT_PROMPT, user_context)
        extracted = json.loads(extract_resp.text)

        # Update dates if missing
        if not project.start_date:
            d = _safe_date(extracted.get("dates", {}).get("start"))
            if d:
                project.start_date = d
        if not project.end_date:
            d = _safe_date(extracted.get("dates", {}).get("end"))
            if d:
                project.end_date = d

        # Update budget if missing
        if not project.budget_usd:
            b = _safe_decimal(extracted.get("budget_usd"))
            if b:
                project.budget_usd = b

        # Add actors as entities
        actors = extracted.get("actors", [])
        for actor in actors:
            name = actor.get("name", "").strip()
            if not name:
                continue
            existing = (await db.execute(
                select(ProjectEntity).where(
                    ProjectEntity.project_id == project.id,
                    ProjectEntity.name == name,
                )
            )).scalar_one_or_none()
            if not existing:
                db.add(ProjectEntity(
                    project_id=project.id,
                    name=name,
                    role=actor.get("role", ""),
                ))

        result["steps"].append({
            "step": "extract",
            "actors_found": len(actors),
            "model": extract_resp.model,
            "tokens": extract_resp.tokens_used,
        })
    except Exception as exc:
        logger.warning("Extract step failed for %s: %s", project.id, exc)
        result["steps"].append({"step": "extract", "error": str(exc)})

    # Step 2: Equipment needs estimation
    try:
        equip_resp = await client.complete(EQUIPMENT_PROMPT, user_context)
        equip_data = json.loads(equip_resp.text)
        needs = equip_data.get("equipment_needs", [])
        if _is_non_machine_project(project, raw_text, source_text):
            needs = []

        existing_rows = (
            await db.execute(select(EquipmentNeed).where(EquipmentNeed.project_id == project.id))
        ).scalars().all()
        existing_by_category = {row.category: row for row in existing_rows if isinstance(row.category, str)}
        seen_categories: set[str] = set()

        for need in needs:
            category = _normalize_equipment_category(need.get("category"))
            if not category:
                continue
            seen_categories.add(category)
            existing = existing_by_category.get(category)

            confidence = _safe_decimal(need.get("confidence")) or Decimal("0.5")
            rationale = f"[LLM] {need.get('rationale', '')}"

            if existing:
                existing.qty_min = need.get("qty_min", 0)
                existing.qty_max = need.get("qty_max", 0)
                existing.confidence = confidence
                existing.rationale = rationale
            else:
                db.add(EquipmentNeed(
                    project_id=project.id,
                    category=category,
                    qty_min=need.get("qty_min", 0),
                    qty_max=need.get("qty_max", 0),
                    confidence=confidence,
                    rationale=rationale,
                ))

        # Remove stale categories when a new analysis excludes them.
        for row in existing_rows:
            if not isinstance(row.category, str):
                continue
            if row.category not in seen_categories:
                db.delete(row)

        result["steps"].append({
            "step": "equipment",
            "needs_count": len(needs),
            "model": equip_resp.model,
            "tokens": equip_resp.tokens_used,
        })
    except Exception as exc:
        logger.warning("Equipment step failed for %s: %s", project.id, exc)
        result["steps"].append({"step": "equipment", "error": str(exc)})

    await db.commit()
    return result


async def enrich_projects_batch(
    db: AsyncSession,
    limit: int = 50,
    force: bool = False,
) -> list[dict]:
    """
    Batch enrich projects that haven't been enriched yet.
    By default, only enriches projects with no equipment_needs in DB.
    Set force=True to re-enrich all.
    """
    query = select(Project).order_by(Project.updated_at.desc()).limit(limit)

    if not force:
        # Only projects without equipment needs
        from sqlalchemy import exists
        has_needs = (
            select(EquipmentNeed.id)
            .where(EquipmentNeed.project_id == Project.id)
            .exists()
        )
        query = query.where(~has_needs)

    result = await db.execute(query)
    projects = result.scalars().all()

    logger.info("Enriching %d projects (force=%s)", len(projects), force)

    results = []
    for project in projects:
        try:
            r = await enrich_project(db, project)
            results.append(r)
            logger.info("Enriched: %s", project.title)
        except Exception as exc:
            logger.error("Failed to enrich %s: %s", project.id, exc)
            results.append({"project_id": str(project.id), "error": str(exc)})

    return results


async def analyze_project_debug(project: Project) -> dict:
    """
    Admin debug helper:
    - builds the exact context sent to LLM
    - returns proof metadata (hash, model, tokens, timestamp)
    - returns normalized equipment candidates (without DB write)
    """
    settings_provider = "mock"
    client = get_llm_client()

    raw_text = ""
    if project.raw:
        raw_text = json.dumps(project.raw, ensure_ascii=False, default=str)[:4000]
    source_text = await _fetch_source_context(project.source_url)

    user_context = (
        f"Titre: {project.title}\n"
        f"Type: {project.type or 'inconnu'}\n"
        f"Phase: {project.phase or 'inconnue'}\n"
        f"Pays: {project.country or 'inconnu'}\n"
        f"Région: {project.region or ''}\n"
        f"Budget: {project.budget_usd or 'inconnu'} USD\n"
        f"Source URL: {project.source_url or 'n/a'}\n"
        f"Données brutes (extrait): {raw_text[:2000]}\n"
        f"Contenu source (extrait): {source_text[:2000]}"
    )
    context_hash = hashlib.sha256(user_context.encode("utf-8")).hexdigest()

    resp = await client.complete(EQUIPMENT_PROMPT, user_context)
    settings_provider = "openai" if "gpt" in (resp.model or "").lower() else settings_provider
    parsed = json.loads(resp.text)
    needs = parsed.get("equipment_needs", [])
    normalized = []
    for need in needs:
        category = _normalize_equipment_category(need.get("category"))
        if not category:
            continue
        normalized.append({
            "category": category,
            "qty_min": need.get("qty_min", 0),
            "qty_max": need.get("qty_max", 0),
            "confidence": need.get("confidence", 0.5),
            "rationale": need.get("rationale", ""),
        })

    return {
        "project_id": str(project.id),
        "analyzed_at": datetime.utcnow().isoformat() + "Z",
        "provider": settings_provider,
        "model": resp.model,
        "tokens_used": resp.tokens_used,
        "context_hash": context_hash,
        "context_sizes": {
            "raw_chars": len(raw_text),
            "source_chars": len(source_text),
            "prompt_chars": len(user_context),
        },
        "equipment_needs_preview": normalized[:20],
    }
