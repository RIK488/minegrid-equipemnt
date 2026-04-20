"""MDB procurement connector (World Bank / AfDB / IsDB / BOAD feeds).

Supports generic RSS/Atom and JSON payloads with per-source field mapping.
"""
from __future__ import annotations

from decimal import Decimal
from html import unescape
import re

import httpx

from app.ingestion.asset import ProjectAsset
from app.ingestion.base import BaseConnector
from app.ingestion.connectors.public_portals import _guess_type, _parse_date, _first_text
import xml.etree.ElementTree as ET
import json

COUNTRY_ALIASES = {
    "MA": "MA",
    "MOROCCO": "MA",
    "MAROC": "MA",
    "FR": "FR",
    "FRANCE": "FR",
    "DE": "DE",
    "GERMANY": "DE",
    "ALLEMAGNE": "DE",
    "ES": "ES",
    "SPAIN": "ES",
    "ESPAGNE": "ES",
    "IT": "IT",
    "ITALY": "IT",
    "ITALIE": "IT",
    "GB": "GB",
    "UK": "GB",
    "UNITED KINGDOM": "GB",
    "ROYAUME-UNI": "GB",
    "PT": "PT",
    "PORTUGAL": "PT",
    "NL": "NL",
    "NETHERLANDS": "NL",
    "PAYS-BAS": "NL",
    "BE": "BE",
    "BELGIUM": "BE",
    "BELGIQUE": "BE",
    "CH": "CH",
    "SWITZERLAND": "CH",
    "SUISSE": "CH",
    "AT": "AT",
    "AUSTRIA": "AT",
    "AUTRICHE": "AT",
    "GR": "GR",
    "GREECE": "GR",
    "GRÈCE": "GR",
    "GRECE": "GR",
    "PL": "PL",
    "POLAND": "PL",
    "POLOGNE": "PL",
    "RO": "RO",
    "ROMANIA": "RO",
    "ROUMANIE": "RO",
    "DZ": "DZ",
    "ALGERIA": "DZ",
    "ALGERIE": "DZ",
    "ALGÉRIE": "DZ",
    "TN": "TN",
    "TUNISIA": "TN",
    "TUNISIE": "TN",
    "LY": "LY",
    "LIBYA": "LY",
    "LIBYE": "LY",
    "MR": "MR",
    "MAURITANIA": "MR",
    "MAURITANIE": "MR",
    "EG": "EG",
    "EGYPT": "EG",
    "EGYPTE": "EG",
    "ÉGYPTE": "EG",
    "SA": "SA",
    "SAUDI ARABIA": "SA",
    "ARABIE SAOUDITE": "SA",
    "AE": "AE",
    "UAE": "AE",
    "UNITED ARAB EMIRATES": "AE",
    "EMIRATS ARABES UNIS": "AE",
    "QA": "QA",
    "QATAR": "QA",
    "KW": "KW",
    "KUWAIT": "KW",
    "KOWEIT": "KW",
    "KOWEÏT": "KW",
    "OM": "OM",
    "OMAN": "OM",
    "BH": "BH",
    "BAHRAIN": "BH",
    "BAHREIN": "BH",
    "JO": "JO",
    "JORDAN": "JO",
    "JORDANIE": "JO",
    "LB": "LB",
    "LEBANON": "LB",
    "LIBAN": "LB",
    "IQ": "IQ",
    "IRAQ": "IQ",
    "IRAK": "IQ",
    "SN": "SN",
    "SENEGAL": "SN",
    "SENEGAL ": "SN",
    "CI": "CI",
    "COTE D'IVOIRE": "CI",
    "COTE D IVOIRE": "CI",
    "CÔTE D'IVOIRE": "CI",
    "CÔTE D IVOIRE": "CI",
    "IVORY COAST": "CI",
    "CM": "CM",
    "CAMEROON": "CM",
    "CAMEROUN": "CM",
    "NG": "NG",
    "NIGERIA": "NG",
}

COUNTRY_LABELS = {
    "MA": "Morocco",
    "FR": "France",
    "DE": "Germany",
    "ES": "Spain",
    "IT": "Italy",
    "GB": "United Kingdom",
    "PT": "Portugal",
    "NL": "Netherlands",
    "BE": "Belgium",
    "CH": "Switzerland",
    "AT": "Austria",
    "GR": "Greece",
    "PL": "Poland",
    "RO": "Romania",
    "DZ": "Algeria",
    "TN": "Tunisia",
    "LY": "Libya",
    "MR": "Mauritania",
    "EG": "Egypt",
    "SA": "Saudi Arabia",
    "AE": "United Arab Emirates",
    "QA": "Qatar",
    "KW": "Kuwait",
    "OM": "Oman",
    "BH": "Bahrain",
    "JO": "Jordan",
    "LB": "Lebanon",
    "IQ": "Iraq",
    "SN": "Senegal",
    "CI": "Côte d'Ivoire",
    "CM": "Cameroon",
    "NG": "Nigeria",
    "GH": "Ghana",
    "BF": "Burkina Faso",
    "GN": "Guinea",
    "NE": "Niger",
    "ML": "Mali",
    "BJ": "Benin",
    "TG": "Togo",
}

