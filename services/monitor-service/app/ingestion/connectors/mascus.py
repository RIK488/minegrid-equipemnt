"""Mascus connector via Piloterr API.

Fetches used equipment listings from Mascus through the Piloterr scraping API.
Config:
  piloterr_api_key: API key for Piloterr (required, also reads PILOTERR_API_KEY env)
  search_queries: list of search terms (e.g. ["excavator", "loader", "bulldozer"])
  country: ISO country code filter (e.g. "FR", "DE", "US")
  max_pages: maximum pages per query (default: 5)
  base_url: Piloterr API base (default: https://piloterr.com/api/v2/mascus/search)
"""
from __future__ import annotations
import os
import hashlib
import logging
from decimal import Decimal
from urllib.parse import urlparse, parse_qs

import httpx

from app.ingestion.base import BaseConnector
from app.ingestion.asset import ProjectAsset
from app.ingestion.machine_asset import MachineAsset
from app.ingestion.image_utils import upgrade_image_url as _upgrade_image_url

logger = logging.getLogger("monitor.connector.mascus")

# Piloterr attend: https://api.piloterr.com/v2/mascus/search?query=<mascus_url>
# Authentication via header: x-api-key
DEFAULT_PILOTERR_BASE = "https://api.piloterr.com/v2/mascus/search"

# Urls de catégories Mascus connues pour fonctionner avec Piloterr (évite les 500
# sur les pages racines du type /construction et les query ?keyword=...).
CONSTRUCTION_SAFE_SLUGS: list[str] = [
    "pelle-chenilles",
    "pelle-pneus",
    "chargeuse-pneus",
    "bulldozer",
    "niveleuse",
]

TRANSPORT_SAFE_SLUGS: list[str] = [
    "camion-benne",
    "camion-plateau",
    "tracteur-routier",
    "semi-remorque",
    "camion-melangeur",
]

