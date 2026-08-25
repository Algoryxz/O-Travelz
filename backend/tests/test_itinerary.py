from datetime import date

import pytest

from app.ai.schemas import PlanTransportHopArgs
from app.schemas.common import PlanningConstraints
from app.schemas.transport import DataTier, TransportHopContract
from app.services.itinerary import ItineraryPlanningError, ItineraryService
from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
from app.transport.adapters.walking import Coordinate


def _place(index: int, category: str = "temple", coordinate: bool = True) -> VerifiedPlace:
    return VerifiedPlace(
        database_id=f"place-{index}",
        category_id=category,
        name=f"Place {index}",
        research_id=f"research-{index}",
        coordinate=Coordinate(20, 85 + index / 1000) if coordinate else None,
    )


class RecordingTransport:
    def __init__(self, unavailable_calls: set[int] | None = None):
        self.calls: list[PlanTransportHopArgs] = []
        self.unavailable_calls = unavailable_calls or set()

    def plan_transport_hop(self, args: PlanTransportHopArgs) -> TransportHopContract:
        self.calls.append(args)
        if len(self.calls) in self.unavailable_calls:
            return TransportHopContract(
                from_sequence=args.from_sequence,
                to_sequence=args.to_sequence,
                mode="unavailable",
                data_tier=DataTier.UNKNOWN,
                reason="No verified transport path is available.",
            )
        return TransportHopContract(
            from_sequence=args.from_sequence,
            to_sequence=args.to_sequence,
            mode="walk",
            estimated_minutes=1,
            estimated_cost=None,
            legs=[{"mode": "walk", "detail": "Verified walking fallback"}],
            data_tier=DataTier.STATIC,
        )


def test_global_selection_capacity_unique_places_and_day_distribution():
    repository = InMemoryPlaceRepository([_place(index) for index in range(1, 8)])
    transport = RecordingTransport()
    service = ItineraryService(repository, transport)

    response = service.plan(PlanningConstraints(days=2, interests=["temple"]))

    assert [[stop.place.id for stop in day.stops] for day in response.days] == [
        ["place-1", "place-2", "place-3"],
        ["place-4", "place-5", "place-6"],
    ]
    assert [[stop.sequence for stop in day.stops] for day in response.days] == [
        [1, 2, 3],
        [1, 2, 3],
    ]
    assert len({stop.place.id for day in response.days for stop in day.stops}) == 6
    assert [(call.from_sequence, call.to_sequence) for call in transport.calls] == [
        (1, 2),
        (2, 3),
        (1, 2),
        (2, 3),
    ]


def test_valid_exact_start_adds_start_hop_and_does_not_return_to_start():
    origin = VerifiedPlace(
        database_id="origin",
        category_id="hotel",
        name="Origin Hotel",
        coordinate=Coordinate(20, 85),
    )
    repository = InMemoryPlaceRepository([origin, *[_place(index) for index in range(1, 5)]])
    transport = RecordingTransport()

    response = ItineraryService(repository, transport).plan(
        PlanningConstraints(days=1, interests=["temple"], start="Origin Hotel")
    )

    assert response.days[0].hops[0].from_sequence == 0
    assert response.days[0].hops[0].to_sequence == 1
    assert [(call.from_sequence, call.to_sequence) for call in transport.calls] == [
        (0, 1),
        (1, 2),
        (2, 3),
    ]
    assert all(call.from_place.id != "origin" for call in transport.calls[1:])


def test_unavailable_hop_is_preserved_and_explanation_is_empty():
    repository = InMemoryPlaceRepository([_place(1), _place(2)])
    transport = RecordingTransport(unavailable_calls={1})

    response = ItineraryService(repository, transport).plan(
        PlanningConstraints(days=1, interests=["temple"])
    )

    hop = response.days[0].hops[0]
    assert [stop.place.id for stop in response.days[0].stops] == ["place-1", "place-2"]
    assert hop.mode == "unavailable"
    assert hop.reason
    assert hop.estimated_minutes is None
    assert hop.estimated_cost is None
    assert hop.data_tier is DataTier.UNKNOWN
    assert response.explanation == ""


def test_dates_label_days_only_and_empty_trailing_days_are_retained():
    repository = InMemoryPlaceRepository([_place(1)])
    response = ItineraryService(repository, RecordingTransport()).plan(
        PlanningConstraints(days=3, dates=[date(2026, 9, 1)], interests=["temple"])
    )

    assert [day.date for day in response.days] == [date(2026, 9, 1), None, None]
    assert [len(day.stops) for day in response.days] == [1, 0, 0]


def test_identical_inputs_produce_identical_itinerary_output():
    repository = InMemoryPlaceRepository([_place(1), _place(2)])
    first = ItineraryService(repository, RecordingTransport()).plan(
        PlanningConstraints(days=1, interests=["temple"])
    )
    second = ItineraryService(repository, RecordingTransport()).plan(
        PlanningConstraints(days=1, interests=["temple"])
    )

    assert first.model_dump(mode="json") == second.model_dump(mode="json")


def test_null_coordinates_are_not_selected_for_routed_itinerary():
    repository = InMemoryPlaceRepository([_place(1, coordinate=False)])

    with pytest.raises(ItineraryPlanningError, match="coordinate-bearing") as error:
        ItineraryService(repository, RecordingTransport()).plan(
            PlanningConstraints(days=1, interests=["temple"])
        )

    assert error.value.code == "no_feasible_candidates"


def test_unresolvable_or_unlocated_start_is_a_complete_planning_failure():
    repository = InMemoryPlaceRepository([_place(1)])
    service = ItineraryService(repository, RecordingTransport())

    with pytest.raises(ItineraryPlanningError) as missing:
        service.plan(PlanningConstraints(days=1, start="Unknown Hotel"))
    assert missing.value.code == "invalid_start"
