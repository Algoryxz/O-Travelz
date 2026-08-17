import pytest

pytest.importorskip("geoalchemy2")

from app.db.base import Base


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
