# Smarak Phase 3 Integration Review #2

## Review metadata

- reviewer: Smarak integration/review agent
- repository: `C:\Users\smara\Desktop\o-travelz`
- branch: `main`
- reviewed commit: `d6a0291734f40dbe76e113b014d574104eb5f7d3`
- review date: 2026-08-18
- previous review: `docs/handoffs/2026-08-18_SMARAK_PHASE3_INTEGRATION_REVIEW.md`
- correction handoff: `docs/handoffs/2026-08-18_SMARAK_PHASE3_CORRECTION_HANDOFF.md`

This review was read-only except for creation of this report. No production code, tests,
canonical documents, data, or existing working-tree changes were modified.

### Current change classification

**A. Original Rudra Phase 3 checkpoint:** committed at `d6a0291734f40dbe76e113b014d574104eb5f7d3`, including the transport adapters, graph, service, API wiring, original Phase 3 tests, and Rudra handoff.

**B. Phase 3 correction work:** current working-tree changes in:

- `backend/app/transport/graph/pathfind.py`
- `backend/app/transport/service.py`
- `backend/tests/test_transport/test_graph.py`
- `backend/tests/test_transport/test_service.py`
- `docs/handoffs/2026-08-18_SMARAK_PHASE3_CORRECTION_HANDOFF.md`

**C. Unrelated pre-existing Smarak/Susmita work:** modified geospatial, canonical-state,
architecture, and frontend map-boundary files; untracked geospatial validation/tests and
fixtures; earlier control/progress/scope/readiness reports; the first review report; and
the Phase 3 checklist. These remained untouched.

## Previous blockers

| Previous blocker | Review #2 result |
|---|---|
| Unknown-duration provider edges scored as cost 0 | Corrected and regression-tested |
| Planner constraints accepted but ignored | Corrected to explicit fail-closed behavior; semantics are not falsely claimed as implemented |
| No defensible real multimodal fixture | Still blocked by unresolved coordinates/topology; no fabrication used |
| Hop-tier/unavailable-tier semantics open | Still OPEN and explicitly not resolved |
| Provider normalization bounded | Still bounded and honestly documented; no unsupported source records promoted |

## Correction verification

The correction work is limited to pathfinding cost semantics, fail-closed transport
constraint handling, regression tests, and evidence documentation. No provider data,
database schema, frontend, map, ranking, itinerary, AI, or Phase 6A behavior was added.

## Unknown-duration scoring

`backend/app/transport/graph/pathfind.py` now scores each edge as:

```text
(unknown_duration_edge_count, known_minutes, hop_count)
```

An edge with `estimated_minutes=None` contributes one to the explicit unknown-duration
count and contributes no known minutes. It does not mutate `estimated_minutes`, assign a
duration, or become a zero-minute edge. The unknown-count dimension is primary, so a
path with known durations is preferred over a path containing an unknown-duration edge.
Among paths with the same unknown status, known minutes and hop count remain deterministic
tie-break dimensions.

This is a conservative ordering choice: it avoids inventing a penalty or estimate for an
unknown duration. It does not claim that the unknown duration is short, zero, or otherwise
comparable to a known duration.

The new tests verify:

- a known 20-minute walking edge beats an unknown-duration AMA Bus edge plus a one-minute
  transfer;
- an unknown provider duration remains `None`;
- provider identity remains `ama-bus`;
- `DataTier.SCHEDULED` remains preserved;
- repeated selection returns the same path;
- existing known-duration `walk -> bus -> walk` behavior remains intact;
- reverse/unreachable graph behavior remains correct.

Correction #1 is **PASS**.

## Planner constraint handling

The shared repository contract defines `days`, `interests`, `dates`, `pace`,
`budget_transport_per_day`, `start`, and `mobility`. The canonical documents describe
transport-aware constraint recalculation and examples such as reducing walking or
transport cost, but they do not define a precise budget allocation, mobility taxonomy,
pace rule, or walking threshold for this hop service.

The corrected service therefore does not invent those semantics. When any of the
transport-relevant fields below is supplied, it returns a contract-valid unavailable hop
with a reason naming the unsupported field:

- `budget_transport_per_day`;
- `mobility`;
- `pace`.

This is correctly fail-closed behavior, not implementation of those constraint semantics.
It prevents a caller from receiving a walking or provider result that falsely claims the
constraint was honored. Existing unconstrained walking, provider-failure fallback, and
synthetic known-duration multimodal behavior remain unchanged. The request and response
schemas are unchanged.

`days`, `interests`, `dates`, and `start` remain upstream itinerary/ranking/location
inputs and are not interpreted as transport-routing constraints by this service.

The parameterized service test proves each unsupported transport-relevant field produces
`mode="unavailable"`, a non-empty reason, and the named field in that reason.

Correction #2 is **PASS as fail-closed handling** and **not a claim that constraint
semantics are implemented**.

## Real multimodal fixture assessment

No defensible real multimodal fixture can currently be constructed from the repository’s
verified evidence.

Evidence checked:

- AMA research contains an 83-record BQS inventory and unresolved BQS/Route 12 research
  states, but all confirmed AMA stop coordinates remain unresolved/NULL and confirmed
  place-to-stop topology is not established for safe routing.
- The Phase 2 confirmed AMA slice preserves identity/provenance and unresolved state; it
  does not provide a coordinate-bearing place-to-stop pair.
- The repository’s current `data/transport/static/ama_bus.json` reports all 36 listed
  research stops with `coordinate_status="unresolved"`.
- `data/transport/static/ama_e_ride.json` contains 129 named stops and 13 evidenced
  routes, but all 129 structured stops report unresolved coordinate status.
- The Mo E-Ride route documents do not supply an approved coordinate-bearing production
  import in the current repository.
- Route names, stop names, nearby landmarks, and route order cannot be used to infer
  coordinates or geometry.

The synthetic multimodal tests are clearly injected algorithm fixtures. No new real
fixture, coordinate, route topology, schedule, fare, or geometry was added. The real
fixture exit item remains **BLOCKED by verified-data limitations**, not failed due to
implementation dishonesty.

## Provider normalization assessment

The default AMA Bus and Mo E-Ride adapters remain empty, bounded preparation slices.
They preserve provider identity, mode, tier, nullable fare behavior, and accept injected
normalized records for isolated graph/service tests. They do not load source JSON or
persisted transport rows into default production routing.

This is incomplete production provider normalization, but it is correct bounded behavior
under the current evidence boundary:

| Provider | Verified evidence | Current limitation | Assessment |
|---|---|---|---|
| AMA Bus / Mo Bus | Phase 2 identity-confirmed slice, static/scheduled research, 83-record BQS research inventory | Coordinates remain unresolved; confirmed route-stop topology and Route 12 mappings remain unavailable; structured fare remains unknown | Bounded and honest; production routing blocked |
| Mo E-Ride | Official route evidence for ER-01 through ER-13/13 routes and named stops | 129 structured stop coordinates remain unresolved; no approved canonical coordinate-bearing import | Bounded and honest; production routing blocked |
| Walking | Approved transport mode and supplied endpoint coordinates | Straight-line deterministic estimate, not road navigation | Supported within stated limitation |
| Odisha Yatri, auto, taxi, train | Service/mode research but no verified O-Travelz-consumable routing source | No adapter capability claimed | Correctly unsupported/unavailable |

The canonical Phase 3 requirement for verified provider normalization remains only PARTIAL
for production source loading. This does not create a fabrication failure. It remains an
explicit provider limitation and prevents any claim that AMA or Mo E-Ride is production
routing-ready.

## Open semantics