MASCUS_CATEGORY_MAP: dict[str, str] = {
    # FR truck terms (important for admin queries in French)
    "camion benne": "camion-benne",
    "camion-benne": "camion-benne",
    "camion malaxeur": "camion-melangeur",
    "camion mélangeur": "camion-melangeur",
    "camion plateau": "camion-plateau",
    "porte engin": "porte-engin",
    "porte-engin": "porte-engin",
    "tracteur routier": "tracteur-routier",
    "semi remorque": "semi-remorque",
    "semi-remorque": "semi-remorque",
    "camion": "camion-benne",
    "camions": "camion-benne",
    # EN truck terms
    "truck mixer": "camion-melangeur",
    "concrete truck": "camion-melangeur",
    "flatbed truck": "camion-plateau",
    "tipper truck": "camion-benne",
    "dump truck": "camion-benne",
    "semi trailer": "semi-remorque",
    "semi-trailer": "semi-remorque",
    "trailer": "semi-remorque",
    "road tractor": "tracteur-routier",
    "truck tractor": "tracteur-routier",
    "tractor unit": "tracteur-routier",
    "tractor truck": "tracteur-routier",
    "truck": "camion-benne",
    # Terrassement / excavation (FR + EN)
    "mini pelle": "mini-pelle",
    "mini-pelleteuse": "mini-pelle",
    "mini excavator": "mini-pelle",
    "pelle sur chenilles": "pelle-chenilles",
    "crawler excavator": "pelle-chenilles",
    "pelle sur pneus": "pelle-pneus",
    "wheeled excavator": "pelle-pneus",
    "long reach": "pelle-long-reach",
    "demolition excavator": "pelle-demolition",
    "pelle demolition": "pelle-demolition",
    "pelle de démolition": "pelle-demolition",
    "grapple excavator": "pelle-grappin",
    "pelle grappin": "pelle-grappin",
    "pelle à grappin": "pelle-grappin",
    # Voirie / compactage (FR + EN)
    "road grader": "niveleuse",
    "motor grader": "niveleuse",
    "grader": "niveleuse",
    "asphalt paver": "finisseur",
    "paver": "finisseur",
    "finisseur": "finisseur",
    "cold planer": "raboteuse",
    "asphalt milling": "raboteuse",
    "raboteuse": "raboteuse",
    "single drum roller": "compacteur-monocylindre",
    "soil compactor": "compacteur-monocylindre",
    "compactor": "compacteur-monocylindre",
    "tandem roller": "compacteur-tandem",
    "compacteur tandem": "compacteur-tandem",
    "vibratory roller": "rouleau-vibrant",
    "rouleau vibrant": "rouleau-vibrant",
    "bitumen sprayer": "repandeuse",
    "repandeuse": "repandeuse",
    "répandeuse": "repandeuse",
    "trencher": "trancheuse",
    "trancheuse": "trancheuse",
    # Levage / manutention (FR + EN)
    "mobile crane": "grue-mobile",
    "grue mobile": "grue-mobile",
    "tower crane": "grue-tour",
    "grue a tour": "grue-tour",
    "grue à tour": "grue-tour",
    "spider crane": "grue-araignee",
    "grue araignee": "grue-araignee",
    "grue araignée": "grue-araignee",
    "forklift": "chariot-elevateur",
    "chariot elevateur": "chariot-elevateur",
    "chariot élévateur": "chariot-elevateur",
    "telehandler": "telescopique",
    "chariot telescopique": "telescopique",
    "chariot télescopique": "telescopique",
    "manuscopique": "manuscopique",
    "manitou": "manuscopique",
    # Concassage / criblage (FR + EN)
    "jaw crusher": "concasseur-machoires",
    "concasseur a machoires": "concasseur-machoires",
    "concasseur à mâchoires": "concasseur-machoires",
    "cone crusher": "concasseur-cone",
    "concasseur a cone": "concasseur-cone",
    "concasseur à cône": "concasseur-cone",
    "impact crusher": "concasseur-mobile",
    "concasseur mobile": "concasseur-mobile",
    "mobile crusher": "concasseur-mobile",
    "mobile screener": "crible-mobile",
    "crible mobile": "crible-mobile",
    "screener": "crible-mobile",
    "broyeur": "broyeur",
    "shredder": "broyeur",
    "scalpeur": "scalpeur",
    "scalper": "scalpeur",
    # Forage (FR + EN)
    "foreuse rotative": "foreuse-rotative",
    "rotary drill": "foreuse-rotative",
    "foreuse tariere": "foreuse-tariere",
    "foreuse tarière": "foreuse-tariere",
    "auger drill": "foreuse-tariere",
    "foreuse hydraulique": "foreuse-hydraulique",
    "drilling rig": "foreuse-hydraulique",
    "drill rig": "foreuse-hydraulique",
    "carotteuse": "carotteuse",
    "core drill": "carotteuse",
    "marteau fond de trou": "marteau-fdt",
    "dth hammer": "marteau-fdt",
    # Outils & accessoires (FR + EN)
    "godet cribleur": "godet-cribleur",
    "screening bucket": "godet-cribleur",
    "brise roche hydraulique": "brh",
    "brh": "brh",
    "hydraulic breaker": "brh",
    "tiltrotateur": "tiltrotateur",
    "tiltrotator": "tiltrotateur",
    "plaque vibrante": "plaque-vibrante",
    "plate compactor": "plaque-vibrante",
    "lame de nivellement": "lame-nivellement",
    "grading blade": "lame-nivellement",
    "treuil hydraulique": "treuil",
    "hydraulic winch": "treuil",
    "winch": "treuil",
    "excavator": "pelle-chenilles",
    "mini excavator": "mini-pelle",
    "crawler excavator": "pelle-chenilles",
    "wheeled excavator": "pelle-pneus",
    "wheel loader": "chargeuse-pneus",
    "loader": "chargeuse-pneus",
    "backhoe loader": "chargeuse-pelleteuse",
    "bulldozer": "bulldozer",
    "dozer": "bulldozer",
    "articulated dump truck": "camion-benne",
    "rigid dump truck": "tombereau-rigide",
    "roller": "compacteur-monocylindre",
    "crane": "grue-mobile",
    "skid steer loader": "compacte",
    "generator": "groupe-electrogene",
    "compressor": "compresseur",
    "concrete mixer": "camion-melangeur",
    "crusher": "concasseur-mobile",
    "drilling rig": "foreuse-hydraulique",
    # Keep generic "tractor" last-resort to avoid overmatching.
    "tractor": "tracteur-routier",
}

