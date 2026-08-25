"""Concrete domain tool adapters wrapping verified O-Travelz services.

Exposes domain capabilities (Whole-Odisha Search, Deterministic Itinerary Planning,
Multimodal Transport Routing, Provider Status) through provider-neutral BaseToolAdapter interfaces.
"""
from __future__ import annotations

from typing import TYPE_CHECKING, Any
from sqlalchemy.orm import Session

from app.ai.contracts import ToolDefinition, ToolResult, ToolStatus
from app.ai.registry import BaseToolAdapter, ToolRegistry
from app.ai.schemas import (
    BuildItineraryArgs,
    GetProviderStatusArgs,
    PlanTransportHopArgs,
    SearchPlacesArgs,
)
from app.ai.tools.build_itinerary import BuildItineraryTool
from app.ai.tools.plan_transport_hop import PlanTransportHopTool
from app.ai.tools.provider_status import GetProviderStatusTool
from app.services.search.search_models import SearchQueryParams
from app.services.search.search_service import SearchService

if TYPE_CHECKING:
    from app.services.itinerary.service import ItineraryService


class SearchPlacesToolAdapter(BaseToolAdapter):
    """Tool adapter exposing Whole-Odisha search and structured knowledge retrieval."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self._definition = ToolDefinition(
            name="search_places",
            description=(
                "Search verified Odisha travel destinations, heritage monuments, temples, "
                "beaches, waterfalls, emergency medical facilities, or transit hubs by name, "
                "district, category, theme, or coordinates."
            ),
            input_schema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Free-text search query in English, Odia, or Hindi."},
                    "district": {"type": "string", "description": "Specific Odisha district name (e.g. 'Puri', 'Khordha', 'କଟକ')."},
                    "category": {"type": "string", "description": "Physical category (e.g. 'temple', 'waterfall', 'beach', 'hospital', 'transit_hub')."},
                    "interests": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Traveler interests (e.g. 'heritage', 'spirituality', 'nature', 'food').",
                    },
                    "area": {"type": "string", "description": "Geographic area name or hub (e.g. 'Bhubaneswar', 'Puri')."},
                    "is_medical": {"type": "boolean", "description": "True to filter for emergency medical facilities."},
                    "is_transit": {"type": "boolean", "description": "True to filter for transit stations/hubs."},
                    "near_lat": {"type": "number", "description": "WGS84 latitude for proximity search."},
                    "near_lon": {"type": "number", "description": "WGS84 longitude for proximity search."},
                    "radius_km": {"type": "number", "description": "Radius in kilometers for geospatial search."},
                    "limit": {"type": "integer", "default": 10, "description": "Maximum number of places to return."},
                },
            },
        )

    @property
    def definition(self) -> ToolDefinition:
        return self._definition

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        try:
            args = SearchPlacesArgs.model_validate(arguments)
            params = SearchQueryParams(
                search=getattr(args, "query", None) or args.area,
                district=getattr(args, "district", None) or args.area,
                category=getattr(args, "category", None),
                interest=args.interests[0] if args.interests else None,
                is_medical=getattr(args, "is_medical", None),
                is_transit=getattr(args, "is_transit", None),
                near_lat=getattr(args, "near_lat", None),
                near_lon=getattr(args, "near_lon", None),
                radius_km=getattr(args, "radius_km", None),
                limit=getattr(args, "limit", 10) or 10,
            )
            records = SearchService.retrieve_places(
                self.db,
                query=params.search,
                district=params.district,
                category=params.category,
                interest=params.interest,
                is_medical=params.is_medical,
                is_transit=params.is_transit,
                near_lat=params.near_lat,
                near_lon=params.near_lon,
                radius_km=params.radius_km,
                limit=params.limit,
            )
            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self.definition.name,
                status=ToolStatus.OK,
                data=records,
            )
        except Exception as error:
            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self.definition.name,
                status=ToolStatus.ERROR,
                reason="Search places tool failed.",
                error=str(error),
            )


class BuildItineraryToolAdapter(BaseToolAdapter):
    """Tool adapter exposing deterministic multi-day itinerary generation."""

    def __init__(self, service: ItineraryService) -> None:
        self.service = service
        self._tool = BuildItineraryTool(self.service)
        self._definition = ToolDefinition(
            name="build_itinerary",
            description=(
                "Generate a deterministic, verified multi-day itinerary across Odisha destinations "
                "satisfying pacing, duration (1-14 days), start hub, and traveler interests."
            ),
            input_schema={
                "type": "object",
                "required": ["constraints"],
                "properties": {
                    "constraints": {
                        "type": "object",
                        "required": ["days", "interests"],
                        "properties": {
                            "days": {"type": "integer", "minimum": 1, "maximum": 14, "description": "Trip duration in days."},
                            "interests": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "List of canonical traveler interests (e.g. 'heritage', 'spirituality').",
                            },
                            "start": {"type": "string", "description": "Start city or location (e.g. 'Bhubaneswar', 'Puri')."},
                            "pace": {"type": "string", "enum": ["relaxed", "moderate", "fast"], "default": "moderate"},
                        },
                    },
                },
            },
        )

    @property
    def definition(self) -> ToolDefinition:
        return self._definition

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        res = self._tool.execute(arguments)
        if tool_call_id and not res.tool_call_id:
            res.tool_call_id = tool_call_id
        return res


class PlanTransportHopToolAdapter(BaseToolAdapter):
    """Tool adapter exposing deterministic multimodal transport hop planning."""

    def __init__(self, transport_service: Any = None) -> None:
        if transport_service is None:
            from app.transport.service import MappingPlaceResolver, TransportService
            transport_service = TransportService(MappingPlaceResolver({}))
        self.transport_service = transport_service
        self._tool = PlanTransportHopTool(self.transport_service)
        self._definition = ToolDefinition(
            name="plan_transport_hop",
            description="Plan an optimal, verified multimodal transport hop between two consecutive Odisha travel destinations.",
            input_schema={
                "type": "object",
                "required": ["from_place", "to_place", "constraints"],
                "properties": {
                    "from_place": {"type": "object", "description": "Origin PlaceSummary record."},
                    "to_place": {"type": "object", "description": "Destination PlaceSummary record."},
                    "constraints": {"type": "object", "description": "Planning constraints including budget and mobility."},
                },
            },
        )

    @property
    def definition(self) -> ToolDefinition:
        return self._definition

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        res = self._tool.execute(arguments)
        if tool_call_id and not res.tool_call_id:
            res.tool_call_id = tool_call_id
        return res


class GetProviderStatusToolAdapter(BaseToolAdapter):
    """Tool adapter checking transit provider operational availability."""

    def __init__(self, provider_service: Any = None) -> None:
        if provider_service is None:
            from app.transport.service import MappingPlaceResolver, TransportService
            provider_service = TransportService(MappingPlaceResolver({}))
        self.provider_service = provider_service
        self._tool = GetProviderStatusTool(self.provider_service)
        self._definition = ToolDefinition(
            name="get_provider_status",
            description="Check operational status and schedule availability for verified Odisha transport providers (e.g. CRUT Mo Bus, Indian Railways).",
            input_schema={
                "type": "object",
                "required": ["provider_id"],
                "properties": {
                    "provider_id": {"type": "string", "description": "Transit provider identifier (e.g. 'ama-bus', 'mo-e-ride')."},
                },
            },
        )

    @property
    def definition(self) -> ToolDefinition:
        return self._definition

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        res = self._tool.execute(arguments)
        if tool_call_id and not res.tool_call_id:
            res.tool_call_id = tool_call_id
        return res


def create_default_tool_registry(
    db: Session,
    itinerary_service: ItineraryService | None = None,
    transport_service: Any = None,
) -> ToolRegistry:
    """Create and return a ToolRegistry populated with canonical O-Travelz domain tools."""
    registry = ToolRegistry()
    registry.register(SearchPlacesToolAdapter(db))

    if transport_service is None:
        from app.transport.service import SQLAlchemyPlaceResolver, TransportService
        transport_service = TransportService(SQLAlchemyPlaceResolver(db))

    if itinerary_service is None:
        from app.services.ranking.repository import SQLAlchemyPlaceRepository
        from app.services.itinerary import ItineraryService
        repo = SQLAlchemyPlaceRepository(db)
        itinerary_service = ItineraryService(repo, transport_service)

    registry.register(BuildItineraryToolAdapter(itinerary_service))
    registry.register(PlanTransportHopToolAdapter(transport_service))
    registry.register(GetProviderStatusToolAdapter(transport_service))
    return registry
