# Smarak Phase 4 Scope Report

## Status

**IMPLEMENTATION IN PROGRESS — NOT ACCEPTED**

The Phase 2 database/import foundation and the bounded, accepted Phase 3 transport
service are present. The previously open Phase 4 semantic decisions were approved in
`docs/handoffs/2026-08-18_SMARAK_PHASE4_DECISIONS.md`; implementation is now underway.
This report remains the gate baseline and does not claim Phase 4 acceptance.

Evidence: `docs/PHASES.md`, `docs/ARCHITECTURE.md`,
`docs/REPOSITORY_MAP.md`, the Phase 3 acceptance review
`docs/handoffs/2026-08-18_SMARAK_PHASE3_INTEGRATION_REVIEW_2.md`, and the repository
inspection recorded below.

## Phase 3 Dependency Verification

Phase 3 is formally **PHASE 3 ACCEPTED WITH EXPLICIT LIMITATIONS**. The accepted
implementation is at commit `d6a0291734f40dbe76e113b014d574104eb5f7d3` on `main`.
The working tree is not clean and contains existing Phase 3 correction changes,
Smarak/Susmita geospatial preparation, canonical-state/documentation changes, and
untracked handoffs/fixtures. Those changes were not discarded or used as permission to
start Phase 4.

The accepted Phase 3 implementation provides:

- `TransportService.plan_transport_hop` and `get_provider_status`;
- `/transport/hop` and `/transport/providers/{provider_id}` routes;
- deterministic walking when both persisted place coordinates are verified;
- evidence-only graph construction and deterministic pathfinding;
- explicit unavailable-hop reasons and provider-failure isolation;
- empty default AMA Bus and Mo E-Ride routing records because the current verified
  source does not provide coordinate-bearing, confirmed topology;
- regression coverage for unknown-duration scoring and fail-closed handling of the
  currently undefined transport constraints.

The accepted limitations relevant to Phase 4 are:

- all 72 confirmed AMA stop records retain `location = NULL`; no confirmed place-to-stop
  topology is available for production routing;
- Mo E-Ride structured research stops remain unresolved for coordinates and lack an
  approved coordinate-bearing production import;
- no structured AMA fare payload exists, so transport cost is nullable;
- mixed-leg hop-tier aggregation, unavailable/unknown capability representation, and
  planner input/location/sequence semantics remain open;
- `plan_transport_hop` currently returns bounded hop sequences `1 -> 2`, while its
  request has no sequence fields;
- `budget_transport_per_day`, `mobility`, and `pace` currently fail closed as
  unsupported transport constraints rather than being falsely claimed as enforced.

These limitations do not automatically block a Phase 4 contract that explicitly
returns an unavailable hop. They do block integrated itinerary behavior that requires
the unresolved input/sequence semantics, supported transport constraints, or
source-backed provider routing.

Evidence: `docs/handoffs/2026-08-18_SMARAK_PHASE3_INTEGRATION_REVIEW_2.md`,
`docs/handoffs/2026-08-18_SMARAK_PHASE3_CORRECTION_HANDOFF.md`,
`docs/handoffs/2026-08-18_RUDRA_PHASE3_IMPLEMENTATION_HANDOFF.md`,
`backend/app/transport/service.py`, `backend/app/api/transport_routes.py`, and the
current test run: `116 passed, 1 warning` for `backend/tests`.

## Canonical Phase 4 Definition

**Name:** Phase 4 — Deterministic ranking and itinerary generation.

**Owner:** Smarak. Ranking, candidate selection, itinerary semantics, and the
deterministic core remain Smarak-owned. Rudra owns backend/API wiring and must be
coordinated with for the HTTP boundary.

**Objective:** Select verified places and build facts-only day-by-day itineraries.

**Dependencies:** Phase 0 semantic contracts and the Phase 2 database; Phase 3
transport for real hops.

**Allowed work:**

- deterministic ranking and candidate selection;
- itinerary sequencing and day planning;
- calls to the transport-hop service for itinerary hops;
- facts-only `POST /itinerary/plan` behavior;
- contract fixtures and tests.

