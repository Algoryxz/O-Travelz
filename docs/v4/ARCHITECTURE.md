# O-TRAVELZ V4 — System & Platform Architecture

> **Authoritative Platform Specification**  
> Architecture: **Unified Multiplatform Architecture (Web + iOS Native + Android Native + Shared Domain Core)**  
> Hosted Database Runtime: **Aiven Managed PostgreSQL 16 with PostGIS 3.4 Extension**  
> Canonical Rebuild Source: **Git Canonical Datasets (`data/`) + Alembic Migrations + `scripts/bootstrap_database.py`**  
> Document Version: `4.0.0` | Last Updated: `2026-09-04`

---

## 1. Platform Execution Order

Implementation follows this strict sequential dependency chain:

```
┌────────────────────────────────────────────────────────┐
│ 1. Documentation & Architecture Synchronization        │ [CURRENT]
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Website V4 Redesign & Capability Integration        │ [PLANNED]
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. iOS V4 Native App (SwiftUI + MapKit + Hardware Test)│ [PLANNED]
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Android V4 Native App (Jetpack Compose + Maps SDK)  │ [PLANNED]
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 5. Cross-Platform QA & Performance Audits              │ [PLANNED]
└────────────────────────────────────────────────────────┘
```

> **Platform Priority Rationale**:
> Direct physical access to an iPhone allows immediate hardware validation of GPS lock transitions, MapKit rendering, and VoiceOver contrast on iOS. Android V4 development proceeds immediately following iOS; only physical-device performance verification is blocked by Android hardware availability. Android adapts shared product journeys natively using Material 3 idioms and is **never** a superficial port of iOS UI.

---

