"""Regression and unit tests for Itinerary Service Georesilience and Origin Resolution."""
from datetime import date
import pytest

from app.schemas.common import PlanningConstraints
from app.transport.adapters.walking import Coordinate
from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
from app.services.itinerary.service import ItineraryPlanningError, ItineraryService


class MockTransportService:
    def plan_transport_hop(self, args):
        from app.schemas.transport import DataTier, TransportHopContract
        return TransportHopContract(
            from_sequence=args.from_sequence,
            to_sequence=args.to_sequence,
            mode="transit",
            estimated_minutes=30,
            estimated_cost=20.0,
            data_tier=DataTier.STATIC,
        )


def _sample_places() -> list[VerifiedPlace]:
    return [
        VerifiedPlace(
            database_id="p1",
            category_id="temple",
            name="Lingaraj Temple",
            research_id="place_bbsr_001",
            coordinate=Coordinate(20.2382, 85.8338),
            opening_hours=None,
            avg_visit_minutes=60,
            price_tier=0,
            interests=("heritage", "temple"),
        ),
        VerifiedPlace(
            database_id="p2",
            category_id="beach",
            name="Puri Golden Beach",
            research_id="place_puri_001",
            coordinate=Coordinate(19.7983, 85.8249),
            opening_hours=None,
            avg_visit_minutes=90,
            price_tier=0,
            interests=("beach", "coastal"),
        ),
        VerifiedPlace(
            database_id="p3",
            category_id="heritage",
            name="Konark Sun Temple",
            research_id="place_konark_001",
            coordinate=Coordinate(19.8876, 86.0945),
            opening_hours=None,
            avg_visit_minutes=120,
            price_tier=1,
            interests=("heritage", "monument"),
        ),
        VerifiedPlace(
            database_id="p4",
            category_id="cave",
            name="Gupteswar Cave Temple, Koraput",
            research_id="place_koraput_001",
            coordinate=Coordinate(18.8167, 82.5500),
            opening_hours=None,
            avg_visit_minutes=90,
            price_tier=0,
            interests=("temple", "nature"),
        ),
        VerifiedPlace(
            database_id="p5",
            category_id="temple",
            name="Samaleswari Temple, Sambalpur",
            research_id="place_sambalpur_001",
            coordinate=Coordinate(21.4667, 83.9667),
            opening_hours=None,
            avg_visit_minutes=60,
            price_tier=0,
            interests=("temple", "heritage"),
        ),
    ]


def test_itinerary_planning_with_valid_coordinates():
    repo = InMemoryPlaceRepository(_sample_places())
    service = ItineraryService(repository=repo, transport_service=MockTransportService())

    constraints = PlanningConstraints(
        days=2,
        pace="moderate",
        interests=["heritage", "beach"],
        start=None,
    )
    result = service.plan(constraints)
    assert len(result.days) == 2
    assert len(result.days[0].stops) > 0
    assert result.days[0].stops[0].place.name in ["Lingaraj Temple", "Puri Golden Beach", "Konark Sun Temple"]


def test_itinerary_origin_alias_resolution():
    repo = InMemoryPlaceRepository(_sample_places())
    service = ItineraryService(repository=repo, transport_service=MockTransportService())

    # Test start origin alias for Bhubaneswar
    constraints_bbsr = PlanningConstraints(
        days=1,
        pace="moderate",
        interests=[],
        start="Bhubaneswar",
    )
    result_bbsr = service.plan(constraints_bbsr)
    assert service._resolve_start("Bhubaneswar").name == "Lingaraj Temple"
    assert len(result_bbsr.days) == 1
    assert len(result_bbsr.days[0].hops) >= 1
    assert result_bbsr.days[0].hops[0].from_sequence == 0
    assert result_bbsr.days[0].hops[0].to_sequence == 1

    # Test start origin alias for Koraput
    constraints_koraput = PlanningConstraints(
        days=1,
        pace="moderate",
        interests=[],
        start="Koraput",
    )
    result_koraput = service.plan(constraints_koraput)
    assert service._resolve_start("Koraput").name == "Gupteswar Cave Temple, Koraput"
    assert result_koraput.days[0].hops[0].from_sequence == 0


def test_itinerary_no_feasible_candidates_structured_diagnostic():
    # Empty repository
    repo = InMemoryPlaceRepository([])
    service = ItineraryService(repository=repo, transport_service=MockTransportService())

    constraints = PlanningConstraints(days=1, pace="moderate")
    with pytest.raises(ItineraryPlanningError) as exc_info:
        service.plan(constraints)
    assert exc_info.value.code == "no_feasible_candidates"
    assert "No verified coordinate-bearing places" in exc_info.value.message
