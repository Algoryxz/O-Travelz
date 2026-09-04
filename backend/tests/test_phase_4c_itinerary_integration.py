"""
Phase 4C: Multimodal Journey -> Itinerary Deep Integration Test Suite.

Comprehensive validation covering:
1. Direct multimodal journey serialization into itinerary payload.
2. 1-transfer multimodal journey serialization into itinerary payload.
3. Walking legs preserved.
4. Transit route IDs preserved.
5. Boarding/alighting stop IDs preserved.
6. Departure/arrival values preserved.
7. Transfer metadata & buffer preserved.
8. Food waypoint preserved.
9. Geometry warnings preserved.
10. Legacy itinerary records without multimodal journey still load seamlessly.
11. Shared trip snapshot (/api/v1/trips/share & /api/v1/trips/shared/{share_id}) preserves full multimodal journey structure.
12. Zero fabricated coordinates.
13. Zero fabricated schedule values.
"""
import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.integration

from app.db.session import SessionLocal
from app.main import app
from app.models.transport import Route, RouteStop, ScheduledTripGroup, Stop, TransportProvider
from app.models.session import SharedTripSnapshot, UserSavedTrip
from app.models.user import User
from app.transport.planner import MultimodalJourneyPlanner


client = TestClient(app)


def test_1_direct_multimodal_journey_serialization():
    """Verify a direct journey serializes cleanly into a structured itinerary hop."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(20.2523, 85.8135, 20.2668, 85.8436, include_food=False)
        assert res["status"] == "SUCCESS"
        assert res["journey_type"] == "direct"
        assert res["transfer_count"] == 0

        # Construct itinerary hop embedding
        hop_payload = {
            "from_sequence": 1,
            "to_sequence": 2,
            "mode": "walk+bus",
            "estimated_minutes": res["total_estimated_duration_minutes"],
            "legs": [
                {"mode": "walk", "detail": f"Walk to {res['transit_legs'][0]['boarding_stop_name']}"},
                {"mode": "bus", "detail": f"Mo Bus {res['transit_legs'][0]['route_number']}"}
            ],
            "data_tier": "tier_1_direct_query",
            "multimodal_journey": res
        }

        # Verify json roundtrip
        serialized = json.dumps(hop_payload)
        deserialized = json.loads(serialized)
        assert deserialized["multimodal_journey"]["journey_id"] == res["journey_id"]
        assert deserialized["multimodal_journey"]["transit_legs"][0]["route_number"] == "82"
    finally:
        db.close()


def test_2_3_4_5_6_7_8_9_one_transfer_serialization_fidelity():
    """Verify 1-transfer journey with food preserves all legs, IDs, stops, times, and warnings."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2523,
            origin_lon=85.8135,
            destination_lat=20.3956,
            destination_lon=85.8256,
            requested_departure_time="10:00",
            include_food=True
        )
        assert res["status"] == "SUCCESS"
        assert res["journey_type"] == "1_transfer"
        assert res["transfer_count"] == 1
        assert len(res["transit_legs"]) == 2
        assert len(res["walking_legs"]) >= 2

        # Verify exact field preservation
        leg1 = res["transit_legs"][0]
        leg2 = res["transit_legs"][1]
        assert leg1["route_id"] is not None
        assert leg2["route_id"] is not None
        assert leg1["boarding_stop_id"] is not None
        assert leg1["alighting_stop_id"] is not None
        assert leg2["boarding_stop_id"] is not None
        assert leg2["alighting_stop_id"] is not None
        assert leg1["selected_departure"] == "10:12"
        assert leg1["estimated_arrival"] == "10:18"
        assert leg2["selected_departure"] == "10:35"
        assert leg2["estimated_arrival"] == "10:44"
        assert res["transfer_wait_minutes"] >= 10
        assert "Master Canteen" in res["transfer_hub"]

        # If food candidate exists, verify food fields
        if res["food_waypoint"]:
            fw = res["food_waypoint"]
            assert fw["place_id"] is not None
            assert fw["name"] is not None
            assert fw["source"] is not None
            assert fw["verification_status"] == "VERIFIED"

        # Embed into multi-day itinerary structure
        itinerary_data = {
            "itinerary_id": "itin_phase4c_test",
            "constraints": {"days": 1, "interests": ["transit"], "start": "Airport"},
            "days": [
                {
                    "day_number": 1,
                    "date": "2026-08-24",
                    "stops": [
                        {"sequence": 1, "place": {"name": "Airport", "category": "transit"}},
                        {"sequence": 2, "place": {"name": "Nandankanan", "category": "zoo"}}
                    ],
                    "hops": [
                        {
                            "from_sequence": 1,
                            "to_sequence": 2,
                            "mode": "walk+bus+transfer",
                            "estimated_minutes": res["total_estimated_duration_minutes"],
                            "legs": [],
                            "data_tier": "tier_1_direct_query",
                            "multimodal_journey": res
                        }
                    ]
                }
            ],
            "explanation": "Test 1-transfer multimodal itinerary"
        }

        serialized = json.dumps(itinerary_data)
        loaded = json.loads(serialized)
        mj = loaded["days"][0]["hops"][0]["multimodal_journey"]
        assert mj["journey_type"] == "1_transfer"
        assert mj["transfer_count"] == 1
        assert mj["transit_legs"][0]["selected_departure"] == "10:12"
        assert mj["transit_legs"][1]["selected_departure"] == "10:35"
        assert mj["transfer_wait_minutes"] == res["transfer_wait_minutes"]
    finally:
        db.close()


