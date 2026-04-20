from __future__ import annotations

import json
import threading
import time
from typing import Any
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.ai_rate_limit import ai_widget_user
from app.config import Settings, get_settings
from app.llm.client import get_llm_client

router = APIRouter(prefix="/ai/widgets", tags=["ai-widgets"])

_payload_cache: dict[str, tuple[float, dict[str, Any]]] = {}
_payload_lock = threading.Lock()
_PAYLOAD_CACHE_MAX_KEYS = 4000


def _default_predictions(machine_count: int) -> list[dict[str, Any]]:
    return [
        {
            "metric": "Ventes mensuelles",
            "currentValue": machine_count * 15000,
            "predictedValue": int(machine_count * 15000 * 1.12),
            "confidence": 0.78,
            "timeframe": "30d",
            "trend": "up" if machine_count > 0 else "stable",
            "factors": [
                "qualite des annonces",
                "reponse aux prospects",
                "saisonnalite",
            ],
        },
        {
            "metric": "Taux de conversion",
            "currentValue": 12,
            "predictedValue": 14 if machine_count > 0 else 10,
            "confidence": 0.7,
            "timeframe": "30d",
            "trend": "up" if machine_count > 0 else "stable",
            "factors": [
                "prix",
                "photos",
                "completude des descriptions",
            ],
        },
    ]


def _default_recommendations(machine_count: int, with_images: int) -> list[dict[str, Any]]:
    recs: list[dict[str, Any]] = []
    if machine_count == 0:
        recs.append(
            {
                "id": "create_listings",
                "category": "marketing",
                "title": "Creer vos premieres annonces",
                "description": "Aucune annonce active n'a ete detectee.",
                "impact": "high",
                "effort": "low",
                "roi": 0.6,
                "actions": [
                    "Publier au moins 5 annonces",
                    "Ajouter des photos HD",
                    "Completer specs et localisation",
                ],
                "priority": 1,
            }
        )
    else:
        if with_images < machine_count:
            recs.append(
                {
                    "id": "images_quality",
                    "category": "content",
                    "title": "Ameliorer les visuels des annonces",
                    "description": f"{machine_count - with_images} annonce(s) sans images detectees.",
                    "impact": "high",
                    "effort": "low",
                    "roi": 0.35,
                    "actions": [
                        "Ajouter 4-8 photos par machine",
                        "Utiliser des images nettes et recentes",
                        "Prioriser les vues exterieure/interieure",
                    ],
                    "priority": 2,
                }
            )
        recs.append(
            {
                "id": "follow_up",
                "category": "sales",
                "title": "Structurer le suivi commercial",
                "description": "Mettre en place des relances standardisees pour augmenter les conversions.",
                "impact": "medium",
                "effort": "low",
                "roi": 0.25,
                "actions": [
                    "Repondre en moins de 2h",
                    "Relancer a J+1 et J+3",
                    "Proposer une offre personnalisee",
                ],
                "priority": 3,
            }
        )
    return recs


def _default_insights(machine_count: int, with_images: int) -> list[dict[str, Any]]:
    insights: list[dict[str, Any]] = []
    if machine_count == 0:
        insights.append(
            {
                "id": "no_inventory",
                "type": "alert",
                "title": "Aucune annonce active",
                "description": "Le compte client ne contient aucune machine active.",
                "confidence": 0.99,
                "priority": "critical",
                "action": "Publier des annonces pour activer les analyses IA",
                "createdAt": "now",
            }
        )
    else:
        insights.append(
            {
                "id": "inventory_detected",
                "type": "recommendation",
                "title": "Inventaire detecte",
                "description": f"{machine_count} machine(s) reliee(s) au compte client.",
                "confidence": 0.92,
                "priority": "medium",
                "action": "Prioriser les machines a forte valeur",
                "createdAt": "now",
            }
        )
        if with_images < machine_count:
            insights.append(
                {
                    "id": "missing_images",
                    "type": "alert",
                    "title": "Qualite des annonces a renforcer",
                    "description": f"{machine_count - with_images} annonce(s) manquent d'images.",
                    "confidence": 0.88,
                    "priority": "high",
                    "action": "Ajouter des images pour augmenter la conversion",
                    "createdAt": "now",
                }
            )
    return insights


async def _fetch_user_machines(settings: Settings, user_id: str) -> list[dict[str, Any]]:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="Supabase non configure")

    base = settings.supabase_url.rstrip("/")
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Accept": "application/json",
    }
    columns = ["sellerid", "seller_id", "user_id", "owner_id"]

    async with httpx.AsyncClient(timeout=15.0) as client:
        for col in columns:
            url = f"{base}/rest/v1/machines?select=*&{col}=eq.{user_id}&limit=500"
            res = await client.get(url, headers=headers)
            if res.status_code >= 200 and res.status_code < 300:
                data = res.json()
                if isinstance(data, list):
                    return data
            # 400/404 -> colonne inexistante ou table indisponible; on tente la suivante
        return []


