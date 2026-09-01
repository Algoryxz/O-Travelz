# Susmita Phase 3 Dependency + Phase 6A Readiness Report — 2026-08-18

## Purpose

This is a dependency and readiness handoff for Susmita. It defines what Rudra's Phase 3
transport/routing output must provide for safe Phase 6A map/geospatial work, without
implementing Phase 3 or Phase 6A. The Smarak Phase 3 gate is already **SATISFIED** and
is not repeated here.

## Current map/geospatial state

| Surface | State | Evidence |
|---|---|---|
| `backend/app/geospatial/` | MISSING | Only an empty `__init__.py`; no geospatial service, route-line builder, or map payload implementation. |
| `backend/app/models/place.py` | IMPLEMENTED persistence boundary | `Place.location` is nullable PostGIS `POINT`/4326 with approved `lon → X`, `lat → Y` semantics. |
| `backend/app/models/transport.py` | IMPLEMENTED persistence boundary | `Stop.location` is nullable `POINT`/4326 and `Route.geometry` is nullable `LINESTRING`/4326. These columns do not prove geometry exists. |
| Phase 2 imported AMA data | PARTIAL/UNKNOWN for map use | All 72 confirmed AMA stops retain `location = NULL`; route geometry is not established; 36 Route 12 source rows remain unmapped. |
| Place data | PARTIAL | The accepted place slice contains verified places with both known and intentionally `NULL` locations. Null locations cannot participate in routing or geospatial calculations. |
| `backend/app/schemas/transport.py` | CONTRACT/SCHEMA ONLY | Hop/leg/provider status fields exist, but no geometry fields or map-layer contract exists. |
| `backend/app/schemas/itinerary.py` | CONTRACT/SCHEMA ONLY | Itinerary stops carry `PlaceSummary`; hops carry ordered legs, provider/route labels, tier, estimates, and reason. |
| `frontend/src/api/contracts.ts` | CONTRACT/SCHEMA ONLY | Frontend mirrors itinerary/transport types; there are no place coordinates, stop IDs, route geometry, or GeoJSON types. |
| `frontend/src/components/map/README.md` | CONTRACT/SCHEMA ONLY | Ownership boundary and unresolved map contract are recorded. |
| `frontend/src/components/map/MapPlaceholder.tsx` | PARTIAL | Placeholder UI only; it does not render authoritative geometry or route lines. |
| Map/geospatial tests | MISSING | Existing frontend tests are contract tests; no map geometry or route-line test suite exists. |

## Ownership boundary

### Rudra owns

- Backend/API wiring for routing outputs.
- Provider facts and normalized provider results.
- Routing, graph/pathfinding, and transport-hop planning.
- Ordered transport legs, provider/route facts, estimates where supported, data tiers,
  and explicit unavailable states.
- Any verified geometry that is a backend routing output, without fabricating geometry.

### Susmita owns

- Geospatial representation and map-side geometry handling.
- Route-line representation and multimodal map-layer representation.
- Map/geospatial validation and tests.
- The map integration handoff contract, subject to the unresolved canonical GeoJSON/map
  decision.

Susmita must consume Rudra's routing facts and must not recreate routing, provider
selection, pathfinding, authoritative distances, or authoritative transport facts.

### Deeptiman owns

- Complete frontend UX and user-facing map integration.
- Loading, error, interaction, and presentation behavior around the map subsystem.

## Rudra → Susmita handoff requirements

### Fields already supported by existing contracts

The current itinerary/transport contract can safely carry:

- itinerary stop sequence and `PlaceSummary.id`, `name`, and `category`;
- hop `from_sequence` and `to_sequence`;
- ordered `legs`;
- each leg's `mode`, human-readable `detail`, optional provider label, and optional route
  label;
- nullable hop duration and cost estimates;
- hop-level `data_tier`;
- required human-readable `reason` for `mode="unavailable"`.

These are the only map-relevant transport facts Susmita can rely on today from the
executable shared contract. Provider and route IDs exist in persistence models for
`TransportHop`, but are not exposed in `TransportHopContract` or `TransportLeg`.

### Required from Rudra before map implementation can be safe

Rudra's handoff should state, for every returned hop/leg where applicable:

