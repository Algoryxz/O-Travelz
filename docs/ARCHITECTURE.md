# O-Travelz Canonical Architecture

**Status**: Canonical Whole-Odisha Architecture & Implemented Systems (Post-Phase 7 Baseline)

This document describes the end-to-end architecture, layers, and boundaries of the O-Travelz platform.

---

## Architectural Principles

1. **AI Orchestrates; It Does Not Invent Facts**: AI understands intent, orchestrates deterministic tools, and explains results. It never invents non-existent places, fake coordinates, or fabricated routes.
2. **Whole-Odisha Geographic Scope**: The data layer, discovery catalog, itinerary engine, and map projection support all 30 districts across Odisha.
3. **Deterministic Core Engine**: Candidate ranking, stop sequencing, and route planning execute against verified place and transport graph databases.
4. **Authoritative PostGIS Geospatial Layer**: Spatial projections and coordinates originate from PostgreSQL/PostGIS, preventing client-side geographic drift.
5. **Data Tiers**: Transportation data explicitly preserves confidence levels: `static`, `scheduled`, or `live`.
6. **Performance & Code-Splitting**: The map subsystem (Leaflet) is code-split dynamically on demand (`leaflet-vendor` and `MapView` chunks) to keep the primary bundle lean.
7. **Lightweight Client-Side Persistence**: Saved places and multi-turn trip histories persist in the browser via `localStorage` without backend session dependencies.
8. **Graceful Degradation**: If an upstream weather provider or external service is unreachable, the system falls back naturally with truthful status reporting.

---

## System Structure

