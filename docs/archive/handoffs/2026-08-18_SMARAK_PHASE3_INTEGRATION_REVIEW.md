# Smarak Phase 3 Integration Review — 2026-08-18

## 1. Review metadata

- reviewer: Smarak integration/review agent
- repository: `C:\Users\smara\Desktop\o-travelz`
- branch: `main`
- reviewed commit: `d6a0291734f40dbe76e113b014d574104eb5f7d3`
- review date: 2026-08-18

The review was read-only with one authorized output: this report. No production code,
tests, canonical documents, data, or unrelated documentation were changed.

The pre-existing working tree contained Smarak/Susmita changes, including modified
geospatial, canonical-state, architecture, and frontend map-boundary files plus
untracked geospatial fixtures, validation, and handoffs. Those changes were not used as
Phase 3 implementation evidence and were preserved.

## 2. Decision

**PHASE 3 NOT ACCEPTED — CORRECTIONS REQUIRED**

This decision is not caused by unresolved AMA coordinates, unresolved Mo E-Ride
coordinates/topology, missing map implementation, or the absence of Phase 6A. Those are
approved limitations and remain honestly represented. The decision is caused by
implementation correctness and evidence gaps that are independent of those research
limitations:

1. `pathfind._edge_score()` assigns an unknown-duration edge a primary cost of `0`, so
   an unknown-duration provider edge can be preferred over a known-duration walking
   edge. This contradicts its own comment that unknown duration is less preferred.
2. `TransportService.plan_transport_hop()` accepts the approved planning constraints but
   never reads or applies them. Budget, mobility, pace, and other constraint effects are
   therefore not deterministic routing behavior.
3. The required real verified multimodal fixture-pair exit criterion is not met. The
   only multimodal result is an explicitly synthetic injected fixture; the handoff
   acknowledges that it does not satisfy the real-fixture target.
4. The implementation selects a hop-level tier aggregation rule and `static` for
   unavailable results while the canonical one-tier/multimodal and unknown-capability
   semantics remain open decisions. These choices require Smarak approval before
   acceptance or public integration.

## 3. Executive summary

Rudra delivered the bounded Phase 3 file set: provider-neutral adapter types, AMA Bus and
Mo E-Ride adapter shells, deterministic straight-line walking, an evidence-only graph,
pathfinding, a transport service, provider status behavior, transport API routes, tests,
and an implementation handoff. The commit does not add ranking, itinerary sequencing,
AI orchestration, database migrations, provider APIs, frontend work, map payloads, or
authoritative route geometry.

The factuality boundary is mostly sound. Default AMA Bus and Mo E-Ride adapters contain
no coordinate-bearing records, no live provider calls are made, fares remain nullable,
and unresolved provider data is surfaced as unavailable rather than invented. Walking
uses validated supplied coordinates and a documented deterministic straight-line rule.

The regression evidence is green:

- focused transport plus geospatial tests: 28 passed, 1 existing Pydantic deprecation
  warning;
- focused transport, geospatial, and Phase 0 contract tests: 34 passed, 1 warning;
- explicit Phase 2/import regression subset: 76 passed;
- full backend suite: 111 passed, 1 warning;
- backend application compile check: passed;
- `git diff --check`: passed.

Those tests do not establish acceptance by themselves. They do not exercise a real
verified provider fixture, constraint handling, unknown-duration path scoring, actual
source-record loading by the default adapters, or service-level unreachable behavior.

## 4. Canonical requirements reviewed

The following authoritative sources were read and used:

- `docs/PRD.md`
- `docs/RULES.md`
- `docs/ARCHITECTURE.md`
- `docs/PHASES.md`
- `docs/MEMORY.md`
- `docs/REPOSITORY_MAP.md`
- `docs/transportation/00-transport-model.md`
- `docs/transportation/01-providers.md`
- `docs/handoffs/2026-08-17_SMARAK_PHASE3_CONTROL_REPORT.md`
- `docs/handoffs/2026-08-17_SMARAK_PHASE3_PROGRESS.md`
- `docs/handoffs/2026-08-18_RUDRA_PHASE3_SCOPE_REPORT.md`
- `docs/handoffs/2026-08-18_RUDRA_PHASE3_IMPLEMENTATION_HANDOFF.md`
- `docs/handoffs/2026-08-18_SUSMITA_PHASE3_DEPENDENCY_PHASE6A_READINESS_REPORT.md`
- `docs/phases/PHASE_3_ACCEPTANCE_CHECKLIST_2026-08-17.md`

