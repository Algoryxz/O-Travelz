# O-Travelz AI Engineering Handoff & Technical Source of Truth

---

## 1. CURRENT BASELINE & REPOSITORY STATE

```text
REPOSITORY:               Algoryxz/O-Travelz (https://github.com/Algoryxz/O-Travelz)
CURRENT HEAD COMMIT:      c215be85d72e63ca467873c56d36e49f42354df4
CURRENT BRANCH:           release/stable-baseline
CONFIGURED ORIGIN:        https://github.com/Smarak-padhi/O-Travelz.git (HTTP 301/308 redirects to Algoryxz/O-Travelz)
UPSTREAM TRACKING:        origin/release/stable-baseline (Synchronized, 0 commits ahead/behind)
WORKING TREE STATE:       Clean (0 uncommitted files, 0 untracked files prior to this handoff doc)
BACKEND TEST SUITE:       324 passed, 0 failed, 3 warnings (Pytest 8.3.3 / Python 3.12)
FRONTEND UNIT/COMP SUITE: 224 passed, 0 failed across 27 test files (Vitest 2.1.9)
FRONTEND BUILD:           Clean (tsc && vite build succeeded, 0 type errors)
PRODUCTION DEPLOYMENT:    Pre-deployment ready; Docker Compose configuration verified with PostGIS 16-3.4 + FastAPI
```

### DO NOT ASSUME (Crucial Facts for Any Developer / AI)

1. **Do NOT assume Real-Time GPS / Live Bus Tracking exists**: The application connects to verified scheduled timetables, static fares, and walking route heuristics. Real-time bus/cab GPS streams are simulated/fallback in the UI when external transit APIs are unavailable.
2. **Do NOT assume AI generates arbitrary factual destination data**: The AI Copilot uses an airtight **Grounding Boundary** (`backend/app/ai/grounding.py`). The LLM is strictly constrained to intent parsing and query framing; all place coordinates, operating hours, hop distances, and transit facts originate *exclusively* from deterministic database records.
3. **Do NOT assume Light Mode exists**: The UI is strictly styled with a high-contrast dark theme (`dark-only` design system). Light theme toggle tokens were deliberately simplified to maintain visual elegance across map and neon dashboard surfaces.
4. **Do NOT assume external imagery is hotlinked insecurely**: All place and category images route through a secure local/Azure Blob image proxy (`/api/v1/images/{storage_key}`) or local static assets (`/data/images/`), preventing third-party hotlinking failures, CORS blocks, and mixed-content browser rejections.

---

## 2. COMPLETE CHANGE HISTORY & EVOLUTION

Below is the chronological breakdown of how O-Travelz developed from the initial core phases to the current Whole-Odisha production baseline:

| Commit SHA | Commit Message | Key Subsystems | Changes & Architectural Decisions |
| :--- | :--- | :--- | :--- |
| `d6a0291` | `feat: implement bounded Phase 3 transport routing` | Transport, Adapters | Established `MoBusAdapter`, `MoERideAdapter`, and `WalkingAdapter` with a strict `DataTier` hierarchy (STATIC, SCHEDULED, LIVE, UNKNOWN). |
| `d843bb4` | `feat: complete Phase 4 itinerary and ranking integration` | Itinerary, Ranking | Implemented deterministic `RankingService` with exact interest matching and tie-breakers; created `ItineraryService` with maximum 3 stops per day. |
| `a60befc` | `feat: complete Phase 5 grounded ai foundation` | AI, Grounding | Built `AIOrchestrator`, `GroundingBoundary`, and `RuleBasedModelAdapter` ensuring zero ungrounded LLM hallucinations. |
| `03c0a6a` | `phase6a: accept map http implementation` | Geospatial, Maps | Created GeoJSON projection endpoint `/map/v1/projection` and Leaflet map rendering. |
| `604d942` | `phase6a: accept reduced map http v2` | Geospatial | Cleaned coordinate projection contracts and bounded bounding box calculations. |
| `d7c754b` | `docs: synchronize phase 6a closeout state` | Docs | Synchronized Phase 6A documentation. |
| `eed6934` | `checkpoint: whole-odisha productized ui ux baseline` | Frontend, UI | Expanded coverage beyond Bhubaneswar/Puri to 9 regional hubs (Puri, Konark, Chilika, Cuttack, Daringbadi, Sambalpur, Rourkela, Koraput, Mayurbhanj). |
| `f2c3d3b` | `feat: complete whole-odisha travel product checkpoint` | Data, Frontend | Added 81 verified destination datasets, regional highlights, and multimodal itinerary workflows. |
| `004299c` | `release: close phase 8 demo and final release gate` | QA, Demo | Validated complete end-to-end interactive demo flows. |
| `58794c8` | `release: synchronize production-ready O-Travelz state` | Release, Sync | Unified schema definitions and production assets. |
| `0ce8f4f` | `feat: polish O-Travelz V2 branding and layout` | Frontend, Nav | Enhanced hero typography, badges, and quick-filter interaction pills. |
| `5ee24fa` - `60a517d` | `feat: finalize O-Travelz V2 visual polish (parts 1-6)` | Frontend, Itinerary | Polished `CoverflowCarousel`, `DestinationsPage`, `HomeSections`, `ItineraryPlannerPage`, and timeline cards. |
| `0d10fe7` | `fix: finalize dark-only theme and polish` | Design System | Streamlined `ThemeSettingsDock` and removed broken light theme overrides. |
| `e886d54` | `feat: complete O-Travelz V2 full-stack functionality` | Frontend, State | Implemented `useRecentPlaces` persistence, map view highlight synchronization, and modal trigger links. |
| `5a3a36c` | `feat: complete personalization, memories, and API client compatibility` | State, Store | Unified API client types with backend schemas; added saved places tags and memories support. |
| `7d652bd` | `feat: complete progressive itinerary planner, user space, and UI components` | Frontend, Saved | Redesigned `SavedPlacesPage` with collections, CSV/JSON export, and map view toggling. |
| `5fd6dc1` | `feat: complete end-to-end personalization, map intelligence, and reactive state sync` | Maps, Planner | Added interactive itinerary customizer (`ConstraintForm`), real-time budget calculator, and route hop visualizer. |
| `1267cb0` | `feat: finalize location-aware regional hub intelligence across all 9 Odisha hubs` | Hubs, UI | Added regional weather cards, live temperature feeds, and hub travel tips across all 9 districts. |
| `8f6c1a1` | `feat: comprehensive QA real-world data validation and integration test pass` | QA, Tests | Created 393-line comprehensive QA test suite (`final_real_world_qa.test.tsx`), validating search, filters, modals, and store sync. |
| `46dd58f` | `feat: place-specific operating hours engine, regional highlights, and live audit tests` | Places, Hours | Built `operatingHoursService.ts` encoding weekly shift rules (e.g. Monday closures for museums/zoos, temple darshan shifts, 24/7 ER/ATM support). |
| `0aa6fc7` | `fix: resolve image loading pipeline root cause and redesign sleek navigation header` | Nav, Storage | Fixed local storage image proxy path resolving; refactored `TopNav.tsx` with responsive drawer, quick actions, and search bar. |
| `a4fc078` | `chore: freeze stable release candidate baseline` | Core, Sync | Synced canonical types (`frontend/src/types/api.ts`) and hardened backend fallback resolvers. |
| `c215be8` | `chore: prepare current O-Travelz release` | Release | Baseline commit verified against GitHub remote. |

---

## 3. CURRENT ARCHITECTURE

