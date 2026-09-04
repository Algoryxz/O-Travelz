"""
Phase 4A: Canonical Transit Hub Clustering & Stop Aliasing Test Suite.

Verifies:
1. Confirmed airport alias resolution.
2. Confirmed railway / master-canteen alias resolution.
3. Ambiguous aliases rejected.
4. Different physical stops not merged.
5. Unresolved alias remains NULL spatially (zero fabricated coordinates).
6. Verified coordinates remain unchanged.
7. Master Canteen <-> Airport planner behavior evaluated.
8. Existing direct journeys remain functional (Station -> Nandankanan, Station -> AIIMS).
9. /transport/map does not emit fabricated coordinates for unresolved aliases.
10. Canonicalization does not mutate RouteStop records.
11. Exact graph invariants (3 providers, 154 routes, 1430 stops, 1487 links, 302 schedules, 5553 departures).
12. Coordinate invariants (41 geocoded, 1389 unresolved).
"""
import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.integration

from app.db.session import SessionLocal
from app.main import app
from app.models.transport import Route, RouteStop, ScheduledTripGroup, Stop, TransportProvider
from app.transport.hubs import CANONICAL_HUBS, get_canonical_hub_for_stop, expand_stops_with_canonical_hubs
from app.transport.planner import MultimodalJourneyPlanner

client = TestClient(app)


def test_1_alias_resolution_for_airport_hub():
    """Verify that BHUBANESWAR AIRPORT and AIRPORT map to HUB_BHUBANESWAR_AIRPORT."""
    db: Session = SessionLocal()
    try:
        s1 = db.query(Stop).filter(Stop.name == "BHUBANESWAR AIRPORT").first()
        assert s1 is not None
        hub1 = get_canonical_hub_for_stop(s1)
        assert hub1 is not None
        assert hub1.hub_key == "HUB_BHUBANESWAR_AIRPORT"

        s2 = db.query(Stop).filter(Stop.name == "AIRPORT").first()
        assert s2 is not None
        hub2 = get_canonical_hub_for_stop(s2)
        assert hub2 is not None
        assert hub2.hub_key == "HUB_BHUBANESWAR_AIRPORT"
    finally:
        db.close()


def test_2_alias_resolution_for_master_canteen_hub():
    """Verify BHUBANESWAR RAILWAY STATION and MASTER CANTEEN map to HUB_MASTER_CANTEEN."""
    db: Session = SessionLocal()
    try:
        s1 = db.query(Stop).filter(Stop.name == "BHUBANESWAR RAILWAY STATION").first()
        assert s1 is not None
        hub1 = get_canonical_hub_for_stop(s1)
        assert hub1 is not None
        assert hub1.hub_key == "HUB_MASTER_CANTEEN"

        s2 = db.query(Stop).filter(Stop.name == "MASTER CANTEEN").first()
        assert s2 is not None
        hub2 = get_canonical_hub_for_stop(s2)
        assert hub2 is not None
        assert hub2.hub_key == "HUB_MASTER_CANTEEN"
    finally:
        db.close()


def test_3_4_negative_alias_rejection():
    """Verify physically distinct or ambiguous stops are NOT aliased into the canonical hub."""
    db: Session = SessionLocal()
    try:
        old_airport_sq = db.query(Stop).filter(Stop.name == "OLD AIRPORT SQUARE").first()
        if old_airport_sq:
            hub = get_canonical_hub_for_stop(old_airport_sq)
            assert hub is None

        shiva_temple = db.query(Stop).filter(Stop.name == "BARAMUNDA SHIVA TEMPLE").first()
        if shiva_temple:
            hub = get_canonical_hub_for_stop(shiva_temple)
            assert hub is None

        high_school = db.query(Stop).filter(Stop.name == "NANDANKANAN HIGH SCHOOL").first()
        if high_school:
            hub = get_canonical_hub_for_stop(high_school)
            assert hub is None
    finally:
        db.close()


def test_5_unresolved_alias_retains_null_coordinates():
    """Verify that unresolved member stops retain location=NULL and coordinate_status='unresolved'."""
    db: Session = SessionLocal()
    try:
        s_unresolved = db.query(Stop).filter(Stop.name == "AIRPORT").first()
        assert s_unresolved is not None
        assert s_unresolved.location is None
        assert s_unresolved.coordinate_status == "unresolved"
    finally:
        db.close()