**Forbidden work:** AI-generated facts or prose as a substitute for deterministic
output, provider-specific integrations, routing implementation, frontend work, and map
visualization.

**Required outputs and acceptance:** a ranking service, itinerary service, facts-only
itinerary API behavior, deterministic/explainable ranking, contract-compatible output,
structured transport-aware hops or explicit unavailable hops, and passing ranking,
itinerary sequencing, contract, and unavailable-hop tests.

**Downstream consumers:** the structured itinerary is handed to the AI, API, map, and
frontend owners. The API, map, frontend, and AI may consume the structure but must not
reimplement ranking, sequencing, routing, or facts.

Evidence: `docs/PHASES.md`, `docs/ARCHITECTURE.md`, `docs/PRD.md`,
`docs/architecture/05-contracts.md`, and `docs/phases/README.md`.

## Repository Reality

The current commit is `d6a0291` (`feat: implement bounded Phase 3 transport routing`).
The actual working tree contains the Phase 3 correction changes shown by `git status`,
including `backend/app/transport/graph/pathfind.py`,
`backend/app/transport/service.py`, their transport tests, and related existing
documentation/geospatial work. No Phase 4 implementation files are present.

The canonical architecture text still describes ranking, itinerary generation, routing,
and geospatial behavior as future work. The actual repository is more advanced for
Phase 3 than that older status wording: the bounded transport code and tests now exist,
but the Phase 3 review explicitly limits what may be claimed.

The current backend exposes `/health` and `/transport/*`; `main.py` keeps the itinerary
router commented out. There are no ranking or itinerary service functions, no itinerary
API router, and no Phase 4-specific tests. The existing frontend contract types and
fixture are boundary/consumer artifacts, not an implemented frontend flow.

Evidence: `git status --short --branch`, `git log -5 --oneline`,
`git show --stat d6a0291`, `backend/app/main.py`, the directory tree, and
`rg` inspection of `backend/app/services/`, `backend/app/api/`, and `backend/tests/`.

## Existing Phase 4 Components

| Component | Actual state | Gate classification | Reuse/impact |
|---|---|---|---|
| `backend/app/schemas/common.py` | Planning constraints and `PlaceSummary` exist with strict extra-field rejection. | EXISTS BUT INCOMPLETE | Reuse as the current boundary; semantic meaning of several fields is still open. |
| `backend/app/schemas/itinerary.py` | Request, day, stop, and response models exist. | EXISTS BUT INCOMPLETE | Reuse for validation; it does not generate plans and does not settle timing/order semantics. |
| `backend/app/schemas/api.py` | Structured API error and itinerary response aliases exist. | EXISTS BUT INCOMPLETE | Reuse only after HTTP validation/error/version decisions are approved. |
| `backend/app/models/itinerary.py` | Itinerary/day/stop/hop SQLAlchemy models exist. | EXISTS AND READY as persistence boundary | No new schema or migration is required by the canonical Phase 4 definition; persistence behavior itself is not fully specified for this phase. |
| `backend/app/services/ranking/` | Only empty `__init__.py` exists. | MISSING / TO CREATE | The ranking service and any internal result/explanation types must be added here. |
| `backend/app/services/itinerary/` | Only empty `__init__.py` exists. | MISSING / TO CREATE | The deterministic day planner and transport-service boundary must be added here. |
| `backend/app/api/` | Package and transport router exist; no itinerary router exists. | EXISTS BUT INCOMPLETE / TO CREATE | Add the approved itinerary route under this package; exact filename is not fixed by the map. |
| `backend/app/transport/service.py` | Accepted bounded transport service exists. | EXISTS BUT INCOMPLETE for Phase 4 integration | Reuse through an interface; resolve sequence/input and open tier/error semantics before multi-stop integration. |
| `backend/tests/test_phase0_contracts.py` | Existing contract tests cover the fixture shape and unavailable-hop reason. | EXISTS AND READY as baseline | Extend with Phase 4 behavior tests; do not treat baseline tests as Phase 4 acceptance. |
| `backend/tests/test_transport/` | Phase 3 transport tests exist and pass. | EXISTS AND READY as dependency evidence | Reuse as the transport regression baseline; do not add provider integrations in Phase 4. |
| `frontend/src/api/contracts.ts` and `frontend/tests/fixtures/sample_itinerary.json` | TypeScript mirror and sample contract fixture exist. | EXISTS AND READY as consumer boundary | Reuse for contract compatibility; frontend implementation is out of scope. |
| `backend/app/ai/schemas.py` and `backend/app/ai/tools/` | Tool schemas exist; tools package is empty. | NOT IN PHASE 4 SCOPE | Phase 5 owns execution/tool wrappers; Phase 4 only emits deterministic facts. |
| `backend/app/geospatial/` | Contract-independent validation/preparation exists. | NOT IN PHASE 4 SCOPE | Do not add geometry, GeoJSON, or map behavior. |

