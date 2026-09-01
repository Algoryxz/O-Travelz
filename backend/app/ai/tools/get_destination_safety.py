"""Deterministic destination safety advisory retrieval tool adapter for AI grounding."""
from __future__ import annotations

from typing import Any
from app.ai.schemas import GetDestinationSafetyArgs
from app.ai.tools.common import ToolResult, ToolStatus
from app.services.essentials.service import EssentialsService


class GetDestinationSafetyTool:
    name = "get_destination_safety"

    def execute(self, raw_args: Any) -> ToolResult:
        try:
            if isinstance(raw_args, dict):
                args = GetDestinationSafetyArgs.model_validate(raw_args)
            elif isinstance(raw_args, GetDestinationSafetyArgs):
                args = raw_args
            else:
                args = GetDestinationSafetyArgs.model_validate(raw_args)

            advisory = EssentialsService.get_destination_safety(
                destination_id_or_name=args.destination_id_or_name
            )
            if not advisory:
                return ToolResult(
                    tool_name=self.name,
                    status=ToolStatus.OK,
                    data={
                        "found": False,
                        "message": "Standard safety rules apply: Dial 112 for All Emergency Services or 108 for Medical Emergency.",
                    },
                )
            return ToolResult(
                tool_name=self.name,
                status=ToolStatus.OK,
                data={
                    "found": True,
                    "advisory": advisory.model_dump(),
                },
            )
        except Exception as error:
            return ToolResult(
                tool_name=self.name,
                status=ToolStatus.ERROR,
                reason="Get destination safety tool failed.",
                error=str(error),
            )
