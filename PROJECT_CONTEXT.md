# O-TRAVELZ PROJECT CONTEXT

> **Canonical shared context for all AI coding assistants.**
> This is the single source of truth for project background, architecture, and operating rules.
> All other tool-specific files (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `AGENTS.md`) point here.
> Do NOT duplicate this content in tool-specific files.

---

## Project

O-TRAVELZ is an Odisha-focused intelligent travel planning and mobility platform.

It combines:

- Verified Odisha destinations across all 30 districts
- Nearby discovery using geospatial distance calculation
- Constraint-aware itinerary planning
- Multimodal mobility intelligence (public transit vs private options)
- CRUT / Ama Bus schedule, route, and stop research
- Live weather via Open-Meteo
- Multilingual AI interpretation (English, Odia, Hindi)
- Resilient offline/static fallbacks for all major data layers

**Current priority**: SOA IDEATHON 2026 — ROUND 2

Round 1 is complete. The team has qualified for Round 2.
This is NOT a greenfield project. Do NOT rebuild from scratch.

---

## Round 2 Goals

- Working, reliable, demo-ready implementation
- Visible improvements over Round 1
- Honest, technically defensible functionality
- Novelty grounded in real verified data

Prototype quality comes before PPT polish.

---

## Repository Layout

```
/
├── backend/           FastAPI + SQLAlchemy + PostGIS backend
│   ├── app/
│   │   ├── ai/        Multi-provider AI adapter, conversation orchestrator, tools
│   │   ├── api/       HTTP route handlers
│   │   ├── models/    SQLAlchemy ORM models
│   │   ├── schemas/   Pydantic schemas
│   │   ├── services/  Domain services (itinerary, search, auth, weather, etc.)
│   │   └── transport/ Transit engine, planner, importer
│   └── alembic/       Database migrations
├── frontend/          React + TypeScript + Vite + Tailwind + Leaflet
│   └── src/
│       ├── api/       API client layer
│       ├── components/
│       ├── data/      Bundled fallback datasets (places, transit stops, essentials)
│       ├── pages/
│       └── utils/
├── data/
│   ├── places/        Canonical place records (places.json — 161 records)
│   ├── images/        Image manifest, sources, audit data
│   ├── transport/     Static/canonical transit data (ama_bus.json, schedules, fares)
│   └── research/      Research artifacts, transit extraction outputs (do not publish directly)
├── scripts/           Utility/pipeline scripts
├── tests/             Backend pytest tests
├── docs/              Documentation index
├── PROJECT_CONTEXT.md ← THIS FILE — canonical shared context
├── AGENTS.md          Operational rules for AI coding tools
├── ROUND2_PLAN.md     Ordered implementation checkpoints
├── SYSTEM_DESIGN.md   Service boundary documentation
├── DATA_QUALITY.md    Publishability and image pipeline rules
├── TRANSIT_DATA.md    Transit data model and canonical stop/route specification
└── DEMO_RUNBOOK.md    Demo startup and fallback procedures
```

---

## Current Architecture

### Frontend

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Leaflet** for interactive maps
- Hash-based routing (`#discover`, `#destinations`, `#map`, `#plan`, `#saved`, `#signin`)

Major product surfaces:

| Surface | File(s) |
|---|---|
| Home / Discovery | `frontend/src/pages/DemoHome.tsx` |
| Destinations catalog | `frontend/src/pages/stitch/StitchDestinationsPage.tsx` |
| Interactive map | `frontend/src/pages/stitch/StitchMapPage.tsx` |
| Itinerary planner | `frontend/src/pages/ItineraryPlannerPage.tsx` |
| AI Copilot | Floating drawer in `DemoHome.tsx` |
| Saved places | localStorage-backed |

**Local fallback datasets** (used when backend is unavailable):

| Dataset | File | Records |
|---|---|---|
| Place catalog | `frontend/src/data/` via `data/places/places.json` | 161 places |
| Essential facilities | `frontend/src/data/odishaEssentials.ts` | 234 records |
| Transit stops | `frontend/src/data/staticTransitStops.ts` | ~46 stops with verified coords |
| Timetables | `frontend/src/data/transitTimetables.ts` | Schedule lookup |

---

### Backend

- **FastAPI** + **Pydantic**
- **SQLAlchemy** ORM + **PostGIS** spatial extension
- **Alembic** database migrations
- Environment: Docker PostGIS (port 5433) or native PostgreSQL (port 5432)

Major service areas:

