"""Deterministic search and knowledge retrieval tool adapter for AI grounding."""
from __future__ import annotations

from typing import Any
from sqlalchemy.orm import Session

from app.ai.schemas import SearchPlacesArgs
from app.ai.tools.common import ToolResult, ToolStatus
from app.services.search.search_models import SearchQueryParams
from app.services.search.search_service import SearchService


class SearchPlacesTool:
    name = "search_places"

    def __init__(self, db: Session):
        self.db = db

    def execute(self, raw_args: Any) -> ToolResult:
        try:
            if isinstance(raw_args, dict):
                args = SearchPlacesArgs.model_validate(raw_args)
            elif isinstance(raw_args, SearchPlacesArgs):
                args = raw_args
            else:
                args = SearchPlacesArgs.model_validate(raw_args)

            # Map search arguments into canonical search query params
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
            return ToolResult(tool_name=self.name, status=ToolStatus.OK, data=records)
        except Exception as error:
            return ToolResult(
                tool_name=self.name,
                status=ToolStatus.ERROR,
                reason="Search places tool failed.",
                error=str(error),
            )