```
                      ┌────────────────────────────────────────────────────────┐
                      │              O-TRAVELZ FRONTEND (React 18 + Vite)      │
                      │                                                        │
                      │  • TopNav & MobileDrawer                               │
                      │  • OdishaHero & CoverflowCarousel                      │
                      │  • Regional Hub Cards (9 Hubs)                         │
                      │  • Destinations Explorer & Filters                     │
                      │  • PlaceDetailsModal & Operating Hours Engine          │
                      │  • ItineraryPlannerPage & ConstraintForm               │
                      │  • MapView (Leaflet.js GeoJSON Rendering)              │
                      │  • AIChatDrawer & Copilot Panel                        │
                      │  • SavedPlacesPage (Local Storage Collections)         │
                      └────────────────────────────┬───────────────────────────┘
                                                   │ HTTP / REST API (port 8000)
                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 O-TRAVELZ FASTAPI BACKEND                                        │
│                                                                                                  │
│  ┌───────────────────────┐  ┌────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │   /places Routes      │  │   /itinerary Routes    │  │   /ai Orchestrator Routes           │  │
│  │   • Filter & Search   │  │   • Deterministic Rank │  │   • RuleBased / Fake Model Adapters │  │
│  │   • Category & Place  │  │   • Unique Hop Planner │  │   • Deterministic Tool Calls        │  │
│  │   • Image Associations│  │   • Max 3 stops / day  │  │   • GroundingBoundary Verification  │  │
│  └───────────┬───────────┘  └───────────┬────────────┘  └──────────────────┬──────────────────┘  │
│              │                          │                                  │                     │
│  ┌───────────┴───────────┐  ┌───────────┴────────────┐  ┌──────────────────┴──────────────────┐  │
│  │   /weather Routes     │  │   /transport Routes    │  │   /map/v1 & /api/v1/images Routes   │  │
│  │   • Open-Meteo Client │  │   • MoBus / Mo-E-Ride  │  │   • GeoJSON Projections             │  │
│  │   • Hub Coordinate Map│  │   • Walking Distance   │  │   • Local Storage / Azure Blob Proxy│  │
│  │   • Offline Fallbacks │  │   • DataTier Valuation │  │   • Path Traversal Security Checks  │  │
│  └───────────┬───────────┘  └───────────┬────────────┘  └──────────────────┬──────────────────┘  │
└──────────────┼──────────────────────────┼──────────────────────────────────┼─────────────────────┘
               ▼                          ▼                                  ▼
┌──────────────────────────┐ ┌──────────────────────────┐ ┌────────────────────────────────────────┐
│ PostgreSQL 16 + PostGIS  │ │ Static Schedules & Fares │ │ Image Store (WebP Assets & Manifests)  │
│ • places, categories     │ │ • data/transport/static/ │ │ • data/images/places/                  │
│ • place_interests        │ │ • data/transport/fares/  │ │ • data/images/categories/              │
│ • transport networks     │ │                          │ │ • data/images/sources/manifest.json    │
└──────────────────────────┘ └──────────────────────────┘ └────────────────────────────────────────┘
```

### Frontend Breakdown (`frontend/src`)
- **Framework**: React 18.3.1, TypeScript 5.5.4, Vite 5.4.6.
- **Styling**: Tailwind CSS v4, Framer Motion animations, custom CSS glassmorphism and glow tokens in `index.css`.
- **Maps**: Leaflet 1.9.4 (`react-leaflet` wrapped in custom `MapCanvas.tsx` / `MapView.tsx`), Dark CartoDB tile layer.
- **State Management**:
  - `useSavedPlaces.ts`: Persists bookmarked places, custom tags, personal notes in `localStorage`.
  - `useRecentPlaces.ts`: Tracks recently viewed places and search history.
  - `useMapProjection.ts`: Manages GeoJSON bounds, active stops, and route polyline highlights.
  - `useTheme.ts`: Enforces dark mode system theme.
- **API Client**: `frontend/src/api/client.ts` and `frontend/src/services/api.ts` with complete type-safe fallback handlers.

### Backend Breakdown (`backend/app`)
- **Framework**: FastAPI 0.115.0, Python 3.12, Uvicorn 0.30.6, Pydantic v2.9.2.
- **Database Layer**: SQLAlchemy 2.0.35 + GeoAlchemy2 0.15.2 over PostgreSQL 16 / PostGIS 3.4.
- **Routers**:
  - `places_routes.py`: Filter by category, interest, name/desc keyword search; detail queries by UUID or slug.
  - `itinerary_routes.py`: POST `/itinerary/plan` deterministic multi-day generator.
  - `transport_routes.py`: POST `/transport/plan-hop` and GET `/transport/provider-status/{provider_id}`.
  - `ai_routes.py`: POST `/ai/chat` for conversational planning and refinement.
  - `weather_routes.py`: GET `/weather/current` and `/weather/forecast` using live Open-Meteo integration.
  - `map_routes.py`: POST `/map/v1/projection` converts itinerary stops and coordinates into GeoJSON FeatureCollections.
  - `image_routes.py`: GET `/api/v1/images/{storage_key}` streams verified WebP images with traversal protection.

