from datetime import date

from fastapi.testclient import TestClient

from app.ai.model import FakeModelAdapter
from app.ai.orchestrator import AIOrchestrator
from app.ai.grounding import GroundingBoundary, GroundingContext, GroundingFact
from app.ai.schemas import ModelResponse
from app.ai.tools import BuildItineraryTool, GetProviderStatusTool, PlanTransportHopTool
from app.ai.tools.common import ToolStatus
from app.api.ai_routes import get_ai_orchestrator
from app.main import app
from app.schemas.common import PlaceSummary, PlanningConstraints
from app.schemas.transport import DataTier, TransportHopContract
from app.services.itinerary import ItineraryService
from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
from app.transport.adapters.walking import Coordinate
from app.transport.service import ProviderNotAvailableError


class RecordingTransport:
    def __init__(self, *, unavailable=False, unknown=False):
        self.calls = []
        self.unavailable = unavailable
        self.unknown = unknown

    def plan_transport_hop(self, args):
        self.calls.append(args)
        if self.unavailable:
            return TransportHopContract(
                from_sequence=args.from_sequence,
                to_sequence=args.to_sequence,
                mode="unavailable",
                data_tier=DataTier.UNKNOWN,
                reason="No supported transport route is available.",
            )
        return TransportHopContract(
            from_sequence=args.from_sequence,
            to_sequence=args.to_sequence,
            mode="walk",
            estimated_minutes=None if self.unknown else 7,
            estimated_cost=None,
            data_tier=DataTier.UNKNOWN if self.unknown else DataTier.STATIC,
            legs=[{"mode": "walk", "detail": "Verified walking fallback"}],
        )

    def get_provider_status(self, args):
        raise ProviderNotAvailableError(f"Provider '{args.provider_id}' is unknown.")


def _repository(count=2, include_start=False):
    places = [
            VerifiedPlace(
                database_id=f"place-{index}",
                category_id="heritage",
                name=f"Heritage Place {index}",
                coordinate=Coordinate(20, 85 + index / 1000),
            )
            for index in range(1, count + 1)
        ]
    if include_start:
        places.insert(
            0,
            VerifiedPlace(
                database_id="origin",
                category_id="hotel",
                name="Origin Hotel",
                coordinate=Coordinate(20, 85),
            ),
        )
    return InMemoryPlaceRepository(places)


def _orchestrator(model, transport=None, count=2, include_start=False):
    transport = transport or RecordingTransport()
    service = ItineraryService(_repository(count, include_start), transport)
    return AIOrchestrator(
        model,
        build_itinerary=BuildItineraryTool(service),
        plan_transport_hop=PlanTransportHopTool(transport),
        get_provider_status=GetProviderStatusTool(transport),
    ), transport


def _planning_intent(days=2, interests=None):
    return {
        "kind": "planning",
        "constraints": {"days": days, "interests": interests or ["heritage"]},
        "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
    }


def test_transcript_initial_itinerary_uses_canonical_response_and_grounded_facts():
    model = FakeModelAdapter(
        intent=_planning_intent(),
        final_response={
            "message": "Here is your grounded itinerary.",
            "claims": [{"fact_id": "itinerary.summary", "value": {"days": 2, "stops": 2}}],
        },
    )
    orchestrator, transport = _orchestrator(model)

    response = orchestrator.orchestrate("I want a 2 day heritage trip.")

    assert response.status == "success"
    assert response.itinerary is not None
    assert response.itinerary.__class__.__name__ == "ItineraryResponse"
    assert response.itinerary.explanation == ""
    assert "2-day itinerary" in response.message
    assert len(transport.calls) == 1


def test_transcript_refinement_replans_with_validated_constraint_update():
    initial_model = FakeModelAdapter(intent=_planning_intent(), final_response={"message": "Initial plan."})
    initial, _ = _orchestrator(initial_model)
    initial_response = initial.orchestrate("I want a 2 day heritage trip.")

    transport = RecordingTransport()
    refinement_model = FakeModelAdapter(
        intent={
            "kind": "refinement",
            "constraint_update": {"interests": ["food"]},
            "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
        },
        final_response={"message": "Food-focused plan."},
    )
    refinement, _ = _orchestrator(refinement_model, transport)
    response = refinement.orchestrate("Make it more food focused.", initial_response.itinerary.constraints)

    assert response.status == "success"
    assert response.changed_constraints.interests == ["food"]
    assert response.itinerary.constraints.interests == ["food"]
    assert initial_response.itinerary.constraints.interests == ["heritage"]
    assert transport.calls[0].constraints.interests == ["food"]


