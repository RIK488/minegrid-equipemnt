"""Base connector class — all connectors inherit from this."""
from __future__ import annotations
import logging
from abc import ABC, abstractmethod
from app.ingestion.asset import ProjectAsset


class BaseConnector(ABC):
    name: str = "base"

    def __init__(self, config: dict | None = None):
        self.config = config or {}
        self.logger = logging.getLogger(f"monitor.connector.{self.name}")

    @abstractmethod
    async def fetch(self) -> list[ProjectAsset]:
        """Fetch and normalize data from the source. Returns ProjectAsset list."""
        ...
