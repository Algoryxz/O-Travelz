"""Current-turn grounding for model-selected factual claims."""
from __future__ import annotations

import json
import copy
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from pydantic import BaseModel

from app.ai.schemas import ModelResponse, ResponseFraming
from app.schemas.itinerary import ItineraryResponse
from app.schemas.transport import ProviderStatusContract, TransportHopContract


@dataclass(frozen=True)
class GroundingFact:
    fact_id: str
    value: Any
    rendered: str


@dataclass
class GroundingContext:
    """Facts available during exactly one orchestrator invocation."""

    tool_results: list[Any] = field(default_factory=list)
    itinerary: ItineraryResponse | None = None
    transport_results: list[TransportHopContract] = field(default_factory=list)
    provider_status_results: list[ProviderStatusContract] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    facts: dict[str, GroundingFact] = field(default_factory=dict)

    def snapshot(self) -> "GroundingSnapshot":
        """Return an isolated model view; the authoritative context stays private."""
        return GroundingSnapshot(
            tool_results=tuple(copy.deepcopy(self.tool_results)),
            itinerary=copy.deepcopy(self.itinerary),
            transport_results=tuple(copy.deepcopy(self.transport_results)),
            provider_status_results=tuple(copy.deepcopy(self.provider_status_results)),
            warnings=tuple(self.warnings),
            facts=copy.deepcopy(self.facts),
        )

    def record(self, result: Any) -> None:
        self.tool_results.append(result)
        data = getattr(result, "data", None)
        if isinstance(data, ItineraryResponse):
            self.itinerary = data
            self._record_itinerary(data)
        elif isinstance(data, TransportHopContract):
            self.transport_results.append(data)
            self._record_transport(f"transport.{len(self.transport_results)}", data)
        elif isinstance(data, ProviderStatusContract):
            self.provider_status_results.append(data)
            self._record_provider(data)
        reason = getattr(result, "reason", None)
        if reason and getattr(result, "status", None).value != "ok":
            self.warnings.append(reason)
            if data is None:
                status = getattr(result, "status", None)
                status_value = getattr(status, "value", str(status))
                fact_id = f"tool.{result.tool_name}.status"
                value = {"status": status_value, "reason": reason}
                self.facts[fact_id] = GroundingFact(
                    fact_id,
                    value,
                    f"{result.tool_name} status is {status_value}: {reason}",
                )

    def _record_itinerary(self, itinerary: ItineraryResponse) -> None:
        stop_count = sum(len(day.stops) for day in itinerary.days)
        summary_value = {"days": len(itinerary.days), "stops": stop_count}
        self.facts["itinerary.summary"] = GroundingFact(
            "itinerary.summary",
            summary_value,
            f"I built a {len(itinerary.days)}-day itinerary with {stop_count} planned stop(s).",
        )
        for day in itinerary.days:
            for stop in day.stops:
                fact_id = f"itinerary.stop.{stop.place.id}"
                self.facts[fact_id] = GroundingFact(fact_id, stop.place.name, f"It includes {stop.place.name}.")
            for hop in day.hops:
                self._record_transport(f"transport.day{day.day_number}.{hop.from_sequence}.{hop.to_sequence}", hop)

    def _record_transport(self, fact_id: str, hop: TransportHopContract) -> None:
        value = {
            "mode": hop.mode,
            "estimated_minutes": hop.estimated_minutes,
            "estimated_cost": hop.estimated_cost,
            "data_tier": hop.data_tier.value,
            "reason": hop.reason,
        }
        if hop.mode == "unavailable":
            rendered = f"A transport hop is unavailable: {hop.reason}"
        else:
            details = [f"A {hop.mode} transport hop is available"]
            if hop.estimated_minutes is not None:
                details.append(f"with an estimated duration of {hop.estimated_minutes} minute(s)")
            if hop.estimated_cost is not None:
                details.append(f"and an estimated cost of {hop.estimated_cost}")
            if hop.data_tier.value == "unknown":
                details.append("; provider/data freshness is unknown")
            rendered = " ".join(details) + "."
        self.facts[fact_id] = GroundingFact(fact_id, value, rendered)

    def _record_provider(self, status: ProviderStatusContract) -> None:
        fact_id = f"provider.{status.provider_id}"
        value = {"data_tier": status.data_tier.value, "notes": status.notes}
        freshness = "unknown" if status.data_tier.value == "unknown" else status.data_tier.value
        rendered = f"Provider {status.provider_id} has {freshness} data status."
        if status.notes:
            rendered += f" {status.notes}"
        self.facts[fact_id] = GroundingFact(fact_id, value, rendered)


def _canonical(value: Any) -> str:
    if isinstance(value, BaseModel):
        value = value.model_dump(mode="json")
    elif isinstance(value, Enum):
        value = value.value
    return json.dumps(value, sort_keys=True, separators=(",", ":"), default=str)


class GroundingBoundary:
    """Accept only claims whose id and value are present in current-turn facts."""

    def ground(self, draft: ModelResponse, context: GroundingContext) -> str:
        rendered: list[str] = []
        for claim in draft.claims:
            fact = context.facts.get(claim.fact_id)
            if fact is None or _canonical(fact.value) != _canonical(claim.value):
                continue
            rendered.append(fact.rendered)

        framing = {
            ResponseFraming.GROUNDED_RESULT: "Here is the grounded result.",
            ResponseFraming.GROUNDED_TRANSPORT: "Here are the grounded transport details.",
        }[draft.framing]
        # Arbitrary model prose is intentionally ignored. Factual language in
        # the product response can only come from accepted fact renderings.
        parts = [framing]
        parts.extend(rendered)
        return " ".join(parts)


@dataclass(frozen=True)
class GroundingSnapshot:
    """Deep-copied model input; mutation cannot affect the live turn context."""

    tool_results: tuple[Any, ...]
    itinerary: ItineraryResponse | None
    transport_results: tuple[TransportHopContract, ...]
    provider_status_results: tuple[ProviderStatusContract, ...]
    warnings: tuple[str, ...]
    facts: dict[str, GroundingFact]
