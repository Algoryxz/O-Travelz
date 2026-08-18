# Rudra Phase 3 Scope Report — 2026-08-18

## Purpose

This is the implementation handoff for Rudra's bounded Phase 3 work. It reconciles the
canonical documents, existing Phase 2 handoffs, provider evidence, executable contracts,
database models, data files, and the actual repository tree. It is a scope report only;
it does not implement or accept Phase 3.

The Smarak Phase 3 entry gate is already **SATISFIED**. It is not repeated or re-opened
here. The workflow after this report is: Smarak review → Rudra implementation → review
and integration evidence → Phase 3 acceptance.

## Current repository state

| Component | State | Evidence and boundary |
|---|---|---|
| `backend/app/transport/` | PARTIAL | Package exists; no planner or provider execution service exists. |
| `backend/app/transport/adapters/base.py` | CONTRACT/SCHEMA ONLY | Provider-neutral abstract interface exists; no concrete adapter uses it. |
| `backend/app/transport/adapters/` | PARTIAL | Only `__init__.py` and `base.py`; provider adapters are missing. |
| `backend/app/transport/graph/` | MISSING | Only `__init__.py`; no graph builder or pathfinder. |
| `backend/app/schemas/transport.py` | CONTRACT/SCHEMA ONLY | `TransportLeg`, `TransportHopContract`, and `ProviderStatusContract` validate shapes but do not execute transport logic. |
| `backend/app/models/transport.py` | IMPLEMENTED | Phase 2 persistence models exist for providers, sources, stops, routes, route stops, schedules, and fares. This is not a routing implementation. |
| `scripts/import_ama_bus.py` | IMPLEMENTED | Phase 2 research-package importer; it is not a Rudra provider adapter or route planner. |
| `backend/app/main.py` / `backend/app/api/` | PARTIAL | FastAPI health endpoint exists; API package is empty and no transport router is wired. |
| `backend/app/services/` | CONTRACT/SCHEMA ONLY | Ranking and itinerary packages are empty; Rudra must not implement them in Phase 3. |
| `backend/app/geospatial/` | MISSING / OUT OF SCOPE | Package is empty. Authoritative map/geospatial implementation is Susmita's Phase 6A work. |
| `data/transport/static/` and `data/transport/fares/` | PARTIAL | Sourced research inputs exist, but their presence is not proof that a provider is seed-ready or routing-ready. |
| `backend/tests/` | PARTIAL | Phase 0, Phase 2 import/database, and health tests exist. No `backend/tests/test_transport/` directory or Phase 3 planner/pathfinding tests exists. |
| Frontend transport/map surfaces | CONTRACT/SCHEMA ONLY | `frontend/src/api/contracts.ts` mirrors the Phase 0 contract; `MapPlaceholder.tsx` is a placeholder, not a map or routing consumer. |

The repository's existing baseline does not contain accepted provider adapters, graph/
pathfinding, `plan_transport_hop`, `get_provider_status`, or transport API wiring.

## Phase 3 scope

### In scope for Rudra

- Provider adapters only for capabilities supported by verified evidence.
- Common normalization into the existing transport contract.
- Walking and provider graph edges where coordinates and topology are defensibly present.
- Deterministic pathfinding and multimodal hop planning.
- Explicit unavailable, missing-data, provider-failure, and fallback behavior.
- Provider status behavior that does not overclaim capability or freshness.
- Backend/API wiring needed for the approved transport boundary.
- Unit, contract, pathfinding, planner, failure, and regression tests.

### Out of scope

Ranking, candidate selection, itinerary sequencing, AI execution, complete frontend/UX,
authoritative map visualization, database-semantic changes, research closure, invented
provider APIs, invented routes/schedules/fares/live status, and fabricated coordinates
or geometry are outside this report.

## Provider scope

“Verified” below means the service/mode has research evidence in the frozen provider
record. It does not mean that a machine-consumable O-Travelz adapter is ready.

