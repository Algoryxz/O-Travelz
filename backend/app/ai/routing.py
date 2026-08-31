"""Task-aware provider routing and capability model for AI backends.

Decouples high-level application tasks (e.g. vision, complex planning, fast explanation)
from specific LLM vendor implementations. Filters providers by capability and health
to ensure reliable zero-cost execution and fast failovers.
"""
from __future__ import annotations

import logging
import time
from enum import Enum
from typing import Any, List, Optional
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)


class TaskType(str, Enum):
    """Categorization of AI task requirements."""
    DETERMINISTIC_LOOKUP = "deterministic_lookup"
    VISION = "vision"
    COMPLEX_PLANNING = "complex_planning"
    MULTILINGUAL_SYNTHESIS = "multilingual_synthesis"
    FAST_EXPLANATION = "fast_explanation"
    TOOL_ROUTING = "tool_routing"
    GENERAL_CONVERSATION = "general_conversation"


class ProviderCapabilities(BaseModel):
    """Declared capabilities for an AI provider adapter."""
    text: bool = Field(default=True, description="Supports text generation and conversation.")
    vision: bool = Field(default=False, description="Supports multimodal image inputs.")
    tools: bool = Field(default=True, description="Supports function/tool calling JSON schemas.")
    structured_output: bool = Field(default=True, description="Reliable structured JSON output.")
    multilingual: bool = Field(default=True, description="Fluent multi-language text synthesis (Odia, Hindi, etc.).")
    complex_reasoning: bool = Field(default=True, description="High-capacity complex itinerary planning & constraint solving.")
    fast_inference: bool = Field(default=True, description="Low-latency fast token generation.")


class TaskRouter:
    """Routes application tasks to capable, healthy, and configured providers."""

    @staticmethod
    def get_required_capabilities(task_type: TaskType) -> dict[str, bool]:
        """Return boolean requirement filter for given task type."""
        if task_type == TaskType.DETERMINISTIC_LOOKUP:
            return {}
        if task_type == TaskType.VISION:
            return {"vision": True}
        if task_type == TaskType.COMPLEX_PLANNING:
            return {"complex_reasoning": True, "tools": True}
        if task_type == TaskType.TOOL_ROUTING:
            return {"tools": True}
        if task_type == TaskType.FAST_EXPLANATION:
            return {"fast_inference": True}
        if task_type == TaskType.MULTILINGUAL_SYNTHESIS:
            return {"multilingual": True}
        return {"text": True}

    @classmethod
    def filter_and_prioritize(
        cls,
        providers: List[Any],
        task_type: TaskType,
        remaining_budget_ms: float = 8000.0,
    ) -> List[Any]:
        """Filter provider candidate list based on task capabilities, health, and budget.

        Returns:
            Prioritized list of compatible, available providers. Empty list if none match or
            if task is DETERMINISTIC_LOOKUP (indicating immediate deterministic fallback).
        """
        # Deterministic lookup skips external providers completely
        if task_type == TaskType.DETERMINISTIC_LOOKUP:
            return []

        required_caps = cls.get_required_capabilities(task_type)
        candidate_providers: List[Any] = []

        for p in providers:
            # 1. Check capability declaration
            caps = getattr(p, "capabilities", None)
            if not isinstance(caps, ProviderCapabilities):
                if hasattr(p, "get_capabilities"):
                    caps = p.get_capabilities()
                if not isinstance(caps, ProviderCapabilities):
                    caps = getattr(type(p), "capabilities", None)
                if not isinstance(caps, ProviderCapabilities):
                    # Mock objects or unannotated providers: treat as standard capable provider
                    caps = ProviderCapabilities(text=True, vision=True, tools=True, complex_reasoning=True, fast_inference=True)

            # Verify all required capabilities are supported
            compatible = True
            for req_key, req_val in required_caps.items():
                if req_val and not getattr(caps, req_key, False):
                    compatible = False
                    break

            if not compatible:
                continue

            # 2. Check provider availability & configuration
            status = p.get_status() if hasattr(p, "get_status") else {}
            if not status.get("available", False):
                continue

            provider_name = status.get("provider", "unknown")

            # 3. Check circuit breaker state
            try:
                from app.ai.circuit_breaker import circuit_breaker
                if not circuit_breaker.is_allowed(provider_name):
                    logger.debug("TaskRouter: skipping provider '%s' (circuit OPEN)", provider_name)
                    continue
            except Exception:
                pass

            # 4. Check latency budget vs provider timeout
            configured_timeout_s = getattr(p, "timeout_seconds", 30.0)
            try:
                configured_timeout_s = float(configured_timeout_s)
            except Exception:
                configured_timeout_s = 30.0

            if remaining_budget_ms < (configured_timeout_s * 1000.0 * 0.1) and remaining_budget_ms < 500:
                logger.debug("TaskRouter: skipping provider '%s' (insufficient latency budget)", provider_name)
                continue

            candidate_providers.append(p)

        def _get_score(prov: Any, cap_attr: str) -> int:
            caps = getattr(prov, "capabilities", None)
            if isinstance(caps, ProviderCapabilities):
                return 1 if getattr(caps, cap_attr, False) else 0
            return 1

        # Prioritize according to task type
        if task_type == TaskType.FAST_EXPLANATION:
            candidate_providers.sort(key=lambda prov: _get_score(prov, "fast_inference"), reverse=True)
        elif task_type == TaskType.COMPLEX_PLANNING:
            candidate_providers.sort(key=lambda prov: _get_score(prov, "complex_reasoning"), reverse=True)

        return candidate_providers

