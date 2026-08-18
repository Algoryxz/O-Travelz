# O-Travelz Phase 6A Reduced Map/Geospatial Contract v2

**Date:** 2026-08-18<br>
**Status:** Finalized contract; four human decisions approved; ready for implementation authorization<br>
**Baseline:** committed repository state `03c0a6a` (Phase 6A HTTP Closeout)<br>
**Predecessors:**
`docs/handoffs/2026-08-18_SMARAK_PHASE6A_REDUCED_MAP_CONTRACT_DRAFT.md`,
`docs/handoffs/PHASE6A_MAP_HTTP_CONTRACT_V1_DRAFT.md`, and the
Phase 6A V2 Contract Decision Gate

This document is documentation only. It does not modify production code, database
schema, research data, coordinates, GeoJSON, or frontend implementation.

## 1. Contract authority and terminology

This v2 contract is subordinate to the current canonical project documentation:

- `docs/ARCHITECTURE.md`;
- `docs/PHASES.md`;
- `docs/MEMORY.md`;
- `docs/architecture/05-contracts.md`;
- `docs/transportation/00-transport-model.md`;
- `docs/handoffs/2026-08-18_SMARAK_PHASE6A_RESEARCH_CLOSURE_RECONCILIATION.md`.

The existing repository facts and the map-projection fields defined here are kept
separate throughout this document.

### 1.1 Existing repository facts

At `03c0a6a`:

- `Place.id` is the database Place primary key. `Place.location` is nullable
  WGS84/PostGIS `POINT` geometry.
- `Stop.id` is the database Stop primary key. `Stop.canonical_stop_id` is a separate,
  nullable provider-scoped string. It is not interchangeable with `Stop.id`.
- `Route.id` is the database Route primary key. `Route.geometry` is nullable
  WGS84/PostGIS `LINESTRING` geometry.
- `RouteStop` stores `route_id`, `stop_id`, and `sequence_order`, but no public
  itinerary/map relationship is exposed.
- `PlaceSummary` exposes only `id`, `name`, and `category`.
- `TransportLeg` exposes only `mode`, `detail`, `provider`, and display-only `route`.
- `TransportHopContract` exposes `from_sequence`, `to_sequence`, `mode`, estimates,
  ordered `legs`, hop-level `data_tier`, and an optional unavailable `reason`.
- Public `DataTier` values are `static`, `scheduled`, `live`, and `unknown`. The
  database enum contains only `static`, `scheduled`, and `live`; `unknown` is an API
  honesty state, not a database tier.
- `from_sequence=0` is the existing start-origin sentinel.
- Existing geospatial validation accepts supplied WGS84 coordinate pairs and
  LineStrings, preserves paired NULLs, rejects malformed values, and never derives
  geometry.
- Accepted endpoint `POST /map/v1/projection` accepts typed UUID feature requests and
  emits verified WGS84 features and unavailable items.

### 1.2 Phase 6A map-projection fields

The following are fields of the map-projection contract:

- `feature_type`;
- `canonical_ref`;
- `geometry_status`;
- `geometry` as a map-projection geometry object or `null`;
- relationship/status objects for hops and legs (`relationships`);
- `unavailable_items` for requested items that cannot produce a canonical feature or
  relationship.

These fields are not added to the existing itinerary or transport contracts. They exist
strictly at the map-projection service boundary.

## 2. Reduced scope

The map projection supports only these feature types:

| `feature_type` | Existing entity | Geometry |
|---|---|---|
| `place` | Existing `Place.id` / public `PlaceSummary.id` | `Point` or `null` |
| `stop` | Existing database `Stop.id` | `Point` or `null` |
| `route_line` | Existing database `Route.id` | `LineString` or `null` |

Hop and leg information is not a feature type. It is represented only through the
relationship/status structure in Section 6.

No map feature may create a new Place, Stop, Route, RouteStop, or canonical research
identity.

## 3. Request/input contract

The map projection must be driven by an explicit requested feature set and optional
hop context. The request must not be inferred from names, nearby geometry, provider
display strings, or an unspecified “all records” query.

