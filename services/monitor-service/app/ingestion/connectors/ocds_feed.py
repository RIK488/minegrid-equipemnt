"""OCDS (Open Contracting Data Standard) generic feed connector.

Config:
  feed_url: URL to OCDS releases JSON endpoint
  max_pages: max pages to fetch (default: 5)
  country_default: fallback country if not in release
"""
from __future__ import annotations
from decimal import Decimal
import httpx
from app.ingestion.base import BaseConnector
from app.ingestion.asset import ProjectAsset


class OCDSConnector(BaseConnector):
    name = "ocds_feed"

    async def fetch(self) -> list[ProjectAsset]:
        feed_url = self.config.get("feed_url", "")
        if not feed_url:
            self.logger.warning("No feed_url configured for OCDS connector")
            return []

        max_pages = self.config.get("max_pages", 5)
        country_default = self.config.get("country_default", "")

        assets: list[ProjectAsset] = []
        url: str | None = feed_url

        async with httpx.AsyncClient(timeout=30) as client:
            for page in range(max_pages):
                if not url:
                    break
                try:
                    resp = await client.get(url)
                    resp.raise_for_status()
                    data = resp.json()
                except Exception as exc:
                    self.logger.warning("OCDS fetch error page %d: %s", page, exc)
                    break

                releases = data.get("releases", [])
                for release in releases:
                    asset = self._parse_release(release, country_default)
                    if asset:
                        assets.append(asset)

                links = data.get("links", {})
                url = links.get("next")

        self.logger.info("Fetched %d assets from OCDS feed", len(assets))
        return assets

    def _parse_release(self, release: dict, country_default: str) -> ProjectAsset | None:
        tender = release.get("tender", {})
        title = tender.get("title") or release.get("tag", [""])[0]
        if not title:
            return None

        buyer = release.get("buyer", {})
        country = ""
        address = buyer.get("address", {})
        if address.get("countryName"):
            country = address["countryName"]
        elif country_default:
            country = country_default

        budget_val = None
        value = tender.get("value", {})
        if value.get("amount"):
            try:
                budget_val = Decimal(str(value["amount"]))
                if value.get("currency", "USD") != "USD":
                    budget_val = None
            except Exception:
                pass

        phase = "tender"
        status = tender.get("status", "")
        if status == "complete":
            phase = "construction"
        elif status == "cancelled":
            phase = "study"

        return ProjectAsset(
            title=title,
            country=country,
            type=self._guess_type(title),
            phase=phase,
            budget_usd=budget_val,
            source="OCDS",
            source_url=release.get("id", ""),
            raw=release,
            confidence=Decimal("0.6"),
        )

    @staticmethod
    def _guess_type(title: str) -> str:
        t = title.lower()
        mapping = {
            "mine": "mine", "mining": "mine",
            "road": "road", "highway": "road", "route": "road",
            "port": "port", "rail": "rail",
            "dam": "dam", "hydro": "dam", "water": "dam",
            "energy": "energy", "power": "energy", "solar": "energy",
        }
        for keyword, project_type in mapping.items():
            if keyword in t:
                return project_type
        return "infrastructure"
