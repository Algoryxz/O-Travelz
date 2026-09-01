"""Deterministic nearby service retrieval tool adapter for AI grounding."""
from __future__ import annotations

from typing import Any
from app.ai.schemas import GetNearbyServicesArgs
from app.ai.tools.common import ToolResult, ToolStatus
from app.services.essentials.service import EssentialsService


class GetNearbyServicesTool:
    name = "get_nearby_services"

    def execute(self, raw_args: Any) -> ToolResult:
        try:
            if isinstance(raw_args, dict):
                args = GetNearbyServicesArgs.model_validate(raw_args)
            elif isinstance(raw_args, GetNearbyServicesArgs):
                args = raw_args
            else:
                args = GetNearbyServicesArgs.model_validate(raw_args)

            records = EssentialsService.search_nearby_services(
                lat=args.lat,
                lon=args.lon,
                category=args.category, # type: ignore
                subcategory=args.subcategory,
                requested_radius_km=args.radius_km,
                limit=args.limit,
            )
            return ToolResult(
                tool_name=self.name,
                status=ToolStatus.OK,
                data=records.model_dump(),
            )
        except Exception as error:
            return ToolResult(
                tool_name=self.name,
                status=ToolStatus.ERROR,
                reason="Get nearby services tool failed.",
                error=str(error),
            )
