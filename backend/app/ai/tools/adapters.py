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
from app.ai.tools.get_nearby_services import GetNearbyServicesTool
from app.ai.tools.get_destination_safety import GetDestinationSafetyTool
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


class GetWeatherToolAdapter(BaseToolAdapter):
    """Tool adapter exposing live/forecast weather observations via Open-Meteo."""

    def __init__(self, weather_service: Any = None) -> None:
        if weather_service is None:
            from app.services.weather.service import WeatherService
            weather_service = WeatherService()
        self.weather_service = weather_service
        self._definition = ToolDefinition(
            name="get_weather",
            description="Get live weather observation, temperature, precipitation probability, and travel advice for an Odisha destination or coordinates.",
            input_schema={
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "Odisha destination or hub name (e.g. 'Puri', 'Bhubaneswar', 'Konark')."},
                    "lat": {"type": "number", "description": "WGS84 latitude."},
                    "lon": {"type": "number", "description": "WGS84 longitude."},
                    "date": {"type": "string", "description": "Optional forecast date (YYYY-MM-DD)."},
                },
            },
        )

    @property
    def definition(self) -> ToolDefinition:
        return self._definition

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        try:
            location = arguments.get("location") or arguments.get("location_name") or "Bhubaneswar"
            lat = arguments.get("lat")
            lon = arguments.get("lon")
            res = self.weather_service.get_weather_for_location(lat=lat, lon=lon, location_name=location)
            obs = res.current
            data = {
                "location": obs.location_name,
                "temperature_c": obs.temperature_c,
                "apparent_temperature_c": obs.apparent_temperature_c,
                "condition": obs.condition,
                "humidity_pct": obs.humidity_pct,
                "precipitation_probability_pct": obs.precipitation_probability_pct,
                "wind_speed_kmh": obs.wind_speed_kmh,
                "advice": obs.advice,
                "observed_at": obs.observed_at,
                "freshness_timestamp": obs.freshness_timestamp,
                "status": obs.status,
                "claim_type": "live" if obs.status == "available" else "unknown",
                "source": obs.provider or "Open-Meteo",
                "error_reason": obs.error_reason,
            }
            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self.definition.name,
                status=ToolStatus.OK if obs.status == "available" else ToolStatus.UNAVAILABLE,
                data=data,
                reason=obs.error_reason,
            )
        except Exception as error:
            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self.definition.name,
                status=ToolStatus.ERROR,
                reason="Weather tool failed.",
                error=str(error),
            )


