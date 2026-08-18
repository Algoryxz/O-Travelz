# Phase 6A HTTP Implementation Handoff

## Task

Implement the accepted `POST /map/v1/projection` HTTP boundary.

## Owner

Backend/API implementation task using the accepted Phase 6A projection core.

## Phase

6A — bounded HTTP implementation only.

## Objective

Expose the frozen typed Place/Stop/Route UUID request through a thin FastAPI adapter
without changing the projection core, identity semantics, geometry authority,
transport contracts, persistence, or frontend.

## Scope

Implemented exact typed database lookup, backend-model authorization capability
construction, backend WKT/WKB geometry adaptation and validation, core invocation,
accepted response serialization, and structured map errors. No client geometry,
canonical-ref authorization, hop/itinerary context, RouteStop, provenance, AMA/GIS,
Route 12, provider, schema, migration, data, authentication, persistence, or frontend
behavior was added.

## Files changed

- `backend/app/api/map_routes.py` — thin versioned route wiring.
- `backend/app/geospatial/http_adapter.py` — exact typed lookup and backend geometry
  adapter; uses standard-library WKT/WKB decoding because optional Shapely is not a
  repository dependency.
- `backend/app/main.py` — map router registration and structured map error handling.
- `backend/app/schemas/map_projection.py` — public typed UUID request schema, kept
  separate from internal core inputs.
- `backend/tests/test_phase6a_map_http.py` — focused HTTP contract tests.
- `docs/MEMORY.md` — current bounded implementation status.
- `docs/REPOSITORY_MAP.md` — actual Phase 6A paths and ownership entries.

Existing projection-core files and tests were reused and were not redesigned.

## Revision status

The initial verification gate returned REVISE for CRS-ambiguous backend geometry,
lookup-failure control flow, and missing direct HTTP evidence. The scoped revision
fixed those findings, and the final re-verification returned ACCEPT. This handoff
does not claim completion of all Phase 6A.

## Contracts affected

Only the accepted new `POST /map/v1/projection` boundary is implemented. Existing
itinerary, transport, AI, and geospatial primitive contracts are unchanged.

## Tests run

- `python -m pytest tests/test_phase6a_map_http.py -q` — 39 passed, 1 warning.
- `python -m pytest tests/test_phase6a_map_http.py tests/test_phase6a_map_projection.py -q`
  — 68 passed, 1 warning.
- `python -m pytest -q` from `backend` — 221 passed, 1 warning.
- `python -m compileall -q app` from `backend` — passed.
- `git diff --check` — passed.

## Database/data/research changes

NONE. No schema, migration, production data, provider data, or research evidence was
modified. AMA coordinates and route geometry remain unavailable; Route 12 remains
unresolved; BhubaneswarOne GIS remains external evidence only.

## Known limitations and blockers

The full Phase 6A map/geospatial subsystem, frontend integration, authoritative
geometry-source expansion, and trusted itinerary/hop context remain outside this
bounded implementation. The v1 HTTP surface rejects client relationship context;
the `TransportLeg.route` display-only property is inherited from the accepted
projection-core contract and is not directly reachable through this HTTP surface.
No blockers to final acceptance were observed.

## Handoff / next action

Phase 6A HTTP was accepted on 2026-08-18. This handoff does not claim Phase 6A
itself is complete.

## Timestamp

2026-08-18

## Historical implementation status

The initial bounded implementation task was COMPLETE; that did not constitute
acceptance.

## Current acceptance status

PHASE 6A HTTP — ACCEPTED
