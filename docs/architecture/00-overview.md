# Architecture Overview

## 1. What O-Travelz is trying to accomplish

A visitor to a city (starting scope: Bhubaneswar/Odisha) wants a realistic day-plan or
multi-day plan: which places to see, in what order, and — critically — **how to actually
get between them**, using real local transport (walking, autos, Mo Bus/AMA Bus, Mo E-Ride,
Odisha Yatri, trains for intercity). Most trip planners either ignore transport or bolt on
a generic "get directions" button pointing at a maps app. O-Travelz treats transport as a
first-class part of the plan itself.

## 2. The user journey (end to end)

1. User states intent: dates, interests, pace, budget, mobility constraints, starting
   point (e.g. a hotel).
2. System (deterministic) selects candidate places matching interests, using verified
   place data + a scoring/ranking function (not AI).
3. System (deterministic) sequences those places into a day-by-day route, and for each
   hop between places computes a transport plan (walk / auto / bus / mixed), using the
   transport graph and provider data.
4. AI layer takes the deterministic itinerary + transport plan and turns it into a
   readable explanation, and handles conversational refinement ("make day 2 less
   walking-heavy", "I don't want to spend more than ₹300/day on transport").
5. When the user asks to change something, the AI layer identifies *what changed* in
   structured terms (constraint change) and calls the deterministic itinerary/transport
   services again — it does not "edit" the plan by generating new facts itself.
6. Frontend renders the itinerary, the map, and per-hop transport detail, and lets the
   user confirm, edit constraints, or ask questions.

## 3. Why AI does not "own" facts

LLMs hallucinate specific facts (bus numbers, fares, opening hours, travel times)
confidently and plausibly. If O-Travelz let the AI state these directly, wrong answers
would look identical to right ones to the user. So:

- **Facts** (place exists, coordinates, opening hours, bus route X exists, fare is ₹Y,
  a stop is Z meters away) live in `data/` → imported into the database → served by
  deterministic backend services.
- **Judgment calls with no single correct answer** (which 3 of 8 candidate temples fit a
  "2 hour morning slot", how to word an itinerary as prose) are appropriate for
  deterministic ranking logic or AI *explanation*, respectively.
- **AI orchestration** (`backend/app/ai/`) is only allowed to call tools that return
  verified data/deterministic results, and to compose language around what those tools
  return. See `docs/architecture/03-ai.md`.

## 4. Major system components

```
Frontend (React)
   │  HTTP/JSON
   ▼
Backend API (FastAPI)
   ├── AI orchestration layer      → calls tools below, never invents facts
   ├── Deterministic ranking       → scores/selects places against user constraints
   ├── Itinerary generation        → sequences places + inserts transport hops
   ├── Transportation module       → provider adapters, transit graph, routing
   ├── Geospatial module           → distance/route geometry, map data prep
   └── DB layer (SQLAlchemy)       → Postgres + PostGIS
              ▲
              │ seeded from
        data/ (verified, versioned, human-curated + imported provider data)
```

## 5. Data flow (single itinerary request)

`Frontend → POST /itinerary/plan (constraints) → AI layer parses intent into structured
constraints → Itinerary service calls Ranking service (candidate places) → Itinerary
service calls Transportation service per hop → structured itinerary JSON → AI layer adds
natural-language explanation → response → Frontend renders map + list.`

The structured itinerary JSON is the contract between backend and frontend; it is also
exactly what the AI layer reads to write its explanation. See
`docs/architecture/05-contracts.md` for the schema.

## 6. Database entities (high level)

See `docs/architecture/02-database.md` for full detail. Summary: `Place`, `Category`,
`TransportProvider`, `Stop`, `Route`, `ScheduledTrip`, `FareRule`, `Itinerary`,
`ItineraryDay`, `ItineraryStop`, `TransportHop`, `User` (minimal, for saved plans).

## 7. Transportation model

See `docs/transportation/00-transport-model.md`. Summary: transport data has three
freshness tiers — **static** (route/stop topology, fare tables — rarely changes),
**scheduled** (timetables where they exist), and **live** (real-time position/ETA, only
where an API is actually verified to exist). The system must degrade gracefully: if only
static data exists for a provider, itineraries say "Mo Bus route 5 runs roughly every
15–20 min" rather than fabricating a live ETA.

## 8. Map/geospatial model

Susmita owns the map/geospatial subsystem, including routes, route lines, and multimodal
map visualization. Rudra's backend/API layer exposes verified geometry and routing
outputs (stop locations, walking paths where available, route shapes where available) as
GeoJSON for that subsystem. Deeptiman integrates the map layer into the complete
frontend experience. AI never computes geometry; it only refers to place/stop names and
reads distances/durations that the backend already computed.

## 9. Frontend structure

React + TypeScript + Vite. Three main views: itinerary (day-by-day list), map (places +
route + transport hops), and a conversation panel (AI refinement). Frontend never talks
to AI providers directly — everything goes through the backend API so factual grounding
stays enforced server-side.

## 10. Testing strategy

- Backend: `pytest`. Unit tests per module (ranking, transport adapters, itinerary
  builder). Contract tests on the itinerary JSON schema. AI layer tests use recorded
  tool-call transcripts, not live model calls, so they're deterministic in CI.
- Frontend: `vitest` + component tests for map/itinerary rendering against fixture JSON
  matching the backend contract.

## 11. Deployment

`infra/` holds environment config and a docker-compose setup for local dev (Postgres +
PostGIS, backend, frontend). Production deployment target is decided later once the demo
is validated — not a blocker for Phase 0–7 work.

## 12. Non-goals for v1

- No payments/booking.
- No live GPS tracking of the user.
- No coverage beyond Bhubaneswar/Odisha until the model is proven.
- No provider integration without verifying the provider actually exposes usable data
  (see `docs/transportation/01-providers.md`).
