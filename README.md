# O-Travelz — Whole-Odisha Travel & Transit Platform

O-Travelz is a transportation-aware destination exploration and trip-planning platform for the entire state of Odisha. It enables travelers, locals, students, and families to discover authentic destinations across all regions of Odisha and produce realistic single-day and multi-day itineraries with verified transportation hops, interactive maps, and grounded conversational AI assistance.

The foundational principle is:

> AI orchestrates and refines. It does not invent factual travel information. All itineraries, places, and coordinates are grounded in verified data.

---

## Key Features

- **Whole-Odisha Destination Catalog**: 50+ verified places across Coastal, Central, Southern Hills & Lakes, Western, Northern, and Tribal Highland zones of Odisha with official descriptions, real coordinates, visit durations, and price tiers.
- **Dedicated All Destinations View**: Filter by geographical region, category, or real-time search term.
- **Authoritative Place Details Modal**: Verified facts, high-res travel photography, entry tier, visit durations, and direct actions to Save, View on Map, or Plan Trip Here.
- **Interactive Multi-Region Map**: State-wide dynamic SVG map canvas adapting bounds across longitudes 81°E–87.5°E and latitudes 17.5°N–22.5°N.
- **Deterministic Itinerary Planner**: Multi-day sequencing with transport hops (walking, Mo Bus, Mo E-Ride) and explicit data confidence tiers (static, scheduled, live).
- **Grounded AI Copilot**: Multi-turn conversational planning recognizing regional destinations across Odisha with honest clarification prompts.
- **Lightweight Client Persistence**: Saved places and multi-turn trip histories persist in the browser via `localStorage` with zero account barriers.

---

## Canonical Documents

1. [docs/PRD.md](docs/PRD.md) — Product requirements and approved views.
2. [docs/RULES.md](docs/RULES.md) — Architectural rules and factuality constraints.
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Canonical system architecture and API boundaries.
4. [docs/PHASES.md](docs/PHASES.md) — Build phases and completion criteria.
5. [docs/MEMORY.md](docs/MEMORY.md) — Current project-state ledger.
6. [docs/REPOSITORY_MAP.md](docs/REPOSITORY_MAP.md) — Repository directory map and ownership.

---

## Repository Structure

- `backend/` — FastAPI backend with `GET /places`, `POST /itinerary/plan`, `POST /ai/plan`, `POST /map/v1/projection`.
- `frontend/` — React 18 + TypeScript + Vite responsive frontend application.
- `data/` — Sourced, verified place and transportation research data.
- `docs/` — Canonical architecture, requirements, phase records, and handoffs.
- `scripts/` — Deterministic data validation and database import scripts.

---

## Running the Application Locally

### Backend Setup
```bash
# Activate virtual environment
.\.venv\Scripts\activate

# Validate and import verified places into database
python scripts/import_places.py

# Start FastAPI development server
uvicorn app.main:app --app-dir backend --reload --port 8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies (if needed)
npm install

# Run Vitest test suite
npm test

# Build production bundle
npm run build

# Start Vite dev server
npm run dev
```
