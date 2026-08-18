# Phase 6A HTTP Closeout

## Status

ACCEPTED

Final acceptance date: 2026-08-18

## Contract

`POST /map/v1/projection`

The v1 HTTP contract was accepted on 2026-08-18.

## Implementation

- `backend/app/api/map_routes.py` — versioned HTTP route.
- `backend/app/geospatial/http_adapter.py` — typed lookup, backend authorization,
  geometry adaptation, CRS enforcement, and structured errors.
- `backend/app/geospatial/projection.py` — endpoint-neutral projection core.
- `backend/app/schemas/map_projection.py` — public request/response and internal
  projection schemas.
- `backend/app/main.py` — router registration and structured map error handling.
- `backend/app/geospatial/__init__.py` — projection boundary exports.
- `backend/tests/test_phase6a_map_http.py` — HTTP contract tests.
- `backend/tests/test_phase6a_map_projection.py` — projection-core tests.

## Verification

- HTTP tests: 39 passed, 1 warning.
- Combined HTTP/core tests: 68 passed, 1 warning.
- Full backend tests: 221 passed, 1 warning.
- Compile check: passed.
- `git diff --check`: passed.

## Safety boundaries

- Typed Place/Stop/Route UUID identity only.
- `AuthorizedCanonicalRef` is backend-record-derived only.
- Backend geometry requires explicit SRID 4326.
- NULL geometry remains an unavailable successful state.
- No geometry, identity, topology, or relationship inference.
- RouteStop is excluded.
- Itinerary persistence and `itinerary_id` lookup are excluded.
- Detailed provenance remains private.
- AMA coordinates and route geometry remain unavailable.
- BhubaneswarOne GIS remains external evidence only.
- Route 12 remains unresolved and non-authoritative.

## Scope

This closeout did not change database schema, migrations, production data, provider
data, frontend implementation, authentication, persistence, itinerary behavior,
transport behavior, or the accepted projection-core contract. No commit includes
unrelated worktree changes.

## Historical verification

The first HTTP verification returned REVISE. CRS ambiguity, lookup-failure control
flow, and missing direct HTTP evidence were corrected. The second verification
returned ACCEPT.

## Remaining Phase 6A work

The remaining Phase 6A map/geospatial subsystem, frontend integration, authoritative
geometry-source expansion, and trusted itinerary/hop context remain outside this
bounded accepted HTTP slice. AMA/GIS identity closure and Route 12 topology remain
unresolved under the canonical project documents.