The semantic request consists of:

### 3.1 Requested canonical features

Each requested feature is an existing canonical reference:

```json
{
  "entity": "place | stop | route",
  "id": "serialized database UUID"
}
```

Identifier rules:

- `place` uses `Place.id`, represented as `PlaceSummary.id` at the existing API
  boundary.
- `stop` uses database `Stop.id` only when that ID is explicitly supplied by an
  approved backend/source input.
- `Stop.canonical_stop_id` may be retained as backend research metadata, but it is
  not a substitute for `Stop.id`.
- `route` uses database `Route.id` only when explicitly supplied by an approved
  backend/source input.
- A display name, normalized name, `TransportLeg.route`, `bqs_jb`, GIS object ID,
  `objectid_1`, `slno`, endpoint, or source row position cannot satisfy this request.

### 3.2 Requested itinerary hop context

If hop/leg relationships are requested, the input may supply an existing approved
itinerary/hop context with:

- `day_number`;
- `from_sequence`;
- `to_sequence`;
- the existing ordered hop `legs` array;
- existing hop `mode`, `data_tier`, and `reason` values.

The context must conform to the existing `ItineraryResponse` and
`TransportHopContract` semantics. The map projection must not accept client-supplied
route or stop IDs that are absent from that approved context.

### 3.3 Endpoint and request wire binding (APPROVED DECISION 1 & 2)

The accepted endpoint and wire binding are finalized as follows:

1. **Endpoint**: `POST /map/v1/projection` (continue using the existing accepted endpoint;
   no second map endpoint is created).
2. **Request Shape**: The public request body extends the existing V1 request schema:
   ```json
   {
     "requested_features": [
       { "entity": "place", "id": "serialized database UUID" }
     ],
     "requested_hops": []
   }
   ```
3. **Optional `requested_hops`**: `requested_hops: list[RequestedHopContext] = []` is
   optional.
4. **V1 Compatibility**: Existing V1 callers that omit `requested_hops` MUST retain
   identical V1 behavior. When `requested_hops` is omitted or empty, `relationships`
   MUST remain `[]`.
5. **Hop Context Trust Boundary**: Client-supplied hop context is descriptive itinerary
   context only. It carries `day_number`, `from_sequence`, `to_sequence`, ordered
   `legs`, `mode`, `data_tier`, and `reason`. It MUST NOT authorize Place identity,
   Stop identity, Route identity, geometry, RouteStop relationships, provider identity,
   or canonical identity.
6. **Backend Identity Enforcement**: Any `Route.id` or `Stop.id` that is to become an
   authorized map feature must pass through the exact typed backend identity binding
   used by V1 (`Place.id`, `Stop.id`, `Route.id`). No names, provider IDs,
   `canonical_stop_id`, `bqs_jb`, GIS IDs, `slno`, Route 12, proximity, endpoints, or
   route order may authorize identity.
7. **Display-Only Text**: `TransportLeg.route` remains display-only text and cannot
   populate `route_ref`.
8. **No Itinerary Lookup / Persistence**: `itinerary_id` is not treated as a persisted
   database lookup key.

## 4. Output contract

The map-projection response contains only the explicit requested set and its
relationship/status results:

```json
{
  "requested_features": [
    { "entity": "place", "id": "existing-id" }
  ],
  "features": [],
  "relationships": [],
  "unavailable_items": []
}
```

There is intentionally no top-level `projection_status`. Coverage is determined by
the explicit request:

- every requested canonical feature appears exactly once in `features` or
  `unavailable_items`;
- every requested hop appears exactly once in `relationships` or
  `unavailable_items`;
- a feature with a known canonical identity and unavailable geometry remains in
  `features` with `geometry: null`;
- an item with no usable canonical identity or approved input appears only in
  `unavailable_items` and never as a fabricated feature.

### 4.1 Feature object

