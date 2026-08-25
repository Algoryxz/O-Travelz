"""
Geospatial geocoding and confidence validation pipeline for Odisha transit stops.

Rules:
- Never fabricate coordinates.
- Context queries: STOP NAME + LOCALITY + CITY + DISTRICT + Odisha + India.
- Confidence tiers:
    HIGH: Exact/strong match within city bounding box with locality alignment.
    MEDIUM: City matched, but minor naming ambiguity.
    LOW: Generic name or distance mismatch -> marked 'ambiguous'.
    UNRESOLVED: Geocoder returned no reliable results.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Callable

logger = logging.getLogger(__name__)

# Bounding boxes for Odisha transit regions (min_lat, min_lon, max_lat, max_lon)
CITY_BOUNDING_BOXES: dict[str, tuple[float, float, float, float]] = {
    "Bhubaneswar": (20.10, 85.60, 20.45, 86.00),
    "Cuttack": (20.35, 85.70, 20.60, 86.05),
    "Puri": (19.65, 85.65, 19.95, 86.00),
    "Rourkela": (22.10, 84.65, 22.40, 85.00),
    "Sambalpur": (21.35, 83.80, 21.60, 84.10),
    "Jharsuguda": (21.75, 83.90, 21.95, 84.15),
    "Berhampur": (19.20, 84.65, 19.45, 84.90),
    "Brahmapur": (19.20, 84.65, 19.45, 84.90),
    "Keonjhar": (21.50, 85.45, 21.75, 85.75),
}

ODISHA_STATE_BOUNDS: tuple[float, float, float, float] = (17.80, 81.35, 22.60, 87.50)

GENERIC_TERMS = frozenset({
    "SQUARE", "CHHAK", "CHOWK", "CHAKA", "MARKET", "HOSPITAL",
    "COLLEGE", "TEMPLE", "BUS", "STOP", "STAND", "NAGAR",
    "GATE", "ROAD", "VILLAGE", "STATION", "CAMPUS", "STN", "SQ",
})


@dataclass(frozen=True)
class GeocodedResult:
    canonical_name: str
    city: str | None
    latitude: float | None
    longitude: float | None
    coordinate_status: str  # "official", "geocoded", "ambiguous", "unresolved"
    coordinate_source: str | None
    confidence: str  # "high", "medium", "low", "none"
    geocoded_at: datetime | None
    display_name: str | None = None
    notes: str | None = None


def is_generic_stop_name(name: str) -> bool:
    """Check if name is too generic to geocode without specific locality."""
    words = [w.strip() for w in name.upper().split() if w.strip()]
    if not words:
        return True
    if len(words) == 1 and words[0] in GENERIC_TERMS:
        return True
    if len(words) == 2 and all(w in GENERIC_TERMS for w in words):
        return True
    return False


def build_geocoding_query(stop_name: str, locality: str | None, city: str | None, district: str | None) -> str:
    """Construct a context-rich query for Nominatim geocoding."""
    parts = [stop_name]
    if locality and locality.upper() not in stop_name.upper():
        parts.append(locality)
    if city and city.upper() not in stop_name.upper():
        parts.append(city)
    if district and (not city or district.lower() != city.lower()):
        parts.append(district)
    parts.append("Odisha")
    parts.append("India")
    return ", ".join(parts)


def evaluate_geocoding_confidence(
    lat: float,
    lon: float,
    city: str | None,
    stop_name: str,
) -> tuple[str, str]:
    """
    Validate coordinates against bounding boxes.
    Returns (coordinate_status, confidence).
    """
    # 1. State bounding box check
    min_lat, min_lon, max_lat, max_lon = ODISHA_STATE_BOUNDS
    if not (min_lat <= lat <= max_lat and min_lon <= lon <= max_lon):
        return "unresolved", "none"

    # 2. City bounding box check
    if city and city in CITY_BOUNDING_BOXES:
        c_min_lat, c_min_lon, c_max_lat, c_max_lon = CITY_BOUNDING_BOXES[city]
        if c_min_lat <= lat <= c_max_lat and c_min_lon <= lon <= c_max_lon:
            if is_generic_stop_name(stop_name):
                return "ambiguous", "low"
            return "geocoded", "high"
        else:
            # Matched outside the expected city
            return "ambiguous", "low"

    # Default within Odisha but city bounds not strictly matched
    return "geocoded", "medium"
