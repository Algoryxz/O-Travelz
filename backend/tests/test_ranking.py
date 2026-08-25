from app.schemas.common import PlanningConstraints
from app.services.ranking import InMemoryPlaceRepository, RankingService, VerifiedPlace
from app.transport.adapters.walking import Coordinate


def _place(
    database_id: str,
    category: str,
    name: str,
    research_id: str | None = None,
    coordinate: Coordinate | None = None,
) -> VerifiedPlace:
    return VerifiedPlace(
        database_id=database_id,
        category_id=category,
        name=name,
        research_id=research_id,
        coordinate=coordinate,
    )


def test_interest_matching_is_normalized_and_exact_only():
    candidates = [
        _place("2", "museum", "History Museum"),
        _place("1", "temple", "Temple"),
        _place("3", "history_museum", "Semantic Guess"),
    ]

    ranked = RankingService().rank(
        PlanningConstraints(days=1, interests=[" TEMPLE "]),
        candidates,
    )

    assert [(item.place.name, item.relevance) for item in ranked] == [
        ("Temple", 1),
        ("Semantic Guess", 0),
        ("History Museum", 0),
    ]


def test_no_interests_gives_equal_relevance_and_approved_tie_breaks():
    candidates = [
        _place("uuid-b", "temple", "Same", "research-002"),
        _place("uuid-a", "temple", "Same", "research-001"),
        _place("uuid-c", "museum", "Same", "research-003"),
        _place("uuid-d", "temple", "Other"),
    ]

    ranked = RankingService().rank(PlanningConstraints(days=1), candidates)

    assert [item.place.database_id for item in ranked] == [
        "uuid-c",
        "uuid-d",
        "uuid-a",
        "uuid-b",
    ]
    assert {item.relevance for item in ranked} == {0}


def test_verified_null_coordinate_place_participates_in_ranking():
    candidates = [
        _place("null", "temple", "Null Location"),
        _place("known", "temple", "Known Location", coordinate=Coordinate(20, 85)),
    ]

    ranked = RankingService().rank(
        PlanningConstraints(days=1, interests=["temple"]),
        candidates,
    )

    assert {item.place.database_id for item in ranked} == {"null", "known"}
    assert ranked[0].relevance == ranked[1].relevance == 1
