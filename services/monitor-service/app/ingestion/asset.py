"""Normalized intermediate model for all connectors."""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal
from typing import Any


@dataclass
class ProjectAsset:
    title: str
    country: str = ""
    region: str = ""
    type: str = ""              # mine, road, port, rail, dam, industrial_zone, energy
    phase: str = ""             # study, financing, tender, construction, ops
    lat: float | None = None
    lon: float | None = None
    budget_usd: Decimal | None = None
    start_date: date | None = None
    end_date: date | None = None
    source: str = ""
    source_url: str = ""
    raw: dict[str, Any] = field(default_factory=dict)
    confidence: Decimal = Decimal("0.5")

    def to_dict(self) -> dict[str, Any]:
        return {
            "title": self.title,
            "country": self.country,
            "region": self.region,
            "type": self.type,
            "phase": self.phase,
            "lat": self.lat,
            "lon": self.lon,
            "budget_usd": self.budget_usd,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "source": self.source,
            "source_url": self.source_url,
            "raw": self.raw,
            "confidence": self.confidence,
        }