### Requirements matrix

| Requirement area | Canonical requirement | Review interpretation |
|---|---|---|
| Objective | Normalize verified providers and produce deterministic multimodal transport hops | Must be executable, evidence-based, and deterministic |
| Owner | Rudra | Backend, adapters, providers, routing, pathfinding, API wiring, tests |
| Dependencies | Phase 1 provider verification and Phase 2 database/import outputs | Unresolved research remains unresolved; no inference is allowed |
| Allowed work | Adapters, graph/pathfinding, hop planning, provider status, unavailable/fallback states, tests | No ranking, itinerary sequencing, AI, frontend, or authoritative map implementation |
| Contract | Preserve `TransportLeg`, hop fields, three data tiers, nullable estimates, provider/route labels, and unavailable reason | Any new semantic rule needs owner review and evidence |
| Factuality | No invented APIs, routes, schedules, fares, coordinates, geometry, or live status | Synthetic algorithm fixtures must remain clearly non-authoritative |
| AMA | Preserve NULL coordinates, unresolved BQS and Route 12 states, and absent topology | No stop-coordinate or route-stop inference |
| Mo E-Ride | Preserve unresolved coordinates/topology and avoid production-routing claims | Explicit unavailable behavior is acceptable |
| Exit evidence | Honest provider tiers, one real supported multimodal fixture pair, unavailable reason for unreachable pairs, missing-data resilience | A synthetic pair does not satisfy the real-fixture item |
| Ownership boundary | Rudra supplies routing facts; Susmita owns later map/geospatial representation; Smarak owns semantics and open-decision approval | No map contract or geometry may be silently finalized |

### Current-document differences from the original scope report

The current working-tree versions were used. Relative to the earlier committed baseline,
the pre-existing Smarak/Susmita documentation changes add:

- a current-control-status paragraph to `docs/PHASES.md` stating that the Phase 3 gate
  is satisfied but implementation was not previously accepted;
- Phase 3 review progress, the unavailable-reason contract note, Susmita preparation
  evidence, and current test evidence to `docs/MEMORY.md`;
- repository-map entries for the Smarak/Susmita control artifacts and the bounded
  geospatial validation preparation in `docs/REPOSITORY_MAP.md`.

These updates do not change the Phase 3 objective, acceptance criteria, exit criteria,
ownership, or forbidden work. `docs/MEMORY.md` still contains historical “not
implemented” text in its known-issues section; this review treats the actual committed
tree and this report as the current implementation evidence, not that historical status
line. The Phase 3 checklist itself remains a pre-review tracker and was not modified by
this review.

## 5. Rudra handoff claims vs evidence

| Rudra claim | Source evidence | Test evidence | Canonical requirement | Result |
|---|---|---|---|---|
| Bounded transport subsystem and `/transport` wiring exist | `backend/app/transport/`, `backend/app/api/transport_routes.py`, `backend/app/main.py` | API tests pass; routes import successfully | Phase 3 deliverables include hop planning, status, and backend/API wiring | PASS |
| AMA and Mo E-Ride defaults are intentionally empty because verified routing inputs are not safely usable | `mo_bus.py` and `mo_e_ride.py` return empty defaults; provider record and Phase 2 data show unresolved coordinates/topology | Empty E-Ride test; missing-data service test | Unknown provider data must not become fabricated routing | PASS, with provider capability limited |
| Walking is deterministic and range-validated | `walking.py` validates WGS84 ranges, uses haversine, and documents 80 m/min | Adapter, graph, service, and geospatial tests pass | Deterministic walking with explicit unavailable behavior | PASS |
| Graph is evidence-only and deterministic | `build_graph.py` uses supplied coordinates and explicit adjacent stop IDs; `pathfind.py` sorts outgoing edges and signatures | Graph determinism and multimodal synthetic tests pass | No inferred nodes/edges and deterministic pathfinding | PARTIAL: unknown-duration scoring defect remains |
| `plan_transport_hop` uses existing args and persisted-place resolver | `service.py` accepts `PlanTransportHopArgs`, resolves IDs, and returns contract objects | Walking, missing-place, missing-coordinate, synthetic multimodal, and failure tests pass | Match transport boundary and preserve NULL locations | PARTIAL: constraints are ignored and sequences are hardcoded to 1/2 |
| Adapter errors are isolated | Service preflight catches adapter method failures; graph builder catches adapter exceptions | `BrokenAdapter` fallback test passes | Missing provider data must not crash planner | PARTIAL: late graph failures are swallowed without a provider-specific reason |
| Provider status is honest | Default status is scheduled with limitation notes; unsupported provider raises a 404 | Status service/API tests pass | Do not map unknown capability to a false tier | PARTIAL: unknown/unavailable status representation remains an open decision |
| Fares and costs remain nullable | Adapter `estimate_fare()` returns `None`; service sets `estimated_cost=None` | Adapter and service assertions pass | Unknown fare must remain unknown | PASS |
| No factual transport data was fabricated | No new data files, DB migrations, provider calls, coordinates, geometry, or live status in the commit; defaults are empty | Synthetic fixtures are clearly named/test-local | No fabricated facts | PASS |
| A multimodal test exists | `test_service.py` and `test_geospatial_validation.py` use injected synthetic records | Focused suite passes | Tests must include a supported real fixture pair for exit | FAIL for exit evidence: synthetic only |
| No Phase 4+ work was added | Commit contains only transport/API/schema/tests/handoff files; no ranking, itinerary, AI, map, frontend, migration, or data files | Full suite remains green | Stay inside Phase 3 | PASS |

