# Phase 6A Map Projection HTTP Contract v1 Draft

**Baseline:** `a60befc`
**Date:** 2026-08-18
**Status:** PHASE 6A MAP HTTP CONTRACT V1 — ACCEPTED
**Acceptance date:** 2026-08-18
**Accepted endpoint:** `POST /map/v1/projection`
**Implementation status:** Not implemented

The implementation-status line records the contract-freeze state on 2026-08-18;
it is preserved as a historical record. Current state: the bounded HTTP adapter
exists and PHASE 6A HTTP — ACCEPTED as of 2026-08-18 after final re-verification.

## 1. Purpose

This document defines a proposed versioned, read-only HTTP boundary for the accepted
Phase 6A projection core. It defines the public request and response shape while
preserving the existing itinerary, transport, database, and geospatial contracts.

The endpoint is a projection boundary only. It does not plan an itinerary, resolve
names, create map identities, calculate routes, infer geometry, or persist data.

## 2. Scope

This v1 contract covers:

- explicit requests for existing Place, Stop, and Route database identities;
- public `place`, `stop`, and `route_line` feature output;
- validated WGS84 geometry and explicit unavailable states;
- hop/leg relationship serialization when a trusted backend context exists;
- per-item coverage without a top-level `projection_status`;
- safe errors for malformed, unsupported, or invalid requests.

This v1 contract does not add an endpoint, router, schema, migration, provider, data
source, frontend behavior, or change to `/itinerary/plan` or `/transport`.

`approved_features`, `requested_hops`, `AuthorizedCanonicalRef`, and
`UnavailableItem` currently exist as projection-core/internal or provisional
structures. They are not existing public HTTP contracts. Their proposed public
serialization is defined below only as a draft for approval.

## 3. Existing repository facts

### Existing HTTP behavior

The current FastAPI application is version `0.1.0` but its existing paths are
unversioned:

- `POST /itinerary/plan` returns the existing `ItineraryPlanResponse`;
- `POST /transport/hop` returns the existing `TransportHopContract`;
- `GET /transport/providers/{provider_id}` returns the existing
  `ProviderStatusContract`;
- `POST /ai/plan` returns the existing AI response contract.

No map router or map endpoint existed at the contract-freeze baseline. This sentence
is preserved as a historical pre-implementation record; the accepted endpoint now
has a bounded backend HTTP adapter accepted on 2026-08-18.

### Existing itinerary identity behavior

`Itinerary.id` exists in the database model, but the current itinerary planner does not
persist an `Itinerary` row or resolve one by ID. `ItineraryService` computes a stable
response value named `itinerary_id` from constraints and selected places. That generated
API value is not established as a persisted `Itinerary.id` lookup key.

The HTTP map contract therefore must not accept `itinerary_id` as a database lookup
assumption in v1.

### Existing entity identity behavior

- `Place.id` is the database Place primary key and is represented as `PlaceSummary.id`
  in the existing itinerary response.
- `Stop.id` is the database Stop primary key.
- `Stop.canonical_stop_id` is a separate nullable provider-scoped import/research
  value and is not a Stop map identity.
- `Route.id` is the database Route primary key.
- `TransportLeg.route` is display-only text and is not a Route identity.
- `RouteStop` stores database `route_id`, database `stop_id`, and
  `sequence_order`, but no public map relationship is currently exposed.

### Existing projection-core behavior

The accepted projection core uses:

- `CanonicalRef` as a serialized reference that is not authoritative by itself;
- `AuthorizedCanonicalRef` as an opaque capability created from an existing backend
  `Place`, `Stop`, or `Route` model fact with a UUID database ID;
- existing `TransportHopContract` and `TransportLeg` semantics;
- existing WGS84 coordinate and LineString validation primitives.

The core performs no lookup, name matching, GIS crosswalk, geocoding, routing, or
geometry derivation.

## 4. Accepted endpoint

### Accepted HTTP contract

```text
POST /map/v1/projection
```

The accepted endpoint is separate from the
itinerary and transport routers, explicitly versioned in its path, and read-only.
`POST` is proposed because the explicit feature set is a structured request body. The
operation must be deterministic and must not create or update database records.

This endpoint is not current repository behavior. Acceptance authorizes future HTTP
implementation subject to this contract and existing project rules; it does not
constitute implementation.

### Existing behavior versus proposal

