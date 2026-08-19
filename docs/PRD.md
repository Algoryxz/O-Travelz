# O-Travelz Product Requirements Document

Status: Canonical Whole-Odisha Product Scope (Productionized)

This document is the product source of truth. O-Travelz is a transportation-aware trip-planning and destination exploration platform covering the entire state of Odisha.

---

## Product Purpose

O-Travelz is a transportation-aware travel platform and itinerary engine for the entire state of Odisha. It enables visitors, locals, students, and families to explore verified destinations across all geographic zones (Coastal, Central, Southern Hills & Lakes, Western Odisha, Northern & Wildlife, and Tribal Highlands) and produce realistic single-day and multi-day itineraries with transportation hops, maps, and conversational AI assistance.

The central product principle is:

> AI orchestrates and refines. It does not invent facts. All itineraries, places, and coordinates are grounded in verified data.

---

## Target User

A traveler planning time in Odisha who wants a practical itinerary and discovery tool grounded in verified place and transportation information, with reliable maps, persistent saved places, and multi-turn conversational trip refinement.

---

## Approved Navigation & Views

1. **Discover (`/`)**:
   - Live location and hero carousel showcasing major Odisha destinations.
   - Quick-action strip for live map, nearby services, and AI copilot.
   - Categorized collections, weather overview, and curated detours.
2. **Destinations / All Destinations (`/destinations`)**:
   - Whole-Odisha destination catalog with region filters (`Puri & Coastal`, `Konark & Marine`, `Bhubaneswar & Central`, `Cuttack & Mahanadi`, `Chilika & Southern Coast`, `Kandhamal & Southern Hills`, `Sambalpur & Western Odisha`, `Rourkela & Sundargarh`, `Northern Odisha & Wildlife`, `Koraput & Tribal Highlands`).
   - Category filtering (`temple`, `monument`, `nature`, `beach`, `waterfall`, `wildlife`, `museum`, `lake`, `park`).
   - Real-time search by name, district, or theme.
   - Destination cards with travel photography, badges, quick Save, View on Map, and Plan Trip actions.
3. **Place Details Modal**:
   - Reusable modal displaying verified place facts: name, category, region, description, coordinates, average visit duration, entry price tier, and official source provenance.
   - Action triggers: "Save Place" (synced with client storage), "Explore on Map", and "Plan Trip Here".
4. **Interactive Map (`/map`)**:
   - State-wide dynamic SVG map canvas adapting bounds to returned places across longitudes 81°E–87.5°E and latitudes 17.5°N–22.5°N.
   - Mapped pins, selected place banner with "Plan Trip Here", transit hops, and leg details.
5. **Plan Trip Workspace (`/plan`)**:
   - **Trip History Sidebar**: Persistent client-side session history (`localStorage`) with `+ New Trip`, active conversation switching, and auto-generated trip titles.
   - **Structured Constraint Form**: Days (1–14), interest pills (temple, heritage, food, nature, beach, wildlife, waterfall, monument, museum, market, lake, park), starting location, and date inputs. Supports empty interests ("Surprise Me").
   - **AI Travel Copilot**: Natural-language planning and refinement grounded in verified place facts and tools.
   - **Itinerary Presentation**: Daily timeline cards with stops, durations, and transportation hop badges (mode, data tier, walking/transit duration).
6. **Saved Places (`/saved`)**:
   - Persistent client-side storage for saved destinations with direct actions to View on Map, View Details, or Plan Trip with saved places.

---

## Core Features & Guarantees

- **Authoritative Whole-Odisha Place Dataset**: 50+ verified places across all 30 districts of Odisha with real coordinates, opening information, visit durations, and official source links.
- **Deterministic Candidate Selection & Ranking**: Algorithmic scoring based on user interests, time constraints, and coordinate availability.
- **Transportation-Aware Hops**: Graph-based hop computation supporting walking and transit adapters with strict data tiers (static, scheduled, live).
- **Grounded AI Orchestration**: Intent classification and tool orchestration against deterministic services. Unsupported requests or unknown locations produce clear, natural clarifications rather than fabricated itineraries.
- **Lightweight Client Persistence**: Saved places and multi-turn conversations persist in `localStorage` without requiring user accounts or backend session tracking.
- **Zero Developer Jargon**: All user interfaces use natural consumer travel terminology.
