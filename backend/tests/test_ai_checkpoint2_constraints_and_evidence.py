from app.ai.contracts import ChatMessage, ChatRole, ClaimType, EvidenceItem
from app.ai.conversation import GroundedConversationOrchestrator, GroundedConversationResponse
from app.ai.model import RuleBasedModelAdapter
from app.ai.multilingual import extract_multilingual_preferences
from app.ai.schemas import AIIntent, AIStatus, IntentKind, PlanningConstraints
from tests.test_ai_grounded_conversation import mock_places, test_orchestrator


class TestStructuredPreferenceExtraction:
    """Requirement 1-10: Single and multi-preference extraction across English, Hindi, and Odia."""

    def test_1_avoid_crowds_extraction(self):
        adapter = RuleBasedModelAdapter()
        res = adapter.parse_intent("Plan 2 days in Puri and avoid crowds")
        assert res["kind"] == IntentKind.PLANNING.value
        constraints = res["constraints"]
        assert constraints.get("avoid_crowds") is True
        assert constraints.get("days") == 2
        assert constraints.get("start") == "Puri"

    def test_2_low_walking_extraction(self):
        adapter = RuleBasedModelAdapter()
        res = adapter.parse_intent("Plan 3 days in Bhubaneswar with not much walking")
        assert res["kind"] == IntentKind.PLANNING.value
        constraints = res["constraints"]
        assert constraints.get("low_walking") is True
        assert constraints.get("days") == 3

    def test_3_vegetarian_extraction(self):
        adapter = RuleBasedModelAdapter()
        res = adapter.parse_intent("Plan a 2 day trip in Puri with pure vegetarian food")
        assert res["kind"] == IntentKind.PLANNING.value
        constraints = res["constraints"]
        assert constraints.get("vegetarian") is True

    def test_4_budget_conscious_extraction(self):
        adapter = RuleBasedModelAdapter()
        res = adapter.parse_intent("Cheap 2 days trip to Konark on a budget")
        assert res["kind"] == IntentKind.PLANNING.value
        constraints = res["constraints"]
        assert constraints.get("budget_conscious") is True

    def test_5_public_transport_preferred_extraction(self):
        adapter = RuleBasedModelAdapter()
        res = adapter.parse_intent("Plan 2 days in Cuttack prefer bus and public transport")
        assert res["kind"] == IntentKind.PLANNING.value
        constraints = res["constraints"]
        assert constraints.get("public_transport_preferred") is True

    def test_6_travel_party_parents_extraction(self):
        adapter = RuleBasedModelAdapter()
        res = adapter.parse_intent("2 days in Puri with my parents")
        assert res["kind"] == IntentKind.PLANNING.value
        constraints = res["constraints"]
        assert constraints.get("travel_party") == "parents"

    def test_7_travel_party_family_extraction(self):
        adapter = RuleBasedModelAdapter()
        res = adapter.parse_intent("Plan 3 days family trip to Chilika")
        assert res["kind"] == IntentKind.PLANNING.value
        constraints = res["constraints"]
        assert constraints.get("travel_party") == "family"

    def test_8_multiple_preferences_in_one_sentence(self):
        """Sentence: 2 days in Puri with my parents, vegetarian, cheap, not much walking and avoid crowds"""
        adapter = RuleBasedModelAdapter()
        query = "2 days in Puri with my parents, vegetarian, cheap, not much walking and avoid crowds"
        res = adapter.parse_intent(query)
        assert res["kind"] == IntentKind.PLANNING.value
        constraints = res["constraints"]
        assert constraints["days"] == 2
        assert constraints["start"] == "Puri"
        assert constraints["avoid_crowds"] is True
        assert constraints["low_walking"] is True
        assert constraints["vegetarian"] is True
        assert constraints["budget_conscious"] is True
        assert constraints["travel_party"] == "parents"

    def test_9_hindi_preference_extraction(self):
        adapter = RuleBasedModelAdapter()
        query = "पुरी में 2 दिन की यात्रा, माता-पिता के साथ, शाकाहारी भोजन, कम खर्च, कम चलना और भीड़ से बचें"
        res = adapter.parse_intent(query)
        assert res["kind"] == IntentKind.PLANNING.value
        constraints = res["constraints"]
        assert constraints["days"] == 2
        assert constraints["avoid_crowds"] is True
        assert constraints["low_walking"] is True
        assert constraints["vegetarian"] is True
        assert constraints["budget_conscious"] is True
        assert constraints["travel_party"] == "parents"

    def test_10_odia_preference_extraction(self):
        adapter = RuleBasedModelAdapter()
        query = "ପୁରୀରେ ୨ ଦିନର ଯାତ୍ରା, ବାପା ମାଆଙ୍କ ସହିତ, ନିରାମିଷ ଖାଦ୍ୟ, ଶସ୍ତା, କମ୍ ଚାଲିବା ଏବଂ ଭିଡ଼ କମ"
        res = adapter.parse_intent(query)
        assert res["kind"] == IntentKind.PLANNING.value
        constraints = res["constraints"]
        assert constraints["days"] == 2
        assert constraints["avoid_crowds"] is True
        assert constraints["low_walking"] is True
        assert constraints["vegetarian"] is True
        assert constraints["budget_conscious"] is True
        assert constraints["travel_party"] == "parents"