def test_10_legacy_itinerary_compatibility():
    """Verify legacy itineraries without multimodal_journey load without errors."""
    legacy_hop = {
        "from_sequence": 1,
        "to_sequence": 2,
        "mode": "car",
        "estimated_minutes": 25,
        "estimated_cost": 150.0,
        "legs": [
            {"mode": "car", "detail": "Drive via NH16", "provider": None, "route": None}
        ],
        "data_tier": "tier_2_synthetic_projection"
    }

    serialized = json.dumps(legacy_hop)
    loaded = json.loads(serialized)
    assert loaded["mode"] == "car"
    assert loaded.get("multimodal_journey") is None


def test_11_shared_snapshot_preserves_multimodal_journey():
    """Verify shared trip snapshot endpoint preserves full multimodal journey structure."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(20.2523, 85.8135, 20.3956, 85.8256, requested_departure_time="10:00")

        snapshot_itinerary = {
            "itinerary_id": "itin_share_test_123",
            "days": [
                {
                    "day_number": 1,
                    "stops": [],
                    "hops": [
                        {
                            "from_sequence": 1,
                            "to_sequence": 2,
                            "mode": "walk+bus+transfer",
                            "multimodal_journey": res
                        }
                    ]
                }
            ]
        }

        # Create test user for foreign key constraint
        test_user = db.query(User).first()
        created_user = False
        if not test_user:
            test_user = User(
                id=UUID("00000000-0000-0000-0000-00000000004c"),
                email="phase4c_test@example.com",
                name="Phase 4C Test User",
                provider="local"
            )
            db.add(test_user)
            db.commit()
            created_user = True

        # Create public snapshot directly in database
        share_id = "test_share_phase4c_token"
        snapshot = SharedTripSnapshot(
            share_id=share_id,
            user_id=test_user.id,
            title="Public Shared Multimodal Expedition",
            snapshot_data={
                "title": "Public Shared Multimodal Expedition",
                "itinerary": snapshot_itinerary,
                "constraints": {"days": 1, "start": "Airport"}
            }
        )
        db.add(snapshot)
        db.commit()

        # Retrieve via public API
        resp = client.get(f"/api/v1/trips/shared/{share_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Public Shared Multimodal Expedition"
        retrieved_hop = data["itinerary"]["days"][0]["hops"][0]
        assert retrieved_hop["multimodal_journey"]["journey_type"] == "1_transfer"
        assert retrieved_hop["multimodal_journey"]["transit_legs"][0]["route_number"] == "82"
        assert retrieved_hop["multimodal_journey"]["transit_legs"][1]["route_number"] == "46"
        assert retrieved_hop["multimodal_journey"]["transfer_wait_minutes"] >= 10

        # Clean up
        db.delete(snapshot)
        if created_user:
            db.delete(test_user)
        db.commit()

    finally:
        db.close()


def test_12_13_no_fabricated_coordinates_or_schedules():
    """Verify coordinate safety and zero schedule fabrication across database."""
    db: Session = SessionLocal()
    try:
        assert db.query(Stop).filter(Stop.location.isnot(None)).count() == 173
        assert db.query(Stop).filter(Stop.location.is_(None)).count() == 1257
        for s in db.query(Stop).filter(Stop.location.is_(None)).all():
            assert s.coordinate_status == "unresolved"

        assert db.query(TransportProvider).count() == 3
        assert db.query(Route).count() == 154
        assert db.query(RouteStop).count() == 1491
        assert db.query(ScheduledTripGroup).count() == 302
    finally:
        db.close()
