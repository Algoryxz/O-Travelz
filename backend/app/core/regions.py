"""Authoritative Odisha district taxonomy and deterministic travel region crosswalk."""
from __future__ import annotations

# The 30 official administrative districts of Odisha
ODISHA_DISTRICTS: frozenset[str] = frozenset(
    {
        "Angul",
        "Balangir",
        "Balasore",
        "Bargarh",
        "Bhadrak",
        "Boudh",
        "Cuttack",
        "Deogarh",
        "Dhenkanal",
        "Gajapati",
        "Ganjam",
        "Jagatsinghpur",
        "Jajpur",
        "Jharsuguda",
        "Kalahandi",
        "Kandhamal",
        "Kendrapara",
        "Keonjhar",
        "Khordha",
        "Koraput",
        "Malkangiri",
        "Mayurbhanj",
        "Nabarangpur",
        "Nayagarh",
        "Nuapada",
        "Puri",
        "Rayagada",
        "Sambalpur",
        "Subarnapur",
        "Sundargarh",
    }
)

# Canonical 10 travel region labels
CANONICAL_REGIONS: tuple[str, ...] = (
    "Bhubaneswar & Central",
    "Puri & Coastal",
    "Konark & Marine",
    "Cuttack & Mahanadi",
    "Chilika & Southern Coast",
    "Kandhamal & Southern Hills",
    "Sambalpur & Western Odisha",
    "Rourkela & Sundargarh",
    "Northern Odisha & Wildlife",
    "Koraput & Tribal Highlands",
)

# Base District -> Travel Region Mapping
DISTRICT_TO_REGION_MAP: dict[str, str] = {
    # Central
    "Khordha": "Bhubaneswar & Central",
    "Nayagarh": "Bhubaneswar & Central",
    # Coastal & Marine
    "Puri": "Puri & Coastal",
    # Mahanadi delta
    "Cuttack": "Cuttack & Mahanadi",
    "Jagatsinghpur": "Cuttack & Mahanadi",
    "Dhenkanal": "Cuttack & Mahanadi",
    "Angul": "Cuttack & Mahanadi",
    "Jajpur": "Cuttack & Mahanadi",
    # Southern Coast & Lagoons
    "Ganjam": "Chilika & Southern Coast",
    "Gajapati": "Chilika & Southern Coast",
    # Southern Hills
    "Kandhamal": "Kandhamal & Southern Hills",
    "Boudh": "Kandhamal & Southern Hills",
    # Western Odisha
    "Sambalpur": "Sambalpur & Western Odisha",
    "Bargarh": "Sambalpur & Western Odisha",
    "Jharsuguda": "Sambalpur & Western Odisha",
    "Deogarh": "Sambalpur & Western Odisha",
    "Balangir": "Sambalpur & Western Odisha",
    "Subarnapur": "Sambalpur & Western Odisha",
    "Nuapada": "Sambalpur & Western Odisha",
    # Sundargarh
    "Sundargarh": "Rourkela & Sundargarh",
    # Northern & Wildlife
    "Mayurbhanj": "Northern Odisha & Wildlife",
    "Balasore": "Northern Odisha & Wildlife",
    "Bhadrak": "Northern Odisha & Wildlife",
    "Kendrapara": "Northern Odisha & Wildlife",
    "Keonjhar": "Northern Odisha & Wildlife",
    # Tribal Highlands
    "Koraput": "Koraput & Tribal Highlands",
    "Rayagada": "Koraput & Tribal Highlands",
    "Nabarangpur": "Koraput & Tribal Highlands",
    "Malkangiri": "Koraput & Tribal Highlands",
    "Kalahandi": "Koraput & Tribal Highlands",
}

# Sub-zone place overrides for specific micro-destinations within multi-zone districts (Konark & Marine, Chilika)
PLACE_REGION_OVERRIDES: dict[str, str] = {
    # Konark Marine Corridor within Puri District
    "place_konark_001": "Konark & Marine",
    "place_konark_002": "Konark & Marine",
    "place_konark_003": "Konark & Marine",
    "place_konark_004": "Konark & Marine",
    "place_food_009": "Konark & Marine",
    # Chilika Wetland Corridor within Khordha & Puri Districts
    "place_chilika_001": "Chilika & Southern Coast",
    "place_chilika_002": "Chilika & Southern Coast",
    "place_chilika_003": "Chilika & Southern Coast",
}


def get_region_for_place(district: str | None, place_id: str | None = None) -> str:
    """Deterministically derive travel region from administrative district and place ID."""
    if place_id and place_id in PLACE_REGION_OVERRIDES:
        return PLACE_REGION_OVERRIDES[place_id]

    if not district:
        return "Bhubaneswar & Central"

    # Normalize district title case
    clean_district = district.strip().title()
    return DISTRICT_TO_REGION_MAP.get(clean_district, "Bhubaneswar & Central")


def validate_district(district: str | None) -> bool:
    """Check if district is a valid official Odisha administrative district."""
    if not district:
        return False
    return district.strip().title() in ODISHA_DISTRICTS
