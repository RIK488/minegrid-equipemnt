"""Helpers pour remonter les URLs d'images vers leur version HD.

Ces fonctions sont purement heuristiques (aucun appel réseau). Elles
reconnaissent les conventions de plusieurs sources connues :
  - Mascus        (img.mascus.com / img.mascus.fr)
  - Ritchie Bros  (*.cloudfront.net/image/product/<size>/...)
  - Le Bon Coin   (img.leboncoin.fr/...?rule=ad-<size>)

L'objectif est que les images stockées en base (`public.machines.images`)
soient systématiquement les versions large/fullsize, pour obtenir le même
niveau de qualité que sur la source d'origine.
"""

from __future__ import annotations

import re

__all__ = [
    "upgrade_mascus_image_url",
    "upgrade_ritchie_bros_image_url",
    "upgrade_leboncoin_image_url",
    "upgrade_generic_image_url",
    "upgrade_image_url",
]


def upgrade_mascus_image_url(url: str) -> str:
    """Mascus : /thumbprofile/, /mediaprofile/, /imageservice/.../<WxH>/... -> HD."""
    if not url or "img.mascus" not in url.lower():
        return url
    out = url
    out = re.sub(r"/thumbprofile/", "/fullsize/", out, flags=re.I)
    out = re.sub(r"/thumbprofile_\d+x\d+/", "/thumbprofile_1920x1440/", out, flags=re.I)
    out = re.sub(r"/mediaprofile/", "/fullsize/", out, flags=re.I)
    out = re.sub(
        r"/imageservice/([^/]+)/\d+x\d+/",
        r"/imageservice/\1/1920x1440/",
        out,
        flags=re.I,
    )
    return out


def upgrade_ritchie_bros_image_url(url: str) -> str:
    """Ritchie Bros / RBAuction (CloudFront) : /medium/ -> /large/."""
    if not url or "cloudfront.net/image/product/" not in url.lower():
        return url
    return re.sub(
        r"/image/product/(small|medium|thumb|thumbnail)/",
        "/image/product/large/",
        url,
        flags=re.I,
    )


def upgrade_leboncoin_image_url(url: str) -> str:
    """Le Bon Coin : ?rule=ad-small|ad-image|ad-listing -> ?rule=ad-large."""
    if not url or "img.leboncoin." not in url.lower():
        return url
    out = url
    out = re.sub(
        r"([?&])rule=(ad-small|ad-thumb|ad-image|ad-listing)\b",
        r"\1rule=ad-large",
        out,
        flags=re.I,
    )
    out = re.sub(
        r"([?&])rule=(classified-thumb|classified-small)\b",
        r"\1rule=classified-large",
        out,
        flags=re.I,
    )
    return out


def upgrade_generic_image_url(url: str) -> str:
    """Fallback pour conventions /thumb/, _small., _400x300. non spécifiques."""
    if not url:
        return url
    out = url
    out = re.sub(r"/(thumb|thumbnail|small|sm|xs|icon)/", "/large/", out, flags=re.I)
    out = re.sub(r"[-_](thumb|thumbnail|small|sm|xs|icon)\.", ".", out, flags=re.I)

    def _boost_dim(m: re.Match) -> str:
        sep = m.group(1)
        w = int(m.group(2))
        ext = m.group(4)
        end = m.group(5)
        if w >= 1200:
            return m.group(0)
        return f"{sep}1920x1440{ext}{end}"

    out = re.sub(
        r"([_-])(\d{2,4})x(\d{2,4})(\.[a-z]{3,4})(\?|$)",
        _boost_dim,
        out,
        flags=re.I,
    )
    return out


def upgrade_image_url(url: str) -> str:
    """Pipeline complet : source-specific puis fallback générique."""
    url = upgrade_mascus_image_url(url)
    url = upgrade_ritchie_bros_image_url(url)
    url = upgrade_leboncoin_image_url(url)
    return upgrade_generic_image_url(url)