## Phase 2 Data Available

The reviewed v5.1 place handoff contains 32 verified place records and 9 canonical
category IDs. Eight records have coordinate pairs and 24 intentionally have paired
`NULL` coordinates. The importer and model preserve `lat`/`lon` as WGS84 and map them
to PostGIS `POINT(lon lat)` with SRID 4326. A paired `NULL` location means verified
place data with an unknown/unsupported exact position; it is not a duplicate or an
unverified place.

Available place identity and provenance fields are:

- database UUID `id`;
- optional handoff `research_id` from the source `id`;
- `name`;
- canonical category reference and category display/description data;
- `description`;
- optional `lat`, `lon`, and persisted PostGIS point;
- `opening_hours` JSON;
- `avg_visit_minutes`;
- `price_tier`;
- `source`, `verified_at`, `source_provenance_note`;
- `coordinate_verification`, `coordinate_audit_status`, and `audit_status`.

In the inspected v5.1 handoff, `opening_hours` is structured for Nandankanan Zoological
Park; `avg_visit_minutes` and `price_tier` are null in the inspected records. No
opening-hour or visit-duration fact may be inferred for records where the field is
null. Category records provide canonical identifiers such as `temple`, `museum`, and
`market`; the Phase 2 importer uses the canonical category identifier and preserves
display metadata separately.

Identity semantics are deterministic: when a research ID exists, it is the traceability
identity used for upsert; otherwise the importer uses the canonical `(name, category,
source)` identity. The database also enforces unique `research_id` and
`(name, category_id, source)` constraints. A later coordinate update must update the
existing place rather than create a duplicate.

Phase 4 can therefore rank verified place records, but itinerary generation that
requires physical movement must not select a `NULL`-location place for a routed plan.
The available coordinate-bearing subset is only 8 records, and current Phase 2 data
does not establish a place-to-AMA-stop or place-to-Mo-E-Ride topology.

Evidence: `backend/app/models/place.py`, `backend/app/models/category.py`,
`scripts/import_places.py`, `backend/tests/test_import_places.py`,
`backend/tests/test_phase0_database.py`, the v5.1 JSON handoff, and
`docs/handoffs/2026-08-17_SMARAK_PHASE2_ACCEPTANCE_HANDOFF.md`.

## Deterministic Ranking Contract

**Required inputs:** verified `Place`/`Category` data and `PlanningConstraints`. The
structured constraint fields currently are `days`, `interests`, `dates`, `pace`,
`budget_transport_per_day`, `start`, and `mobility`. The candidate output must be
representable as `PlaceSummary` (`id`, `name`, `category`) unless a contract change is
approved.

**Decided behavior:** selection must be deterministic, use verified data, and be
explainable. It must not use machine learning, an LLM, randomization, fabricated facts,
or provider-specific routing. Transport is a downstream hop-planning dependency, not a
provider integration inside ranking.

**Not defined canonically and therefore OPEN DECISION:**

- which factors contribute to the score beyond the general requirement to match
  verified places to structured constraints;
- how `interests` map to canonical category IDs and whether matching is exact,
  normalized, or multi-category;
- whether dates, pace, budget, mobility, opening hours, visit duration, price tier,
  provenance/audit status, coordinate availability, or start location affect ranking;
- score weights, score scale, normalization, and minimum eligibility thresholds;
- whether coordinate-null places are filtered before ranking or only before itinerary
  generation;