class TestRefinementStatePreservation:
    """Requirement 11-12: Multi-turn constraint refinement and state preservation."""

    def test_11_preserve_old_constraint_and_add_new(self, test_orchestrator):
        """Turn 1: Plan Puri 2 days with low walking -> Turn 2: Also avoid crowds."""
        # Turn 1
        res1 = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="Plan Puri for 2 days with low walking")
        ])
        assert res1.status == AIStatus.SUCCESS
        assert res1.itinerary is not None
        assert res1.constraints.low_walking is True

        # Turn 2
        current_constraints = res1.constraints
        res2 = test_orchestrator.converse(
            [ChatMessage(role=ChatRole.USER, content="Also avoid crowds")],
            existing_constraints=current_constraints,
        )
        assert res2.status == AIStatus.SUCCESS
        assert res2.itinerary is not None
        assert res2.changed_constraints is not None
        assert res2.changed_constraints.low_walking is True
        assert res2.changed_constraints.avoid_crowds is True
        assert res2.changed_constraints.days == 2

    def test_12_multi_turn_accumulating_refinements(self, test_orchestrator):
        """Accumulate multiple preferences across 3 turns without resetting."""
        # Turn 1: 3 days in Puri vegetarian
        res1 = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="3 days in Puri with vegetarian food")
        ])
        assert res1.constraints.vegetarian is True
        assert res1.constraints.days == 3

        # Turn 2: budget conscious
        res2 = test_orchestrator.converse(
            [ChatMessage(role=ChatRole.USER, content="Make it budget friendly and cheap")],
            existing_constraints=res1.constraints,
        )
        assert res2.changed_constraints.vegetarian is True
        assert res2.changed_constraints.budget_conscious is True
        assert res2.changed_constraints.days == 3

        # Turn 3: with parents
        res3 = test_orchestrator.converse(
            [ChatMessage(role=ChatRole.USER, content="Travelling with my parents")],
            existing_constraints=res2.changed_constraints,
        )
        assert res3.changed_constraints.vegetarian is True
        assert res3.changed_constraints.budget_conscious is True
        assert res3.changed_constraints.travel_party == "parents"
        assert res3.changed_constraints.days == 3


class TestCompatibilityPreservation:
    """Requirement 13-15: Standard planning, search, and transit requests remain untouched."""

    def test_13_old_planning_behavior_unchanged(self, test_orchestrator):
        res = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="Plan a 2 day trip to Puri with heritage")
        ])
        assert res.status == AIStatus.SUCCESS
        assert res.itinerary is not None
        assert len(res.itinerary.days) == 2
        assert res.constraints.days == 2
        assert "heritage" in res.constraints.interests
        assert res.constraints.avoid_crowds is None

    def test_14_old_search_behavior_unchanged(self, test_orchestrator):
        res = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="Show me temples in Puri")
        ])
        assert res.status == AIStatus.SUCCESS
        assert len(res.places) > 0 or res.itinerary is not None

    def test_15_old_transport_behavior_unchanged(self, test_orchestrator):
        res = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="Check transit status for ama bus")
        ])
        assert res.status == AIStatus.SUCCESS
        assert len(res.provider_status) > 0 or "status" in res.message.lower()


class TestContractsAndEvidenceSerialization:
    """Requirement 16-18: ClaimType, EvidenceItem, and GroundedConversationResponse serialization."""

    def test_16_claim_type_serialization(self):
        assert ClaimType.VERIFIED.value == "verified"
        assert ClaimType.SCHEDULED.value == "scheduled"
        assert ClaimType.LIVE.value == "live"
        assert ClaimType.ESTIMATED.value == "estimated"
        assert ClaimType.RESEARCHED.value == "researched"
        assert ClaimType.UNKNOWN.value == "unknown"

    def test_17_evidence_item_serialization(self):
        item = EvidenceItem(
            title="Verified 2-Day Route",
            rationale="1.4 km from previous stop with verified opening hours",
            claim_type=ClaimType.VERIFIED,
            source="itinerary_service:deterministic_sequencing",
            confidence="high",
        )
        dumped = item.model_dump(mode="json")
        assert dumped["title"] == "Verified 2-Day Route"
        assert dumped["claim_type"] == "verified"
        assert dumped["source"] == "itinerary_service:deterministic_sequencing"
        assert dumped["confidence"] == "high"

        # Re-parse
        parsed = EvidenceItem.model_validate(dumped)
        assert parsed.claim_type == ClaimType.VERIFIED

    def test_18_grounded_conversation_response_serialization_with_and_without_evidence(self, test_orchestrator):
        # 1. Without explicit evidence field (default empty list)
        payload_minimal = {
            "message": "Here is your plan.",
            "status": "success",
            "is_grounded": True,
        }
        res_min = GroundedConversationResponse.model_validate(payload_minimal)
        assert res_min.evidence_items == []
        assert res_min.intent is None
        assert res_min.constraints is None

        # 2. End-to-end response produced by orchestrator
        res_full = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="Plan a 2 day trip to Puri with heritage")
        ])
        assert res_full.status == AIStatus.SUCCESS
        assert len(res_full.evidence_items) > 0
        ev = res_full.evidence_items[0]
        assert ev.claim_type in (ClaimType.VERIFIED, ClaimType.SCHEDULED)
        assert len(ev.title) > 0
        assert len(ev.rationale) > 0
