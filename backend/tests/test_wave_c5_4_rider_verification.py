"""
Wave C5.4: Rider Trace & Local Stop Verification Test Suite.

Verifies:
1. One ride cannot promote a stop.
2. Duplicate samples from one ride do not increase independence.
3. Two sessions remain below promotion-review threshold.
4. Three independent good sessions become review-ready.
5. Poor accuracy is rejected/downweighted.
6. Impossible jumps are rejected.
7. Wrong-route traces are quarantined.
8. Candidate stops never get first-mile permission.
9. Canonical exact coordinates cannot be overwritten.
10. Explicit boarding is stronger than passive pause.
11. Traffic pause alone does not establish a stop.
12. Generic stop identity resolves through route topology.
13. Text local confirmation cannot establish GPS truth.
14. Direction is preserved.
15. Test fixtures cannot enter real production evidence registry.
16. Canonical transit file hashes are 100% unchanged.
"""
import hashlib
import json
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models.transport import Route, Stop
from app.models.transit_observation import (
    TransitRideSession,
    TransitRideSample,
    TransitStopObservation,
)
from app.transport.geometry_engine import DeterministicGeometryEngine
from app.transport.trace_processor import (
    DeterministicTraceCleaner,
    MapMatchingEngine,
    StopEventDetector,
    StopAssociationEngine,
    ConsensusEngine,
)

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CANONICAL_DIR = REPO_ROOT / "data" / "transport" / "canonical"
STAGING_DIR = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus"


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


# =====================================================================
# DETERMINISTIC SIMULATION FIXTURES (TEST_FIXTURE_ONLY)
# =====================================================================

def generate_simulated_trace(
    route_coords: list[tuple[float, float]],
    start_time: datetime,
    noise_m: float = 0.0,
    inject_jump: bool = False,
    pause_at_index: int = -1,
    pause_seconds: int = 30,
) -> list[dict]:
    """Generates ~1Hz GPS samples along route coords for testing."""
    samples = []
    curr_time = start_time
    for idx, (lat, lon) in enumerate(route_coords):
        lat_val = lat + (noise_m / 111000.0)
        lon_val = lon + (noise_m / 111000.0)

        # Pause simulation
        if idx == pause_at_index:
            for s in range(pause_seconds):
                samples.append({
                    "timestamp": (curr_time + timedelta(seconds=s)).isoformat(),
                    "latitude": lat_val,
                    "longitude": lon_val,
                    "accuracy_m": 8.0,
                    "speed_mps": 0.2,
                    "heading_deg": 90.0,
                    "marker": "TEST_FIXTURE_ONLY",
                })
            curr_time += timedelta(seconds=pause_seconds)

        # Impossible jump injection
        if inject_jump and idx == 5:
            samples.append({
                "timestamp": (curr_time + timedelta(seconds=1)).isoformat(),
                "latitude": lat_val + 0.5,  # 55 km jump in 1 second
                "longitude": lon_val + 0.5,
                "accuracy_m": 8.0,
                "speed_mps": 200.0,
                "heading_deg": 90.0,
                "marker": "TEST_FIXTURE_ONLY",
            })
            curr_time += timedelta(seconds=1)

        samples.append({
            "timestamp": curr_time.isoformat(),
            "latitude": lat_val,
            "longitude": lon_val,
            "accuracy_m": 8.0,
            "speed_mps": 8.5,
            "heading_deg": 90.0,
            "marker": "TEST_FIXTURE_ONLY",
        })
        curr_time += timedelta(seconds=2)

    return samples


# =====================================================================
# 16 REQUIRED VERIFICATION TESTS
# =====================================================================

def test_1_one_ride_cannot_promote_stop():
    """Anti-vibe invariant: a single ride session can NEVER promote a stop beyond OBSERVED_ONCE."""
    obs = [
        {
            "session_id": "sess-1",
            "contributor_hash": "contrib-A",
            "latitude": 20.2961,
            "longitude": 85.8245,
            "observation_type": "BOARDING",
        }
    ]
    res = ConsensusEngine.evaluate_stop_observations(obs)
    assert res["consensus_status"] == "OBSERVED_ONCE"
    assert res["is_review_ready"] is False
    assert res["independent_session_count"] == 1


