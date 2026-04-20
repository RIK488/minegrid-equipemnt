"""
Alert event generator.

After each ingestion run, compares new/updated projects against all user alert rules.
Generates alert_events for matches (avoids duplicates within 24h window).
"""
from __future__ import annotations
import logging
from datetime import datetime, timedelta

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Project, AlertRule, AlertEvent
from app.alerts.evaluator import evaluate_rule

logger = logging.getLogger("monitor.alerts.generator")


async def generate_alert_events(
    db: AsyncSession,
    since_hours: int = 24,
) -> dict:
    """
    Evaluate all alert rules against recently updated projects.
    Generates alert_events for matches.
    """
    cutoff = datetime.utcnow() - timedelta(hours=since_hours)

    # Fetch recently updated projects
    result = await db.execute(
        select(Project).where(Project.updated_at >= cutoff)
    )
    recent_projects = result.scalars().all()

    if not recent_projects:
        logger.info("No recently updated projects (since %dh)", since_hours)
        return {"projects_checked": 0, "rules_checked": 0, "events_created": 0}

    # Fetch all alert rules
    rules_result = await db.execute(select(AlertRule))
    all_rules = rules_result.scalars().all()

    if not all_rules:
        logger.info("No alert rules configured")
        return {"projects_checked": len(recent_projects), "rules_checked": 0, "events_created": 0}

    events_created = 0

    for rule_row in all_rules:
        rule_dict = rule_row.rule or {}
        for project in recent_projects:
            if not evaluate_rule(rule_dict, project):
                continue

            # Check for duplicate event within 24h window
            existing = (await db.execute(
                select(AlertEvent).where(and_(
                    AlertEvent.user_id == rule_row.user_id,
                    AlertEvent.project_id == project.id,
                    AlertEvent.created_at >= cutoff,
                ))
            )).scalar_one_or_none()

            if existing:
                continue

            db.add(AlertEvent(
                user_id=rule_row.user_id,
                project_id=project.id,
                event_type="rule_match",
                payload={
                    "rule_id": str(rule_row.id),
                    "rule": rule_dict,
                    "project_title": project.title,
                    "project_country": project.country,
                    "project_type": project.type,
                    "project_phase": project.phase,
                    "project_budget": float(project.budget_usd) if project.budget_usd else None,
                },
            ))
            events_created += 1

    await db.commit()

    logger.info(
        "Alert generation: %d projects × %d rules -> %d events",
        len(recent_projects), len(all_rules), events_created,
    )
    return {
        "projects_checked": len(recent_projects),
        "rules_checked": len(all_rules),
        "events_created": events_created,
    }
