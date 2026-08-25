"""Reverse Geocoding Service for O-Travelz with caching and graceful fallbacks."""
from __future__ import annotations

import logging
import time
import urllib.request
import urllib.parse
import json
import re
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# In-memory TTL cache for coordinates -> locality
_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour cache per coordinate grid


def _cache_key(lat: float, lon: float) -> str:
    # Round to ~100m grid for efficient caching
    return f"{round(lat, 3)}_{round(lon, 3)}"


def _clean_administrative_name(name: Optional[str]) -> Optional[str]:
    """Strip verbose administrative suffixes from city/locality names."""
    if not name or not isinstance(name, str):
        return None
    cleaned = name.strip()
    for suffix in [
        " Municipal Corporation",
        " Municipal Council",
        " Municipality",
        " Notified Area Council",
        " NAC",
        " Block",
        " Tahasil",
        " Tehsil",
    ]:
        if cleaned.lower().endswith(suffix.lower()):
            cleaned = cleaned[: -len(suffix)].strip()
    return cleaned or None


def _is_administrative_ward(name: Optional[str]) -> bool:
    """Detect non-human-friendly ward designations like 'Ward 41'."""
    if not name:
        return True
    return bool(re.match(r"^ward\s+\d+", name.strip(), re.IGNORECASE))


def reverse_geocode_coordinates(lat: float, lon: float) -> Dict[str, Any]:
    """
    Reverse geocode latitude/longitude to human-readable Odisha locality.
    Uses cached lookups and OpenStreetMap Nominatim with strict headers and error shielding.
    Strictly follows hierarchy: neighbourhood > suburb > village > locality > town > city > district > state.
    """
    key = _cache_key(lat, lon)
    now = time.time()

    if key in _CACHE:
        entry = _CACHE[key]
        if now - entry["timestamp"] < CACHE_TTL_SECONDS:
            return entry["data"]

    # Default fallback based on Odisha bounding box / proximity
    default_city = "Bhubaneswar"
    if 20.20 <= lat <= 20.38 and 85.75 <= lon <= 85.90:
        default_city = "Bhubaneswar"
    elif 19.75 <= lat <= 19.88 and 85.78 <= lon <= 85.88:
        default_city = "Puri"
    elif 19.85 <= lat <= 19.92 and 86.05 <= lon <= 86.15:
        default_city = "Konark"
    elif 20.42 <= lat <= 20.52 and 85.82 <= lon <= 85.95:
        default_city = "Cuttack"
    elif 21.40 <= lat <= 21.55 and 83.90 <= lon <= 84.05:
        default_city = "Sambalpur"
    elif 19.25 <= lat <= 19.38 and 84.75 <= lon <= 84.88:
        default_city = "Berhampur"
    elif 22.18 <= lat <= 22.30 and 84.80 <= lon <= 84.95:
        default_city = "Rourkela"

    default_locality = f"{default_city} · Odisha"

    result_data = {
        "locality": default_locality,
        "neighborhood": None,
        "city": default_city,
        "district": None,
        "state": "Odisha",
        "country": "India",
        "lat": lat,
        "lon": lon,
        "is_exact": False,
    }

    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}&zoom=16&addressdetails=1"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "OTravelz-Travel-Platform/1.0 (travel@otravelz.in)",
                "Accept-Language": "en,or",
            },
        )
        with urllib.request.urlopen(req, timeout=3.5) as response:
            if response.status == 200:
                payload = json.loads(response.read().decode("utf-8"))
                address = payload.get("address", {})

                raw_neighborhood = (
                    address.get("neighbourhood")
                    or address.get("suburb")
                    or address.get("village")
                    or address.get("hamlet")
                    or address.get("residential")
                    or address.get("quarter")
                )
                raw_city = (
                    address.get("city")
                    or address.get("town")
                    or address.get("municipality")
                    or address.get("village")
                    or address.get("county")
                )
                district = _clean_administrative_name(address.get("state_district") or address.get("district"))
                state = address.get("state", "Odisha")

                clean_city = _clean_administrative_name(raw_city)
                clean_neighborhood = _clean_administrative_name(raw_neighborhood)

                # Filter out pure ward numbers
                if _is_administrative_ward(clean_neighborhood):
                    # Check if suburb exists
                    suburb = _clean_administrative_name(address.get("suburb") or address.get("village"))
                    if suburb and not _is_administrative_ward(suburb):
                        clean_neighborhood = suburb
                    else:
                        clean_neighborhood = None

                # Build clean human-readable locality string
                if clean_neighborhood and clean_city and clean_neighborhood.lower() != clean_city.lower():
                    display_locality = f"{clean_neighborhood} · {clean_city}"
                elif clean_neighborhood and district and clean_neighborhood.lower() != district.lower():
                    display_locality = f"{clean_neighborhood} · {district}"
                elif clean_neighborhood:
                    display_locality = f"{clean_neighborhood} · {state}"
                elif clean_city:
                    display_locality = f"{clean_city} · {state}"
                elif district:
                    display_locality = f"{district} · {state}"
                else:
                    display_locality = default_locality

                result_data = {
                    "locality": display_locality,
                    "neighborhood": clean_neighborhood,
                    "city": clean_city or district or default_locality,
                    "district": district,
                    "state": state,
                    "country": address.get("country", "India"),
                    "lat": lat,
                    "lon": lon,
                    "is_exact": True,
                }
    except Exception as exc:
        logger.debug("Reverse geocode provider lookup fell back to approximate locality: %s", exc)

    _CACHE[key] = {
        "timestamp": now,
        "data": result_data,
    }
    return result_data
