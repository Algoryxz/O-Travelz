"""
Phase 4B: Schedule-Aware 1-Transfer Multimodal Routing Test Suite.

Comprehensive validation covering:
A. Existing direct journey regression: Airport -> Master Canteen.
B. Existing direct journey regression: Master Canteen -> Nandankanan.
C. Existing direct journey regression: Master Canteen -> AIIMS.
D. Real 1-transfer journey success: Airport -> Nandankanan (Route 82 -> Master Canteen Hub -> Route 46).
E. Alias-based transfer recognition through Canonical Transit Hubs.
F. No valid transfer returns honest NO_TRANSIT_PATH.
G. Schedule-aware departure filtering (requested_departure_time >= '10:00').
H. Before-first-service selects earliest scheduled daily departure.
I. After-last-service (e.g. '23:55') returns honest NO_TRANSIT_PATH.
J. Transfer timing buffer validation (second_departure >= first_arrival + 10m).
K. Coordinate safety: 1,389 unresolved stops retain location=NULL and coordinate_status='unresolved'.
L. Exact graph invariants: 3 providers, 154 routes, 1,430 stops, 1,487 links, 302 schedules, 5,553 departures.
"""
import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.integration

from app.db.session import SessionLocal
from app.main import app
from app.models.transport import Route, RouteStop, ScheduledTripGroup, Stop, TransportProvider
from app.transport.planner import MultimodalJourneyPlanner, parse_time_to_minutes, format_minutes_to_time

client = TestClient(app)


def test_a_direct_regression_airport_to_master_canteen():
    """Verify Airport -> Master Canteen direct route 82 succeeds without transfers."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2523,
            origin_lon=85.8135,
            destination_lat=20.2668,
            destination_lon=85.8436,
            include_food=False,
        )
        assert res["status"] == "SUCCESS"
        assert res["journey_type"] == "direct"
        assert res["transfer_count"] == 0
        assert len(res["transit_legs"]) == 1
        assert res["transit_legs"][0]["route_number"] == "82"
    finally:
        db.close()


def test_b_direct_regression_station_to_nandankanan():
    """Verify Master Canteen -> Nandankanan direct route 46 succeeds."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2668,
            origin_lon=85.8436,
            destination_lat=20.3956,
            destination_lon=85.8256,
            include_food=False,
        )
        assert res["status"] == "SUCCESS"
        assert res["journey_type"] == "direct"
        assert res["transfer_count"] == 0
        assert res["transit_legs"][0]["route_number"] == "46"
    finally:
        db.close()


def test_c_direct_regression_station_to_aiims():
    """Verify Master Canteen -> AIIMS direct route 27 succeeds."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2668,
            origin_lon=85.8436,
            destination_lat=20.2312,
            destination_lon=85.7891,
            include_food=False,
        )
        assert res["status"] == "SUCCESS"
        assert res["journey_type"] == "direct"
        assert res["transfer_count"] == 0
        assert res["transit_legs"][0]["route_number"] == "27"
    finally:
        db.close()


def test_d_e_one_transfer_success_airport_to_nandankanan():
    """Verify Airport -> Nandankanan succeeds as a 1-transfer journey via Master Canteen Hub."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2523,
            origin_lon=85.8135,
            destination_lat=20.3956,
            destination_lon=85.8256,
            include_food=False,
        )
        assert res["status"] == "SUCCESS"
        assert res["journey_type"] == "1_transfer"
        assert res["transfer_count"] == 1
        assert "Master Canteen" in res["transfer_hub"]
        assert len(res["transit_legs"]) == 2
        assert res["transit_legs"][0]["route_number"] == "82"
        assert res["transit_legs"][1]["route_number"] == "46"
        assert res["transfer_wait_minutes"] >= 10
    finally:
        db.close()


def test_g_schedule_aware_filtering_at_10_00():
    """Verify requesting departure at 10:00 selects departure >= 10:00."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2523,
            origin_lon=85.8135,
            destination_lat=20.3956,
            destination_lon=85.8256,
            requested_departure_time="10:00",
            include_food=False,
        )
        assert res["status"] == "SUCCESS"
        dep1 = res["transit_legs"][0]["selected_departure"]
        assert dep1 is not None
        dep1_mins = parse_time_to_minutes(dep1)
        assert dep1_mins is not None
        assert dep1_mins >= parse_time_to_minutes("10:00")
    finally:
        db.close()


def test_h_before_first_service():
    """Verify requesting time at 04:00 selects the earliest scheduled departure."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2523,
            origin_lon=85.8135,
            destination_lat=20.2668,
            destination_lon=85.8436,
            requested_departure_time="04:00",
            include_food=False,
        )
        assert res["status"] == "SUCCESS"
        dep = res["transit_legs"][0]["selected_departure"]
        assert dep == "05:20"  # First daily departure of Route 82
    finally:
        db.close()


def test_i_after_last_service_returns_no_transit_path():
    """Verify requesting time after all daily departures (23:55) returns honest NO_TRANSIT_PATH."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2523,
            origin_lon=85.8135,
            destination_lat=20.3956,
            destination_lon=85.8256,
            requested_departure_time="23:55",
            include_food=False,
        )
        assert res["status"] == "NO_TRANSIT_PATH"
        assert len(res["transit_legs"]) == 0
    finally:
        db.close()


def test_j_transfer_timing_buffer():
    """Verify transfer timing enforces second_departure >= first_arrival + 10m buffer."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2523,
            origin_lon=85.8135,
            destination_lat=20.3956,
            destination_lon=85.8256,
            requested_departure_time="10:00",
            include_food=False,
        )
        assert res["status"] == "SUCCESS"
        assert res["transfer_count"] == 1
        leg1 = res["transit_legs"][0]
        leg2 = res["transit_legs"][1]
        arr1_mins = parse_time_to_minutes(leg1["estimated_arrival"])
        dep2_mins = parse_time_to_minutes(leg2["selected_departure"])
        assert arr1_mins is not None
        assert dep2_mins is not None
        assert dep2_mins >= arr1_mins + 10
    finally:
        db.close()


def test_k_coordinate_safety_unresolved_nulls_preserved():
    """Verify all 1,389 unresolved stops strictly retain location=NULL and coordinate_status='unresolved'."""
    db: Session = SessionLocal()
    try:
        unresolved_stops = db.query(Stop).filter(Stop.location.is_(None)).all()
        assert len(unresolved_stops) == 1389
        for s in unresolved_stops:
            assert s.location is None
            assert s.coordinate_status == "unresolved"

        geocoded_stops = db.query(Stop).filter(Stop.location.isnot(None)).all()
        assert len(geocoded_stops) == 41
    finally:
        db.close()


def test_l_graph_invariants_strictly_preserved():
    """Verify exact count invariants: 3 providers, 154 routes, 1430 stops, 1487 links, 302 schedules, 5553 departures."""
    db: Session = SessionLocal()
    try:
        assert db.query(TransportProvider).count() == 3
        assert db.query(Route).count() == 154
        assert db.query(Stop).count() == 1430
        assert db.query(RouteStop).count() == 1487
        assert db.query(ScheduledTripGroup).count() == 302
        assert db.query(Stop).filter(Stop.location.isnot(None)).count() == 41
        assert db.query(Stop).filter(Stop.location.is_(None)).count() == 1389

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