| Concern | Existing repository | Proposed v1 |
|---|---|---|
| Map endpoint | None | Accepted `POST /map/v1/projection` |
| URL versioning | Existing paths are unversioned | Version only the new map boundary |
| Itinerary lookup | No persisted lookup from generated `itinerary_id` | Not accepted |
| Writes | Itinerary planning is facts-only in the current service | Projection is read-only |
| Error envelope | Existing structured `APIErrorResponse` shape | Reuse that shape for map errors |

## 5. Request contract

### Public v1 request

```json
{
  "requested_features": [
    {"entity": "place", "id": "serialized database UUID"},
    {"entity": "stop", "id": "serialized database UUID"},
    {"entity": "route", "id": "serialized database UUID"}
  ]
}
```

`requested_features` is required and must contain at least one item. Each item has only:

```json
{
  "entity": "place | stop | route",
  "id": "serialized existing backend database primary key"
}
```

Rules:

- Requests must contain an explicit finite feature set; there is no “all records” mode.
- Duplicate `(entity, id)` pairs are invalid.
- The request contains no geometry, source, provider, name, route string, GIS ID,
  `canonical_stop_id`, `itinerary_id`, or generated projection ID.
- `CanonicalRef` in this request is only a serialized request reference. It does not
  authorize a feature.
- For the database-backed HTTP adapter proposed here, IDs must be serialized database
  UUIDs because the current Place, Stop, and Route models use UUID primary keys. This
  is an HTTP binding rule for the proposed adapter, not a change to `PlaceSummary.id`
  or any existing API contract.
- A malformed UUID, a non-UUID string in the UUID field, a provider identifier, a GIS
  identifier, `bqs_jb`, `slno`, a stop name, or a route label is a malformed/wrong-
  namespace request and fails with `422` before identity resolution.
- A syntactically valid typed database UUID that does not exist is not malformed. It
  remains an unresolved requested feature and may receive `200` coverage through
  `unavailable_items` with `identity_unresolved`.
- Unknown or unresolved requested IDs are covered in the response as unavailable
  items rather than being converted from names or provider values.

### Provisional/internal inputs excluded from the public request

The public v1 body does not expose:

- `approved_features`;
- `AuthorizedCanonicalRef`;
- `requested_hops` or `RequestedHopContext`;
- raw geometry supplied by the client;
- RouteStop input;
- a client assertion that a string is an authorized backend fact.

Those structures remain internal/provisional projection-core inputs until separately
approved as public wire fields.

## 6. Input/context binding

### Safe feature binding

The proposed HTTP adapter may resolve a requested item only by an exact typed database
primary-key lookup against the corresponding existing backend model:

| Request entity | Exact backend fact | Allowed public identity |
|---|---|---|
| `place` | `Place` row | `Place.id` |
| `stop` | `Stop` row | `Stop.id` |
| `route` | `Route` row | `Route.id` |

This is an exact typed binding proposal, not a new identity resolver or cross-system
crosswalk. The only permitted flow is:

```text
exact typed database lookup
  -> existing backend model fact
  -> AuthorizedCanonicalRef
  -> projection core
```

It must not perform name search, normalization, provider-ID translation, GIS matching,
proximity matching, endpoint matching, or route-order matching. Alternate identifiers
must fail request validation or remain unresolved; they must never enter canonical
identity resolution.

Only the returned backend model fact may be converted into the internal
`AuthorizedCanonicalRef` capability and passed to the projection core. A caller cannot
create that capability by submitting a `CanonicalRef` string.

If an exact backend row is not available, the item is unresolved and must not be
promoted to `features`.

### Safe geometry binding

The client does not submit geometry in v1. Geometry may reach the core only from:

1. geometry attached to the exact authorized backend canonical fact; or
2. a separately approved authoritative supplied backend record with a record-level
   identity link.

The adapter must validate any such geometry with the existing geospatial validation
primitives before projection. Client geometry is never authoritative. A client claim
that a geometry is “approved” is not authority.

The final authoritative geometry-source allowlist is not defined by this draft and
remains an **OPEN HUMAN DECISION**. GIS evidence, provider geometry, research IDs,
source row numbers, names, proximity, and route endpoints are not sufficient authority.

### Itinerary and hop context

The current repository cannot safely bind a public `itinerary_id` to an existing
persisted itinerary context:

- the planner generates `itinerary_id` in the response;
- the planner does not persist the corresponding `Itinerary` row;
- the database `Itinerary.id` is therefore not interchangeable with the generated
  response value.

The proposed public v1 endpoint must not accept `itinerary_id` for lookup and must not
accept an arbitrary client-supplied itinerary or hop object as authoritative.

