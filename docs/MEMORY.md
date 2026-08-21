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

### Current Post-Release Verification (August 21, 2026):
- **Backend Pytest**: **324 passed** / 0 failed across 31 test files (`pytest backend/tests`).
- **Frontend Vitest**: **188 total tests** across 23 test files (**183 passed**, **5 skipped**; the 5 skipped tests are live full-stack E2E scenarios in `tests/e2e_scenarios.test.ts` requiring a running backend on port 8000).
- **Production Build**: `npm --prefix frontend run build` completed cleanly with zero TypeScript/Vite errors (`built in 12.18s`, output in `frontend/dist/`).

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

## 5. Deployment Configuration

- **Frontend**:
  - Build command: `npm run build`
  - Output: `frontend/dist`
  - Target: Vercel / Netlify / Cloudflare Pages
  - Routing: [frontend/vercel.json](file:///c:/Users/smara/Desktop/o-travelz/frontend/vercel.json)
  - Env: `VITE_API_BASE_URL`
- **Backend**:
  - Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
  - Python: 3.12
  - Target: Docker / Render / Fly.io / AWS ECS
  - Env: `DATABASE_URL`, `ENVIRONMENT=production`, `CORS_ORIGINS`, `WEATHER_PROVIDER=Open-Meteo`, `WEATHER_BASE_URL=https://api.open-meteo.com/v1/forecast`
  - Health Endpoint: `GET /health`

---

## 6. Known Limitations

- Real-time GTFS transit vehicle positions are not modeled; transport hops utilize verified static/scheduled baseline speeds.
- Administrative district boundary GIS polygons are not modeled; long transfers are accurately labeled as `"Long Journey"`.
