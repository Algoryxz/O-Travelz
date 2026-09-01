"""Deterministic tool adapters used by the AI orchestrator and tool-calling adapters."""

from app.ai.tools.adapters import (
    BuildItineraryToolAdapter,
    EstimateCrowdToolAdapter,
    GetProviderStatusToolAdapter,
    GetTransitOptionsToolAdapter,
    GetWeatherToolAdapter,
    PlanTransportHopToolAdapter,
    ReplaceItineraryStopToolAdapter,
    SearchPlacesToolAdapter,
    GetNearbyServicesToolAdapter,
    GetDestinationSafetyToolAdapter,
    create_default_tool_registry,
)
from app.ai.tools.build_itinerary import BuildItineraryTool
from app.ai.tools.common import ToolResult, ToolStatus
from app.ai.tools.plan_transport_hop import PlanTransportHopTool
from app.ai.tools.provider_status import GetProviderStatusTool
from app.ai.tools.search_places import SearchPlacesTool
from app.ai.tools.get_nearby_services import GetNearbyServicesTool
from app.ai.tools.get_destination_safety import GetDestinationSafetyTool

__all__ = [
    "BuildItineraryTool",
    "BuildItineraryToolAdapter",
    "EstimateCrowdToolAdapter",
    "GetProviderStatusTool",
    "GetProviderStatusToolAdapter",
    "GetTransitOptionsToolAdapter",
    "GetWeatherToolAdapter",
    "PlanTransportHopTool",
    "PlanTransportHopToolAdapter",
    "ReplaceItineraryStopToolAdapter",
    "SearchPlacesTool",
    "SearchPlacesToolAdapter",
    "GetNearbyServicesTool",
    "GetNearbyServicesToolAdapter",
    "GetDestinationSafetyTool",
    "GetDestinationSafetyToolAdapter",
    "ToolResult",
    "ToolStatus",
    "create_default_tool_registry",
]

