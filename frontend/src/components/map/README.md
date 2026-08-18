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
