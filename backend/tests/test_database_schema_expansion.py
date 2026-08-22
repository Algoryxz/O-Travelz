"""Tests for Phase 11 Step 2 database schema expansion and data quality contract."""
import uuid
import pytest
from geoalchemy2.elements import WKTElement

from app.db.base import Base
from app.models.place import Place
from app.models.category import Category
from app.api.places_routes import PlaceDetailResponse

from scripts.import_places import (
    load_categories,
    load_places,
    load_interests,
    validate_input,
    ImportValidationError,
)
from app.core.regions import ODISHA_DISTRICTS, validate_district


def test_place_model_has_all_phase11_columns_and_nullable():
    """Verify all new knowledge base expansion columns are present and nullable."""
    table = Place.__table__
    columns = table.columns

    expected_new_columns = {
        "rating",
        "rating_count",
        "rating_source",
        "opening_hours_source",
        "source_url",
        "verification_status",
        "contact_phone",
        "emergency_phone",
        "address",
    }

    for col_name in expected_new_columns:
        assert col_name in columns, f"Missing column: {col_name}"
        assert columns[col_name].nullable is True, f"Column {col_name} must be nullable"


def test_place_model_indexes_exist():
    """Verify performance and query indexes exist on district, name, category_id, verification_status."""
    table = Place.__table__
    index_names = {idx.name for idx in table.indexes}

    expected_indexes = {
        "ix_places_district",
        "ix_places_name",
        "ix_places_category_id",
        "ix_places_verification_status",
    }

    for idx_name in expected_indexes:
        assert idx_name in index_names, f"Missing index: {idx_name}"


def test_canonical_categories_contain_medical_and_transit():
    """Verify hospital, emergency_facility, and transit_hub exist in categories.json."""
    categories = load_categories()
    category_ids = {c["id"] for c in categories}

    assert "hospital" in category_ids
    assert "emergency_facility" in category_ids
    assert "transit_hub" in category_ids
    assert len(categories) >= 16


def test_importer_validates_rating_bounds():
    """Verify importer rejects negative ratings or ratings > 5.0."""
    categories = [{"id": "temple", "name": "temple"}]
    
    # Negative rating rejected
    bad_place_neg = [{
        "name": "Invalid Rating Place",
        "category": "temple",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "source": "https://example.test",
        "rating": -1.0,
    }]
    with pytest.raises(ImportValidationError, match="rating must be a finite number between 0.0 and 5.0"):
        validate_input(categories, bad_place_neg)

    # Rating > 5.0 rejected
    bad_place_high = [{
        "name": "Invalid High Rating Place",
        "category": "temple",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "source": "https://example.test",
        "rating": 6.5,
    }]
    with pytest.raises(ImportValidationError, match="rating must be a finite number between 0.0 and 5.0"):
        validate_input(categories, bad_place_high)

    # Valid rating accepted
    good_place = [{
        "name": "Valid Rating Place",
        "category": "temple",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "source": "https://example.test",
        "rating": 4.8,
        "rating_count": 1500,
        "rating_source": "Verified Tourism Survey",
    }]
    validated = validate_input(categories, good_place)
    assert validated.places[0]["rating"] == 4.8
    assert validated.places[0]["rating_count"] == 1500


def test_importer_validates_rating_count_bounds():
    """Verify importer rejects negative rating counts or boolean values."""
    categories = [{"id": "temple", "name": "temple"}]
    
    bad_count = [{
        "name": "Invalid Count Place",
        "category": "temple",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "source": "https://example.test",
        "rating_count": -5,
    }]
    with pytest.raises(ImportValidationError, match="rating_count must be a non-negative integer"):
        validate_input(categories, bad_count)


def test_importer_validates_verification_status_enum():
    """Verify verification_status must be VERIFIED, UNVERIFIED, UNAVAILABLE, or null."""
    categories = [{"id": "hospital", "name": "hospital"}]

    # Invalid status rejected
    bad_status = [{
        "name": "Invalid Status Hospital",
        "category": "hospital",
        "lat": 20.29,
        "lon": 85.82,
        "district": "Khordha",
        "source": "https://example.test",
        "verification_status": "MAYBE_VERIFIED",
    }]
    with pytest.raises(ImportValidationError, match="verification_status must be 'VERIFIED', 'UNVERIFIED', 'UNAVAILABLE'"):
        validate_input(categories, bad_status)

    # Valid statuses accepted
    for status in ("VERIFIED", "UNVERIFIED", "UNAVAILABLE"):
        good_status = [{
            "name": f"Hospital {status}",
            "category": "hospital",
            "lat": 20.29,
            "lon": 85.82,
            "district": "Khordha",
            "source": "https://example.test",
            "verification_status": status,
        }]
        validated = validate_input(categories, good_status)
        assert validated.places[0]["verification_status"] == status


def test_existing_canonical_places_pass_validation_with_new_schema():
    """Verify all canonical places pass validation against the expanded category set."""
    categories = load_categories()
    places = load_places()
    interests = load_interests()

    assert len(places) >= 81
    assert len(categories) >= 16
    assert len(interests) == 12

    validated = validate_input(categories, places, interests, require_district=True)
    assert len(validated.places) >= 81


    # Verify district validity on all 81 places
    for p in validated.places:
        assert p["district"] in ODISHA_DISTRICTS
        assert validate_district(p["district"]) is True
        assert p["lat"] is not None and p["lon"] is not None
        # Coordinates in Odisha bounding box
        assert 17.0 <= p["lat"] <= 23.0
        assert 81.0 <= p["lon"] <= 88.0


def test_place_detail_api_schema_exposes_optional_fields():
    """Verify PlaceDetailResponse includes all new optional fields with null defaults."""
    response = PlaceDetailResponse(
        id=str(uuid.uuid4()),
        name="AIIMS Hospital",
        category="hospital",
        district="Khordha",
        region="Bhubaneswar & Central",
        lat=20.2312,
        lon=85.7891,
        verification_status="VERIFIED",
        contact_phone="+91-674-2476789",
        emergency_phone="108",
        address="Sijua, Patrapada, Bhubaneswar, Odisha 751019",
        source="MoHFW Govt of India",
        source_url="https://aiimsbhubaneswar.nic.in",
    )

    dump = response.model_dump()
    assert dump["verification_status"] == "VERIFIED"
    assert dump["emergency_phone"] == "108"
    assert dump["contact_phone"] == "+91-674-2476789"
    assert dump["address"] == "Sijua, Patrapada, Bhubaneswar, Odisha 751019"
    assert dump["rating"] is None
    assert dump["rating_count"] is None
    assert dump["rating_source"] is None
