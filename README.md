# O-Travelz — Whole-Odisha Travel & Transit Platform

O-Travelz is a transportation-aware destination exploration and trip-planning platform covering all 30 districts of Odisha. It enables travelers, locals, students, and families to discover authentic destinations across all regions of Odisha and produce realistic single-day and multi-day itineraries with verified transportation hops, interactive maps, live weather context, and grounded conversational AI assistance.

The foundational principle is:

> **AI orchestrates and refines. It does not invent factual travel information.** All itineraries, places, coordinates, transit times, and weather data are grounded in verified sources.

---

## Key Features

- **Whole-Odisha Destination Catalog**: 81 verified places with 100% WGS84 coordinate coverage across all 30 districts of Odisha and 13 physical categories (`temple`, `monument`, `museum`, `market`, `park`, `lake`, `beach`, `nature`, `waterfall`, `wildlife`, `planetarium`, `sports_venue`, `science_center`).
- **Normalized Thematic Exploration**: 12 canonical traveler interests (`heritage`, `spirituality`, `architecture`, `food`, `culture`, `nature`, `beach`, `wildlife`, `waterfall`, `relaxation`, `adventure`, `shopping`) with 206 verified M:N associations and exact deterministic matching.
- **Interactive Multi-Region Map**: Leaflet map canvas powered by backend-authoritative geospatial projection (`POST /map/v1/projection`) consuming PostGIS geometry, dynamically code-split on demand.
- **URL Hash Navigation & Deep Links**: Direct URL hash routes (`/#discover`, `/#destinations`, `/#map`, `/#plan`, `/#saved`) with full browser Back/Forward synchronization and refresh state preservation.
- **Deterministic Itinerary Planner**: Multi-day sequencing with verified transit hops (walking, Mo Bus, road/rail), explicit data confidence tiers (`static`, `scheduled`, `live`), and a max 3 stops/day invariant.
- **Cumulative Transit Timeline**: Minute-by-minute schedule calculating arrivals, departures, visit durations, and transfer times starting at 09:00 baseline.
- **Live Weather Integration**: Real-time temperature, condition, humidity, wind speed, and travel advice via isolated Open-Meteo backend service (`GET /weather/current`, `GET /weather/forecast`).
- **Grounded AI Copilot**: Natural language intent extraction to deterministic constraints with dynamic contextual refinement suggestions and zero hallucinated facts (`POST /ai/plan`).
- **Client-Side Trip Persistence**: Instant trip archiving on *"New Trip"* and one-click restoration from *"Your Trips"* sidebar via `localStorage`.

---

## Canonical Documents

1. [docs/PRD.md](docs/PRD.md) — Product requirements and approved views.
2. [docs/RULES.md](docs/RULES.md) — Architectural rules and factuality constraints.
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Canonical system architecture and API boundaries.
4. [docs/design-system.md](docs/design-system.md) — Frontend Design System Specification & Token Source of Truth.
5. [docs/design-guardrails.md](docs/design-guardrails.md) — Permanent Design Guardrails & Anti-Pattern Rules.
6. [docs/frontend-architecture.md](docs/frontend-architecture.md) — React & TypeScript Frontend Architecture.
7. [docs/travel-intelligence.md](docs/travel-intelligence.md) — Travel Intelligence Engine & Deterministic Logistics.
8. [docs/ai-ux.md](docs/ai-ux.md) — AI UX Principles & Zero-Hallucination Boundaries.
9. [docs/frontend-contributing.md](docs/frontend-contributing.md) — Contributing & Styling Guidelines.
10. [docs/frontend-roadmap.md](docs/frontend-roadmap.md) — Frontend Feature Roadmap.
11. [docs/frontend-technical-debt.md](docs/frontend-technical-debt.md) — Technical Debt Log.
12. [docs/frontend-changelog.md](docs/frontend-changelog.md) — Frontend Evolution Changelog.
13. [docs/ai-provider-matrix.md](docs/ai-provider-matrix.md) — Source-Reconciled AI Provider Matrix & Fallbacks.
14. [docs/required-accounts.md](docs/required-accounts.md) — Mandatory vs Optional Accounts Matrix.
15. [docs/production-environment.md](docs/production-environment.md) — Master Environment Variable Matrix.
16. [docs/api-keys-and-services.md](docs/api-keys-and-services.md) — External Services & API Key Provisioning.
17. [docs/deployment.md](docs/deployment.md) — Production Deployment Architecture & Commands.
18. [docs/security.md](docs/security.md) — Security Audit & Hardening Guide.
19. [docs/production-runbook.md](docs/production-runbook.md) — Operations Manual, Backups & Incident Triage.

---

## Running the Application Locally

### Recommended Team Workflow (Single-Command)

```powershell
# 1. First-time setup (prerequisites, venv, dependencies, .env, docker db, migrations, places)
.\setup.ps1

# 2. Normal development startup (launches backend 8000 + frontend 5173 with reuse check)
.\start.ps1

# 3. System health & diagnostics
.\doctor.ps1

# 4. Stop development stack
.\stop.ps1
```

---

### Manual Granular Setup

#### 1. Database Setup (Docker PostGIS)
```powershell
# Start PostgreSQL 16 + PostGIS 3.4 container (port 5433)
docker compose -f infra/docker-compose.yml -p infra up -d db
```

#### 2. Backend Setup (FastAPI + PostgreSQL/PostGIS)
```powershell
# Run database migrations
$env:PYTHONPATH="backend"
.\.venv\Scripts\python.exe -m alembic -c backend/alembic.ini upgrade head

# Import canonical places and sync database images
.\.venv\Scripts\python.exe scripts/import_places.py
.\.venv\Scripts\python.exe scripts/sync_db_place_images.py

# Start FastAPI backend server (port 8000)
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

#### 3. Frontend Setup (React + Vite)
```powershell
# Install dependencies (if needed)
npm --prefix frontend install

# Start Vite dev server (port 5173)
npm --prefix frontend run dev
```

---

## Testing & Quality Gate

```powershell
# Run backend unit tests (329 passed)
.\.venv\Scripts\python.exe -m pytest backend/tests

# Run backend integration tests (2 passed)
.\.venv\Scripts\python.exe -m pytest -m integration

# Run frontend test suite (248 passed across 29 test files)
npm --prefix frontend test -- --run

# Run frontend production build (clean chunking in ~7s)
npm --prefix frontend run build

# Run backend python compilation check (0 errors)
.\.venv\Scripts\python.exe -m compileall backend scripts

# Run full-stack live audit against running stack
$env:PYTHONPATH="backend;scripts"; .\.venv\Scripts\python.exe scripts/phase7_full_stack_audit.py

# Check git diff formatting
git diff --check
```