class EstimateCrowdToolAdapter(BaseToolAdapter):
    """Tool adapter exposing deterministic crowd heuristics and optimal visiting windows."""

    def __init__(self, crowd_service: Any = None, db: Session | None = None) -> None:
        if crowd_service is None:
            from app.services.crowd.service import CrowdService
            crowd_service = CrowdService()
        self.crowd_service = crowd_service
        self.db = db
        self._definition = ToolDefinition(
            name="estimate_crowd",
            description="Estimate crowd level (low/moderate/high) and recommended visiting window for a destination based on category priors, operating hours, and time.",
            input_schema={
                "type": "object",
                "properties": {
                    "place_id": {"type": "string", "description": "Place identifier or reference name."},
                    "place_name": {"type": "string", "description": "Place name (e.g. 'Konark Sun Temple', 'Jagannath Temple')."},
                    "arrival_datetime": {"type": "string", "description": "ISO datetime or time string (e.g. '2026-09-01T12:00:00' or '12:00')."},
                    "arrival_time": {"type": "string", "description": "Time string (e.g. '12:00', '18:30')."},
                    "avoid_crowds": {"type": "boolean", "description": "True if user requested crowd avoidance."},
                    "weather_context": {"type": "object", "description": "Optional weather context dictionary."},
                },
            },
        )

    @property
    def definition(self) -> ToolDefinition:
        return self._definition

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        try:
            place_id = arguments.get("place_id")
            place_name = arguments.get("place_name")
            arrival_dt = arguments.get("arrival_datetime") or arguments.get("arrival_time")
            avoid_crowds = bool(arguments.get("avoid_crowds", False))
            weather_ctx = arguments.get("weather_context")

            # Resolve place
            place_obj = None
            if self.db is not None and place_id:
                try:
                    from app.models.place import Place
                    import uuid
                    try:
                        place_obj = self.db.get(Place, uuid.UUID(str(place_id)))
                    except Exception:
                        place_obj = None
                    if place_obj is None and hasattr(self.db, "query"):
                        place_obj = self.db.query(Place).filter(
                            (Place.id == str(place_id)) | (Place.name.ilike(f"%{place_name or place_id}%"))
                        ).first()
                except Exception:
                    place_obj = None

            if place_obj is None:
                # Fallback to dictionary representation
                p_name = place_name or place_id or "Unknown"
                category = "heritage"
                p_lower = p_name.lower()
                if "temple" in p_lower or "mandir" in p_lower:
                    category = "temple"
                elif "beach" in p_lower or "sea" in p_lower:
                    category = "beach"
                elif "museum" in p_lower:
                    category = "museum"
                elif "waterfall" in p_lower:
                    category = "waterfall"
                elif "nature" in p_lower or "hill" in p_lower or "sanctuary" in p_lower:
                    category = "nature"
                elif "market" in p_lower or "bazaar" in p_lower:
                    category = "market"

                place_obj = {
                    "id": place_id or "p_unknown",
                    "name": p_name,
                    "category": category,
                }

            estimate = self.crowd_service.estimate_crowd(
                place=place_obj,
                arrival_datetime=arrival_dt,
                avoid_crowds=avoid_crowds,
                weather_context=weather_ctx,
            )
            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self.definition.name,
                status=ToolStatus.OK if estimate.level != "unknown" or estimate.recommended_window else ToolStatus.OK,
                data=estimate.model_dump(mode="json"),
            )
        except Exception as error:
            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self.definition.name,
                status=ToolStatus.ERROR,
                reason="Crowd estimation tool failed.",
                error=str(error),
            )


class GetTransitOptionsToolAdapter(BaseToolAdapter):
    """Tool adapter exposing verified public-transit options (CRUT Mo Bus / Ama Bus)."""

    def __init__(self, transport_service: Any = None, db: Session | None = None) -> None:
        if transport_service is None:
            from app.transport.service import MappingPlaceResolver, TransportService
            transport_service = TransportService(MappingPlaceResolver({}))
        self.transport_service = transport_service
        self.db = db
        self._definition = ToolDefinition(
            name="get_transit_options",
            description="Get verified public-transit options, connecting routes, stops, and schedules between two Odisha destinations.",
            input_schema={
                "type": "object",
                "required": ["origin_id", "destination_id"],
                "properties": {
                    "origin_id": {"type": "string", "description": "Origin place or stop identifier."},
                    "destination_id": {"type": "string", "description": "Destination place or stop identifier."},
                    "origin_name": {"type": "string", "description": "Origin place name."},
                    "destination_name": {"type": "string", "description": "Destination place name."},
                    "preferred_mode": {"type": "string", "description": "Preferred transit mode (e.g. 'bus', 'walk')."},
                },
            },
        )

    @property
    def definition(self) -> ToolDefinition:
        return self._definition

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        try:
            from app.ai.schemas import PlanTransportHopArgs
            from app.schemas.common import PlaceSummary, PlanningConstraints

            origin_id = arguments.get("origin_id") or arguments.get("origin_name") or "from_place"
            dest_id = arguments.get("destination_id") or arguments.get("destination_name") or "to_place"
            origin_name = arguments.get("origin_name") or str(origin_id)
            dest_name = arguments.get("destination_name") or str(dest_id)

            from_place = PlaceSummary(id=str(origin_id), name=origin_name, category="transit_hub")
            to_place = PlaceSummary(id=str(dest_id), name=dest_name, category="destination")

            hop_args = PlanTransportHopArgs(
                from_place=from_place,
                to_place=to_place,
                constraints=PlanningConstraints(days=1),
                from_sequence=1,
                to_sequence=2,
            )
            hop = self.transport_service.plan_transport_hop(hop_args)

            if hop.mode == "unavailable" or not hop.legs:
                return ToolResult(
                    tool_call_id=tool_call_id,
                    tool_name=self.definition.name,
                    status=ToolStatus.OK,
                    data={
                        "available": False,
                        "message": "No verified public-transit option is currently available for this leg.",
                        "reason": hop.reason or "No connecting route in verified graph.",
                        "claim_type": "unknown",
                        "source": "O-Travelz transit graph",
                    },
                )

            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self.definition.name,
                status=ToolStatus.OK,
                data={
                    "available": True,
                    "mode": hop.mode,
                    "estimated_minutes": hop.estimated_minutes,
                    "legs": [leg.model_dump(mode="json") for leg in hop.legs],
                    "data_tier": hop.data_tier.value,
                    "claim_type": "scheduled",
                    "source": "CRUT Mo Bus / Ama Bus verified timetable graph",
                },
            )
        except Exception as error:
            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self.definition.name,
                status=ToolStatus.ERROR,
                reason="Transit options tool failed.",
                error=str(error),
            )


