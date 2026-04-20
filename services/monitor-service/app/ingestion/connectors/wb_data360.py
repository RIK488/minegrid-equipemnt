"""World Bank Data360 API connector.

Fetches project/indicator metadata from the Data360 catalog.
Config:
  dataset_ids: list of dataset IDs to ingest
  base_url: API base (default: https://datacatalog.worldbank.org/api/3/action)
  country_filter: list of ISO2 codes to keep (optional)
"""
from __future__ import annotations
from decimal import Decimal
import httpx
from app.ingestion.base import BaseConnector
from app.ingestion.asset import ProjectAsset


class WBData360Connector(BaseConnector):
    name = "wb_data360"

    async def fetch(self) -> list[ProjectAsset]:
        base_url = self.config.get(
            "base_url", "https://datacatalog.worldbank.org/api/3/action"
        )
        dataset_ids: list[str] = self.config.get("dataset_ids", [])
        country_filter: set[str] | None = None
        if self.config.get("country_filter"):
            country_filter = {c.upper() for c in self.config["country_filter"]}

        assets: list[ProjectAsset] = []

        async with httpx.AsyncClient(timeout=30) as client:
            for ds_id in dataset_ids:
                try:
                    resp = await client.get(f"{base_url}/package_show", params={"id": ds_id})
                    resp.raise_for_status()
                    data = resp.json()
                    pkg = data.get("result", {})

                    country = self._extract_country(pkg)
                    if country_filter and country.upper() not in country_filter:
                        continue

                    asset = ProjectAsset(
                        title=pkg.get("title", pkg.get("name", ds_id)),
                        country=country,
                        region=self._extract_tag(pkg, "region"),
                        type=self._guess_type(pkg),
                        phase="study",
                        source="World Bank Data360",
                        source_url=f"https://datacatalog.worldbank.org/dataset/{ds_id}",
                        raw=pkg,
                        confidence=Decimal("0.4"),
                    )
                    assets.append(asset)

                except httpx.HTTPStatusError as exc:
                    self.logger.warning("WB API error for %s: %s", ds_id, exc)
                except Exception as exc:
                    self.logger.warning("WB fetch error for %s: %s", ds_id, exc)

        self.logger.info("Fetched %d assets from World Bank Data360", len(assets))
        return assets

    @staticmethod
    def _extract_country(pkg: dict) -> str:
        for group in pkg.get("groups", []):
            title = group.get("title", "")
            if len(title) <= 3:
                return title.upper()
            return title
        return ""

    @staticmethod
    def _extract_tag(pkg: dict, prefix: str) -> str:
        for tag in pkg.get("tags", []):
            name = tag.get("name", "")
            if name.lower().startswith(prefix):
                return name
        return ""

    @staticmethod
    def _guess_type(pkg: dict) -> str:
        title = (pkg.get("title", "") + " " + pkg.get("notes", "")).lower()
        mapping = {
            "mine": "mine", "mining": "mine",
            "road": "road", "highway": "road", "route": "road",
            "port": "port", "harbour": "port",
            "rail": "rail", "railway": "rail",
            "dam": "dam", "hydro": "dam",
            "energy": "energy", "power": "energy", "solar": "energy",
            "industrial": "industrial_zone", "zone": "industrial_zone",
        }
        for keyword, project_type in mapping.items():
            if keyword in title:
                return project_type
        return "infrastructure"
