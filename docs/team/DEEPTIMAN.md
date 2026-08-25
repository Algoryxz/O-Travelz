# Deeptiman — Frontend & Complete User Experience

## Read first
- `docs/architecture/00-overview.md` (frontend and user journey sections)
- `docs/architecture/05-contracts.md` (backend response contract)
- `docs/transportation/00-transport-model.md` (transport display semantics)
- Susmita's map/geospatial contract and handoff documentation

## What you build

You own the complete frontend and user experience: React + TypeScript + Vite, discovery/search/chat
UI, filters, place cards, recommendation presentation, transportation UI, itinerary UI,
map integration, loading/error states, replanning UI, and the complete user-facing flow.

Susmita owns the map/geospatial subsystem, route lines, and multimodal map visualization.
You consume and integrate that subsystem; do not move its implementation into the
frontend or recreate its authoritative geospatial logic.

Phase 6B remains dependent on a stable approved Phase 6A map contract and handoff.
Do not independently adopt unlinked BhubaneswarOne GIS features, AMA coordinates, AMA
route geometry, or Route 12 topology in the frontend.

## Own
- `frontend/`
- frontend tests
- frontend API clients and presentation state
- frontend documentation

## Do not own
- AI orchestration, ranking, itinerary logic, database semantics, or transport providers
- authoritative route geometry or geospatial calculations owned by Susmita

## Handoff

Coordinate frontend API and map-integration contracts with Rudra, Smarak, and Susmita.
Report contract or UX gaps to Punam for shared project context and documentation.

## Required evidence protocol

Before work, read the canonical documents, this team document, the build guide, current
`docs/MEMORY.md`, the latest relevant handoff, and the latest relevant phase report;
identify dependencies, ownership boundaries, and planned changes. During work, preserve
shared contracts, record decisions, blockers, tests, and unresolved questions, and do
not silently add frontend features. After work, inspect the diff, run relevant tests,
create/update a Markdown task or session report, record files/tests/decisions/limitations,
create a dependent-agent handoff, and update MEMORY only for actual state changes.

## Reusable AI-start prompt

```text
You are assisting Deeptiman on the complete O-Travelz frontend and user experience.

Before coding, read docs/PRD.md, docs/RULES.md, docs/ARCHITECTURE.md, docs/PHASES.md,
docs/MEMORY.md, docs/REPOSITORY_MAP.md, docs/team/DEEPTIMAN.md, the Deeptiman build
guide, the latest relevant handoff, and the latest relevant phase completion report.

Report the current phase, status, task, dependencies, blockers, and next action. Own
frontend UX, frontend API clients/types, itinerary/transport presentation, approved
conversation/refinement UI, loading/error states, replanning UI, and map integration.
Do not implement AI orchestration, ranking, itinerary generation, database semantics,
provider integrations, routing, or authoritative geospatial calculations. If the request
conflicts with the canonical documents, STOP and report the conflict. Do not code until
the user says to proceed.
```
