# Frontend/map boundary

Phase 0 defines the ownership boundary only:

- Susmita owns authoritative maps, geospatial calculations, routes, route lines, and
  multimodal visualization.
- Rudra supplies verified geometry and routing outputs through backend contracts.
- Deeptiman integrates the map subsystem into the complete frontend.
- The frontend must not invent coordinates, route lines, distances, or durations.

`OPEN DECISION`: The exact GeoJSON/map-layer shape, identifiers, geometry-availability
states, and rendering handoff have not been approved. No map implementation belongs in
Phase 0.
