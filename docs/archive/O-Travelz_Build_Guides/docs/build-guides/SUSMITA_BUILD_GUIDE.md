# O-Travelz Build Guide

Before starting, read `START_HERE.md`, the six canonical documents, `docs/team/SUSMITA.md`,
the latest relevant handoff, and the latest relevant phase completion report.

## SUSMITA — Maps & Geospatial Visualization

## Own
- maps and geospatial implementation
- routes and route lines
- multimodal map visualization
- map/geospatial tests and documentation

## Coordinate with

- Deeptiman for frontend integration and user experience
- Rudra for backend routing and transport results
- Smarak for itinerary and semantic contracts
- Akriti for verified place and source data
- Punam for shared context and documentation

## Do not own

Do not implement the complete frontend, discovery/search/chat UI, filters, place cards,
recommendation presentation, itinerary UI, transportation UI, loading/error states, or
replanning UI; those belong to Deeptiman.

Do not calculate authoritative transport facts or replace Rudra's backend/routing layer.

## Build order

1. Map/geospatial foundation
2. Route and route-line representation
3. Multimodal visualization
4. Map integration contract for Deeptiman
5. Map/geospatial tests and handoff evidence

## Mandatory Markdown evidence

Before work, read the six canonical documents, the Susmita team document, current MEMORY,
the latest relevant handoff/report, and identify dependencies, ownership boundaries, and
planned changes. During work, preserve unknown/missing geometry states, record decisions,
blockers, tests, and unresolved questions, and never invent coordinates or authoritative
transport facts. After work, inspect the diff, run relevant tests, create/update a
Markdown task/session/phase report, record files/tests/decisions/limitations, create a
dependent-agent handoff, and update MEMORY only for actual state changes.

Missing stop coordinates and route geometry must be represented as unavailable/unknown,
not inferred from names or nearby landmarks.

## Done

- [ ] Maps render the supplied places and routes
- [ ] Route lines and multimodal segments are represented correctly
- [ ] Map data comes from backend contracts rather than invented frontend facts
- [ ] Deeptiman can integrate the map layer without duplicating geospatial logic
- [ ] Map/geospatial tests pass