```json
{
  "feature_type": "place | stop | route_line",
  "canonical_ref": {
    "entity": "place | stop | route",
    "id": "existing canonical repository identifier"
  },
  "geometry_status": "available | unavailable",
  "geometry": {
    "type": "Point | LineString",
    "coordinates": []
  },
  "unavailable_reason": null
}
```

`geometry` is `null` whenever `geometry_status` is `"unavailable"`. No synthetic
`feature_id`, generic `properties` object, frontend display fields, raw source fields,
or detailed provenance object is introduced by this contract.

Display values may be obtained from existing approved input contracts, such as
`PlaceSummary`, but v2 does not add a second display-data schema.

## 5. Identity semantics

### 5.1 Place identity

`Place.id` is the existing database identity and is exposed as the existing
`PlaceSummary.id`. It is the only Place identity usable by the map projection.
`research_id` and display names are traceability/display data, not substitutes for the
database identity.

### 5.2 Stop identity

The map projection distinguishes:

- `Stop.id`: database primary key; the only Stop identity usable as `canonical_ref.id`;
- `Stop.canonical_stop_id`: nullable provider-scoped research/import field; not a map
  projection identity by itself;
- `Stop.research_id` and `Stop.external_ref`: backend/source metadata, not public map
  identity unless separately approved.

If only `canonical_stop_id`, `research_id`, `external_ref`, or a display name is
available, no `stop` feature may be emitted.

### 5.3 Route identity

`Route.id` is the database primary key and the only Route identity usable as
`canonical_ref.id`.

`TransportLeg.route` is display-only text. It may be shown or retained in the
relationship/status context exactly as supplied, but it must never be converted into a
`Route.id`, route code, route name, or route-line relationship.

### 5.4 GIS identifiers

`bqs_jb`, `objectid`, `objectid_1`, `slno`, location names, normalized names, endpoint
matches, and source row order are never O-Travelz canonical identities.

## 6. Relationship and status semantics

### 6.1 Hop/leg relationship structure

Hop/leg information is an ordered relationship/status structure, not a feature:

```json
{
  "relationship_type": "itinerary_hop",
  "hop_ref": {
    "day_number": 1,
    "from_sequence": 0,
    "to_sequence": 1
  },
  "mode": "existing TransportHopContract.mode",
  "data_tier": "static | scheduled | live | unknown",
  "reason": null,
  "legs": [
    {
      "mode": "existing TransportLeg.mode",
      "detail": "existing TransportLeg.detail",
      "provider": "existing TransportLeg.provider or null",
      "route": "existing display-only TransportLeg.route or null",
      "geometry_status": "available | unavailable",
      "geometry": null,
      "route_ref": null,
      "stop_refs": [],
      "unavailable_reason": "reason or null"
    }
  ]
}
```

Rules:

- The relationship preserves the existing hop and leg array order. No new leg ID or
  `leg_index` field is introduced.
- `from_sequence=0` retains the existing origin sentinel meaning.
- `data_tier` and hop `reason` are copied from the existing transport contract and are
  not recomputed by the map projection.
- `route_ref` is `null` unless an approved input explicitly supplies a database
  `Route.id`.
- `stop_refs` remains empty unless an approved input explicitly supplies database
  `Stop.id` values. No IDs are derived from display strings.
- A leg may carry an approved LineString geometry as relationship geometry, but this
  does not make the leg a map feature or canonical entity.
- Missing geometry remains `geometry: null` with an explicit unavailable reason.

### 6.2 RouteStop relationships (APPROVED DECISION 3)

RouteStop remains **OUT OF SCOPE** for Phase 6A HTTP V2:

- RouteStop is not exposed in the public request.
- RouteStop is not exposed in the public response.
- RouteStop must not be inferred from route name, stop name, sequence, endpoints,
  proximity, provider identifiers, GIS identifiers, or route order.
- Any future RouteStop support requires a separate contract gate and approval.

## 7. Geometry semantics and authority (APPROVED DECISION 4)

Authoritative geometry is strictly bounded as follows:

