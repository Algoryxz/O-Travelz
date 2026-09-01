# Smarak Phase 4 Acceptance Handoff

## Owner

Smarak

## Phase

Phase 4 - Deterministic ranking and itinerary generation

## Status

PHASE 4 ACCEPTED. The final Smarak acceptance audit passed. No production behavior was
changed for this documentation sync, and no commit was created.

## Acceptance decision

Phase 4 is accepted as of 2026-08-18.

The final acceptance audit reported:

- all 12 critical acceptance requirements PASS;
- full backend suite: 134 passed, 1 warning;
- Phase 4 suite: 16 passed, 1 warning;
- `python -m compileall -q backend` passed;
- `git diff --check` passed.

## Accepted Phase 4 semantics

- Verified-place boundary filters `Place.verified_at IS NOT NULL` before ranking.
- Only verified places participate in ranking; unresolved coordinates remain `NULL`.
- Akriti's 32-place evidence is reconciled as evidence-only, not a second source of
  truth.
- BQS, Route 12, and AMA E-Ride remain evidence-only and are not promoted into
  fabricated coordinates, topology, fares, or live capability.
- Ranking is exact canonical category matching with the approved deterministic
  tie-break order and no weights, popularity, or AI scoring.
- Itinerary generation is global, unique, capped at three stops per day, and
  deterministic in day assignment and stop sequencing.
- Routed stops require coordinates; non-coordinate candidates are excluded from routed
  selection.
- Start resolution is deterministic, exact, and non-geocoded; start hops use
  `from_sequence=0`, first-stop sequence `1`, and no return-to-start hop is added.
- Transport sequence propagation preserves arbitrary `from_sequence` / `to_sequence`
  values through the Phase 3 transport boundary.
- Unavailable hops are preserved with explicit reasons, nullable duration/cost, and an
  honest `unknown` tier when no static, scheduled, or live tier is truthful.
- The response explanation is the deterministic empty string `""`.
- `POST /itinerary/plan` is the accepted API boundary and returns structured validation
  and planning errors without ORM leakage.

## Acceptance evidence

- Final Smarak audit completed with all 12 critical requirements passing.
- Phase 4 regression suite completed with 16 passing tests and 1 warning.
- Full backend regression completed with 134 passing tests and 1 warning.
- Backend compilation check passed with `python -m compileall -q backend`.
- Repository hygiene check passed with `git diff --check`.
- The accepted Phase 4 implementation remains compatible with the Phase 3 transport
  contract and its explicit limitations.

## Known limitations

Phase 4 does not change the explicit Phase 3 transport limitations:

- AMA Bus and Mo E-Ride production routing limitations remain in place.
- Unresolved provider topology and coordinates remain unresolved.
- Nullable fare/cost remains the honest representation where applicable.
- Unsupported transport constraints remain fail-closed.

Phase 4 also does not add:

- AI-generated explanation text;
- frontend implementation;
- map implementation;
- geocoding or coordinate inference;
- a new provider;
- a new routing engine;
- production Akriti data import;
- unnecessary schema or database redesign.

## Dirty-tree and inherited changes

The working tree remains intentionally dirty. Existing modified and untracked files in
backend, frontend, docs, and handoff areas were already present in the acceptance
window and were not cleaned, reverted, or committed during this documentation sync.

This handoff adds documentation only. It does not alter production behavior, tests, or
the accepted Phase 4 implementation.

## Phase 5 starting state

Phase 5 begins from the accepted Phase 4 baseline, not from a blank slate. Phase 5 may
assume the following are already solved:

- deterministic ranking exists;
- itinerary generation exists;
- facts-only `explanation=""` exists;
- `POST /itinerary/plan` exists;
- start-origin handling uses `from_sequence=0`;
- transport sequence propagation is already supported;
- unavailable hops are preserved with reasons;
- `unknown` is the honest API/schema state for an unavailable or unsupported tier.

Phase 5 must not assume the following are solved:

- AI-generated explanation text;
- grounded orchestration logic;
- map or GeoJSON implementation;
- geocoding or route inference;
- a new provider or routing engine;
- production frontend behavior;
- any relaxed handling of the Phase 3 transport limitations.

## Downstream handoff

AI, API, map, and frontend owners may consume the accepted structured itinerary
contract, but they must preserve the empty facts-only explanation behavior and the
accepted transport honesty rules.
