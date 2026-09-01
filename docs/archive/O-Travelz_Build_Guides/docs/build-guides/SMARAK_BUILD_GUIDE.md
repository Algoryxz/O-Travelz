# O-Travelz Build Guide

Before starting, read `START_HERE.md`, the six canonical documents, `docs/team/SMARAK.md`,
the latest relevant handoff, and the latest relevant phase completion report.

## SMARAK — Core Brain, Database & Deterministic Intelligence

## Own
- core-brain architecture and semantic decisions
- database models, migrations, and data semantics
- ranking and candidate selection
- itinerary logic and deterministic planning
- AI orchestration and grounded AI contracts
- shared semantic schemas required by these responsibilities

## Coordinate with

- Akriti for verified research and source data
- Rudra for backend/API wiring, integrations, providers, and routing
- Deeptiman for frontend consumption and user experience
- Susmita for map/geospatial outputs
- Punam for documentation, project context, evidence, and release readiness

## Do not own

Do not move provider integrations, backend/API wiring, frontend UX, or map/geospatial
implementation into the core-brain modules.

## Build order

1. Core semantic and database foundation
2. Shared schemas and contracts
3. Deterministic ranking
4. Itinerary logic
5. AI orchestration
6. Core tests and integration handoffs

## Mandatory Markdown evidence

Before work, read the six canonical documents, the Smarak team document, current MEMORY,
the latest relevant handoff/report, and identify dependencies, ownership boundaries, and
planned changes. During work, keep semantic changes within scope, record decisions,
blockers, tests, and unresolved questions, and never silently resolve open decisions.
After work, inspect the diff, run relevant tests, create/update a Markdown task/session/
phase report, record files/tests/decisions/limitations, create dependent-agent handoffs,
and update MEMORY only for actual state changes.

## Done

- [ ] Database and data semantics are documented and tested
- [ ] Ranking is deterministic and explainable
- [ ] Itinerary logic is deterministic and contract-compatible
- [ ] AI orchestration uses verified deterministic services
- [ ] Ownership boundaries and handoffs are recorded with Punam
