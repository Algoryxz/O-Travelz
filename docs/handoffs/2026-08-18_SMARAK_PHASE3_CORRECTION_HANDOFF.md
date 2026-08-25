# Smarak Phase 3 Correction Handoff

## Review being corrected

- Review report: `docs/handoffs/2026-08-18_SMARAK_PHASE3_INTEGRATION_REVIEW.md`
- Original commit: `d6a0291734f40dbe76e113b014d574104eb5f7d3`
- Correction scope: Phase 3 pathfinding correctness, fail-closed planner constraint
  handling, regression evidence, and correction-status documentation

No reset, clean, stash, commit, push, or unrelated-file restoration was performed.

## Corrections implemented

### Unknown-duration scoring

Implemented in `backend/app/transport/graph/pathfind.py`.

- Unknown duration is no longer used as numeric duration zero.
- Path cost now separates the count of unknown-duration edges from the sum of known
  minutes: `(unknown_duration_edges, known_minutes, hop_count)`.
- Paths with known durations are preferred over paths containing unknown durations.
- Among paths with the same unknown-duration status, known minutes and hop count remain
  deterministic tie-break dimensions.
- The selected edge still retains `estimated_minutes=None`; no duration is fabricated.
- Provider identity, route identity, and `DataTier` remain on the selected graph edge.

Regression tests now prove:

- a known walking route beats an unknown-duration provider route when both are possible;
- an unknown provider duration remains `None` rather than becoming zero;
- repeated selection is deterministic;
- existing known-duration multimodal routing remains `walk -> bus -> walk`;
- graph and service unavailable behavior remains covered.

### Planner constraints

Implemented in `backend/app/transport/service.py`.

The canonical repository defines these shared constraint fields:
`days`, `interests`, `dates`, `pace`, `budget_transport_per_day`, `start`, and
`mobility`. It does not define a precise transport algorithm for budget allocation,
mobility values, pace values, or walking-preference thresholds.

The planner now fails closed for the transport-relevant fields whose semantics are not
approved:

- `budget_transport_per_day`
- `mobility`
- `pace`

When any of those fields is supplied, the planner returns a contract-valid unavailable
hop with a reason naming the unsupported constraint. It no longer returns a route that
could falsely imply the constraint was enforced. It does not invent a budget model,
mobility taxonomy, walking threshold, or pace calculation.

`days`, `interests`, `dates`, and `start` remain upstream itinerary/ranking/location
inputs and are not interpreted by this hop service. Their transport meaning is not
silently expanded here.

Regression tests cover all three fail-closed transport-relevant fields and require an
explicit unavailable reason.

## Corrections NOT implemented

### Real multimodal fixture

No real multimodal fixture was created because the available verified evidence is not
sufficient without inventing facts.

- The corrected AMA Bus Phase 2 package provides identity-confirmed stops, but the
  confirmed stop locations remain NULL/unresolved and confirmed place-to-stop
  `RouteStop` topology is not established.
- The AMA research evidence retains unresolved BQS identity/source items and the 36
  unresolved Route 12 mappings. The 83-record BQS inventory does not supply defensible
  coordinates for routing.
- The Mo E-Ride research package documents ER-01 through ER-13/13 routes and named stops,
  but all 129 structured research stops retain unresolved coordinates and no approved
  coordinate-bearing production import exists.
- Existing data files and research handoffs were not changed.

The synthetic multimodal tests remain algorithm tests only. They are not promoted to
real provider evidence and do not close the canonical real-fixture exit criterion.

### Provider normalization

No source-backed default provider loader was added.

The existing AMA Bus and Mo E-Ride adapters remain explicitly bounded preparation
slices:

| Provider | Source/evidence | Identity/topology state | Tier/estimate state | Current adapter boundary |
|---|---|---|---|---|
| AMA Bus / Mo Bus | Phase 2 confirmed import and `data/transport/static/ama_bus*.json` | Confirmed stops have NULL coordinates; place-to-stop topology remains unavailable; Route 12 mappings remain unresolved | Static/scheduled research; fare remains unknown; no live source | Empty default normalized records; injected records are accepted for isolated algorithm tests only |
| Mo E-Ride | Official route documents represented by `data/transport/static/ama_e_ride*.json` | 129 named stops and 13 routes are evidenced, but all structured stop coordinates remain unresolved and no approved canonical import exists | Static/scheduled where source supports it; approximate headways remain estimates; fare is not used by the adapter; no live source | Empty default normalized records; injected records are accepted for isolated algorithm tests only |

No coordinates, routes, schedules, fares, topology, or provider capabilities were
fabricated to make normalization or routing appear complete. Full source-backed
normalization remains blocked by the verified-data/seed-readiness boundary.

### Open tier and map decisions

The correction does not silently resolve:

- hop-level aggregation across legs with different tiers;
- unavailable/unknown tier representation;
- the final planner input and sequence boundary;
- the map/GeoJSON contract, stable identifiers, or geometry absence states.