# Mascus retourne souvent des noms de catégories compacts (sans espaces),
# ex: "crawlerexcavators", "wheelloaders", etc.
# On les mappe explicitement vers les slugs utilisés par le site.
MASCUS_CATEGORY_ALIASES: dict[str, str] = {
    "crawlerexcavators": "pelle-chenilles",
    "wheeledexcavators": "pelle-pneus",
    "wheelloaders": "chargeuse-pneus",
    "backhoeloaders": "chargeuse-pelleteuse",
    "dozers": "bulldozer",
    "motorgraders": "niveleuse",
    "dumptrucks": "camion-benne",
    "articulateddumptrucks": "camion-benne",
    "rigiddumptrucks": "tombereau-rigide",
    "singledrumrollers": "compacteur-monocylindre",
    "tandemrollers": "compacteur-tandem",
    "cranes": "grue-mobile",
    "towercranes": "grue-tour",
    "mobilecranes": "grue-mobile",
    "forklifts": "chariot-elevateur",
    "telehandlers": "telescopique",
    "skidsteerloaders": "compacte",
    "asphaltpavers": "finisseur",
    "generators": "groupe-electrogene",
    "compressors": "compresseur",
    "concretemixers": "camion-melangeur",
    "truckmixers": "camion-melangeur",
    "dumpers": "camion-benne",
    "trucks": "camion-benne",
    "trailers": "semi-remorque",
    "crushers": "concasseur-mobile",
    "screeners": "crible-mobile",
    "drillingrigs": "foreuse-hydraulique",
    "tractors": "tracteur-routier",
    # Terrassement
    "miniexcavators": "mini-pelle",
    "crawlerexcavatorslongreach": "pelle-long-reach",
    "demolitionexcavators": "pelle-demolition",
    "grappleexcavators": "pelle-grappin",
    # Voirie
    "coldplaners": "raboteuse",
    "soilcompactors": "compacteur-monocylindre",
    "vibratoryrollers": "rouleau-vibrant",
    "bitumensprayers": "repandeuse",
    "trenchers": "trancheuse",
    # Levage
    "spidercranes": "grue-araignee",
    "manuscopiques": "manuscopique",
    # Concassage
    "jawcrushers": "concasseur-machoires",
    "conecrushers": "concasseur-cone",
    "impactcrushers": "concasseur-mobile",
    "mobilecrushers": "concasseur-mobile",
    "mobilescreeners": "crible-mobile",
    "shredders": "broyeur",
    "scalpers": "scalpeur",
    # Forage
    "rotarydrills": "foreuse-rotative",
    "augerdrills": "foreuse-tariere",
    "hydraulicdrills": "foreuse-hydraulique",
    "coredrills": "carotteuse",
    "dthhammers": "marteau-fdt",
    # Outils
    "screeningbuckets": "godet-cribleur",
    "hydraulicbreakers": "brh",
    "tiltrotators": "tiltrotateur",
    "platecompactors": "plaque-vibrante",
    "gradingblades": "lame-nivellement",
    "winches": "treuil",
}

