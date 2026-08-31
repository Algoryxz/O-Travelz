# SYSTEM_DESIGN.md — O-TRAVELZ Service Boundary Documentation

> Read `PROJECT_CONTEXT.md` first for full project background.
> This document describes intended service boundaries and what each domain owns.

---

## Design Principle

```
UI
  → Orchestration Layer
    → Domain Services
      → Canonical Data / Verified Providers
```

The UI asks for outcomes, not raw data.
Domain services own canonical facts.
AI interprets intent and explains outcomes — it does not generate facts.

---

## Service Domains

### Place Intelligence

**Owns:**
- Place search (keyword, category, interest)
- Proximity ranking and nearby discovery
- Place metadata (name, district, category, description, opening hours, contact)
- Place filtering (by publishable status, category, district, interests)
- Place images and image linkage

**Does NOT own:**
- AI-generated place descriptions (AI may paraphrase, but canonical data is authoritative)
- Invented opening hours or phone numbers

**Key files:**
- `backend/app/api/places_routes.py`
- `backend/app/services/search/`
- `backend/app/models/place.py`
- `data/places/places.json`
- `frontend/src/data/odishaEssentials.ts` (offline fallback)

---

### Trip Intelligence

**Owns:**
- Itinerary construction from planning constraints (days, start location, interests)
- Geographic sequencing of stops
- Opening-hours filtering
- Time-budget allocation
- Stop replacement suggestions
- "Why this stop?" deterministic rationale

**Does NOT own:**
- Raw place data (delegates to Place Intelligence)
- Transport feasibility (delegates to Mobility Intelligence)
- Natural language of the itinerary explanation (AI Interpretation formats the output)

**Key files:**
- `backend/app/services/itinerary/`
- `backend/app/transport/planner.py`
- `backend/app/api/itinerary_routes.py`
- `frontend/src/pages/ItineraryPlannerPage.tsx`

---

### Mobility Intelligence

**Owns:**
- Canonical transit stop registry
- Canonical route definitions
- Stop-to-route relationships
- Schedule lookup (next scheduled departure)
- Nearest stop discovery
- Walking-time estimates (80 m/min standard)
- Multimodal journey comparison (private vs public transit)
- Transit map data for frontend rendering

**Does NOT own:**
- Live vehicle GPS positions (no public CRUT telemetry exists)
- Confirmed per-stage fares (universally null/unknown)
- Road-snapped polyline geometry (not currently available)

**Verified data boundaries:**
- Departure times are from published official CRUT timetables — label as `Scheduled`
- Distances are Haversine-based — label as `Estimated`
- Stop coordinates are from OSM Nominatim or cross-referenced canonical sources — label as `Verified`

**Key files:**
- `backend/app/transport/engine.py`
- `backend/app/transport/planner.py`
- `backend/app/transport/comparator.py` *(planned)*
- `backend/app/api/transport_routes.py`
- `data/transport/canonical/` *(target canonical directory)*
- `data/transport/static/ama_bus_schedule.json`
- `frontend/src/data/staticTransitStops.ts`
- `frontend/src/data/transitTimetables.ts`

---

### Context Intelligence

**Owns:**
- Live weather data (Open-Meteo, no API key required)
- User location resolution
- Time-of-day context

**Does NOT own:**
- Forecast-based planning decisions (those belong in Trip Intelligence using weather signals as input)

**Key files:**
- `backend/app/api/weather_routes.py`
- `backend/app/api/location_routes.py`
- `frontend/src/components/stitch/StitchWeatherSection.tsx`

---

### AI Interpretation

**Owns:**
- Natural language intent parsing
- Multilingual detection and handling (English, Odia, Hindi)
- Multi-turn conversation management
- Explanation of deterministic plan output
- Conversational refinement of constraints

**Does NOT own (AI must NOT fabricate):**
- Coordinates
- Route numbers
- Departure times
- Opening hours
- Phone numbers
- Entry fees
- Fares
- Itinerary facts

**Provider fallback chain:**
```
Azure OpenAI → Gemini → NVIDIA NIM → Groq → Rule-based deterministic
```

Each step is tried only if the previous is unavailable or times out.
Rule-based fallback must always be available without external credentials.

**Key files:**
- `backend/app/ai/conversation.py` — orchestrator
- `backend/app/ai/adapter.py` — provider chain
- `backend/app/ai/model.py` — intent parsing / rule-based adapter
- `backend/app/ai/multilingual.py` — language detection
- `backend/app/ai/tools/` — tool implementations (build_itinerary, search_places, plan_transport_hop)
- `backend/app/ai/grounding_verifier.py` — post-response fact verification

**Important**: `backend/app/ai/image_classifier.py` is **not** a vision model.
It uses keyword/filename heuristics against `LANDMARK_VISUAL_SIGNATURES`. Do not describe it as neural recognition.

---

### Data Quality

**Owns:**
- Destination publishability gate
- Image validation pipeline
- Provenance tracking
- Deduplication logic
- Staging vs production separation

See `DATA_QUALITY.md` for full specification.

**Key files:**
- `data/images/sources/manifest.json`
- `data/images/sources/rejected_candidates.json`
- `scripts/image_audit.py` *(planned)*
- `scripts/image_validate.py` *(planned)*
- `scripts/update_publishability.py` *(planned)*

---

## Resilience Architecture

| Level | Condition | What stays operational |
|---|---|---|
| L1 Full | All services healthy | Everything |
| L2 AI degraded | AI provider timeout/unavailable | Rule-based planner, all other features |
| L3 Backend degraded | Backend unreachable | Place catalog (bundled), transit timetables (bundled), proximity (bundled), saved places (localStorage) |
| L4 Demo safe | `?demo=true` or explicit flag | Fully deterministic path; OAuth disabled; demo badge shown |

No fallback mode presents static data as live data.

---

## Data Flow: Itinerary Planning

```
User message (natural language)
  → [AI Interpretation] intent + constraints
    → [Trip Intelligence] candidate places retrieval
      → [Place Intelligence] search + rank by interest + proximity
        → [Trip Intelligence] opening-hours filter + time-budget sequencing
          → [Mobility Intelligence] transport feasibility + multimodal comparison
            → [AI Interpretation] format explanation in user's language
              → Structured response with provenance labels
```

---

## Anti-patterns to Avoid

| Anti-pattern | Why |
|---|---|
| LLM generating coordinates or schedules | AI fabricates; domain services own canonical facts |
| React component making direct DB queries | Business logic belongs in domain services |
| Frontend and backend maintaining separate transit stop universes | Creates drift; one canonical source required |
| Displaying unstaged research data in production catalog | Quality gate must be passed first |
| Showing heuristic result as "live" or "real-time" | Misrepresents capability; damages credibility |
| Large refactors without a rollback path | Risks breaking the demo |