## 6. Transport contract review

### Existing contract preservation

- `DataTier` remains exactly `static`, `scheduled`, and `live`.
- `TransportLeg` retains `mode`, `detail`, nullable `provider`, and nullable `route`.
- `TransportHopContract` retains sequences, mode, nullable estimated minutes/cost,
  ordered legs, hop-level tier, and optional reason.
- `ProviderStatusContract` retains provider ID, one current tier, and optional notes.
- No geometry, stable stop ID, route ID, per-leg tier, or unknown-tier field was added.
- The existing unavailable-reason validator and its Phase 0 test are present in the
  reviewed commit; they were already byte-equivalent to `origin/main` before the pull.

### Contract concerns

1. `aggregate_data_tier()` selects the minimum freshness tier across path edges. This is
   a deterministic implementation choice, but the canonical documents explicitly leave
   the one-tier multimodal aggregation rule open. A walk (`static`) plus scheduled bus
   therefore becomes `static` without an approved semantic decision.
2. `_unavailable()` always sets `data_tier=static`, including missing-place,
   missing-coordinate, and no-provider-path results with no supporting factual source.
   The current contract cannot express unknown capability, but selecting `static` for an
   unsupported result is an unapproved assumption unless Smarak confirms that meaning.
3. The planner hardcodes `from_sequence=1` and `to_sequence=2`. The current
   `PlanTransportHopArgs` has place summaries but no sequence fields, so this exposes an
   unresolved input/location/sequence boundary rather than preserving caller context.
4. Provider and route values are display strings. Stable IDs, per-leg tier, geometry,
   path sequences, and map absence states remain intentionally unavailable under the
   open map contract.

No silent field-shape change was introduced, but the semantic choices above require
approval before acceptance or downstream public integration.

## 7. Adapter review

| Adapter/provider | Classification | Evidence and limitations |
|---|---|---|
| AMA Bus / Mo Bus | PARTIALLY SUPPORTED; BLOCKED BY VERIFIED-DATA LIMITATION | `MoBusAdapter` preserves `ama-bus`, scheduled tier, nullable fare, and injected normalized records, but its default records are empty and it does not load the Phase 2/source files. Actual confirmed AMA stops have NULL coordinates and no confirmed place-to-stop topology. |
| Mo E-Ride | PARTIALLY SUPPORTED; BLOCKED BY VERIFIED-DATA LIMITATION | `MoERideAdapter` preserves `mo-e-ride`, `e-rickshaw`, scheduled tier, nullable fare, and injected normalized records, but defaults empty and does not load the 129 research stops/13 routes. All source stops remain unresolved for routing. |
| Walking | SUPPORTED as deterministic straight-line fallback | Validated supplied endpoint coordinates, haversine distance, 80 m/min assumption, no external directions API. It is not road navigation and does not claim to be. |
| Odisha Yatri | NOT IMPLEMENTED / correctly unavailable | No verified O-Travelz-consumable source; service returns explicit unsupported status rather than a fake tier. |
| Auto/e-rickshaw | NOT IMPLEMENTED / correctly unavailable | No verified in-scope trip-planning source. |
| Taxi | NOT IMPLEMENTED / correctly unavailable | No verified in-scope trip-planning source. |
| Train | NOT IMPLEMENTED / correctly unavailable | No verified imported or consumable O-Travelz dataset/API. |

