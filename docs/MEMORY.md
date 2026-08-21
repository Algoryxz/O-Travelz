# O-Travelz Project Memory

**Status**: Canonical Current-State Ledger (Final Release Synchronization & Deployment Ready)

This is a project-state record, not general AI memory.

---

## 1. Current Release State Summary

- **Date**: August 20, 2026
- **Current Branch**: `main`
- **Overall Status**: **READY TO DEPLOY (Release Candidate Complete)**

### Verified Implementation Components:
- **Backend**: FastAPI (Python 3.12) REST API with Pydantic V2 typed contracts, deterministic ranking service, Dijkstra transport graph router, PostGIS geospatial projector, and Open-Meteo weather service.
- **Frontend**: React 18 + TypeScript + Vite responsive web application; interactive Leaflet map canvas, client-side trip history archive/restore, and contextual AI copilot.
- **Database**: PostgreSQL 16 + PostGIS extension with 81 canonical places, 13 physical categories, 12 normalized traveler interests, and 206 Place-Interest M:N associations.
- **Map Subsystem**: Single authoritative backend projection architecture (`POST /map/v1/projection`) consuming PostGIS geometry with graceful error, loading, and truthful empty states.
- **Itinerary Engine**: Deterministic ranking with exact-interest matching, transport-aware graph routing, and cumulative timeline scheduling with truthful unknown transit handling.
- **AI Copilot**: Rule-based intent extraction enforcing deterministic constraints; dynamic contextual suggestion generator; zero hallucinated facts.
- **Persistence**: Client-side trip snapshots with full restoration across duration, start hub, and canonical interests with defensive error handling.
- **Weather Integration**: Backend-isolated Open-Meteo weather adapter with WMO condition normalization, traveler advice, hub resolution, and live frontend UI widget.
- **Deployment Readiness**: Production Vite build clean; Docker Compose backend ready; Vercel SPA rewrite configuration in place.

---

## 2. Canonical Dataset & Taxonomy Invariants

- **Verified Places**: **81 canonical places** with 100% verified WGS84 coordinate coverage (81/81).
- **Physical Categories (13)**: `temple`, `monument`, `museum`, `market`, `park`, `lake`, `beach`, `nature`, `waterfall`, `wildlife`, `planetarium`, `sports_venue`, `science_center`.
- **Traveler Interests (12)**: `heritage`, `spirituality`, `architecture`, `food`, `culture`, `nature`, `beach`, `wildlife`, `waterfall`, `relaxation`, `adventure`, `shopping`.
- **Place-Interest Associations**: **206 verified M:N associations** (0 duplicate records).
- **Importer Idempotency**: [scripts/import_places.py](file:///c:/Users/smara/Desktop/o-travelz/scripts/import_places.py) runs with zero duplicate additions or unintended database growth on repeated execution.
- **Interest Provenance Precedence**: $\text{Explicit traveler-selected interests} \succ \text{genuine place.interests} \succ \text{empty } []$.
- **Category Separation**: Physical categories and thematic interests are strictly separated; zero synthetic category-to-interest conversions.

---

## 3. Quality Gate & Test Evidence

### Historical Release Baseline (August 20, 2026):
- **Backend Pytest**: **324 passed** / 0 failed across 26 test suites (`pytest backend/tests`).
- **Frontend Vitest**: **167 passed** / 0 failed across 20 test files (`npm --prefix frontend test`).
- **Production Build**: `npm --prefix frontend run build` completed with zero TypeScript/Vite errors (`dist/index.html` + css/js bundles).
- **Backend Python Compilation**: `python -m compileall -q backend` completed with 0 errors.
- **Git Diff Check**: `git diff --check` clean with 0 whitespace/conflict errors.
- **Smoke Suite**: [scratch/full_smoke_suite.py](file:///c:/Users/smara/Desktop/o-travelz/scratch/full_smoke_suite.py) verified live API, importer idempotency, AI planning, and weather endpoints with 100% pass rate.

### Current Post-Release & Deployment Verification (August 21, 2026):
- **Backend Pytest**: **324 passed** / 0 failed across 31 test files (`pytest backend/tests`).
- **Frontend Vitest**: **229 passed** / 0 failed across 28 test files (`npm run test`), including all 5 live full-stack E2E scenarios in `tests/e2e_scenarios.test.ts`.
- **Production Build**: `npm run build` completed cleanly with zero TypeScript/Vite errors (`built in 12.14s`, output in `frontend/dist/`).
- **Deployment Plan**: Standardized on **Render** (Managed PostgreSQL 16 + PostGIS, FastAPI Backend Web Service, React/Vite Static Site).
- **Railway Blocker**: Railway evaluated but blocked due to lack of PostGIS extension in default Postgres service.

---

## 4. Canonical Demo Scenarios

1. **Scenario 1 — The Odisha Heritage Triangle**:
   - Prompt: *"Plan a 2-day heritage trip in Bhubaneswar"*
   - Result: Deterministically parsed `days=2`, `start="Bhubaneswar"`, `interests=["heritage"]`, scheduling verified stops (Lingaraj Temple, Mukteswara Temple, Khandagiri Caves) with inter-stop transit.
2. **Scenario 2 — Architecture & Culinary Tour**:
   - Prompt: *"Plan a 2-day architecture and heritage trip in Bhubaneswar"*
   - Result: Deterministically parsed `interests=["heritage", "architecture"]`, routing through iconic temples and authentic food precincts (Ananda Bazar, Bapuji Nagar Food Corridor).
3. **Scenario 3 — Non-Canonical Safety**:
   - Prompt: *"Plan a photography trip"*
   - Result: Non-canonical `photography` interest is safely omitted without hallucination or runtime error.

---

## 5. Deployment Configuration (Render)

Refer to canonical guide: [docs/DEPLOYMENT.md](file:///c:/Users/smara/Desktop/o-travelz/docs/DEPLOYMENT.md).

- **Frontend (Static Site)**:
  - Root: `frontend`
  - Build command: `npm ci && npm run build`
  - Publish directory: `dist`
  - SPA Rewrite: `/*` -> `/index.html` (Rewrite)
  - Env: `VITE_API_BASE_URL`
- **Backend (Web Service)**:
  - Root: `.`
  - Python: 3.12
  - Build: `pip install -r backend/requirements.txt`
  - Start: `sh -c "alembic -c backend/alembic.ini upgrade head && python scripts/import_places.py && uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT"`
  - Env: `DATABASE_URL`, `ENVIRONMENT=production`, `CORS_ORIGINS`, `STORAGE_BACKEND=local`, `LOCAL_STORAGE_BASE_PATH=./data/images`
  - Health Endpoint: `GET /health`
- **Database (Managed PostgreSQL)**:
  - Version: PostgreSQL 16
  - Extensions: `postgis` (enabled automatically via `0001_initial_schema.py`)

---

## 6. Known Limitations

- Real-time GTFS transit vehicle positions are not modeled; transport hops utilize verified static/scheduled baseline speeds.
- Administrative district boundary GIS polygons are not modeled; long transfers are accurately labeled as `"Long Journey"`.