```text
┌────────────────────────────────────────────────────────────────────────┐
│             Frontend SPA (React 18 + TypeScript + Vite)                │
│  ├── Navigation & URL Sync (#discover, #destinations, #map, #plan,     │
│  │   #saved, deep linking, Back/Forward browser history)               │
│  ├── Discover Hub & Curated Detours (OdishaHero, HomeSections)         │
│  ├── Destinations Catalog (30-District Filters, Search, Place Modal)   │
│  ├── Interactive Map Canvas (Lazy-Loaded Leaflet Bundle, PostGIS pins) │
│  ├── Plan Trip (Deterministic Form & Grounded AI Copilot Workspace)    │
│  ├── Cumulative Transit Timeline (Arrivals, Departures, Stop Durations)│
│  ├── Live Weather Widget (Open-Meteo Normalization & Advice)           │
│  └── Saved Places & Trip History (Persistent LocalStorage Archive)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Typed JSON / HTTP API
┌───────────────────────────────────▼────────────────────────────────────┐
│                         FastAPI Backend                                │
│  ├── GET /health (Liveness Health Check)                               │
│  ├── GET /places & GET /places/{id} (81 Canonical Places, Districts)   │
│  ├── POST /itinerary/plan (Deterministic Ranking & Sequencing Engine)  │
│  ├── POST /ai/plan (Grounded Intent Parsing & Tool Orchestrator)       │
│  ├── POST /map/v1/projection (PostGIS Feature & Hop Geometry)          │
│  ├── POST /transport/hop (Multimodal Transport Router)                 │
│  ├── GET /weather/current & /weather/forecast (Open-Meteo Adapter)    │
│  └── GET /static/images/* (WebP Destination Image Proxy)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQLAlchemy 2.0 + GeoAlchemy2
┌───────────────────────────────────▼────────────────────────────────────┐
│                    PostgreSQL 16 + PostGIS 3.4                         │
│  ├── places (81 Canonical Places, 30 Districts, WGS84 Point Geometry)  │
│  ├── categories (13 Physical Categories)                               │
│  ├── interests (12 Normalized Traveler Themes)                         │
│  ├── place_interests (206 M:N Associations)                            │
│  ├── place_images (Synchronized WebP Photography Records)              │
│  └── transport_stops, transport_routes, transport_fares                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## API Boundaries & Contracts

### 1. Places Discovery Boundary (`GET /places`, `GET /places/{id}`)
- `GET /places?category=...&district=...&search=...`: Returns verified place records with names, physical categories, districts, derived regions, descriptions, coordinates, average durations, price tiers, and official provenance.
- `GET /places/{id}`: Returns authoritative details for a single destination by UUID or `research_id`.

### 2. Itinerary Planning Boundary (`POST /itinerary/plan`)
- Accepts `PlanningConstraints` (`days` 1–14, `interests`, `start`, `dates`, `budget`).
- Supports open exploration (`interests: []`).
- Enforces max 3 stops per day and topological distribution across days.
- Computes structured transportation hops (walk $\le 2000$m, road, bus, rail) with data tiers (`static`, `scheduled`, `live`).

### 3. Grounded AI Planning Boundary (`POST /ai/plan`)
- Accepts conversational prompts and optional existing constraints.
- `RuleBasedModelAdapter` classifies intents (`planning`, `refinement`, `clarification`, `unsupported`).
- Maps non-canonical requests safely to valid themes without hallucinating fake entities.
- Executes current-turn tool calls against the deterministic itinerary engine and returns strictly grounded explanations.

### 4. Map Projection Boundary (`POST /map/v1/projection`)
- Consumes typed feature identifiers (`requested_features`, `requested_hops`).
- Queries PostGIS spatial coordinates and returns GeoJSON-compliant Point features with geometry statuses (`available`, `unavailable`).

### 5. Weather Integration Boundary (`GET /weather/current`, `GET /weather/forecast`)
- Isolated Open-Meteo backend adapter normalizing WMO weather codes into traveler-friendly descriptions, temperatures, humidity, wind speeds, and contextual travel advice.

### 6. Image Proxy Boundary (`GET /static/images/{storage_key}`, `GET /api/v1/images/{storage_key}`)
- Serves verified WebP destination and category photography directly from the local asset store or cloud object storage.

### 7. Google OAuth & Session Management Boundary (`/auth/*`)
- `GET /auth/google/start`: Initiates OAuth 2.0 with PKCE (`code_challenge` S256) and HMAC-SHA256 signed `oauth_state` cookie.
- `GET /auth/google/callback`: Validates state signature, exchanges code, verifies ID token against Google tokeninfo, creates/updates user by immutable `provider_subject`, issues SHA-256 hashed session in `HttpOnly` cookie (`otravelz_session`).
- `GET /auth/me`: Validates active server session and returns user identity.
- `POST /auth/logout`: Revokes active server session and clears session cookie.

### 8. Cloud Synchronization Boundary (`/api/v1/sync/*`)
- `GET /api/v1/sync/saved-places` & `POST /api/v1/sync/saved-places`: Synchronizes user-saved destinations (max 100). Enforces user ownership via server session, verifies canonical destination presence, resolves conflicts via `higher updated_at wins`, and preserves tombstones.
- `GET /api/v1/sync/trips` & `POST /api/v1/sync/trips`: Synchronizes saved multi-turn trip plans (max 50, max 50KB/trip).
- Rate Limiting: 30 requests/minute/user enforced in-process with HTTP 429 and `Retry-After` header.
- Offline-First: 100% additive; local `localStorage` persists data without authentication; logout preserves local records.

### 9. Shareable Itinerary Deep-Linking Boundary (`/api/v1/trips/*`)
- `POST /api/v1/trips/share`: Authenticated endpoint allowing travelers to create immutable read-only trip snapshots. Derives ownership strictly from server session (`current_user.id`), enforces payload size limit (50KB), generates an unguessable 22-char URL-safe token, and stores the snapshot in `shared_trip_snapshots`. Rate limited to 20 shares/hour/user.
- `GET /api/v1/trips/shared/{share_id}`: Public read-only endpoint returning the immutable snapshot (title, itinerary, constraints, creation timestamp). Strictly excludes user IDs, emails, session tokens, and internal keys. 404 on missing or expired links. Rate limited per IP for abuse prevention.
- Frontend Deep Link: SPA hash routing resolves `/#trip/shared/{share_id}` and `/#shared/{share_id}` directly into read-only itinerary view with zero authentication requirements.

### 10. Client-Side Itinerary Export & Print Optimization Boundary
- **Print / Save as PDF**: Pure browser-native `window.print()` rendering via dedicated `PrintableItineraryView` and `@media print` stylesheet. Strips non-essential interactive chrome (navbars, drawers, modals, map tiles, buttons) while enforcing sensible page breaks between days and high-contrast grayscale readability. 0 external PDF servers.
- **Client-Side Markdown Export**: Pure browser-native `Blob` download of offline Markdown documents (`o-travelz-itinerary-{safe-title}.md`) featuring day-by-day stops, verified durations, connecting transit directions, and canonical Odisha emergency/tourist helplines. 0 login requirement, 0 tokens exposed, 0 network requests.

### 11. Progressive Web App & Native Service Worker Boundary
- **App Shell & Static Asset Caching**: Versioned `otravelz-static-v1.0.0` pre-caching core shell (`/`, `/index.html`, `/manifest.webmanifest`, icons) and cache-first static bundle serving (`.js`, `.css`, fonts).
- **Destination & Category Photography Caching**: Size-bounded `otravelz-images-v1.0.0` (max 80 entries) with stale-while-revalidate strategy and automatic oldest-entry pruning.
- **Strict API & Mutation Exclusion**: All non-GET requests and sensitive endpoints (`/auth/*`, `/api/v1/sync/*`, `/api/v1/trips/share`, `/ai/*`) bypass Service Worker caches completely and route directly to the backend.
- **Lifecycle & Fallback**: Automatic stale cache purging on `activate`, instant activation via `skipWaiting()` and `clients.claim()`, and offline navigation fallback to cached `index.html`.

### 12. Automated Continuous Integration Boundary (`.github/workflows/ci.yml`)
- **Triggers**: Automated verification on all pushes and pull requests targeting the `main` branch.
- **Job 1 (repo-integrity)**: Git diff whitespace & format checks preventing merge conflicts and formatting corruption.
- **Job 2 (backend-ci)**: Python 3.12 environment with pip caching, PostgreSQL/PostGIS 16-3.4 service container, Python compilation (`compileall`), Alembic migration history & application (`alembic upgrade head`), and complete Pytest suite execution.
- **Job 3 (frontend-ci)**: Node.js 20 environment with npm caching, clean dependency installation (`npm ci`), Vitest suite execution, and TypeScript production compilation (`tsc && vite build`).
- **Security & Budget**: 0 deployment or publish hooks; 0 hardcoded secrets; 100% ₹0 GitHub-hosted runner execution.





---

## 30-District & Region Architecture

Odisha's 30 administrative districts are mapped deterministically to canonical travel regions:
- **Puri & Coastal**: Puri, Jagatsinghpur, Kendrapara, Bhadrak, Balasore
- **Bhubaneswar & Central**: Khordha, Cuttack, Nayagarh, Dhenkanal, Jajpur
- **Chilika & Southern Coast**: Ganjam, Gajapati
- **Kandhamal & Southern Hills**: Kandhamal, Boudh, Rayagada
- **Sambalpur & Western Odisha**: Sambalpur, Bargarh, Jharsuguda, Deogarh, Sonepur, Balangir, Nuapada, Kalahandi
- **Rourkela & Sundargarh**: Sundargarh
- **Northern Odisha & Wildlife**: Mayurbhanj, Keonjhar, Angul
- **Koraput & Tribal Highlands**: Koraput, Nabarangpur, Malkangiri