The adapter interface is provider-neutral and does not call live APIs. Fares remain
nullable. However, the normalized records contain no provenance or verification marker,
and the concrete adapters accept arbitrary injected records. The default production
instances do not normalize actual source records, so the common-contract requirement is
only partially evidenced.

## 8. AMA Bus review

The implementation is conservative about AMA:

- no AMA coordinates are embedded in the Phase 3 code;
- default `MoBusAdapter` has no stops or routes;
- no Route 12 mappings, BQS identities, stop coordinates, or route geometry are inferred;
- no live status or fare amount is claimed;
- missing coordinates resolve to an unavailable hop in the SQL place resolver.

This preserves the canonical NULL/unresolved semantics. It also means the implementation
does not consume or normalize the verified Phase 2 AMA identity slice into the adapter
boundary and cannot produce an AMA-backed real fixture pair. That is an evidence and
capability limitation, not fabrication.

## 9. Mo E-Ride review

The implementation preserves `e-rickshaw` mode and does not relabel E-Ride edges as bus.
The default adapter is empty, so unresolved source coordinates and topology cannot enter
the production graph. No route geometry, stop coordinate, fare, or live status is
fabricated.

Injected test records can create a graph edge when they include coordinates and ordered
stop IDs. Those tests are explicitly synthetic and do not establish production E-Ride
routing. The adapter itself does not carry source provenance or enforce that injected
records came from the verified E-Ride package.

## 10. Graph/pathfinding review

### Passes

- Nodes are created only from explicit `GraphNode` coordinates or coordinate-bearing
  normalized stops.
- `Coordinate` rejects non-finite and out-of-range latitude/longitude values.
- NULL coordinates do not become graph nodes.
- Provider edges require explicit adjacent ordered `stop_ids`; names are not used to
  infer topology.
- Provider identity, route label, mode, and source tier are carried on graph edges.
- Mo E-Ride edges preserve `e-rickshaw` mode.
- Walking edges are deterministic straight-line edges with derived distance/minutes.
- Outgoing edges and path signatures are sorted for deterministic tie-breaking.
- No ranking or itinerary sequencing logic is present.

### Blocking defect

`pathfind._edge_score()` returns `(estimated_minutes or 0, unknown_flag)`. Because the
primary tuple element is minutes, an edge with an unknown duration receives primary cost
zero and can beat a known-duration walking edge. A read-only probe produced:

```text
[('bus', None), ('walk', 1)]
```

for a graph containing a known 20-minute direct walk versus an unknown-duration provider
edge followed by a 1-minute walk. The source comment says unknown duration is “less
preferred,” but the implementation does the opposite in this case. This can produce a
provider route with no duration merely because its duration is unknown.

### Additional limitations

- The graph only adds origin-to-stop and stop-to-destination walking edges; it does not
  add general walking transfer edges between arbitrary stops/providers.
- Adapter exceptions inside `build_graph()` are swallowed without preserving which
  provider failed. The service preflight catches common failures, but later failures are
  not reported in the unavailable reason.
- No service-level test demonstrates a coordinate-bearing disconnected/constraint-
  excluded pair becoming an unavailable hop. With the unconditional direct walking edge,
  coordinate-bearing endpoints are generally reachable unless constraints can exclude
  walking; constraints are currently ignored.

## 11. Walking review

Walking meets the bounded deterministic behavior:

- supplied coordinates are validated before distance calculation;
- haversine distance is deterministic and rounded to metres;
- 80 metres/minute is explicit in code;
- missing persisted coordinates produce an unavailable hop;
- no external directions API or fabricated geometry is used.

The result is a straight-line estimate, not a road route. That limitation is stated in
the code and should remain visible to downstream consumers.

## 12. Multimodal planner review

The planner can produce ordered `walk -> bus -> walk` or `walk -> e-rickshaw -> walk`
legs from injected coordinate/topology fixtures. It preserves provider and route labels,
keeps cost nullable, and uses a deterministic hop mode string. Provider preflight
failures fall back to walking when both endpoints are coordinate-bearing.

The planner does not read `args.constraints` after validation. `budget_transport_per_day`,
`mobility`, `pace`, and other approved constraint fields have no effect on graph
construction or path selection. The transportation model explicitly describes a
constraint-aware shortest/simplest-path search, and the PRD requires recalculation
through deterministic services. This is a correctness/integration gap, not an AMA data
limitation.

