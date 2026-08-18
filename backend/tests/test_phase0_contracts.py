from datetime import date

import pytest
from pydantic import ValidationError

from app.ai.schemas import (
    BuildItineraryArgs,
    GetProviderStatusArgs,
    PlanTransportHopArgs,
    SearchPlacesArgs,
)
from app.schemas.api import APIErrorResponse
from app.schemas.itinerary import ItineraryResponse
from app.schemas.transport import DataTier, TransportHopContract


def test_itinerary_contract_accepts_repository_fixture_shape():
    response = ItineraryResponse.model_validate(
        {
            "itinerary_id": "fixture-0001",
            "constraints": {
                "days": 1,
                "interests": ["temples", "food"],
                "start": "Example Hotel",
            },
            "days": [
                {
                    "day_number": 1,
                    "date": "2026-09-01",
                    "stops": [
                        {
                            "sequence": 1,
                            "place": {
                                "id": "p1",
                                "name": "Example Temple",
                                "category": "temple",
                            },
                            "planned_arrival": "09:00",
                            "planned_departure": "10:15",
                        }
                    ],
                    "hops": [],
                }
            ],
            "explanation": "Grounded explanation.",
        }
    )
    assert response.days[0].date == date(2026, 9, 1)


def test_transport_contract_preserves_data_tier_and_legs():
    hop = TransportHopContract.model_validate(
        {
            "from_sequence": 1,
            "to_sequence": 2,
            "mode": "walk+bus",
            "estimated_minutes": 22,
            "estimated_cost": 15,
            "legs": [
                {"mode": "walk", "detail": "8 min to bus stop"},
                {"mode": "bus", "provider": "Mo Bus", "route": "5", "detail": "3 stops"},
            ],
            "data_tier": "static",
        }
    )
    assert hop.data_tier is DataTier.STATIC
    assert [leg.mode for leg in hop.legs] == ["walk", "bus"]


def test_contracts_reject_undocumented_fields():
    with pytest.raises(ValidationError):
        TransportHopContract.model_validate(
            {
                "from_sequence": 1,
                "to_sequence": 2,
                "mode": "walk",
                "data_tier": "static",
                "invented_fact": "not allowed",
            }
        )


def test_unavailable_transport_hop_requires_reason():
    with pytest.raises(ValidationError, match="require a reason"):
        TransportHopContract.model_validate(
            {
                "from_sequence": 1,
                "to_sequence": 2,
                "mode": "unavailable",
                "data_tier": "scheduled",
            }
        )

    hop = TransportHopContract.model_validate(
        {
            "from_sequence": 1,
            "to_sequence": 2,
            "mode": "unavailable",
            "data_tier": "scheduled",
            "reason": "No verified provider data is available.",
        }
    )
    assert hop.reason == "No verified provider data is available."


def test_ai_tool_contracts_have_structured_arguments():
    constraints = {"days": 1, "interests": ["temples"], "start": "Hotel"}
    place = {"id": "p1", "name": "Temple", "category": "temple"}
    assert SearchPlacesArgs(interests=["temples"], constraints=constraints).area is None
    assert BuildItineraryArgs(constraints=constraints, candidate_places=[place]).candidate_places
    assert PlanTransportHopArgs(
        from_place=place, to_place=place, constraints=constraints
    ).from_place.id == "p1"
    assert GetProviderStatusArgs(provider_id="provider-1").provider_id == "provider-1"


def test_api_error_contract_is_structured():
    error = APIErrorResponse(
        error={"code": "validation_error", "message": "Invalid request"},
        details=[{"field": "days", "message": "Must be positive"}],
    )
    assert error.error.code == "validation_error"
