# Phase 8 — Demo Preparation and Scenario Rehearsal Handoff

## Task

Prepare, validate, and rehearse the approved reproducible demo scenarios for O-Travelz across the integrated local stack.

## Owner

Punam coordinates Phase 8 Demo Preparation with validation from all subsystem owners:
- Smarak: Core brain, ranking, deterministic itinerary logic, AI orchestration
- Akriti: Research, verification, places, sources, transport data
- Rudra: Backend, APIs, provider adapters, routing
- Susmita: Maps, geospatial projection, route lines
- Deeptiman: Frontend user experience, presentation slices, and state management

## Phase

Phase 8 — Demo preparation.

## Objective

Prepare and rehearse the approved, reproducible demo scenario; verify determinism and data honesty across repeated runs; confirm release readiness.

## Dependencies

- Phase 7 Integration and Release Readiness verification ([`docs/handoffs/2026-08-19_PUNAM_PHASE7_INTEGRATION_READINESS_HANDOFF.md`](file:///c:/Users/smara/Desktop/o-travelz/docs/handoffs/2026-08-19_PUNAM_PHASE7_INTEGRATION_READINESS_HANDOFF.md))
- Seed data: 32 verified places, 9 categories, 72 confirmed AMA stops, 95 routes, 193 schedule groups
- Verified services: PostgreSQL 16.4 / PostGIS 3.4 (`infra-db-1`), FastAPI (`app.main:app`), Vite frontend (`o-travelz-frontend`)

## Status

COMPLETE — Verdict: **READY WITH CANONICAL LIMITATIONS**

## Files Changed / Created

- `docs/handoffs/2026-08-19_PHASE8_DEMO_PREPARATION_HANDOFF.md` (this handoff document)
*(No application source code modified; implementation is demo-ready)*

## Exact Demo Scenario Rehearsed

The approved product journey from [`docs/PRD.md`](file:///c:/Users/smara/Desktop/o-travelz/docs/PRD.md):
1. **Initial Constraints Input**:
   - `days`: 2
   - `interests`: `["temples", "history"]`
   - `start`: `"Lingaraj Temple"`
2. **Deterministic Itinerary Generation (`POST /itinerary/plan`)**:
   - Generates 2-day itinerary (`itinerary-bf48e995581772ea0a20b850`).
   - Day 1: Bindu Sagar $\to$ Kalinga Stadium $\to$ Ananta Vasudeva Temple (3 stops, 3 hops).
   - Day 2: Baitala Deula $\to$ Bhaskareswar Temple $\to$ Chitrakarini Temple (3 stops, 2 hops).
   - `from_sequence=0` start origin sentinel is preserved.
   - Hops display `mode: "walk"`, `data_tier: "static"`, estimated durations, and ordered transit legs.
   - Explanation is empty facts-only output (`""`).
3. **Map Projection Synchronization (`POST /map/v1/projection`)**:
   - Projects 6 unique Place UUIDs and 5 hop contexts.
   - Emits 6 Point features with verified WGS84 coordinates (`[lon, lat]`), `geometry_status: "available"`.
   - Emits 5 hop relationships with preserved sequence and data-tier attributes.
   - `unavailable_items: []` (zero fabricated coordinates or synthetic routes).
4. **Conversational AI Refinement (`POST /ai/plan`)**:
   - Natural language prompt: *"Actually make it 2 days and include sports"*.
   - Evaluated with existing constraints.
   - AI orchestrator recalculates deterministic plan, returning grounded factual explanation referencing planned stops and estimated walk times.
   - Refined itinerary updates Day 1 to include `Kalinga Stadium`.
5. **Map Refresh on Refinement**:
   - Refined itinerary triggers projection query for updated stops and hops.
   - Map canvas updates with new verified coordinates and hop relationships.
6. **Structured Re-planning**:
   - Re-planning with `days: 3`, `interests: ["lake", "temples"]`, `start: "Lingaraj Temple"`.
   - Generates 3-day itinerary (`itinerary-192114151e43e86fdc15fa93`) with 8 stops and 6 hops.
   - Map projection automatically synchronizes to the 3-day schedule.
7. **Honest Error Handling**:
   - Submitting invalid constraints (`days: 0`, `interests: []`) returns honest HTTP 422 `validation_error`.
   - Structured error alert displayed; no fake fallback itinerary or map data is rendered.

## Exact Startup Commands

```bash
# 1. Start Database Container
docker-compose -f infra/docker-compose.yml up -d db

# 2. Start Backend API
cd backend
../.venv/Scripts/uvicorn app.main:app --host 127.0.0.1 --port 8000

# 3. Start Frontend Development Server
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

## Local-Stack Topology

- **Database**: `infra-db-1` (PostGIS 16-3.4) on `127.0.0.1:5432` (healthy).
- **Backend**: FastAPI on `http://127.0.0.1:8000` (healthy).
- **Frontend**: Vite on `http://127.0.0.1:5173` (healthy).

## Database / Data Readiness

- Verified Places: **32** (all 9 canonical categories present).
- Verified Stops: **72** (confirmed AMA bus stops).
- Verified Routes: **95** (confirmed AMA bus routes).
- Verified Schedule Groups: **193**.
- NULL coordinate semantics: 24 verified places and 72 AMA stops retain paired NULL locations with honest unavailable status.

## Backend Endpoint Verification

- `GET /health` $\to$ `200 OK` (`{"status":"ok"}`)
- `POST /itinerary/plan` $\to$ `200 OK` (structured deterministic itinerary)
- `POST /ai/plan` $\to$ `200 OK` (grounded `AIResponse` with tool-derived facts)
- `POST /map/v1/projection` $\to$ `200 OK` (Phase 6A V2 map contract with verified WGS84 points and hop relationships)

## Frontend Verification

- Production build succeeds without errors (`tsc && vite build`).
- Strongly typed `ApiClient` communicates with backend endpoints without contract mismatch.
- Screen-space SVG map presentation renders verified coordinates with zero client-side routing/geocoding.
- AI refinement panel, day sections, transport hop cards, data-tier badges, and error alert components render correctly.

## Live E2E Rehearsal Results & Determinism Audit

- Two consecutive end-to-end rehearsal passes were executed against the running local stack.
- Results comparison between Run 1 and Run 2:
  - Day 1 Stop Sequences: **100% Exact Match**
  - Day 2 Stop Sequences: **100% Exact Match**
  - Point Coordinate Geometry: **100% Exact Match**
  - AI Refinement Output: **100% Exact Match**
  - Re-plan Days Count: **100% Exact Match**
- **Conclusion**: Demo scenario is 100% deterministic and reproducible.

## AI Refinement $\to$ Map Synchronization Result

- Updating constraints via AI natural language query triggers an updated projection query.
- Previous map markers are replaced with the refined stop coordinates.
- No stale or fabricated geometry remains.

## Re-Plan $\to$ Map Synchronization Result

- Form constraint modification updates the itinerary schedule and refreshes the map canvas in real time.

## Error-State Result

- Constraint validation violations (such as `days: 0`) return structured HTTP 422 errors.
- UI displays the structured error message (`ApiError 422 validation_error`) without creating synthetic fallback data.

## Automated Test Results

- **Backend Pytest Suite (`pytest backend`)**: **231 passed, 1 warning** (Pydantic V2 class-based config deprecation warning; 0 failures).
- **Frontend Vitest Suite (`npm test`)**: **62 passed** (8 test suites, 0 failures).
- **Live Rehearsal Suite**: **All steps and determinism assertions passed**.

## Build Result

- **Frontend Production Build (`npm run build`)**: **SUCCESS** (`tsc && vite build`).
  - `dist/index.html` (0.53 kB)
  - `dist/assets/index-sDgb3yLm.css` (37.58 kB)
  - `dist/assets/index-CFR4xG-t.js` (188.79 kB)

## Lint Result

- No separate `lint` script is defined in `frontend/package.json`. TypeScript type checking is strictly enforced by `tsc` during `build` and passed with 0 errors.

## `git diff --check` Result

- **Exit Code: 0** (No whitespace or line-ending errors).

## Known Canonical Limitations

1. **AI Provider**: Offline rule-based model adapter is active; commercial LLM provider integration remains deferred.
2. **Authoritative Transit Geometry**: Road transit hops display `provider_geometry_unavailable` with honest `geometry: null`.
3. **AMA & Route 12 Scope**: AMA coordinates and Route 12 topology remain excluded pending an authoritative cross-system identity crosswalk.
4. **Local Infrastructure Topology**: Frontend runs via Vite development server / preview rather than a containerized Docker service (as recorded in canonical open decisions).

## Blockers

None.

## Exact Next Action

Deliver the Phase 8 reproducible demo using the documented script and startup procedure. Maintain the approved scope and feature freeze.
