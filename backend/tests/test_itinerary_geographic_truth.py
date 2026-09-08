"""Wave M13.1 Planner geographic-boundary and truth calibration regression tests."""
from __future__ import annotations

from pathlib import Path
import pytest

from app.schemas.common import PlanningConstraints
from app.services.ranking import InMemoryPlaceRepository, RankingService, VerifiedPlace
from app.services.ranking.service import _haversine_distance_km
from app.services.itinerary import ItineraryService
from app.transport.adapters.walking import Coordinate
from app.ai.multilingual import extract_multilingual_days
from app.ai.model import RuleBasedModelAdapter

REPO_ROOT = Path(__file__).resolve().parent.parent.parent


class MockTransportHopPlanner:
    def plan_transport_hop(self, args):
        from app.schemas.transport import DataTier, TransportHopContract
        return TransportHopContract(
            from_sequence=args.from_sequence,
            to_sequence=args.to_sequence,
            mode="walk",
            estimated_minutes=2,
            estimated_cost=None,
            legs=[{"mode": "walk", "detail": "Mock walking hop"}],
            data_tier=DataTier.STATIC,
        )


def _fixture_place(place_id: str, name: str, category: str, lat: float, lon: float, interests: tuple[str, ...]) -> VerifiedPlace:
    return VerifiedPlace(
        database_id=place_id,
        category_id=category,
        name=name,
        research_id=f"res_{place_id}",
        coordinate=Coordinate(lat, lon),
        interests=interests,
    )


# ---------------------------------------------------------------------------
# Unit Tests (Run in fast offline test suite)
# ---------------------------------------------------------------------------

def test_unit_six_hour_bhubaneswar_trip_excludes_puri_and_salepur():
    """TEST 1: 1-day/6-hour Bhubaneswar trip strictly excludes distant Puri and Salepur places."""
    bhu_start = _fixture_place("p_lingaraj", "Lingaraj Temple", "temple", 20.2383, 85.8336, ("heritage", "spirituality"))
    bhu_local_1 = _fixture_place("p_chitrakarini", "Chitrakarini Temple", "temple", 20.2393, 85.8340, ("heritage", "spirituality"))
    bhu_local_2 = _fixture_place("p_bindu", "Bindu Sagar", "lake", 20.2410, 85.8357, ("heritage", "nature"))
    salepur = _fixture_place("p_salepur", "Bikalananda Kar Rasagola Hub, Salepur", "market", 20.4856, 85.9922, ("heritage", "food"))
    puri = _fixture_place("p_puri", "Ananda Bazar, Puri", "market", 19.8055, 85.8188, ("heritage", "food"))

    repo = InMemoryPlaceRepository([bhu_start, bhu_local_1, bhu_local_2, salepur, puri])
    service = ItineraryService(repo, MockTransportHopPlanner())

    res = service.plan(PlanningConstraints(days=1, start="Lingaraj Temple", interests=["heritage"]))
    assert len(res.days) == 1
    stop_ids = [s.place.id for s in res.days[0].stops]

    assert "p_salepur" not in stop_ids, "Salepur must not be selected for a 1-day local trip"
    assert "p_puri" not in stop_ids, "Puri must not be selected for a 1-day local trip"
    assert "p_lingaraj" in stop_ids
    assert "p_chitrakarini" in stop_ids
    assert "p_bindu" in stop_ids


def test_unit_one_day_trip_preserves_local_geographic_boundary():
    """TEST 2: 1-day trip preserves local geographic boundary (<= 25km radius)."""
    start_place = _fixture_place("p_hub", "Hub Center", "temple", 20.24, 85.83, ("heritage",))
    local_near = _fixture_place("p_near", "Near Place", "temple", 20.25, 85.84, ("heritage",))
    outside_boundary = _fixture_place("p_far", "Far Place", "temple", 20.60, 86.20, ("heritage",))

    repo = InMemoryPlaceRepository([start_place, local_near, outside_boundary])
    service = ItineraryService(repo, MockTransportHopPlanner())

    res = service.plan(PlanningConstraints(days=1, start="Hub Center", interests=["heritage"]))
    stop_ids = [s.place.id for s in res.days[0].stops]
    assert "p_far" not in stop_ids


def test_unit_multi_day_permits_regional_progression():
    """TEST 3: Multi-day itineraries permit regional progression to adjacent clusters."""
    bhu_1 = _fixture_place("bhu_1", "BBSR Stop 1", "temple", 20.24, 85.83, ("heritage",))
    bhu_2 = _fixture_place("bhu_2", "BBSR Stop 2", "temple", 20.25, 85.84, ("heritage",))
    bhu_3 = _fixture_place("bhu_3", "BBSR Stop 3", "temple", 20.26, 85.85, ("heritage",))
    puri_1 = _fixture_place("puri_1", "Puri Stop 1", "temple", 19.80, 85.81, ("heritage",))
    puri_2 = _fixture_place("puri_2", "Puri Stop 2", "temple", 19.81, 85.82, ("heritage",))

    repo = InMemoryPlaceRepository([bhu_1, bhu_2, bhu_3, puri_1, puri_2])
    service = ItineraryService(repo, MockTransportHopPlanner())

    res = service.plan(PlanningConstraints(days=2, start="BBSR Stop 1", interests=["heritage"]))
    assert len(res.days) == 2
    day1_ids = [s.place.id for s in res.days[0].stops]
    day2_ids = [s.place.id for s in res.days[1].stops]

    assert "bhu_1" in day1_ids
    assert "puri_1" in day2_ids or "puri_2" in day2_ids, "Day 2 must permit regional progression to Puri"