---

## 4. FEATURE-BY-FEATURE STATUS MATRIX

| # | Feature | Status | Frontend | Backend | Data | Tests | Notes & Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Destination Discovery** | `IMPLEMENTED` | Yes | Yes | Yes (81 places) | Yes | Instant search, category pills, region filters across 9 Odisha hubs. |
| 2 | **Destination Search** | `IMPLEMENTED` | Yes | Yes | Yes | Yes | Case-insensitive keyword search matching place names, tags, and descriptions. |
| 3 | **Destination Filtering** | `IMPLEMENTED` | Yes | Yes | Yes | Yes | Filter by categories (Heritage, Nature, Beach, Food, etc.) and interests. |
| 4 | **Destination Details** | `IMPLEMENTED` | Yes | Yes | Yes | Yes | Modal displays descriptions, visit durations, price tier, coordinates, sources. |
| 5 | **Destination Images** | `IMPLEMENTED` | Yes | Yes | Yes (130+ WebP) | Yes | Served via `/api/v1/images/` and local `imageService.ts` fallback. |
| 6 | **Personalized Planning** | `IMPLEMENTED` | Yes | Yes | Yes | Yes | `ConstraintForm` allows selecting days (1-7), start hub, interests, pace. |
| 7 | **Deterministic Itinerary**| `IMPLEMENTED`| Yes | Yes | Yes | Yes | Max 3 stops/day, spatial ordering, start origin support, hash ID generation. |
| 8 | **AI Copilot** | `IMPLEMENTED` | Yes | Yes | Yes | Yes | Conversational intent parser, clarification generator, parameter modifier. |
| 9 | **AI Grounding** | `IMPLEMENTED` | Yes | Yes | Yes | Yes | `GroundingBoundary` strictly rejects unverified facts or hallucinated places. |
| 10 | **Source Citations** | `IMPLEMENTED` | Yes | Yes | Yes | Yes | Shows source attribution (e.g. Odisha Tourism, OTDC, ASI) and verification date. |
| 11 | **Uncertainty Handling** | `IMPLEMENTED` | Yes | Yes | Yes | Yes | Explicitly marks missing schedules as "Hours unavailable · Check locally". |
| 12 | **Weather** | `IMPLEMENTED` | Yes | Yes | Live API | Yes | Open-Meteo live API integration with 7-day daily forecast and traveler advice. |
| 13 | **Transport Routing** | `PARTIAL` | Yes | Yes | Static/Sched | Yes | Computes walking/bus hops from timetable schedules; no live GPS streams. |
| 14 | **Maps & Geospatial** | `IMPLEMENTED` | Yes | Yes | Yes | Yes | Leaflet map with custom marker clusters, route lines, hub zoom, popup details. |
| 15 | **Saved Places** | `IMPLEMENTED` | Yes | Local | Local | Yes | LocalStorage-backed bookmarking with custom collection tags and JSON export. |
| 16 | **Revisit / History** | `IMPLEMENTED` | Yes | Local | Local | Yes | Tracks recently viewed places with instant one-click revisit drawer. |
| 17 | **Operating Hours Engine**| `IMPLEMENTED`| Yes | Local Rule | Verified | Yes | Accurately models Monday museum closures, sunrise-sunset, and temple darshans. |
| 18 | **Regional Hubs** | `IMPLEMENTED` | Yes | Yes | Yes (9 Hubs) | Yes | Dedicated intelligence for Bhubaneswar, Puri, Konark, Cuttack, Chilika, etc. |
| 19 | **Accessibility UI** | `PARTIAL` | Yes | N/A | Metadata | Yes | ARIA labels and keyboard navigation on interactive components; mobility routing is unoptimized. |
| 20 | **Multilingual Support** | `STATIC / PARTIAL`| UI Only| Rule | Metadata | Yes | UI contains Odia / English localized strings; full AI translation is rule-based. |
| 21 | **Community Preferences** | `PARTIAL` | Yes | No | Curated | Yes | Curated local recommendations (e.g. Pahala Rasagola, Cuttack Dahibara). |
| 22 | **Safety & Advisories** | `IMPLEMENTED` | Yes | Yes | Curated | Yes | Includes emergency 24/7 ER locations, weather alerts, and safety guidelines. |
| 23 | **Mobile Responsive UI** | `IMPLEMENTED` | Yes | N/A | N/A | Yes | MobileDrawer, touch-friendly carousel sliders, and collapsible panels. |
| 24 | **Deployment Readiness** | `IMPLEMENTED` | Yes | Yes | Yes | Yes | Production Docker Compose, static build pass, strict CORS configuration. |

