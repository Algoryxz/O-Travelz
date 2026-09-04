"""
Validation Fixture Suites for O-TRAVELZ V4.

FIXTURE SET A:
Synthetic deterministic fixtures for positive and negative unit test validation.
Guarantees tests never become brittle when canonical datasets evolve.

FIXTURE SET B:
Repository-backed regression fixtures inspected directly from verified canonical datasets.
"""
from typing import Any, Dict, List

# =============================================================================
# FIXTURE SET A: SYNTHETIC DETERMINISTIC FIXTURES
# =============================================================================

SYNTHETIC_SACRED_PLACE: Dict[str, Any] = {
    "id": "syn_sacred_001",
    "name": "Synthetic Jagannath Shrine",
    "category": "temple",
    "lat": 19.8135,
    "lon": 85.8312,
    "district": "Puri",
    "source": "official_archive_record",
    "verification_status": "VERIFIED",
    "verified_at": "2026-08-01T00:00:00Z",
    "localized_names": {
        "en": "Synthetic Jagannath Shrine",
        "or": "ସିନ୍ଥେଟିକ ଶ୍ରୀକ୍ଷେତ୍ର",
        "hi": "सिंथेटिक जगन्नाथ धाम",
    },
}

SYNTHETIC_HERITAGE_PLACE: Dict[str, Any] = {
    "id": "syn_heritage_001",
    "name": "Synthetic Kalinga Fort",
    "category": "monument",
    "lat": 20.4851,
    "lon": 85.8674,
    "district": "Cuttack",
    "source": "asi_gazetteer_vol4",
    "verification_status": "VERIFIED_OFFICIAL",
    "verified_at": "2026-08-01T00:00:00Z",
    "localized_names": {
        "en": "Synthetic Kalinga Fort",
        "or": "ସିନ୍ଥେଟିକ କଳିଙ୍ଗ ଦୁର୍ଗ",
        "hi": "सिंथेटिक कलिंग किला",
    },
}

SYNTHETIC_NATURAL_PLACE: Dict[str, Any] = {
    "id": "syn_natural_001",
    "name": "Synthetic Chilika Sanctuary",
    "category": "wildlife",
    "lat": 19.6890,
    "lon": 85.3120,
    "district": "Puri",
    "source": "wildlife_wing_forest_dept",
    "verification_status": "VERIFIED",
    "verified_at": "2026-08-01T00:00:00Z",
    "localized_names": {
        "en": "Synthetic Chilika Sanctuary",
        "or": "ସିନ୍ଥେଟିକ ଚିଲିକା ଅଭୟାରଣ୍ୟ",
    },  # Missing Hindi: triggers advisory LOC_HINDI_ABSENT warning
}

SYNTHETIC_FOOD_PLACE: Dict[str, Any] = {
    "id": "syn_food_001",
    "name": "Synthetic Pahala Sweet Corridor",
    "category": "market",
    "lat": 20.3541,
    "lon": 85.8821,
    "district": "Khurda",
    "source": "odisha_food_research",
    "verification_status": "VERIFIED",
    "verified_at": "2026-08-01T00:00:00Z",
    "cuisine": "Odia Sweets",
    "highway_corridor": "NH-16",
    "localized_names": {
        "en": "Synthetic Pahala Sweet Corridor",
        "or": "ସିନ୍ଥେଟିକ ପହଳା ମିଷ୍ଟାନ୍ନ ବଜାର",
    },
}

SYNTHETIC_HOSPITAL_FACILITY: Dict[str, Any] = {
    "id": "syn_facility_001",
    "name": "Synthetic Regional Medical Centre",
    "category": "healthcare",
    "lat": 20.2450,
    "lon": 85.7820,
    "district": "Khurda",
    "source": "state_health_registry",
    "verification_status": "VERIFIED",
    "verified_at": "2026-08-01T00:00:00Z",
    "emergency_phone": "+91-674-2300000",
}

SYNTHETIC_TRANSIT_HUB: Dict[str, Any] = {
    "id": "syn_hub_001",
    "name": "Synthetic Master Canteen Bus Terminal",
    "category": "transit_hub",
    "lat": 20.2680,
    "lon": 85.8390,
    "district": "Khurda",
    "source": "crut_official_gazette",
    "verification_status": "VERIFIED_OFFICIAL",
    "verified_at": "2026-08-01T00:00:00Z",
}

SYNTHETIC_EXTERNAL_STATION: Dict[str, Any] = {
    "id": "syn_ext_howrah_001",
    "name": "Howrah Junction Terminal",
    "entity_type": "railway_connection",
    "lat": 22.5830,
    "lon": 88.3426,
    "district": "Howrah",
    "region": "external",
    "is_external": True,
    "source": "indian_railways_irctc",
    "verification_status": "VERIFIED",
    # Coordinates are in West Bengal; domain policy permits external transport node outside Odisha.
}

SYNTHETIC_UNRESOLVED_STOP: Dict[str, Any] = {
    "stop_id": "syn_unresolved_stop_001",
    "canonical_name": "Synthetic Badagada Rural Junction",
    "lat": None,
    "lon": None,
    "coordinate_status": "UNRESOLVED",
    "provider": "CRUT Mo Bus",
    "source": "crut_route_schedule_table",
    # Enforces the rule: unresolved coordinates MUST be null.
}

