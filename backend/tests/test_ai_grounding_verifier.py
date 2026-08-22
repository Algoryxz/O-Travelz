"""Unit test suite for Phase 12 Step 10: AI Grounding Verification Layer.

Tests factual claim verification, unverified claim detection, and zero-fabrication safety passes.
"""
import pytest

from app.ai.grounding_verifier import GroundingVerificationResult, GroundingVerifier
from app.schemas.common import PlaceSummary, PlanningConstraints
from app.schemas.itinerary import (
    ItineraryDayContract,
    ItineraryResponse,
    ItineraryStopContract,
)


class TestGroundingVerifier:
    def test_verified_itinerary_and_places_pass_grounding(self):
        itinerary = ItineraryResponse(
            itinerary_id="itin_123",
            constraints=PlanningConstraints(days=1, start="Puri"),
            days=[
                ItineraryDayContract(
                    day_number=1,
                    stops=[
                        ItineraryStopContract(
                            sequence=1,
                            place=PlaceSummary(
                                id="1",
                                name="Jagannath Temple",
                                category="temple",
                            ),

                        )
                    ],
                )
            ],
            explanation="1 day in Puri",
        )
        places = [{"id": "1", "name": "Jagannath Temple", "district": "Puri"}]


        res = GroundingVerifier.verify_response(
            message="Here is your verified 1-day itinerary for Puri.",
            itinerary=itinerary,
            places=places,
        )

        assert res.is_grounded is True
        assert len(res.verified_claims) > 0
        assert len(res.unverified_claims) == 0
        assert any("Jagannath Temple" in claim for claim in res.verified_claims)
        assert "itinerary_service:deterministic_sequencing" in res.grounding_sources

    def test_unverified_phone_number_detected(self):
        message = "For hotel bookings, call +91 9876543210 immediately."
        res = GroundingVerifier.verify_response(message=message)

        assert res.is_grounded is False
        assert len(res.unverified_claims) == 1
        assert "9876543210" in res.unverified_claims[0]
        assert len(res.warnings) > 0


    def test_unverified_opening_hour_claim_detected(self):
        message = "This monument is open until 11:30 PM for night tours."
        res = GroundingVerifier.verify_response(message=message)

        assert len(res.unverified_claims) == 1
        assert "open until 11:30 PM" in res.unverified_claims[0]
        assert res.is_grounded is False

    def test_clean_response_without_unverified_assertions_is_grounded(self):
        message = "Puri and Konark are prime cultural destinations along the Odisha coast."
        res = GroundingVerifier.verify_response(message=message)

        assert res.is_grounded is True
        assert len(res.unverified_claims) == 0