def test_dates_refinement_is_passed_to_deterministic_service():
    model = FakeModelAdapter(
        intent={
            "kind": "refinement",
            "constraint_update": {"dates": ["2026-09-10"]},
            "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
        },
        final_response={"framing": "grounded_result", "claims": []},
    )
    orchestrator, transport = _orchestrator(model)

    response = orchestrator.orchestrate(
        "Move the trip date.",
        PlanningConstraints(days=1, interests=["heritage"], dates=[date(2026, 9, 1)]),
    )

    assert response.status == "success"
    assert response.changed_constraints.dates == [date(2026, 9, 10)]
    assert transport.calls[0].constraints.dates == [date(2026, 9, 10)]


def test_start_refinement_is_resolved_by_deterministic_service():
    model = FakeModelAdapter(
        intent={
            "kind": "refinement",
            "constraint_update": {"start": "Origin Hotel"},
            "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
        },
        final_response={"framing": "grounded_result", "claims": []},
    )
    orchestrator, transport = _orchestrator(model, include_start=True)

    response = orchestrator.orchestrate(
        "Start from the hotel.",
        PlanningConstraints(days=1, interests=["heritage"]),
    )

    assert response.status == "success"
    assert response.changed_constraints.start == "Origin Hotel"
    assert transport.calls[0].from_place.id == "origin"


def test_pace_and_transport_budget_refinements_are_unsupported():
    for update in ({"pace": "slow"}, {"budget_transport_per_day": 100}):
        model = FakeModelAdapter(
            intent={
                "kind": "refinement",
                "constraint_update": update,
                "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
            }
        )
        orchestrator, transport = _orchestrator(model)

        response = orchestrator.orchestrate(
            "Apply this preference.",
            PlanningConstraints(days=1, interests=["heritage"]),
        )

        assert response.status == "unsupported"
        assert not transport.calls


def test_transcript_unsupported_walking_preference_does_not_mutate_constraints():
    model = FakeModelAdapter(
        intent={"kind": "unsupported", "reason": "The current planner cannot optimize walking distance yet."}
    )
    orchestrator, transport = _orchestrator(model)

    response = orchestrator.orchestrate(
        "Make it involve less walking.",
        PlanningConstraints(days=2, interests=["heritage"]),
    )

    assert response.status == "unsupported"
    assert response.itinerary is None
    assert "walking" in response.message
    assert not transport.calls


def test_transcript_unavailable_transport_is_explained_without_invented_values():
    transport = RecordingTransport(unavailable=True)
    model = FakeModelAdapter(
        intent=_planning_intent(days=1),
        final_response={
            "message": "There is a bus available.",
            "claims": [
                {
                    "fact_id": "transport.day1.1.2",
                    "value": {
                        "mode": "unavailable",
                        "estimated_minutes": None,
                        "estimated_cost": None,
                        "data_tier": "unknown",
                        "reason": "No supported transport route is available.",
                    },
                }
            ],
        },
    )
    orchestrator, _ = _orchestrator(model, transport)

    response = orchestrator.orchestrate("I want a 1 day heritage trip.")

    assert "unavailable" in response.message
    assert "No supported transport route is available." in response.message
    assert "minutes" not in response.message
    assert "cost" not in response.message
    assert "bus" not in response.message


def test_transcript_unknown_transport_values_preserve_uncertainty():
    transport = RecordingTransport(unknown=True)
    model = FakeModelAdapter(
        intent=_planning_intent(days=1),
        final_response={
            "message": "The fare is $5 and the trip takes 42 minutes.",
            "claims": [
                {
                    "fact_id": "transport.day1.1.2",
                    "value": {
                        "mode": "walk",
                        "estimated_minutes": None,
                        "estimated_cost": None,
                        "data_tier": "unknown",
                        "reason": None,
                    },
                }
            ],
        },
    )
    orchestrator, _ = _orchestrator(model, transport)

    response = orchestrator.orchestrate("I want a 1 day heritage trip.")

    assert "unknown" in response.message
    assert "minute" not in response.message
    assert "$" not in response.message


def test_hallucinated_message_without_claim_cannot_bypass_grounding():
    model = FakeModelAdapter(
        intent=_planning_intent(days=1),
        final_response={"message": "The secret beach is open today.", "claims": []},
    )
    orchestrator, _ = _orchestrator(model)

    response = orchestrator.orchestrate("I want a 1 day heritage trip.")

    assert "secret beach" not in response.message
    assert response.message == "Here is the grounded result."


def test_hallucinated_message_cannot_bypass_a_valid_claim():
    model = FakeModelAdapter(
        intent=_planning_intent(days=1),
        final_response={
            "message": "The secret beach is open today.",
            "claims": [{"fact_id": "itinerary.summary", "value": {"days": 1, "stops": 2}}],
        },
    )
    orchestrator, _ = _orchestrator(model)

    response = orchestrator.orchestrate("I want a 1 day heritage trip.")

    assert "secret beach" not in response.message
    assert "1-day itinerary" in response.message