SLUG_SECTION_MAP: dict[str, str] = {
    # Construction
    "mini-pelle": "construction",
    "pelle-chenilles": "construction",
    "pelle-pneus": "construction",
    "chargeuse-pneus": "construction",
    "chargeuse-pelleteuse": "construction",
    "bulldozer": "construction",
    "niveleuse": "construction",
    "compacteur-monocylindre": "construction",
    "compacteur-tandem": "construction",
    "finisseur": "construction",
    "grue-mobile": "construction",
    "grue-tour": "construction",
    "chariot-elevateur": "construction",
    "telescopique": "construction",
    "concasseur": "construction",
    "crible": "construction",
    "concasseur-machoires": "construction",
    "concasseur-cone": "construction",
    "concasseur-mobile": "construction",
    "crible-mobile": "construction",
    "broyeur": "construction",
    "scalpeur": "construction",
    "foreuse": "construction",
    "foreuse-rotative": "construction",
    "foreuse-tariere": "construction",
    "foreuse-hydraulique": "construction",
    "carotteuse": "construction",
    "marteau-fdt": "construction",
    "godet-cribleur": "construction",
    "brh": "construction",
    "tiltrotateur": "construction",
    "plaque-vibrante": "construction",
    "lame-nivellement": "construction",
    "treuil": "construction",
    # Transport
    "camion-benne": "transport",
    "camion-plateau": "transport",
    "tracteur-routier": "transport",
    "semi-remorque": "transport",
    "camion-melangeur": "transport",
}


def _build_mascus_category_url(slug: str, page: int) -> str:
    section = SLUG_SECTION_MAP.get(slug, "construction")
    return f"https://www.mascus.fr/{section}/{slug}?page={page}"


def _normalize_category(raw_category: str) -> str:
    """Map Mascus category strings to Minegrid internal category IDs."""
    lower = (raw_category or "").lower().strip()
    compact = lower.replace(" ", "").replace("-", "").replace("_", "")

    # 1) Exact aliases first (most reliable for Mascus API category_name).
    if compact in MASCUS_CATEGORY_ALIASES:
        return MASCUS_CATEGORY_ALIASES[compact]

    # 2) Then heuristic keyword mapping.
    # Use longest keys first so specific labels win:
    # "wheeled excavator" before "excavator", "backhoe loader" before "loader".
    for key, value in sorted(MASCUS_CATEGORY_MAP.items(), key=lambda kv: len(kv[0]), reverse=True):
        if key in lower:
            return value

    # 3) Last fallback: return slug-ish category.
    return lower.replace(" ", "-")


def _normalize_category_from_source(raw_category: str, source_url: str) -> str:
    """Prefer explicit URL slug when available, then fallback to category text."""
    url = (source_url or "").lower()
    # URL path is the most reliable discriminator for near categories.
    if "/pelle-pneus/" in url:
        return "pelle-pneus"
    if "/pelle-chenilles/" in url:
        return "pelle-chenilles"
    if "/chargeuse-pneus/" in url:
        return "chargeuse-pneus"
    if "/chariot-elevateur/" in url:
        return "chariot-elevateur"
    # Terrassement
    if "/mini-pelle/" in url:
        return "mini-pelle"
    if "/pelle-long-reach/" in url:
        return "pelle-long-reach"
    if "/pelle-demolition/" in url:
        return "pelle-demolition"
    if "/pelle-grappin/" in url:
        return "pelle-grappin"
    # Voirie
    if "/raboteuse/" in url:
        return "raboteuse"
    if "/compacteur-tandem/" in url:
        return "compacteur-tandem"
    if "/compacteur-monocylindre/" in url:
        return "compacteur-monocylindre"
    if "/rouleau-vibrant/" in url:
        return "rouleau-vibrant"
    if "/repandeuse/" in url:
        return "repandeuse"
    if "/trancheuse/" in url:
        return "trancheuse"
    # Levage
    if "/grue-tour/" in url:
        return "grue-tour"
    if "/grue-mobile/" in url:
        return "grue-mobile"
    if "/grue-araignee/" in url:
        return "grue-araignee"
    if "/telescopique/" in url:
        return "telescopique"
    if "/manuscopique/" in url:
        return "manuscopique"
    # Concassage / criblage
    if "/concasseur-machoires/" in url:
        return "concasseur-machoires"
    if "/concasseur-cone/" in url:
        return "concasseur-cone"
    if "/concasseur-mobile/" in url:
        return "concasseur-mobile"
    if "/crible-mobile/" in url:
        return "crible-mobile"
    if "/broyeur/" in url:
        return "broyeur"
    if "/scalpeur/" in url:
        return "scalpeur"
    # Forage
    if "/foreuse-rotative/" in url:
        return "foreuse-rotative"
    if "/foreuse-tariere/" in url:
        return "foreuse-tariere"
    if "/foreuse-hydraulique/" in url:
        return "foreuse-hydraulique"
    if "/carotteuse/" in url:
        return "carotteuse"
    if "/marteau-fdt/" in url:
        return "marteau-fdt"
    # Outils / accessoires
    if "/godet-cribleur/" in url:
        return "godet-cribleur"
    if "/brh/" in url:
        return "brh"
    if "/tiltrotateur/" in url:
        return "tiltrotateur"
    if "/plaque-vibrante/" in url:
        return "plaque-vibrante"
    if "/lame-nivellement/" in url:
        return "lame-nivellement"
    if "/treuil/" in url:
        return "treuil"
    if "/camion-benne/" in url:
        return "camion-benne"
    if "/camion-plateau/" in url:
        return "camion-plateau"
    if "/semi-remorque/" in url:
        return "semi-remorque"
    if "/camion-melangeur/" in url:
        return "camion-melangeur"
    if "/tracteur-routier/" in url:
        return "tracteur-routier"
    return _normalize_category(raw_category)


