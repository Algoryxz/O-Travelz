# O-Travelz — Complete Product & Codebase Reconnaissance
**Version:** 1.0.0 (Authoritative Reconnaissance)  
**Date:** August 2026  
**Status:** Complete / Phase 1 Inspection Baseline  

---

## 1. System Overview & Product Identity

### 1.1 What is O-Travelz?
**O-Travelz** is a specialized, intelligent, transportation-aware travel platform and deterministic itinerary engine dedicated to the state of **Odisha, India**. 

Unlike generic travel aggregators or ungrounded AI chat wrappers, O-Travelz combines:
1. An **authoritative, verified database** of Odisha destinations across all 30 districts and 6 distinct travel regions.
2. A **deterministic routing and scheduling engine** that computes topological transport hops (public transit, Mo Bus, Mo E-Ride, walking, and regional intercity corridors) with strict physical feasibility.
3. A **multi-tiered, zero-cost AI architecture** (Microsoft Azure OpenAI, Google Gemini, NVIDIA NIM, and local offline rule-based adapters) enforced by a strict **zero-fabrication grounding boundary**.
4. A **secure cloud synchronization and sharing subsystem** allowing anonymous local-first usage with seamless Google OAuth 2.0 PKCE authentication, cross-device sync, and unguessable public read-only trip snapshots.
5. A **semantic image delivery pipeline** enforcing 1-to-1 photographic integrity between real-world Odisha landmarks and verified WebP visual assets.

---

## 2. Technical Stack & Repository Architecture

### 2.1 Technology Stack Matrix

| Layer | Technologies / Libraries | Purpose / Role |
| :--- | :--- | :--- |
| **Frontend Core** | React 18.3.1, TypeScript 5.5.4, Vite 5.4.6 | Single Page Application (SPA) runtime and build tooling |
| **Frontend Styling** | Tailwind CSS v4.0.0 (`@tailwindcss/vite`), Custom CSS tokens, Vanilla CSS variables | Semantic design system, dark-mode surfaces, responsive layouts |
| **Animation & Icons** | Framer Motion 13.1.1, Lucide React 1.32.0 | Micro-interactions, drawers, modal transitions, UI iconography |
| **Mapping Engine** | Leaflet 1.9.4, `@types/leaflet` 1.9.22, OpenStreetMap tiles | Interactive map canvas, marker clustering, polyline route visualization |
| **Backend Core** | Python 3.12, FastAPI 0.115.0, Uvicorn 0.30.6, Pydantic v2 (2.9.2) | Asynchronous REST API, typed contracts, validation, routing |
| **Database & GIS** | PostgreSQL 16, PostGIS, SQLAlchemy 2.0.35, GeoAlchemy2 0.15.2, Alembic 1.13.2 | Spatial queries, geospatial indexing, relational persistence |
| **Image Processing & Storage** | Pillow 10.4.0, Azure Storage Blob 12.23.1, Azure Identity 1.19.0, Local FS | Image resizing, WebP variant generation, secure proxy streaming |
| **AI & Inference** | Python stdlib (`urllib.request`), Azure OpenAI REST, Google Gemini REST, NVIDIA API | Provider-neutral LLM orchestration, structured tool execution, zero-cost fallback |
| **Weather** | Open-Meteo REST API, In-memory TTL cache | Live meteorological observations, 7-day forecasts, traveler advice |
| **Testing** | Pytest 8.3.3, Vitest 2.0.5, React Testing Library 16.0.0 | Unit, contract, integration, and E2E regression test suites |

---

## 3. Directory Structure & Key Modules