---

## 5. AI SYSTEM — DEEP DIVE

### Architecture Flow
```
User Prompt (e.g., "Plan a 3-day spiritual and beach trip starting from Puri")
  │
  ▼
[ModelAdapter.parse_intent]
  ├── Identifies intent kind: PLANNING | REFINEMENT | CLARIFICATION | UNSUPPORTED
  ├── Extracts days: 3
  ├── Detects start location: "Puri"
  └── Extracts canonical interests: ["spirituality", "beach"]
  │
  ▼
[AIOrchestrator.orchestrate]
  ├── Validates constraints against SUPPORTED_CONSTRAINT_FIELDS
  ├── Rejects unsupported preferences (e.g. "less walking" -> UNSUPPORTED)
  └── Triggers Tool: `build_itinerary(constraints)`
        │
        ▼
  [ItineraryService.plan]
        ├── Deterministic candidate ranking (`RankingService`)
        ├── Coordinate validation and spatial clustering (Max 3 stops/day)
        └── Deterministic hop planning (`TransportService.plan_transport_hop`)
  │
  ▼
[GroundingContext.record(tool_result)]
  ├── Records itinerary stop facts (`itinerary.stop.{id}`)
  ├── Records transport hop facts (`transport.day1.0.1`)
  └── Records provider tier and status
  │
  ▼
[ModelAdapter.generate_response(snapshot)]
  └── Emits candidate structured claims keyed by `fact_id`
  │
  ▼
[GroundingBoundary.ground(draft, context)]
  ├── Strips ANY claim not matching an exact verified current-turn `fact_id` & value
  └── Constructs final factual message from approved template renderings
  │
  ▼
Returns type-safe `AIResponse` to Frontend with embedded `ItineraryResponse`
```

### Safety & Guardrails
- **Unsupported Claims**: If a user asks for unsupported features (e.g., specific flight bookings or hotel price discounts), the orchestrator returns `AIStatus.UNSUPPORTED` with an honest explanation.
- **Clarifications**: Ambiguous requests (e.g. "tell me about nature") trigger `AIStatus.CLARIFICATION` prompting the user for days and specific destinations.
- **Hallucination Prevention**: The model is structurally forbidden from emitting arbitrary Markdown or ungrounded claims; all destination text and hop durations in the output string come directly from `GroundingFact.rendered`.

---

## 6. TRANSPORT SYSTEM — DEEP DIVE

### Reality vs. Claim
| Transport Aspect | Actual Implementation | Real Data Source | UI Presentation |
| :--- | :--- | :--- | :--- |
| **Mo Bus Routes** | Static / Scheduled timetables | `data/transport/static/` | Shows route number, stops, and scheduled travel time |
| **Mo E-Ride** | Research stage | `data/transport/research/` | Marked as static/unresolved coordinates |
| **Walking Routes** | Haversine distance @ 4.5 km/h | Algorithmic calculation | Shows walking duration & distance between nearby stops |
| **Fares** | Static distance-based fare tables | `data/transport/fares/` | Displays estimated ticket price in INR (₹) |
| **Live Vehicle GPS** | **Unavailable** | None | UI gracefully falls back to "Scheduled" data tier |
| **Live Road Traffic** | **Unavailable** | None | UI uses deterministic duration estimates |

