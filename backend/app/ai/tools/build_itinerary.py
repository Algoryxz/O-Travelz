"""Thin adapter for the existing deterministic itinerary service."""
from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.ai.schemas import BuildItineraryArgs
from app.ai.tools.common import ToolResult, ToolStatus

if TYPE_CHECKING:
    from app.services.itinerary.service import ItineraryService


class BuildItineraryTool:
    name = "build_itinerary"

    def __init__(self, service: ItineraryService):
        self.service = service

    def execute(self, raw_args: Any) -> ToolResult:
        from app.services.itinerary.service import ItineraryPlanningError

        try:
            args = BuildItineraryArgs.model_validate(raw_args)
            return ToolResult(tool_name=self.name, status=ToolStatus.OK, data=self.service.plan(args.constraints))
        except ItineraryPlanningError as error:
            return ToolResult(tool_name=self.name, status=ToolStatus.INVALID, reason=error.message, error=error.code)
        except Exception as error:
            return ToolResult(tool_name=self.name, status=ToolStatus.ERROR, reason="Itinerary planning failed.", error=str(error))