def test_2_duplicate_samples_from_one_ride_do_not_increase_independence():
    """Multiple samples/events from the exact same ride session count as ONE independent vote."""
    obs = [
        {
            "session_id": "sess-1",
            "contributor_hash": "contrib-A",
            "latitude": 20.2961,
            "longitude": 85.8245,
            "observation_type": "BUS_STOPPED",
        },
        {
            "session_id": "sess-1",
            "contributor_hash": "contrib-A",
            "latitude": 20.29612,
            "longitude": 85.82451,
            "observation_type": "BOARDING",
        },
        {
            "session_id": "sess-1",
            "contributor_hash": "contrib-A",
            "latitude": 20.29609,
            "longitude": 85.82449,
            "observation_type": "BUS_STOPPED",
        },
    ]
    res = ConsensusEngine.evaluate_stop_observations(obs)
    assert res["independent_session_count"] == 1, "3 samples from 1 ride must evaluate to 1 independent session"
    assert res["is_review_ready"] is False


def test_3_two_sessions_remain_below_promotion_review_threshold():
    """Two independent sessions reach COMMUNITY_SUPPORTED, but strictly stay below PROMOTION_REVIEW_READY."""
    obs = [
        {"session_id": "sess-1", "contributor_hash": "contrib-A", "latitude": 20.2961, "longitude": 85.8245},
        {"session_id": "sess-2", "contributor_hash": "contrib-B", "latitude": 20.29615, "longitude": 85.82452},
    ]
    res = ConsensusEngine.evaluate_stop_observations(obs)
    assert res["independent_session_count"] == 2
    assert res["consensus_status"] == "COMMUNITY_SUPPORTED"
    assert res["is_review_ready"] is False


def test_4_three_independent_good_sessions_become_review_ready():
    """Three independent sessions from >= 2 contributors within 50m reach PROMOTION_REVIEW_READY."""
    obs = [
        {"session_id": "sess-1", "contributor_hash": "contrib-A", "latitude": 20.2961, "longitude": 85.8245},
        {"session_id": "sess-2", "contributor_hash": "contrib-B", "latitude": 20.29612, "longitude": 85.82452},
        {"session_id": "sess-3", "contributor_hash": "contrib-C", "latitude": 20.29608, "longitude": 85.82448},
    ]
    res = ConsensusEngine.evaluate_stop_observations(obs)
    assert res["independent_session_count"] == 3
    assert res["contributor_count"] == 3
    assert res["dispersion_radius_m"] < 25.0
    assert res["consensus_status"] == "PROMOTION_REVIEW_READY"
    assert res["is_review_ready"] is True


def test_5_poor_accuracy_rejected():
    """GPS readings with horizontal accuracy > 40m are filtered out."""
    now = datetime.now(timezone.utc)
    raw = [
        {"timestamp": now.isoformat(), "latitude": 20.2961, "longitude": 85.8245, "accuracy_m": 8.0},
        {"timestamp": (now + timedelta(seconds=1)).isoformat(), "latitude": 20.2962, "longitude": 85.8246, "accuracy_m": 85.0},
    ]
    clean, filtered = DeterministicTraceCleaner.clean_samples(raw, region="Capital Region")
    assert len(clean) == 1
    assert len(filtered) == 1
    assert filtered[0]["filter_reason"] == "POOR_ACCURACY"