The planner also hardcodes hop sequences, does not load database transport rows into
adapters, and uses the unresolved hop-level tier rule described above. These prevent
acceptance of the planner as the final shared deterministic service.

## 13. Provider status review

`get_provider_status()` exists and is wired through the API. For the two default
providers it returns `scheduled` with limitation notes and does not claim live data. An
unknown provider raises an explicit `ProviderNotAvailableError`, which the API maps to
404 rather than inventing `static`, `scheduled`, or `live`.

This is honest for the currently representable schema, but the canonical open decision
about unknown capability versus the three-value `DataTier` remains unresolved. The API
404 is a defensible bounded behavior, not a resolution of the future public status
contract.

## 14. Transport API review

`backend/app/main.py` imports and registers the new router under `/transport`.

- `POST /transport/hop` uses `PlanTransportHopArgs` and returns
  `TransportHopContract`.
- `GET /transport/providers/{provider_id}` uses `GetProviderStatusArgs` and returns
  `ProviderStatusContract`.
- Missing places produce a structured unavailable hop with a reason.
- Unsupported provider status produces a 404 with a human-readable detail.
- No frontend, database schema, map payload, or unrelated API route was changed.

API tests cover missing-place unavailable behavior and known/unknown provider status.
They do not cover a resolved persisted place, a real provider result, provider failure
through HTTP, constraint handling, or API error-envelope compatibility. Exact API error
schema/versioning remains a canonical open decision.

## 15. Test execution evidence

Commands were run from the repository root using the existing `.venv`:

| Command | Result |
|---|---|
| `python -m pytest backend/tests/test_transport backend/tests/test_geospatial_validation.py -q` | Could not run: system Python has no `pytest` module |
| `.\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_transport backend/tests/test_geospatial_validation.py -q` | **28 passed**, 1 existing Pydantic v2 class-config deprecation warning |
| `.\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_transport backend/tests/test_geospatial_validation.py backend/tests/test_phase0_contracts.py -q` | **34 passed**, 1 warning |
| `.\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_phase0_database.py backend/tests/test_import_transport.py backend/tests/test_ama_bus_adapter.py backend/tests/test_import_places.py backend/tests/test_data_validation.py -q` | **76 passed** |
| `.\\.venv\\Scripts\\python.exe -m pytest backend/tests -q` | **111 passed**, 1 warning |
| `.\\.venv\\Scripts\\python.exe -m compileall -q backend/app` | Passed |
| `git diff --check` | Passed; only existing LF/CRLF conversion warnings were printed |

The full backend suite includes the Phase 0, Phase 2 database/import, geospatial
preparation, and Phase 3 tests. The focused Phase 3 suite is green but is not sufficient
for acceptance because of the coverage gaps below.

## 16. Test quality assessment

### Covered adequately

- adapter identity, mode, tier, empty defaults, and nullable fare;
- invalid coordinate rejection;
- graph node/edge creation from explicit injected records;
- provider identity and route label preservation;
- deterministic repeated pathfinding;
- synthetic walk/provider/walk ordering;
- reverse-direction unreachable graph behavior;
- missing place/coordinate unavailable reasons;
- provider failure fallback to walking;
- provider status and unknown-provider API behavior;
- supplied geometry validation and NULL/unavailable geometry preservation;
- Phase 0 contract regression and full Phase 2/backend regression.

### Missing or insufficient

- no real verified AMA or Mo E-Ride fixture pair reaches the planner;
- no adapter test loads or normalizes the actual source JSON/database records;
- no test proves Route 12 blank candidates and unresolved BQS records cannot be promoted by
  the Phase 3 adapter boundary;
- no test exercises a provider edge with unknown duration against a known walking edge;
- no test verifies `budget_transport_per_day`, `mobility`, `pace`, or mode preferences;
- no service-level unavailable result for a disconnected or constraint-excluded pair;
- no test for exceptions thrown during graph normalization after preflight;
- no API test for a resolved persisted place or real transport response;
- no test for hop-level tier aggregation semantics because that decision is open;
- no negative test for injected records lacking provenance/verification metadata.

The synthetic coordinates and route names are acceptable as algorithm fixtures because the
fixture tests label them synthetic and do not present them as repository/provider facts.
They cannot satisfy the canonical real-fixture exit criterion.

## 17. Factuality/provenance audit