| Area | Module |
|---|---|
| Places | `backend/app/api/places_routes.py`, `backend/app/services/search/` |
| Itinerary | `backend/app/api/itinerary_routes.py`, `backend/app/services/itinerary/` |
| Transit | `backend/app/api/transport_routes.py`, `backend/app/transport/` |
| AI | `backend/app/api/ai_routes.py`, `backend/app/ai/` |
| Weather | `backend/app/api/weather_routes.py` |
| Auth | `backend/app/api/auth_routes.py` |
| Sync/Share | `backend/app/api/sync_routes.py`, `backend/app/api/share_routes.py` |

---

### AI Provider Architecture

```
Azure OpenAI
  → Google Gemini
    → NVIDIA NIM
      → Groq
        → Rule-based / Deterministic fallback
```

**AI must NOT be considered the factual source of truth.**

AI is responsible for:

- User intent parsing
- Multilingual interpretation (English, Odia, Hindi)
- Conversational interaction
- Explanation and refinement of plans

Deterministic services and verified datasets own:

- Coordinates
- Place metadata and opening hours
- Transit stop names, coordinates, route numbers
- Schedules and departure times
- Factual itinerary construction

---

## Verified Product Truth

### Nearby Discovery

Geographic proximity sorting uses Haversine distance. This works correctly.
A Bhubaneswar reference coordinate (20.2961°N, 85.8245°E) correctly surfaces Bhubaneswar places before distant Odisha places.
**Preserve this behavior.**

### Weather

Open-Meteo is integrated for live weather. No API key required.
The weather widget shows live data when online and degrades gracefully when offline.

### Transit / Mo Bus / Ama Bus

**What exists:**
- 154 CRUT routes verified from official documents (effective 2026-08-21)
- 1,361 stop names extracted from official documents
- 17 stops with confirmed OSM Nominatim coordinates
- 1,344 stops with `coordinate_status: "unresolved"` — no coordinates yet
- ~46 stops with verified coordinates in frontend production data
- 5,553 trip departures validated from official schedule documents; 0 malformed
- Fares: NOT IMPLEMENTED (`amount_inr: null` universally)

**What does NOT exist:**
- Integrated real-time CRUT vehicle GPS telemetry
- Live bus arrival data
- Confirmed per-stage fares

**Required language:**

| Use | Never use |
|---|---|
| "Scheduled departure" | "Live bus location" |
| "Published timetable" | "Real-time tracking" |
| "Estimated arrival from timetable" | "Live arrival" |
| "Verified stop" | "GPS-tracked stop" |
| "Fare subject to CRUT stage fare order" | Any invented ₹ fare |

### Image Identification

The `/ai/identify-place` endpoint uses `LANDMARK_VISUAL_SIGNATURES` — a keyword/filename/metadata heuristic matching table in `backend/app/ai/image_classifier.py`.
**It is NOT a neural vision classifier or computer-vision model.**
Do not describe it as "AI vision recognition" or "neural image recognition."

### Restaurant Ratings

All restaurant/food facility ratings in `frontend/src/data/odishaEssentials.ts` are static researched values (e.g., sourced Aug 2026 from Google Maps).
They are NOT live rating feeds.
Use: `"Researched benchmark rating"` — not `"live rating"`.

---

## Hard Destination Quality Rule

> **NO VERIFIED IMAGE = NO PUBLIC DESTINATION**

A destination may remain in research/staging indefinitely, but must NOT appear in the production catalog unless it has:

- Verified coordinates (within Odisha bounding box: lat 17.8–22.6, lon 81.4–87.5)
- Valid district (one of 30 official Odisha districts)
- Category (from approved taxonomy)
- Meaningful description (≥ 50 characters, factual)
- Source / provenance URL or document reference
- At least one high-quality verified image passing the image validation pipeline

Do not use generic placeholder images or logo images to satisfy this rule.

---

## Data Architecture

Separate **research inventory** from **publishable production catalog**.

```
Source data
  → ingest (data/research/round2/{eastern,western,southern,northern}/)
    → normalize
      → deduplicate
        → coordinate verification
          → image acquisition
            → image validation
              → completeness validation
                → publishability gate
                  → production catalog (data/places/places.json)
```

Regional research contributions go to `data/research/round2/`. Production catalog promotion is handled only after automated validation, image verification, and core-team review. See [`ROUND2_TEAM.md`](ROUND2_TEAM.md) for team ownership and regional assignments.

Records that fail any required gate stay in `staging/research`. They must not appear in the public product.

**Quality > raw record count.**

---

## Image Pipeline Rules

See `DATA_QUALITY.md` for full details.

Summary of validation gates (all deterministic, no AI dependency):

