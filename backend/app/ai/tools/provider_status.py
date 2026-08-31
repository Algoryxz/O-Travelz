"""Thin adapter for deterministic provider status."""
from __future__ import annotations

from typing import Any

from app.ai.schemas import GetProviderStatusArgs
from app.ai.tools.common import ToolResult, ToolStatus
from app.schemas.transport import ProviderNotAvailableError


class GetProviderStatusTool:
    name = "get_provider_status"

    def __init__(self, service: Any):
        self.service = service

    def execute(self, raw_args: Any) -> ToolResult:
        try:
            args = GetProviderStatusArgs.model_validate(raw_args)
            status = self.service.get_provider_status(args)
            return ToolResult(tool_name=self.name, status=ToolStatus.OK, data=status)
        except ProviderNotAvailableError as error:
            return ToolResult(tool_name=self.name, status=ToolStatus.UNKNOWN, reason=str(error))
        except ValueError as error:
            return ToolResult(tool_name=self.name, status=ToolStatus.INVALID, reason="Invalid provider status arguments.", error=str(error))
        except Exception as error:
            return ToolResult(tool_name=self.name, status=ToolStatus.ERROR, reason="Provider status lookup failed.", error=str(error))
