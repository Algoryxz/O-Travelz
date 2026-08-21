# O-Travelz Project Memory

**Status**: Canonical Current-State Ledger (Phase 10 UX, Privacy, Legal & Team Reproducibility Baseline)

This is a project-state record, not general AI memory.

---

## 1. Current Release State Summary

- **Date**: August 21, 2026
- **Current Branch**: `release/stable-baseline` (or `main`)
- **Current Phase**: **PHASE 10B READY — PASS (Production Infrastructure & Deployment Specification)**

### Verified Implementation Components:
- **Backend**: FastAPI (Python 3.12) REST API at `http://127.0.0.1:8000` with Pydantic V2 typed contracts, deterministic ranking engine, Dijkstra transport graph router, PostGIS geospatial projector, Open-Meteo weather service, and static WebP image proxy.
- **Frontend**: React 18 + TypeScript + Vite responsive SPA at `http://localhost:5173`; single intentional dark visual theme; First-Launch Terms & Privacy Consent Gate (`CURRENT_TERMS_VERSION = "2026-08-21-v1"`, localStorage key `otz_terms_accepted_version`); persistent Live Location header control with 4 distinct states; 2-step geolocation consent flow; Indian DPDP Act 2023 aligned Privacy Policy (`#privacy`), Terms & Conditions (`#terms`), and Contact/Grievance (`#contact`) pages; 12 vibrant canonical traveler interest buttons; dark map details drawer; URL hash navigation (`#discover`, `#destinations`, `#map`, `#plan`, `#saved`, `#privacy`, `#terms`, `#contact`).
- **Database**: PostgreSQL 16 + PostGIS 3.4 running in Docker (host port `5433` to avoid collision with Windows host Postgres on `5432`) with 81 canonical places, 13 physical categories, 12 normalized traveler interests, 206 Place-Interest M:N associations, and 50 synchronized database image records.
- **Developer Reproducibility Suite**: Single-command bootstrapping (`.\setup.ps1`), local dev supervisor (`.\start.ps1`), clean shutdown (`.\stop.ps1`), and comprehensive environment diagnostic doctor (`.\doctor.ps1`) verified 11/11 PASS.
- **30-District & Region Taxonomy**: Authoritative 30-district mapping of Odisha with deterministic district-to-region derivation (`backend/app/core/regions.py` and `frontend/src/utils/regionUtils.ts`). Alembic migration `0007_add_place_district` applied.
- **Map Subsystem**: Backend-authoritative projection architecture (`POST /map/v1/projection`) consuming PostGIS geometry with graceful error, loading, and truthful empty states.
- **Itinerary Engine**: Deterministic ranking with exact-interest matching, transport-aware graph routing, cumulative timeline scheduling, and max 3 stops/day invariant.
- **AI Copilot**: Grounded intent understanding via `RuleBasedModelAdapter` enforcing deterministic tool constraints; dynamic contextual suggestion generator; zero hallucinated facts.
- **Persistence**: Client-side trip snapshots with full restoration across duration, start hub, and canonical interests with defensive error handling in `localStorage`.
- **Weather Integration**: Backend-isolated Open-Meteo weather adapter (`GET /weather/current`, `GET /weather/forecast`) with WMO condition normalization, traveler advice, hub resolution, and live frontend UI widget.

---

## 2. Canonical Dataset & Taxonomy Invariants

