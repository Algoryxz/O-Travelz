# O-Travelz Phase 6A Reduced Map/Geospatial Contract — Draft

**Date:** 2026-08-18<br>
**Status:** Draft for review; not an implementation authorization<br>
**Starting checkpoint:** `a60befc`<br>
**Scope:** Contract/documentation only; no production code, schema, coordinates,
GeoJSON, frontend behavior, or database state is changed by this draft.

## 1. Authority and relationship to the canonical project state

This is the proposed reduced Phase 6A map/geospatial contract. Until it is reviewed
and approved, the `OPEN DECISION` in `docs/ARCHITECTURE.md` remains open and Phase 6A
implementation remains gated.

The source of truth for this draft is the current canonical documentation, especially:

- `docs/ARCHITECTURE.md` — ownership and map/geospatial boundary;
- `docs/PHASES.md` — Phase 6A reduced scope and gate;
- `docs/MEMORY.md` — current project-state ledger;
- `docs/architecture/05-contracts.md` — existing itinerary, hop, leg, sequence, and
  `data_tier` semantics;
- `docs/transportation/00-transport-model.md` — transport entities, topology, data
  tiers, and unavailable behavior;
- `docs/handoffs/2026-08-18_SMARAK_PHASE6A_RESEARCH_CLOSURE_RECONCILIATION.md` — final
  AMA/GIS research closure and exclusions.

This contract is a map projection boundary. It does not become a second source of
truth for places, stops, routes, itinerary meaning, routing, or transport research.

## 2. Contract principles

1. A map feature may represent only an existing O-Travelz canonical entity or an
   explicitly identified itinerary hop leg.
2. A geometry is usable only when its source, authority, CRS, and verification state
   are explicit.
3. An identity-confirmed record may be represented with `geometry: null`; missing
   geometry is not permission to infer a location.
4. The map layer consumes deterministic backend facts. It does not rank places, route
   stops, calculate distances/durations/fares, geocode names, or repair source data.
5. Canonical identifiers remain distinct from map projection identifiers.
6. Synthetic fixtures are test inputs only and must never be presented as production
   geometry or transport facts.

## 3. Supported map feature types

The reduced contract supports these feature types only:

| `feature_type` | Represents | Geometry | Required identity | Allowed when |
|---|---|---|---|---|
| `place` | A verified O-Travelz `Place` | `Point` or unavailable | Existing `Place.id` | The place is in the supplied itinerary or approved map input. |
| `stop` | A canonical transport `Stop` | `Point` or unavailable | Existing `Stop.id` | The stop identity is supplied by an accepted backend/source contract. |
| `route_line` | A canonical `Route` representation | `LineString` or unavailable | Existing `Route.id` | Route geometry is directly supplied by an approved authoritative source. |
| `hop_leg` | One ordered leg of an existing `TransportHop` | `LineString` or unavailable | Derived hop/leg projection key | The leg exists in the accepted itinerary/hop payload; geometry is optional. |

`Point` and `LineString` are the only geometry types in this draft. `Polygon`,
`MultiPoint`, `MultiLineString`, raster tiles, heatmaps, turn-by-turn paths, and
client-created geometry are out of scope. A future contract amendment is required
before supporting another geometry type.

An origin represented by `from_sequence=0` is not a new canonical entity. It may be
shown through an existing verified `place` feature or an explicitly supplied origin
feature in a future contract. If no canonical identity and verified coordinate exist,
the origin has no map geometry.

## 4. Identifiers

### 4.1 Canonical identifiers

Canonical references must preserve the identifiers already defined by the accepted
project contracts:

| Entity | Canonical reference |
|---|---|
| Place | `canonical_ref.entity = "place"`, `canonical_ref.id = Place.id` |
| Stop | `canonical_ref.entity = "stop"`, `canonical_ref.id = Stop.id` |
| Route | `canonical_ref.entity = "route"`, `canonical_ref.id = Route.id` |
| Itinerary | `itinerary_ref.id = itinerary_id` |
| Day stop | `day_number` plus the existing positive `sequence` |
| Hop | `from_sequence` and `to_sequence` within a day; `from_sequence=0` retains its existing origin meaning |
| Hop leg | Existing leg order, represented by a zero-based or one-based `leg_index` only if the source API contract explicitly supplies that index; the map layer must not invent a different order |

No map feature may create or substitute a new canonical place, stop, route, or
RouteStop identity.

### 4.2 Map projection identifiers

The payload may include a deterministic `feature_id` for rendering and relationship
references. It is not a research or database identifier.

- Canonical entity feature: `feature_id = <feature_type>:<canonical_ref.id>`.
- Hop leg feature: `feature_id = hop_leg:<itinerary_id>:<day_number>:<from_sequence>:<to_sequence>:<leg_index>`.