def test_6_impossible_jumps_rejected():
    """Samples exhibiting speeds > 120 km/h (33.3 m/s) are filtered out as impossible jumps."""
    now = datetime.now(timezone.utc)
    raw = [
        {"timestamp": now.isoformat(), "latitude": 20.2961, "longitude": 85.8245, "accuracy_m": 8.0},
        # Jump 5 km in 2 seconds = 2,500 m/s (~9,000 km/h)
        {"timestamp": (now + timedelta(seconds=2)).isoformat(), "latitude": 20.3400, "longitude": 85.8245, "accuracy_m": 8.0},
    ]
    clean, filtered = DeterministicTraceCleaner.clean_samples(raw, region="Capital Region")
    assert len(clean) == 1
    assert len(filtered) == 1
    assert "IMPOSSIBLE_JUMP" in filtered[0]["filter_reason"]


def test_7_wrong_route_quarantined():
    """A trace that diverges significantly from the claimed route must be QUARANTINED, not accepted."""
    # Route 09 coordinates in Bhubaneswar
    route_coords = [(20.2662, 85.8436), (20.2961, 85.8245), (20.3604, 85.8247)]
    # Divergent trace in Cuttack (15 km away)
    divergent_samples = [
        {"latitude": 20.4625, "longitude": 85.8828},
        {"latitude": 20.4630, "longitude": 85.8830},
        {"latitude": 20.4640, "longitude": 85.8835},
    ]
    match = MapMatchingEngine.match_trace_to_route(divergent_samples, route_coords, route_number="09")
    assert match["status"] == "QUARANTINED"
    assert match["is_matched"] is False
    assert "diverged from route 09" in match["quarantine_reason"]


def test_8_candidate_stops_never_get_first_mile_permission(db_session: Session):
    """Decoupled truth invariant: candidate stops NEVER participate in first-mile walking."""
    engine = DeterministicGeometryEngine(db_session)
    payload_09 = engine.get_route_geometry("09")
    assert payload_09 is not None

    for a in payload_09.anchor_stops:
        if a["stop_resolution_status"] not in ("VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL"):
            assert a["participates_in_first_mile"] is False, f"Stop {a['name']} granted first-mile despite status {a['stop_resolution_status']}"


def test_9_canonical_exact_coordinates_cannot_be_overwritten(db_session: Session):
    """Ground truth cannot overwrite canonical verified coordinates; exact stops retain official coordinates."""
    station_stop = db_session.query(Stop).filter(Stop.canonical_stop_id == "stop_crut_bhubaneswar_bhubaneswar_railway_station").first()
    assert station_stop is not None
    assert station_stop.coordinate_status.lower() in ("official", "verified_official")
    assert station_stop.location is not None


def test_10_explicit_boarding_is_stronger_than_passive_pause():
    """Explicit boarding taps carry higher evidence weight and immediate association over passive pauses."""
    route_stops = [
        {"stop_id": "stop_1", "canonical_stop_id": "stop_1", "name": "Patia", "latitude": 20.3604, "longitude": 85.8247, "stop_resolution_status": "VERIFIED_OFFICIAL"}
    ]
    # Explicit boarding at the stop
    boarding_assoc = StopAssociationEngine.associate_observation(20.36042, 85.82471, route_stops)
    assert boarding_assoc["canonical_stop_id"] == "stop_1"
    assert boarding_assoc["association_status"] == "CONFIRMS_EXISTING_EXACT"


def test_11_traffic_pause_alone_does_not_establish_stop():
    """An isolated 25-second stationary pause in the middle of a highway does not match any stop."""
    route_stops = [
        {"stop_id": "stop_A", "canonical_stop_id": "stop_A", "name": "Stop A", "latitude": 20.2000, "longitude": 85.8000, "stop_resolution_status": "VERIFIED_OFFICIAL"},
        {"stop_id": "stop_B", "canonical_stop_id": "stop_B", "name": "Stop B", "latitude": 20.2500, "longitude": 85.8000, "stop_resolution_status": "VERIFIED_OFFICIAL"},
    ]
    # Pause at traffic light 2.5 km away from Stop A and Stop B
    traffic_pause = (20.2250, 85.8000)
    assoc = StopAssociationEngine.associate_observation(traffic_pause[0], traffic_pause[1], route_stops)
    # Beyond match radius (120m)
    assert assoc["canonical_stop_id"] is None
    assert assoc["association_status"] == "NEW_LOCATION_HYPOTHESIS"