- exact tie-breaking and whether it is by research ID, database UUID, canonical name,
  category, source, or another approved stable key;
- the explainability result shape. The current `PlaceSummary` has no score or reason
  fields, and Phase 4's facts-only requirement conflicts with the contract's later
  AI-generated `explanation` field if prose is expected at this phase.

No ranking weights or tie-break rule is introduced by this report. Until the factors,
eligibility, tie-break, and explanation semantics are approved, ranking implementation
is blocked at the semantic-contract level.

## Deterministic Itinerary Contract

**Request shape:** `ItineraryPlanRequest`, equivalent to `PlanningConstraints`, with
`days >= 1`, optional interests, dates, pace, transport budget, start, and mobility.
The documented HTTP boundary is `POST /itinerary/plan`.

**Response shape:** `ItineraryResponse`/`ItineraryPlanResponse` with:

- `itinerary_id`;
- echoed structured `constraints`;
- ordered `days` with `day_number`, optional `date`, ordered `stops`, and `hops`;
- each stop carrying `sequence`, `PlaceSummary`, and nullable planned arrival/departure;
- each hop carrying `from_sequence`, `to_sequence`, mode, nullable duration/cost,
  ordered legs, `data_tier`, and a required reason when unavailable;
- top-level `explanation` field present in the current schema.

**Decided behavior:** the service selects verified places, sequences them into ordered
days, asks the Phase 3 transport service for each consecutive itinerary hop, preserves
the returned transport facts/tier, and returns an explicit unavailable hop instead of
dropping a stop or fabricating a route. The service must be deterministic for identical
constraints and source data. It must not generate AI prose or edit facts through an LLM.

**OPEN DECISIONS that block implementation:**

- how many places may be placed on each day and what happens when the eligible pool is
  smaller than the requested days;
- whether `days` requires exactly that many non-empty day objects;
- whether a place can appear once only, and whether selection is global or independently
  ranked per day;
- the ordering objective: ranking order, geographic order, opening-hours order, or
  another approved deterministic rule;
- whether and how opening hours, visit durations, dates, and time-of-day are used to
  produce planned arrival/departure strings. The source rarely supplies these fields;
- what `start` means (display label, persisted place, or coordinate-bearing origin), and
  whether it creates a first hop before sequence 1 or is only echoed in constraints;
- whether hops exist only between same-day consecutive stops, how cross-day boundaries
  are handled, and whether a final return hop is ever included;
- how Phase 3's `1 -> 2` bounded sequence output is adapted to arbitrary itinerary
  sequence numbers;
- how budget, mobility, and pace are enforced or surfaced when Phase 3 currently fails
  closed for those transport-relevant fields;
- whether an unavailable hop is retained between two selected stops, whether the plan
  remains valid with such a hop, and how API-level errors differ from per-hop
  unavailability;
- how the facts-only Phase 4 response populates the required `explanation` string. The
  canonical Phase 4 description says no AI text yet, while the supporting contract
  describes the field as AI-generated prose;
- API validation, error envelope, versioning, anonymous-user behavior, and exact router
  registration, all explicitly open in `docs/ARCHITECTURE.md`.

The current executable schemas are reusable but do not settle these semantics. No
contract change is authorized by this report.

## Phase 3 Transport Dependency

Phase 4 should call the existing `TransportService` boundary rather than implement
routing, provider adapters, graph construction, or route geometry. The current service
can return a walking hop for coordinate-bearing endpoints, and it can return structured
provider/multimodal results only when injected or otherwise supplied with verified
coordinate-bearing topology. With the actual Phase 2 data, AMA and Mo E-Ride default
routing records are empty, so source-backed provider hops are not currently available.

**NON-BLOCKING LIMITATIONS for the Phase 4 contract:**

- real AMA/Mo E-Ride multimodal hops cannot currently be demonstrated from repository
  data because coordinates/topology remain unresolved, if the Phase 4 output is allowed
  to preserve an unavailable hop;