1. **Authoritative Sources**: Authoritative geometry may come only from existing backend
   model geometry fields:
   - `Place.location`
   - `Stop.location`
   - `Route.geometry`
2. **Explicit CRS**: Geometry must declare and use explicit WGS84 / EPSG:4326 (SRID 4326).
3. **Coordinate Order**: Coordinates are strictly ordered `[longitude, latitude]`.
4. **Coordinate Ranges**: Longitude must be finite and within `[-180, 180]`; latitude
   must be finite and within `[-90, 90]`. Partial coordinate pairs are invalid.
5. **LineStrings**: A `LineString` requires at least two valid positions and preserves
   supplied source order.
6. **Unavailable State**: NULL geometry means:
   - `geometry: null`
   - `geometry_status: "unavailable"`
   - with an explicit `unavailable_reason`.
7. **Strict Negative Rules**: No geometry may be:
   - inferred;
   - geocoded;
   - routed;
   - endpoint-connected;
   - centroid-derived;
   - proximity-derived;
   - copied from external GIS evidence;
   - fabricated as placeholder geometry.
8. **Research Exclusion**: BhubaneswarOne GIS remains research evidence only. AMA
   geometry remains excluded. Route 12 geometry/topology remains excluded.
9. **No Frontend Transformation**: No CRS transformation is performed by the frontend.

## 8. Provenance semantics

Detailed provenance remains backend-only. It may include existing repository/source
metadata such as:

- `Place.source`, `Place.verified_at`, and coordinate audit fields;
- `Stop.source`, `Stop.verified_at`, `coordinate_status`, and reconciliation fields;
- `Route.source`, `Route.source_page`, `Route.verified_at`, and effective date;
- approved backend/source snapshot and validation results.

The public map-projection response exposes no raw source path, source record key,
internal audit field, derivation trace, GIS object ID, or detailed provenance object.

Public availability fields are strictly limited to:

- `geometry_status`;
- `unavailable_reason`.

An approved source must have a record-level identity link to the O-Travelz entity.
The official BhubaneswarOne GIS services remain research evidence only unless an
authoritative cross-system identity crosswalk is available and approved.

## 9. Unavailable semantics

Valid unavailable feature state:

```json
{
  "geometry_status": "unavailable",
  "geometry": null,
  "unavailable_reason": "coordinate_unverified"
}
```

An unavailable reason must identify why a requested feature or relationship cannot be
used spatially. The controlled vocabulary remains:

- `coordinate_unverified`;
- `identity_unresolved`;
- `topology_unresolved`;
- `source_missing`;
- `source_not_authoritative`;
- `not_in_scope`;
- `provider_geometry_unavailable`;
- `contract_not_approved`.

Unavailable geometry does not invalidate the underlying itinerary/list record. It does
exclude the item from spatial calculations, proximity matching, route-line creation,
and any rendering that requires coordinates.

## 10. Validation rules

A future implementation must validate that:

1. Requested feature references use only existing Place, database Stop, or database
   Route identities.
2. Every requested feature is represented once in `features` or `unavailable_items`.
3. Every available geometry is valid WGS84 EPSG:4326 geometry from `Place.location`,
   `Stop.location`, or `Route.geometry`.
4. Every unavailable geometry has `geometry: null` and an allowed reason.
5. `Place.id`, `Stop.id`, `Stop.canonical_stop_id`, `Route.id`, and display-only
   `TransportLeg.route` remain distinct.
6. No route or stop ID is derived from display strings or normalized names.
7. Hop relationships preserve day number, sequence bounds, leg order, mode, data tier,
   and unavailable reason.
8. `route_ref` and `stop_refs` are populated only from explicitly supplied approved
   identifiers.
9. RouteStop relationships are completely excluded from Phase 6A HTTP V2.
10. Detailed backend provenance is not exposed through the public map projection.
11. The existing strict itinerary response is not changed by map-projection fields.
12. AMA coordinates, AMA route geometry, and inferred Route 12 topology are rejected.
13. BhubaneswarOne GIS identity or geometry is rejected.

## 11. Acceptance criteria