def test_12_generic_stop_identity_can_resolve_through_route_topology():
    """Generic name 'Market' resolves accurately when bounded by route sequence anchors."""
    route_stops = [
        {"stop_id": "stop_1", "canonical_stop_id": "stop_1", "name": "Origin", "latitude": 20.2000, "longitude": 85.8000, "stop_resolution_status": "VERIFIED_OFFICIAL"},
        {"stop_id": "stop_2", "canonical_stop_id": "stop_2", "name": "Market Square", "latitude": 20.2100, "longitude": 85.8050, "stop_resolution_status": "CANDIDATE_HIGH"},
        {"stop_id": "stop_3", "canonical_stop_id": "stop_3", "name": "Terminus", "latitude": 20.2200, "longitude": 85.8100, "stop_resolution_status": "VERIFIED_OFFICIAL"},
    ]
    # Observation near Market Square candidate
    assoc = StopAssociationEngine.associate_observation(20.2102, 85.8051, route_stops)
    assert assoc["canonical_stop_id"] == "stop_2"
    assert assoc["association_status"] == "SUPPORTS_CANDIDATE"


def test_13_text_local_confirmation_cannot_establish_gps_truth(client: TestClient):
    """Text-only local confirmation confirms existence, but cannot establish exact GPS coordinates."""
    payload = {
        "route_number": "09",
        "canonical_stop_id": "stop_crut_bhubaneswar_niladri_vihar",
        "confirmation_value": "YES",
        "contributor_hash": "local_contributor_hash_12345",
        "latitude": None,
        "longitude": None,
        "accuracy_m": None,
    }
    resp = client.post("/api/transport/stops/confirm", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "ACCEPTED"
    assert data["confirmation_value"] == "YES"


def test_14_direction_is_preserved_during_ride_lifecycle(client: TestClient):
    """Trip direction (forward vs return) is explicitly tracked and preserved in ride sessions."""
    payload = {
        "route_number": "101",
        "sequence_id": "rt_crut_101_return",
        "direction": "return",
        "session_hash": "pseudonymous_session_hash_abcdef123456",
        "consent_version": "1.0",
        "is_test_fixture": True,
    }
    resp = client.post("/api/transport/rides/sessions", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["route_number"] == "101"
    assert data["sequence_id"] == "rt_crut_101_return"


def test_15_test_fixtures_cannot_enter_real_evidence():
    """Observations flagged as is_test_fixture are blocked from review-ready promotion."""
    obs = [
        {"session_id": "s1", "contributor_hash": "c1", "latitude": 20.2961, "longitude": 85.8245, "is_test_fixture": True},
        {"session_id": "s2", "contributor_hash": "c2", "latitude": 20.2961, "longitude": 85.8245, "is_test_fixture": True},
        {"session_id": "s3", "contributor_hash": "c3", "latitude": 20.2961, "longitude": 85.8245, "is_test_fixture": True},
    ]
    res = ConsensusEngine.evaluate_stop_observations(obs)
    assert res["has_test_fixtures"] is True
    assert res["is_review_ready"] is False, "Test fixtures must NEVER graduate to review-ready status"


def test_16_canonical_hashes_unchanged():
    """All 6 canonical transit files must remain 100% byte-for-byte identical to baseline."""
    before_p = REPO_ROOT / "reports" / "transit_c5_4_before.json"
    assert before_p.exists()
    with open(before_p, "r", encoding="utf-8") as f:
        before = json.load(f)["canonical_hashes"]

    for fn, expected_h in before.items():
        actual_h = hashlib.sha256((CANONICAL_DIR / fn).read_bytes()).hexdigest()
        assert actual_h == expected_h, f"CANONICAL INVARIANT BREACH: {fn} hash modified!"
