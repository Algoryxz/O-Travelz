# O-Travelz Canonical Architecture

Status: canonical architecture and ownership boundary

This document consolidates the approved architecture currently described in the
repository. It describes the intended system boundaries without adding product
requirements. The implementation is currently a skeleton; missing implementation is
tracked in `docs/MEMORY.md` and future paths are marked in `docs/REPOSITORY_MAP.md`.

## Architectural principles

1. AI orchestrates; it does not invent travel facts.
2. Verified data and deterministic services are the source of truth for factual output.
3. Contracts are stabilized before dependent implementation.
4. Provider freshness is explicit: static, scheduled, or live.
5. Ownership boundaries are enforced across core logic, backend, research, maps,
   frontend, and documentation.
6. The initial geographic scope is Bhubaneswar/Odisha.

## System shape

```text
Frontend (React + TypeScript + Vite)
    │ HTTP/JSON contracts
    ▼
Backend API (FastAPI)
    ├── AI orchestration
    ├── deterministic ranking
    ├── itinerary generation
    ├── transport providers and routing
    ├── geospatial outputs
    └── database access (SQLAlchemy)
             │
             ▼
       PostgreSQL + PostGIS
             ▲
             │ imported verified data
       data/ (human-researched and sourced)
```

The current repository implements the FastAPI health endpoint, SQLAlchemy model
foundation, Phase 0 boundary schemas, migration scaffolding, and contract tests.
Ranking, itinerary generation, AI execution, routing, geospatial behavior, and the
frontend flow are not yet implemented.

## Ownership and boundaries

| Area | Owner | Boundary |
|---|---|---|
| Core brain, database, data semantics | Smarak | Defines semantic meaning and deterministic core behavior. |
| Ranking and candidate selection | Smarak | Selects places deterministically from verified data and constraints. |
| Itinerary logic | Smarak | Sequences places and coordinates transport-hop planning. |
| AI orchestration | Smarak | Parses intent, calls approved tools, and explains returned results. |
| Research and verification | Akriti | Produces sourced place and transport research; does not implement the database or providers. |
| Backend and APIs | Rudra | Exposes backend boundaries and integrations; does not own ranking or itinerary semantics. |
| Providers and routing | Rudra | Normalizes verified provider data and plans transport paths. |
| Maps and geospatial | Susmita | Owns geometry, route lines, and multimodal map visualization. |
| Complete frontend and UX | Deeptiman | Owns all user-facing views, state, and map integration. |
| Documentation and release readiness | Punam | Owns canonical context, phase tracking, evidence, demo, and readiness. |

## Data and database

Verified human-curated data lives in `data/` and is imported into PostgreSQL/PostGIS.
Facts must retain source and verification information. The documented entities are:

- `Place` and `Category`;
- `TransportProvider`, `Stop`, `Route`, `RouteStop`, `ScheduledTrip`, and `FareRule`;
- `Itinerary`, `ItineraryDay`, `ItineraryStop`, and `TransportHop`;
- `User` exists in the current model as a minimal persistence-related entity, but a
  save/revisit product flow is not approved in the PRD.

The database model is implemented in `backend/app/models/`. The Phase 0 migration
scaffold is in `backend/alembic/` with configuration in `backend/alembic.ini`. Schema
changes belong to Smarak and must use this migration path.

`OPEN DECISION`: The documentation describes place coordinates as `lat`/`lon`, while
the current model stores a PostGIS `location` field. The canonical import/API mapping
must be approved before implementation.

`OPEN DECISION`: The documentation uses both `rule` and `rule_type` for fare rules,
and the current model lacks all documented verification metadata. Smarak and Akriti
must approve the final semantic field set.

## Verified data and provenance

Akriti's research is the source for places, providers, routes, schedules, fares, and
verification evidence. Rudra's adapters may consume only providers that have been
verified in the provider-verification record. Smarak's imports must preserve source and
freshness information.

No AI-generated placeholder is authoritative data. The current place file contains an
explicit example placeholder and the transport static directory contains no provider
records; this is an incomplete project state, not usable product data.

## Transportation

The transport subsystem normalizes provider data through a common adapter interface and
plans multimodal hops over provider and walking edges. A hop is one planning unit between
two itinerary stops and may contain ordered legs such as walk → bus → walk.

