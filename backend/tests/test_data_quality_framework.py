"""Comprehensive tests for Phase 11 Step 3 Data Quality, Provenance & Validation Framework."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any

import pytest

from app.data.odisha_districts import (
    ODISHA_DISTRICTS,
    CANONICAL_REGIONS,
    DISTRICT_TO_REGION_MAP,
    validate_district,
)
from scripts.audit_data_quality import (
    DataQualityAuditor,
    AuditReport,
    ODISHA_LAT_MIN,
    ODISHA_LAT_MAX,
    ODISHA_LON_MIN,
    ODISHA_LON_MAX,
)
from scripts.import_places import (
    validate_input,
    ImportValidationError,
    load_places,
    load_categories,
    load_interests,
)

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data" / "places"


# --------------------------------------------------------------------------
# 1. Canonical District Registry Tests
# --------------------------------------------------------------------------

def test_canonical_district_list_contains_all_30_districts():
    """Verify that ODISHA_DISTRICTS contains exactly the 30 official districts."""
    assert len(ODISHA_DISTRICTS) == 30
    expected_30 = {
        "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
        "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur",
        "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar",
        "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
        "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
    }
    assert ODISHA_DISTRICTS == expected_30
    for district in expected_30:
        assert validate_district(district) is True
        assert validate_district(district.lower()) is True
        assert validate_district(district.upper()) is True
    assert validate_district("InvalidDistrict") is False
    assert validate_district("") is False
    assert validate_district(None) is False


def test_district_to_region_mapping_covers_all_30_districts():
    """Verify every district maps to a valid canonical travel region."""
    assert len(DISTRICT_TO_REGION_MAP) == 30
    for district, region in DISTRICT_TO_REGION_MAP.items():
        assert district in ODISHA_DISTRICTS
        assert region in CANONICAL_REGIONS


# --------------------------------------------------------------------------
# 2. Validation Rule Tests
# --------------------------------------------------------------------------

@pytest.fixture
def base_categories() -> list[dict[str, Any]]:
    return [
        {"id": "temple", "name": "temple", "description": "Temples"},
        {"id": "hospital", "name": "hospital", "description": "Hospitals"},
        {"id": "transit_hub", "name": "transit_hub", "description": "Transit Hubs"},
    ]


@pytest.fixture
def base_interests() -> list[dict[str, Any]]:
    return [
        {"id": "heritage", "name": "heritage", "description": "Heritage"},
        {"id": "spirituality", "name": "spirituality", "description": "Spirituality"},
    ]


def test_valid_place_passes_validation(base_categories, base_interests):
    """Verify a well-formed canonical place passes validation."""
    valid_place = [{
        "id": "place_test_001",
        "name": "Lingaraj Temple",
        "category": "temple",
        "lat": 20.2382,
        "lon": 85.8336,
        "district": "Khordha",
        "description": "Ancient 11th-century temple dedicated to Harihara.",
        "interests": ["heritage", "spirituality"],
        "source": "ASI & Odisha Tourism Directorate",
        "source_url": "https://odishatourism.gov.in",
        "verification_status": "VERIFIED",
    }]
    validated = validate_input(base_categories, valid_place, base_interests)
    assert len(validated.places) == 1
    assert validated.places[0]["name"] == "Lingaraj Temple"


def test_missing_name_fails(base_categories):
    """Verify missing or empty place name is rejected."""
    bad_place = [{
        "id": "place_test_002",
        "name": "   ",
        "category": "temple",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "source": "ASI",
    }]
    with pytest.raises(ImportValidationError, match="must be a non-empty string"):
        validate_input(base_categories, bad_place)



def test_duplicate_id_fails(base_categories):
    """Verify duplicate research_id fails validation."""
    dup_places = [
        {
            "id": "place_dup_001",
            "name": "Site One",
            "category": "temple",
            "lat": 20.29,
            "lon": 85.82,
            "district": "Khordha",
            "source": "ASI",
        },
        {
            "id": "place_dup_001",
            "name": "Site Two",
            "category": "temple",
            "lat": 20.30,
            "lon": 85.83,
            "district": "Khordha",
            "source": "ASI",
        },
    ]
    with pytest.raises(ImportValidationError, match="duplicates place identity"):
        validate_input(base_categories, dup_places)


def test_invalid_district_fails(base_categories):
    """Verify unrecognized district name is rejected."""
    bad_district = [{
        "id": "place_test_003",
        "name": "Unknown District Place",
        "category": "temple",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Bhubaneswar",  # City, not district (Khordha is the district)
        "source": "ASI",
    }]
    with pytest.raises(ImportValidationError, match="not a valid Odisha administrative district"):
        validate_input(base_categories, bad_district)


def test_coordinate_outside_odisha_envelope_fails(base_categories):
    """Verify coordinate outside the bounding box fails validation."""
    outside_place = [{
        "id": "place_test_004",
        "name": "Delhi Monument",
        "category": "temple",
        "lat": 28.6139,  # New Delhi lat
        "lon": 77.2090,  # New Delhi lon
        "district": "Khordha",
        "source": "ASI",
    }]
    with pytest.raises(ImportValidationError, match="outside Odisha envelope"):
        validate_input(base_categories, outside_place)


def test_swapped_coordinate_detection(base_categories):
    """Verify obviously swapped latitude and longitude are detected and rejected."""
    swapped_place = [{
        "id": "place_test_005",
        "name": "Swapped Coords Place",
        "category": "temple",
        "lat": 85.8336,  # Longitude placed in lat
        "lon": 20.2382,  # Latitude placed in lon
        "district": "Khordha",
        "source": "ASI",
    }]
    with pytest.raises(ImportValidationError, match="obviously swapped lat/lon coordinates"):
        validate_input(base_categories, swapped_place)


def test_unknown_category_fails(base_categories):
    """Verify place with unlisted category is rejected."""
    bad_cat = [{
        "id": "place_test_006",
        "name": "Space Station",
        "category": "spaceport",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "source": "ISRO",
    }]
    with pytest.raises(ImportValidationError, match="is not present in categories.json"):
        validate_input(base_categories, bad_cat)


def test_unknown_interest_fails(base_categories, base_interests):
    """Verify place with unlisted interest is rejected."""
    bad_int = [{
        "id": "place_test_007",
        "name": "Rock Climb Park",
        "category": "temple",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "interests": ["space_travel"],
        "source": "Odisha Tourism",
    }]
    with pytest.raises(ImportValidationError, match="is not present in interests.json"):
        validate_input(base_categories, bad_int, base_interests)


def test_invalid_rating_and_count_fail(base_categories):
    """Verify rating bounds and rating_count integrity."""
    bad_rating = [{
        "id": "place_test_008",
        "name": "Overrated Place",
        "category": "temple",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "rating": 5.5,
        "source": "Survey",
    }]
    with pytest.raises(ImportValidationError, match="rating must be a finite number between 0.0 and 5.0"):
        validate_input(base_categories, bad_rating)

    bad_count = [{
        "id": "place_test_009",
        "name": "Negative Reviews Place",
        "category": "temple",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "rating": 4.5,
        "rating_count": -10,
        "source": "Survey",
    }]
    with pytest.raises(ImportValidationError, match="rating_count must be a non-negative integer"):
        validate_input(base_categories, bad_count)


def test_invalid_verification_status_fails(base_categories):
    """Verify invalid verification_status strings are rejected."""
    bad_status = [{
        "id": "place_test_010",
        "name": "Status Place",
        "category": "temple",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "verification_status": "MAYBE",
        "source": "Survey",
    }]
    with pytest.raises(ImportValidationError, match="verification_status must be 'VERIFIED', 'UNVERIFIED', 'UNAVAILABLE'"):
        validate_input(base_categories, bad_status)


def test_medical_record_validation_and_synthetic_phone_rejection(base_categories):
    """Verify medical record checks and rejection of synthetic/placeholder phone numbers."""
    # Synthetic emergency phone rejected
    bad_medical = [{
        "id": "med_test_001",
        "name": "Fake Hospital",
        "category": "hospital",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "emergency_phone": "0000000000",
        "source": "Health Dept",
    }]
    with pytest.raises(ImportValidationError, match="invalid/synthetic emergency_phone"):
        validate_input(base_categories, bad_medical)

    # Valid medical record with null phone passes without forcing phone fabrication
    good_medical = [{
        "id": "med_test_002",
        "name": "District Hospital Khordha",
        "category": "hospital",
        "lat": 20.18,
        "lon": 85.62,
        "district": "Khordha",
        "address": "Hospital Road, Khordha",
        "emergency_phone": None,
        "source": "Govt of Odisha Health & Family Welfare",
        "verification_status": "VERIFIED",
    }]
    validated = validate_input(base_categories, good_medical)
    assert validated.places[0]["emergency_phone"] is None


def test_transit_record_validation(base_categories):
    """Verify transit hub records require coordinates and district."""
    bad_transit = [{
        "id": "transit_test_001",
        "name": "Airport Missing Coords",
        "category": "transit_hub",
        "lat": None,
        "lon": None,
        "district": "Khordha",
        "source": "AAI",
    }]
    with pytest.raises(ImportValidationError, match="transit hub requires valid coordinates"):
        validate_input(base_categories, bad_transit)


def test_duplicate_name_within_same_district_fails(base_categories):
    """Verify duplicate place names inside the same district fail validation."""
    dup_names = [
        {
            "id": "place_name_001",
            "name": "Gandhi Park",
            "category": "temple",
            "lat": 20.29,
            "lon": 85.82,
            "district": "Khordha",
            "source": "ASI",
        },
        {
            "id": "place_name_002",
            "name": "Gandhi Park",
            "category": "temple",
            "lat": 20.35,
            "lon": 85.86,
            "district": "Khordha",
            "source": "ASI",
        },
    ]
    with pytest.raises(ImportValidationError, match="duplicates place name 'Gandhi Park' within district 'Khordha'"):
        validate_input(base_categories, dup_names)


# --------------------------------------------------------------------------
# 3. Auditor CLI & Full Dataset Tests
# --------------------------------------------------------------------------

def test_existing_canonical_places_pass_auditor():
    """Verify the active canonical dataset passes the DataQualityAuditor with 0 failures."""
    auditor = DataQualityAuditor(DATA_DIR)
    report = auditor.run()

    assert report.total_places >= 81
    assert report.total_categories == 16
    assert report.total_interests == 12
    assert report.districts_represented_count == 30
    assert len(report.missing_districts) == 0
    assert report.fail_count == 0
    assert report.is_clean is True


def test_auditor_cli_json_output():
    """Verify auditor CLI executable runs and outputs valid JSON."""
    cmd = [sys.executable, str(ROOT_DIR / "scripts" / "audit_data_quality.py"), "--json"]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT_DIR))

    assert result.returncode == 0
    parsed = json.loads(result.stdout)
    assert parsed["total_places"] >= 81
    assert parsed["fail_count"] == 0
    assert parsed["districts_represented_count"] == 30
    assert "Khordha" in parsed["represented_districts"]
    assert "Angul" in parsed["represented_districts"]

