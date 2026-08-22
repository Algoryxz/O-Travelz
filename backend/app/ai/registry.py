"""Provider-neutral AI tool registry.

Maintains an explicit allowlist of deterministic O-Travelz domain tools,
preventing arbitrary code execution and unknown callable injection.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Callable

from app.ai.contracts import ToolDefinition, ToolResult, ToolStatus


class ToolRegistryError(Exception):
    """Base error for tool registry operations."""


class DuplicateToolError(ToolRegistryError):
    """Raised when attempting to register a tool whose name is already registered."""


class UnknownToolError(ToolRegistryError):
    """Raised when attempting to resolve a tool that is not in the registry."""


class BaseToolAdapter(ABC):
    """Abstract base class for domain tools exposed to AI providers."""

    @property
    @abstractmethod
    def definition(self) -> ToolDefinition:
        """Return the JSON-schema-compatible tool declaration."""
        raise NotImplementedError

    @abstractmethod
    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        """Execute the tool deterministically against verified domain services."""
        raise NotImplementedError


class FunctionalToolAdapter(BaseToolAdapter):
    """Tool adapter wrapping a callable and a ToolDefinition."""

    def __init__(
        self,
        tool_definition: ToolDefinition,
        executor: Callable[[dict[str, Any], str | None], ToolResult] | Callable[[dict[str, Any]], ToolResult],
    ):
        self._definition = tool_definition
        self._executor = executor

    @property
    def definition(self) -> ToolDefinition:
        return self._definition

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        try:
            # Check if executor accepts tool_call_id parameter
            import inspect
            sig = inspect.signature(self._executor)
            if len(sig.parameters) >= 2:
                return self._executor(arguments, tool_call_id)  # type: ignore
            else:
                res = self._executor(arguments)  # type: ignore
                if isinstance(res, ToolResult) and tool_call_id and not res.tool_call_id:
                    res.tool_call_id = tool_call_id
                return res
        except Exception as err:
            return ToolResult(
                tool_call_id=tool_call_id,
                tool_name=self._definition.name,
                status=ToolStatus.ERROR,
                reason=f"Execution error in '{self._definition.name}'",
                error=str(err),
            )


class ToolRegistry:
    """Explicit, allowlisted registry of verified domain tools."""

    def __init__(self) -> None:
        self._tools: dict[str, BaseToolAdapter] = {}

    def register(
        self,
        tool: BaseToolAdapter | None = None,
        *,
        definition: ToolDefinition | None = None,
        executor: Callable[[dict[str, Any]], ToolResult] | None = None,
    ) -> None:
        """Register a tool in the registry.

        Supports registering a BaseToolAdapter instance or a (definition, executor) pair.
        Raises DuplicateToolError if a tool with the same name already exists.
        """
        if tool is not None:
            adapter = tool
        elif definition is not None and executor is not None:
            adapter = FunctionalToolAdapter(definition, executor)
        else:
            raise ToolRegistryError("Must provide either a BaseToolAdapter or both definition and executor.")

        name = adapter.definition.name
        if not name:
            raise ToolRegistryError("Tool definition name must be non-empty.")

        if name in self._tools:
            raise DuplicateToolError(
                f"Tool '{name}' is already registered in the registry. Duplicate registrations are prohibited."
            )

        self._tools[name] = adapter

    def get(self, name: str) -> BaseToolAdapter | None:
        """Retrieve a tool adapter by name, or return None if not registered."""
        return self._tools.get(name)

    def get_or_raise(self, name: str) -> BaseToolAdapter:
        """Retrieve a tool adapter by name, or raise UnknownToolError."""
        tool = self.get(name)
        if tool is None:
            available = sorted(self._tools.keys())
            raise UnknownToolError(
                f"Tool '{name}' is not registered. Available tools: {available}"
            )
        return tool

    def has_tool(self, name: str) -> bool:
        """Return True if tool is registered, False otherwise."""
        return name in self._tools

    def list_definitions(self) -> list[ToolDefinition]:
        """Return provider-neutral ToolDefinitions for all registered tools."""
        return [tool.definition for tool in self._tools.values()]

    def list_tool_names(self) -> list[str]:
        """Return sorted list of registered tool names."""
        return sorted(self._tools.keys())

    def unregister(self, name: str) -> bool:
        """Remove a tool from the registry. Returns True if removed, False if not found."""
        if name in self._tools:
            del self._tools[name]
            return True
        return False

    def clear(self) -> None:
        """Clear all registered tools."""
        self._tools.clear()

    def __len__(self) -> int:
        return len(self._tools)