def _extract_price(raw: dict) -> str:
    price = raw.get("price", "")
    if isinstance(price, (int, float)):
        return str(int(price))
    if isinstance(price, str):
        cleaned = price.replace("€", "").replace("$", "").replace(",", "").replace(" ", "").strip()
        return cleaned or ""
    return ""


def _extract_images(raw: dict) -> list[str]:
    """Extract image URLs from multiple Piloterr/Mascus response shapes.

    Les différentes sources renvoient souvent plusieurs tailles. On privilégie
    systématiquement la plus grande (original / large / fullsize) et on
    applique une transformation d'URL pour remonter vers la version HD côté
    Mascus quand seule une miniature est exposée.
    """
    urls: list[str] = []

    # Common shapes seen across providers.
    candidates = [
        raw.get("images"),
        raw.get("image_urls"),
        raw.get("image"),
        raw.get("photos"),
        raw.get("photo_urls"),
        raw.get("pictures"),
        raw.get("gallery"),
    ]

    # Ordre de préférence quand un dict contient plusieurs tailles : on prend
    # toujours la plus grande disponible.
    HD_KEYS = ("fullsize", "full", "original", "xxl", "xl", "large", "big", "l")
    MEDIUM_KEYS = ("medium", "m", "md")
    SMALL_KEYS = ("small", "thumb", "thumbnail", "thumb_url", "sm", "xs")

    def _pick_best_from_dict(d: dict) -> list[str]:
        picks: list[str] = []
        for key_set in (HD_KEYS, MEDIUM_KEYS, ("url", "src"), SMALL_KEYS):
            for k in key_set:
                v = d.get(k)
                if isinstance(v, str) and v:
                    picks.append(v)
            if picks:
                # On s'arrête au premier niveau trouvé pour ne pas dupliquer la
                # même image dans plusieurs tailles.
                return picks
        return picks

    for candidate in candidates:
        if isinstance(candidate, list):
            for v in candidate:
                if isinstance(v, str) and v:
                    urls.append(v)
                elif isinstance(v, dict):
                    urls.extend(_pick_best_from_dict(v))
        elif isinstance(candidate, str) and candidate:
            urls.append(candidate)
        elif isinstance(candidate, dict):
            urls.extend(_pick_best_from_dict(candidate))
            for k in ("urls", "urls_large", "urls_thumb"):
                arr = candidate.get(k)
                if isinstance(arr, list):
                    urls.extend([str(x) for x in arr if x])

    # Single-value fallbacks frequently present in Mascus payloads.
    for k in ("image_url", "main_image", "cover_image", "thumbnail", "thumb_url"):
        v = raw.get(k)
        if isinstance(v, str) and v:
            urls.append(v)

    # Upgrade + dedup en préservant l'ordre.
    seen: set[str] = set()
    out: list[str] = []
    for u in urls:
        su = _upgrade_image_url(str(u).strip())
        if not su or su in seen:
            continue
        seen.add(su)
        out.append(su)

    return out[:10]


