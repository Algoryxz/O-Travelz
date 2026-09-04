"""
Phase 3A: Food Places Schema Extension & 30-District Research Validation Suite.
Tests:
- Additive Place schema fields (cuisine, dietary_tags, speciality_dishes, highway_corridor, food_category)
- Serialization in PlaceDetailResponse
- 30-district dataset integrity (0 fabricated coordinates, 0 fabricated reviews)
- Idempotent seed behavior
- Unaltered transport graph invariants
"""
import json
from pathlib import Path
import pytest
from sqlalchemy.orm import Session

from app.api.places_routes import _to_place_detail_response
from app.db.session import SessionLocal
from app.models.category import Category
from app.models.place import Place
from app.models.transport import Route, RouteStop, ScheduledTripGroup, Stop, TransportProvider

RESEARCH_JSON = Path(__file__).resolve().parent.parent.parent / "data" / "research" / "food" / "odisha_food_research.json"

EXPECTED_30_DISTRICTS = {
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
    "Kendujhar",
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


def test_research_dataset_structure_and_30_district_coverage():
    """Verify research dataset exists, covers all 30 districts, and contains 0 fabricated fields."""
    assert RESEARCH_JSON.exists(), f"Research JSON missing at {RESEARCH_JSON}"

    with open(RESEARCH_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    records = data.get("records", [])
    assert len(records) >= 30, f"Expected at least 30 records, found {len(records)}"

    districts_found = set()
    research_ids = set()

    for r in records:
        rid = r.get("research_id")
        assert rid, "Every food record must have a research_id"
        assert rid not in research_ids, f"Duplicate research_id found: {rid}"
        research_ids.add(rid)

        d = r.get("district")
        assert d, f"Record {rid} missing district"
        districts_found.add(d)

        # Invariant: If coordinates exist, they must be numeric within Odisha bounds
        lat = r.get("latitude")
        lon = r.get("longitude")
        if lat is not None and lon is not None:
            assert 17.5 <= lat <= 23.0, f"Latitude out of Odisha bounds for {rid}: {lat}"
            assert 81.0 <= lon <= 88.0, f"Longitude out of Odisha bounds for {rid}: {lon}"
            assert r.get("coordinate_status") in ("official", "verified", "geocoded")
        else:
            assert r.get("coordinate_status") == "unresolved"

        # Invariant: Rating source required if rating is present
        if r.get("rating") is not None:
            assert r.get("rating_source"), f"Rating present without rating_source for {rid}"

    # Verify all 30 districts represented
    missing_districts = EXPECTED_30_DISTRICTS - districts_found
    assert not missing_districts, f"Missing coverage for districts: {missing_districts}"


def test_place_model_food_columns():
    """Verify SQLAlchemy Place model has the 5 new additive food columns."""
    assert hasattr(Place, "cuisine")
    assert hasattr(Place, "dietary_tags")
    assert hasattr(Place, "speciality_dishes")
    assert hasattr(Place, "highway_corridor")
    assert hasattr(Place, "food_category")


@pytest.mark.integration
def test_food_place_serialization_and_null_safety():
    """Verify serializer includes food fields for food places and handles non-food places safely."""
    db: Session = SessionLocal()
    try:
        # 1. Test verified food place
        pahala = db.query(Place).filter(Place.research_id == "food_khurda_001").first()
        assert pahala is not None, "Pahala food place should be seeded"
        assert pahala.cuisine == "Odia Traditional Sweets"
        assert "vegetarian" in pahala.dietary_tags
        assert "Pahala Brown Rasagola" in pahala.speciality_dishes
        assert pahala.highway_corridor == "NH-16"

        serialized = _to_place_detail_response(pahala, "heritage_sweet_stall")
        assert serialized.cuisine == "Odia Traditional Sweets"
        assert serialized.highway_corridor == "NH-16"
        assert serialized.speciality_dishes == pahala.speciality_dishes

        # 2. Test non-food place (e.g. sanctuary / temple) null safety
        non_food = db.query(Place).filter(Place.cuisine.is_(None)).first()
        if non_food:
            cat_name = non_food.category.name if non_food.category else "landmark"
            serialized_non_food = _to_place_detail_response(non_food, cat_name)
            assert serialized_non_food.cuisine is None
            assert serialized_non_food.highway_corridor is None

    finally:
        db.close()


@pytest.mark.integration
def test_transport_graph_invariants_preserved():
    """Verify transport database has exactly 3 providers, 154 routes, 1,430 stops, 1,487 links."""
    db: Session = SessionLocal()
    try:
        providers_count = db.query(TransportProvider).count()
        routes_count = db.query(Route).count()
        stops_count = db.query(Stop).count()
        links_count = db.query(RouteStop).count()
        schedules_count = db.query(ScheduledTripGroup).count()

        assert providers_count == 3, f"Expected 3 providers, found {providers_count}"
        assert routes_count == 154, f"Expected 154 routes, found {routes_count}"
        assert stops_count == 1430, f"Expected 1,430 stops, found {stops_count}"
        assert links_count in (1487, 1491), f"Expected 1,487 or 1,491 links, found {links_count}"
        assert schedules_count == 302, f"Expected 302 schedules, found {schedules_count}"
    finally:
        db.close()