- which itinerary/place endpoint and hop sequence it describes;
- ordered transport legs and their modes;
- provider and route identity in the approved contract form;
- whether a route shape or other geometry was actually supplied;
- explicit geometry missing/unavailable state when no verified geometry exists;
- data tier and provider limitations;
- unavailable reason when routing or geometry cannot be supplied.

The last four items are requirements for a safe downstream handoff, not fields that are
already approved in a final map/GeoJSON contract. If stable stop identifiers, route
identifiers, ordered stop paths, route geometry, or geometry-availability fields are
needed by Phase 6A, they must be added through an approved contract decision. Susmita
must not derive them from names, route labels, or raw research files.

## Map contract

### Already decided

- The map represents verified places, stops, route lines, and multimodal route/hop
  information supplied by backend/geospatial contracts.
- AI does not compute geometry.
- The frontend consumes the map subsystem and does not recreate authoritative geospatial
  calculations.
- Susmita owns maps/geospatial behavior and Deeptiman integrates it into the complete
  frontend.
- Missing coordinates and geometry remain explicit unknown/unavailable states.
- The exact GeoJSON/map-layer shape is an `OPEN DECISION` in `docs/ARCHITECTURE.md` and
  `frontend/src/components/map/README.md`.

### Unresolved

The repository does not approve the exact:

- GeoJSON or non-GeoJSON payload shape;
- identifiers for places, stops, routes, route lines, and hop legs;
- geometry-availability/null/error representation;
- relationship between a transport hop, its legs, and one or more route-line features;
- coordinate serialization/precision and map-layer grouping;
- versioning and rendering handoff between backend, Susmita's subsystem, and Deeptiman.

### Must be decided before Phase 6A implementation

Smarak/Punam and the affected owners must approve the map contract, including stable
identifiers, geometry availability semantics, and how Rudra's ordered routing output is
bound to map features. The decision must account for the current transport contract's
lack of stop IDs, path sequences, and geometry fields. No report here invents that final
shape.

### Decisions dependent on Rudra output

The map contract cannot finalize route-line and multimodal feature relationships until
Rudra supplies an actual routing result shape: whether route geometry exists, whether
only endpoint/stop facts exist, how provider/route identity is represented, and how an
unavailable or partially geometric leg is reported.

## Geometry rules

- Never fabricate coordinates for places, stops, routes, or paths.
- Never infer a stop coordinate from a name, nearby landmark, route label, or map lookup
  that is not an approved verified source.
- Never infer route geometry from stop order or a visually plausible line.
- `NULL`/unknown geometry must stay explicitly unknown/unavailable in the eventual map
  representation.
- Route 12 blank canonical candidates remain unmapped; they are not geometry inputs.
- Authoritative routing remains Rudra's responsibility.
- Susmita may represent supplied geometry and its absence, but must not recreate routing
  logic or substitute a third-party directions result as O-Travelz fact.

## Phase 6A readiness

### Can prepare now

- Review the existing boundary README, canonical map sections, transport schemas,
  itinerary schemas, and Phase 2 geometry handoff.
- Maintain a decision log for the unresolved map/GeoJSON contract.
- Prepare fixture cases that contain known place geometry, `NULL` place/stop geometry,
  unavailable route geometry, ordered walk/provider/walk legs, and unavailable hops,
  without adding invented coordinates.
- Define test assertions around preservation of provider identity, data tier, leg order,
  and explicit unknown/unavailable states using the existing contract fields.
- Identify the exact contract fields that a future map layer needs and send gaps to
  Smarak/Punam before implementation.

### Requires Rudra output

- Actual backend routing response examples from a supported fixture pair.
- Stable provider/route/stop identifiers if the map layer needs them.
- Ordered path/stop information beyond the current human-readable leg detail.
- Verified route geometry or an explicit absence state for each route/leg.
- Provider identity, data tier, estimates, and unavailable/failure semantics on real
  planner outputs.

### Requires an OPEN DECISION

- Final GeoJSON/map-layer contract and versioning.
- Stable map feature identifiers and relation to itinerary/hop/leg identifiers.
- Geometry null/unavailable/error representation.
- Whether Rudra supplies geometry-bearing backend payloads directly or Susmita receives
  a separate approved geometry representation from the backend boundary.