The Phase 0 executable transport boundary is defined in
`backend/app/schemas/transport.py` and mirrored by
`frontend/src/api/contracts.ts`. It defines legs, data tiers, provider status, and the
explicit unavailable reason field without implementing any provider.

Transport data tiers are:

- `static`: topology and fare information that changes rarely;
- `scheduled`: verified timetables or explicit headway information;
- `live`: verified real-time position or ETA data.

Estimates must be labeled as estimates and must not be represented as live facts. The
model currently uses the three values above; the transport documentation also uses the
phrase “estimate-only.”

`OPEN DECISION`: Confirm the exact metadata field used to distinguish an estimated
static or scheduled value from a verified value while preserving the three primary
data-tier values.

If no route is found, the transport result must contain an explicit unavailable state
with a reason. Missing provider data must fall back honestly where the approved
transport rules allow it, rather than causing a fabricated route.

## Ranking and itinerary

Ranking is deterministic and uses verified place data plus structured user constraints.
Itinerary logic sequences selected places into days and requests a transport plan for
each hop. Neither ranking nor itinerary semantics belong in provider adapters or the
frontend.

The structured itinerary contract is the shared output consumed by backend, AI, map,
and frontend layers. Its documented top-level fields are `itinerary_id`, `constraints`,
`days`, and `explanation`. Days contain ordered stops and hops; hops contain ordered
legs, estimated duration/cost, and `data_tier`.

The Phase 0 executable itinerary and HTTP boundary schemas are in
`backend/app/schemas/itinerary.py` and `backend/app/schemas/api.py`. They validate the
existing fixture shape; the endpoint and deterministic itinerary service remain later
phase work.

## AI orchestration

AI has three responsibilities:

1. Understand intent and produce structured constraints.
2. Orchestrate approved deterministic tools.
3. Explain deterministic results and process refinements.

The approved tool concepts are:

- `search_places`;
- `build_itinerary`;
- `plan_transport_hop`;
- `get_place_details`;
- `get_provider_status`.

The AI layer must not query the database directly, compute geometry, rank places,
sequence stops, compute fares/durations, or state facts absent from current-turn tool
results.

Phase 0 defines only the argument/result schemas in `backend/app/ai/schemas.py`. It does
not execute a model or tool.

## Maps and geospatial behavior

Susmita owns map and geospatial behavior, route lines, and multimodal visualization.
Rudra exposes verified geometry and routing outputs through backend contracts. Deeptiman
integrates those outputs into the complete frontend. AI only reads deterministic distance,
duration, place, and stop values.

`OPEN DECISION`: The exact GeoJSON/map contract for places, stops, route lines, hop-leg
geometry, identifiers, and unavailable geometry states has not been approved.

Phase 0 records this boundary in `frontend/src/components/map/README.md`; no geometry
implementation is present.

## Frontend

The current package identifies the frontend as React + TypeScript + Vite. The intended
approved views are itinerary, map, and conversation/refinement. The frontend consumes
backend JSON contracts and does not call AI providers directly.

Loading, error, transport data-tier, and replanning states belong to the frontend. The
frontend must not duplicate ranking, itinerary, provider, routing, or authoritative
geospatial logic.

`OPEN DECISION`: Team documents also mention a separate discovery/search surface,
filters, place cards, and recommendation presentation. Their product status must be
resolved in the PRD before frontend implementation.

## API and external-provider boundaries

The documented primary endpoint is `POST /itinerary/plan`. Rudra owns HTTP/API wiring;
Smarak owns the semantic itinerary and AI behavior behind the boundary. The backend
returns structured itinerary data, and AI explanation is grounded in that structure.

Phase 0 provides validated request, response, and error schemas only. The route is not
wired until the later itinerary/API implementation phase.

External provider integrations are allowed only after Akriti's verification. Rudra's
adapter layer must preserve provider data tier and failure states.

`OPEN DECISION`: Request validation, error schema, API versioning, anonymous-user
behavior, and exact endpoint registration are not yet stabilized.

## Dependencies and handoffs

```text
Akriti verified data
        ↓
Smarak database/import and semantics
        ↓
Rudra providers/routing ──┐
        ↓                 │
Smarak ranking/itinerary ─┘
        ↓
Smarak AI orchestration
        ↓
Rudra API contracts
        ├── Susmita map/geospatial visualization
        └── Deeptiman complete frontend
        ↓
Punam integration evidence, demo, and readiness records
```

The build order and phase gates are canonical in `docs/PHASES.md`.