| Provider | Verified | Available evidence/data | Data tier | Adapter needed | Routing usable | Limitations |
|---|---|---|---|---|---|---|
| AMA Bus / Mo Bus | Yes, service and static/scheduled research | Phase 2 confirmed import: 72 identity-confirmed stops, 95 routes, 193 schedule groups, 3,617 timetable values; one scheduled provider-source layer. Repository also has static research files. | `static`/`scheduled`; no live claim | Yes, scoped to confirmed data | **PARTIAL/BLOCKED for place-to-stop routing** | All 72 confirmed stop locations are `NULL`/unresolved; confirmed import does not establish canonical `RouteStop` topology; 11 BQS records remain outside confirmed stops; 36 Route 12 rows remain unmapped; no structured AMA fare. |
| Mo E-Ride | Yes, service and static/scheduled research | `data/transport/static/ama_e_ride.json`: 129 named stops and 13 routes; schedule file contains operating windows and explicitly approximate headways; fare file contains a sourced flat fare. | `static`/`scheduled` where the source supports it; headway remains estimate-only | **Yes only after seed-readiness/evidence review** | **BLOCKED** | All 129 research stops have unresolved coordinates in the repository file; the frozen record says every structured-import stop needs independently verified coordinates; no confirmed Phase 2 database import is evidenced. |
| Odisha Yatri | Yes as a platform/network | Official platform/network documentation only; no public unauthenticated O-Travelz-consumable access verified. | `unknown` in provider research; not representable by current `DataTier` enum | No full adapter until separate verification; status/unavailable handling may be needed | **BLOCKED** | No verified machine-consumable routes, schedules, fares, or live status. Do not convert platform capability into an adapter. |
| Auto / e-rickshaw | Yes as a regulated mode | Regulatory/OPTICS evidence; no verified trip-planning source or in-scope provider feed. | `static` only when a current applicable source is verified; otherwise `unknown` | No full routing adapter on current evidence | **BLOCKED** | No route network, schedule, fare payload, or live source established for O-Travelz. |
| Taxi | Yes as a regulated mode | Regulatory/OPTICS evidence; no verified in-scope provider trip-planning source. | `static` only when a current applicable source is verified; otherwise `unknown` | No full routing adapter on current evidence | **BLOCKED** | No verified provider API, route, schedule, fare payload, or live source. |
| Train / intercity rail | Yes as a service | Official passenger-enquiry/timetable evidence; no simple public developer API verified for O-Travelz and no train seed data is present in the repository. | `scheduled` for verified timetable research | Adapter only after a concrete consumable source/data handoff | **BLOCKED** | No in-scope imported station/route/schedule dataset or API contract is present. |
| Walking | Yes as an approved transport mode/fallback | Canonical transport model and PRD allow walking; it is deterministic only where both endpoints have verified coordinates. | Freshness tier for walking is not explicitly resolved | Yes, or an equivalent graph edge implementation | **PARTIAL** | Place and stop coordinates can be `NULL`; walking must return unavailable when endpoints cannot be located rather than infer coordinates. |

The initial practical Phase 3 target is an honest walking path and, only if the
required topology/coordinates are supplied without inference, a static/scheduled AMA
or E-Ride multimodal path. A provider status result may state that a provider is
unavailable; it must not imply that an unverified API exists.

## Adapter contract assessment

`backend/app/transport/adapters/base.py` currently defines:

- `provider_name: str` as a class/instance identity convention, not a validated field;
- `get_stops() -> list` with no typed output or input;
- `get_routes() -> list` with no typed output or input;
- `get_data_tier() -> app.models.transport.DataTier`;
- `estimate_fare(from_stop, to_stop) -> dict`, documented as containing a concrete
  amount, currency, and basis;
- optional `get_live_status()` that raises `NotImplementedError` unless a subclass adds it.

The adapter therefore has a provider identity convention, topology outputs, a tier
method, and fare/live hooks. It has no explicit request context, typed normalized
stop/route result, provider failure result, unavailable result, status object, source
provenance output, or geometry output. Provider exceptions and empty-result semantics
are not defined by the interface.

There is also a repository contract seam: the adapter imports `DataTier` from the model,
while the API schema declares a separate `DataTier` enum with the same three values.
Do not silently change either contract. Record any compatibility decision and its tests
if implementation exposes both layers.

### Contract gaps to preserve as decisions

