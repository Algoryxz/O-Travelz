"""Provider-neutral model boundary and deterministic test implementations."""
from __future__ import annotations

import re
from typing import Any, Protocol

from app.ai.schemas import IntentKind
from app.schemas.common import PlanningConstraints


class ModelAdapter(Protocol):
    """The only interface the orchestrator needs from a model provider."""

    def parse_intent(
        self,
        user_message: str,
        existing_constraints: PlanningConstraints | None = None,
    ) -> Any: ...

    def generate_response(self, context: Any) -> Any: ...


class FakeModelAdapter:
    """Scriptable, network-free model used by transcript tests.

    Values are intentionally returned without pre-validation so tests can
    reproduce malformed provider output and verify the orchestrator boundary.
    """

    def __init__(
        self,
        intent: Any | None = None,
        final_response: Any | None = None,
        *,
        intents: list[Any] | None = None,
        responses: list[Any] | None = None,
    ):
        self._intents = list(intents or ([] if intent is None else [intent]))
        self._responses = list(responses or ([] if final_response is None else [final_response]))

    def parse_intent(self, user_message: str, existing_constraints: PlanningConstraints | None = None) -> Any:
        if self._intents:
            return self._intents.pop(0)
        return {
            "kind": IntentKind.CLARIFICATION.value,
            "clarification": {
                "question": "What itinerary would you like me to plan?",
                "reason": "The test model has no scripted intent.",
            },
        }

    def generate_response(self, context: Any) -> Any:
        if self._responses:
            return self._responses.pop(0)
        return {"framing": "grounded_result", "claims": []}


class RuleBasedModelAdapter:
    """Small local fallback for the optional HTTP route.

    This is not a provider integration or itinerary engine.  It recognizes a
    narrow set of request words so the route remains usable without a network
    model; a future provider can implement the same ``ModelAdapter`` boundary.
    """

    _INTERESTS = ("heritage", "food", "temple", "history", "culture")

    def parse_intent(self, user_message: str, existing_constraints: PlanningConstraints | None = None) -> Any:
        text = user_message.strip().lower()
        if "less walking" in text or "avoid walking" in text or "walking" in text and "less" in text:
            return {
                "kind": IntentKind.UNSUPPORTED.value,
                "reason": "The current planner cannot optimize walking distance yet.",
            }

        if any(word in text for word in ("refine", "more food", "food focused", "food-focused")):
            if existing_constraints is None:
                return {
                    "kind": IntentKind.CLARIFICATION.value,
                    "clarification": {
                        "question": "Which existing itinerary should I refine?",
                        "reason": "A refinement needs current constraints.",
                    },
                }
            return {
                "kind": IntentKind.REFINEMENT.value,
                "constraint_update": {"interests": ["food"]},
                "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
            }

        match = re.search(r"(\d+)\s*[- ]?day", text)
        interests = [word for word in self._INTERESTS if word in text]
        if match:
            constraints = {"days": int(match.group(1)), "interests": interests}
            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": constraints,
                "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
            }

        return {
            "kind": IntentKind.CLARIFICATION.value,
            "clarification": {
                "question": "How many days should I plan, and what interests should I prioritize?",
                "reason": "The request does not include enough supported planning detail.",
            },
        }

    def generate_response(self, context: Any) -> Any:
        claims = [{"fact_id": fact_id, "value": fact.value} for fact_id, fact in context.facts.items()]
        return {"framing": "grounded_result", "claims": claims}