COUNTRY_TEXT_HINTS = {
    "MA": ["morocco", "maroc"],
    "FR": ["france"],
    "DE": ["germany", "allemagne"],
    "ES": ["spain", "espagne"],
    "IT": ["italy", "italie"],
    "GB": ["united kingdom", "uk", "royaume-uni", "royaume uni"],
    "PT": ["portugal"],
    "NL": ["netherlands", "pays-bas", "pays bas"],
    "BE": ["belgium", "belgique"],
    "CH": ["switzerland", "suisse"],
    "AT": ["austria", "autriche"],
    "GR": ["greece", "grèce", "grece"],
    "PL": ["poland", "pologne"],
    "RO": ["romania", "roumanie"],
    "DZ": ["algeria", "algerie", "algérie"],
    "TN": ["tunisia", "tunisie"],
    "LY": ["libya", "libye"],
    "MR": ["mauritania", "mauritanie"],
    "EG": ["egypt", "egypte", "égypte"],
    "SA": ["saudi arabia", "arabie saoudite"],
    "AE": ["united arab emirates", "emirats arabes unis", "uae"],
    "QA": ["qatar"],
    "KW": ["kuwait", "koweit", "koweït"],
    "OM": ["oman"],
    "BH": ["bahrain", "bahrein", "bahreïn"],
    "JO": ["jordan", "jordanie"],
    "LB": ["lebanon", "liban"],
    "IQ": ["iraq", "irak"],
    "SN": ["senegal", "sénégal"],
    "CI": ["cote d'ivoire", "côte d'ivoire", "ivory coast"],
    "CM": ["cameroon", "cameroun"],
    "NG": ["nigeria"],
    "GH": ["ghana"],
    "BF": ["burkina faso"],
    "GN": ["guinea", "guinee", "guinée"],
    "NE": ["niger"],
    "ML": ["mali"],
    "BJ": ["benin", "bénin"],
    "TG": ["togo"],
}


def _normalize_country_key(value: str | None) -> str:
    raw = (value or "").strip().upper()
    if not raw:
        return ""
    return COUNTRY_ALIASES.get(raw, raw)


def _infer_country_from_text(text: str, allowed_codes: set[str]) -> str:
    low = (text or "").lower()
    if not low:
        return ""
    for code in allowed_codes:
        for hint in COUNTRY_TEXT_HINTS.get(code, []):
            if hint in low:
                return COUNTRY_LABELS.get(code, "")
    return ""


