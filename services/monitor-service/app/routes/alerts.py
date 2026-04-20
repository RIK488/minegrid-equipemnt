from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.models import AlertRule, AlertEvent
from app.schemas import AlertRuleCreate, AlertRuleOut, AlertEventOut

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.post("/subscribe", response_model=AlertRuleOut)
async def subscribe(
    body: AlertRuleCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user),
):
    rule = AlertRule(user_id=user_id, rule=body.rule)
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return AlertRuleOut.model_validate(rule)


@router.get("/rules", response_model=list[AlertRuleOut])
async def list_rules(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user),
):
    result = await db.execute(
        select(AlertRule).where(AlertRule.user_id == user_id).order_by(AlertRule.created_at.desc())
    )
    return [AlertRuleOut.model_validate(r) for r in result.scalars().all()]


@router.delete("/rules/{rule_id}")
async def delete_rule(
    rule_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user),
):
    result = await db.execute(
        select(AlertRule).where(AlertRule.id == rule_id, AlertRule.user_id == user_id)
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Règle non trouvée")
    await db.delete(rule)
    await db.commit()
    return {"deleted": True}


@router.get("/events", response_model=list[AlertEventOut])
async def list_events(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user),
):
    result = await db.execute(
        select(AlertEvent)
        .where(AlertEvent.user_id == user_id)
        .order_by(AlertEvent.created_at.desc())
        .limit(limit)
    )
    return [AlertEventOut.model_validate(e) for e in result.scalars().all()]