The exact serialization may be revised during review, but the following rules are
fixed: it must be deterministic within the payload, must not reuse official GIS
identifiers, and must not be treated as a new O-Travelz canonical ID.

The following are never canonical identifiers in this contract: `bqs_jb`, GIS
`objectid`, `objectid_1`, `slno`, `location_n`, names, normalized names, endpoint
matches, or source row order.

## 5. Coordinate and CRS semantics

- Public map geometry uses WGS 84 geographic coordinates, EPSG:4326.
- Point coordinates are ordered `[longitude, latitude]`.
- Line coordinates are ordered as GeoJSON-compatible `[longitude, latitude]` pairs.
- Longitude must be finite and within `[-180, 180]`; latitude must be finite and
  within `[-90, 90]`.
- A point requires exactly one complete coordinate pair. Partial pairs, `NaN`, infinity,
  placeholder values, and sentinel coordinates such as `[0, 0]` are invalid.
- A `LineString` requires at least two valid positions and must preserve the supplied
  source order.
- Altitude is not part of the reduced contract.
- A source in another CRS may be used only after an approved backend transformation
  to EPSG:4326 is documented in provenance. The frontend must not guess or silently
  transform CRS.
- The official BhubaneswarOne GIS layer's source CRS/fields may remain research
  evidence, but its coordinates are not eligible for this public map contract without
  the authoritative cross-system identity crosswalk recorded in the research closure.

## 6. Geometry provenance and authority

Every non-null geometry must carry provenance sufficient to answer what supplied it,
which canonical record it belongs to, and when/under what verification state it was
accepted.

Required provenance fields:

```json
{
  "provenance": {
    "authority": "canonical_source | approved_backend_output | contract_fixture",
    "source_ref": "repository path, approved service/document reference, or fixture reference",
    "source_record_id": "stable source record key when one exists",
    "verification_status": "verified | fixture_only",
    "verified_at": "date or null",
    "derivation": "direct | explicitly_approved_backend_derivation | none"
  }
}
```

Rules:

- `canonical_source` and `approved_backend_output` require an approved authoritative
  source and a record-level identity link to the O-Travelz entity.
- `contract_fixture` is test-only and must never be emitted as production map data.
- `derivation` may not be `inferred`. A backend-derived geometry must document the
  approved input geometry and deterministic derivation; a visually plausible line,
  name match, stop order, endpoint, or proximity is not derivation authority.
- A research source that lacks a defensible cross-system identity link is not an
  authority for a production map feature, even if its name or coordinates appear
  similar.
- Provenance does not override an unavailable or unresolved source state.

## 7. Geometry-present behavior

When geometry is approved and valid:

- `geometry_status` is `"available"`.
- `geometry` contains the validated `Point` or `LineString`.
- `provenance` is present and satisfies Section 6.
- The feature retains its canonical reference and display properties from the source
  contract.
- Route lines and hop-leg lines preserve source direction/order; the map layer does
  not reorder, smooth, extend, snap, or connect them to nearby features.
- The frontend may render the feature and use the relationship metadata for display,
  but it may not recompute routing facts from the geometry.

## 8. Geometry-unavailable and NULL behavior

When a canonical record or hop leg exists but geometry is not safely available:

```json
{
  "geometry_status": "unavailable",
  "geometry": null,
  "unavailable_reason": "coordinate_unverified"
}
```

Allowed `unavailable_reason` values are:

- `coordinate_unverified`;
- `identity_unresolved`;
- `topology_unresolved`;
- `source_missing`;
- `source_not_authoritative`;
- `not_in_scope`;
- `provider_geometry_unavailable`;
- `contract_not_approved`.

The record remains available for non-spatial itinerary/list rendering when its
canonical identity exists. It must be excluded from distance, proximity, spatial
matching, route-line construction, and map calculations requiring coordinates.

The map layer must not:

- replace `null` with a guessed coordinate, centroid, nearby feature, or placeholder;
- silently drop the record without preserving the unavailable state;
- turn a display name into an identity;
- convert a missing route line into a straight line between endpoints;
- treat `bqs_jb`, GIS object IDs, `slno`, or name similarity as a reason to change the
  state to available.

When no canonical identity exists, the system must not emit a canonical map feature.
The related hop/leg may remain in the relationship/status payload as unavailable, with
the reason preserved.

## 9. Transport hop/leg to map-feature relationships

The existing itinerary contract remains authoritative for itinerary meaning:

- `day.stops[].sequence` identifies the ordered itinerary stops;
- each hop connects `from_sequence` to `to_sequence`;
- `from_sequence=0` retains its reserved origin meaning;
- one transport hop may contain multiple ordered legs, such as walk → bus → walk;
- `data_tier` and unavailable-hop `reason` remain authoritative and are not recomputed
  by the map layer.