| Value/behavior | Classification | Evidence |
|---|---|---|
| Walking distance/minutes | DERIVED DETERMINISTICALLY | Haversine over supplied validated endpoints and fixed 80 m/min rule |
| AMA/Mo E-Ride default route data | EXPLICIT UNKNOWN / UNAVAILABLE | Concrete adapters default to empty lists |
| AMA coordinates and Route 12 topology | EXPLICIT UNKNOWN / UNAVAILABLE | No Phase 3 values added; source records remain outside default routing |
| Mo E-Ride coordinates/topology for production | EXPLICIT UNKNOWN / UNAVAILABLE | No default records; source file marks coordinates unresolved |
| Fares/costs | EXPLICIT UNKNOWN | `estimate_fare()` and planner cost return `None` |
| Live status | UNSUPPORTED / NOT CLAIMED | No live method is implemented and status notes say no live source |
| Synthetic coordinates/routes in tests | DERIVED TEST FIXTURE, NOT PRODUCT FACT | Clearly injected in test code and handoff |
| Provider status tier | VERIFIED FOR THE DOCUMENTED SOURCE LAYER, BUT COARSE | Static/scheduled source evidence exists; current contract cannot represent multiple/unknown layers |

No fabricated travel fact was found in the committed Phase 3 implementation. The main
factuality risk is not an invented value; it is that arbitrary injected normalized records
have no provenance field or verification gate. Production defaults avoid that risk by
being empty, at the cost of not meeting the real-provider normalization/fixture target.

## 18. Scope-creep audit

The reviewed commit changes only transport adapters, graph/pathfinding, transport
service, transport API wiring, the existing transport contract/test, Phase 3 tests, and
the Rudra handoff. It does not change:

- ranking or candidate selection;
- itinerary sequencing;
- AI orchestration or model execution;
- database models or migrations;
- provider source data;
- frontend product code;
- map/GeoJSON implementation or authoritative geometry;
- Phase 4, Phase 5, Phase 6A, or Phase 6B features.

The separate uncommitted Susmita geospatial validation package and fixtures are
pre-existing working-tree work, not part of Rudra's commit.

## 19. Susmita/map boundary review

The implementation respects the map boundary:

- no map payload, GeoJSON contract, route line, or frontend map behavior was added;
- no geometry is generated from stop names, route labels, or order;
- missing coordinates remain unavailable;
- provider/route labels and leg order are available in the current transport contract;
- stable stop IDs, route IDs, path sequences, geometry fields, and geometry absence states
  remain open for Phase 6A.

Rudra supplies routing facts through the transport contract; Susmita remains the owner of
later geospatial/map representation. Phase 6A is not required for this review and was not
implemented.

## 20. Open decisions

| Decision | Status | Blocking acceptance? | Review finding |
|---|---|---|---|
| Nullable/unknown fare representation | OPEN | No, for this bounded slice | Costs and fares remain `None`; no value is fabricated. |
| One data tier for a multimodal hop | OPEN | Yes for final planner acceptance | Code chooses the lowest enum tier without Smarak approval; walk+scheduled becomes static. |
| Unknown provider capability representation | OPEN | Yes for final public status contract; not a factuality failure here | Unsupported providers return 404 rather than a false tier, but the contract decision is unresolved. |
| Planner input/location-resolution boundary | OPEN | Yes for integrated planner acceptance | Existing args plus an internal resolver are used; sequence is hardcoded and constraints are ignored. |
| Exact map/GeoJSON contract | OPEN | No for Phase 3 bounded routing | No map implementation was added; Phase 6A remains gated. |
| Stable identifiers for downstream map integration | OPEN | No for current bounded code; blocks map integration | Current transport fields carry display provider/route values only. |

No open decision should be treated as resolved by this review.

## 21. Phase 3 acceptance checklist

