# Phase 6A Transit Research Artifact Contract

## Overview
This directory defines the formal Phase 6A research contracts for the comprehensive Mo Bus / CRUT Route Intelligence and Path Reconstruction pipeline across all 154 O-TRAVELZ transit routes.

## Authoritative Repository Baseline
All Phase 6A research and validation gates are evaluated against the authoritative ground truth extraction inventory in `data/research/transit/extraction/`:
- `routes_extracted.json`: Exactly 154 routes
- `stops_extracted.json`: Exactly 1,430 unique canonical stops
- `route_stops_extracted.json`: Exactly 1,487 unique persisted `RouteStop` relationships (derived from 1,491 raw extraction rows containing 4 documented duplicate row entries)

### Forensic Resolution of the 1,487 vs 1,491 Link Count
An audit of `data/research/transit/extraction/route_stops_extracted.json` identified that exactly 4 rows are duplicate entries of `(route_number, stop_name, sequence_order)`:
1. Index 935: Route 215, `SHREE RAM VATIKA`, sequence 16 (duplicate of index 934)
2. Index 1476: Route 205, `AINTHAPALI BUS TERMINAL`, sequence 1 (duplicate of index 175)
3. Index 1486: Route 215, `AINTHAPALI BUS TERMINAL`, sequence 1 (duplicate of index 919)
4. Index 1487: Route 215, `PADIABAHAL`, sequence 2 (duplicate of index 980)

The production importer (`app.transport.importer.py`) deduplicates exact `(route.id, stop.id, sequence_order)` collisions, resulting in exactly **1,487 unique persisted `RouteStop` entities** in PostgreSQL, which matches the verified baseline across Phase 4A–4D (`assert route_stops == 1487`).

---

## Expected Directory Layout
When Phase 6A research is executed by Claude Opus 4.6, the resulting artifacts will populate:

```
data/research/transit/phase_6a/
├── schema/                           # Formal JSON schemas (Phase 6A.1)
│   ├── route_index.schema.json
│   ├── regional_routes.schema.json
│   ├── global_analysis.schema.json
│   ├── unresolved_stops.schema.json
│   └── evidence_registry.schema.json
├── route_index.json                  # Master index accounting for all 154 routes
├── capital_region.json               # Capital Region routes (96 routes)
├── rourkela.json                     # Rourkela routes (25 routes)
├── berhampur.json                    # Berhampur routes (10 routes)
├── sambalpur.json                    # Sambalpur routes (17 routes)
├── keonjhar.json                     # Keonjhar routes (6 routes)
├── global_analysis.json              # Shared corridors, transfer hubs, aliases, conflicts
├── unresolved_stops.json             # Documented unresolved stop registry
└── evidence_registry.json            # Authoritative evidence citations
```

## Canonical Terminology & Enums

### 1. Confidence Levels
- `CONFIRMED`: Direct official evidence from Tier 1 sources (CRUT PDFs, official maps, government notifications). Requires `HIGH` reliability evidence.
- `SUPPORTED`: Strong geographic evidence from Tier 2-3 sources (database records, OSM, official route maps).
- `INFERRED`: Plausible deduction from partial evidence. Must be explicitly labeled.
- `UNKNOWN`: Insufficient evidence. Must remain unknown without fabrication.

### 2. Geometry Status
- `EXACT`: Both stop endpoints verified + snap-to-road network.
- `CORRIDOR`: Road/arterial corridor known with geographic anchors.
- `PARTIAL`: Mixed segments with verified sections and explicit gap markers.
- `NONE`: No geometry or insufficient evidence. (Markers only; no polyline).

### 3. Coordinate Provenance
- `official_source`: Explicit coordinates from official CRUT/government publication.
- `geocoded`: Resolved through the application's Nominatim OSM pipeline with bounding box validation.
- `osm_verified`: Landmark/hub verified from OpenStreetMap database.
- `research_approximate`: Approximate landmark position for research context.
- `null`: Missing or unresolved coordinate.

### 4. Geographic Status
- `verified`: Exact physical position confirmed.
- `approximate`: Known approximate locality/neighborhood.
- `identified_no_coordinate`: Stop entity known but latitude/longitude not established.
- `unresolved`: Physical location unresolved.

### 5. Evidence Source Types
- `OFFICIAL_DOCUMENT`: Published PDF, timetable, schedule, or gazette from CRUT/Government.
- `OFFICIAL_MAP`: Official system map or network diagram.
- `OSM`: OpenStreetMap verified node or way.
- `RESEARCH`: Grounded repository transit research artifact.
- `INFERENCE`: Labeled deductive reasoning.

### 6. Corridor Status
- `VERIFIED_GEOGRAPHY`: Corridor confirmed from official route/map.
- `STRONGLY_INFERRED`: Arterial highway/road deduced from known via points.
- `WEAKLY_INFERRED`: Plausible corridor between distant anchors.
- `UNKNOWN`: Unresolved corridor segment.

### 7. Evidence Reliability
- `HIGH`: Direct primary official source.
- `MEDIUM`: Reputable secondary source or corroborated transit reference.
- `LOW`: Partial inference or single secondary claim.

---

## Fundamental Research Rules

1. **No Fabricated Coordinates**: Never invent coordinates. A coordinate without evidence will fail validation (`AC4`).
2. **Preserve Production Identifiers**: All `route_id`, `route_code`, and `stop_id` values must link directly to existing production records (`AC1`, `AC2`).
3. **Strict Stop & Sequence Preservation**: Research stop identities and sequences must match the database baseline unless an explicit `sequence_conflict`, `stop_naming`, or `stop_omission` is documented (`AC2`, `AC3`).
4. **Corridors $\neq$ Stops**: A road name or junction is corridor intelligence, not a new stop record.
5. **No Route Geometry / GeoJSON**: Research artifacts produce intelligence, not vector polylines or GeoJSON (`AC8`).
6. **Traceable Evidence**: Every corridor and resolved coordinate must cite an `evidence_id` in `evidence_registry.json` (`AC9`).
7. **No Silent Reconciliations**: All discrepancies with the database must be recorded as explicit `conflicts` (`AC6`).