async def _llm_enrich(
    machine_count: int,
    with_images: int,
    defaults: dict[str, Any],
) -> dict[str, Any]:
    try:
        client = get_llm_client()
        system_prompt = (
            "Tu es un assistant IA pour dashboard commercial d'un vendeur d'engins. "
            "Retourne uniquement un JSON valide avec les cles: insights, recommendations, predictions, optimizations."
        )
        user_prompt = json.dumps(
            {
                "machine_count": machine_count,
                "with_images": with_images,
                "defaults": defaults,
                "constraints": {
                    "language": "fr",
                    "max_items_per_list": 6,
                    "business_focus": True,
                },
            },
            ensure_ascii=False,
        )
        llm_res = await client.complete(system_prompt=system_prompt, user_prompt=user_prompt)
        parsed = json.loads(llm_res.text)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass
    return defaults


async def _build_payload(user_id: str, settings: Settings) -> dict[str, Any]:
    """Cache court TTL pour éviter appels LLM répétés lorsque le front appelle plusieurs endpoints /ai/widgets."""

    now = time.time()
    ttl = settings.payload_cache_ttl_sec
    with _payload_lock:
        hit = _payload_cache.get(user_id)
        if hit and (now - hit[0]) < ttl:
            return hit[1]

    machines = await _fetch_user_machines(settings, user_id)
    machine_count = len(machines)
    with_images = sum(
        1
        for m in machines
        if (isinstance(m.get("images"), list) and len(m.get("images") or []) > 0)
        or (isinstance(m.get("photos"), list) and len(m.get("photos") or []) > 0)
    )

    defaults = {
        "insights": _default_insights(machine_count, with_images),
        "recommendations": _default_recommendations(machine_count, with_images),
        "predictions": _default_predictions(machine_count),
        "optimizations": [
            {
                "type": "seo_optimization",
                "title": "Optimiser les titres d'annonces",
                "description": "Ameliorer la visibilite en adaptant les titres aux recherches frequentes.",
                "actions": [
                    "Ajouter marque + modele + annee",
                    "Inclure l'etat et la localisation",
                    "Eviter les titres trop courts",
                ],
                "expectedImpact": "Augmentation de la visibilite de 20-30%",
            },
            {
                "type": "content_optimization",
                "title": "Ameliorer les descriptions techniques",
                "description": "Les annonces detaillees convertissent mieux.",
                "actions": [
                    "Renseigner heures, etat, accessoires",
                    "Ajouter points forts et maintenance",
                    "Preciser disponibilite et delai",
                ],
                "expectedImpact": "Amelioration du taux de contact de 10-15%",
            },
        ],
        "meta": {
            "machine_count": machine_count,
            "with_images": with_images,
            "user_id": user_id,
        },
    }

    result = await _llm_enrich(machine_count, with_images, defaults)
    with _payload_lock:
        _payload_cache[user_id] = (time.time(), result)
        if len(_payload_cache) > _PAYLOAD_CACHE_MAX_KEYS:
            for k in list(_payload_cache.keys())[: len(_payload_cache) - _PAYLOAD_CACHE_MAX_KEYS]:
                _payload_cache.pop(k, None)
    return result


@router.get("/insights")
async def get_insights(
    user_id: UUID = Depends(ai_widget_user),
    settings: Settings = Depends(get_settings),
):
    payload = await _build_payload(str(user_id), settings)
    return payload.get("insights", [])


@router.get("/recommendations")
async def get_recommendations(
    user_id: UUID = Depends(ai_widget_user),
    settings: Settings = Depends(get_settings),
):
    payload = await _build_payload(str(user_id), settings)
    return payload.get("recommendations", [])


@router.get("/predictions")
async def get_predictions(
    user_id: UUID = Depends(ai_widget_user),
    settings: Settings = Depends(get_settings),
):
    payload = await _build_payload(str(user_id), settings)
    return payload.get("predictions", [])


@router.get("/optimizations")
async def get_optimizations(
    user_id: UUID = Depends(ai_widget_user),
    settings: Settings = Depends(get_settings),
):
    payload = await _build_payload(str(user_id), settings)
    return payload.get("optimizations", [])


@router.get("/benchmark")
async def get_sales_benchmark(
    user_id: UUID = Depends(ai_widget_user),
    settings: Settings = Depends(get_settings),
):
    """Indicateurs de comparaison secteur (référentiels internes + activité vendeur)."""
    machines = await _fetch_user_machines(settings, str(user_id))
    machine_count = len(machines)
    preds = _default_predictions(machine_count)
    your_performance = int(preds[0]["currentValue"]) if preds else 0
    return {
        "sector": "Équipements BTP",
        "average": 65000,
        "top25": 85000,
        "yourPerformance": your_performance,
        "currency": "MAD",
        "note": (
            "Comparaison avec des références internes marché location/vente engins ; "
            "« Votre performance » est estimée à partir de vos annonces actives."
        ),
    }

