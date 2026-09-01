# O-Travelz Product Requirements Document

**Status**: Canonical Whole-Odisha Product Scope (Post-Phase 7 Baseline)

This document is the product source of truth. O-Travelz is a transportation-aware trip-planning and destination exploration platform covering the entire state of Odisha.

---

## Product Purpose

O-Travelz is a transportation-aware travel platform and itinerary engine for the entire state of Odisha. It enables visitors, locals, students, and families to explore verified destinations across all geographic zones (Coastal, Central, Southern Hills & Lakes, Western Odisha, Northern & Wildlife, and Tribal Highlands) and produce realistic single-day and multi-day itineraries with transportation hops, maps, and conversational AI assistance.

The central product principle is:

> **AI orchestrates and refines. It does not invent facts.** All itineraries, places, coordinates, transit times, and weather data are grounded in verified data.

---

## Target User

A traveler planning time in Odisha who wants a practical itinerary and discovery tool grounded in verified place and transportation information, with reliable maps, persistent saved places, and multi-turn conversational trip refinement.

---

## Approved Navigation & Views

1. **Discover (`/#discover`)**:
   - Hero section showcasing Odisha destinations and curated hubs.
   - Quick-action shortcuts for live map, nearby services, and AI copilot.
   - Categorized collections, weather overview, and curated detours.
2. **Destinations (`/#destinations`)**:
   - Whole-Odisha destination catalog with region filters (`Puri & Coastal`, `Bhubaneswar & Central`, `Cuttack & Mahanadi`, `Chilika & Southern Coast`, `Kandhamal & Southern Hills`, `Sambalpur & Western Odisha`, `Rourkela & Sundargarh`, `Northern Odisha & Wildlife`, `Koraput & Tribal Highlands`).
   - Category filtering (`temple`, `monument`, `nature`, `beach`, `waterfall`, `wildlife`, `museum`, `lake`, `park`, `market`, `planetarium`, `science_center`, `sports_venue`).
   - Real-time search by name, district, or theme across all 30 Odisha districts.
   - Destination cards with WebP photography, badges, quick Save, View on Map, and Plan Trip actions.
3. **Place Details Modal**:
   - Reusable modal displaying verified place facts: name, category, district, region, description, coordinates, average visit duration, entry price tier, and official source provenance.
   - Action triggers: "Save Place" (synced with `localStorage`), "Explore on Map", and "Plan Trip Here".
4. **Interactive Map (`/#map`)**:
   - Leaflet map canvas loaded dynamically on-demand (`leaflet-vendor` chunk).
   - Dynamic bounding box adapting across Odisha coordinates ($81.0^\circ\text{E}–87.5^\circ\text{E}$ and $17.5^\circ\text{N}–22.5^\circ\text{N}$).
   - Mapped pins, selected place banner with "Plan Trip Here", transit hops, and leg details.
5. **Plan Trip Workspace (`/#plan`)**:
   - **Trip History Sidebar**: Persistent client-side session history (`localStorage`) with `+ New Trip`, active conversation switching, and auto-generated trip titles.
   - **Structured Constraint Form**: Days (1–14), interest pills (12 canonical themes), starting location, and date inputs. Supports open exploration.
   - **AI Travel Copilot**: Natural-language planning and refinement grounded in verified place facts and deterministic tools.
   - **Itinerary Presentation**: Daily timeline cards with stops (max 3 per day), durations, and transportation hop badges (mode, data tier, walking/transit duration).
6. **Saved Places (`/#saved`)**:
   - Persistent client-side storage for saved destinations with direct actions to View on Map, View Details, or Plan Trip with saved places.

---

## Core Features & Implementation Status

| Feature | Status | Implementation Details |
|---|---|---|
| **Authoritative Place Dataset** | **Implemented** | 81 canonical places across all 30 districts of Odisha with verified WGS84 coordinates, opening information, visit durations, and official provenance. |
| **30-District & Region Taxonomy** | **Implemented** | 30 administrative districts mapped to canonical regions (`backend/app/core/regions.py` and `frontend/src/utils/regionUtils.ts`). |
| **Physical Categories (13)** | **Implemented** | `temple`, `monument`, `museum`, `market`, `park`, `lake`, `beach`, `nature`, `waterfall`, `wildlife`, `planetarium`, `sports_venue`, `science_center`. |
| **Traveler Interests (12)** | **Implemented** | `heritage`, `spirituality`, `architecture`, `food`, `culture`, `nature`, `beach`, `wildlife`, `waterfall`, `relaxation`, `adventure`, `shopping` (206 verified M:N associations). |
| **Deterministic Itinerary Engine** | **Implemented** | Algorithmic scoring, max 3 stops/day, topological sequencing, facts-only output (`POST /itinerary/plan`). |
| **Transportation Graph & Routing** | **Implemented** | Dijkstra pathfinding over road/rail network with walking threshold $\le 2000$m, explicit data tiers (`static`, `scheduled`, `live`), and `"Long Journey"` badges. |
| **Grounded AI Orchestrator** | **Implemented** | `RuleBasedModelAdapter` mapping conversational intents to deterministic tools; zero hallucination (`POST /ai/plan`). |
| **PostGIS Map Projection** | **Implemented** | Authoritative GeoJSON Point feature and hop projection (`POST /map/v1/projection`). |
| **URL Hash Navigation** | **Implemented** | Bidirectional synchronization across `#discover`, `#destinations`, `#map`, `#plan`, `#saved`, deep linking, Back/Forward browser history, and lazy-loaded map bundle. |
| **Live Weather Integration** | **Implemented** | Isolated Open-Meteo backend adapter with WMO code condition normalization (`GET /weather/current`, `GET /weather/forecast`). |
| **Client-Side Persistence** | **Implemented** | Saved places and multi-turn trip histories stored in `localStorage` without backend session dependencies. |
| **Real-time GTFS Transit Telemetry** | *Future / Unmodeled* | Current transit hops use verified static/scheduled baseline speeds. |
| **District GIS Boundary Polygons** | *Future / Unmodeled* | Current map canvas projects point destinations and routes rather than administrative boundary polygons. |