- AMA fare/cost is unknown and must remain `null`;
- static/scheduled data must not be presented as live;
- map geometry, stop IDs, route IDs, and GeoJSON are not Phase 4 outputs;
- synthetic transport fixtures may test service interaction only when clearly marked
  test-local and not presented as provider facts.

**PHASE 4 BLOCKERS from Phase 3:**

- the current transport request does not carry itinerary sequence context and the
  service hardcodes `from_sequence=1` and `to_sequence=2`;
- the Phase 3 accepted tier aggregation and unavailable-tier representation remain
  open for a shared/public multi-leg contract;
- transport semantics for budget, mobility, pace, and walking preferences are not
  defined; the current service returns unavailable for those fields rather than
  claiming enforcement.

Phase 4 may proceed only after choosing an approved adapter/interface boundary for
these conditions or explicitly limiting the Phase 4 contract to the current behavior.

## Open Decisions

| Decision | Status | Blocking? | Required treatment |
|---|---|---|---|
| Phase 4 owner/objective and facts-only boundary | DECIDED | No | Implement only deterministic ranking, itinerary generation, and contract tests. |
| Verified place data as ranking source | DECIDED | No | Query/import only verified structured data; preserve provenance. |
| Ranking factors and weights | OPEN | BLOCKING | Smarak must approve semantics; do not invent weights. |
| Ranking tie-break and stable ordering | OPEN | BLOCKING | Approve an explicit stable key and test it. |
| Ranking explainability shape | OPEN | BLOCKING | Decide whether structured score/reasons are needed or whether facts-only output is sufficient. |
| Null-coordinate eligibility | DECIDED in architecture, placement in pipeline OPEN | BLOCKING for itinerary | Exclude from coordinate-requiring itinerary selection; decide pre/post-ranking behavior. |
| Day count and places-per-day rules | OPEN | BLOCKING | Define exact day and stop cardinality behavior. |
| Stop ordering and duplicate semantics | OPEN | BLOCKING | Define deterministic ordering and no-repeat behavior. |
| Timing/opening-hours use | OPEN | BLOCKING for planned times | Use only present structured facts; decide whether null timing remains null. |
| Start-location semantics | OPEN | BLOCKING for first hop | Define label/place/coordinate input and whether it creates a hop. |
| Transport hop sequence propagation | OPEN | BLOCKING | Extend or adapt the Phase 3 boundary without silently changing it. |
| Budget/mobility/pace transport semantics | OPEN | BLOCKING if supported | Preserve current unavailable behavior until semantics are approved. |
| Mixed-leg tier aggregation | OPEN | BLOCKING for final shared contract | Do not silently rely on the current conservative implementation. |
| Unavailable/unknown tier representation | OPEN | BLOCKING for public status contract | Do not map unknown capability to a false tier. |
| Facts-only `explanation` value | OPEN | BLOCKING for response contract | Resolve Phase 4 no-AI-text versus required-string conflict. |
| API validation/error/version/anonymous behavior | OPEN | BLOCKING for route acceptance | Coordinate with Rudra and preserve `APIErrorResponse` unless changed through approval. |
| Real provider coordinates/topology | NON-BLOCKING LIMITATION | Non-blocking if unavailable hops are valid | Do not fabricate; keep provider hops unavailable. |
| Map/GeoJSON contract | OPEN | Non-blocking for Phase 4 | Leave to Phase 6A/6B; do not add map fields. |

## Blocking Dependencies

Before Phase 4 production implementation, the following must be resolved or explicitly
approved as bounded behavior:

1. Ranking factors, weights, eligibility, stable tie-breaking, and explainability.
2. Day count, places-per-day, duplicate, ordering, start-location, and timing rules.
3. Phase 3 transport input/sequence adaptation for arbitrary itinerary hops.
4. Treatment of budget, mobility, and pace when the current transport service fails
   closed for them.
5. Facts-only response handling for the required `explanation` field.
6. API route validation, error, versioning, anonymous-user, and registration behavior.
7. Mixed-hop tier and unavailable/unknown semantics if Phase 4 exposes those values as a
   final downstream contract.