```
o-travelz/
├── .github/workflows/          # CI/CD test and deployment workflows
├── backend/
│   ├── alembic/                # Database migrations (PostgreSQL + PostGIS)
│   ├── app/
│   │   ├── ai/                 # Multi-provider AI adapter, grounding, verifier, circuit breaker
│   │   │   ├── adapter.py      # Azure OpenAI, Gemini, NVIDIA, RuleBased, Mock adapters
│   │   │   ├── boundary.py     # ToolExecutionBoundary (sandboxed domain calls)
│   │   │   ├── circuit_breaker.py # Failover threshold & cooldown manager
│   │   │   ├── conversation.py # GroundedConversationOrchestrator
│   │   │   ├── grounding.py    # Zero-fabrication domain context accumulator
│   │   │   ├── grounding_verifier.py # Anti-hallucination sanitization filter
│   │   │   ├── multilingual.py # Odia, Hindi, English intent & entity parser
│   │   │   ├── rate_limit.py   # Token bucket / request sliding-window limiter
│   │   │   ├── registry.py     # Pluggable Tool Registry
│   │   │   └── tools/          # search_places, build_itinerary, plan_transport_hop, provider_status
│   │   ├── api/                # FastAPI Routers
│   │   │   ├── ai_routes.py    # POST /ai/plan, POST /ai/converse
│   │   │   ├── auth_routes.py  # GET /auth/google/start, /callback, /me, POST /logout
│   │   │   ├── image_routes.py # GET /api/v1/images/*, /static/images/* (Secure Proxy)
│   │   │   ├── itinerary_routes.py # POST /itinerary/plan
│   │   │   ├── map_routes.py   # POST /map/v1/projection
│   │   │   ├── places_routes.py # GET /places, GET /places/{id}, GET /places/suggestions
│   │   │   ├── share_routes.py # POST /api/v1/trips/share, GET /api/v1/trips/shared/{id}
│   │   │   ├── sync_routes.py  # GET/POST /api/v1/sync/saved-places, /sync/trips
│   │   │   ├── transport_routes.py # POST /transport/hop, GET /transport/providers/{id}
│   │   │   └── weather_routes.py # GET /weather/current, GET /weather/forecast
│   │   ├── core/               # Configuration (Pydantic Settings), regional classification
│   │   ├── db/                 # Database engine & session fixtures
│   │   ├── geospatial/         # Map projection calculations, bounding boxes, topology
│   │   ├── models/             # SQLAlchemy ORM entities (Place, User, Session, Trip, etc.)
│   │   ├── schemas/            # Pydantic contract schemas (API in/out)
│   │   ├── services/           # Business logic (Itinerary, Ranking, Search, Auth, Weather)
│   │   ├── storage/            # Azure Blob & Local filesystem storage adapters
│   │   └── transport/          # Multimodal route graph, Mo Bus & walking adapters
│   └── tests/                  # Over 50 backend test suites (AI, auth, GIS, ranking, images)
├── data/
│   ├── images/                 # Verified image assets (categories, places, sources)
│   ├── places/                 # Canonical seed JSONs (places.json, categories.json, interests.json)
│   ├── research/               # Ground-truth domain data & coordinate audits
│   └── transport/              # Static schedules, fares, and transit network nodes
├── docs/                       # Architectural specifications, PRDs, phase closeouts
└── frontend/
    ├── public/                 # Favicon, web manifest, offline service worker
    ├── src/
    │   ├── api/                # Typed API client (`client.ts`) & contract exports
    │   ├── components/         # Modular UI component library
    │   │   ├── ai/             # AIConversationPanel, AISidebar
    │   │   ├── auth/           # AuthStatusButton, user login modals
    │   │   ├── badges/         # CrowdPill, LiveBadge, StarRating, VerifiedBadge
    │   │   ├── gallery/        # CoverflowCarousel, PhotoGallery
    │   │   ├── home/           # OdishaHero, HomeSections, DestinationsPage, CategoryExplorePage
    │   │   ├── itinerary/      # ConstraintForm, ItineraryView, StopCard, ShareTripModal, etc.
    │   │   ├── legal/          # PrivacyPolicyPage, TermsConditionsPage, ContactPage, ConsentGate
    │   │   ├── location/       # LocationPermissionModal
    │   │   ├── map/            # MapView, MapCanvas, MapDetailsDrawer
    │   │   ├── nav/            # TopNav, MobileDrawer, FloatingNavigationDock, Footer
    │   │   ├── place/          # PlaceCard, PlaceDetailsModal, EssentialCard, NearbyDarkCard
    │   │   ├── transport/      # TransportHopCard, DataTierBadge
    │   │   └── weather/        # WeatherCard, AnimatedWeatherIcon
    │   ├── hooks/              # useGeolocation
    │   ├── pages/              # ItineraryPlannerPage (SPA Hub), DemoHome (Legacy)
    │   ├── services/           # Re-exported API client
    │   ├── store/              # Lightweight reactive state stores (Auth, Sync, Places, AI, Map, etc.)
    │   ├── types/              # Full canonical TypeScript interfaces
    │   └── utils/              # Image resolution pipeline, export utils, weather normalizers
    └── tests/                  # 43 frontend Vitest suites covering all flows
```

---

## 4. Production & Deployment Infrastructure

### 4.1 Deployed Endpoints & Custom Domains
* **Production Frontend:** `https://o-travelz.onrender.com`
* **Production Backend:** `https://otravelz-backend.onrender.com`
* **Custom Production Domains:**
  * `https://otravelz.in`
  * `https://www.otravelz.in`

### 4.2 Security & Network Configuration
1. **CORS:** Configured in `backend/app/main.py` with dynamic origin parsing. In production, credentials (`allow_credentials=True`) are enabled for explicit production origins.
2. **Session Security:** Signed HMAC-SHA256 session cookies (`AUTH_SESSION_SECRET`), `HttpOnly=True`, `SameSite=Lax`, and `Secure=True` in production.
3. **Google OAuth 2.0:** Full Authorization Code flow with PKCE (`code_challenge` / `code_verifier`) and signed encrypted state cookie to prevent CSRF and token interception.
4. **Rate Limiting:** Sliding-window rate limiters across AI calls (30 req/min local, 10 req/min external), Sync operations (30 req/min), Share generation (20 req/hour), and Public snapshot viewing (120 req/min).

---

## 5. Architectural Invariants (Non-Negotiable Guarantees)

During any upcoming frontend redesign or Stitch integration:
1. **API Contracts Must Not Change:** Endpoint paths, request bodies, query parameters, and response schemas in `backend/app/schemas/` are strict contracts.
2. **No Data Fabrication:** The UI cannot fabricate fake places, fictitious schedules, or unverified imagery.
3. **Preserve Deterministic Fallbacks:** The app must function 100% reliably even when third-party AI keys or cloud storage connections are unavailable.
4. **Local-First Continuity:** Anonymous travelers must be able to explore, plan, and save trips in browser storage without being blocked by an authentication wall.