- Any shared schema change needed to expose stop IDs, route IDs, path sequences, or
  geometry fields.

Phase 6A implementation is not complete or authorized by this report. The preparation
work is ready to continue within the documented boundary.

## Eventual Phase 6A test matrix

| Area | Required evidence |
|---|---|
| Geometry validity | Supplied geometries use approved coordinate order/CRS and valid GeoJSON/map shape once the contract is approved; invalid geometry is rejected or marked unavailable. |
| Map contract validation | Payloads validate against the approved map contract, including identifiers and absence states. |
| Route-line semantics | Route lines represent supplied verified route geometry only; absent geometry does not produce an inferred line. |
| Multimodal segments | Walk/provider/walk legs remain ordered and visually distinguishable without changing routing facts. |
| Unavailable geometry | A leg/hop with no verified geometry renders an explicit unavailable/unknown state rather than a line. |
| Missing geometry | `NULL` place/stop/route geometry remains missing through backend, map subsystem, and frontend integration. |
| Data tier | Static/scheduled/live labels are preserved from Rudra's output and never upgraded by map code. |
| Provider identity | Provider/route identity is preserved where the approved contract supplies it; map code does not derive identity from display text. |
| No routing duplication | Tests show map preparation consumes supplied paths/legs and does not calculate authoritative paths or distances. |

These tests do not currently exist except for the general frontend/transport contract
tests. They should be created only after the relevant contract is approved and Rudra's
output shape is available.

## Dependencies and ownership

| Owner | Dependency |
|---|---|
| Rudra | Phase 3 routing outputs, provider/route facts, ordered legs, data tiers, unavailable states, and verified geometry where it exists. Rudra remains routing authority. |
| Smarak | Itinerary/transport semantics, approval of any shared contract change, and interpretation of hop/leg meaning. |
| Akriti | Defensible place/stop coordinates, identities, route topology, and source evidence. Existing unresolved AMA/E-Ride records remain unresolved. |
| Deeptiman | Complete frontend map integration and user-facing rendering states after the map contract is approved. |
| Punam | Documentation, decision ledger, repository map, evidence collection, phase readiness, and handoff synchronization. |

## Expected files

Existing paths:

- `backend/app/geospatial/__init__.py`
- `backend/app/models/place.py`
- `backend/app/models/transport.py`
- `backend/app/schemas/transport.py`
- `backend/app/schemas/itinerary.py`
- `frontend/src/api/contracts.ts`
- `frontend/src/components/map/README.md`
- `frontend/src/components/map/MapPlaceholder.tsx`
- `frontend/tests/contracts.test.ts`
- `docs/handoffs/2026-08-17_SUSMITA_PHASE2_GEOMETRY_HANDOFF.md`

Canonical `TO CREATE` locations only:

- `backend/app/geospatial/` — approved geospatial/map representations; exact module
  filenames remain unresolved.
- `frontend/src/components/map/` — later map integration components after the map
  contract is approved; complete UX remains Deeptiman's boundary.
- `frontend/tests/` — later map/component tests against approved fixtures; exact test
  filenames are not canonically fixed.

No provider adapter, graph, routing service, database migration, frontend feature, or
final GeoJSON contract is created by this handoff.

## Blockers and open decisions

- **OPEN DECISION:** exact GeoJSON/map-layer contract, identifiers, and geometry absence
  states remain unresolved.
- **BLOCKED for implementation:** Rudra has not yet produced Phase 3 routing outputs.
- **BLOCKED for verified route lines:** current AMA stop coordinates and route geometry
  are unresolved/absent, and Route 12 mappings remain blank.
- **READY for preparation:** boundary review, decision logging, unknown-geometry fixtures,
  and test planning can proceed now without implementing map behavior.

## Next action

Smarak reviews this dependency report with Rudra's scope report, then approves the map
contract decision work. Susmita can prepare boundary fixtures and decision notes now;
map implementation waits for the approved contract and Rudra's actual routing outputs.

## Readiness

Susmita is **READY FOR PHASE 6A PREPARATION**. This means dependency analysis, contract
preparation, and evidence planning can proceed now. It does not mean Phase 6A
implementation is complete or that the open map contract has been resolved.

**READY FOR PHASE 6A PREPARATION**