| Requirement | Evidence | Status | Notes |
|---|---|---|---|
| Common adapter contract implemented for verified providers | `backend/app/transport/adapters/base.py`, concrete AMA/E-Ride classes | PASS | Provider-neutral interface exists; default source loading is a separate gap. |
| Verified provider data normalized through common contract | Concrete adapters accept normalized records but default to empty and do not load source/DB records | PARTIAL | No actual verified source record reaches the default adapters. |
| Honest static/scheduled/live tiers preserved | Adapter/status code, Phase 3 tests, provider verification record | PARTIAL | No live claim; hop aggregation and unavailable tier semantics remain open. |
| Multimodal transport-hop planning | Graph/service synthetic fixture tests | PARTIAL | Algorithm works for injected data, not for a real verified provider fixture. |
| At least one supported real fixture pair produces a multimodal hop | Handoff states synthetic fixture does not satisfy target; no real pair executed | FAIL | Required exit evidence is absent. |
| Unreachable pairs return unavailable result with reason | Missing-coordinate/missing-place service tests; reverse graph returns `None` only | PARTIAL | No service-level disconnected/constraint-excluded unavailable test. |
| Missing provider data does not crash planner | `test_provider_failure_isolated_and_walking_remains_available` | PASS | Common preflight failure path is covered. |
| Provider status exposes honest tier/notes | Service/API status tests | PARTIAL | Honest for default providers; unknown-capability representation remains open. |
| No unverified API, route, fare, schedule, coordinate, or live claim | Commit/source audit and empty defaults | PASS | No fabricated travel fact found. |
| NULL/unresolved AMA coordinates remain explicit | Default AMA adapter empty; SQL resolver returns `None` for NULL location | PASS | No inference or coordinate substitution found. |
| Route 12 blank candidate rows are not mapped | No Route 12 data or inference in Phase 3 code; graph requires explicit stop IDs | PASS | Specific negative regression test is absent. |
| Geometry dependency contract remains compatible | No geometry/map fields or implementation added | PASS | Susmita boundary remains open and intact. |
| Backend/API wiring remains within Phase 3 | `/transport/hop`, `/transport/providers/{provider_id}` registered | PASS | No unrelated route was changed. |
| No Phase 4/5/6A/6B scope creep | Commit file audit | PASS | No ranking, itinerary, AI, frontend, map, or migration work added. |
| Scope/progress/completion/handoff evidence exists | Rudra scope and implementation handoffs, this review | PASS | Handoff claims were independently checked; not accepted as proof alone. |
| Existing backend regression baseline remains green | 76 Phase 2/import and 111 full backend tests passed | PASS | One pre-existing Pydantic deprecation warning remains. |

## 22. Integration risks

1. Unknown-duration provider edges can be selected ahead of known walking due to the
   primary path-cost ordering defect.
2. Constraint changes from Smarak's planning boundary currently do not affect transport
   output, so a future itinerary/replanning caller could receive a route that violates
   mobility, budget, or walking preferences.
3. Default API service instances do not load the persisted transport provider/stop/route
   tables or the verified source files; the API currently provides walking or explicit
   unavailable behavior rather than real provider routing.
4. The hop-level tier and unavailable-tier choices can mislead downstream consumers until
   the open contract decisions are resolved.
5. Hardcoded hop sequences and display-only provider/route strings limit safe downstream
   itinerary and map integration.
6. Adapter provenance is external to the normalized record types, so arbitrary injected
   records can look verified to the graph unless the future source boundary adds a
   verification/provenance guard.

## 23. Discrepancies from Rudra's handoff

| Area | Rudra claimed | Actual repository | Result |
|---|---|---|---|
| Tests | 28 transport/geospatial and 111 full backend tests | Exact commands reproduce 28 and 111 passes, each with one existing Pydantic deprecation warning | CONFIRMED |
| No fabricated data | No coordinates/routes/fares/live state fabricated | No product facts found; synthetic test data is clearly test-local | CONFIRMED |
| Evidence-only graph | Graph uses supplied coordinates/topology only | True, but unknown-duration score can prefer an unknown provider edge | PARTIALLY CONFIRMED; correction required |
| Conservative tier aggregation | Lowest-confidence supporting tier is exposed | Code uses minimum enum tier; canonical aggregation rule is still OPEN | IMPLEMENTED ASSUMPTION; approval required |
| Provider failure isolation | Adapter errors are isolated | Preflight errors are isolated; exceptions inside graph normalization are swallowed without reason | PARTIALLY CONFIRMED |
| Honest provider status | Static/scheduled limitations and no live claim | True for default AMA/E-Ride status; unknown capability still has no approved schema representation | CONFIRMED WITH OPEN DECISION |
| Real multimodal acceptance | Synthetic unit is not the real-fixture target | No real verified fixture pair exists in execution evidence | NOT SATISFIED |
| Planner contract | Existing args and persisted-place resolver used | True, but constraints are ignored and hop sequence is hardcoded | PARTIALLY CONFIRMED |
| No geospatial product behavior | No map/geometry implementation | True for Rudra commit; separate Susmita validation work is pre-existing | CONFIRMED |