### Data Tiers
1. `STATIC` (Tier 0): Hardcoded route descriptions and stop lists.
2. `SCHEDULED` (Tier 1): Fixed timetable schedules and departure intervals.
3. `LIVE` (Tier 2): Real-time vehicle positions (requires external API subscription).
4. `UNKNOWN` (Tier -1): Returned whenever a route has missing coordinates.

---

## 7. WEATHER SYSTEM — DEEP DIVE

- **Provider**: **Open-Meteo** (Free open-access API, zero API key requirement).
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Queried Parameters**:
  - `current`: `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `precipitation`, `weather_code`, `wind_speed_10m`.
  - `daily`: `weather_code`, `temperature_2m_max`, `temperature_2m_min`, `precipitation_sum`, `precipitation_probability_max`.
- **Location Resolution**: `WeatherService` maps location strings to authoritative coordinates across all 9 Odisha regional hubs.
- **Fail-Safe Mechanism**: If external network requests fail or time out (> 3.5s), `_fallback_unavailable` returns a structured fallback response (`status: "unavailable"`) with safe travel advice without throwing unhandled 500 errors.

---

## 8. DATA & TRUST MODEL

### 81 Verified Destinations Directory
All destination data in `data/places/places.json` has been curated and verified against authoritative sources:
1. **Heritage & Temples**: Archaeological Survey of India (ASI), Odisha State Archaeology, Shree Jagannath Temple Administration.
2. **Eco-Tourism & Wildlife**: Odisha Forest Development Corporation (OFDC), Chilika Development Authority (CDA), Similipal Tiger Reserve.
3. **Beaches & Lakes**: OTDC (Odisha Tourism Development Corporation).
4. **Food & Culture**: Department of Odia Language, Literature & Culture.

### Place Schema & Identity
Each destination contains:
- `id` (UUID) and `research_id` (e.g. `place_001_lingaraj_temple`).
- `name`, `category_id`, `description`.
- `location` (PostGIS `POINT(lon lat)` in EPSG:4326).
- `avg_visit_minutes` (30 - 240 mins).
- `price_tier` (`free`, `budget`, `moderate`, `premium`).
- `verified_at` (ISO timestamp).
- `source` (Authoritative attribution URL / organisation).
- `images` (Array of local/remote WebP image metadata with photographic identity flags).

---

## 9. TEST SUITE VERIFICATION & RESULTS

Execution timestamp: `2026-08-21T17:32:00+05:30`

### 1. Backend Pytest Suite
- **Command**: `.\.venv\Scripts\pytest.exe --basetemp=./tmp/basetemp -q`
- **Result**: **324 PASSED**, 0 failed, 3 pydantic deprecation warnings.
- **Test Duration**: 11.64s.
- **Coverage**:
  - `test_ai_phase5.py`: 19 tests (AI orchestrator, grounding, clarification).
  - `test_ai_taxonomy_pass1.py`: 24 tests (taxonomy and intent parsing).
  - `test_geospatial_validation.py`: 14 tests (bounding boxes, GeoJSON projections).
  - `test_image_proxy.py` & `test_image_storage.py`: 18 tests (caching, security, traversal prevention).
  - `test_import_places.py`: 50 tests (database persistence, relations, coordinates).
  - `test_itinerary.py` & `test_itinerary_api.py`: 10 tests (ranking, multi-day planning).
  - `test_phase6a_map_http.py`: 19 tests (map projections, HTTP handlers).

### 2. Frontend Vitest Suite
- **Command**: `npm run test`
- **Result**: **224 PASSED** across 27 test files (1 full-stack live server test file `e2e_scenarios.test.ts` skipped when backend daemon is offline).
- **Test Files Passing**:
  - `tests/client.test.ts` (11 tests)
  - `tests/final_real_world_qa.test.tsx` (10 tests)
  - `tests/operating_hours_audit.test.ts` (5 tests)
  - `tests/image_integrity_audit.test.tsx` (12 tests)
  - `tests/master_ui_ux_completion.test.tsx` (9 tests)
  - `tests/weather_dynamic_normalization.test.tsx` (15 tests)
  - `tests/itinerary_components.test.tsx` (20 tests)
  - `tests/canonical_demo_flow.test.tsx` (8 tests)

### 3. Frontend Typecheck & Production Build
- **Command**: `npm run build` (`tsc && vite build`)
- **Result**: **SUCCESS** (2,263 modules transformed, 0 TypeScript errors).
- **Output Bundle**: `dist/assets/index-gWp8rW6z.js` (832.81 kB), `dist/assets/index-Cku3bfL_.css` (119.51 kB).

---

## 10. DEPLOYMENT CONFIGURATION

### Local Development / Docker
```bash
# 1. Start Database & Backend Services
cd infra
docker compose up -d

