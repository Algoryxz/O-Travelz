# Database Design

Status: supporting database detail. The canonical architecture and ownership source is
`docs/ARCHITECTURE.md`; executable schema and migration sources are in
`backend/app/models/` and `backend/alembic/`.

Postgres + PostGIS. SQLAlchemy models live in `backend/app/models/`. This doc is the
supporting detail for entities; changes must be reflected in the canonical documents
and approved migration path.

## Core entities

**Place** — id, name, category_id, lat/lon (geography point), description, opening_hours
(structured, may be null if unknown — never guessed), avg_visit_minutes, price_tier,
source (where the data came from), verified_at.

**Category** — id, name (e.g. temple, museum, market, park, food).

**TransportProvider** — id, name (e.g. "Mo Bus", "Mo E-Ride", "Odisha Yatri", "Auto/E-rickshaw",
"Taxi", "Walking"), mode (bus/rail/paratransit/walk/cab), data_tier
(static | scheduled | live — see transportation doc), notes_on_verification.

**Stop** — id, provider_id, name, lat/lon, external_ref (if a provider ID exists).

**Route** — id, provider_id, name/number, geometry (nullable — only if verified shape
data exists).

**RouteStop** — route_id, stop_id, sequence_order (topology: which stops a route visits,
in order).

**ScheduledTrip** — id, route_id, headway_minutes OR explicit departure times
(nullable — only populate what's actually verified; a route can have headway-only data).

**FareRule** — id, provider_id, rule (flat fare / distance-banded / route-specific),
amount, source, verified_at.

**Itinerary** — id, user_id (nullable, anonymous allowed), constraints (JSON: dates,
interests, pace, budget, start location), created_at.

**ItineraryDay** — id, itinerary_id, day_number, date.

**ItineraryStop** — id, itinerary_day_id, place_id, sequence_order, planned_arrival,
planned_departure.

**TransportHop** — id, from_itinerary_stop_id, to_itinerary_stop_id, mode, provider_id
(nullable if walking), route_id (nullable), estimated_minutes, estimated_cost, `legs`
(structured, e.g. list of {mode, detail, provider, route}), and `data_tier`.

**User** — id, name, email — minimal; only needed to save/revisit a plan. Not an auth
system in v1 (can be a simple token/local-storage handle for the demo).

## Why this shape

- `Place`/`Category`/`FareRule` etc. are separated so that **verification/provenance**
  (`source`, `verified_at`) sits directly on the facts that need it — the parts of the
  system most at risk of being "made up" if left to AI.
- `TransportHop` on an itinerary is a snapshot at plan time (estimated_minutes/cost), not
  a live pointer, so a saved itinerary doesn't silently change when live data updates —
  but it does record `route_id`/`provider_id` so it can be *refreshed* on demand.
- `data_tier` on `TransportProvider` lets every downstream consumer (ranking, itinerary
  builder, AI explanation) know how confident to be, without re-deriving that per query.

## Ownership

Database schema, migrations, and data semantics: Smarak. Verified source data that fills
these tables: Akriti. Rudra supplies backend, API, integration, provider, and routing
requirements; those requirements do not transfer database ownership. Project context
and architecture documentation are maintained by Punam.