- **Verified Places**: **81 canonical places** with 100% verified WGS84 coordinate coverage (81/81) across all 30 districts of Odisha.
- **Physical Categories (13)**: `temple`, `monument`, `museum`, `market`, `park`, `lake`, `beach`, `nature`, `waterfall`, `wildlife`, `planetarium`, `sports_venue`, `science_center`.
- **Traveler Interests (12)**: `heritage`, `spirituality`, `architecture`, `food`, `culture`, `nature`, `beach`, `wildlife`, `waterfall`, `relaxation`, `adventure`, `shopping`.
- **Place-Interest Associations**: **206 verified M:N associations** (0 duplicate records).
- **Importer Idempotency**: [scripts/import_places.py](file:///c:/Users/smara/Desktop/o-travelz/scripts/import_places.py) runs with zero duplicate additions on repeated execution.
- **Interest Provenance Precedence**: $\text{Explicit traveler-selected interests} \succ \text{genuine place.interests} \succ \text{empty } []$.
- **Category Separation**: Physical categories and thematic interests are strictly separated; zero synthetic category-to-interest conversions.

---

## 3. Current Quality Gate & Test Evidence

- **Backend Pytest**: **329 passed, 2 deselected** across 31 test files (`python -m pytest backend/tests`).
- **Backend Integration**: **2 passed** against live PostgreSQL/PostGIS container (`python -m pytest -m integration`).
- **Frontend Vitest**: **270 passed** across 31 test files (`npm --prefix frontend test -- --run`), including:
  - 12 First-Launch Terms & Privacy Consent Gate tests (`frontend/tests/consent_gate.test.tsx`)
  - 10 Phase 10 UX, Privacy, Legal & Map test cases (`frontend/tests/phase10_ux_privacy_legal.test.tsx`)
  - 19 URL synchronization and deep link tests (`frontend/tests/url_hash_sync.test.tsx`)
  - 5 full-stack live E2E scenarios against running backend (`frontend/tests/e2e_scenarios.test.ts`)
- **Frontend Production Build**: `npm --prefix frontend run build` completed in **9.08s** with 0 errors.
- **Python Syntax & Compilation**: `python -m compileall backend scripts` completed with 0 errors.
- **Git Diff Formatting Check**: `git diff --check` passed cleanly with 0 whitespace errors.
- **System Diagnostics**: `.\doctor.ps1` completed with 11/11 PASS (`RESULT: READY`).

---

## 4. Historical Test Baselines (For Reference)

- **Historical Release Baseline (August 20, 2026)**:
  - Backend: 324 passed / 0 failed
  - Frontend: 167 passed / 0 failed
- **Historical Post-Release Baseline (August 21, 2026 Morning)**:
  - Backend: 324 passed / 0 failed
  - Frontend: 229 passed / 0 failed
- **Phase 7 Integration Baseline (August 21, 2026 Evening)**:
  - Backend: 329 passed / 2 deselected + 2 integration passed = 331 total tests
  - Frontend: 248 passed / 0 failed across 29 test files

---

## 5. Local Runtime & Development Setup

- **PostgreSQL / PostGIS**: Docker container `infra-db-1` running PostGIS 3.4.3 on host port `5433` (mapped from container `5432` to prevent collision with Windows native PostgreSQL).
  - Connection string: `postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz`
- **FastAPI Backend**:
  ```powershell
  $env:PYTHONPATH="backend"
  .\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
  ```
- **Vite Frontend**:
  ```powershell
  npm --prefix frontend run dev
  ```
- **Database Migration & Data Seeding**:
  ```powershell
  $env:PYTHONPATH="backend"
  .\.venv\Scripts\python.exe -m alembic -c backend/alembic.ini upgrade head
  .\.venv\Scripts\python.exe scripts/import_places.py
  .\.venv\Scripts\python.exe scripts/sync_db_place_images.py
  ```

---

## 6. Canonical Demo Scenarios

1. **Scenario 1 — The Odisha Heritage Triangle**:
   - Prompt: *"Plan a 2-day heritage trip in Bhubaneswar"*
   - Result: Deterministically parsed `days=2`, `start="Bhubaneswar"`, `interests=["heritage"]`, scheduling verified stops with inter-stop transit hops and timeline schedule.
2. **Scenario 2 — Architecture & Culinary Tour**:
   - Prompt: *"Plan a 2-day architecture and heritage trip in Bhubaneswar"*
   - Result: Deterministically parsed `interests=["heritage", "architecture"]`, routing through iconic temples and authentic food precincts (Ananda Bazar, Bapuji Nagar, Salepur Rasagola).
3. **Scenario 3 — Non-Canonical Safety**:
   - Prompt: *"Plan a photography trip"*
   - Result: Non-canonical `photography` interest is safely handled via clarification without hallucination or runtime error.

---

## 7. Known Limitations

- Real-time GTFS transit vehicle telemetry is unmodeled; transport hops utilize verified static/scheduled baseline speeds.
- Administrative district boundary GIS polygons are not modeled in map canvas; long transfers are accurately labeled as `"Long Journey"`.
