"""AI tool argument/result contracts only; no AI execution. Owner: Smarak."""
from pydantic import Field

from app.schemas.common import ContractModel, PlaceSummary, PlanningConstraints
from app.schemas.itinerary import ItineraryResponse
from app.schemas.transport import ProviderStatusContract, TransportHopContract


class SearchPlacesArgs(ContractModel):
    interests: list[str] = Field(default_factory=list)
    area: str | None = None
    constraints: PlanningConstraints


class SearchPlacesResult(ContractModel):
    places: list[PlaceSummary] = Field(default_factory=list)


class BuildItineraryArgs(ContractModel):
    constraints: PlanningConstraints
    candidate_places: list[PlaceSummary] = Field(default_factory=list)


class BuildItineraryResult(ItineraryResponse):
    """Structured result supplied to the explanation layer."""


class PlanTransportHopArgs(ContractModel):
    from_place: PlaceSummary
    to_place: PlaceSummary
    constraints: PlanningConstraints


class PlanTransportHopResult(TransportHopContract):
    """Structured transport result supplied to the explanation layer."""


class GetPlaceDetailsArgs(ContractModel):
    place_id: str


class GetProviderStatusArgs(ContractModel):
    provider_id: str


class GetProviderStatusResult(ProviderStatusContract):
    """Provider status result supplied to the explanation layer."""
