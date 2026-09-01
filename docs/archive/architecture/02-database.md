# Database Design

Status: supporting database detail. The canonical architecture and ownership source is
`docs/ARCHITECTURE.md`; executable schema and migration sources are in
`backend/app/models/` and `backend/alembic/`.

Postgres + PostGIS. SQLAlchemy models live in `backend/app/models/`. This doc is the
supporting detail for entities; changes must be reflected in the canonical documents
and approved migration path.

## Core entities

**Place** — database id, optional research_id, name, category_id, lat/lon (geography
point), description, opening_hours (structured, may be null if unknown — never guessed),
avg_visit_minutes, price_tier, source, verified_at, source_provenance_note,
coordinate_verification, coordinate_audit_status, and audit_status. Research IDs are
traceability identifiers; the database continues to use UUID primary keys.

**Category** — id, name (the canonical physical place type, e.g. temple, museum, market,
park, beach, lake, monument, nature, waterfall, wildlife, planetarium, sports_venue, science_center),
display_name, and description.

**Interest** — id, name (the canonical traveler-facing thematic attribute, e.g. heritage, spirituality,
architecture, food, culture, nature, beach, wildlife, waterfall, relaxation, adventure, shopping),
display_name, and description.

**PlaceInterest** — id, place_id, interest_id, with a unique constraint on (place_id, interest_id) to
provide normalized many-to-many associations between places and thematic interests.

**TransportProvider** — id, name (e.g. "Mo Bus", "Mo E-Ride", "Odisha Yatri", "Auto/E-rickshaw",
"Taxi", "Walking"), legacy default data_tier (static | scheduled | live — see transportation
doc), notes_on_verification. **TransportProviderSource** holds the source-specific tier,
source, effective date, verification date, and notes so static and scheduled evidence for
one provider do not collapse into one tier.

**Stop** — id, provider_id, name, optional published/matched names, nullable geography point,
external_ref, research_id, canonical_stop_id, coordinate_status, reconciliation_status,
source, effective date, verification date, and notes. A NULL location can therefore mean an
identity-confirmed stop whose exact physical coordinate is still unresolved.

**Route** — id, provider_id, name/number, route_code, route_name, source, source page/reference,
effective date, verification date, notes, and geometry (nullable — only if verified shape
data exists).

**RouteStop** — route_id, stop_id, sequence_order (topology: which stops a route visits,
in order).

**ScheduledTrip** — id, route_id, headway_minutes OR explicit departure times
(nullable — only populate what's actually verified; a route can have headway-only data).

**ScheduledTripGroup** — id, route_id, group label, source/page, effective date, data tier,
verification metadata, and three preserved JSON time layers: raw source-order, normalized
source-order, and chronological. It represents source timetable groups without creating
route-stop topology.

**FareRule** — id, provider_id, rule (flat fare / distance-banded / route-specific),
amount (nullable), source, verified_at, status, currency, and verification note. Unknown
fare state remains explicit and never supplies a fabricated amount.

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
- `TransportProviderSource.data_tier` lets every downstream consumer distinguish static,
  scheduled, and live evidence without re-deriving source provenance or collapsing layers.

## Ownership

Database schema, migrations, and data semantics: Smarak. Verified source data that fills
these tables: Akriti. Rudra supplies backend, API, integration, provider, and routing
requirements; those requirements do not transfer database ownership. Project context
and architecture documentation are maintained by Punam.