class ReplaceItineraryStopToolAdapter(BaseToolAdapter):
    """Tool adapter exposing deterministic single-stop replacement."""

    def __init__(
        self,
        repository: Any = None,
        transport_service: Any = None,
        crowd_service: Any = None,
        weather_service: Any = None,
    ) -> None:
        from app.services.itinerary.replacement import StopReplacementService
        self.replacement_service = StopReplacementService(
            repository=repository,
            transport_service=transport_service,
            crowd_service=crowd_service,
            weather_service=weather_service,
        )
        self._definition = ToolDefinition(
            name="replace_itinerary_stop",
            description="Replace a single stop in an existing itinerary with a verified alternative based on weather, crowd, mobility, or interest reasons, recalculating adjacent hops.",
            input_schema={
                "type": "object",
                "properties": {
                    "day_number": {"type": "integer", "default": 1, "description": "Day number (1-indexed)."},
                    "stop_sequence": {"type": "integer", "default": 1, "description": "Stop sequence (1-indexed)."},
                    "reason": {"type": "string", "enum": ["weather", "crowd", "walking", "interest", "closed", "user_request", "transport", "other"], "default": "user_request"},
                    "itinerary": {"type": "object", "description": "Structured ItineraryResponse payload."},
                    "preference_overrides": {"type": "object", "description": "Optional updated preferences/interests."},
                },
            },
        )

    @property
    def definition(self) -> ToolDefinition:
        return self._definition

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        try:
            from app.schemas.itinerary import ItineraryResponse

            raw_itinerary = arguments.get("itinerary")
            if not raw_itinerary:
                return ToolResult(
                    tool_call_id=tool_call_id,
                    tool_name=self.definition.name,
                    status=ToolStatus.ERROR,
                    reason="Itinerary is required for single stop replacement.",
                )

            itinerary = ItineraryResponse.model_validate(raw_itinerary)
            day_number = int(arguments.get("day_number", 1))
            stop_sequence = int(arguments.get("stop_sequence", 1))
            reason = str(arguments.get("reason", "user_request"))
            pref_overrides = arguments.get("preference_overrides")

            success, msg, updated_itinerary, replacement_place, evidence = self.replacement_service.replace_stop(
                itinerary=itinerary,
                day_number=day_number,
                stop_sequence=stop_sequence,
                reason=reason,
                preference_overrides=pref_overrides,
            )

            if not success or updated_itinerary is None:
                return ToolResult(
                    tool_call_id=tool_call_id,
                    tool_name=self.definition.name,
                    status=ToolStatus.OK,
                    data={
                        "available": False,
                        "message": msg,
                        "claim_type": "unknown",
                    },
                )

            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self.definition.name,
                status=ToolStatus.OK,
                data={
                    "available": True,
                    "message": msg,
                    "updated_itinerary": updated_itinerary.model_dump(mode="json"),
                    "replacement_place": replacement_place.model_dump(mode="json") if replacement_place else None,
                    "evidence_items": [e.model_dump(mode="json") for e in evidence],
                    "claim_type": "verified",
                },
            )
        except Exception as error:
            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self.definition.name,
                status=ToolStatus.ERROR,
                reason="Replace itinerary stop tool failed.",
                error=str(error),
            )