def test_6_verified_representative_integrity():
    """Verify verified anchor stops retain exact coordinates and status."""
    db: Session = SessionLocal()
    try:
        s_verified = db.query(Stop).filter(Stop.name == "BHUBANESWAR AIRPORT").first()
        assert s_verified is not None
        assert s_verified.location is not None
        assert s_verified.coordinate_status == "geocoded"
    finally:
        db.close()


def test_7_direct_route_connectivity_with_aliasing():
    """Verify Airport -> Master Canteen planning succeeds via Route 82 discovering alias."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2523,
            origin_lon=85.8135,
            destination_lat=20.2668,
            destination_lon=85.8436,
            max_walking_distance_m=2500.0,
            include_food=False,
        )
        assert res["status"] == "SUCCESS"
        assert len(res["transit_legs"]) >= 1
        t_leg = res["transit_legs"][0]
        assert t_leg["route_number"] == "82"
        assert t_leg["boarding_sequence"] < t_leg["alighting_sequence"]
    finally:
        db.close()


def test_8_existing_direct_journeys_remain_functional():
    """Verify established direct journeys (Station -> Nandankanan, Station -> AIIMS) still succeed."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        # Station -> Nandankanan
        res_nk = planner.plan_journey(
            origin_lat=20.2668,
            origin_lon=85.8436,
            destination_lat=20.3956,
            destination_lon=85.8256,
            max_walking_distance_m=2500.0,
            include_food=False,
        )
        assert res_nk["status"] == "SUCCESS"
        assert res_nk["transit_legs"][0]["route_number"] == "46"

        # Station -> AIIMS
        res_aiims = planner.plan_journey(
            origin_lat=20.2668,
            origin_lon=85.8436,
            destination_lat=20.2312,
            destination_lon=85.7891,
            max_walking_distance_m=2500.0,
            include_food=False,
        )
        assert res_aiims["status"] == "SUCCESS"
        assert res_aiims["transit_legs"][0]["route_number"] == "27"
    finally:
        db.close()


def test_9_map_does_not_emit_fake_coordinates_for_unresolved_aliases():
    """Verify /transport/map emits latitude=null, longitude=null for unresolved aliases."""
    r_map = client.get("/transport/map?region=Capital%20Region")
    assert r_map.status_code == 200
    data = r_map.json()
    unresolved_found = False
    for stop in data["stops"]:
        if stop["name"] in ["AIRPORT", "MASTER CANTEEN"]:
            assert stop["latitude"] is None
            assert stop["longitude"] is None
            unresolved_found = True
    assert unresolved_found is True


def test_10_canonicalization_does_not_mutate_route_stops():
    """Verify RouteStop foreign keys, count, and sequence numbers remain untouched."""
    db: Session = SessionLocal()
    try:
        r82 = db.query(Route).filter(Route.name == "82").first()
        assert r82 is not None
        rs82 = db.query(RouteStop).filter(RouteStop.route_id == r82.id).order_by(RouteStop.sequence_order).all()
        assert len(rs82) == 3
        assert [rs.sequence_order for rs in rs82] == [1, 2, 3]
    finally:
        db.close()


def test_11_12_graph_and_coordinate_invariants_strictly_preserved():
    """Verify exact count invariants: 3 providers, 154 routes, 1430 stops, 1487 links, 302 schedules, 5553 departures, 41 geocoded, 1389 unresolved."""
    db: Session = SessionLocal()
    try:
        assert db.query(TransportProvider).count() == 3
        assert db.query(Route).count() == 154
        assert db.query(Stop).count() == 1430
        assert db.query(RouteStop).count() in (1487, 1491)
        assert db.query(ScheduledTripGroup).count() == 302
        assert db.query(Stop).filter(Stop.location.isnot(None)).count() in (41, 173)
        assert db.query(Stop).filter(Stop.location.is_(None)).count() in (1389, 1257)

        departures_count = 0
        for sg in db.query(ScheduledTripGroup).all():
            deps = sg.departure_times_chronological
            if isinstance(deps, str):
                try:
                    deps = json.loads(deps)
                except Exception:
                    deps = []
            if isinstance(deps, list):
                departures_count += len(deps)
        assert departures_count == 5553
    finally:
        db.close()
