# O-TRAVELZ PROJECT CONTEXT

> **Canonical shared context for all AI coding assistants.**  
> Product Name: **O-TRAVELZ**  
> Descriptor: **Odisha Travel Intelligence**  
> Credit: **Built by Algoryxz**  
> Product Positioning: **Odisha Travel Intelligence + Cultural Atlas**  
> Long-Term Differentiation: **Community-verified Odisha travel intelligence network**  
> Authoritative V4 Suite: [`docs/v4/`](docs/v4/)  
> All tool-specific files (`CLAUDE.md`, `GEMINI.md`, `AGENTS.md`) point here.

---

## 1. Project Overview & Current V4 Priority

O-TRAVELZ is a digital cultural atlas and intelligent travel planning platform purpose-built for the state of Odisha, India.

It combines:
- **Verified Cultural Atlas**: 204 verified destinations across all 30 districts with authentic photography.
- **Living Heritage & Artisans**: Dedicated profiles for Odisha 12 living craft traditions and artisan clusters (e.g. Raghurajpur, Pipili, Cuttack Tarakasi).
- **Deterministic Transit Truth**: 154 routes, 1,430 stops, and 5,553 scheduled departure times across CRUT Mo Bus and Ama Bus networks.
- **Multimodal Mobility Solver**: Walking legs, transit hops, and highway corridor connections with first-mile pedestrian safety logic.
- **Live Environmental Telemetry**: Real-time weather, heat indices, and sunrise/sunset times via Open-Meteo.
- **Zero-Cost External Navigation**: Direct turn-by-turn navigation handoff using universal Google Maps / Apple Maps URLs.

### Current Platform Execution Priority:
1. **Documentation & Architecture Synchronization** `[CURRENT]`
2. **Website V4 Redesign & Capability Integration** `[PLANNED]`
3. **iOS V4 Native App (SwiftUI + MapKit + Physical iPhone Testing)** `[PLANNED]`
4. **Android V4 Native App (Jetpack Compose + Google Maps SDK)** `[PLANNED]`
5. **Cross-Platform QA & Performance Audits** `[PLANNED]`

> **Platform Strategy Note**:
> Direct physical access to an iPhone enables immediate hardware testing of GPS transitions, MapKit rendering, and Dynamic Type. Android V4 development proceeds immediately after iOS; only physical-device performance benchmarking is deferred until hardware availability. Android adapts shared product journeys natively using Material 3 idioms and is **never** a superficial port of iOS UI.

---

## 2. Repository Layout

```
/
├── backend/               FastAPI + SQLAlchemy + PostGIS backend
│   ├── app/
│   │   ├── ai/            AI orchestrator, tool adapters (Gemini, Groq, NVIDIA, Rule-based)
│   │   ├── api/           HTTP route handlers (places, map, transport, weather, auth)
│   │   ├── core/          Core configuration and regional boundaries
│   │   ├── data/          Multilingual taxonomies and static references
│   │   ├── db/            Database session and base models
│   │   ├── geospatial/    Deterministic WGS84 GeoJSON projection engine
│   │   ├── models/        SQLAlchemy ORM models (Place, Route, Stop, Schedule)
│   │   ├── schemas/       Pydantic V2 schemas (feeding OpenAPI 3.1 contracts)
│   │   ├── services/      Domain services (search, itinerary, essentials, weather)
│   │   └── transport/     Transit engine, multimodal planner, coordinate resolver
│   └── alembic/           Database schema migrations
├── frontend/              Web Client (React 18 + TypeScript + Vite + Tailwind + MapLibre GL JS)
│   └── src/
│       ├── api/           API client and OpenAPI contract bindings
│       ├── components/    Atlas, map, navigation, and detail components
│       ├── pages/         Explore, Map, Plan, Detail, and Legal pages
│       └── utils/         Formatting, geometry, and image helpers
├── mobile/                Native Mobile Multiplatform
│   ├── shared/            Kotlin Multiplatform (KMP) shared domain core
│   │   └── src/           GeoPoint, HaversineDistance, OdishaBounds, FirstMileEngine
│   ├── ios/               iOS Native Application (Swift 5.9+ / SwiftUI / MapKit)
│   └── android/           Android Native Application (Kotlin 2.0+ / Compose / Maps SDK)
├── data/                  Canonical Git-tracked datasets (The Rebuild Source of Truth)
│   ├── places/            places.json (204 canonical place records)
│   ├── transport/         canonical/ (routes, stops, schedules, aliases, network)
│   ├── geospatial/        poi_relationships_*.json (2,670 proximity linkages)
│   └── images/            manifest.json and audited WebP image storage
├── docs/                  Documentation
│   ├── v4/                Authoritative V4 Documentation Suite (PRODUCT, ARCHITECTURE, etc.)
│   └── archive/           Archived historical audits and research notes
├── scripts/               Utility, validation, and database bootstrap scripts
├── tests/                 Pytest backend test suite
├── PROJECT_CONTEXT.md     Canonical shared context (THIS FILE)
├── AGENTS.md              Operating rules for AI coding assistants
├── SYSTEM_DESIGN.md       Backend service domain boundaries
├── DATA_QUALITY.md        Image validation pipeline and publishability gates
└── TRANSIT_DATA.md        Transit source of truth and data dictionary
```

