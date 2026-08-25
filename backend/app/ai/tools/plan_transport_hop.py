"""Thin adapter for the existing deterministic transport service."""
from __future__ import annotations

from typing import Any

from app.ai.schemas import PlanTransportHopArgs
from app.ai.tools.common import ToolResult, ToolStatus
from app.schemas.transport import TransportHopContract


class PlanTransportHopTool:
    name = "plan_transport_hop"

    def __init__(self, service: Any):
        self.service = service

    def execute(self, raw_args: Any) -> ToolResult:
        try:
            args = PlanTransportHopArgs.model_validate(raw_args)
            hop = self.service.plan_transport_hop(args)
            status = ToolStatus.UNAVAILABLE if hop.mode == "unavailable" else ToolStatus.OK
            return ToolResult(tool_name=self.name, status=status, data=TransportHopContract.model_validate(hop), reason=hop.reason)
        except ValueError as error:
            return ToolResult(tool_name=self.name, status=ToolStatus.INVALID, reason="Invalid transport tool arguments.", error=str(error))
        except Exception as error:
            return ToolResult(tool_name=self.name, status=ToolStatus.ERROR, reason="Transport planning failed.", error=str(error))