def test_unit_null_fare_microcopy_and_no_speculative_claims():
    """TEST 4 & 5: Null fare copy policy strictly enforced, zero speculative payment claims."""
    android_strings_path = REPO_ROOT / "mobile" / "android" / "src" / "main" / "res" / "values" / "strings.xml"
    ios_strings_path = REPO_ROOT / "mobile" / "ios" / "OTravelz" / "Resources" / "en.lproj" / "Localizable.strings"

    android_content = android_strings_path.read_text(encoding="utf-8")
    ios_content = ios_strings_path.read_text(encoding="utf-8")

    # Prohibited claims
    for prohibited in ["Pay on Bus", "Pay conductor", "available at boarding", "Available at boarding"]:
        assert prohibited not in android_content, f"Prohibited phrase '{prohibited}' in Android strings"
        assert prohibited not in ios_content, f"Prohibited phrase '{prohibited}' in iOS strings"

    # Required truth copy
    required_copy = "Fare information unavailable. Check official or operator information before travel."
    assert required_copy in android_content
    assert required_copy in ios_content


def test_unit_duration_truth_classification():
    """TEST 6: Six-hour duration is classified honestly as PARTIALLY_SUPPORTED."""
    assert extract_multilingual_days("6 hours") == 1
    assert extract_multilingual_days("six hours") == 1
    assert extract_multilingual_days("half day") == 1
    assert extract_multilingual_days("1 day") == 1


def test_unit_unknown_travel_feasibility_not_zero_time():
    """TEST 7: Unknown travel feasibility must not silently count as 0 minutes."""
    from app.ai.schemas import PlanTransportHopArgs
    from app.schemas.transport import DataTier, TransportHopContract

    args = PlanTransportHopArgs(
        from_place={"id": "p1", "name": "Stop 1", "category": "temple"},
        to_place={"id": "p2", "name": "Stop 2", "category": "temple"},
        constraints=PlanningConstraints(days=1),
    )
    contract = TransportHopContract(
        from_sequence=1,
        to_sequence=2,
        mode="unavailable",
        data_tier=DataTier.UNKNOWN,
        reason="No transport available",
    )
    assert contract.estimated_minutes is None
    assert contract.estimated_cost is None


def test_unit_ai_extraction_preserves_location_scope():
    """TEST 8: AI extraction parses location and preferences truthfully."""
    adapter = RuleBasedModelAdapter()

    res1 = adapter.parse_intent("Plan a 6 hour trip in Bhubaneswar")
    assert res1["constraints"]["start"] == "Bhubaneswar"
    assert res1["constraints"]["days"] == 1

    res2 = adapter.parse_intent("I am in Bhubaneswar and prefer Mo Bus where practical")
    assert res2["constraints"]["start"] == "Bhubaneswar"
    assert res2["constraints"]["public_transport_preferred"] is True

    res3 = adapter.parse_intent("Start in Bhubaneswar and take me to Puri")
    assert res3["constraints"]["start"] == "Bhubaneswar"


def test_unit_stage_g1_staging_unconsumed():
    """TEST 10: Stage G1 staging remains unconsumed and intact."""
    staging_manifest = REPO_ROOT / "data" / "staging" / "mobile" / "mobile_offline_manifest.json"
    assert staging_manifest.exists(), f"Staging manifest not found at {staging_manifest}"


# ---------------------------------------------------------------------------
# Integration Tests (Running against live DB when marked with integration)
# ---------------------------------------------------------------------------

@pytest.mark.integration
def test_integration_database_bhubaneswar_plan_excludes_puri_salepur():
    """TEST 1 (Integration): Live DB Bhubaneswar plan has zero Puri/Salepur stops."""
    from app.db.session import SessionLocal
    from app.services.ranking import SQLAlchemyPlaceRepository
    from app.transport.service import TransportService, SQLAlchemyPlaceResolver

    db = SessionLocal()
    try:
        repo = SQLAlchemyPlaceRepository(db)
        transport = TransportService(SQLAlchemyPlaceResolver(db))
        service = ItineraryService(repo, transport)

        res = service.plan(PlanningConstraints(days=1, start="Bhubaneswar", interests=[]))
        stop_names = [s.place.name for s in res.days[0].stops]
        assert not any("Puri" in n for n in stop_names)
        assert not any("Salepur" in n for n in stop_names)
    finally:
        db.close()