**Future trusted hop/itinerary context is deferred and is not authorized by v1.**

Consequently, public v1 has no relationship-request field. Its `relationships` array
is empty unless a future server-side trusted context binding is separately approved.
The existing internal `RequestedHopContext` may be used by a future backend service
only after it receives an already-authorized itinerary/hop context; that future binding
must preserve the existing `ItineraryResponse` and `TransportHopContract` semantics.

## 7. Response contract

### Public v1 response envelope

```json
{
  "requested_features": [
    {"entity": "place", "id": "existing database Place.id"}
  ],
  "features": [],
  "relationships": [],
  "unavailable_items": []
}
```

There is intentionally no top-level `projection_status`.

The following are new proposed public map fields; they do not alter the existing
itinerary or transport response contracts:

- `requested_features`;
- `features`;
- `relationships`;
- `unavailable_items`;
- feature `feature_type`, `canonical_ref`, `geometry_status`, `geometry`, and
  `unavailable_reason`;
- relationship/status fields described below.

No raw source, provenance, research, GIS, or frontend display fields are included.

### Feature object

```json
{
  "feature_type": "place | stop | route_line",
  "canonical_ref": {
    "entity": "place | stop | route",
    "id": "existing database primary key"
  },
  "geometry_status": "available | unavailable",
  "geometry": {
    "type": "Point | LineString",
    "coordinates": []
  },
  "unavailable_reason": null
}
```

`geometry` is `null` whenever `geometry_status` is `unavailable`.

### Relationship object

When a future approved server-side hop context is available, the public relationship
shape is:

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

For the public v1 request defined here, no client can request this relationship
context. The array is therefore empty unless a separately approved trusted backend
binding is introduced.

### RouteStop

**RouteStop relationships are deferred from v1.** They must not be exposed or inferred
in the first HTTP scope. If a future human-approved capability is added, it requires
all of the following authoritative values:

- database `Route.id`;
- database `Stop.id`;
- authoritative `sequence_order`.

Names, endpoints, proximity, route order, GIS IDs, and provider identifiers can never
establish a RouteStop relationship.

### Unavailable item object

The proposed v1 serialization for coverage items is:

```json
{
  "item_type": "feature | relationship",
  "ref": {
    "entity": "place | stop | route",
    "id": "requested identity"
  },
  "unavailable_reason": "identity_unresolved"
}
```

For a relationship item, `ref` is the proposed `hop_ref` object rather than a feature
reference. This object is a new public serialization proposal, not an existing
repository contract.

## 8. Feature identity

V1 deliberately introduces no `feature_id` field and no generated map identity.

The public identity of a map feature is its `canonical_ref`:

| `feature_type` | `canonical_ref.entity` | Meaning of `canonical_ref.id` |
|---|---|---|
| `place` | `place` | Existing database `Place.id` |
| `stop` | `stop` | Existing database `Stop.id` |
| `route_line` | `route` | Existing database `Route.id` |

This ID is not:

- `Stop.canonical_stop_id`;
- a provider ID or arbitrary provider identifier;
- `bqs_jb`, `objectid`, `objectid_1`, or `slno`;
- a display name or normalized name;
- `TransportLeg.route`;
- a source row number, endpoint, proximity match, or route order;
- a new projection or frontend identity.

`PlaceSummary.id` remains the existing itinerary/API representation of Place identity;
the map contract does not add a second Place identity.

## 9. Geometry semantics

All public geometry is WGS84 / EPSG:4326 with coordinates ordered as
`[longitude, latitude]`.

### Allowed geometry

- `place`: `Point` or unavailable `null`;
- `stop`: `Point` or unavailable `null`;
- `route_line`: `LineString` or unavailable `null`;
- relationship leg geometry, if ever supplied by an approved backend context:
  `LineString` or unavailable `null`.

### Validation

The endpoint adapter must preserve the existing validation behavior:

- longitude is finite and within `[-180, 180]`;
- latitude is finite and within `[-90, 90]`;
- boolean, string, NaN, infinity, and malformed values are rejected;
- partial coordinate pairs are rejected;
- paired null coordinates remain valid unavailable geometry;
- a LineString requires at least two valid positions;
- supplied LineString order is preserved;
- no CRS field or CRS transformation is accepted;
- no centroid, placeholder, endpoint line, geocoded point, or guessed coordinate is
  created.

### Public unavailable geometry

```json
{
  "geometry_status": "unavailable",
  "geometry": null,
  "unavailable_reason": "coordinate_unverified"
}
```

