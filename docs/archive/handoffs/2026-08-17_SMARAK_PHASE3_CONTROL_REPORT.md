# Phase 3 Control Report — Smarak

## Owner

Smarak — project owner / integration lead

## Date

2026-08-17

## Control status

Phase 3 entry gate: **SATISFIED**.

Phase 3 implementation status in the repository: **NOT STARTED**. No Rudra or Susmita
Phase 3 scope/progress/completion reports were present during this audit. The repository
contains the Phase 0 transport contracts, the Phase 2 transport database/import layer,
and the provider-neutral adapter base only.

## 1. Exact Phase 3 objective

Per `docs/PHASES.md`, Phase 3 is **Transportation and routing**. Its objective is to
normalize verified providers and produce deterministic multimodal transport hops.

## 2. Phase 3 acceptance criteria

The canonical acceptance criteria are:

- verified provider data is normalized through the common adapter contract;
- multimodal and unavailable-hop results preserve data tier and reasons;
- no adapter claims an unverified API, route, fare, schedule, or live status.

The canonical exit criteria are:

- demo-relevant verified providers return honest data tiers;
- at least one real fixture pair produces a multimodal hop where data supports it;
- unreachable pairs return an unavailable result with a reason;
- missing provider data does not crash the planner.

## 3. Authorized implementation scope

Phase 3 may contain only the bounded transportation/routing work named by the canonical
phase document:

- provider adapters for verified providers;
- transport graph construction and pathfinding;
- transport-hop planning and provider-status behavior;
- explicit unavailable and fallback states;
- tests and the required evidence/handoffs.

Implementation must consume the Phase 2 database/import outputs and preserve static,
scheduled, live, unknown, and unavailable semantics.

## 4. Rudra responsibilities

Rudra owns backend/API wiring, verified provider adapters, transportation providers,
routing, pathfinding, transport-hop planning, provider status behavior, and their tests.
Rudra must preserve the shared transport contracts and must not invent provider APIs,
routes, schedules, fares, coordinates, or live status.

Rudra does not own ranking, itinerary sequencing, AI orchestration, database semantics,
or authoritative map geometry.

## 5. Susmita responsibilities

Susmita owns the later Phase 6A map/geospatial subsystem: geometry representation, route
lines, multimodal map representation, and the map integration contract. Susmita is not a
Phase 3 transport/routing implementer. During Phase 3, Susmita may receive a precise
geometry dependency contract when Rudra produces geometry-bearing outputs, but must not
replace Rudra's routing or invent geometry.

All missing coordinates and route geometry remain explicit unknown/unavailable states.

## 6. Akriti research responsibilities

Akriti owns research correctness, provenance, and closure of the following only when new
defensible evidence exists:

- all 83 AMA coordinates;
- `AMA-BQS-REC-009`, `047`, and `049` near-name identity confirmations;
- `AMA-BQS-REC-032`, `042`, `043`, `044`, `052`, `069`, `070`, and `083` March-source
  confirmation;
- the 36 Route 12 canonical stop mappings;
- structured AMA fare evidence.

Engineering must continue with explicit unknown/unresolved states while these remain open.
No source fact may be rewritten silently.

## 7. Deeptiman and Punam dependencies

Deeptiman is a downstream Phase 6B consumer. Deeptiman does not implement Phase 3 and
must wait for approved API and map contracts. Any future frontend representation of
missing geometry or unavailable transport must use explicit contract states.

Punam owns documentation, evidence, phase tracking, and release readiness. Every Phase 3
agent must provide scope, progress, completion, and downstream handoff Markdown evidence
before work is treated as complete.

## 8. Explicitly not Phase 3

The following are outside Phase 3:

- ranking or candidate selection;
- itinerary generation or day sequencing;
- AI orchestration or AI providers;
- frontend features or UX redesign;
- authoritative map/geospatial visualization implementation;
- production-grade live feeds or fabricated real-time data;
- research closure by inference;
- database redesign unrelated to a proven Phase 3 contract need.

## 9. Phase 4+ work that must not begin

Do not begin Phase 4 deterministic ranking/itinerary generation, Phase 5 AI
orchestration, Phase 6A maps/geospatial implementation, Phase 6B frontend implementation,
or later integration/demo/readiness work as part of Phase 3. Phase 3 completion does not
automatically authorize those phases.

## 10. Cross-agent contracts to preserve

- `TransportAdapter` remains the provider-neutral boundary.
- `DataTier` remains exactly `static`, `scheduled`, or `live`; no fake fourth tier.
- `TransportHopContract` preserves ordered legs, data tier, estimates, and an explicit
  reason for unavailable results.
- `ProviderStatusContract` exposes provider identity, data tier, and notes without
  claiming unavailable capabilities.
- Phase 2 `TransportProviderSource` records source-specific provenance/tier layers.
- Confirmed stops may retain `location = NULL` with unresolved coordinate status.
- Route-stop topology is created only from defensibly established relationships; Route 12
  rows with blank canonical candidates remain unmapped.
- Unknown fares remain unknown; no fare amount is fabricated.
- Geometry consumers use supplied identifiers/geometry and represent missing geometry as
  unavailable rather than inferring coordinates.
- Every meaningful task leaves Markdown evidence and a dependent handoff.

## Current implementation discrepancies

The actual repository was inspected after reading the canonical documents:

- `backend/app/transport/adapters/base.py` and `backend/app/transport/graph/__init__.py`
  are the only transport implementation surfaces; no provider adapter, graph, pathfinding,
  or transport service exists.
- `backend/app/api/__init__.py` is empty and `backend/app/main.py` exposes only `/health`;
  no Phase 3 API/service wiring exists.
- `backend/app/geospatial/__init__.py` is empty; no Phase 3 geometry service exists.
- No Phase 3 Rudra/Susmita evidence reports exist yet.
- The adapter base documents `estimate_fare()` as returning a dict with a concrete amount,
  while the Phase 2 `FareRule.amount` is nullable and the canonical estimate metadata is
  still an `OPEN DECISION`. This is an unresolved contract issue, not permission to
  fabricate a fare or silently change the contract.
- `TransportHopContract.reason` is optional for ordinary hops but is now validated as
  required when `mode="unavailable"`, aligning the executable schema with the supporting
  contract. The planner still does not exist, so planner-level behavior remains untested.

## Immediate control actions

1. Rudra must provide a Phase 3 scope report before implementation is accepted for review.
2. Susmita must provide a scope report only for any explicitly authorized geometry/
   integration dependency; Phase 6A implementation must remain out of Phase 3.
3. Smarak will review actual code and evidence against the acceptance checklist, not agent
   messages alone.
4. Any contract change must identify affected agents, update canonical documentation,
   add tests, and create a handoff.
