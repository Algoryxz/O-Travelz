# O-Travelz Phase 5 Acceptance Handoff

## Final verdict

**PHASE 5 — ACCEPTED WITH EXPLICIT LIMITATIONS**

**Acceptance date:** 2026-08-18

## Objective

Phase 5 adds grounded AI intent understanding, approved deterministic tool
orchestration, conversational explanation, and constraint-based refinement around
the accepted Phase 4 deterministic backend.

## Implementation checkpoint

The accepted implementation includes:

- provider-neutral `ModelAdapter` boundary;
- deterministic `FakeModelAdapter` and narrow offline `RuleBasedModelAdapter`;
- `AIResponse` with the canonical `ItineraryResponse`;
- validated intent and approved tool calls;
- thin adapters for `build_itinerary`, `plan_transport_hop`, and
  `get_provider_status`;
- `POST /ai/plan` orchestration boundary;
- current-turn grounding and deterministic claim rendering.

## Grounding architecture

```text
User intent
  -> AI intent validation
  -> approved deterministic tools
  -> deterministic facts
  -> current-turn GroundingContext
  -> immutable/deep-copied model snapshot
  -> validated ModelClaims
  -> exact fact/value validation
  -> deterministic rendering
  -> finite safe framing
  -> AIResponse
```

`ModelResponse.message` is quarantined compatibility input and is never rendered.
Only finite `ResponseFraming` values and accepted deterministic claim renderings
reach the public `AIResponse.message`. AI is not a source of travel facts.

## Deterministic authority boundary

The deterministic backend remains authoritative for constraints, verified-place
selection, itinerary sequencing, transport routing, provider status, route details,
coordinates, duration, cost, and data tiers. AI cannot directly edit itinerary
facts or query the database.

## Supported refinements

- `days`
- `interests`
- `dates`
- `start`

Updates are validated, merged with existing constraints, and passed back through
the existing deterministic itinerary service.

## Unsupported refinements

The current planner does not optimize:

- walking/mobility;
- pace;
- transport budget.

These requests return an honest unsupported state and do not silently alter the
deterministic itinerary.

## Tests and verification

- Full backend suite: **153 passed, 1 warning**.
- Phase 5 suite: **19 passed, 1 warning**.
- `python -m compileall -q backend`: passed.
- `git diff --check`: passed.
- Grounding tests cover fake IDs, incorrect values, stale facts, unavailable
  transport, unknown provider status, null cost/duration, hallucinated message
  prose, model failures, and snapshot mutation isolation.

## Explicit limitations

1. No commercial production LLM provider is selected.
2. `RuleBasedModelAdapter` is intentionally narrow.
3. `search_places` remains deferred.
4. `get_place_details` remains deferred.
5. Walking/mobility optimization remains unsupported.
6. Pace optimization remains unsupported.
7. Transport-budget optimization remains unsupported.
8. Existing transport/data availability limitations remain.
9. The existing Pydantic deprecation warning remains.
10. Production frontend conversational integration remains outside Phase 5.

These limitations do not block Phase 5 acceptance.

## Ownership and dependency state

- Akriti: research correctness and provenance.
- Smarak: database/import semantics, deterministic ranking, deterministic itinerary,
  Phase 5 AI orchestration and grounding.
- Rudra: transport/routing and future approved API integration work.
- Susmita: Phase 6A map/geospatial representation.
- Deeptiman: Phase 6B frontend integration.
- Punam: documentation, evidence, readiness, and release synchronization.

Phase 4 remains accepted at checkpoint `d843bb4`. Phase 5 does not modify Phase 4
semantics. Phase 6 may depend on the accepted Phase 5 response/grounding boundary,
but Phase 6 implementation has not started.