The reduced map projection may expose relationships with this shape:

```json
{
  "relationship_type": "hop_leg_supports",
  "hop_ref": {
    "day_number": 1,
    "from_sequence": 1,
    "to_sequence": 2
  },
  "leg_index": 0,
  "mode": "walk | bus | ...",
  "provider": "existing provider value or null",
  "route_ref": { "entity": "route", "id": "existing route id" },
  "feature_id": "hop_leg:... or route_line:... or null",
  "geometry_status": "available | unavailable",
  "unavailable_reason": "reason or null"
}
```

Relationship rules:

- A hop relationship must resolve to the existing itinerary day and hop; it may not
  create a new route or stop.
- A bus/provider leg may reference a `route_line` only when an existing canonical
  `Route.id` and authoritative route geometry are both present.
- A leg may reference a `stop` only when the existing canonical `Stop.id` is supplied;
  a stop name alone is insufficient.
- A walk/provider leg may expose a `hop_leg` line only when that line is explicitly
  supplied and provenance-approved. The map layer must not calculate or infer it.
- Missing route IDs, missing stop IDs, unresolved topology, or unavailable geometry
  produce `feature_id: null` plus an unavailable reason; they do not produce a guessed
  line or relationship to a similarly named feature.
- AMA coordinate-based stop mapping, AMA route geometry, and inferred Route 12
  topology are never valid relationship inputs under this draft.

## 10. API payload semantics

This draft defines a read-only map projection payload. It does **not** modify the
accepted `POST /itinerary/plan` response, add a route, or authorize a schema change.
The eventual API placement—separate map endpoint versus an approved optional map
projection—is a review decision.

Proposed payload shape:

```json
{
  "schema_version": "phase6a-reduced-draft",
  "itinerary_ref": { "id": "existing itinerary_id" },
  "crs": "EPSG:4326",
  "features": [],
  "relationships": [],
  "projection_status": "complete | partial | unavailable",
  "unavailable_reasons": []
}
```

Each entry in `features` contains:

```json
{
  "feature_id": "place:existing-id",
  "feature_type": "place | stop | route_line | hop_leg",
  "canonical_ref": { "entity": "place | stop | route", "id": "existing-id" },
  "geometry_status": "available | unavailable",
  "geometry": { "type": "Point | LineString", "coordinates": [] },
  "properties": {
    "name": "source display value or null",
    "mode": "existing value or null",
    "provider": "existing value or null",
    "data_tier": "static | scheduled | live | unknown or null"
  },
  "provenance": {},
  "unavailable_reason": null
}
```

Payload rules:

- `geometry` is non-null only when `geometry_status` is `"available"`; it is `null`
  when status is `"unavailable"`.
- `canonical_ref` is required for `place`, `stop`, and `route_line`; `hop_leg` uses
  its deterministic projection key and retains the hop/leg reference.
- `properties` are descriptive projection values, not identity or research authority.
- `data_tier`, duration, cost, mode, provider, and unavailable reasons are copied from
  the accepted deterministic transport response; the map layer does not recompute them.
- `projection_status="partial"` means some eligible records/features are present and
  some have explicit unavailable states. It does not mean that missing features may be
  inferred.
- `projection_status="unavailable"` means no usable map geometry is available for the
  requested projection; itinerary/list data may still remain valid.
- A payload must be deterministic for the same accepted itinerary and approved source
  snapshot.
- No official GIS fields are required or exposed as canonical identity fields in this
  payload. The official BhubaneswarOne source remains research evidence only until an
  authoritative cross-system identity crosswalk is available.

## 11. Frontend consumption expectations

Deeptiman's frontend may consume the approved map projection only after Phase 6A
handoff. It must:

- render only `geometry_status="available"` geometries;
- preserve `geometry=null` and show a clear unavailable/limited state where relevant;
- use `feature_id` only for projection rendering/selection and use `canonical_ref` for
  entity navigation;
- preserve itinerary day/stop order and hop/leg order from the payload;
- surface `data_tier` and unavailable reasons so static, scheduled, unknown, and missing
  transport data are not presented as live or complete;
- avoid geocoding, name matching, nearest-feature matching, route reconstruction,
  distance/duration calculation, CRS guessing, or fallback to Google/OSM;
- avoid direct use of the official BhubaneswarOne GIS layer as an O-Travelz identity
  source;
- avoid duplicating Susmita's authoritative geospatial logic or Rudra's routing logic.

## 12. Validation requirements

Before a payload is accepted for map consumption, validation must prove:

1. The payload matches the approved schema and uses only supported feature types and
   geometry types.
2. Every canonical reference resolves to an existing accepted entity; no map feature
   creates a missing Place, Stop, Route, or RouteStop.
3. Every available geometry is valid EPSG:4326 WGS 84 with finite, range-valid
   `[longitude, latitude]` positions.
4. Every unavailable geometry has `geometry: null` and an allowed reason.
5. Every non-null geometry has complete provenance; fixture provenance is never marked
   production-verified.
6. Every hop/leg relationship resolves to the existing itinerary day, sequences, and
   leg order, including the reserved `from_sequence=0` case.
7. Route-line references have an existing canonical route identity and authoritative
   source-backed geometry; no route line is synthesized from stops or endpoints.
8. Stop references have an existing canonical stop identity; names, `bqs_jb`, GIS IDs,
   `slno`, and normalized-name matches do not satisfy identity validation.
9. AMA coordinate mapping, AMA route geometry, and Route 12 inferred topology are
   rejected as out of scope.
10. The projection does not change hop mode, provider, route, `data_tier`, duration,
    fare, reason, or itinerary sequence values.

## 13. Acceptance-test requirements

The Phase 6A implementation gate must not open until tests cover at least:

| Test | Expected result |
|---|---|
| Verified place with approved point | Emits a `place` feature with EPSG:4326 `Point` and complete provenance. |
| Verified place with `NULL` location | Emits the canonical place with `geometry: null` and `coordinate_unverified`; no fallback point. |
| Canonical stop with approved point | Emits a `stop` feature tied to the existing `Stop.id`. |
| Confirmed stop with unresolved location | Preserves the stop identity and unavailable state; no coordinate is invented. |
| Approved route line | Emits a `route_line` `LineString` tied to the existing `Route.id`; source order is preserved. |
| Missing route geometry | Emits unavailable route state; does not draw an endpoint-to-endpoint line. |
| Ordered walk → bus → walk hop | Preserves hop identity, leg order, mode/provider, `data_tier`, and each approved relationship. |
| `from_sequence=0` origin hop | Preserves the existing origin semantics without creating an invented origin identity. |
| Unavailable hop | Preserves `mode="unavailable"` and its human-readable reason; no map geometry is fabricated. |
| Invalid CRS/range/partial coordinates | Rejects the payload before rendering/acceptance. |
| Missing canonical stop/route ID | Does not create a feature; preserves the relationship as unavailable with a reason. |
| GIS identifier attempt | Rejects use of `bqs_jb`, `objectid`, `objectid_1`, or `slno` as canonical identity. |
| Name/endpoint/stop-order similarity | Does not promote identity, coordinate, topology, or geometry. |
| AMA and Route 12 guard tests | Reject AMA coordinate mapping, AMA route geometry, and inferred Route 12 topology. |
| Fixture provenance | Allows contract tests but prevents fixture geometry from being represented as verified production data. |
| Deterministic repeatability | Same accepted input/source snapshot yields the same projection and relationship order. |

## 14. Explicit exclusions

This reduced contract does not authorize:

- AMA coordinate-based stop mapping;
- AMA route geometry;
- inferred or reconstructed Route 12 topology, stop identity, or sequence;
- recovery or reconstruction of the missing 72-ID reconciliation;
- use of `bqs_jb`, GIS object IDs, `slno`, names, normalized names, endpoint proximity,
  or source row order as canonical identity;
- promotion of the official BhubaneswarOne `BusPISLocations` or BusRouteNetwork data
  into O-Travelz map features without an authoritative cross-system identity crosswalk;
- Google, OSM, geocoding, visual similarity, nearest-neighbor matching, or any other
  external service as authoritative identity proof;
- invented coordinates, straight-line route geometry, guessed CRS transformations,
  inferred distances, durations, fares, route sequences, or stop relationships;
- routing, graph construction, ranking, itinerary sequencing, provider integration,
  timetable interpretation, or AI factual reasoning;
- database migrations, production schema changes, new canonical IDs, or production
  data changes;
- frontend implementation, UI styling, map tiles, clustering, or user-facing behavior;
- live provider claims without verified live-source evidence.

## 15. Review decisions still required

Before this draft can become the approved Phase 6A contract, the owners must review:

1. whether the map projection is a separate API response or an approved optional block;
2. the final schema/version field names and error envelope;
3. the authoritative source allowlist and provenance retention policy;
4. the exact frontend handoff and unavailable-state presentation;
5. whether any future authoritative AMA/GIS cross-system identity crosswalk satisfies
   the reopen gate without changing the canonical-source hierarchy.

Until those decisions are approved, this document is a reviewable contract draft only;
Phase 6A remains gated and no implementation may begin from it alone.