class MDBProcurementConnector(BaseConnector):
    name = "mdb_procurement"

    async def fetch(self) -> list[ProjectAsset]:
        sources: list[dict] = self.config.get("sources", [])
        timeout = int(self.config.get("timeout_seconds", 25))
        max_items_per_source = int(self.config.get("max_items_per_source", 100))
        country_filter = {_normalize_country_key(c) for c in self.config.get("country_filter", []) if c}

        assets: list[ProjectAsset] = []
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            for src in sources:
                try:
                    url = src.get("url", "").strip()
                    if not url:
                        continue
                    req_headers = {"User-Agent": "Mozilla/5.0 (compatible; MinegridMonitor/1.0)"}
                    req_headers.update(src.get("headers", {}))
                    verify_ssl = bool(src.get("verify_ssl", True))
                    if verify_ssl:
                        resp = await client.get(url, headers=req_headers)
                    else:
                        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, verify=False) as insecure_client:
                            resp = await insecure_client.get(url, headers=req_headers)
                    resp.raise_for_status()
                    fmt = (src.get("format", "rss") or "rss").lower()

                    if fmt in {"rss", "atom", "xml"}:
                        rows = self._parse_rss(resp.text, max_items_per_source)
                    elif fmt == "html":
                        rows = self._parse_html(resp.text, url, src, max_items_per_source)
                    else:
                        rows = self._parse_json(resp.text, src, max_items_per_source)

                    source_name = src.get("name", "MDB")
                    source_code = src.get("source_code", "MDB").upper()
                    default_phase = src.get("default_phase", "tender")
                    default_country = src.get("default_country", "")
                    default_region = src.get("default_region", "")
                    type_hint = src.get("type_hint", "infrastructure")

                    for row in rows:
                        title = (row.get("title") or "").strip()
                        if not title:
                            continue
                        country = (row.get("country") or default_country).strip()
                        if not country:
                            inferred = _infer_country_from_text(
                                f"{title} {(row.get('description') or '')}",
                                country_filter or set(COUNTRY_LABELS.keys()),
                            )
                            if inferred:
                                country = inferred
                        if country_filter and country:
                            if _normalize_country_key(country) not in country_filter:
                                continue
                        phase = (row.get("phase") or default_phase).strip() or default_phase
                        description = (row.get("description") or "").strip()
                        project_type = _guess_type(f"{title} {description}", fallback=type_hint)

                        budget = None
                        if row.get("budget_usd") is not None:
                            try:
                                budget = Decimal(str(row.get("budget_usd")))
                            except Exception:
                                budget = None

                        assets.append(
                            ProjectAsset(
                                title=title,
                                country=country,
                                region=(row.get("region") or default_region).strip(),
                                type=project_type,
                                phase=phase,
                                budget_usd=budget,
                                source=f"MDB - {source_name}",
                                source_url=(row.get("url") or url).strip(),
                                raw={
                                    "source_type": "mdb",
                                    "source_code": source_code,
                                    "updated_at": row.get("updated_at"),
                                    "description": description,
                                    "payload": row,
                                },
                                confidence=Decimal("0.78"),
                            )
                        )
                except Exception as exc:
                    self.logger.warning("MDB source fetch failed (%s): %s", src.get("name", "unknown"), exc)

        self.logger.info("Fetched %d assets from MDB feeds", len(assets))
        return assets

    def _parse_rss(self, xml_text: str, max_items: int) -> list[dict]:
        try:
            root = ET.fromstring(xml_text)
        except Exception:
            return []
        rows = []
        nodes = list(root.findall(".//item")) + list(root.findall(".//{http://www.w3.org/2005/Atom}entry"))
        for node in nodes[:max_items]:
            title = _first_text(node, ["title", "{http://www.w3.org/2005/Atom}title"])
            link = _first_text(node, ["link", "{http://www.w3.org/2005/Atom}link"])
            if not link:
                atom_link = node.find("{http://www.w3.org/2005/Atom}link")
                if atom_link is not None:
                    link = atom_link.attrib.get("href", "")
            description = _first_text(node, ["description", "summary", "{http://www.w3.org/2005/Atom}summary"])
            pub_date = _first_text(node, ["pubDate", "updated", "{http://www.w3.org/2005/Atom}updated"])
            updated = _parse_date(pub_date)
            rows.append(
                {
                    "title": title,
                    "url": link,
                    "description": description,
                    "updated_at": updated.isoformat() if updated else "",
                }
            )
        return rows

    def _parse_html(self, html: str, base_url: str, src: dict, max_items: int) -> list[dict]:
        include_patterns = [p.lower() for p in src.get("include_patterns", [
            "procurement", "tender", "opportunit", "bid", "notice", "appel d'offres", "marche",
            "btp", "batiment", "bâtiment", "construction", "travaux publics", "civil works",
        ])]
        rows: list[dict] = []
        seen: set[str] = set()
        for m in re.finditer(r"<a[^>]+href=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", html, flags=re.I | re.S):
            href = m.group(1).strip()
            raw_label = re.sub(r"<[^>]+>", " ", m.group(2))
            label = re.sub(r"\s+", " ", unescape(raw_label)).strip()
            if not href or not label:
                continue
            low = label.lower()
            if include_patterns and not any(p in low for p in include_patterns):
                continue
            if href.startswith("/"):
                from urllib.parse import urlsplit

                root = urlsplit(base_url)
                href = f"{root.scheme}://{root.netloc}{href}"
            elif not href.startswith("http://") and not href.startswith("https://"):
                continue
            key = f"{label}|{href}"
            if key in seen:
                continue
            seen.add(key)
            rows.append({"title": label, "url": href, "description": ""})
            if len(rows) >= max_items:
                break
        return rows

    def _parse_json(self, text: str, src: dict, max_items: int) -> list[dict]:
        try:
            data = json.loads(text)
        except Exception:
            return []
        path = src.get("items_path", "items")
        items = data
        for part in path.split("."):
            if isinstance(items, dict):
                items = items.get(part, [])
            else:
                items = []
                break
        if not isinstance(items, list):
            return []

        def _get(obj: dict, key: str, default=""):
            return obj.get(key, default)

        title_field = src.get("title_field", "title")
        link_field = src.get("link_field", "url")
        country_field = src.get("country_field", "country")
        region_field = src.get("region_field", "region")
        phase_field = src.get("phase_field", "phase")
        date_field = src.get("date_field", "updated_at")
        budget_field = src.get("budget_field", "budget_usd")
        description_field = src.get("description_field", "description")

        rows = []
        for obj in items[:max_items]:
            if not isinstance(obj, dict):
                continue
            rows.append(
                {
                    "title": _get(obj, title_field, ""),
                    "url": _get(obj, link_field, ""),
                    "country": _get(obj, country_field, ""),
                    "region": _get(obj, region_field, ""),
                    "phase": _get(obj, phase_field, ""),
                    "updated_at": _get(obj, date_field, ""),
                    "budget_usd": _get(obj, budget_field, None),
                    "description": _get(obj, description_field, ""),
                    "raw": obj,
                }
            )
        return rows
