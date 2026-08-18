"""Internal normalized result used by all AI tool adapters."""
from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import Field

from app.schemas.common import ContractModel


class ToolStatus(str, Enum):
    OK = "ok"
    UNAVAILABLE = "unavailable"
    UNKNOWN = "unknown"
    INVALID = "invalid"
    ERROR = "error"


class ToolResult(ContractModel):
    tool_name: str
    status: ToolStatus
    data: Any = None
    reason: str | None = None
    error: str | None = None
    warnings: list[str] = Field(default_factory=list)
