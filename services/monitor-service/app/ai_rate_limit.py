"""
Rate limiting par utilisateur pour les routes /ai/widgets/* (protection charge + coût LLM).
"""
from __future__ import annotations

import threading
import time
from uuid import UUID

from fastapi import Depends, HTTPException

from app.auth import get_current_user, require_paid_user_or_admin
from app.config import Settings, get_settings

_lock = threading.Lock()
_buckets: dict[str, list[float]] = {}
_MAX_RATE_BUCKETS = 12000


def _prune_and_count(ts_list: list[float], now: float, window_sec: float) -> int:
    cutoff = now - window_sec
    while ts_list and ts_list[0] < cutoff:
        ts_list.pop(0)
    return len(ts_list)


def check_ai_widget_rate_limit(user_id: str, max_per_minute: int) -> None:
    """Lève HTTP 429 si la limite est dépassée."""
    now = time.time()
    window = 60.0
    with _lock:
        bucket = _buckets.setdefault(user_id, [])
        count = _prune_and_count(bucket, now, window)
        if count >= max_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Trop de requêtes vers les widgets IA. Réessayez dans une minute.",
            )
        bucket.append(now)
        if len(_buckets) > _MAX_RATE_BUCKETS:
            dead = [uid for uid, lst in _buckets.items() if not lst]
            for uid in dead[:2000]:
                _buckets.pop(uid, None)
            if len(_buckets) > _MAX_RATE_BUCKETS:
                for uid in list(_buckets.keys())[: len(_buckets) - _MAX_RATE_BUCKETS]:
                    _buckets.pop(uid, None)


async def ai_widget_user(
    user_id: UUID = Depends(get_current_user),
    _paid: bool = Depends(require_paid_user_or_admin),
    settings: Settings = Depends(get_settings),
) -> UUID:
    check_ai_widget_rate_limit(str(user_id), max_per_minute=settings.ai_widget_max_per_minute)
    return user_id
