"""Leboncoin connector via Piloterr API.

Uses Piloterr Leboncoin Search API to fetch ads, then normalizes them into
`MachineAsset` objects for upsert into Supabase `public.machines`.
"""

from __future__ import annotations

import logging
import os
from typing import Any
from urllib.parse import quote_plus, urlparse, parse_qs

import httpx

from app.ingestion.base import BaseConnector
from app.ingestion.machine_asset import MachineAsset
from app.ingestion.image_utils import upgrade_image_url

logger = logging.getLogger("monitor.connector.leboncoin")

# Piloterr endpoint (library sample shows base: api.piloterr.com)
DEFAULT_PILOTERR_BASE = "https://api.piloterr.com/api/v2/leboncoin/search"

# Filtrage permanent anti-bruit pour éviter les annonces non-équipements.
BLOCKED_CATEGORY_NAMES = {
    "collection",
    "cd---musique",
    "ventes-immobilières",
    "ventes-immobilieres",
    "jardin-&-plantes",
    "autres-services",
}

BLOCKED_TEXT_MARKERS = {
    "lego",
    "pokémon",
    "pokemon",
    "vinyle",
    "maison ",
    "appartement",
    "terrain ",
}

MACHINE_TEXT_HINTS = {
    "pelle",
    "excav",
    "chargeuse",
    "bulldozer",
    "niveleuse",
    "camion",
    "benne",
    "grue",
    "chariot",
    "telehandler",
    "compacteur",
    "finisseur",
    "concasseur",
    "crible",
    "foreuse",
    "generator",
    "compresseur",
}


def _extract_attr_map(attrs: Any) -> dict[str, Any]:
    """Convert Piloterr 'attributes' array into a dict {key: value}."""
    if not isinstance(attrs, list):
        return {}
    out: dict[str, Any] = {}
    for a in attrs:
        if not isinstance(a, dict):
            continue
        key = a.get("key")
        if not key:
            continue
        # Piloterr usually exposes 'value' as string
        if "value" in a:
            out[str(key)] = a.get("value")
    return out


def _extract_price(raw_ad: dict[str, Any]) -> str:
    price = raw_ad.get("price")
    if isinstance(price, list) and price:
        v = price[0]
        return str(v) if v is not None else ""
    if isinstance(price, (int, float)):
        return str(int(price))
    if isinstance(price, str):
        return price.strip()
    return ""

def _price_to_float(raw: str) -> float | None:
    s = (raw or "").strip()
    if not s:
        return None
    try:
        return float(s.replace(",", "."))
    except Exception:
        return None


def _extract_images(raw_ad: dict[str, Any]) -> list[str]:
    """Extract Leboncoin image URLs and upgrade them to the HD variant.

    Piloterr expose plusieurs tailles (`urls_large`, `urls`, `urls_thumb`).
    On privilégie systématiquement `urls_large`, et pour les URLs issues
    d'`urls` / `urls_thumb` on force `?rule=ad-large` via `upgrade_image_url`
    afin d'obtenir la même qualité qu'en naviguant sur leboncoin.fr.
    """
    images = raw_ad.get("images")
    if not isinstance(images, dict):
        return []

    collected: list[str] = []
    # Ordre de préférence : HD -> medium -> thumb.
    for k in ("urls_large", "urls", "urls_thumb"):
        v = images.get(k)
        if isinstance(v, list):
            collected.extend([str(x) for x in v if x])
    thumb = images.get("thumb_url")
    if isinstance(thumb, str) and thumb:
        collected.append(thumb)

    # Upgrade + dedup en préservant l'ordre.
    seen: set[str] = set()
    out: list[str] = []
    for u in collected:
        up = upgrade_image_url(str(u).strip())
        if not up or up in seen:
            continue
        seen.add(up)
        out.append(up)

    return out[:10]


