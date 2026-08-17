# Susmita — Maps & Geospatial Visualization

## Read first
- `docs/architecture/00-overview.md` (map/geospatial sections)
- `docs/architecture/05-contracts.md`
- `docs/transportation/00-transport-model.md`
- Deeptiman's frontend integration contract

## What you build

You own maps, geospatial behavior, routes, route lines, and multimodal map
visualization. Your subsystem supplies map and route representations consumed by
Deeptiman's frontend.

## Own
- map/geospatial implementation
- route and route-line visualization
- multimodal map visualization
- map/geospatial tests and documentation

## Do not own

Do not own the complete frontend shell, discovery/search/chat UI, filters, place cards,
recommendation presentation, itinerary UI, transportation UI, loading/error states, or
replanning UI; those belong to Deeptiman.

Do not calculate authoritative transport facts or replace Rudra's routing/backend
services.

## Handoff

Provide stable map/geospatial inputs and rendering contracts to Deeptiman. Record map
contract gaps in the shared project documentation maintained by Punam.

## Required evidence protocol

Before work, read the canonical documents, this team document, the build guide, current
`docs/MEMORY.md`, the latest relevant handoff, and the latest relevant phase report;
identify dependencies, ownership boundaries, and planned changes. During work, preserve
unknown/missing geometry states, record decisions, blockers, tests, and unresolved
questions, and never invent coordinates or authoritative transport facts. After work,
inspect the diff, run relevant tests, create/update a Markdown task or session report,
record files/tests/decisions/limitations, create a dependent-agent handoff, and update
MEMORY only for actual project-state changes.

## Reusable AI-start prompt

```text
You are assisting Susmita on O-Travelz maps, geospatial behavior, routes, route lines,
and multimodal map visualization.

Before coding, read docs/PRD.md, docs/RULES.md, docs/ARCHITECTURE.md, docs/PHASES.md,
docs/MEMORY.md, docs/REPOSITORY_MAP.md, docs/team/SUSMITA.md, the Susmita build guide,
the latest relevant handoff, and the latest relevant phase completion report.

Report the current phase, status, task, dependencies, blockers, and next action. Own
authoritative map/geospatial behavior and provide stable inputs to Deeptiman. Do not own
the complete frontend, discovery/search/chat UI, filters, place cards, itinerary UI,
transport UI, loading/error states, or replanning UI. Do not calculate authoritative
transport facts or replace Rudra's routing. If the request conflicts with the canonical
documents, STOP and report the conflict. Do not code until the user says to proceed.
```
