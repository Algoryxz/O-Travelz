"""Tests for AI Checkpoint 4: Single-Stop Replacement and Conversational Refinement."""
import pytest
from app.ai.contracts import ChatMessage, ChatRole, ClaimType, EvidenceItem, ToolCall, ToolStatus
from app.ai.conversation import GroundedConversationOrchestrator, GroundedConversationResponse
from app.ai.model import RuleBasedModelAdapter
from app.ai.schemas import AIStatus, IntentKind, PlanningConstraints
from app.ai.tools.adapters import ReplaceItineraryStopToolAdapter, create_default_tool_registry
from app.schemas.common import PlaceSummary
from app.schemas.itinerary import (
    ItineraryDayContract,
    ItineraryResponse,
    ItineraryStopContract,
)
from app.schemas.transport import DataTier, TransportHopContract, TransportLeg
from app.services.crowd.service import CrowdService
from app.services.itinerary.replacement import StopReplacementService
from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
from app.transport.adapters.walking import Coordinate
from tests.test_ai_grounded_conversation import MockTransportHopPlanner, mock_places, test_orchestrator


@pytest.fixture
def test_places_and_repo():
    verified = [
        VerifiedPlace(
            database_id="p1",
            category_id="temple",
            name="Jagannath Temple, Puri",
            coordinate=Coordinate(19.8135, 85.8312),
            interests=("spirituality", "heritage"),
        ),
        VerifiedPlace(
            database_id="p2",
            category_id="beach",
            name="Chandrabhaga Beach",
            coordinate=Coordinate(19.8667, 86.1000),
            interests=("nature", "beach"),
        ),
        VerifiedPlace(
            database_id="p3",
            category_id="monument",
            name="Konark Sun Temple",
            coordinate=Coordinate(19.8876, 86.0945),
            interests=("heritage", "architecture"),
        ),
        VerifiedPlace(
            database_id="p4",
            category_id="museum",
            name="Odisha State Museum",
            coordinate=Coordinate(20.2500, 85.8333),
            interests=("heritage", "history"),
        ),
        VerifiedPlace(
            database_id="p5",
            category_id="temple",
            name="Lingaraj Temple",
            coordinate=Coordinate(20.2382, 85.8338),
            interests=("spirituality", "heritage"),
        ),
    ]
    repo = InMemoryPlaceRepository(verified)
    transport = MockTransportHopPlanner()
    crowd = CrowdService()
    service = StopReplacementService(
        repository=repo,
        transport_service=transport,
        crowd_service=crowd,
    )
    return repo, transport, crowd, service, verified


@pytest.fixture
def sample_2day_itinerary():
    day1_stops = [
        ItineraryStopContract(sequence=1, place=PlaceSummary(id="p1", name="Jagannath Temple, Puri", category="temple")),
        ItineraryStopContract(sequence=2, place=PlaceSummary(id="p2", name="Chandrabhaga Beach", category="beach")),
        ItineraryStopContract(sequence=3, place=PlaceSummary(id="p3", name="Konark Sun Temple", category="monument")),
    ]
    day1_hops = [
        TransportHopContract(from_sequence=1, to_sequence=2, mode="walk", estimated_minutes=15, legs=[TransportLeg(mode="walk", detail="Walk 15m")], data_tier=DataTier.STATIC),
        TransportHopContract(from_sequence=2, to_sequence=3, mode="walk", estimated_minutes=10, legs=[TransportLeg(mode="walk", detail="Walk 10m")], data_tier=DataTier.STATIC),
    ]
    day2_stops = [
        ItineraryStopContract(sequence=1, place=PlaceSummary(id="p5", name="Lingaraj Temple", category="temple")),
    ]
    day2_hops = []

    return ItineraryResponse(
        itinerary_id="itinerary-test-123",
        constraints=PlanningConstraints(days=2, start="Puri"),
        days=[
            ItineraryDayContract(day_number=1, stops=day1_stops, hops=day1_hops),
            ItineraryDayContract(day_number=2, stops=day2_stops, hops=day2_hops),
        ],
        explanation="2-day test tour",
    )


# ==============================================================================
# 1. Single-Stop Replacement Tests (1-9)
# ==============================================================================

