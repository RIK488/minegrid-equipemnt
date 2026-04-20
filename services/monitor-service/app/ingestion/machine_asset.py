"""Normalized intermediate model for machine/equipment listings."""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any


@dataclass
class MachineAsset:
    name: str
    brand: str = ""
    model: str = ""
    category: str = ""
    year: int | None = None
    price: str = ""
    condition: str = "used"
    description: str = ""
    specifications: dict[str, Any] = field(default_factory=dict)
    images: list[str] = field(default_factory=list)
    source: str = ""
    source_url: str = ""
    source_id: str = ""
    country: str = ""
    region: str = ""
    raw: dict[str, Any] = field(default_factory=dict)

    def to_supabase_row(self, seller_id: str) -> dict[str, Any]:
        """Convert to a dict matching the Supabase `machines` table schema."""
        # L'app frontend utilise historiquement `photos` (pas `images`) pour afficher.
        # On écrit donc les deux colonnes pour rester compatible.
        photos = list(self.images) if isinstance(self.images, list) else []
        return {
            "name": self.name,
            "brand": self.brand,
            "model": self.model,
            "category": self.category,
            "year": self.year,
            "price": self.price,
            "condition": self.condition,
            "description": self.description,
            "specifications": self.specifications,
            "images": photos,
            "photos": photos,
            "sellerid": seller_id,
            # Colonnes de compatibilité (certaines parties du code requêtent seller_id/user_id/owner_id)
            "seller_id": seller_id,
            "user_id": seller_id,
            "owner_id": seller_id,
            "source": self.source,
            "source_url": self.source_url,
            "source_id": self.source_id,
            "country": self.country,
            "region": self.region,
        }