The implementation gate requires tests demonstrating:

- verified Place point geometry is emitted with `Place.id`;
- NULL Place geometry remains a valid feature with `geometry: null`;
- Stop feature identity uses database `Stop.id`, not `canonical_stop_id` alone;
- Route feature identity uses database `Route.id`;
- `TransportLeg.route` remains display-only and cannot populate `route_ref`;
- hop/leg information is emitted only as ordered relationship/status data;
- no synthetic hop-leg feature or leg identity is created;
- RouteStop relationships are absent from public request and response;
- supplied LineStrings pass existing validation without reordering;
- partial, malformed, non-finite, out-of-range, or CRS-ambiguous geometry is rejected;
- NULL geometry never becomes a placeholder, centroid, endpoint line, or geocoded point;
- hop `data_tier`, mode, reason, and leg order are preserved exactly;
- `from_sequence=0` remains the start-origin sentinel;
- raw provenance fields are not present in the public projection;
- every requested item is covered by a feature, relationship, or explicit unavailable
  item;
- AMA, Route 12, GIS-ID, name-match, endpoint, and stop-order promotion attempts fail;
- the existing `/itinerary/plan` response remains unchanged;
- omitting or providing empty `requested_hops` preserves exact V1 behavior (`relationships: []`);
- repeated projection of the same approved input is deterministic.

## 12. Explicit exclusions

This v2 contract does not authorize:

- AMA coordinate adoption;
- AMA route geometry;
- inferred or reconstructed Route 12 topology, stop identity, or sequence;
- promotion of BhubaneswarOne `BusPISLocations` or BusRouteNetwork identity/geometry
  without an authoritative cross-system identity crosswalk;
- use of `bqs_jb`, GIS object IDs, `objectid_1`, `slno`, names, normalized names,
  endpoint proximity, visual similarity, or source row order as canonical identity;
- Google, OSM, geocoding, or external services as authoritative identity proof;
- invention of coordinates, geometry, CRS transformations, distances, durations, fares,
  route sequences, route IDs, stop IDs, or RouteStop relationships;
- RouteStop relationships in Phase 6A HTTP V2;
- treating a `TransportLeg` or its display route string as a canonical map feature;
- database migrations, production schema changes, data changes, or frontend
  implementation;
- changing the existing itinerary, transport, or geospatial validation contracts;
- live-provider claims without verified live-source evidence;
- itinerary persistence, database lookup by `itinerary_id`, or authentication.

## 13. Final human contract decisions (APPROVED)

The four contract decisions are finalized and approved as follows:

1. **Decision 1 — Request Wire Format (APPROVED)**: Continue using `POST /map/v1/projection`.
   Extend the request body with optional `requested_hops: list[RequestedHopContext] = []`.
   Omission or empty list yields `relationships: []` with identical V1 behavior. No second
   map endpoint is created.
2. **Decision 2 — Hop Context Trust Boundary (APPROVED)**: Client-supplied hop context is
   descriptive itinerary context only. It does not authorize Place, Stop, Route, geometry,
   RouteStop, provider, or canonical identity. Feature authorization requires exact typed
   backend identity binding (`Place.id`, `Stop.id`, `Route.id`). `TransportLeg.route`
   remains display-only text.
3. **Decision 3 — RouteStop (APPROVED)**: RouteStop is OUT OF SCOPE for Phase 6A HTTP V2.
   It is not exposed in requests or responses, and is never inferred from heuristics.
4. **Decision 4 — Authoritative Geometry (APPROVED)**: Authoritative geometry may come
   only from existing backend model fields (`Place.location`, `Stop.location`,
   `Route.geometry`) with explicit SRID 4326. NULL geometry is preserved as unavailable.
   All geometry inference, geocoding, endpoint connecting, and placeholder fabrication
   are prohibited. BhubaneswarOne GIS, AMA, and Route 12 remain excluded.

With these decisions approved and recorded, the Phase 6A Reduced Map Contract V2 is
finalized and ready for implementation authorization.