def _build_fingerprint(source_id: str, source: str) -> str:
    """SHA256 fingerprint for dedup: source + source_id."""
    payload = f"{source}|{source_id}"
    return hashlib.sha256(payload.encode()).hexdigest()


class MascusConnector(BaseConnector):
    name = "mascus"

    async def fetch(self) -> list[ProjectAsset]:
        """Fetch is not used for machines — this connector targets MachineAsset."""
        return []

    async def fetch_machines(self) -> list[MachineAsset]:
        """Fetch equipment listings from Mascus via Piloterr."""
        api_key = self.config.get("piloterr_api_key") or os.environ.get("PILOTERR_API_KEY", "")
        if not api_key:
            self.logger.error("No Piloterr API key configured")
            return []

        base_url = self.config.get("base_url", DEFAULT_PILOTERR_BASE)
        queries: list[str] = self.config.get("search_queries", [
            "excavator", "loader", "bulldozer", "crane", "dump truck",
            "grader", "compactor", "forklift",
        ])
        queries = self._expand_queries(queries)
        country = self.config.get("country", "")
        max_pages = int(self.config.get("max_pages", 5))
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
                            country=country,
                        )
                        if data is None:
                            continue

                        listings = data if isinstance(data, list) else data.get("results", data.get("data", []))
                        if not listings:
                            break

                        for item in listings:
                            item_id = str(item.get("id", item.get("url", "")))
                            if not item_id or item_id in seen_ids:
                                continue
                            seen_ids.add(item_id)

                            asset = self._normalize(item, query)
                            if asset:
                                if require_images and not asset.images:
                                    continue
                                assets.append(asset)

                    except httpx.HTTPStatusError as exc:
                        body = ""
                        try:
                            body = exc.response.text[:200]
                        except Exception:
                            body = ""
                        err_msg = f"HTTP {exc.response.status_code} query='{query}' page={page} {body}".strip()
                        errors.append(err_msg)
                        self.logger.warning(
                            "Piloterr HTTP %d for query='%s' page=%d: %s",
                            exc.response.status_code, query, page, body or exc,
                        )
                        if exc.response.status_code == 429:
                            self.logger.info("Rate limited — stopping query '%s'", query)
                            break
                    except Exception as exc:
                        errors.append(f"Error query='{query}' page={page}: {exc}")
                        self.logger.warning("Piloterr error query='%s' page=%d: %s", query, page, exc)

        # Expose fetch errors for API routes / UI feedback.
        self.last_errors = errors
        self.logger.info("Fetched %d machines from Mascus (%d queries)", len(assets), len(queries))
        return assets

    async def _request_search_page(
        self,
        client: httpx.AsyncClient,
        base_url: str,
        api_key: str,
        query: str,
        page: int,
        country: str,
    ) -> dict | list | None:
        """Try common Piloterr query parameter variants to avoid brittle 400s."""
        endpoint_candidates = [base_url]
        # Piloterr has changed path variants across periods/accounts.
        # Try both canonical forms to avoid hard failures on 404.
        if "/api/v2/" in base_url:
            endpoint_candidates.append(base_url.replace("/api/v2/", "/v2/"))
        elif "/v2/" in base_url:
            endpoint_candidates.append(base_url.replace("/v2/", "/api/v2/"))

        normalized_query = self._normalize_query(query, page)
        # Piloterr Mascus endpoint supports `query` (official param).
        # Keep only the canonical shape to avoid noisy 400s.
        param_candidates: list[dict[str, str]] = [{"query": normalized_query}]
        if country:
            for params in param_candidates:
                params["country"] = country

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
                    # Keep trying when server rejects parameter shape or is
                    # temporarily unstable (Piloterr can return 500s for some
                    # query shapes). We try other parameter variants.
                    if exc.response.status_code in (400, 404, 422):
                        continue
                    if exc.response.status_code in (500, 502, 503, 504):
                        continue
                    # 429 must bubble up so the caller can stop the query loop.
                    raise
                except Exception as exc:
                    last_exc = exc
                    continue

        if last_exc:
            raise last_exc
        return None

    def _normalize_query(self, query: str, page: int) -> str:
        """Piloterr Mascus Search expects a Mascus URL in `query`.

        IMPORTANT: Piloterr retourne souvent des 500 si on lui passe des pages
        racines Mascus (/construction, /transport) ou des URLs avec
        `?keyword=...`. On normalise donc en URLs de catégories "slug"
        reconnues côté Piloterr.
        """
        q = (query or "").strip()
        if q.startswith("http://") or q.startswith("https://"):
            # Piloterr renvoie des 500 sur les URLs "racines" Mascus avec
            # `?keyword=...`. On réécrit donc en catégories "slug" sûres.
            parsed = urlparse(q)
            if parsed.netloc.endswith("mascus.fr") and parsed.path.rstrip("/") in ("/construction", "construction", "/transport", "transport"):
                qs = parse_qs(parsed.query or "")
                kw = ""
                if "keyword" in qs and qs["keyword"]:
                    kw = str(qs["keyword"][0])

                kw_lower = (kw or "").lower().strip()
                slug: str | None = None
                if kw_lower:
                    for key, candidate_slug in MASCUS_CATEGORY_MAP.items():
                        if key in kw_lower:
                            slug = candidate_slug
                            break

                if not slug:
                    slug = "pelle-chenilles"  # fallback fonctionnel

                return _build_mascus_category_url(slug, page)

            # Ensure we pass a page parameter to avoid piloterr returning
            # inconsistent results or internal errors on paginated scraping.
            if "page=" in q:
                return q
            joiner = "&" if "?" in q else "?"
            return f"{q}{joiner}page={page}"

        # Fallback: build a Mascus category URL from a keyword.
        # (On évite /construction?keyword=... qui provoque des 500.)
        q_lower = q.lower()
        slug: str | None = None
        for key, candidate_slug in MASCUS_CATEGORY_MAP.items():
            if key in q_lower:
                slug = candidate_slug
                break

        if slug:
            return _build_mascus_category_url(slug, page)

        # Dernier recours: catégorie "pelle-chenilles" qui fonctionne.
        self.logger.warning("Piloterr Mascus: keyword non mappé '%s' -> fallback 'pelle-chenilles'", q)
        base = "https://www.mascus.fr/construction/pelle-chenilles"
        joiner = "&" if "?" in base else "?"
        return f"{base}{joiner}page={page}"

    def _expand_queries(self, queries: list[str]) -> list[str]:
        """Expand queries (urls racines) en catégories compatibles Piloterr."""
        expanded: list[str] = []

        from urllib.parse import urlparse

        for q in queries:
            raw = (q or "").strip()
            if not raw:
                continue

            if raw.startswith("http://") or raw.startswith("https://"):
                parsed = urlparse(raw)
                path = (parsed.path or "").rstrip("/")

                # On remplace les pages racines (qui cassent Piloterr) par un set
                # de slugs de catégories connues.
                if path in ("/construction", "construction"):
                    expanded.extend([f"https://www.mascus.fr/construction/{slug}" for slug in CONSTRUCTION_SAFE_SLUGS])
                    continue
                if path in ("/transport", "transport"):
                    expanded.extend([f"https://www.mascus.fr/transport/{slug}" for slug in TRANSPORT_SAFE_SLUGS])
                    continue
                # Sinon: on garde tel quel, le _normalize_query ajoutera page=...

            expanded.append(raw)

        return expanded

    def _normalize(self, raw: dict, search_query: str) -> MachineAsset | None:
        title = raw.get("title", raw.get("name", ""))
        if not title:
            brand_fallback = str(raw.get("brand", "")).strip()
            model_fallback = str(raw.get("model", "")).strip()
            title = f"{brand_fallback} {model_fallback}".strip()
        if not title:
            return None

        brand = raw.get("brand", raw.get("manufacturer", ""))
        model = raw.get("model", "")
        if not brand and " " in title:
            parts = title.split(None, 2)
            brand = parts[0]
            if len(parts) > 1:
                model = model or parts[1]

        source_url = raw.get("url", raw.get("link", ""))
        category_raw = raw.get("category", raw.get("type", raw.get("category_name", search_query)))
        category = _normalize_category_from_source(category_raw, source_url)

        year_raw = raw.get("year", raw.get("year_of_manufacture", None))
        year = None
        if year_raw:
            try:
                year = int(str(year_raw)[:4])
                if year < 1950 or year > 2030:
                    year = None
            except (ValueError, TypeError):
                pass

        condition = "used"
        cond_raw = str(raw.get("condition", "")).lower()
        if "new" in cond_raw or "neuf" in cond_raw:
            condition = "new"

        if raw.get("price_euro") is not None:
            price = str(raw.get("price_euro"))
        else:
            price = _extract_price(raw)

        images = _extract_images(raw)

        specs: dict = {}
        hours = raw.get("hours", raw.get("operating_hours", raw.get("meter_reading", raw.get("meter_readout"))))
        if hours is not None and str(hours) != "":
            specs["hours"] = str(hours)
            specs["meter_readout"] = str(hours)
            if raw.get("meter_readout_unit"):
                specs["meter_readout_unit"] = str(raw.get("meter_readout_unit"))
        weight = raw.get("weight", raw.get("operating_weight"))
        if weight is not None and str(weight) != "":
            specs["weight"] = str(weight)
            specs["workingWeight"] = weight
        power = raw.get("power", raw.get("engine_power"))
        if power is not None and str(power) != "":
            specs["power"] = {"value": str(power), "unit": "kW"}
        if raw.get("year_of_manufacture") is not None:
            specs["year_of_manufacture"] = raw.get("year_of_manufacture")
        if raw.get("category_name"):
            specs["category_name"] = raw.get("category_name")
        if raw.get("catalog_name"):
            specs["catalog_name"] = raw.get("catalog_name")
        if raw.get("price_original_unit"):
            specs["price_currency"] = raw.get("price_original_unit")

        country = raw.get(
            "country",
            raw.get("location_country", raw.get("location_country_code", raw.get("company_country", self.config.get("country", "")))),
        )
        region = raw.get("region", raw.get("location", raw.get("location_city", "")))
        if raw.get("location_city"):
            specs["location_city"] = raw.get("location_city")
        if country:
            specs["location_country"] = country
        if region:
            specs["location_region"] = region

        source_id = str(raw.get("id", source_url))
        description = str(raw.get("description", "") or "").strip()
        if not description:
            description = (
                f"{title.strip()} - {brand.strip()} {model.strip()} | "
                f"Annee: {year if year else 'N/A'} | "
                f"Heures: {specs.get('meter_readout', 'N/A')} {specs.get('meter_readout_unit', '')} | "
                f"Localisation: {region or 'N/A'}, {country or 'N/A'}"
            ).strip()

        return MachineAsset(
            name=title.strip(),
            brand=brand.strip(),
            model=model.strip(),
            category=category,
            year=year,
            price=price,
            condition=condition,
            description=description[:2000],
            specifications=specs,
            images=images,
            source="mascus",
            source_url=source_url,
            source_id=source_id,
            country=country,
            region=region,
            raw=raw,
        )