class GetNearbyServicesToolAdapter(BaseToolAdapter):
    """Tool adapter exposing deterministic nearby service discovery."""

    def __init__(self) -> None:
        self._tool = GetNearbyServicesTool()
        self._definition = ToolDefinition(
            name="get_nearby_services",
            description=(
                "Find verified nearby essential services (healthcare, hospitals, police stations, "
                "hotels, restaurants, petrol pumps, transit stops, ATMs) around coordinates in Odisha."
            ),
            input_schema={
                "type": "object",
                "required": ["lat", "lon"],
                "properties": {
                    "lat": {"type": "number", "description": "WGS84 Latitude."},
                    "lon": {"type": "number", "description": "WGS84 Longitude."},
                    "category": {
                        "type": "string",
                        "enum": ["healthcare", "police", "hotel", "restaurant", "fuel", "transit", "atm"],
                        "description": "Category filter.",
                    },
                    "subcategory": {"type": "string", "description": "Subcategory filter."},
                    "radius_km": {"type": "number", "default": 5.0, "description": "Initial search radius in km."},
                    "limit": {"type": "integer", "default": 10, "description": "Max results to return."},
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


class GetDestinationSafetyToolAdapter(BaseToolAdapter):
    """Tool adapter exposing verified destination safety profiles and emergency helplines."""

    def __init__(self) -> None:
        self._tool = GetDestinationSafetyTool()
        self._definition = ToolDefinition(
            name="get_destination_safety",
            description=(
                "Retrieve authoritative destination-specific safety advisories, emergency helplines, "
                "nearest police station, and nearest hospital for a tourist destination in Odisha."
            ),
            input_schema={
                "type": "object",
                "required": ["destination_id_or_name"],
                "properties": {
                    "destination_id_or_name": {
                        "type": "string",
                        "description": "Canonical destination ID (e.g. 'round2_east_001') or destination name (e.g. 'Dhabaleswar Island Temple').",
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


def create_default_tool_registry(
    db: Session,
    itinerary_service: ItineraryService | None = None,
    transport_service: Any = None,
    weather_service: Any = None,
    crowd_service: Any = None,
) -> ToolRegistry:
    """Create and return a ToolRegistry populated with canonical O-Travelz domain tools."""
    registry = ToolRegistry()
    registry.register(SearchPlacesToolAdapter(db))

    if itinerary_service is not None and hasattr(itinerary_service, "repository"):
        repo = itinerary_service.repository
    else:
        from app.services.ranking.repository import SQLAlchemyPlaceRepository
        repo = SQLAlchemyPlaceRepository(db)

    if itinerary_service is None:
        from app.services.itinerary import ItineraryService
        itinerary_service = ItineraryService(repo, transport_service)


    if weather_service is None:
        from app.services.weather.service import WeatherService
        weather_service = WeatherService()

    if crowd_service is None:
        from app.services.crowd.service import CrowdService
        crowd_service = CrowdService()

    registry.register(BuildItineraryToolAdapter(itinerary_service))
    registry.register(PlanTransportHopToolAdapter(transport_service))
    registry.register(GetProviderStatusToolAdapter(transport_service))
    registry.register(GetWeatherToolAdapter(weather_service))
    registry.register(EstimateCrowdToolAdapter(crowd_service, db=db))
    registry.register(GetTransitOptionsToolAdapter(transport_service, db=db))
    registry.register(ReplaceItineraryStopToolAdapter(repository=repo, transport_service=transport_service, crowd_service=crowd_service, weather_service=weather_service))
    registry.register(GetNearbyServicesToolAdapter())
    registry.register(GetDestinationSafetyToolAdapter())
    return registry

