"""Public procurement portals connector (RSS/JSON).

This connector is intentionally generic to support multiple country portals
without changing Python code each time.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from email.utils import parsedate_to_datetime
import json
import os
import re
from html import unescape
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit

import httpx

from app.ingestion.asset import ProjectAsset
from app.ingestion.base import BaseConnector


def _first_text(node: ET.Element, names: list[str]) -> str:
    for name in names:
        found = node.find(name)
        if found is not None and found.text:
            return found.text.strip()
    return ""


def _guess_type(text: str, fallback: str = "infrastructure") -> str:
    t = (text or "").lower()
    mapping = {
        "mine": "mine",
        "mining": "mine",
        "carriere": "mine",
        "btp": "btp",
        "batiment": "btp",
        "bâtiment": "btp",
        "construction": "btp",
        "travaux publics": "btp",
        "civil works": "btp",
        "route": "road",
        "road": "road",
        "highway": "road",
        "bridge": "road",
        "pont": "road",
        "port": "port",
        "harbor": "port",
        "rail": "rail",
        "railway": "rail",
        "dam": "dam",
        "barrage": "dam",
        "power": "energy",
        "solar": "energy",
        "energie": "energy",
        "electric": "energy",
        "industrial": "industrial_zone",
        "zone": "industrial_zone",
    }
    for key, value in mapping.items():
        if key in t:
            return value
    return fallback


def _parse_date(text: str) -> datetime | None:
    if not text:
        return None
    try:
        return parsedate_to_datetime(text)
    except Exception:
        pass
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
    except Exception:
        return None


class PublicPortalsConnector(BaseConnector):
    name = "public_portals"

    @staticmethod
    def _resolve_env_placeholders(value):
        if not isinstance(value, str):
            return value
        m = re.fullmatch(r"\$\{([A-Z0-9_]+)\}", value.strip())
        if not m:
            return value
        return os.environ.get(m.group(1), "")

    async def _maybe_authenticate(self, client: httpx.AsyncClient, src: dict, timeout: int) -> None:
        auth = src.get("auth") or {}
        if not isinstance(auth, dict) or not auth:
            return
        auth_type = (auth.get("type") or "").lower()
        if auth_type != "form_post":
            return

        login_url = (auth.get("login_url") or "").strip()
        if not login_url:
            return

        headers = {"User-Agent": "Mozilla/5.0 (compatible; MinegridMonitor/1.0)"}
        headers.update(src.get("headers", {}))
        headers.update(auth.get("headers", {}))

        fields = auth.get("fields", {})
        if not isinstance(fields, dict):
            fields = {}
        payload = {k: self._resolve_env_placeholders(v) for k, v in fields.items()}
        payload = {k: v for k, v in payload.items() if v not in (None, "")}

        if not payload:
            self.logger.info("Auth skipped for %s: empty credentials payload", src.get("name", "unknown"))
            return

        try:
            resp = await client.post(login_url, data=payload, headers=headers, timeout=timeout)
            if resp.status_code < 200 or resp.status_code >= 400:
                self.logger.warning("Auth failed for %s: status %s", src.get("name", "unknown"), resp.status_code)
                return
            success_contains = (auth.get("success_contains") or "").strip().lower()
            if success_contains and success_contains not in (resp.text or "").lower():
                self.logger.warning("Auth uncertain for %s: success marker not found", src.get("name", "unknown"))
                return
            self.logger.info("Authenticated source session: %s", src.get("name", "unknown"))
        except Exception as exc:
            self.logger.warning("Auth exception for %s: %s", src.get("name", "unknown"), exc)

    async def fetch(self) -> list[ProjectAsset]:
        sources: list[dict] = self.config.get("sources", [])
        timeout = int(self.config.get("timeout_seconds", 25))
        max_items_per_source = int(self.config.get("max_items_per_source", 100))
        default_phase = self.config.get("default_phase", "tender")
        country_filter = {c.upper() for c in self.config.get("country_filter", [])}

        assets: list[ProjectAsset] = []
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            for src in sources:
                try:
                    url = src.get("url", "").strip()
                    if not url:
                        continue
                    fmt = (src.get("format", "rss") or "rss").lower()
                    country = (src.get("country") or "").strip()
                    country_code = (src.get("country_code") or "").upper()
                    if country_filter and country_code and country_code not in country_filter:
                        continue

                    req_headers = {"User-Agent": "Mozilla/5.0 (compatible; MinegridMonitor/1.0)"}
                    req_headers.update(src.get("headers", {}))
                    verify_ssl = bool(src.get("verify_ssl", True))
                    await self._maybe_authenticate(client, src, timeout)
                    if verify_ssl:
                        resp = await client.get(url, headers=req_headers)
                    else:
                        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, verify=False) as insecure_client:
                            resp = await insecure_client.get(url, headers=req_headers)
                    resp.raise_for_status()

                    if fmt in {"rss", "atom", "xml"}:
                        items = self._parse_rss_items(resp.text, max_items_per_source)
                    elif fmt == "html":
                        html_pages = [(url, resp.text)]
                        crawl_pages = int(src.get("crawl_pages", 1))
                        if crawl_pages > 1:
                            extra_pages = await self._collect_extra_html_pages(
                                client=client,
                                req_headers=req_headers,
                                verify_ssl=verify_ssl,
                                base_url=url,
                                root_html=resp.text,
                                crawl_pages=crawl_pages,
                            )
                            html_pages.extend(extra_pages)
                        items = self._parse_html_items(html_pages, url, src, max_items_per_source)
                    else:
                        items = self._parse_json_items(resp.text, src, max_items_per_source)

                    source_name = src.get("name", country or "Public Portal")
                    type_hint = src.get("type_hint", "infrastructure")
                    for item in items:
                        title = (item.get("title") or "").strip()
                        if not title:
                            continue
                        link = (item.get("url") or item.get("link") or url).strip()
                        description = (item.get("description") or "").strip()
                        region = (item.get("region") or src.get("region") or "").strip()
                        phase = (item.get("phase") or src.get("phase") or default_phase).strip() or default_phase

                        text_for_type = f"{title} {description}"
                        project_type = _guess_type(text_for_type, fallback=type_hint)

                        budget = None
                        budget_raw = item.get("budget_usd")
                        if budget_raw is not None:
                            try:
                                budget = Decimal(str(budget_raw))
                            except Exception:
                                budget = None

                        updated_at = item.get("updated_at")
                        asset = ProjectAsset(
                            title=title,
                            country=country,
                            region=region,
                            type=project_type,
                            phase=phase,
                            budget_usd=budget,
                            source=f"Public Portal - {source_name}",
                            source_url=link,
                            raw={
                                "source_type": "public",
                                "country_code": country_code,
                                "description": description,
                                "updated_at": updated_at,
                                "portal": source_name,
                                "payload": item,
                            },
                            confidence=Decimal("0.72"),
                        )
                        assets.append(asset)
                except Exception as exc:
                    self.logger.warning("Public portal fetch failed (%s): %s", src.get("name", "unknown"), exc)

        self.logger.info("Fetched %d assets from public portals", len(assets))
        return assets

    async def _collect_extra_html_pages(
        self,
        client: httpx.AsyncClient,
        req_headers: dict,
        verify_ssl: bool,
        base_url: str,
        root_html: str,
        crawl_pages: int,
    ) -> list[tuple[str, str]]:
        base = urlsplit(base_url)
        host = base.netloc
        candidates: list[str] = []
        for href in re.findall(r"<a[^>]+href=[\"']([^\"']+)[\"']", root_html, flags=re.I):
            href = href.strip()
            if not href:
                continue
            if href.startswith("/"):
                href = f"{base.scheme}://{host}{href}"
            elif not href.startswith("http://") and not href.startswith("https://"):
                continue
            if urlsplit(href).netloc != host:
                continue
            low = href.lower()
            if any(k in low for k in ("page=", "paged=", "/page/", "appel", "offre", "tender", "marche", "procurement")):
                if href not in candidates:
                    candidates.append(href)
            if len(candidates) >= max(0, crawl_pages - 1):
                break

        pages: list[tuple[str, str]] = []
        for url in candidates[: max(0, crawl_pages - 1)]:
            try:
                if verify_ssl:
                    r = await client.get(url, headers=req_headers)
                else:
                    async with httpx.AsyncClient(timeout=20, follow_redirects=True, verify=False) as insecure_client:
                        r = await insecure_client.get(url, headers=req_headers)
                if r.status_code == 200 and r.text:
                    pages.append((url, r.text))
            except Exception:
                continue
        return pages

    def _parse_rss_items(self, xml_text: str, max_items: int) -> list[dict]:
        try:
            root = ET.fromstring(xml_text)
        except Exception:
            return []

        items = []
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
            items.append(
                {
                    "title": title,
                    "url": link,
                    "description": description,
                    "updated_at": updated.isoformat() if updated else "",
                }
            )
        return items

    def _parse_json_items(self, text: str, src: dict, max_items: int) -> list[dict]:
        try:
            data = json.loads(text)
        except Exception:
            return []

        path = src.get("items_path", "items")
        title_field = src.get("title_field", "title")
        link_field = src.get("link_field", "url")
        region_field = src.get("region_field", "region")
        phase_field = src.get("phase_field", "phase")
        date_field = src.get("date_field", "updated_at")
        budget_field = src.get("budget_field", "budget_usd")
        description_field = src.get("description_field", "description")

        items = data
        for part in path.split("."):
            if isinstance(items, dict):
                items = items.get(part, [])
            else:
                items = []
                break
        if not isinstance(items, list):
            return []

        out = []
        for obj in items[:max_items]:
            if not isinstance(obj, dict):
                continue
            out.append(
                {
                    "title": obj.get(title_field, ""),
                    "url": obj.get(link_field, ""),
                    "region": obj.get(region_field, ""),
                    "phase": obj.get(phase_field, ""),
                    "updated_at": obj.get(date_field, ""),
                    "budget_usd": obj.get(budget_field),
                    "description": obj.get(description_field, ""),
                    "raw": obj,
                }
            )
        return out

    def _parse_html_items(self, html_pages: list[tuple[str, str]], base_url: str, src: dict, max_items: int) -> list[dict]:
        include_patterns = [p.lower() for p in src.get("include_patterns", [
            "appel d'offres", "appel d’offres", "tender", "procurement", "marche", "marché",
            "btp", "batiment", "bâtiment", "construction", "travaux publics", "civil works",
        ])]
        link_include_patterns = [p.lower() for p in src.get("link_include_patterns", include_patterns)]
        title_max_len = int(src.get("title_max_len", 200))

        rows: list[dict] = []
        seen: set[str] = set()
        for page_url, html in html_pages:
            root = urlsplit(page_url or base_url)
            for m in re.finditer(r"<a[^>]+href=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", html, flags=re.I | re.S):
                href = m.group(1).strip()
                raw_label = re.sub(r"<[^>]+>", " ", m.group(2))
                label = re.sub(r"\s+", " ", unescape(raw_label)).strip()
                if not href or not label:
                    continue
                if len(label) > title_max_len:
                    continue

                low = label.lower()
                if include_patterns and not any(p in low for p in include_patterns):
                    href_low = href.lower()
                    if not any(p in href_low for p in link_include_patterns):
                        continue

                if href.startswith("/"):
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
            if len(rows) >= max_items:
                break
        return rows