SYNTHETIC_OVERNIGHT_SCHEDULE: Dict[str, Any] = {
    "schedule_id": "syn_sched_overnight_001",
    "route_id": "syn_route_001",
    "departure_times": ["23:40", "00:15", "00:50"],
    # Legitimate overnight service-day progression crossing midnight.
}

# Negative Defect Fixtures (for validating each issue code triggers on exact conditions)
SYNTHETIC_DEFECT_FIXTURES: List[Dict[str, Any]] = [
    {
        "defect": "ID_MISSING_IDENTIFIER",
        "record": {"name": "No ID Entity", "category": "temple"},
        "entity_type": "place",
    },
    {
        "defect": "LOC_MISSING_CANONICAL_EN",
        "record": {"id": "def_no_name", "category": "temple"},
        "entity_type": "place",
    },
    {
        "defect": "LOC_EMPTY_STRING",
        "record": {
            "id": "def_empty_loc",
            "name": "Valid Name",
            "localized_names": {"en": "Valid Name", "or": "   "},
        },
        "entity_type": "place",
    },
    {
        "defect": "PRV_MISSING_SOURCE",
        "record": {
            "id": "def_no_src",
            "name": "Valid Name",
            "source": "REQUIRED",
        },
        "entity_type": "place",
    },
    {
        "defect": "GEO_OUT_OF_WGS84",
        "record": {
            "id": "def_bad_wgs84",
            "name": "Out of World",
            "lat": 120.5,
            "lon": 85.8,
            "source": "survey",
        },
        "entity_type": "place",
    },
    {
        "defect": "GEO_LAT_LON_SWAP",
        "record": {
            "id": "def_swapped_geo",
            "name": "Swapped Entity",
            "lat": 85.83,
            "lon": 20.29,
            "source": "survey",
        },
        "entity_type": "place",
    },
    {
        "defect": "GEO_UNRESOLVED_NON_NULL",
        "record": {
            "id": "def_unres_non_null",
            "name": "Unresolved with Coords",
            "coordinate_status": "UNRESOLVED",
            "lat": 20.29,
            "lon": 85.83,
            "source": "survey",
        },
        "entity_type": "stop",
    },
    {
        "defect": "GEO_OUT_OF_EXPECTED_REGION",
        "record": {
            "id": "def_out_of_odisha",
            "name": "Odisha Temple in Mumbai",
            "category": "temple",
            "lat": 18.92,
            "lon": 72.83,
            "district": "Puri",
            "source": "survey",
        },
        "entity_type": "place",
    },
    {
        "defect": "MED_INVALID_SHA256",
        "record": {
            "id": "def_bad_sha",
            "storage_key": "places/p1/img",
            "content_sha256": "not_a_valid_sha",
            "verification_status": "UNVERIFIED",
        },
        "entity_type": "media_asset",
    },
    {
        "defect": "MED_TECHNICAL_AS_PHOTO",
        "record": {
            "id": "def_vector_photo",
            "storage_key": "places/p1/vector.svg",
            "content_sha256": "0" * 64,
            "verification_status": "TECHNICAL_VECTOR",
            "is_photograph": True,
        },
        "entity_type": "media_asset",
    },
    {
        "defect": "TRN_LIVE_CLAIM_WITHOUT_REALTIME_SOURCE",
        "record": {
            "route_id": "def_live_no_source",
            "route_number": "100",
            "data_tier": "live",
            "provider": "CRUT Mo Bus",
        },
        "entity_type": "route",
    },
    {
        "defect": "TRN_SCHEDULE_NOT_SORTED",
        "record": {
            "schedule_id": "def_unsorted_sched",
            "route_id": "r100",
            "departure_times": ["10:30", "09:15"],
        },
        "entity_type": "schedule",
    },
]


# =============================================================================
# FIXTURE SET B: REPOSITORY-BACKED SAMPLES
# =============================================================================

REPO_SAMPLE_KONARK: Dict[str, Any] = {
    "id": "7b420000-0000-0000-0000-000000000002",
    "name": "Konark Sun Temple",
    "category": "monument",
    "district": "Puri",
    "lat": 19.8875,
    "lon": 86.094444,
    "source": "https://whc.unesco.org/en/list/246/",
    "verification_status": "VERIFIED_OFFICIAL",
}

REPO_SAMPLE_SERVICE_SCB: Dict[str, Any] = {
    "id": "svc_health_cuttack_001",
    "name": "SCB Medical College and Hospital",
    "category": "healthcare",
    "district": "Cuttack",
    "lat": 20.4735,
    "lon": 85.8828,
    "source": "Directorate of Medical Education & Training (DMET) Odisha",
    "verification_status": "VERIFIED",
}

REPO_SAMPLE_GEOCODED_STOP: Dict[str, Any] = {
    "stop_id": "stop_crut_101",
    "canonical_name": "Master Canteen Terminal",
    "lat": 20.2685,
    "lon": 85.8398,
    "coordinate_status": "VERIFIED_OFFICIAL",
    "coordinate_source": "CRUT Official GTFS / On-Ground Survey",
    "provider": "CRUT Mo Bus",
    "source": "CRUT Official Route Network",
}

REPO_SAMPLE_UNRESOLVED_STOP: Dict[str, Any] = {
    "stop_id": "stop_crut_unresolved_001",
    "canonical_name": "Agasti Nuagaon",
    "lat": None,
    "lon": None,
    "coordinate_status": "UNRESOLVED",
    "provider": "CRUT Mo Bus",
    "source": "CRUT Route Schedule Tables",
}