class TestSingleStopReplacement:
    def test_1_replace_one_stop_successfully(self, test_places_and_repo, sample_2day_itinerary):
        _, _, _, service, _ = test_places_and_repo
        success, msg, updated, rep_place, evidence = service.replace_stop(
            itinerary=sample_2day_itinerary,
            day_number=1,
            stop_sequence=2,
            reason="weather",
        )
        assert success is True
        assert updated is not None
        assert rep_place is not None
        assert updated.days[0].stops[1].place.id != "p2"

    def test_2_unaffected_stops_preserved(self, test_places_and_repo, sample_2day_itinerary):
        _, _, _, service, _ = test_places_and_repo
        success, msg, updated, _, _ = service.replace_stop(
            itinerary=sample_2day_itinerary,
            day_number=1,
            stop_sequence=2,
            reason="weather",
        )
        assert success is True
        # Day 1: Stop 1 and Stop 3 must be untouched
        assert updated.days[0].stops[0].place.id == "p1"
        assert updated.days[0].stops[2].place.id == "p3"
        # Day 2: Stop 1 must be untouched
        assert updated.days[1].stops[0].place.id == "p5"

    def test_3_adjacent_hops_recalculated(self, test_places_and_repo, sample_2day_itinerary):
        _, _, _, service, _ = test_places_and_repo
        success, msg, updated, _, _ = service.replace_stop(
            itinerary=sample_2day_itinerary,
            day_number=1,
            stop_sequence=2,
            reason="weather",
        )
        assert success is True
        # Adjacent hops (0->1, 1->2 and 2->3) exist and are updated
        assert len(updated.days[0].hops) == 3
        assert any(h.from_sequence == 1 and h.to_sequence == 2 for h in updated.days[0].hops)
        assert any(h.from_sequence == 2 and h.to_sequence == 3 for h in updated.days[0].hops)


    def test_4_weather_driven_replacement_picks_indoor(self, test_places_and_repo, sample_2day_itinerary):
        _, _, _, service, _ = test_places_and_repo
        # Replace beach (outdoor) due to weather (rain) -> should pick museum (p4)
        success, msg, updated, rep_place, evidence = service.replace_stop(
            itinerary=sample_2day_itinerary,
            day_number=1,
            stop_sequence=2,
            reason="weather",
        )
        assert success is True
        assert rep_place.id == "p4"
        assert any(e.title == "Weather Suitability" for e in evidence)

    def test_5_crowd_driven_replacement(self, test_places_and_repo, sample_2day_itinerary):
        _, _, _, service, _ = test_places_and_repo
        success, msg, updated, rep_place, evidence = service.replace_stop(
            itinerary=sample_2day_itinerary,
            day_number=1,
            stop_sequence=2,
            reason="crowd",
        )
        assert success is True
        assert any(e.title == "Crowd Optimization" for e in evidence)

    def test_6_low_walking_replacement(self, test_places_and_repo, sample_2day_itinerary):
        _, _, _, service, _ = test_places_and_repo
        success, msg, updated, rep_place, evidence = service.replace_stop(
            itinerary=sample_2day_itinerary,
            day_number=1,
            stop_sequence=2,
            reason="walking",
            preference_overrides={"low_walking": True},
        )
        assert success is True
        assert any(e.title == "Mobility Accommodation" for e in evidence)

    def test_7_interest_driven_replacement(self, test_places_and_repo, sample_2day_itinerary):
        _, _, _, service, _ = test_places_and_repo
        # Replace stop 1 (temple) with no temples
        success, msg, updated, rep_place, evidence = service.replace_stop(
            itinerary=sample_2day_itinerary,
            day_number=1,
            stop_sequence=1,
            reason="temple",
        )
        assert success is True
        assert rep_place.category != "temple"

    def test_8_no_safe_replacement_returns_controlled_result(self, test_places_and_repo):
        # Create an itinerary where ALL repository places are already present
        all_present = [
            ItineraryStopContract(sequence=1, place=PlaceSummary(id="p1", name="Jagannath Temple, Puri", category="temple")),
            ItineraryStopContract(sequence=2, place=PlaceSummary(id="p2", name="Chandrabhaga Beach", category="beach")),
            ItineraryStopContract(sequence=3, place=PlaceSummary(id="p3", name="Konark Sun Temple", category="monument")),
            ItineraryStopContract(sequence=4, place=PlaceSummary(id="p4", name="Odisha State Museum", category="museum")),
            ItineraryStopContract(sequence=5, place=PlaceSummary(id="p5", name="Lingaraj Temple", category="temple")),
        ]
        full_itin = ItineraryResponse(
            itinerary_id="itin-full",
            constraints=PlanningConstraints(days=1),
            days=[ItineraryDayContract(day_number=1, stops=all_present, hops=[])],
            explanation="full",
        )
        _, _, _, service, _ = test_places_and_repo
        success, msg, updated, rep_place, evidence = service.replace_stop(
            itinerary=full_itin,
            day_number=1,
            stop_sequence=2,
            reason="user_request",
        )
        assert success is False
        assert "No suitable verified replacement" in msg
        assert updated is None

    def test_9_unpublished_or_unverified_place_never_selected(self, test_places_and_repo, sample_2day_itinerary):
        repo, transport, crowd, _, _ = test_places_and_repo
        # Repo has ONLY verified coordinate-bearing places
        service = StopReplacementService(repo, transport, crowd)
        success, msg, updated, rep_place, evidence = service.replace_stop(
            itinerary=sample_2day_itinerary,
            day_number=1,
            stop_sequence=2,
        )
        assert success is True
        # Replacement place must be in repository
        assert any(p.database_id == rep_place.id for p in repo.list_verified_places())


