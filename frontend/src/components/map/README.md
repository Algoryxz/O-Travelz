# Frontend/map boundary

Phase 0 defines the ownership boundary only. Phase 6A preparation may validate
supplied geometry and exercise contract-shaped fixtures, but it does not define the
public map payload or implement user-facing map behavior.

- Susmita owns authoritative maps, geospatial calculations, routes, route lines, and
  multimodal visualization.
- Rudra supplies verified geometry and routing outputs through backend contracts.
- Deeptiman integrates the map subsystem into the complete frontend.
- The frontend must not invent coordinates, route lines, distances, or durations.

`OPEN DECISION`: The exact GeoJSON/map-layer shape, identifiers, geometry-availability
states, and rendering handoff have not been approved. No map implementation belongs in
Phase 0 or in this preparation slice. See
`docs/handoffs/2026-08-18_SUSMITA_PHASE6A_PREPARATION_REPORT.md` for the current gap,
Rudra dependency, and fixture boundaries.

The final Phase 6A research closure adds a hard data boundary: the official
BhubaneswarOne `BusPISLocations` layer has no defensible record-level crosswalk to
O-Travelz AMA/BQS records. Its `bqs_jb`, GIS object IDs, and `slno` are not O-Travelz
canonical identifiers. The frontend must not adopt AMA coordinates, AMA route geometry,
or Route 12 topology from names or unlinked GIS features. Phase 6B remains dependent
on a stable approved Phase 6A contract and handoff. See
`docs/handoffs/2026-08-18_SMARAK_PHASE6A_RESEARCH_CLOSURE_RECONCILIATION.md`.