## 24. Required corrections, if any

### 1. Unknown-duration path scoring

- issue: `pathfind._edge_score()` treats `None` duration as primary cost zero.
- severity: P0 — correctness blocker
- owner: Rudra
- exact correction: Choose and document a deterministic cost ordering approved for the
  transport boundary so unknown-duration edges cannot outrank known-duration edges merely
  because their duration is unknown. Add a regression test with a known walking route and
  an unknown-duration provider edge.
- blocking/non-blocking: **Blocking**

### 2. Constraint handling

- issue: `plan_transport_hop()` accepts `PlanningConstraints` but does not apply any
  constraint to graph construction or path selection.
- severity: P1 — integration correctness blocker
- owner: Rudra, coordinated with Smarak for semantic interpretation
- exact correction: Implement only the approved deterministic transport effects for the
  existing constraint fields, or obtain an explicit boundary decision that defers a field.
  Add tests for the implemented budget/mobility/walking behavior and for explicit
  unavailable output when constraints exclude all defensible paths.
- blocking/non-blocking: **Blocking**

### 3. Resolve open hop-tier/unavailable semantics

- issue: The code commits to minimum-tier aggregation and `static` on unavailable hops
  while the canonical one-tier and unknown-capability decisions remain OPEN.
- severity: P1 — contract/semantic blocker
- owner: Smarak/Punam for decision; Rudra for implementation alignment
- exact correction: Record the approved aggregation and unavailable/unknown semantics,
  then align service/status behavior and add contract tests. Do not map unknown capability
  to a false tier.
- blocking/non-blocking: **Blocking for acceptance/public integration**

### 4. Provide real fixture-pair evidence without invention

- issue: The Phase 3 exit criterion requiring one real supported multimodal pair is not
  met; only synthetic injected records are exercised.
- severity: P1 — exit-evidence blocker
- owner: Akriti for defensible coordinates/topology/source closure; Rudra for adapter and
  planner integration; Smarak for an explicit acceptance exception if the criterion must
  remain blocked
- exact correction: Supply a defensible coordinate-bearing/topology fixture or formally
  record an approved Phase 3 limitation. Do not infer AMA or Mo E-Ride coordinates or
  topology to manufacture the pair.
- blocking/non-blocking: **Blocking for the canonical exit criterion; not a fabrication
  failure**

### 5. Normalize source-backed provider records or explicitly bound the adapter surface

- issue: Default AMA/E-Ride adapters return empty lists and do not load the verified
  source/DB records; no provenance/verification marker exists on normalized records.
- severity: P1 — provider integration evidence gap
- owner: Rudra, coordinated with Akriti and Smarak
- exact correction: Add a source-backed normalization boundary that preserves unresolved
  coordinates/topology and provenance, or document and approve the empty-adapter boundary
  as a non-accepted preparation slice. Add tests proving actual source records are
  normalized without promotion of unresolved facts.
- blocking/non-blocking: **Blocking for full verified-provider acceptance; the empty
  behavior itself is not a factuality violation**

## 25. Final acceptance rationale

The implementation is a useful bounded transport foundation and respects the most
important factuality and ownership boundaries. It is not rejected because research is
incomplete. It is rejected because the deterministic planner has a reproducible path
selection defect, ignores approved planning constraints, encodes unresolved contract
semantics, and lacks the required real verified multimodal evidence. A green test suite
does not cover those conditions.

The appropriate current state is therefore **PHASE 3 NOT ACCEPTED — CORRECTIONS
REQUIRED**, with the provider/data limitations retained as explicit unavailable states
rather than “fixed” through inference.

## 26. Recommended next action

1. Rudra corrects unknown-duration scoring and adds the missing constraint/failure tests.
2. Smarak/Punam records the hop-tier, unavailable-tier, and planner-input decisions
   before public/API integration is treated as stable.
3. Rudra adds a provenance-preserving source normalization path when defensible inputs are
   available; Akriti supplies only verified coordinates/topology/source closure.
4. Re-run the focused transport suite, Phase 2 regression, full backend suite, and the
   real-fixture acceptance evidence review.
5. Keep AMA/Mo E-Ride unavailable where evidence remains insufficient; do not start
   Phase 4, Phase 5, Phase 6A, or Phase 6B as part of this correction cycle.

This report stops at the integration review. No implementation correction was made.