- **OPEN DECISION:** `estimate_fare()` currently implies a concrete amount, but
  `FareRule.amount` is nullable and AMA's current fare state is explicitly unknown.
  A fare result must be able to remain unknown before a fare adapter is accepted.
- **OPEN DECISION:** The current hop has one `data_tier`, while multiple legs may come
  from different tiers. Aggregation/preservation rules for a multimodal hop are not
  specified.
- **OPEN DECISION:** The current schemas have no explicit `unknown` data tier, although
  the frozen provider record uses unknown for unverified machine-consumable capability.
  Do not encode unknown as live, static, or scheduled.
- **OPEN DECISION:** The planner input needs physical locations and/or stable domain
  objects, but `PlanTransportHopArgs` carries only `PlaceSummary` (`id`, `name`,
  `category`) and constraints. The internal service signature and resolution boundary
  are not yet defined.
- **IMPLEMENTATION DETAIL:** Exception isolation, deterministic tie-breaking, graph
  indexing, and adapter registration can be selected within the existing boundary,
  provided they preserve the decisions above and are tested.

## Graph and pathfinding scope

The graph should be derived only from verified records:

- **Nodes:** coordinate-bearing itinerary/place endpoints, coordinate-bearing transport
  stops, and provider route/stop connection points represented by confirmed topology.
  `NULL`-location stops and unresolved Route 12 candidates are excluded from spatial
  edges and must not be replaced with inferred points.
- **Walking edges:** deterministic edges between endpoints with verified coordinates,
  using a documented distance/speed rule. No walking edge may be created when either
  endpoint is not locatable. The exact walking metric/speed is an implementation detail
  unless it changes the shared contract.
- **Provider edges:** ordered adjacent `RouteStop` relationships and only other
  provider facts actually present in the verified source layer. Timetable constraints
  may be applied only when explicit schedule data supports them.
- **Multimodal transitions:** place → walk → stop → provider leg(s) → stop → walk →
  place, with each leg retaining mode, provider/route when known, and supported detail.
- **Determinism:** fixed edge construction, fixed cost/constraint interpretation, and
  deterministic tie-breaking for equal paths. Ranking and itinerary sequencing are not
  graph concerns.
- **Unreachable behavior:** return a structured unavailable hop with a human-readable
  `reason`; never drop a destination, crash, or fabricate a route.
- **Missing data:** omit unsupported edges and continue with defensible alternatives,
  such as walking only where endpoints are coordinate-bearing. If no defensible path
  remains, return unavailable.
- **Data tier:** preserve the source tier on each normalized provider result and apply
  the approved hop-level rule once Smarak resolves the current aggregation gap. No live
  tier may be emitted from static/scheduled material.

## `plan_transport_hop`

### Inputs

The canonical team document names `plan_transport_hop(from_place, to_place, constraints)`
and the Phase 0 AI boundary uses `PlanTransportHopArgs` with `PlaceSummary` values and
`PlanningConstraints`. The repository does not yet define the internal domain input or
location-resolution API. Rudra should document the chosen internal boundary before
implementation and coordinate any shared contract change with Smarak/Punam.

### Processing

1. Resolve the two endpoints to verified place records/locations without substituting
   coordinates for a `NULL` location.
2. Load eligible provider adapters and source layers; isolate provider failures.
3. Build or query the deterministic graph for the requested constraints.
4. Include walking edges and provider edges only where data and topology support them.
5. Search with fixed deterministic rules and preserve the selected legs' facts/tier.
6. Normalize the result to `TransportHopContract` and validate it before returning.

### Outputs

- **Successful:** `from_sequence`, `to_sequence`, a mode such as `walk` or a documented
  multimodal mode string, nullable estimates when unsupported, ordered `legs`, provider
  and route labels where available, and an honest `data_tier`. Do not manufacture a
  fare or duration.
- **Unavailable:** `mode="unavailable"`, required human-readable `reason`, no invented
  legs, and a valid current tier only if the contract semantics justify one.
- **Provider failure:** do not leak an exception into normal planner behavior; record a
  truthful reason/status and try an allowed fallback. If no fallback is defensible,
  return unavailable.
- **Missing data:** exclude the affected edge/provider and return a supported path or
  explicit unavailable state. Unknown coordinates, topology, fare, and live status
  remain unknown.

