# Transportation Model

Backend/provider/routing owner: Rudra. Research and verified transport-data owner: Akriti.
Core itinerary and AI-orchestration owner: Smarak. Frontend transportation UI owner:
Deeptiman. Map/geospatial and multimodal visualization owner: Susmita. Documentation and
shared project-context owner: Punam.

## Entities

- **Provider** — Mo Bus / AMA Bus, Mo E-Ride, Odisha Yatri, Auto/E-rickshaw, Taxi, Train
  (intercity), Walking. Each has a `mode` and a `data_tier`.
- **Stop** — a physical point a provider serves.
- **Route** — a named/numbered line a provider runs (not applicable to auto/taxi/walk).
- **RouteStop** — ordered topology of stops on a route.
- **ScheduledTrip** — timing info, where it exists (explicit times or headway range).
- **FareRule** — how to compute cost for a hop.
- **TransportHop** — the actual planned segment inside an itinerary (see database doc).
- **Transfer** — a hop that changes mode/route mid-journey (walk → bus → walk is one hop
  with multiple `legs`, per the contract doc — not multiple hops — because it's one
  planning unit between two itinerary stops).

## Phase 2 persistence boundary

The live Phase 2 database adds `TransportProviderSource` for provider-specific source and
tier records and `ScheduledTripGroup` for source-traceable timetable groups. A confirmed
stop may have `location = NULL` when identity is verified but its exact coordinate is not;
coordinate status, reconciliation status, source, effective date, verification date, and
notes remain explicit. Fare rules preserve unknown/status metadata without inventing a
fare value. The corrected AMA adapter imports only the evidence-backed confirmed slice;
it does not create Route 12 canonical stop mappings where the source candidates are blank.

## Data tiers (critical distinction)

1. **Static** — topology and fare structure that changes rarely: which stops a route
   visits, in what order; flat/banded fare rules. This is collectible by research
   (Akriti) and does not require a live API.
2. **Scheduled** — timetables. Where a provider publishes real timetables, store them.
   Where they don't (common for auto/e-rickshaw, and even for some bus routes), store a
   **headway estimate** ("roughly every 15–20 min, 6am–9pm") instead — and label it as
   such. Never fabricate a specific departure time for a system that doesn't have fixed
   times.
3. **Live** — real-time position/ETA. **Only implement if a provider genuinely exposes
   this and it has been verified** (see `01-providers.md`). If not verified, the system
   must not claim live data — it falls back to scheduled/static and says so.

Every `TransportHop` and `get_provider_status()` result carries `data_tier` so nothing
downstream (itinerary builder, AI explanation, frontend badge) can accidentally present
static/estimated data as live fact.

The Phase 4 API/schema boundary may use `unknown` for an unavailable or unsupported
state that cannot honestly be represented as static, scheduled, or live. This is an
honesty state, not a new provider freshness tier, and it is not added to the Phase 2
database enum.

## Provider adapter pattern

`backend/app/transport/adapters/` — one adapter per provider, implementing a common
interface (`backend/app/transport/adapters/base.py`):

```python
class TransportAdapter:
    def get_stops(self) -> list[Stop]: ...
    def get_routes(self) -> list[Route]: ...
    def get_data_tier(self) -> DataTier: ...
    def estimate_fare(self, from_stop, to_stop) -> FareEstimate: ...
    # get_live_status() only implemented by adapters that actually have a verified live source
```

Adapters for providers with no verified API just read from `data/transport/static/` —
they don't need to *be* API clients to exist; they normalize whatever data is available
(researched/manual for auto & taxi, published GTFS-like data if Mo Bus provides it,
manual entry otherwise) into the same interface everything else uses.

## Routing / multimodal journey planning

`backend/app/transport/graph/` builds a graph of stops + walking edges (derived from
geospatial distance, see `docs/architecture` geospatial notes) + route edges (from
`RouteStop` topology), and runs a shortest/simplest-path search constrained by mode
preferences from the itinerary constraints (e.g. "avoid long walks"). Output is exactly
the `legs` array shape in the itinerary contract.

## Walking segments

Always available as a fallback mode; computed from geospatial straight-line or
network distance (see geospatial module), with a conservative walking speed assumption
documented in code (not hidden).

## Failure states

- No route found between two points within constraints → itinerary builder must surface
  this per-hop rather than silently dropping the stop (`TransportHop.mode = "unavailable"`,
  with a reason).
- Provider data missing entirely → adapter returns empty and the itinerary builder must
  still be able to fall back to walk/auto/taxi rather than crash.

## Frontend representation

Each hop is rendered as a small ordered strip of legs (icon per mode + short text), plus
a data-tier badge when not live. Full detail: `docs/architecture` frontend section and
the Deeptiman/Susmita team files.

## AI interaction

AI only calls `get_provider_status` / reads hop data already computed — it does not plan
routes itself. See `docs/architecture/03-ai.md`.
