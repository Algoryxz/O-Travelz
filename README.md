# O-Travelz

O-Travelz is a transportation-aware trip-planning system for exploring a city, starting
with Bhubaneswar/Odisha. It produces realistic day and multi-day itineraries grounded in
verified places and transportation data.

The core rule is:

> AI orchestrates. It does not invent factual travel information.

## Start here

Read [START_HERE.md](START_HERE.md), then read the six canonical documents:

1. [docs/PRD.md](docs/PRD.md) — approved product scope and feature freeze.
2. [docs/RULES.md](docs/RULES.md) — rules for people and AI assistants.
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — canonical architecture and ownership.
4. [docs/PHASES.md](docs/PHASES.md) — phase order and completion gates.
5. [docs/MEMORY.md](docs/MEMORY.md) — current project-state ledger.
6. [docs/REPOSITORY_MAP.md](docs/REPOSITORY_MAP.md) — actual paths and ownership.

Then read the relevant file in `docs/team/` and its build guide in
`docs/O-Travelz_Build_Guides/docs/build-guides/`.

## Repository areas

- `backend/` — FastAPI, database models, contracts, and later deterministic/backend
  services.
- `frontend/` — React + TypeScript + Vite frontend and tests.
- `data/` — sourced, human-verified research input.
- `docs/` — canonical context, supporting design detail, team guidance, and handoffs.
- `scripts/` — data validation/import workflow.
- `infra/` — reproducible local infrastructure configuration.

## Ownership

| Person | Ownership |
|---|---|
| Smarak | Core brain, database, data semantics, ranking, itinerary logic, AI orchestration |
| Akriti | Research, verification, places, sources, transport research |
| Rudra | Backend, APIs, external integrations, providers, routing |
| Susmita | Maps, geospatial, routes, route lines, multimodal visualization |
| Deeptiman | Complete frontend and user experience |
| Punam | Documentation, context, phases, evidence, demo, presentation, release readiness |

## Current phase

Phase 0 foundation and final repository preparation are complete for the approved scope.
Phase 1+ implementation remains gated by `docs/PHASES.md` and the open decisions in
`docs/MEMORY.md`.

## Session workflow

- Start an AI session with `docs/handoffs/START_OF_SESSION_PROMPT.md`.
- Work only in the current phase and owned paths.
- Run relevant tests and report limitations honestly.
- Finish with `docs/handoffs/END_OF_SESSION_PROMPT.md` and a handoff based on
  `docs/handoffs/TEMPLATE.md`.
- Use `docs/phases/PHASE_COMPLETION_TEMPLATE.md` only for a verified phase review.

Do not add product features, providers, dependencies, files, or abstractions because
they seem useful. If a request conflicts with the canonical documents, stop and report
the conflict.
