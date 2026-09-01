# Phase 2 Geometry Handoff — Susmita

## Owner

Smarak/Punam → Susmita

## Phase

Phase 2 database/import → Phase 6A map/geospatial dependency preparation

## Status

Phase 2 spatial persistence is verified. Susmita's map/geospatial implementation remains
bounded by the later phase dependencies in `docs/PHASES.md`.

## Verified geometry state

- `places.location` and `stops.location` are PostGIS `geography(Point,4326)`.
- `routes.geometry` is PostGIS `geography(LineString,4326)`.
- GiST indexes are present and valid `POINT(lon lat)` persistence was verified.
- NULL coordinate persistence and transaction rollback were verified.
- All 72 imported AMA stops have NULL coordinates and unresolved coordinate status.
- No Route 12 canonical stop mappings were created; missing geometry/mapping is not a
  geometry to infer.

## Ownership boundary

Susmita owns geometry representation, route lines, multimodal map representation, and
the map integration contract. Susmita does not own provider truth, provider adapters,
routing authority, backend transport facts, or the frontend shell.

## Honest representation rule

Unknown or unavailable coordinates and geometry must remain explicit. Do not infer a stop
coordinate from its name, a nearby landmark, or a route. Do not create route geometry
from unresolved Route 12 mappings.

## Evidence and next action

See `docs/ARCHITECTURE.md`, `docs/PHASES.md`, `docs/MEMORY.md`, and the final Phase 2
documentation report. Prepare only approved fixture/contract work when the canonical
phase dependencies permit it, and document every task in Markdown.