An authorized feature with no usable geometry remains in `features` with `geometry`
`null`. A requested item without an established canonical backend identity appears
only in `unavailable_items` and is never fabricated as a feature.

## 10. Hop/leg relationship semantics

Hop and leg information is relationship/status information only. It is never a spatial
feature type and never receives a synthetic feature ID or leg ID.

When a trusted backend context is eventually bound, the relationship must:

- preserve `day_number`, `from_sequence`, and `to_sequence`;
- preserve `from_sequence=0` as the start-origin sentinel;
- preserve hop `mode`, `data_tier`, and `reason` exactly;
- preserve the ordered `legs` array exactly;
- copy each leg's `mode`, `detail`, `provider`, and display-only `route` exactly;
- keep `TransportLeg.route` from becoming `route_ref`;
- populate `route_ref` only from an explicitly supplied authorized database `Route.id`;
- populate `stop_refs` only from explicitly supplied authorized database `Stop.id`
  values;
- keep missing leg geometry as `geometry: null` with a controlled unavailable reason.

For public v1, no arbitrary client hop context is accepted. A requested relationship
without an approved server-side context is unsupported rather than inferred.

## 11. Provenance visibility

Detailed provenance is backend-only. The public response must not expose:

- raw repository paths;
- source record keys or research handoff identifiers;
- `research_id`, `external_ref`, or `canonical_stop_id`;
- provider import identifiers;
- GIS object IDs or GIS service details;
- `source`, `source_page`, `verified_at`, coordinate audit fields, or reconciliation
  metadata;
- derivation traces or internal validation snapshots.

Public availability information is limited to `geometry_status` and the controlled
`unavailable_reason` vocabulary unless a public source label is separately approved.

## 12. Coverage/unavailable semantics

Coverage is determined by the explicit `requested_features` set and any future
explicitly requested trusted relationships. There is no top-level coverage status.

### Feature coverage

- Authorized backend identity with available valid geometry: one entry in `features`
  with `geometry_status: "available"`.
- Authorized backend identity with unavailable geometry: one entry in `features` with
  `geometry: null` and an allowed unavailable reason.
- No exact authorized backend identity or no approved input: one entry in
  `unavailable_items`, never a fabricated feature.

### Relationship coverage

- An approved server-side hop context produces one `itinerary_hop` relationship.
- A relationship that was explicitly requested by a future trusted binding but cannot
  be represented produces one relationship `unavailable_item`.
- Public v1 does not accept a client relationship context; unsupported relationship
  requests fail with the error behavior below rather than silently inferring one.

Every requested feature is represented exactly once in `features` or
`unavailable_items`. No item is duplicated or silently dropped.

## 13. Error behavior

