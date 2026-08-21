# START HERE

This is the entry point for a new developer or AI assistant with no previous
conversation context.

## 1. Understand the product

Read:

1. [docs/PRD.md](docs/PRD.md) *(Product Requirements & Scope)*
2. [docs/RULES.md](docs/RULES.md) *(Canonical Rules & Factuality Constraints)*
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) *(System Architecture & API Boundaries)*
4. [docs/MEMORY.md](docs/MEMORY.md) *(Authoritative Current-State Ledger)*
5. [docs/PHASES.md](docs/PHASES.md) *(Canonical Phase Order, Acceptance Gates & Evidence)*
6. [docs/REPOSITORY_MAP.md](docs/REPOSITORY_MAP.md) *(Repository Paths & Ownership)*

These files are canonical. Supporting documents must not override them.

## 2. Current Project State

- **Phases 0–7 Complete & Validated**: Full-stack verification against live PostgreSQL/PostGIS, FastAPI backend, and React/Vite frontend completed with zero errors (**PHASE 7 STATUS: PASS**).
- **Verified Dataset**: 81 canonical places with 100% verified WGS84 coordinates across all 30 districts of Odisha, 13 physical categories, 12 traveler interests, 206 M:N associations.
- **Verified Test Counts**:
  - Backend Unit: **329 passed, 2 deselected** (`python -m pytest backend/tests`)
  - Backend Integration: **2 passed** (`python -m pytest -m integration`)
  - Frontend: **248 passed across 29 test files** (`npm --prefix frontend test -- --run`)
  - Production Build: `npm --prefix frontend run build` clean in ~7s with dynamic Leaflet code-splitting.
- **Live Local Stack**:
  - PostgreSQL 16 + PostGIS 3.4 on Docker host port `5433` (to avoid collision with host Windows Postgres on `5432`).
  - FastAPI Backend at `http://127.0.0.1:8000`.
  - Vite Frontend SPA at `http://localhost:5173`.

## 3. Quick Start (Team Developer Workflow)

### First-Time Machine Setup
```powershell
.\setup.ps1
```
*(Verifies prerequisites, creates Python `.venv`, installs dependencies, copies `.env`, starts Docker PostGIS on port 5433, applies migrations, and imports the 81 canonical places).*

### Normal Development Startup
```powershell
.\start.ps1
```
*(Starts Docker DB if needed, launches FastAPI on 8000, Vite on 5173, and avoids duplicate processes).*

### System Health & Diagnostics
```powershell
.\doctor.ps1
```

### Stop Development Stack
```powershell
.\stop.ps1
```

---

## 4. Find your role

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

## 5. Test commands

```powershell
# Backend unit tests
.\.venv\Scripts\python.exe -m pytest backend/tests

# Backend integration tests
.\.venv\Scripts\python.exe -m pytest -m integration

# Frontend tests
npm --prefix frontend test -- --run

# Frontend build
npm --prefix frontend run build

# Live stack audit
$env:PYTHONPATH="backend;scripts"; .\.venv\Scripts\python.exe scripts/phase7_full_stack_audit.py
```
