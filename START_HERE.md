# START HERE

This is the entry point for a new developer or AI assistant with no previous
conversation context.

## 1. Understand the product

Read:

1. [docs/AI_ENGINEERING_HANDOFF.md](docs/AI_ENGINEERING_HANDOFF.md) *(Authoritative Handoff & Technical Source of Truth)*
2. [docs/PRD.md](docs/PRD.md)
3. [docs/RULES.md](docs/RULES.md)
4. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
5. [docs/PHASES.md](docs/PHASES.md)
6. [docs/MEMORY.md](docs/MEMORY.md)
7. [docs/REPOSITORY_MAP.md](docs/REPOSITORY_MAP.md)

These files are canonical. Supporting documents must not override them.

## 2. Find your role

Read your personal document:

```text
docs/team/<YOUR_NAME>.md
```

Then read your build guide:

```text
docs/O-Travelz_Build_Guides/docs/build-guides/<YOUR_NAME>_BUILD_GUIDE.md
```

Ownership is fixed:

- Smarak — core brain, database, data semantics, ranking, itinerary logic, AI orchestration.
- Akriti — research, verification, places, sources, transport research.
- Rudra — backend, APIs, integrations, transportation providers, routing.
- Susmita — maps, geospatial, routes, route lines, multimodal visualization.
- Deeptiman — complete frontend and user experience.
- Punam — documentation, context, phases, evidence, demo, presentation, release readiness.

## 3. Check the current phase

Read the current phase and status in `docs/MEMORY.md`. The canonical phase order and
gates are in `docs/PHASES.md`.

Phase 2 engineering acceptance is complete and the live database/import evidence is
recorded in `docs/PHASES.md` and `docs/phases/`. The final AMA Phase 6A research
investigation is closed without a defensible cross-system GIS identity bridge; AMA
coordinates and AMA route geometry remain excluded. Phases 0–5 are accepted within
their explicit limits, Phase 6A implementation remains gated to a reduced verified-input
scope, and Phase 6B has not started. Read the current decision record:
`docs/handoffs/2026-08-18_SMARAK_PHASE6A_RESEARCH_CLOSURE_RECONCILIATION.md`.

## 4. Start an AI session

Use [docs/handoffs/START_OF_SESSION_PROMPT.md](docs/handoffs/START_OF_SESSION_PROMPT.md).
It tells the assistant what to read, what to report, and that it must not code until the
user explicitly instructs it to proceed.

## 5. Work safely

- Work only on files owned by your role and allowed by the current phase.
- Reuse existing paths and abstractions from `docs/REPOSITORY_MAP.md`.
- Do not add features, providers, dependencies, random files, or duplicate services.
- Do not invent travel facts or provider capabilities.
- Keep AI orchestration separate from deterministic services.
- Keep Susmita's geospatial logic separate from Deeptiman's complete frontend.
- Keep Smarak's ranking/itinerary semantics separate from Rudra's backend/provider work.
- If the request conflicts with canonical documents, stop and report the conflict.

## 6. Test your work

```text
Backend:  cd backend && pytest
Frontend: cd frontend && npm test
```

If a test cannot run because an environment dependency is unavailable, report that
limitation. Never claim a passing result that was not observed.

For every meaningful task, create or update a Markdown task/session/phase report and a
handoff for dependent owners. Record files, decisions, tests, blockers, unresolved
questions, limitations, and the exact next action.

## 7. Finish and hand off

Use [docs/handoffs/END_OF_SESSION_PROMPT.md](docs/handoffs/END_OF_SESSION_PROMPT.md).
Create a session handoff from [docs/handoffs/TEMPLATE.md](docs/handoffs/TEMPLATE.md).
Update `docs/MEMORY.md` and `docs/REPOSITORY_MAP.md` only when actual project state or
paths changed. Record contract, architecture, ownership, tests, blockers, and incomplete
work honestly.

## 8. What not to do

Do not implement anything listed as out of scope in `docs/PRD.md`, anything forbidden
by the current phase, or anything marked `OPEN DECISION` without explicit approval.