The current existing unavailable response and conservative tier implementation remain in
place pending the required Smarak/Punam contract decisions. The new correction only
prevents unsupported planner constraints from being falsely represented as enforced.

## Evidence/provenance

The real-fixture decision was based on current repository evidence, including:

- `docs/handoffs/2026-08-18_RUDRA_PHASE3_SCOPE_REPORT.md`;
- `docs/handoffs/2026-08-17_AKRITI_RESEARCH_CLOSURE_HANDOFF.md`;
- `docs/handoffs/2026-08-17_RUDRA_PHASE2_TRANSPORT_HANDOFF.md`;
- `data/research/handoffs/transport_phase1_final/data/transport/` research inputs;
- `data/transport/static/ama_bus.json` and `ama_bus_schedule.json`;
- `data/transport/static/ama_e_ride.json` and `ama_e_ride_schedule.json`;
- `data/transport/fares/ama_bus_fares.json` and `ama_e_ride_fares.json`;
- Phase 2 import and unresolved-state tests.

Observed evidence:

- AMA static research records report unresolved coordinate status; the Phase 2 confirmed
  production slice preserves NULL locations.
- AMA research retains unresolved BQS and Route 12 mappings; no coordinate or topology
  inference is permitted.
- Mo E-Ride contains 129 named stops and 13 evidenced routes, with unresolved coordinate
  status for the structured stop records.
- No live provider API or external routing service was called.
- Synthetic test coordinates and route labels remain clearly test-local and are not
  described as travel facts.

## Tests

All commands below were run from the repository root with the existing `.venv`.

| Command | Exact result |
|---|---|
| `\.\.venv\\Scripts\\python.exe -m pytest backend/tests/test_transport backend/tests/test_geospatial_validation.py -q` | **33 passed**, 1 existing Pydantic v2 class-config deprecation warning |
| `\.\.venv\\Scripts\\python.exe -m pytest backend/tests/test_transport backend/tests/test_phase0_contracts.py -q` | **25 passed**, 1 warning |
| `\.\.venv\\Scripts\\python.exe -m pytest backend/tests/test_phase0_database.py backend/tests/test_import_transport.py backend/tests/test_ama_bus_adapter.py backend/tests/test_import_places.py backend/tests/test_data_validation.py -q` | **76 passed** |
| `\.\.venv\\Scripts\\python.exe -m pytest backend/tests -q` | **116 passed**, 1 warning |
| `\.\.venv\\Scripts\\python.exe -m compileall -q backend/app` | Passed |
| `git diff --check` | Passed; existing LF/CRLF conversion warnings only |

The focused regression tests specifically exercise the previously confirmed unknown
duration defect and the fail-closed behavior for unsupported transport constraints.

## Files changed

Changed by this correction task:

- `backend/app/transport/graph/pathfind.py`
- `backend/app/transport/service.py`
- `backend/tests/test_transport/test_graph.py`
- `backend/tests/test_transport/test_service.py`
- `docs/handoffs/2026-08-18_SMARAK_PHASE3_CORRECTION_HANDOFF.md`

No provider source files, data files, migrations, schemas, frontend files, map files,
ranking files, itinerary files, AI files, or canonical project documents were changed.
Pre-existing Smarak/Susmita working-tree changes remain present.

## Remaining open decisions

- Define the approved hop-level tier aggregation rule for multimodal legs.
- Define how unavailable/unknown capability is represented when the current schema has no
  `unknown` tier.
- Define the planner input/location/sequence boundary beyond the current
  `PlanTransportHopArgs` shape.
- Define the final map/GeoJSON payload, stable identifiers, geometry availability states,
  and relation to transport legs.
- Define precise transport semantics for budget, mobility, pace, and walking preferences
  before replacing the new fail-closed behavior with route selection.

## Remaining acceptance blockers

1. The canonical real verified multimodal fixture-pair exit criterion remains blocked by
   unresolved AMA/Mo E-Ride coordinates and topology evidence.
2. Default provider adapters do not yet normalize source-backed records; they remain
   bounded empty adapters rather than production provider-routing adapters.
3. Hop-tier aggregation and unavailable/unknown semantics remain open and are not
   accepted as resolved by this correction.
4. Transport-relevant constraint semantics remain open; the planner now reports them as
   unsupported rather than falsely claiming enforcement.

The unknown-duration path-selection correctness blocker is corrected and covered by
regression tests.

## Recommended next action

Run a new Smarak integration review against this correction handoff. The review should
verify the path-cost behavior and fail-closed constraint contract, then decide whether to
accept the bounded implementation with the explicitly documented research and contract
limitations or keep Phase 3 open until a defensible real fixture and source-backed
normalization boundary are available.

Do not infer AMA coordinates, Route 12 topology, Mo E-Ride coordinates, fares, geometry,
or live status to close the remaining blockers. Do not start Phase 4, Phase 5, Phase 6A,
or Phase 6B as part of this correction.