The Phase 2 place data is not a blocker to implementing a bounded ranker, but it limits
production itinerary eligibility to coordinate-bearing places for any plan requiring
physical movement. The Phase 3 real-provider evidence gap is not a reason to fabricate a
hop; it is a blocker only if acceptance requires a real provider-backed hop rather than
an explicit unavailable result.

## Non-Blocking Limitations

- 24 of 32 verified places have intentional `NULL` coordinates and remain valid only
  for non-geospatial use until coordinates are defensibly verified.
- The current Phase 3 default AMA Bus and Mo E-Ride adapters have no routing records;
  walking and explicit unavailable behavior are the honest available paths.
- AMA fare/cost remains unknown and nullable.
- No live provider source is verified.
- Phase 3 correction work remains uncommitted in the working tree; this report does not
  alter or accept those changes beyond the cited Phase 3 handoff decision.
- Frontend dependencies were not needed for this gate; frontend implementation remains
  Phase 6B work.
- Map geometry and GeoJSON remain separately gated by Phase 6A decisions.

## Files To Modify

No files are modified by this gate report other than the report itself. Expected Phase 4
implementation modifications, subject to approval, are:

- `backend/app/schemas/common.py` only if approved ranking/constraint semantics require
  a contract change;
- `backend/app/schemas/itinerary.py` and `backend/app/schemas/api.py` only if the
  approved itinerary/API decisions require contract changes;
- `backend/app/main.py` to register the approved itinerary router;
- `backend/app/transport/service.py` only if the approved Phase 4 transport input or
  sequence boundary requires a coordinated Phase 3 contract change;
- `frontend/tests/fixtures/sample_itinerary.json` and
  `frontend/src/api/contracts.ts` only if a shared contract change is approved and
  coordinated with downstream owners;
- `docs/architecture/05-contracts.md` only through the normal contract-change process,
  not as an implementation shortcut.

No database model, migration, source-data, frontend UI, provider, or map change is
authorized by this scope report.

## Files To Create

The repository map marks these Phase 4 locations as `TO CREATE`:

- implementation modules under `backend/app/services/ranking/`;
- implementation modules under `backend/app/services/itinerary/`;
- an itinerary API router under `backend/app/api/` (the exact filename is not fixed by
  `docs/REPOSITORY_MAP.md`);
- Phase 4 backend tests under `backend/tests/`, including ranking determinism,
  itinerary sequencing, contract, and unavailable-hop coverage;
- any clearly labelled Phase 4 contract fixtures required by the approved test design.

Existing `backend/app/services/ranking/__init__.py` and
`backend/app/services/itinerary/__init__.py` are not implementation placeholders to be
filled without the decisions above. No placeholder file is created by this report.

## Tests Required

Required by `docs/PHASES.md` and the actual contract/data boundaries:

- ranking determinism: identical source data and constraints produce identical order;
- ranking candidate eligibility and category/interest behavior after those semantics
  are approved;
- explicit stable tie-breaking;
- explainability output/contract after its shape is approved;
- null-coordinate handling: verified non-geospatial places are not selected for a plan
  that requires physical routing;
- deterministic day count, stop count, sequence, duplicate, and ordering behavior;
- date and timing behavior, including null opening-hours/visit-duration fields;
- start-location behavior and first-hop semantics;
- transport-service calls for each required hop with propagated sequence context;
- successful walking or injected verified transport hop preservation;
- unavailable hop preservation with non-empty reason and no dropped stop;
- nullable duration and cost behavior; no fabricated fare or duration;
- transport data-tier preservation and explicit handling of mixed/unavailable states;
- facts-only response validation against `ItineraryResponse` and the frontend fixture;
- API request validation and structured error behavior after Rudra/API decisions;
- repeated identical API requests are deterministic;
- full backend regression, including the current Phase 2/import and Phase 3 transport
  suites.

The current baseline is `116 passed, 1 warning` for `backend/tests`; this is regression
evidence only and is not Phase 4 acceptance evidence. Frontend tests were not required
for this gate and the existing handoff records that frontend dependencies are not
installed locally.

## Forbidden Scope

The Phase 4 implementation must not include:

- AI orchestration or model execution;
- LLM-generated itinerary facts or prose;
- provider-specific routing integrations or new provider adapters;
- fabricated coordinates, routes, fares, schedules, durations, opening hours, or
  transport data;
