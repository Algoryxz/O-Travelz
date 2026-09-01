# O-Travelz Build Guide

Before starting, read `START_HERE.md`, the six canonical documents, `docs/team/DEEPTIMAN.md`,
the latest relevant handoff, and the latest relevant phase completion report.

## DEEPTIMAN — Complete Frontend & User Experience

## Own
- `frontend/`
- frontend tests and presentation documentation
- React + TypeScript + Vite user experience
- discovery/search/chat UI, filters, place cards, recommendation presentation
- transportation UI, itinerary UI, map integration, loading/error states, and replanning UI

## Coordinate with

- Smarak for semantic contracts and AI/ranking/itinerary outputs
- Rudra for backend APIs and integrations
- Susmita for maps, geospatial data, routes, route lines, and multimodal visualization
- Punam for shared context, documentation, and release/readiness tracking

## Do not own

Do not implement AI orchestration, ranking, itinerary logic, database semantics,
transport providers, routing, or authoritative geospatial calculations.

## Build order

1. Frontend foundation
2. API client and shared response types
3. Discovery/search/chat UI and filters
4. Place and recommendation presentation
5. Itinerary and transportation UI
6. Susmita's map/geospatial integration
7. Loading, error, and replanning states
8. Frontend tests and integration evidence

## Mandatory Markdown evidence

Before work, read the six canonical documents, the Deeptiman team document, current
MEMORY, the latest relevant handoff/report, and identify dependencies, ownership
boundaries, and planned changes. During work, preserve shared contracts, record
decisions, blockers, tests, and unresolved questions, and do not add unauthorized
frontend features. After work, inspect the diff, run relevant tests, create/update a
Markdown task/session/phase report, record files/tests/decisions/limitations, create a
dependent-agent handoff, and update MEMORY only for actual state changes.

Frontend integration waits for approved later API and map contracts.

## Done

- [ ] Complete frontend starts
- [ ] API and response types match shared contracts
- [ ] Discovery, recommendations, itinerary, and transportation render correctly
- [ ] Susmita's map/geospatial layer is integrated without duplicated logic
- [ ] Loading, error, and replanning states exist
- [ ] Frontend tests pass
