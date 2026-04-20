import hashlib
import re
import unicodedata


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


def _normalize_url(url: str) -> str:
    if not url:
        return ""
    cleaned = url.strip().lower()
    cleaned = re.sub(r"^https?://", "", cleaned)
    cleaned = cleaned.rstrip("/")
    return cleaned


def compute_fingerprint(
    title: str,
    country: str,
    source: str,
    source_url: str,
    region: str = "",
    phase: str = "",
) -> str:
    normalized = "|".join([
        normalize_text(title or ""),
        normalize_text(country or ""),
        normalize_text(region or ""),
        normalize_text(phase or ""),
        normalize_text(source or ""),
        _normalize_url(source_url or ""),
    ])
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()
