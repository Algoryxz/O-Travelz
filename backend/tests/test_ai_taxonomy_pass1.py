"""Comprehensive tests for Pass 1: AI Intent Parsing & Canonical 12-Interest Taxonomy Alignment."""
import pytest
from app.ai.model import RuleBasedModelAdapter
from app.ai.schemas import IntentKind, PlanningConstraints


@pytest.fixture
def adapter():
    return RuleBasedModelAdapter()


CANONICAL_12_INTERESTS = [
    "heritage",
    "spirituality",
    "architecture",
    "food",
    "culture",
    "nature",
    "beach",
    "wildlife",
    "waterfall",
    "relaxation",
    "adventure",
    "shopping",
]


# 1. All 12 canonical interests are recognized directly
@pytest.mark.parametrize("interest", CANONICAL_12_INTERESTS)
def test_all_12_canonical_interests_recognized(adapter, interest):
    message = f"Plan a 2-day {interest} trip in Bhubaneswar"
    res = adapter.parse_intent(message)
    assert res["kind"] == IntentKind.PLANNING.value
    assert res["constraints"]["days"] == 2
    assert res["constraints"]["interests"] == [interest]
    assert res["constraints"]["start"] == "Bhubaneswar"


# 2. Canonical interest natural-language variants map deterministically
def test_natural_language_variants_mapping(adapter):
    # Heritage variants
    res = adapter.parse_intent("Plan a 2-day historic monuments tour in Bhubaneswar")
    assert "heritage" in res["constraints"]["interests"]

    # Spirituality variants
    res = adapter.parse_intent("Plan a 2-day spiritual temple tour in Puri")
    assert "spirituality" in res["constraints"]["interests"]
    assert "temple" not in res["constraints"]["interests"]  # Not a separate interest

    # Food variants
    res = adapter.parse_intent("Plan a culinary cuisine and sweets journey in Cuttack")
    assert "food" in res["constraints"]["interests"]

    # Beach variants
    res = adapter.parse_intent("Plan a 3-day coastal beaches vacation in Puri")
    assert "beach" in res["constraints"]["interests"]

    # Nature variants
    res = adapter.parse_intent("Plan a 2-day tour around the lakes and hill station of Daringbadi")
    assert "nature" in res["constraints"]["interests"]

    # Wildlife variants
    res = adapter.parse_intent("Plan a 2-day wildlife safari and sanctuary visit")
    assert "wildlife" in res["constraints"]["interests"]

    # Waterfall variants
    res = adapter.parse_intent("Plan a 2-day waterfalls and cascade trip")
    assert "waterfall" in res["constraints"]["interests"]

    # Relaxation variants
    res = adapter.parse_intent("Plan a relaxing peaceful leisure holiday")
    assert "relaxation" in res["constraints"]["interests"]

    # Adventure variants
    res = adapter.parse_intent("Plan an adventure hiking and trekking trip in Koraput")
    assert "adventure" in res["constraints"]["interests"]

    # Shopping variants
    res = adapter.parse_intent("Plan a shopping and crafts bazaar trip in Bhubaneswar")
    assert "shopping" in res["constraints"]["interests"]


# 3. Unsupported interests (photography, family, etc.) are NOT emitted as production interests
def test_unsupported_interests_not_emitted_as_production_interests(adapter):
    # Photography alone without days/start
    res_photo = adapter.parse_intent("Plan a photography trip")
    assert res_photo["kind"] == IntentKind.CLARIFICATION.value

    # Photography with days
    res_photo_days = adapter.parse_intent("Plan a 2-day photography trip in Puri")
    assert res_photo_days["kind"] == IntentKind.PLANNING.value
    assert "photography" not in res_photo_days["constraints"]["interests"]
    assert res_photo_days["constraints"]["interests"] == []  # Photography stripped out

    # Family alone
    res_family = adapter.parse_intent("Plan a family trip")
    assert res_family["kind"] == IntentKind.CLARIFICATION.value

    # Family with days
    res_family_days = adapter.parse_intent("Plan a 3-day family trip in Bhubaneswar")
    assert res_family_days["kind"] == IntentKind.PLANNING.value
    assert "family" not in res_family_days["constraints"]["interests"]
    assert res_family_days["constraints"]["interests"] == []


