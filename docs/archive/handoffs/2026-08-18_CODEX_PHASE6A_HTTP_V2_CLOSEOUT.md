# Phase 6A HTTP V2 Closeout

## Status

ACCEPTED

Final acceptance date: 2026-08-18

## Contract

`POST /map/v1/projection`

The finalized Phase 6A Reduced Map Contract V2 was approved and closed on 2026-08-18:
[`docs/handoffs/2026-08-18_SMARAK_PHASE6A_REDUCED_MAP_CONTRACT_V2.md`](file:///c:/Users/smara/Desktop/o-travelz/docs/handoffs/2026-08-18_SMARAK_PHASE6A_REDUCED_MAP_CONTRACT_V2.md).

## Implementation scope

- `backend/app/api/map_routes.py` — versioned HTTP route.
- `backend/app/geospatial/http_adapter.py` — exact typed lookup, optional hop context forwarding, backend authorization capability creation, geometry adaptation, CRS enforcement, and structured map errors.
- `backend/app/geospatial/projection.py` — endpoint-neutral projection core.
- `backend/app/schemas/map_projection.py` — public request/response schemas with optional `requested_hops` and internal capability types.
- `backend/app/main.py` — router registration, structured map error handling, and unsupported relationship field gating.
- `backend/tests/test_phase6a_map_http.py` — HTTP contract and relationship tests (49 passed).
- `backend/tests/test_phase6a_map_projection.py` — projection-core tests (29 passed).

## V1 backward compatibility

- Omission of `requested_hops` yields `relationships: []` with identical V1 feature projection.
- Explicit `requested_hops: []` yields `relationships: []`.
- Exact error behavior and response envelope are preserved.

## Requested hops & relationship behavior

- Accepts optional `requested_hops: list[RequestedHopContext] = []`.
- Preserves `day_number`, `from_sequence`, `to_sequence`, `mode`, `data_tier`, and `reason`.
- Preserves incoming leg sequence order.
- `from_sequence=0` remains the start-origin sentinel without fabricating an origin entity.
- `TransportLeg.route` remains display-only text (`route_ref: None`, `stop_refs: []`).
- Leg geometry remains `geometry: null`, `geometry_status: "unavailable"` with `unavailable_reason: "provider_geometry_unavailable"` or `"source_missing"`.

## Safety boundaries

- **Identity Safety**: Exact typed `Place.id`, `Stop.id`, `Route.id` database UUID lookup only. `AuthorizedCanonicalRef` is derived exclusively from backend model facts. Hop context cannot authorize Place, Stop, Route, or provider identities. No identity derivation from names, provider IDs, `canonical_stop_id`, `bqs_jb`, GIS IDs, `slno`, Route 12, proximity, endpoints, or route order.
- **Geometry Authority**: Authoritative geometry sources remain strictly `Place.location`, `Stop.location`, and `Route.geometry` declaring explicit SRID 4326. NULL geometry remains `geometry: null`, `geometry_status: "unavailable"`. No geocoding, endpoint connecting, centroid derivation, routing inference, or placeholder geometry.
- **RouteStop Exclusion**: RouteStop is completely OUT OF SCOPE. Unsupported fields (`route_stops`, `legs`, `hops`, `relationships`) fail with HTTP 422 `unsupported_relationship`.
- **Persistence & Authentication**: No itinerary persistence, database lookup by `itinerary_id`, session state, user ownership, or authentication changes.
- **Provenance Privacy**: Detailed provenance, internal audit fields, and GIS identifiers remain backend-only.
- **Research Exclusions**: AMA coordinates, AMA route geometry, BhubaneswarOne GIS identity promotion, and Route 12 topology remain unresolved and excluded.

## Verification evidence

- HTTP tests: **49 passed**, 3 warnings.
- Projection-core tests: **29 passed**, 2 warnings.
- Combined HTTP/core tests: **78 passed**, 3 warnings.
- Full backend tests: **231 passed**, 3 warnings.
- Python compile check (`compileall -q app`): **passed**.
- Git whitespace check (`git diff --check`): **passed**.

Verification verdict: **ACCEPT**

## Scope boundary notice

This closeout completes and accepts ONLY the bounded Phase 6A HTTP V2 projection slice.

**Full Phase 6A is NOT complete**:
- Frontend map integration (Phase 6B) remains a separate, gated phase.
- Broader geospatial subsystem capabilities and authoritative geometry-source expansion remain outside this accepted slice.
- AMA coordinates/routes, BhubaneswarOne GIS cross-system identity crosswalks, and Route 12 topology remain unresolved research items.
