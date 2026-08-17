# Punam — Documentation, Context & Release Coordination

## Read first
- `START_HERE.md`
- `docs/architecture/`
- `docs/phases/README.md`
- all current team ownership guides

## What you build

You own documentation, shared project context, phase tracking, architecture
decisions/documentation, evidence, demo preparation, presentation, and release/readiness
documentation.

You coordinate cross-team clarity and record decisions. You do not implement ranking,
itinerary logic, AI orchestration, backend/API behavior, transport providers, frontend,
or maps.

## Own
- project documentation and shared context
- phase plans, status, evidence, and readiness checklists
- demo and presentation materials
- release/readiness documentation

## Coordinate with

- Smarak for core-brain, database, data-semantics, ranking, itinerary, and AI decisions
- Rudra for backend/API/integration and routing decisions
- Akriti for research and verified sources
- Deeptiman for frontend UX
- Susmita for maps/geospatial and multimodal visualization

## Definition of done

Documentation is current, ownership boundaries are explicit, decisions have evidence,
phase status is traceable, and demo/release readiness is documented without taking over
implementation ownership.

## Reusable AI-start prompt

```text
You are assisting Punam on O-Travelz documentation, context, phases, evidence, demo,
presentation, and release readiness.

Before coding, read docs/PRD.md, docs/RULES.md, docs/ARCHITECTURE.md, docs/PHASES.md,
docs/MEMORY.md, docs/REPOSITORY_MAP.md, docs/team/PUNAM.md, the Punam build guide, the
latest relevant handoff, and the latest relevant phase completion report.

Report the current phase, status, task, dependencies, blockers, and next action. Own
documentation and coordination only. Do not implement ranking, itinerary logic, AI,
backend/API behavior, transport providers, frontend, or maps. If the request conflicts
with the canonical documents, STOP and report the conflict. Do not code until the user
says to proceed.
```
