"""Deterministic tool execution boundary for AI grounding.

Safely mediates between untrusted model tool-call outputs and verified
internal domain services. Enforces tool allowlisting, argument validation,
and defensive exception handling with truthful status codes.
"""
from __future__ import annotations

from typing import Any

from pydantic import ValidationError

from app.ai.contracts import ToolCall, ToolResult, ToolStatus
from app.ai.registry import ToolRegistry


class ToolExecutionBoundary:
    """Strict execution boundary executing only explicitly registered tools."""

    def __init__(self, registry: ToolRegistry) -> None:
        self.registry = registry

    def execute(self, tool_call: ToolCall | dict[str, Any]) -> ToolResult:
        """Execute a validated model tool call against the registry.

        Returns a canonical ToolResult with appropriate ToolStatus.
        Never raises uncaught domain exceptions or allows arbitrary execution.
        """
        # 1. Parse and validate ToolCall contract
        if isinstance(tool_call, dict):
            try:
                call = ToolCall.model_validate(tool_call)
            except ValidationError as err:
                return ToolResult(
                    tool_call_id=str(tool_call.get("id", "")) or None,
                    tool_name=str(tool_call.get("name", "unknown")),
                    status=ToolStatus.INVALID,
                    reason="Malformed ToolCall schema.",
                    error=str(err),
                )
        elif isinstance(tool_call, ToolCall):
            call = tool_call
        else:
            return ToolResult(
                tool_name="unknown",
                status=ToolStatus.INVALID,
                reason="Input must be a ToolCall instance or dict.",
                error="Invalid tool_call type.",
            )

        # 2. Allowlist resolution: Tool must exist in explicit registry
        tool_adapter = self.registry.get(call.name)
        if tool_adapter is None:
            available = self.registry.list_tool_names()
            return ToolResult(
                tool_call_id=call.id,
                tool_name=call.name,
                status=ToolStatus.UNKNOWN,
                reason=f"Tool '{call.name}' is not recognized in the approved tool registry.",
                error=f"Unknown tool '{call.name}'. Registered tools: {available}",
            )

        # 3. Defensive argument execution through registered adapter
        try:
            result = tool_adapter.execute(call.arguments, tool_call_id=call.id)
            if not isinstance(result, ToolResult):
                return ToolResult(
                    tool_call_id=call.id,
                    tool_name=call.name,
                    status=ToolStatus.ERROR,
                    reason="Tool executor returned non-ToolResult output.",
                    error="Invalid tool implementation return type.",
                )
            if not result.tool_call_id:
                result.tool_call_id = call.id
            return result
        except ValidationError as val_err:
            return ToolResult(
                tool_call_id=call.id,
                tool_name=call.name,
                status=ToolStatus.INVALID,
                reason=f"Argument validation failed for tool '{call.name}'.",
                error=str(val_err),
            )
        except Exception as exc:
            return ToolResult(
                tool_call_id=call.id,
                tool_name=call.name,
                status=ToolStatus.ERROR,
                reason=f"Execution failure during tool '{call.name}'.",
                error=str(exc),
            )

    def execute_all(self, tool_calls: list[ToolCall | dict[str, Any]]) -> list[ToolResult]:
        """Execute a batch of tool calls sequentially."""
        return [self.execute(call) for call in tool_calls]