# 4. Determinism: Repeated identical input produces strictly identical parsed constraints
def test_intent_parsing_is_strictly_deterministic(adapter):
    prompt = "Plan a 2-day architecture and heritage trip in Bhubaneswar"
    res1 = adapter.parse_intent(prompt)
    res2 = adapter.parse_intent(prompt)
    res3 = adapter.parse_intent(prompt)

    assert res1 == res2 == res3
    assert res1["constraints"]["interests"] == ["heritage", "architecture"]
    assert res1["constraints"]["start"] == "Bhubaneswar"
    assert res1["constraints"]["days"] == 2


# 5. Multi-turn refinement with canonical interests
def test_refinement_with_canonical_interests(adapter):
    base_constraints = PlanningConstraints(
        days=2,
        interests=["heritage"],
        start="Bhubaneswar",
    )

    # Add spirituality and food
    res = adapter.parse_intent("Add spirituality and food", base_constraints)
    assert res["kind"] == IntentKind.REFINEMENT.value
    assert set(res["constraint_update"]["interests"]) == {"heritage", "spirituality", "food"}

    # Switch/Change only to relaxation and beach
    res_switch = adapter.parse_intent("Switch to only relaxation and beach", base_constraints)
    assert res_switch["kind"] == IntentKind.REFINEMENT.value
    assert set(res_switch["constraint_update"]["interests"]) == {"relaxation", "beach"}


# 6. Specific 8 Scenario Validations from user prompt
def test_user_scenario_a(adapter):
    # A. "Plan a 2-day heritage trip in Bhubaneswar"
    res = adapter.parse_intent("Plan a 2-day heritage trip in Bhubaneswar")
    assert res["kind"] == IntentKind.PLANNING.value
    assert res["constraints"]["days"] == 2
    assert res["constraints"]["interests"] == ["heritage"]
    assert res["constraints"]["start"] == "Bhubaneswar"


def test_user_scenario_b(adapter):
    # B. "Plan a 2-day spiritual trip in Puri"
    res = adapter.parse_intent("Plan a 2-day spiritual trip in Puri")
    assert res["kind"] == IntentKind.PLANNING.value
    assert res["constraints"]["days"] == 2
    assert res["constraints"]["interests"] == ["spirituality"]
    assert res["constraints"]["start"] == "Puri"


def test_user_scenario_c(adapter):
    # C. "Plan a 2-day architecture and heritage trip in Bhubaneswar"
    res = adapter.parse_intent("Plan a 2-day architecture and heritage trip in Bhubaneswar")
    assert res["kind"] == IntentKind.PLANNING.value
    assert res["constraints"]["days"] == 2
    assert set(res["constraints"]["interests"]) == {"architecture", "heritage"}
    assert res["constraints"]["start"] == "Bhubaneswar"


def test_user_scenario_d(adapter):
    # D. "Plan a relaxing beach trip"
    res = adapter.parse_intent("Plan a relaxing beach trip")
    assert res["kind"] == IntentKind.PLANNING.value
    assert set(res["constraints"]["interests"]) == {"relaxation", "beach"}


def test_user_scenario_e(adapter):
    # E. "Plan a food and culture trip"
    res = adapter.parse_intent("Plan a food and culture trip")
    assert res["kind"] == IntentKind.PLANNING.value
    assert set(res["constraints"]["interests"]) == {"food", "culture"}


def test_user_scenario_f(adapter):
    # F. "Plan an adventure and nature trip"
    res = adapter.parse_intent("Plan an adventure and nature trip")
    assert res["kind"] == IntentKind.PLANNING.value
    assert set(res["constraints"]["interests"]) == {"adventure", "nature"}


def test_user_scenario_g(adapter):
    # G. "Plan a wildlife and waterfall trip"
    res = adapter.parse_intent("Plan a wildlife and waterfall trip")
    assert res["kind"] == IntentKind.PLANNING.value
    assert set(res["constraints"]["interests"]) == {"wildlife", "waterfall"}


def test_user_scenario_h(adapter):
    # H. "Plan a shopping trip"
    res = adapter.parse_intent("Plan a shopping trip")
    assert res["kind"] == IntentKind.PLANNING.value
    assert res["constraints"]["interests"] == ["shopping"]