| Semantic area | Status | Blocking? | Review conclusion |
|---|---|---|---|
| Hop-tier aggregation across mixed legs | OPEN | Non-blocking for bounded internal behavior; blocks final shared/public contract | Existing conservative minimum-tier behavior is documented, not treated as a canonical decision. |
| Unavailable/unknown tier representation | OPEN | Non-blocking for bounded unavailable responses; blocks final public status contract | Existing schema requires a tier and the service avoids inventing provider capability; the future unknown variant remains unresolved. |
| Planner input/location/sequence semantics | OPEN | Non-blocking for this bounded service; downstream itinerary integration remains gated | Existing `PlanTransportHopArgs` and resolver boundary are preserved; hop sequences remain the current bounded `1 -> 2` output. |
| Map/GeoJSON integration contract | OPEN | Non-blocking for Phase 3; blocks Phase 6A/map integration | No map payload, geometry, stable-ID, or frontend behavior was added. |
| Budget/mobility/pace transport semantics | OPEN | Non-blocking for bounded acceptance; blocks claiming those features are supported | The planner now fails closed rather than silently resolving them. |

These decisions were not silently finalized. Acceptance is limited to the bounded
transport implementation and does not authorize downstream consumers to treat the open
fields as final product contracts.

## Test evidence

Commands were run from the repository root with the existing `.venv`:

| Command | Result |
|---|---|
| `.\.venv\Scripts\python.exe -m pytest backend/tests/test_transport backend/tests/test_geospatial_validation.py -q` | **33 passed**, 1 existing Pydantic v2 class-config deprecation warning |
| `.\.venv\Scripts\python.exe -m pytest backend/tests/test_transport backend/tests/test_phase0_contracts.py -q` | **25 passed**, 1 warning |
| `.\.venv\Scripts\python.exe -m pytest backend/tests/test_phase0_database.py backend/tests/test_import_transport.py backend/tests/test_ama_bus_adapter.py backend/tests/test_import_places.py backend/tests/test_data_validation.py -q` | **76 passed** |
| `.\.venv\Scripts\python.exe -m pytest backend/tests -q` | **116 passed**, 1 warning |
| `.\.venv\Scripts\python.exe -m compileall -q backend/app` | Passed |
| `git diff --check` | Passed; only LF/CRLF conversion warnings were printed |

The new tests genuinely exercise the former unknown-duration defect and the former
accepted-but-ignored constraint behavior. The real-fixture test remains unavailable
because no defensible real fixture exists.

## Fabrication audit

No newly fabricated travel facts were found.

- No coordinates were added.
- No routes, stops, or topology were added to source/provider data.
- No schedules or departure times were fabricated.
- No fares were added; costs remain nullable.
- No live provider calls or live status claims were added.
- No provider capability was promoted beyond the frozen verification record.
- No Route 12 or BQS unresolved mapping was promoted.
- No route geometry or map payload was added.
- Synthetic coordinates and route labels remain test-local and are not presented as
  provider facts.

## Scope audit

The correction diff is limited to pathfinding, transport service fail-closed handling,
transport regression tests, and handoff/review evidence. It adds no:

- ranking or candidate-selection logic;
- itinerary sequencing;
- AI orchestration or model execution;
- frontend or map implementation;
- Phase 6A geometry/map behavior;
- database models or migrations;
- provider source/data changes;
- unrelated product features.

The original Rudra commit itself contains only the previously reviewed Phase 3 transport
and API scope. Existing uncommitted Susmita geospatial preparation and Smarak canonical
state work remain separate and untouched.

## Acceptance checklist