class LeboncoinConnector(BaseConnector):
    name = "leboncoin"

    async def fetch(self) -> list[MachineAsset]:
        # Not used: Leboncoin is treated like Mascus (machines ingestion).
        return []

    async def fetch_machines(self) -> list[MachineAsset]:
        """Fetch Leboncoin ads from Piloterr."""
        api_key = self.config.get("piloterr_api_key") or os.environ.get("PILOTERR_API_KEY", "")
        if not api_key:
            self.logger.error("No Piloterr API key configured")
            return []

        base_url = self.config.get("base_url", DEFAULT_PILOTERR_BASE)
        queries: list[str] = self.config.get(
            "search_queries",
            [],
        )
        if not queries:
            self.logger.warning("Leboncoin: no search_queries configured")
            return []

        max_pages = int(self.config.get("max_pages", 1))
        min_price = float(self.config.get("min_price", 5000))
        require_images = bool(self.config.get("require_images", True))

        assets: list[MachineAsset] = []
        seen_ids: set[str] = set()
        errors: list[str] = []

        async with httpx.AsyncClient(timeout=45) as client:
            for query in queries:
                for page in range(1, max_pages + 1):
                    try:
                        data = await self._request_search_page(
                            client=client,
                            base_url=base_url,
                            api_key=api_key,
                            query=query,
                            page=page,
                        )
                        if data is None:
                            continue

                        ads = (
                            data.get("ads")
                            or data.get("results")
                            or data.get("data")
                            or []
                        )
                        if not isinstance(ads, list) or not ads:
                            break

                        for ad in ads:
                            if not isinstance(ad, dict):
                                continue
                            if not self._is_relevant_ad(ad, min_price=min_price, require_images=require_images):
                                continue
                            source_id = str(ad.get("list_id") or ad.get("id") or ad.get("url") or "")
                            if not source_id or source_id in seen_ids:
                                continue
                            seen_ids.add(source_id)

                            asset = self._normalize(ad, search_query=query)
                            if asset:
                                assets.append(asset)

                    except httpx.HTTPStatusError as exc:
                        body = ""
                        try:
                            body = (exc.response.text or "")[:200]
                        except Exception:
                            body = ""

                        err_msg = f"HTTP {exc.response.status_code} query='{query}' page={page} {body}".strip()
                        errors.append(err_msg)
                        self.logger.warning(
                            "Piloterr HTTP %d for query='%s' page=%d: %s",
                            exc.response.status_code,
                            query,
                            page,
                            body or exc,
                        )
                        if exc.response.status_code == 429:
                            break

                    except Exception as exc:
                        errors.append(f"Error query='{query}' page={page}: {exc}")
                        self.logger.warning("Piloterr error query='%s' page=%d: %s", query, page, exc)

        self.last_errors = errors
        self.logger.info("Fetched %d machines from Leboncoin (%d queries)", len(assets), len(queries))
        return assets

    def _is_relevant_ad(self, raw_ad: dict[str, Any], min_price: float, require_images: bool) -> bool:
        """Permanent quality gate: keep only relevant machine/equipment ads."""
        category_name = str(raw_ad.get("category_name") or "").strip().lower()
        if category_name in BLOCKED_CATEGORY_NAMES:
            return False

        subject = str(raw_ad.get("subject") or raw_ad.get("title") or "").strip().lower()
        body = str(raw_ad.get("body") or raw_ad.get("description") or "").strip().lower()
        hay = f"{subject}\n{body}\n{category_name}"
        if any(marker in hay for marker in BLOCKED_TEXT_MARKERS):
            return False

        # If it does not look like a machine ad, skip.
        if not any(hint in hay for hint in MACHINE_TEXT_HINTS):
            return False

        price_num = _price_to_float(_extract_price(raw_ad))
        if price_num is None or price_num < min_price:
            return False

        if require_images and len(_extract_images(raw_ad)) == 0:
            return False

        return True

    async def _request_search_page(
        self,
        client: httpx.AsyncClient,
        base_url: str,
        api_key: str,
        query: str,
        page: int,
    ) -> dict[str, Any] | None:
        """Request Piloterr Leboncoin search for one query+page."""
        normalized_query = self._normalize_query(query, page)
        endpoint_candidates = [base_url]
        param_candidates: list[dict[str, str]] = [
            {"query": normalized_query},
        ]

        last_exc: Exception | None = None
        for endpoint in endpoint_candidates:
            for params in param_candidates:
                try:
                    resp = await client.get(
                        endpoint,
                        params=params,
                        headers={
                            "x-api-key": api_key,
                            "Accept": "application/json",
                            "User-Agent": "minegrid-monitor/1.0",
                        },
                    )
                    resp.raise_for_status()
                    return resp.json()
                except httpx.HTTPStatusError as exc:
                    last_exc = exc
                    # Skip bad queries; retry on temporary 5xx.
                    if exc.response.status_code in (400, 404, 422):
                        continue
                    if exc.response.status_code in (500, 502, 503, 504):
                        continue
                    if exc.response.status_code == 429:
                        raise
                    continue
                except Exception as exc:
                    last_exc = exc
                    continue

        if last_exc:
            raise last_exc
        return None

    def _normalize_query(self, query: str, page: int) -> str:
        """Normalize input so Piloterr receives a usable Leboncoin search URL."""
        q = (query or "").strip()
        if not q:
            return q

        if q.startswith("http://") or q.startswith("https://"):
            # If the URL doesn't contain any pagination hint, try adding page=.
            if "page=" in q or "o=" in q:
                return q
            joiner = "&" if "?" in q else "?"
            return f"{q}{joiner}page={page}"

        # Keyword -> build a basic search URL.
        # (If your query needs category filters, prefer passing a full leboncoin URL.)
        return (
            "https://www.leboncoin.fr/recherche"
            f"?text={quote_plus(q)}&page={page}"
        )

    def _normalize(self, raw_ad: dict[str, Any], search_query: str) -> MachineAsset | None:
        subject = raw_ad.get("subject") or raw_ad.get("title") or ""
        if not subject:
            category_name = raw_ad.get("category_name") or ""
            subject = category_name
        if not subject:
            return None

        attr_map = _extract_attr_map(raw_ad.get("attributes"))
        brand = str(attr_map.get("brand") or attr_map.get("marque") or "").strip()
        model = str(attr_map.get("model") or attr_map.get("modele") or "").strip()

        category = str(raw_ad.get("category_name") or "").strip().lower()
        if category:
            category = category.replace(" ", "-")

        year: int | None = None
        for k in ("year", "annee", "year_of_manufacture", "date_fabrication"):
            if k in attr_map and attr_map[k]:
                try:
                    year = int(str(attr_map[k])[:4])
                    break
                except Exception:
                    pass

        price = _extract_price(raw_ad)
        description = str(raw_ad.get("body") or raw_ad.get("description") or "")

        # Condition isn't reliably present for all categories.
        condition = "used"
        for k in ("condition", "etat"):
            if k in attr_map and attr_map[k]:
                v = str(attr_map[k]).lower()
                if "new" in v or "neuf" in v:
                    condition = "new"
                break

        images = _extract_images(raw_ad)

        location = raw_ad.get("location") if isinstance(raw_ad.get("location"), dict) else {}
        country = str(location.get("country_id") or location.get("country") or "").strip()
        region = str(location.get("region_name") or location.get("region") or "").strip()

        source_url = str(raw_ad.get("url") or "").strip()
        source_id = str(raw_ad.get("list_id") or raw_ad.get("id") or source_url).strip()

        specs: dict[str, Any] = {
            "attributes": attr_map,
            "list_id": raw_ad.get("list_id"),
            "ad_type": raw_ad.get("ad_type"),
            "location": location,
        }

        return MachineAsset(
            name=subject.strip(),
            brand=brand,
            model=model,
            category=category,
            year=year,
            price=price,
            condition=condition,
            description=description[:2000],
            specifications=specs,
            images=images,
            source="leboncoin",
            source_url=source_url,
            source_id=source_id,
            country=country,
            region=region,
            raw=raw_ad,
        )