def test_unknown_provider_status_cannot_be_rendered_as_live():
    model = FakeModelAdapter(
        intent={
            **_planning_intent(days=1),
            "tool_calls": [
                {"name": "build_itinerary", "arguments": {}},
                {"name": "get_provider_status", "arguments": {"provider_id": "missing"}},
            ],
        },
        final_response={
            "message": "This provider is currently live.",
            "claims": [
                {
                    "fact_id": "tool.get_provider_status.status",
                    "value": {"status": "unknown", "reason": "Provider 'missing' is unknown."},
                }
            ],
        },
    )
    orchestrator, _ = _orchestrator(model)

    response = orchestrator.orchestrate("Check the provider.")

    assert "currently live" not in response.message
    assert "status is unknown" in response.message


def test_transcript_hallucinated_claim_is_suppressed_by_current_turn_grounding():
    model = FakeModelAdapter(
        intent=_planning_intent(days=1),
        final_response={
            "message": "Only grounded claims should appear.",
            "claims": [
                {"fact_id": "itinerary.summary", "value": {"days": 1, "stops": 2}},
                {"fact_id": "invented.secret_beach", "value": "The secret beach is open today."},
            ],
        },
    )
    orchestrator, _ = _orchestrator(model)

    response = orchestrator.orchestrate("I want a 1 day heritage trip.")

    assert "secret beach" not in response.message
    assert "1-day itinerary" in response.message


def test_stale_turn_fact_is_rejected_by_a_fresh_grounding_context():
    turn_one = GroundingContext()
    turn_one.facts["itinerary.stop.old"] = GroundingFact(
        "itinerary.stop.old", "Old Museum", "It includes Old Museum."
    )
    turn_two = GroundingContext()

    response = GroundingBoundary().ground(
        ModelResponse(claims=[{"fact_id": "itinerary.stop.old", "value": "Old Museum"}]),
        turn_two,
    )

    assert "Old Museum" not in response
    assert "grounded result" in response


def test_model_adapter_exceptions_become_explicit_ai_errors():
    class ExplodingModel(FakeModelAdapter):
        def parse_intent(self, user_message, existing_constraints=None):
            raise RuntimeError("provider unavailable")

    orchestrator, transport = _orchestrator(ExplodingModel())
    response = orchestrator.orchestrate("I want a trip.")

    assert response.status == "error"
    assert "model adapter failed" in response.message
    assert not transport.calls


def test_model_receives_isolated_grounding_snapshot():
    class MutatingModel(FakeModelAdapter):
        def generate_response(self, context):
            context.facts["injected.fact"] = GroundingFact(
                "injected.fact", "Injected", "Injected fact."
            )
            return {"claims": [{"fact_id": "injected.fact", "value": "Injected"}]}

    orchestrator, _ = _orchestrator(MutatingModel(intent=_planning_intent(days=1)))
    response = orchestrator.orchestrate("I want a 1 day heritage trip.")

    assert "Injected" not in response.message


def test_generate_response_exception_becomes_explicit_ai_error():
    class ExplodingResponseModel(FakeModelAdapter):
        def generate_response(self, context):
            raise RuntimeError("provider unavailable")

    orchestrator, _ = _orchestrator(
        ExplodingResponseModel(intent=_planning_intent(days=1))
    )
    response = orchestrator.orchestrate("I want a 1 day heritage trip.")

    assert response.status == "error"
    assert "model adapter failed" in response.message


def test_invalid_model_output_becomes_explicit_ai_error():
    model = FakeModelAdapter(
        intent={
            **_planning_intent(days=1),
            "unexpected_model_field": True,
        }
    )
    orchestrator, transport = _orchestrator(model)

    response = orchestrator.orchestrate("I want a 1 day heritage trip.")

    assert response.status == "error"
    assert "invalid structured intent" in response.message
    assert not transport.calls


def test_tool_adapters_normalize_unavailable_and_unknown_provider_results():
    transport = RecordingTransport(unavailable=True)
    hop_tool = PlanTransportHopTool(transport)
    hop = hop_tool.execute(
        {
            "from_place": PlaceSummary(id="from", name="From", category="place"),
            "to_place": PlaceSummary(id="to", name="To", category="place"),
            "constraints": {"days": 1},
        }
    )

    assert hop.status is ToolStatus.UNAVAILABLE
    assert hop.data.mode == "unavailable"
    assert hop.data.estimated_minutes is None
    assert hop.data.estimated_cost is None


def test_ai_http_route_returns_small_envelope_with_canonical_itinerary(monkeypatch):
    model = FakeModelAdapter(intent=_planning_intent(days=1), final_response={"message": "Grounded HTTP plan."})
    orchestrator, _ = _orchestrator(model)
    app.dependency_overrides[get_ai_orchestrator] = lambda: orchestrator
    try:
        response = TestClient(app).post("/ai/plan", json={"message": "I want a 1 day heritage trip."})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["itinerary"]["explanation"] == ""
    assert set(body) == {"message", "itinerary", "clarification", "status", "changed_constraints"}
