"""HTTP boundary contracts. Owner: Rudra; semantic payloads: Smarak."""
from typing import Any

from pydantic import Field

from app.schemas.common import ContractModel
from app.schemas.itinerary import ItineraryResponse


class APIErrorDetail(ContractModel):
    code: str
    message: str
    field: str | None = None


class APIErrorResponse(ContractModel):
    error: APIErrorDetail
    details: list[dict[str, Any]] = Field(default_factory=list)


class ItineraryPlanResponse(ItineraryResponse):
    """Named API response alias for the shared itinerary contract."""