---

## 3. Current Architecture & Verified Truth

### 3.1 Database Runtime & Rebuild Invariant
* **CURRENT Hosted Database**: **Aiven Managed PostgreSQL 16 with PostGIS 3.4 Extension**.
* **Rebuild Source**: The database is fully reproducible from Git canonical datasets in `data/` via Alembic migrations and `python scripts/bootstrap_database.py`.

### 3.2 Verified Bootstrap Inventory `[CURRENT]`
* **204** places across all 30 districts.
* **23** canonical categories & **12** canonical travel interests.
* **3** transport providers (CRUT Mo Bus, OSRTC Ama Bus, Indian Railways).
* **154** routes & **1,430** stops (41 geocoded, 1,389 tracked as legitimate unresolved stops).
* **1,487** route-stops (topological sequences) & $\ge 1$ EXACT route with verified GPS sequence.
* **302** schedule trip groups & **5,553** individual scheduled departure times.
* **70** verified place images passing strict multi-resolution WebP gates.
* **154** route intelligence records, **154** corridors, and **1,487** stop intelligence records.
* **11** evidence citations from official government publications.

### 3.3 Multidimensional Truth Model
All data presented to users derives from three explicit dimensions:
1. `VerificationStatus`: `OFFICIAL` | `AUDITED` | `STAGED`.
2. `FreshnessStatus`: `LIVE_OBSERVATION` (Weather only) | `SCHEDULED_TIMETABLE` (Transit) | `STATIC_CURATED` | `HEURISTIC_ESTIMATE`.
3. `AvailabilityStatus`: `AVAILABLE` | `FALLBACK_BUNDLE` | `UNAVAILABLE`.

> **CRITICAL SEPARATION**:
> Open-Meteo weather is labeled **`Live`**. Transit departures are labeled **`Scheduled`**. Never conflate weather observations with real-time transit telemetry. The phrase *"live bus tracking"* is **strictly prohibited**.

### 3.4 Cloud Infrastructure & Deprecations
* **Azure**: **DEPRECATED / RETIREMENT IN PROGRESS**. No new Azure dependencies. Object storage is transitioning to local / standard S3-compatible storage.
* **AI Provider Chain**: Google Gemini 1.5 Flash (Primary) $\rightarrow$ Groq Llama 3.3 (Secondary) $\rightarrow$ NVIDIA NIM (Tertiary) $\rightarrow$ RuleBasedAdapter (Offline deterministic fallback). Azure OpenAI is deprecated. Full RAG and custom model training are deferred.

---

## 4. Anti-Vibe-Code Product Rules (Permanent Constraints)

* **BANNED VISUALS**: Purple/neon gradients, gratuitous glassmorphism, floating cards with massive blur shadows, random blobs, cursor particles, scroll-jacking, emoji icons in core UI.
* **BANNED METRICS**: Fake traveler counts, fake booking urgency banners, fake user reviews, fake bus positions, AI-generated tourist photography.
* **BANNED COPY**: Marketing clichés ("Unlock unforgettable journeys", "Experience the magic"), "Made with AI", "AI powered". Zero em dash (`—`) characters in customer-facing copy.
* **REQUIRED TRUST PAGES**: Privacy Policy, Terms & Conditions, and About ("Built by Algoryxz").
* **EXPRESSIVE EDITORIAL DESIGN**: Anti-vibe-coded does **not** mean bland. O-TRAVELZ embraces high editorial gravity, commanding typography, authentic photography, and cultural resonance inspired by Odisha landscape and stone.