| Gate | Pass Condition |
|---|---|
| File validity | Valid JPEG / PNG / WebP |
| Minimum dimensions | ≥ 800×450 pixels |
| Aspect ratio | 0.5 – 3.0 |
| File size | 50 KB – 25 MB |
| SHA256 not blacklisted | Not in `rejected_candidates.json` |
| Source domain | Wikimedia Commons, OTDC, ASI, official government sources |
| Relevance | Filename / title / Wikimedia metadata matches destination |

Accepted destinations should have canonical variants: `hero.webp`, `card.webp`, `thumbnail.webp`.

---

## Transit Direction

See `TRANSIT_DATA.md` for full data model.

**One canonical transit source of truth.** Frontend fallback data must be generated from or directly consume the canonical transit files.

Do not maintain a separate backend transit universe and a separate frontend transit universe.

---

## Primary Round 2 Novelty

**Smart Multimodal Transit Alternative**

For an itinerary leg where the verified transit graph supports it, compare:

**Private option:**
- Haversine-based estimated road distance and duration

**Public transit option:**
- Verified boarding stop (from canonical stop registry)
- Verified CRUT route number
- Exit stop
- Walking distance to boarding stop
- Next scheduled departure (from published timetable)
- Estimated total transit duration
- Provenance and confidence label

If no verified transit connection exists for a leg:
> `No verified public-transit option is currently available for this leg.`

Do NOT fabricate a bus recommendation because a nearby stop exists. The transit graph must actually support the leg.

---

## Resilience Levels

| Level | Condition | Behavior |
|---|---|---|
| L1 — Full Live | All services healthy | All features active |
| L2 — AI Degraded | AI provider timeout / error | Rule-based planner; "Using offline recommendations" banner |
| L3 — Backend Degraded | Backend unreachable (HTTP 503) | Frontend serves bundled local datasets |
| L4 — Demo Safe Mode | `?demo=true` URL param | Force local fallbacks, disable OAuth, show demo badge |

No fallback mode should be presented as live data.

---

## Known P0 Bug (as of 2026-08-31 — verify at HEAD before fixing)

A confirmed crash path existed in `backend/app/ai/conversation.py` where `grounded_msg` could be used before assignment on a no-tool conversational path (e.g., a greeting), causing `UnboundLocalError`.

**Before touching related code:**
1. Inspect current HEAD to determine if it has already been fixed.
2. If already fixed, ensure regression coverage exists.
3. If still present, the fix is: initialize `grounded_msg` to a safe fallback value before the conditional assignment block.

Never assume stale documentation means the bug is still present. Inspect first.

---

## System Design Principle

```
UI
  → Orchestration Layer
    → Domain Services
      → Canonical Data / Verified Providers
```

Do not place business logic directly inside React components when it belongs in domain services.
Do not perform large architectural rewrites purely for cleanliness — only when it improves correctness, reliability, testability, or Round 2 delivery.

---

## Development Rules

**Before modifying code:**
1. Inspect current HEAD of relevant files.
2. Understand existing implementation.
3. Check recent Git history when relevant.
4. Make the smallest safe change that achieves the goal.

**After modifying code:**
1. Run focused tests for the changed module.
2. Run relevant broader test suites.
3. Run TypeScript build check (`tsc`) after frontend changes.
4. Inspect the diff.
5. Leave the repository in a runnable state.

Do not silently delete or downgrade working functionality.

---

## Git Rules

- Prefer small, atomic commits.
- Every major commit must leave the app runnable.
- Never rewrite large areas without a rollback path.
- Do not commit `.env` files or secrets.
- Do not commit temporary analysis output without a documented reason.

---

## Truthfulness Rules

Never present the following as live verified functionality unless genuinely implemented:

- Mocked results
- Simulated GPS positions
- Static ratings as live ratings
- Heuristic matching as neural vision
- Estimated routing as GPS navigation

Prefer explicit labels:

`Verified` · `Scheduled` · `Estimated` · `Researched` · `Live` · `Fallback` · `Curated`

---

## Demo Philosophy

The Round 2 story:

```
DISCOVER  →  Verified Odisha destinations
PLAN      →  Grounded, constraint-aware itinerary
WHY       →  Explainable recommendations
MOVE      →  Verified mobility alternatives (multimodal)
ADAPT     →  Graceful degradation and contextual adjustment
```

Show working functionality — do not describe functionality that does not exist.

---

## Round 1 Judge Feedback

Actual Round 1 judge feedback must be added to this section when received.

**Never invent judge comments.**

*(Awaiting feedback — add here when available)*
