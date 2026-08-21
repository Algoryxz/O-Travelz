"""Comprehensive tests for M:N Interest schema, exact interest matching, and deterministic ranking."""
import pytest
from app.schemas.common import PlanningConstraints
from app.services.ranking import RankingService, VerifiedPlace
from app.transport.adapters.walking import Coordinate
from app.db.session import SessionLocal
from app.models.place import Place
from app.models.interest import Interest, PlaceInterest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def _make_place(
    database_id: str,
    category: str,
    name: str,
    interests: tuple[str, ...] = (),
    research_id: str | None = None,
    coordinate: Coordinate | None = None,
) -> VerifiedPlace:
    return VerifiedPlace(
        database_id=database_id,
        category_id=category,
        name=name,
        interests=interests,
        research_id=research_id,
        coordinate=coordinate,
    )


# 1. Exact Interest Matching & Deterministic Scoring
def test_exact_interest_matching_scores_multiple_exact_matches():
    candidates = [
        _make_place("1", "temple", "Ananta Vasudeva", interests=("heritage", "spirituality", "food", "architecture")),
        _make_place("2", "temple", "Lingaraj Temple", interests=("heritage", "spirituality", "architecture")),
        _make_place("3", "market", "Ekamra Haat", interests=("culture", "food", "shopping")),
        _make_place("4", "park", "Buddha Jayanti Park", interests=("nature", "relaxation")),
    ]

    service = RankingService()

    # Query: heritage + food
    ranked = service.rank(
        PlanningConstraints(days=2, interests=["heritage", "food"]),
        candidates,
    )

    # Ananta Vasudeva has both heritage and food -> relevance 2
    # Lingaraj has heritage -> relevance 1
    # Ekamra Haat has food -> relevance 1
    # Buddha Jayanti Park has neither -> relevance 0
    assert [(r.place.name, r.relevance) for r in ranked] == [
        ("Ananta Vasudeva", 2),
        ("Ekamra Haat", 1),
        ("Lingaraj Temple", 1),
        ("Buddha Jayanti Park", 0),
    ]


def test_no_fuzzy_or_semantic_guessing():
    candidates = [
        _make_place("1", "temple", "Authentic Temple", interests=("spirituality", "heritage")),
        _make_place("2", "nature", "Religious Forest", interests=("nature",)),
        _make_place("3", "monument", "Spiritual Monument", interests=("heritage",)),
    ]

    service = RankingService()

    # Query: "spiritual" (inexact prefix/stem) vs canonical "spirituality"
    ranked_inexact = service.rank(
        PlanningConstraints(days=1, interests=["spiritual"]),
        candidates,
    )
    # Since exact matching only is enforced, "spiritual" does NOT match "spirituality"
    assert {r.relevance for r in ranked_inexact} == {0}

    # Query: canonical "spirituality" with extra whitespace and uppercase
    ranked_exact = service.rank(
        PlanningConstraints(days=1, interests=["  SPIRITUALITY  "]),
        candidates,
    )
    assert [(r.place.name, r.relevance) for r in ranked_exact] == [
        ("Authentic Temple", 1),
        ("Spiritual Monument", 0),
        ("Religious Forest", 0),
    ]


def test_unknown_interest_produces_zero_relevance_and_preserves_tie_breaks():
    candidates = [
        _make_place("b", "temple", "Same Name", interests=("heritage",), research_id="place_002"),
        _make_place("a", "temple", "Same Name", interests=("heritage",), research_id="place_001"),
        _make_place("c", "monument", "Alpha Place", interests=("heritage",), research_id="place_003"),
    ]

    service = RankingService()
    ranked = service.rank(
        PlanningConstraints(days=1, interests=["nonexistent_theme", "astronomy"]),
        candidates,
    )

    assert {r.relevance for r in ranked} == {0}
    # Deterministic tie break: category_id, name, research_missing, research_id, database_id
    assert [r.place.database_id for r in ranked] == ["c", "a", "b"]


def test_determinism_repeated_calls_identical_order():
    candidates = [
        _make_place("1", "temple", "Place A", interests=("heritage",)),
        _make_place("2", "monument", "Place B", interests=("heritage", "architecture")),
        _make_place("3", "beach", "Place C", interests=("beach", "nature")),
        _make_place("4", "wildlife", "Place D", interests=("wildlife", "nature")),
    ]

    service = RankingService()
    constraints = PlanningConstraints(days=2, interests=["nature", "architecture"])

    result1 = service.rank(constraints, candidates)
    result2 = service.rank(constraints, list(reversed(candidates)))
    result3 = service.rank(constraints, candidates)

    assert [r.place.database_id for r in result1] == [r.place.database_id for r in result2]
    assert [r.place.database_id for r in result1] == [r.place.database_id for r in result3]


# 2. Database Integration & Inventory Preservation
@pytest.mark.integration
def test_all_81_places_and_12_interests_in_database():
    db = SessionLocal()
    try:
        places = db.query(Place).all()
        interests = db.query(Interest).all()
        place_interests = db.query(PlaceInterest).all()

        assert len(places) == 81, f"Expected 81 places in DB, got {len(places)}"
        assert len(interests) == 12, f"Expected 12 canonical interests in DB, got {len(interests)}"
        assert len(place_interests) == 206, f"Expected 206 associations, got {len(place_interests)}"

        interest_names = {i.name for i in interests}
        expected_12 = {
            "heritage", "spirituality", "architecture", "food", "culture",
            "nature", "beach", "wildlife", "waterfall", "relaxation",
            "adventure", "shopping"
        }
        assert interest_names == expected_12

        # Check legacy places are preserved
        legacy_sample = db.query(Place).filter(Place.research_id == "place_018").first()
        assert legacy_sample is not None
        assert legacy_sample.name == "Baitala Deula"

        # Check newly added food places exist
        pahala = db.query(Place).filter(Place.research_id == "place_food_001").first()
        assert pahala is not None
        assert pahala.name == "Pahala Rasagola Sweet Hub"
    finally:
        db.close()


@pytest.mark.integration
def test_api_places_endpoint_returns_interests_and_filters_correctly():
    # 1. List places returns interests array
    res = client.get("/places")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 81

    ananta = next(p for p in data if p["name"] == "Ananta Vasudeva Temple")
    assert "food" in ananta["interests"]
    assert "heritage" in ananta["interests"]
    assert "spirituality" in ananta["interests"]

    # 2. Filter by interest: food
    res_food = client.get("/places?interest=food")
    assert res_food.status_code == 200
    food_places = res_food.json()
    assert len(food_places) == 14
    food_names = {p["name"] for p in food_places}
    assert "Ananta Vasudeva Temple" in food_names
    assert "Ekamra Haat" in food_names
    assert "Pahala Rasagola Sweet Hub" in food_names
    assert "Nimapada Chhena Jhili Market" in food_names

    # 3. Filter by interest: beach
    res_beach = client.get("/places?interest=beach")
    assert res_beach.status_code == 200
    assert len(res_beach.json()) == 6
