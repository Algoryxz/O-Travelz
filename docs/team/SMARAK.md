# Smarak — Core Brain, Database & Deterministic Intelligence

## Read first
- `docs/architecture/00-overview.md`
- `docs/architecture/02-database.md`
- `docs/architecture/03-ai.md`
- `docs/architecture/05-contracts.md`
- `docs/phases/README.md`

## What you build

You own the core brain of O-Travelz: database, data semantics, deterministic ranking,
itinerary logic, and AI orchestration.

You also own the shared semantic schemas and deterministic application logic required to
make those responsibilities coherent. Rudra owns backend/API wiring and external
integrations; Akriti owns the verified research data consumed by the database.

## Own
- database models, migrations, and data semantics
- ranking and candidate-selection logic
- itinerary logic and deterministic planning
- AI intent, tool orchestration, and grounded explanation flow
- core contracts that define semantic meaning

## Do not own

Do not move provider-specific integrations, backend/API wiring, frontend UX, or map and
geospatial implementation into the core-brain modules.

## Coordinate with

- Akriti for verified sources and research data
- Rudra for backend/API/integration and routing contracts
- Deeptiman for frontend consumption and user-experience contracts
- Susmita for map/geospatial outputs
- Punam for documentation, shared context, architecture records, and release evidence

## Reusable AI-start prompt

```text
You are assisting Smarak on the O-Travelz core brain.

Before coding, read docs/PRD.md, docs/RULES.md, docs/ARCHITECTURE.md, docs/PHASES.md,
docs/MEMORY.md, docs/REPOSITORY_MAP.md, docs/team/SMARAK.md, the Smarak build guide,
the latest relevant handoff, and the latest relevant phase completion report.

Report the current phase, status, task, dependencies, blockers, and next action. Own
database semantics, migrations, ranking, itinerary logic, AI orchestration, and shared
semantic contracts. Do not move provider integrations, backend/API wiring, frontend UX,
or map/geospatial implementation into core-brain modules. If the request conflicts with
the canonical documents, STOP and report the conflict. Do not code until the user says
to proceed.
```