## 2. High-Level Cross-Platform Topology

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT PLATFORMS                                     │
│                                                                                         │
│   ┌───────────────────────────┐ ┌───────────────────────────┐ ┌──────────────────────┐  │
│   │   Web Client (frontend/)  │ │  iOS Native (mobile/ios/) │ │ Android Native (..android)│
│   │   React 18 + Vite + TS    │ │  Swift 5.9+ / SwiftUI     │ │ Kotlin 2.0+ / Compose │  │
│   │   MapLibre GL JS          │ │  Apple MapKit (SwiftUI.Map│ │ Google Maps SDK Compose│ │
│   │   Tailwind CSS (Atlas)    │ │  SwiftData Persistence    │ │ Room SQLite DB       │  │
│   └─────────────┬─────────────┘ └─────────────┬─────────────┘ └──────────┬───────────┘  │
│                 │                             │                          │              │
│                 │                             └──────────┬───────────────┘              │
│                 │                                        ▼                              │
│                 │                        ┌───────────────────────────────┐              │
│                 │                        │  Shared Core (mobile/shared/) │              │
│                 │                        │  Kotlin Multiplatform (KMP)   │              │
│                 │                        │  Math, Geo, Engines, Contracts│              │
│                 │                        └───────────────┬───────────────┘              │
│                 │                                        │                              │
│                 └─────────────────────────┬──────────────┘                              │
└───────────────────────────────────────────┼─────────────────────────────────────────────┘
                                            │ HTTPS REST (JSON / OpenAPI 3.1)
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND RUNTIME (backend/app/)                             │
│                                                                                         │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│  │ Place Service    │ │ Transit Engine   │ │ Map Projection   │ │ AI Orchestrator  │    │
│  │ Spatial Search   │ │ Schedule Solver  │ │ Typed Identities │ │ Gemini, Groq,    │    │
│  │ Multilingual Odia│ │ First-Mile Logic │ │ GeoJSON WGS84    │ │ NVIDIA, RuleChain│    │
│  └─────────┬────────┘ └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘    │
└────────────┼───────────────────┼────────────────────┼────────────────────┼──────────────┘
             │                   │                    │                    │
             ▼                   ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            DATA PERSISTENCE & EXTERNAL APIS                             │
│                                                                                         │
│  ┌──────────────────────────────────────────────┐ ┌──────────────────────────────────┐  │
│  │ CURRENT Hosted DB: Aiven PostgreSQL 16       │ │ External Runtime Services        │  │
│  │ PostGIS 3.4 Spatial Extension                │ │ - Open-Meteo (Live Weather / Sun)│  │
│  │ Rebuild: Git data/ + Alembic + bootstrap.py  │ │ - Google Maps URLs (Free Nav)    │  │
│  └──────────────────────────────────────────────┘ └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Subsystem Architectural Boundaries

### 3.1 Web Application (`frontend/`) `[CURRENT / UPGRADING TO V4]`
* **Framework**: React 18, TypeScript (strict mode), Vite build engine, Tailwind CSS.
* **Map Renderer**: **MapLibre GL JS** (Vector basemap rendering verified PostGIS features).
* **Information Architecture**: 8 primary sections: Explore, Map, Plan, Transport, Culture, Artisans, Stories, Community.
* **State & Data Access**: Progressive migration from bundled static JSONs to backend REST endpoints (`/api/places`, `/api/map/projection`, `/api/transport`).

### 3.2 iOS Native Application (`mobile/ios/`) `[PLANNED]`
* **Language & Framework**: Swift 5.9+, SwiftUI (iOS 17.0+ minimum target).
* **Map Engine**: **Apple MapKit** (`SwiftUI.Map`) with custom category annotations.
* **Local Persistence**: **SwiftData** (`@Model` containers for `SavedPlace` and `SavedTrip`).
* **Location Telemetry**: `CoreLocation` (`CLLocationManager`) strictly mapped to KMP `LocationState`.
* **Shared Core Bridge**: Consumes `OTravelzCore.xcframework` compiled directly from `mobile/shared/`.

### 3.3 Android Native Application (`mobile/android/`) `[PLANNED]`
* **Language & Framework**: Kotlin 2.0+, Jetpack Compose with Material 3 design tokens.
* **Map Engine**: **Google Maps SDK for Android** (`com.google.maps.android:maps-compose`).
* **Local Persistence**: **Room SQLite** with KSP entity compilation and DataStore preferences.
* **Location Telemetry**: `FusedLocationProviderClient` feeding `LocationState`.
* **Shared Core Bridge**: Direct Gradle project dependency (`implementation(project(":shared"))`).

### 3.4 Shared Domain Core (`mobile/shared/`) `[CURRENT]`
* **Technology**: Pure Kotlin Multiplatform (KMP), standard library only, zero heavy external dependencies.
* **Artifacts Generated**:
  1. Android: JVM library / AAR.
  2. iOS: Apple XCFramework (`OTravelzCore.xcframework`).
* **Parity Contract**: Provides **deterministic domain parity for shared fixtures**. Mathematical outputs, bounding box classifications, timetable evaluations, and first-mile distance bands evaluate identically across platforms.
* **Strict Scope**:
  * `com.otravelz.shared.geo`: `GeoPoint`, `HaversineDistance` ($R = 6371.0088\text{ km}$), `OdishaBounds`.
  * `com.otravelz.shared.engine`: `FirstMileEngine`, `TimetableEngine`, `SearchFilterEngine`.
  * `com.otravelz.shared.provenance`: `DataProvenance`, `LocationState`, `WeatherState`.

---

## 4. Backend & Database Architecture

### 4.1 Database Runtime & Canonical Rebuild Invariant
* **CURRENT Hosted Database**: **Aiven Managed PostgreSQL 16 with PostGIS 3.4** extension.
* **The Single Source of Rebuild Truth**:
  * The production database is completely reproducible from Git.
  * Version-controlled JSON files in `data/` (`data/places/places.json`, `data/transport/canonical/`, `data/geospatial/`).
  * Database schema evolution managed strictly via **Alembic migrations** (`backend/alembic/`).
  * Deterministic seeding executed via `python scripts/bootstrap_database.py`.

### 4.2 Cloud Infrastructure & Deprecations
* **Azure**: **DEPRECATED / RETIREMENT IN PROGRESS**.
  * No new Azure dependencies are permitted.
  * Storage is actively transitioning from Azure Blob Storage to local filesystem / standard S3-compatible object storage (Cloudflare R2 / AWS S3).
  * Azure OpenAI deployment (`gpt-5-mini`) is deprecated and queued for decommissioning.

### 4.3 AI Subsystem Architecture
* **CURRENT Supported Provider Chain**:
  1. **Google AI Studio (Gemini 1.5 Flash)**: Primary zero-cost cloud LLM for intent parsing and multilingual interpretation.
  2. **Groq AI (Llama 3.3 70B)**: High-speed fallback inference.
  3. **NVIDIA API Catalog (Llama 3.1 8B)**: Tertiary fallback.
  4. **RuleBasedAdapter**: 100% offline, deterministic rule engine (never fails, zero cloud cost).
* **Deferred AI Scope**:
  * Full Retrieval-Augmented Generation (RAG) vector embeddings: `[FUTURE / DEFERRED]`.
  * Custom model training / fine-tuning: `[FUTURE / DEFERRED]`.
  * The AI strictly interprets user query intent and formats explanations of deterministic facts. AI never owns or invents canonical data.