## `get_provider_status`

The expected result is the existing `ProviderStatusContract`: `provider_id`, one of the
currently representable `DataTier` values, and optional notes. It should describe the
provider/source layer actually available to O-Travelz, including limitations such as
“no verified live source” or “route data unavailable.” It must not turn service-level
verification into a claim of a usable API. Provider-not-found, unknown capability, and
the representation of a provider with no usable tier remain contract/API decisions;
they must be documented rather than hidden in a fake tier.

## Test and evidence matrix

| Area | Required evidence |
|---|---|
| Adapter normalization | Fixture records normalize provider identity, stops, ordered routes, schedules, nullable fares, and supported tiers without extra invented fields. |
| Provider failure | An adapter exception is isolated; planner returns a supported fallback or unavailable reason. |
| Missing provider data | Empty/missing stops, routes, schedule, coordinates, and fares do not crash the planner and do not create inferred records. |
| Data-tier preservation | Static/scheduled fixtures remain those tiers; no live result is emitted; multimodal aggregation follows the approved decision. |
| Graph construction | Only verified coordinate-bearing nodes and defensible topology become edges; unresolved AMA and Route 12 rows are excluded. |
| Walking | Coordinate-bearing endpoints produce deterministic walking output; missing endpoint coordinates produce explicit unavailable behavior. |
| Multimodal routing | A verified fixture with sufficient topology produces ordered walk/provider/walk legs; no fabricated geometry or route detail is added. |
| Unreachable pairs | Disconnected or constraint-excluded pairs return `mode="unavailable"` with a reason. |
| Unavailable reasons | Missing data, provider failure, and no-path cases retain useful, non-empty reasons. |
| Transport-hop behavior | Inputs, constraints, ordered legs, nullable estimates, provider/route identity, and tier validate against the shared schema. |
| Provider status | Verified provider/source status reports honest tier and limitations; unverified capabilities are not claimed. |
| Regression | Run the existing backend suite and focused Phase 0/Phase 2 contract/import tests; no Phase 3 acceptance is implied by a green baseline. |

Required implementation evidence is the test output, fixture/source references, and a
Rudra completion/handoff report. Tests must not silently depend on a live provider API.

## Dependencies and ownership

| Owner | Real dependency |
|---|---|
| Smarak | Existing transport/itinerary semantics, acceptance review, resolution of open hop/fare/tier/input decisions, and review of any contract change. Rudra does not own ranking or itinerary meaning. |
| Akriti | Frozen provider verification and any future defensible closure of AMA coordinates, BQS identities/evidence, Route 12 mappings, fares, or additional provider sources. Engineering must proceed with current unknowns. |
| Susmita | Only the downstream map/geospatial dependency contract when Rudra has actual routing outputs. Susmita does not provide routing authority or fabricated geometry. |
| Deeptiman | Downstream frontend/API consumption after approved contracts; no Phase 3 implementation dependency is required now. |
| Punam | Documentation, evidence, repository-map synchronization, phase tracking, and acceptance-readiness handoff. |

## Contract/open decision classification

| Issue | Classification | Action |
|---|---|---|
| Phase 3 entry gate and ownership | READY | Do not redo the gate; implement only Rudra's bounded scope. |
| Phase 0 hop/provider status schemas | READY as boundary | Preserve fields and validator behavior; add tests around actual use. |
| Provider adapter registration and exception isolation | IMPLEMENTATION DETAIL | Document in Rudra code/report and test it. |
| Deterministic graph cost/tie-breaking and walking calculation | IMPLEMENTATION DETAIL | Choose and document without adding ranking semantics or fabricated facts. |
| Nullable/unknown fare representation | OPEN DECISION | Smarak/Punam must approve before a concrete fare result is required. |
| One tier for a multimodal hop | OPEN DECISION | Smarak resolves aggregation/preservation semantics before acceptance. |
| Unknown provider capability vs three-value `DataTier` | OPEN DECISION | Do not map unknown to a false tier. |
| Planner input/location-resolution boundary | OPEN DECISION | Coordinate with Smarak before public/API integration. |
| Confirmed AMA place-to-stop routing | BLOCKED | Requires defensible stop coordinates and route-stop topology; preserve unavailable behavior meanwhile. |
| Mo E-Ride production routing | BLOCKED | Requires independently verified stop coordinates and a canonical seed/import handoff. |
| Odisha Yatri, auto, taxi, train full adapters | BLOCKED | Requires a verified O-Travelz-consumable data source and/or imported data. |
| Phase 6A geometry/map implementation | OUT OF SCOPE | Susmita owns it; Rudra supplies only approved routing facts/geometry outputs when available. |