- frontend UI or map implementation;
- Phase 6A geospatial behavior, production geometry, GeoJSON, or map-layer contracts;
- Phase 6B frontend implementation;
- speculative provider data or live-status claims;
- unrelated database redesign, migrations, persistence flows, profiles, saved plans,
  discovery/search screens, filters, or recommendations not explicitly approved;
- ranking by an invented weight, randomization, machine learning, or LLM output;
- silently changing the Phase 3 transport contract or unresolved research semantics.

## Implementation Order

1. Approve the blocking ranking, itinerary, transport-sequence, facts-only response,
   and API decisions listed above.
2. Freeze the approved semantic contract and identify any required owner/dependent/test
   impact before changing schemas or API wiring.
3. Implement the verified-place repository/query boundary using the existing Phase 2
   models and provenance/identity semantics.
4. Implement deterministic ranking under `backend/app/services/ranking/`, including
   the approved factors, stable tie-break, eligibility, and explainability result.
5. Add ranking tests and run the Phase 2/import regression baseline.
6. Implement itinerary day/stop sequencing under `backend/app/services/itinerary/`.
7. Integrate the existing Phase 3 transport service through a narrow interface; pass
   approved sequence/location context and preserve planned or unavailable hop results.
8. Add itinerary, transport-integration, unavailable, timing, and contract tests.
9. Add the approved facts-only `/itinerary/plan` router under `backend/app/api/`, wire it
   in `backend/app/main.py`, and add structured API tests.
10. Validate the response against backend schemas and the existing frontend contract
    fixture without implementing frontend behavior.
11. Run focused Phase 4 tests, the full backend suite, `git diff --check`, and an
    explicit scope/fabrication audit before requesting Phase 4 acceptance.

## Phase 4 Acceptance Criteria

Phase 4 can be accepted only when evidence demonstrates:

- ranking is deterministic, explainable, and based only on approved verified data and
  structured constraints;
- no unapproved weights, tie-breaks, randomization, ML, or LLM ranking are present;
- itinerary output has the approved ordered day/stop shape and deterministic behavior;
- all selected places satisfy the approved coordinate/eligibility rule;
- each required hop is structured and transport-aware, or is explicitly unavailable
  with a human-readable reason;
- Phase 3 transport data tier, nullable duration/cost, provider identity, and failure
  states are preserved without fabrication;
- the facts-only `POST /itinerary/plan` response exactly matches the approved backend
  and frontend contract, including the resolved treatment of `explanation`;
- API validation/error behavior matches the approved boundary;
- ranking, itinerary sequencing, contract, unavailable-hop, transport-integration, and
  full regression tests pass;
- no provider integration, map geometry, frontend behavior, AI behavior, or unrelated
  schema/database change entered the Phase 4 diff;
- the handoff records files, tests, decisions, blockers, limitations, and downstream
  contract ownership.

## Recommended Next Action

The kickoff approval in `docs/handoffs/2026-08-18_SMARAK_PHASE4_DECISIONS.md` authorizes
the bounded implementation. Continue with the documented ranking, itinerary, transport
sequence, facts-only API, and test order. Do not claim Phase 4 acceptance until the
implementation handoff records final evidence and all acceptance criteria pass.

## Decision Reconciliation

The kickoff approval supersedes the blocking open-decision classifications above for
this implementation run. The approved ranking, capacity, sequencing, start, transport,
unknown-tier, facts-only, and API decisions are recorded in
`docs/handoffs/2026-08-18_SMARAK_PHASE4_DECISIONS.md`. The original gate findings and
Phase 3 limitations remain historical evidence and are not erased.

## Implementation Status

The approved kickoff implementation now exists in the verified-place repository,
ranking service, itinerary service, sequence-aware Phase 3 transport boundary, and
facts-only `/itinerary/plan` API. Added tests cover the approved ranking, capacity,
selection, start, sequence, unavailable-hop, contract, and structured-error behavior.
The current full backend result is `133 passed, 1 warning`. This is implementation
evidence, not Phase 4 acceptance.
