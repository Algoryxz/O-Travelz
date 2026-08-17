import uuid

import pytest

pytest.importorskip("geoalchemy2")

from geoalchemy2.elements import WKTElement

from app.db.base import Base
from app.models.place import Place


def test_canonical_database_tables_are_registered():
    expected = {
        "users",
        "categories",
        "places",
        "transport_providers",
        "stops",
        "routes",
        "route_stops",
        "scheduled_trips",
        "fare_rules",
        "itineraries",
        "itinerary_days",
        "itinerary_stops",
        "transport_hops",
    }
    assert expected.issubset(set(Base.metadata.tables))


def test_fare_rule_retains_verification_metadata():
    columns = {column.name for column in Base.metadata.tables["fare_rules"].columns}
    assert {"source", "verified_at"}.issubset(columns)


def test_place_and_category_retain_v51_metadata():
    place_columns = {column.name for column in Base.metadata.tables["places"].columns}
    category_columns = {column.name for column in Base.metadata.tables["categories"].columns}
    assert {
        "research_id",
        "source_provenance_note",
        "coordinate_verification",
        "coordinate_audit_status",
        "audit_status",
    }.issubset(place_columns)
    assert {"display_name", "description"}.issubset(category_columns)


def test_place_location_accepts_valid_point_and_null():
    location_column = Place.__table__.columns["location"]
    assert location_column.nullable is True
    assert location_column.type.geometry_type == "POINT"
    assert location_column.type.srid == 4326

    valid_location = WKTElement("POINT(85.8245 20.2961)", srid=4326)
    place_with_location = Place(
        name="Located Place",
        category_id=uuid.uuid4(),
        location=valid_location,
        source="https://example.test/located-place",
    )
    verified_without_location = Place(
        name="Verified Unlocated Place",
        category_id=uuid.uuid4(),
        location=None,
        source="https://example.test/verified-unlocated-place",
    )

    assert place_with_location.location == valid_location
    assert verified_without_location.location is None