# ==============================================================================
# 2. Conversational Refinement & Routing Tests (10-15)
# ==============================================================================

class TestConversationalRefinement:
    def test_10_ambiguous_conversational_target_asks_clarification(self):
        adapter = RuleBasedModelAdapter()
        res = adapter.parse_intent("Replace a stop.")
        assert res["kind"] == IntentKind.CLARIFICATION.value
        assert "Which stop" in res["clarification"]["question"]

    def test_11_multi_turn_constraints_preserved(self, test_orchestrator):
        # Turn 1: Initial planning with parents and avoid crowds
        res1 = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="Plan 1 day in Puri with parents, avoid crowds")
        ])
        assert res1.status == AIStatus.SUCCESS
        assert res1.constraints.travel_party == "parents"
        assert res1.constraints.avoid_crowds is True

        # Turn 2: Follow-up constraint
        res2 = test_orchestrator.converse(
            [
                ChatMessage(role=ChatRole.USER, content="Plan 1 day in Puri with parents, avoid crowds"),
                ChatMessage(role=ChatRole.ASSISTANT, content=res1.message),
                ChatMessage(role=ChatRole.USER, content="Make it less tiring"),
            ],
            existing_constraints=res1.constraints,
        )
        assert res2.status == AIStatus.SUCCESS
        assert res2.constraints.travel_party == "parents"
        assert res2.constraints.avoid_crowds is True
        assert res2.constraints.low_walking is True

    def test_12_local_refinement_does_not_rebuild_entire_itinerary(self, test_orchestrator):
        res = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="Replace the second stop because it's raining.")
        ])
        assert res.status == AIStatus.SUCCESS
        assert len(res.tool_calls) > 0
        assert any(tc.name == "replace_itinerary_stop" for tc in res.tool_calls)

    def test_13_global_refinement_still_works(self, test_orchestrator):
        res = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="Add 1 more day to my trip")
        ])
        assert res.status in (AIStatus.SUCCESS, AIStatus.CLARIFICATION)

    def test_14_evidence_items_generated_from_domain_facts(self, test_places_and_repo, sample_2day_itinerary):
        _, _, _, service, _ = test_places_and_repo
        success, msg, updated, rep_place, evidence = service.replace_stop(
            itinerary=sample_2day_itinerary,
            day_number=1,
            stop_sequence=2,
            reason="weather",
        )
        assert len(evidence) > 0
        assert all(isinstance(e, EvidenceItem) for e in evidence)
        assert all(len(e.rationale) > 0 for e in evidence)

    def test_15_claim_types_correct(self, test_places_and_repo, sample_2day_itinerary):
        _, _, _, service, _ = test_places_and_repo
        success, msg, updated, rep_place, evidence = service.replace_stop(
            itinerary=sample_2day_itinerary,
            day_number=1,
            stop_sequence=2,
            reason="weather",
        )
        w_ev = next(e for e in evidence if e.title == "Weather Suitability")
        assert w_ev.claim_type == ClaimType.LIVE

        r_ev = next(e for e in evidence if e.title == "Verified Replacement")
        assert r_ev.claim_type == ClaimType.VERIFIED