The proposed endpoint reuses the repository's existing structured error envelope:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Human-readable explanation",
    "field": "requested_features"
  },
  "details": []
}
```

Proposed behavior:

| Condition | HTTP behavior | Result |
|---|---:|---|
| Malformed JSON, wrong types, duplicate refs, invalid entity, malformed UUID, non-UUID ID, wrong-namespace ID, or extra public fields | `422` | Structured `validation_error` |
| Empty `requested_features` | `422` | `empty_requested_feature_set` |
| Unknown typed database ID | `200` | Per-item `unavailable_items` with `identity_unresolved` |
| Syntactically valid typed UUID with no matching backend row or no established authorized fact | `200` | Per-item `unavailable_items` with `identity_unresolved`; never a feature |
| Forbidden alternate identifier such as a name, provider ID, GIS ID, `bqs_jb`, `slno`, or Route 12 | `422` | Structured `validation_error`; it never enters identity resolution |
| Authorized feature with unavailable geometry | `200` | Feature with `geometry: null` and controlled reason |
| Backend-supplied geometry fails existing WGS84 validation | `422` | `invalid_geometry`; no invalid feature emitted |
| Client attempts to supply hop/leg context, RouteStop data, or unsupported relationship binding | `422` | `unsupported_relationship` |
| Internal projection failure | `500` | Existing structured `APIErrorResponse` style; no fallback projection |
| Wrong HTTP method or missing endpoint deployment | Standard framework behavior | Not a Phase 6A data result |

Unknown and unresolved feature items use `200` so the explicit request has complete
per-item coverage without revealing or inventing a separate map identity. This is a
proposed behavior for the new endpoint and does not change existing error handling.

The repository contains no authentication or authorization subsystem for this map
boundary. This contract does not invent one. Deployment-level authentication,
authorization, rate limiting, and tenant policy remain outside Phase 6A. No error code
or HTTP flow in this draft creates authentication, persistence, or authorization
semantics.

There is no silent fallback from malformed IDs to names, provider IDs, GIS IDs, route
labels, or inferred geometry.

## 14. Explicit exclusions

The v1 HTTP contract excludes:

- an inline `map` block in `POST /itinerary/plan`;
- lookup by generated `itinerary_id` or an assumption that it is persisted;
- arbitrary client-supplied `CanonicalRef` values as authorization;
- name matching, normalized-name matching, geocoding, or external identity services;
- `Stop.canonical_stop_id`, provider IDs, `bqs_jb`, `objectid`, `objectid_1`, `slno`,
  or other GIS identifiers as canonical identity;
- AMA inferred coordinates or AMA route geometry;
- inferred or reconstructed Route 12 topology, stop identity, or sequence;
- BhubaneswarOne GIS geometry or identity without a separately verified authoritative
  cross-system identity crosswalk;
- endpoint-derived lines, proximity inference, visual similarity, route-order geometry,
  or routing-derived geometry;
- invented Place, Stop, Route, RouteStop, route, stop, leg, or feature identities;
- public detailed provenance;
- RouteStop relationships in the first reduced HTTP scope;
- authentication, authorization, persistence, and itinerary lookup semantics;
- frontend map UI, GeoJSON files, provider changes, database changes, or production
  data changes;
- changes to existing itinerary, transport, AI, or geospatial primitive contracts.

## 15. Acceptance criteria

The eventual endpoint implementation and tests must objectively demonstrate:

1. Existing `/itinerary/plan` and `/transport` responses remain unchanged.
2. A raw arbitrary `CanonicalRef` cannot authorize geometry or a map feature.
3. Exact typed binding is the only identity path: `Place.id` → Place, `Stop.id` → Stop,
   and `Route.id` → Route.
4. Malformed UUIDs, non-UUID IDs, wrong-namespace IDs, names, provider IDs, GIS IDs,
   `bqs_jb`, `slno`, and Route 12 fail with `422` before identity resolution.
5. A syntactically valid but nonexistent typed database UUID produces explicit
   `200` unavailable coverage with `identity_unresolved`, never a guessed feature.
6. Only an exact authorized backend `Place`, `Stop`, or `Route` model fact can produce a
   canonical map feature.
7. `TransportLeg.route` is copied only as display text and never becomes `route_ref`.
8. No RouteStop relationship is emitted or inferred.
9. Authorized null geometry remains a valid feature with `geometry_status: "unavailable"`
   and `geometry: null`.
10. Invalid WGS84 Point, LineString, CRS-ambiguous, partial, non-finite, boolean, and
    out-of-range geometry is rejected.
11. No inferred, geocoded, placeholder, centroid, endpoint, proximity, or route-order
    geometry is accepted; client geometry cannot authorize projection.
12. Hop/leg ordering is deterministic and preserves existing mode, detail, provider,
    route, data tier, reason, and sequence values only when a trusted context is
    supplied.
13. The generated `ItineraryResponse.itinerary_id` is not treated as persisted
    `Itinerary.id`; arbitrary client itinerary/hop context is not authoritative.
14. Public output contains no detailed internal provenance or raw source identifiers.
15. AMA coordinates, AMA route geometry, unresolved BQS identities, Route 12 topology,
    and BhubaneswarOne GIS evidence cannot be promoted through this contract.
16. Empty requests, malformed requests, unknown identities, unavailable geometry,
    invalid geometry, unsupported relationships, and internal projection failures follow
    Section 13 without silent fallback.
17. Authentication, authorization, persistence, and new map services are not invented.

## Acceptance record

**PHASE 6A MAP HTTP CONTRACT V1 — ACCEPTED**

Accepted on **2026-08-18** for the exact endpoint:

```text
POST /map/v1/projection
```

This acceptance authorized HTTP implementation subject to this contract and existing
project rules. The bounded HTTP implementation was subsequently completed and
accepted through the final verification gate; this contract record does not claim
that all of Phase 6A is complete.

The following remain explicit implementation constraints, not unresolved permissions:

- the final authoritative geometry-source allowlist must not be invented; if no
  authoritative source exists, geometry remains unavailable;
- RouteStop relationships are deferred from v1;
- detailed provenance remains private;
- future trusted itinerary/hop context remains deferred and is not authorized by v1;
- authentication, persistence, itinerary lookup, and relationship resolvers remain
  outside this contract.