| Requirement | Evidence | Status | Does it prevent bounded acceptance? |
|---|---|---|---|
| Common adapter contract implemented for verified providers | Base interface and AMA/Mo E-Ride adapter classes | PASS | No |
| Verified provider data normalized through common contract | Adapters accept normalized records but default source loading is absent | PARTIAL | No for bounded/unavailable implementation; yes for production provider readiness |
| Honest static/scheduled/live tiers preserved | Adapter/status code, path metadata, tests, frozen provider record | PARTIAL | No for bounded behavior; mixed-hop and unknown-tier contract remains open |
| Multimodal transport-hop planning | Deterministic synthetic walk/provider/walk tests | PARTIAL | No for bounded algorithm; real provider evidence remains blocked |
| At least one supported real fixture pair produces a multimodal hop | Evidence audit found unresolved coordinates/topology | BLOCKED | No for limited acceptance; prevents claiming the real-provider exit criterion |
| Unreachable pairs return unavailable result with reason | Graph no-path behavior, missing data tests, unsupported-constraint unavailable tests | PARTIAL | No; service path and explicit reasons are present, but a real disconnected provider pair is unavailable |
| Missing provider data does not crash planner | Broken-adapter fallback test and empty default adapters | PASS | No |
| Provider status exposes honest tier/notes | Status service/API tests and limitation notes | PARTIAL | No for bounded status; unknown-capability public representation remains open |
| No unverified API, route, fare, schedule, coordinate, or live claim | Commit/data audit and empty defaults | PASS | No |
| NULL/unresolved AMA coordinates remain explicit | Phase 2 evidence, resolver behavior, no new coordinates | PASS | No |
| Route 12 blank candidate rows are not mapped | No Route 12 promotion or inference in adapters/graph | PASS | No |
| Geometry dependency contract remains compatible | No geometry/map fields or implementation added | PASS | No |
| Backend/API wiring remains within Phase 3 | `/transport` routes remain bounded | PASS | No |
| No Phase 4/5/6A/6B scope creep | Commit and correction diff audit | PASS | No |
| Scope/progress/completion/handoff evidence exists | Rudra handoff, correction handoff, and this review | PASS | No |
| Existing backend regression baseline remains green | 76 Phase 2/import and 116 full backend tests | PASS | No |

The PARTIAL/BLOCKED items are documented limitations or open dependencies rather than
hidden failures. They prevent claims of production-ready verified-provider routing and
final shared contracts, but they do not make the bounded implementation fabricated,
unsafe, or out of scope.

## Remaining blockers

The following remain before a broader product/provider integration claim:

1. A real verified multimodal fixture requires defensible AMA or Mo E-Ride coordinates
   and topology evidence. This is an Akriti/source-closure dependency, not permission to
   infer data.
2. Default provider adapters need a source-backed normalization boundary once the
   verified data is seed-ready. Until then they remain bounded empty adapters.
3. Smarak/Punam must decide hop-tier aggregation and unavailable/unknown tier semantics
   before downstream public consumers treat those fields as final.
4. Smarak must decide precise budget, mobility, pace, and planner input/sequence
   semantics before those constraints can produce routes instead of explicit unavailable
   results.
5. Susmita/Deeptiman downstream map integration remains gated by the open map/GeoJSON
   contract and stable identifier decisions.

None of these remaining items is a newly introduced correctness defect, fabricated fact,
or scope violation in the reviewed correction.

## Final decision

## PHASE 3 ACCEPTED WITH EXPLICIT LIMITATIONS

This is acceptance of the bounded Phase 3 transport implementation, not acceptance of
production-ready AMA/Mo E-Ride routing, the final public tier/status contract, or the
Phase 6A map integration.

## Acceptance rationale

The two concrete correctness blockers from the first review are corrected:

- unknown durations are no longer assigned an artificially favorable zero cost;
- unsupported transport-relevant constraints no longer pass through as if they were
  enforced.

The implementation remains deterministic, preserves provider/tier metadata, returns
explicit unavailable reasons, passes the full backend regression suite, and introduces no
fabricated travel facts or forbidden later-phase behavior.

The real-fixture and source-backed provider-normalization limitations are genuine
evidence/data boundaries documented by the canonical research handoffs. The open tier,
unavailable, planner-input, and map contracts remain explicitly open and are not silently
resolved. Therefore the bounded implementation can be accepted with explicit limitations,
while all downstream claims requiring real provider routing or final contracts remain
gated.

## Recommended next action

Record this bounded acceptance and its limitations in the next Smarak/Punam phase-status
update, without marking the unresolved real-fixture/provider-readiness items complete.
Resolve the tier/status and planner-input decisions before public consumer integration.
Ask Akriti for defensible coordinate/topology closure before creating a real multimodal
fixture. Then re-review source-backed adapter normalization and downstream map/API
contracts. Do not fabricate data and do not begin Phase 4, Phase 5, Phase 6A, or Phase 6B
as part of this review.
