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
