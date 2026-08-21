"""Unit tests for Phase 3 district taxonomy, region crosswalk, and schema validation."""
from __future__ import annotations

import json
from pathlib import Path
import pytest

from app.core.regions import (
    CANONICAL_REGIONS,
    DISTRICT_TO_REGION_MAP,
    ODISHA_DISTRICTS,
    get_region_for_place,
    validate_district,
)
from scripts.import_places import (
    ImportValidationError,
    load_places,
    validate_input,
)

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
PLACES_JSON_PATH = ROOT_DIR / "data" / "places" / "places.json"
CATEGORIES_JSON_PATH = ROOT_DIR / "data" / "places" / "categories.json"
INTERESTS_JSON_PATH = ROOT_DIR / "data" / "places" / "interests.json"


def test_odisha_districts_exact_count() -> None:
    """Odisha has exactly 30 official administrative districts."""
    assert len(ODISHA_DISTRICTS) == 30
    assert "Khordha" in ODISHA_DISTRICTS
    assert "Puri" in ODISHA_DISTRICTS
    assert "Cuttack" in ODISHA_DISTRICTS
    assert "Mayurbhanj" in ODISHA_DISTRICTS
    assert "Koraput" in ODISHA_DISTRICTS
    assert "Sambalpur" in ODISHA_DISTRICTS
    assert "Sundargarh" in ODISHA_DISTRICTS
    assert "Kandhamal" in ODISHA_DISTRICTS
    assert "Ganjam" in ODISHA_DISTRICTS


def test_validate_district_helper() -> None:
    """validate_district accepts all 30 districts and rejects invalid/null/empty."""
    for district in ODISHA_DISTRICTS:
        assert validate_district(district) is True
        assert validate_district(district.lower()) is True
        assert validate_district(district.upper()) is True

    assert validate_district(None) is False
    assert validate_district("") is False
    assert validate_district("   ") is False
    assert validate_district("California") is False
    assert validate_district("Atlantis") is False


def test_all_81_places_have_valid_districts() -> None:
    """Every single canonical place in places.json has a valid Odisha district."""
    places = json.loads(PLACES_JSON_PATH.read_text(encoding="utf-8"))
    assert len(places) == 81

    for place in places:
        assert "district" in place, f"Place {place['id']} ({place['name']}) is missing district field"
        district = place["district"]
        assert isinstance(district, str) and district.strip(), f"Place {place['id']} has invalid district"
        assert validate_district(district), f"Place {place['id']} has unknown district {district!r}"


def test_district_to_region_deterministic_mapping() -> None:
    """District -> Region mapping covers all canonical travel zones deterministically."""
    assert get_region_for_place("Khordha") == "Bhubaneswar & Central"
    assert get_region_for_place("Puri") == "Puri & Coastal"
    assert get_region_for_place("Puri", "place_konark_001") == "Konark & Marine"
    assert get_region_for_place("Cuttack") == "Cuttack & Mahanadi"
    assert get_region_for_place("Ganjam") == "Chilika & Southern Coast"
    assert get_region_for_place("Khordha", "place_chilika_002") == "Chilika & Southern Coast"
    assert get_region_for_place("Kandhamal") == "Kandhamal & Southern Hills"
    assert get_region_for_place("Sambalpur") == "Sambalpur & Western Odisha"
    assert get_region_for_place("Sundargarh") == "Rourkela & Sundargarh"
    assert get_region_for_place("Mayurbhanj") == "Northern Odisha & Wildlife"
    assert get_region_for_place("Balasore") == "Northern Odisha & Wildlife"
    assert get_region_for_place("Koraput") == "Koraput & Tribal Highlands"
    assert get_region_for_place("Rayagada") == "Koraput & Tribal Highlands"


def test_importer_validates_district_and_rejects_missing() -> None:
    """scripts/import_places.py rejects place records with missing or invalid district."""
    categories = [{"id": "temple", "name": "Temples", "description": None}]
    interests = [{"id": "heritage", "name": "Heritage", "description": None}]

    # Missing district
    bad_place_missing_district = [{
        "id": "test_001",
        "name": "Test Place",
        "category": "temple",
        "lat": 20.0,
        "lon": 85.0,
        "source": "https://example.com",
    }]
    with pytest.raises(ImportValidationError, match="district"):
        validate_input(categories, bad_place_missing_district, interests, require_district=True)

    # Invalid district
    bad_place_invalid_district = [{
        "id": "test_002",
        "name": "Test Place",
        "category": "temple",
        "lat": 20.0,
        "lon": 85.0,
        "source": "https://example.com",
        "district": "UnknownDistrict",
    }]
    with pytest.raises(ImportValidationError, match="valid Odisha administrative district"):
        validate_input(categories, bad_place_invalid_district, interests)


def test_full_source_places_validation() -> None:
    """Full data/places/ validation passes with 81 valid places, 13 categories, 12 interests."""
    categories = json.loads(CATEGORIES_JSON_PATH.read_text(encoding="utf-8"))
    interests = json.loads(INTERESTS_JSON_PATH.read_text(encoding="utf-8"))
    places = json.loads(PLACES_JSON_PATH.read_text(encoding="utf-8"))

    validated = validate_input(categories, places, interests)
    assert len(validated.categories) == 13
    assert len(validated.interests) == 12
    assert len(validated.places) == 81

    for place in validated.places:
        assert validate_district(place.get("district")) is True


def test_alembic_migration_0007_structure() -> None:
    """Alembic migration 0007_add_place_district exists with valid revision chain and operations."""
    migration_file = ROOT_DIR / "backend" / "alembic" / "versions" / "0007_add_place_district.py"
    assert migration_file.exists()

    content = migration_file.read_text(encoding="utf-8")
    assert 'revision: str = "0007_add_place_district"' in content
    assert 'down_revision: Union[str, None] = "0006_interests_and_place_interests"' in content
    assert "def upgrade()" in content
    assert "def downgrade()" in content
    assert 'op.add_column("places", sa.Column("district", sa.String(), nullable=True))' in content
    assert 'op.drop_column("places", "district")' in content
