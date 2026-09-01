# O-Travelz Phase 5 Scope Report

## State

**PHASE 5 — ACCEPTED WITH EXPLICIT LIMITATIONS**

This report records the approved implementation scope and the boundaries used for
the grounded AI foundation. Acceptance was recorded on 2026-08-18 after the final
grounding audit.

## Approved boundary

Phase 5 adds a conversational orchestration layer around the accepted Phase 4
deterministic backend:

```text
user message
  -> provider-neutral model adapter
  -> validated structured intent/tool decision
  -> approved deterministic tool adapters
  -> current-turn grounding context
  -> grounded AIResponse
```

The deterministic backend remains authoritative for constraints, place selection,
itinerary sequencing, transport routing, provider status, and all factual values.
The AI layer does not rank, route, calculate, query the database, research facts,
or edit itinerary fields.

## In-scope decisions

- `AIResponse` is a small conversational envelope whose `itinerary` field is the
  existing `ItineraryResponse` model.
- `AIStatus` supports `success`, `clarification`, `unsupported`, and `error`.
- `AIIntent` supports only `planning`, `refinement`, `clarification`, and
  `unsupported`.
- The model boundary is the `ModelAdapter` protocol. No provider SDK or external
  network call is included.
- `FakeModelAdapter` provides scripted intent and response data for deterministic
  tests. `RuleBasedModelAdapter` is a narrow local fallback for the HTTP route.
- The approved tool surface is `build_itinerary`, `plan_transport_hop`, and
  `get_provider_status`.
- Every adapter returns a normalized internal `ToolResult` with a tool name,
  status, data, and reason/error fields.
- Each orchestration call creates a fresh `GroundingContext`. Factual model claims
  are accepted only when both the fact identifier and value match a deterministic
  fact recorded during that call.
- Final public prose uses only a fixed non-factual framing plus deterministic
  renderings of accepted claims. Arbitrary model message text is ignored.
- The immutable/deep-copied model snapshot prevents model adapter mutation of the
  authoritative turn context.
- Phase 4 `ItineraryResponse.explanation` remains unchanged and empty. AI prose is
  returned through `AIResponse.message`.
- `POST /ai/plan` is the minimal conversational HTTP boundary. Existing
  `POST /itinerary/plan` behavior is unchanged.

## Supported refinement semantics

The orchestrator can re-plan updates to the fields whose current deterministic
services actually honor them:

- `days`
- `interests`
- `dates`
- `start`

Refinements are patch-shaped, validated with Pydantic, merged with the supplied
existing constraints, and sent through the existing itinerary service. AI cannot
modify stop names, order, transport details, durations, fares, providers,
coordinates, or route data.

## Explicitly unsupported behavior

The current transport service does not optimize walking, pace, or transport
budget. Non-empty `mobility`, `pace`, or `budget_transport_per_day` values are
therefore reported as unsupported; they are not silently added to a successful
plan. Unavailable transport is preserved as an unavailable domain result and is
explained without invented alternatives, costs, durations, schedules, or provider
capabilities.

## Deferred schemas

The existing `SearchPlacesArgs` and `GetPlaceDetailsArgs` schemas remain in place
as historical contract definitions. No speculative search or place-details
service was added because the approved Phase 5 flow does not require either one.

## Out of scope

- Provider SDK integration or provider selection.
- Changes to Phase 4 ranking, itinerary sequencing, transport semantics, or API
  error behavior.
- Database access from AI code.
- Search, place details, maps, geospatial calculation, live research, or frontend
  conversation UI.
- Phase 6 provider/live-data dependencies.

## Acceptance limitations

- No commercial production LLM provider is selected.
- The offline `RuleBasedModelAdapter` is intentionally narrow.
- `search_places` and `get_place_details` remain deferred.
- Walking/mobility, pace, and transport-budget optimization remain unsupported.
- Existing transport/data availability limitations remain.
- The existing Pydantic deprecation warning remains.
- Production frontend conversational integration remains outside Phase 5.
