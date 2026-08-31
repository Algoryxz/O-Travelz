"""Privacy-safe telemetry recording for AI model interactions and routing decisions.

Collects lightweight operational metadata (latency, provider selected, fallback status,
grounding violations count, tool calls count) while strictly redacting credentials,
auth tokens, uploaded image bytes, and user personal data.
"""
from __future__ import annotations

import logging
import re
import threading
import time
from collections import deque
from typing import Any, List, Optional
from uuid import uuid4
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Patterns to scrub sensitive values from metadata
SECRET_PATTERNS = [
    re.compile(r"(?i)(bearer\s+)[a-zA-Z0-9_\-\.]{10,}"),
    re.compile(r"(?i)(api[_\-]?key['\":\s=]+)[a-zA-Z0-9_\-]{8,}"),
    re.compile(r"(?i)(secret['\":\s=]+)[a-zA-Z0-9_\-]{8,}"),
    re.compile(r"(?i)(password['\":\s=]+)[^\s,;'\"]+"),
    re.compile(r"data:image/[a-zA-Z0-9.+_-]+;base64,[a-zA-Z0-9+/=]{50,}"),
]


class AITelemetryEvent(BaseModel):
    """Structured privacy-safe telemetry event."""
    model_config = {"protected_namespaces": ()}

    timestamp: float = Field(default_factory=time.time, description="Unix timestamp of event.")
    request_id: str = Field(default_factory=lambda: f"req_{uuid4().hex[:8]}", description="Correlation identifier.")
    task_type: str = Field(default="general_conversation", description="Classified AI task type.")
    provider: str = Field(default="mock", description="AI provider or fallback identifier.")
    model_identifier: str = Field(default="none", description="Model/deployment name or deterministic engine.")
    latency_ms: float = Field(default=0.0, description="Total round-trip latency in milliseconds.")
    success: bool = Field(default=True, description="Whether execution succeeded without throwing an unhandled exception.")
    fallback_triggered: bool = Field(default=False, description="Whether fallback provider/rule engine was invoked.")
    tool_calls_count: int = Field(default=0, description="Number of verified domain tool calls performed.")
    grounding_rejections_count: int = Field(default=0, description="Number of ungrounded or hallucinated claims rejected.")
    claim_count: int = Field(default=0, description="Total claims produced.")
    unverified_claim_count: int = Field(default=0, description="Number of claims without verified provenance.")
    error_category: Optional[str] = Field(default=None, description="High-level failure category if applicable.")


class AITelemetryRecorder:
    """Thread-safe in-memory ring buffer recording operational AI telemetry."""

    def __init__(self, max_capacity: int = 500) -> None:
        self.max_capacity = max_capacity
        self._buffer: deque[AITelemetryEvent] = deque(maxlen=max_capacity)
        self._lock = threading.Lock()

    def record_event(
        self,
        task_type: str,
        provider: str,
        model_identifier: str,
        latency_ms: float,
        success: bool = True,
        fallback_triggered: bool = False,
        tool_calls_count: int = 0,
        grounding_rejections_count: int = 0,
        claim_count: int = 0,
        unverified_claim_count: int = 0,
        error_category: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> AITelemetryEvent:
        """Create, sanitize, and record a telemetry event."""
        # Sanitize error category / metadata strings
        clean_error = self._sanitize_text(error_category) if error_category else None
        clean_provider = self._sanitize_text(provider)
        clean_model = self._sanitize_text(model_identifier)

        event = AITelemetryEvent(
            request_id=request_id or f"req_{uuid4().hex[:8]}",
            task_type=task_type,
            provider=clean_provider,
            model_identifier=clean_model,
            latency_ms=round(max(0.0, float(latency_ms)), 2),
            success=success,
            fallback_triggered=fallback_triggered,
            tool_calls_count=max(0, int(tool_calls_count)),
            grounding_rejections_count=max(0, int(grounding_rejections_count)),
            claim_count=max(0, int(claim_count)),
            unverified_claim_count=max(0, int(unverified_claim_count)),
            error_category=clean_error,
        )

        with self._lock:
            self._buffer.append(event)

        logger.debug(
            "AITelemetry: [%s] provider=%s latency=%.1fms success=%s fallback=%s",
            event.task_type,
            event.provider,
            event.latency_ms,
            event.success,
            event.fallback_triggered,
        )
        return event

    def get_recent_events(self, limit: int = 100) -> List[AITelemetryEvent]:
        """Return the most recent telemetry events."""
        with self._lock:
            return list(self._buffer)[-limit:]

    def get_summary_statistics(self) -> dict[str, Any]:
        """Compute aggregate operational metrics across recorded events."""
        with self._lock:
            events = list(self._buffer)

        if not events:
            return {
                "total_events": 0,
                "success_rate": 1.0,
                "fallback_rate": 0.0,
                "average_latency_ms": 0.0,
                "total_tool_calls": 0,
                "total_grounding_rejections": 0,
                "total_unverified_claims": 0,
            }

        total = len(events)
        successes = sum(1 for e in events if e.success)
        fallbacks = sum(1 for e in events if e.fallback_triggered)
        total_latency = sum(e.latency_ms for e in events)
        total_tools = sum(e.tool_calls_count for e in events)
        total_rejections = sum(e.grounding_rejections_count for e in events)
        total_unverified = sum(e.unverified_claim_count for e in events)

        return {
            "total_events": total,
            "success_rate": round(successes / total, 3),
            "fallback_rate": round(fallbacks / total, 3),
            "average_latency_ms": round(total_latency / total, 1),
            "total_tool_calls": total_tools,
            "total_grounding_rejections": total_rejections,
            "total_unverified_claims": total_unverified,
        }

    def clear(self) -> None:
        """Clear all stored telemetry events (for testing)."""
        with self._lock:
            self._buffer.clear()

    @staticmethod
    def _sanitize_text(text: str) -> str:
        """Strip credentials, secrets, or raw base64 data."""
        if not text:
            return ""
        sanitized = text
        for pat in SECRET_PATTERNS:
            sanitized = pat.sub("[REDACTED]", sanitized)
        return sanitized


# Global telemetry singleton
ai_telemetry = AITelemetryRecorder()
