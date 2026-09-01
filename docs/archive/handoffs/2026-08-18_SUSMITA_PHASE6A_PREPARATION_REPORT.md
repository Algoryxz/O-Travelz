# Susmita Phase 6A Preparation Report — 2026-08-18

## Scope

This report records preparation performed after the Phase 3 dependency/readiness audit.
It does not redo the Phase 3 gate, implement Rudra's transportation/routing subsystem,
resolve the map contract, or claim Phase 6A completion.

## Work completed

- Added contract-independent WGS84 validation helpers under
  `backend/app/geospatial/validation.py`.
- Enforced finite coordinate values, geographic ranges, paired null handling, and
  repository-approved `longitude → X`, `latitude → Y` order.
- Preserved `None` for unknown point and line geometry.
- Rejected incomplete/invalid LineString input without deriving a line from stop order.
- Added a clearly labelled preparation fixture containing:
  - one verified place coordinate copied from `data/places/places.json`;
  - verified-place and unresolved-stop NULL-coordinate cases from repository data;
  - a missing route-geometry case;
  - synthetic contract-only walk/provider/walk and unavailable-hop cases.
- Added backend tests covering geometry validation, NULL preservation, ordered legs,
  provider/route identity preservation, static tier preservation, and explicit
  unavailable reason handling.

No public map payload, GeoJSON type, API route, frontend map behavior, database
migration, provider adapter, routing logic, distance calculation, or geometry builder
was added.

## Current contract

The executable transport/itinerary contracts currently expose itinerary/place identity,
ordered hop/leg semantics, provider and route display strings, estimates, data tier, and
unavailable reason. They do not expose stable stop/route identifiers or geometry.

## OPEN DECISION

**Current contract:** `backend/app/schemas/transport.py` and
`frontend/src/api/contracts.ts` have no approved map-layer or geometry payload.

**Required capability:** Phase 6A needs a stable binding from itinerary/hop/leg facts to
verified place/stop/route geometry, including an explicit absence state.

**Proposed minimal change:** after Rudra supplies an actual routing output, Smarak and
affected owners should approve the smallest versioned map handoff that exposes only the
identifiers, ordered legs, supplied geometry/absence state, provider identity, route
identity, and data tier required by map consumers. This report does not choose the shape.

**Affected owners:** Smarak (contract semantics/approval), Rudra (routing output and
backend/API facts), Susmita (map representation/validation), Deeptiman (frontend
integration), and Punam (decision/evidence synchronization).

## Rudra dependency

**DEPENDENCY:** Actual Phase 3 routing outputs from Rudra.

**EXACT REQUIRED OUTPUT:** itinerary/place endpoint identity; ordered legs; provider and
route identity in the approved form; data tier; estimates where available; unavailable
reason; verified geometry where supplied; and explicit geometry-unavailable state where
not supplied.

**WHY IT IS REQUIRED:** Map code must represent authoritative transport facts and leg
order without recreating provider selection, pathfinding, distances, or geometry.

**CURRENT STATUS:** Rudra implementation is in progress; the current shared contract
does not yet contain geometry or stable stop/route/path fields.

## Geometry/data integrity

No coordinates, route lines, walking geometry, distances, or directions were fabricated.
The only non-null fixture coordinate is the existing verified Lingaraj Temple coordinate.
AMA stop coordinates and route geometry remain NULL/unknown; unresolved Route 12 mappings
were not used as geometry.

## Readiness

### CAN PREPARE NOW

- Keep validation and contract-only fixture tests current.
- Review Rudra's eventual output for geometry provenance and explicit absence states.
- Refine the map decision record after Smarak approves the contract direction.

### REQUIRES RUDRA

- Real routing output shape and verified geometry availability.
- Stable stop/route/path identity and ordered path information if exposed.
- Provider/data-tier/unavailable semantics on actual planner results.

### REQUIRES SMARAK CONTRACT DECISION

- Final map/GeoJSON or non-GeoJSON payload shape.
- Feature identifiers, relation to hop/leg identifiers, and geometry absence semantics.
- Any shared backend/frontend schema additions.

## Verification

- `C:\Users\smara\Desktop\o-travelz\.venv\Scripts\python.exe -m pytest tests/test_geospatial_validation.py tests/test_phase0_contracts.py -q` — **20 passed**.
- `C:\Users\smara\Desktop\o-travelz\.venv\Scripts\python.exe -m pytest -q` from `backend/` — **97 passed**.
- Frontend Vitest was not run because `frontend/node_modules` is not installed; no
  frontend implementation was changed.
- `git diff --check` — passed.

## Readiness

**READY FOR RUDRA OUTPUT / MAP CONTRACT REVIEW**