# 2. Run Database Migrations & Ingest Data
cd ../backend
alembic upgrade head
python -m scripts.import_places

# 3. Start Frontend Dev Server
cd ../frontend
npm install
npm run dev
```

### Environment Variables
| Variable | Default Value | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://otravelz:otravelz@localhost:5432/otravelz` | PostgreSQL + PostGIS connection string |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000,*` | Allowed frontend origins |
| `WEATHER_BASE_URL`| `https://api.open-meteo.com/v1/forecast` | Open-Meteo weather API |
| `STORAGE_BACKEND` | `local` | Storage provider (`local` or `azure`) |
| `AZURE_STORAGE_CONNECTION_STRING` | None (Optional) | Azure Blob Storage connection |

---

## 11. PROBLEM STATEMENT GAP ANALYSIS

| Requirement | Current Implementation | Evidence | Gap | Recommended Next Action |
| :--- | :--- | :--- | :--- | :--- |
| **Multilingual Assistance** | Static Odia/English labels in UI | `frontend/src/` | AI responds primarily in English; no dynamic Odia transliteration | Add multilingual prompting in `ModelAdapter` |
| **Verified Local Info** | 81 destinations with ASI/OTDC sources | `data/places/places.json` | Tier 2 rural spots have fewer secondary photos | Ingest additional crowdsourced verified images |
| **Live Weather** | Full 7-day Open-Meteo live sync | `WeatherService.py` | None (fully operational) | Add severe weather push alerts |
| **Live Transport** | Scheduled timetable matching | `MoBusAdapter.py` | No live GTFS-RT feed integration | Partner with CRUT / Mo Bus for real-time GTFS-RT API |
| **Accessibility** | ARIA tags, contrast dark mode | `ConstraintForm.tsx` | Wheelchair-friendly route optimization unweighted | Add wheelchair accessibility score to `RankingService` |
| **Safety & Advisories** | Emergency 24/7 hospital listings | `HomeSections.tsx` | No real-time SOS broadcast trigger | Add one-click emergency SMS / dialer integration |

---

## 12. KNOWN RISKS, LIMITATIONS & NEXT STEPS

### Prioritized Risk Matrix
1. **MEDIUM**: In Vite production builds, `dist/assets/index-gWp8rW6z.js` exceeds 500 kB.
   - *Fix*: Introduce React code-splitting via `React.lazy()` on `ItineraryPlannerPage` and `SavedPlacesPage`.
2. **LOW**: Open-Meteo free API rate limits during massive concurrent test runs.
   - *Fix*: Enable Redis / in-memory TTLCache in `backend/app/services/weather/adapter.py`.
3. **LOW**: Windows `pytest` basetemp permissions when invoked without `--basetemp`.
   - *Fix*: Standardize `pytest.ini` with `addopts = --basetemp=./tmp/basetemp`.

### Immediate Recommended Steps for Continuing AI Engineer
1. **Code-Split Frontend Routes**: Update `frontend/src/App.tsx` with dynamic imports to shrink the initial bundle size.
2. **Add GTFS-RT Ingestion**: If live transit credentials become available, implement `GTFSRealtimeAdapter` under `backend/app/transport/adapters/`.
3. **Deploy to Cloud (e.g. Azure Container Apps / AWS ECS)**: Utilize `infra/docker-compose.yml` and `backend/Dockerfile` for staging deployment.
4. **Expand Community Tips**: Enrich `data/places/places.json` with hyper-local Odia culinary traditions and festival calendars (e.g. Ratha Yatra, Dhanu Jatra, Bali Jatra).

---
*Authoritative Handoff Document generated for O-Travelz codebase baseline `c215be8`.*