## Expected implementation files

Existing paths:

- `backend/app/transport/adapters/base.py`
- `backend/app/transport/adapters/__init__.py`
- `backend/app/transport/graph/__init__.py`
- `backend/app/transport/__init__.py`
- `backend/app/schemas/transport.py`
- `backend/app/schemas/itinerary.py`
- `backend/app/models/transport.py`
- `backend/app/models/itinerary.py`
- `backend/app/main.py`
- `backend/app/api/__init__.py`
- `backend/tests/test_phase0_contracts.py`
- `backend/tests/test_ama_bus_adapter.py`
- `backend/tests/test_data_validation.py`

Canonical `TO CREATE` locations from the team/build documentation:

- `backend/app/transport/adapters/mo_bus.py`
- `backend/app/transport/adapters/mo_e_ride.py`
- `backend/app/transport/adapters/odisha_yatri.py` — only if separately verified
- `backend/app/transport/adapters/auto_rickshaw.py` — only if separately verified
- `backend/app/transport/adapters/taxi.py` — only if separately verified
- `backend/app/transport/adapters/walking.py`
- `backend/app/transport/graph/build_graph.py`
- `backend/app/transport/graph/pathfind.py`
- `backend/app/transport/service.py`
- `backend/app/api/` transport router path — exact filename is not canonically fixed
- `backend/tests/test_transport/` adapter, graph, planner, status, and failure tests

No database migration, provider data edit, map module, frontend feature, ranking module,
itinerary module, or AI execution file is authorized by this report.

## Proposed implementation sequence

1. Smarak reviews this report and resolves/approves the open contract decisions needed
   for the first implementation slice.
2. Rudra writes focused contract/fixture tests and registers only verified providers and
   walking behavior that current evidence can support.
3. Implement normalization and adapter failure/empty-data behavior.
4. Implement graph construction from verified coordinates and defensible route topology,
   with explicit exclusion of unresolved records.
5. Implement deterministic pathfinding and walking/provider multimodal transitions.
6. Implement `plan_transport_hop` and `get_provider_status`, including unavailable and
   fallback behavior.
7. Add only the approved backend/API wiring; keep API error/version decisions visible.
8. Run transport tests plus the existing backend regression suite.
9. Produce Rudra's implementation evidence and downstream handoff for Smarak, Susmita,
   Deeptiman, and Punam.

## Phase 3 acceptance evidence map

| Exit criterion | Evidence required |
|---|---|
| Demo-relevant verified providers return honest tiers | Adapter/status tests tied to the frozen provider record and source-layer metadata; no live claims. |
| One supported real fixture pair produces a multimodal hop | Reproducible fixture/source pair with verified coordinates/topology, ordered legs, and contract-valid output. If current data cannot support one, acceptance remains blocked rather than using invented facts. |
| Unreachable pair returns unavailable with reason | Pathfinding/planner test with disconnected or constraint-excluded graph and `TransportHopContract` validation. |
| Missing provider data does not crash planner | Empty-data/failed-adapter tests showing fallback or explicit unavailable output. |
| No unverified claims | Adapter/status review, source references, tier assertions, and negative tests for live/API/route/fare/coordinate invention. |

## Next action

Smarak reviews this scope report and resolves or approves the listed open decisions.
After that review, Rudra starts the bounded adapter/graph/planner implementation and
records test evidence before requesting integration review.

## Readiness

The Phase 3 gate is satisfied and the bounded work is **READY FOR IMPLEMENTATION**.
Provider-specific and contract-level limitations listed as `BLOCKED` remain real
implementation constraints; they are not permission to infer missing research or to
claim Phase 3 completion.

**READY FOR IMPLEMENTATION**
