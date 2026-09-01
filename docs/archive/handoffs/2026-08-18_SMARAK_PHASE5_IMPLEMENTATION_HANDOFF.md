# O-Travelz Phase 5 Implementation Handoff

## State

**PHASE 5 — ACCEPTED WITH EXPLICIT LIMITATIONS**

Phase 5 acceptance was recorded on 2026-08-18 after the final grounding audit.

## 1. Files changed

Implementation files:

- `backend/app/ai/schemas.py`
- `backend/app/ai/model.py`
- `backend/app/ai/grounding.py`
- `backend/app/ai/orchestrator.py`
- `backend/app/ai/tools/__init__.py`
- `backend/app/ai/tools/common.py`
- `backend/app/ai/tools/build_itinerary.py`
- `backend/app/ai/tools/plan_transport_hop.py`
- `backend/app/ai/tools/provider_status.py`
- `backend/app/api/ai_routes.py`
- `backend/app/main.py`
- `backend/tests/test_ai_phase5.py`

Documentation files:

- `docs/handoffs/2026-08-18_SMARAK_PHASE5_SCOPE_REPORT.md`
- `docs/handoffs/2026-08-18_SMARAK_PHASE5_IMPLEMENTATION_HANDOFF.md`

No existing Phase 4 service or deterministic itinerary route was redesigned.

## 2. Contracts added or changed

Added to `backend/app/ai/schemas.py`:

- `AIResponse`
- `AIPlanRequest`
- `AIStatus`
- `IntentKind`
- `AIIntent`
- `ConstraintUpdate`
- `Clarification`
- `ToolCall`
- `ModelClaim`
- `ModelResponse`

The itinerary field in `AIResponse` is typed as the existing
`app.schemas.itinerary.ItineraryResponse`; no competing itinerary schema was
created. Existing `PlanningConstraints`, `TransportHopContract`,
`ItineraryResponse`, `ItineraryPlanResponse`, and `APIErrorResponse` contracts
remain compatible.

## 3. AI orchestration flow

`AIOrchestrator.orchestrate()` performs the following sequence:

1. Requests structured intent from `ModelAdapter.parse_intent()`.
2. Validates the complete model result with Pydantic and rejects extra fields.
3. Handles clarification and unsupported intent without invoking tools.
4. Validates initial constraints or merges a validated refinement patch with
   existing constraints.
5. Canonicalizes the build-itinerary tool arguments from those validated
   constraints.
6. Executes only the approved tool names through thin adapters.
7. Records tool results in a new turn-local grounding context.
8. Validates the structured model response.
9. Publishes a fixed non-factual framing plus only grounded fact renderings in
   the conversational `message`, and returns the deterministic itinerary in
   `AIResponse.itinerary`.

The API route is `POST /ai/plan` with `{ "message": string, "constraints":
PlanningConstraints | null }`. The existing `POST /itinerary/plan` route is
unchanged.

## 4. Tool adapters

The adapters in `backend/app/ai/tools/` contain no ranking, routing, business
logic, or database access:

- `BuildItineraryTool` calls `ItineraryService.plan()`.
- `PlanTransportHopTool` calls the supplied deterministic transport service.
- `GetProviderStatusTool` calls the supplied deterministic provider-status
  service.

They normalize results to `ToolResult` statuses: `ok`, `unavailable`, `unknown`,
`invalid`, or `error`. Domain-level unavailable transport remains a valid
transport result with null estimates and its required reason.

## 5. Model/provider boundary

`ModelAdapter` is a provider-neutral protocol with `parse_intent()` and
`generate_response()` methods. There is no OpenAI, Anthropic, Gemini, or other
vendor dependency. `FakeModelAdapter` supports scripted intent queues and final
response queues, including deliberately malformed raw data for validation tests.
`RuleBasedModelAdapter` is only a narrow offline fallback for the API route and
is not intended to replace a future production provider.

## 6. Grounding mechanism

Each orchestration call creates a new `GroundingContext` containing tool results,
the itinerary result, transport results, provider-status results, warnings, and
structured facts. Facts include itinerary summaries/stops, transport modes,
reasons, nullable estimates, data tiers, and provider status values.

The model response carries a finite `ResponseFraming` value and `ModelClaim`
objects with a fact identifier and value. `GroundingBoundary` maps the framing to
fixed non-factual text and compares each claim's identifier and value against the
current-turn fact registry. Unknown fact identifiers, mismatched values, and
claims from prior turns are suppressed. Only deterministic renderings of
accepted facts are appended to the public message. Any raw compatibility
`ModelResponse.message` input is ignored and never reaches the public response.
Null duration/cost values are never rendered as invented values, and an unknown
data tier is rendered as unknown rather than live/current.

## 7. Refinement semantics

Supported refinement patches are validated and merged for `days`, `interests`,
`dates`, and `start`. The merged `PlanningConstraints` are passed to the same
deterministic `ItineraryService` used by Phase 4. The response includes the new
canonical `ItineraryResponse` and `changed_constraints`.

The orchestrator never accepts model-generated replacement stop data, route
details, coordinates, providers, durations, fares, or transport modes.

## 8. Unsupported behavior

Walking optimization, pace optimization, and transport-budget optimization are
not claimed because the current deterministic transport service does not implement
those semantics. The AI response is `unsupported` with a clarification rather
than a fabricated successful itinerary. Search and place-details schemas remain
deferred because neither is needed by the approved flow.

## 9. Tests

`backend/tests/test_ai_phase5.py` records deterministic transcript coverage for:

- initial two-day heritage planning;
- food-focused refinement and re-planning;
- unsupported less-walking refinement;
- unavailable transport with no invented duration/fare/alternative;
- unknown transport values and data tier;
- suppression of hallucinated message prose and hallucinated claims;
- unavailable transport, unknown provider status, and stale-turn claim rejection;
- dates/start refinements and pace/transport-budget unsupported refinements;
- invalid model output;
- model adapter failures and grounding snapshot isolation;
- normalized unavailable tool status.

All tests use local fake services/models and require no network access.

## 10. Regression and verification

At implementation handoff:

- Backend suite: `153 passed, 1 warning`.
- Python compilation: passed with `python -m compileall -q backend`.
- `git diff --check`: passed.
- Frontend contract tests: not run as part of this backend-focused change; no
  frontend build success is claimed here.

The existing warning is a Pydantic deprecation warning emitted by an existing
dependency/model configuration path; it is reported separately and is not a
Phase 5 test failure.

## 11. Limitations

- No real provider adapter is selected or integrated.
- The offline HTTP fallback recognizes only a small vocabulary and intentionally
  asks for clarification outside it.
- The grounding layer validates structured claim ids and values; free-form factual
  prose is not accepted as a factual channel.
- Existing Phase 4 data availability and transport topology limitations remain.
- `search_places` and `get_place_details` are schema-only deferred capabilities.

## 12. Remaining decisions

- Select and approve a production model provider and its deployment/configuration
  policy.
- Decide how a production provider will emit the same validated intent and claim
  structures without weakening the grounding boundary.
- Phase 5 acceptance was recorded with explicit limitations in the acceptance handoff.

The remaining provider decision is intentionally deferred; it is not an acceptance
blocker.

## 13. Remaining Phase 6 dependencies

Phase 6 work still depends on separate approval and includes the frontend
conversation experience, provider/live-data policy, richer transport availability,
and any map or geospatial presentation integration. Phase 5 does not pre-empt
those decisions.
