# Phase 6A HTTP V2 Implementation Handoff

## Task

Implement the finalized Phase 6A Reduced Map Contract V2 on the accepted `POST /map/v1/projection` endpoint.

## Owner

Backend/API implementation task using the accepted Phase 6A projection core and HTTP adapter.

## Phase

6A — bounded HTTP V2 implementation.

## Objective

Extend `POST /map/v1/projection` with optional `requested_hops` to project structured itinerary hop/leg relationships without breaking V1 backward compatibility, identity semantics, geometry authority, transport contracts, persistence, or frontend behavior.

## Scope

- Extended [`MapProjectionHTTPRequest`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/schemas/map_projection.py) with optional `requested_hops: list[RequestedHopContext] = []`.
- Forwarded `requested_hops` through [`MapProjectionHTTPAdapter`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/geospatial/http_adapter.py) to [`MapProjectionService`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/geospatial/projection.py).
- Preserved V1 backward compatibility (when `requested_hops` is omitted or empty, `relationships` remains `[]`).
- Enforced hop trust boundary: client-supplied hop context is descriptive only and cannot authorize Place, Stop, Route, geometry, provider, or RouteStop identity.
- Preserved `TransportLeg.route` as display-only text (`route_ref` remains `None`, `stop_refs` remains `[]`).
- Preserved `from_sequence=0` as the start-origin sentinel without fabricating an origin Place or Stop.
- Excluded RouteStop, itinerary persistence, database lookup by `itinerary_id`, authentication, AMA coordinates/routes, BhubaneswarOne GIS promotion, and Route 12 inference.

## Files changed

- `backend/app/schemas/map_projection.py` — added optional `requested_hops` with duplicate-hop validation to `MapProjectionHTTPRequest`.
- `backend/app/geospatial/http_adapter.py` — forwarded `request.requested_hops` to `MapProjectionRequest` and updated empty-request check.
- `backend/app/main.py` — removed `requested_hops` from `unsupported_relationship_fields` while retaining `hops`, `legs`, `route_stops`, `relationships`.
- `backend/tests/test_phase6a_map_http.py` — added 10 comprehensive V2 tests covering V1 compatibility, hop preservation, origin sentinel, display text isolation, duplicate rejection, and determinism (49 tests total).
- `docs/MEMORY.md` — updated current-state ledger with V2 implementation status and test evidence.
- `docs/PHASES.md` — updated Phase 6A status to reflect V2 implementation ready for verification.
- `docs/REPOSITORY_MAP.md` — updated schema, adapter, and test descriptions for Phase 6A HTTP V2.

## Verification evidence

- `python -m pytest tests/test_phase6a_map_http.py -q` — 49 passed, 3 warnings.
- `python -m pytest tests/test_phase6a_map_http.py tests/test_phase6a_map_projection.py -q` — 78 passed, 3 warnings.
- `python -m pytest -q` (full backend suite) — 231 passed, 3 warnings.
- `python -m compileall -q app` — passed.
- `git diff --check` — passed.

## Database / Data / Research changes

NONE. No schema, migration, production data, provider data, or research evidence was modified.

## Gate status

IMPLEMENTATION COMPLETE — READY FOR V2 VERIFICATION
