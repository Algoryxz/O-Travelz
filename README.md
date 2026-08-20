# O-Travelz — Whole-Odisha Travel & Transit Platform

O-Travelz is a transportation-aware destination exploration and trip-planning platform for the entire state of Odisha. It enables travelers, locals, students, and families to discover authentic destinations across all regions of Odisha and produce realistic single-day and multi-day itineraries with verified transportation hops, interactive maps, live weather context, and grounded conversational AI assistance.

The foundational principle is:

> **AI orchestrates and refines. It does not invent factual travel information.** All itineraries, places, coordinates, transit times, and weather data are grounded in verified sources.

---

## Key Features

- **Whole-Odisha Destination Catalog**: 81 verified places with 100% WGS84 coordinate coverage across 13 physical categories (`temple`, `monument`, `museum`, `market`, `park`, `lake`, `beach`, `nature`, `waterfall`, `wildlife`, `planetarium`, `sports_venue`, `science_center`).
- **Normalized Thematic Exploration**: 12 canonical traveler interests (`heritage`, `spirituality`, `architecture`, `food`, `culture`, `nature`, `beach`, `wildlife`, `waterfall`, `relaxation`, `adventure`, `shopping`) with exact deterministic matching.
- **Interactive Multi-Region Map**: Leaflet map canvas powered by backend-authoritative geospatial projection (`POST /map/v1/projection`) consuming PostGIS geometry.
- **Deterministic Itinerary Planner**: Multi-day sequencing with verified transit hops (walking, Mo Bus, Mo E-Ride, road/rail) and explicit data confidence tiers.
- **Cumulative Transit Timeline**: Minute-by-minute schedule calculating arrivals, departures, visit durations, and transfer times starting at 09:00 baseline.
- **Live Weather Integration**: Real-time temperature, condition, humidity, wind speed, and travel advice via isolated Open-Meteo backend service (`GET /weather/current`, `GET /weather/forecast`).
- **Grounded AI Copilot**: Natural language intent extraction to deterministic constraints with dynamic contextual refinement suggestions (*"Extend trip to 3 days"*, *"Start from Puri"*).
- **Client-Side Trip Persistence**: Instant trip archiving on *"New Trip"* and one-click restoration from *"Your Trips"* sidebar via `localStorage`.

---

## Canonical Documents

1. [docs/PRD.md](docs/PRD.md) — Product requirements and approved views.
2. [docs/RULES.md](docs/RULES.md) — Architectural rules and factuality constraints.
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Canonical system architecture and API boundaries.
4. [docs/MEMORY.md](docs/MEMORY.md) — Current project-state ledger.
5. [docs/RELEASE_READINESS_REPORT.md](docs/RELEASE_READINESS_REPORT.md) — Comprehensive release readiness audit.
6. [docs/REPOSITORY_MAP.md](docs/REPOSITORY_MAP.md) — Repository directory map and ownership.

---

## Running the Application Locally

### 1. Backend Setup (FastAPI + PostgreSQL/PostGIS)
```bash
# Activate virtual environment
.\.venv\Scripts\activate

# Run database migrations
alembic upgrade head

# Import canonical places and transit graph
python scripts/import_places.py
python scripts/import_transport.py

# Start FastAPI development server
uvicorn app.main:app --app-dir backend --reload --port 8000
```

### 2. Frontend Setup (React + Vite)
```bash
cd frontend

# Install dependencies (if needed)
npm install

# Run Vitest test suite (167 tests)
npm test

# Build production bundle
npm run build

# Start Vite dev server
npm run dev
```

---

## Testing & Quality Gate

```bash
# Run backend test suite (324 tests)
.venv\Scripts\pytest.exe backend/tests --basetemp=tmp/pytest_tmp -o cache_dir=tmp/pytest_cache

# Run frontend test suite (167 tests)
npm --prefix frontend test

# Run frontend production build
npm --prefix frontend run build

# Run backend python compilation check
python -m compileall -q backend

# Check git diff formatting
git diff --check
```

---

## Production Deployment

- **Frontend**: Static bundle in `frontend/dist` deployable to Vercel, Netlify, or Cloudflare Pages (`VITE_API_BASE_URL` points to backend API).
- **Backend**: Containerized via `backend/Dockerfile` and `infra/docker-compose.yml` deployable to Render, Fly.io, or AWS ECS (`DATABASE_URL`, `CORS_ORIGINS`, `WEATHER_PROVIDER=Open-Meteo`).
