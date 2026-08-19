# O-Travelz Canonical Architecture

Status: Canonical Whole-Odisha Architecture & Implemented Systems

This document describes the end-to-end architecture, layers, and boundaries of the O-Travelz platform.

---

## Architectural Principles

1. **AI Orchestrates; It Does Not Invent Facts**: AI understands intent, orchestrates deterministic tools, and explains results. It never invents non-existent places or fake coordinates.
2. **Whole-Odisha Geographic Scope**: The data layer, discovery catalog, itinerary engine, and map projection support all regions of Odisha (Coastal, Central, Southern Hills/Lakes, Western, Northern, and Tribal Highlands).
3. **Deterministic Core Engine**: Candidate ranking, stop sequencing, and route planning execute against verified place and transport graph databases.
4. **Data Tiers**: Transportation data explicitly preserves confidence levels: `static`, `scheduled`, or `live`.
5. **Lightweight Client-Side Persistence**: Saved places and multi-turn trip histories persist in the browser via `localStorage` without unnecessary backend session dependencies.
6. **Graceful Degradation**: If an AI provider is unavailable or an unknown destination is queried, the system falls back naturally and provides clear clarification prompts.

---

## System Structure

```text
┌─────────────────────────────────────────────────────────────┐
│             Frontend (React 18 + TypeScript + Vite)         │
│  ├── Discover & Hero (Live Rotation & Quick Actions)        │
│  ├── Destinations Catalog (Filters, Search & Details Modal) │
│  ├── Interactive Map (Dynamic Whole-Odisha SVG Projection)  │
│  ├── Plan Trip (Constraint Form & AI Copilot Workspace)     │
│  ├── Saved Places (Persistent Client Storage)               │
│  └── Persistent Trip History Sidebar                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Typed HTTP/JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    Backend API (FastAPI)                    │
│  ├── GET /places & GET /places/{id} (Authoritative Catalog) │
│  ├── POST /itinerary/plan (Deterministic Itinerary Engine)  │
│  ├── POST /ai/plan (Grounded Conversational AI Orchestrator)│
│  ├── POST /map/v1/projection (Bounding Box & Features Map)  │
│  ├── POST /transport/hop (Multimodal Transport Router)      │
│  └── GET /health (Liveness Health Check)                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLAlchemy ORM + GeoAlchemy2
┌──────────────────────────────▼──────────────────────────────┐
│                Database (PostgreSQL/PostGIS & SQLite)       │
│  ├── Verified Places (50+ Whole-Odisha Records with SRID)   │
│  ├── Categories (Temples, Beaches, Nature, Waterfalls, etc.)│
│  └── Transport Stop & Route Networks                        │
└─────────────────────────────────────────────────────────────┘
```

---

## API Boundaries & Contracts

### 1. Places Discovery Boundary (`GET /places`, `GET /places/{id}`)
- `GET /places?category=...&search=...`: Returns verified place records with names, categories, descriptions, coordinates, average durations, price tiers, and official sources.
- `GET /places/{id}`: Returns authoritative details for a single destination.

### 2. Itinerary Planning Boundary (`POST /itinerary/plan`)
- Accepts `PlanningConstraints` (`days`, `interests`, `start`, `dates`, `budget`).
- Supports empty interests (`interests: []`) for open exploration.
- Ranks candidate places deterministically and computes transportation hops between stops.

### 3. AI Planning & Refinement Boundary (`POST /ai/plan`)
- Accepts conversational prompts and optional existing constraints.
- Classifies intents (`planning`, `refinement`, `clarification`, `unsupported`).
- Resolves destinations across all Odisha regions and executes tool calls against the deterministic itinerary engine.
- Generates grounded claims linked to verified facts.

### 4. Map Projection Boundary (`POST /map/v1/projection`)
- Projects places and hops onto GeoJSON-like features and relationships.
- SVG Canvas dynamically adapts its bounding box (`minLon`, `maxLon`, `minLat`, `maxLat`) to the geographic spread of the returned features across Odisha.
