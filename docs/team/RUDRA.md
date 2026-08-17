# Rudra — Backend, APIs & Transportation Integrations

## Read first
- `docs/transportation/00-transport-model.md`
- `docs/transportation/01-providers.md` (Akriti's findings — read once she's filled it in)
- `docs/architecture/02-database.md` (transport entities)
- `docs/architecture/05-contracts.md` (the `hops`/`legs` shape you must produce)

## What you build

You own backend, APIs, external integrations, transportation providers, and routing.
This includes provider adapters that normalize whatever data exists (static, scheduled,
or live) into one interface, and a routing graph that plans multimodal hops between two
points.

Smarak owns ranking, itinerary logic, and AI orchestration. Deeptiman owns the frontend
and user experience. Susmita owns maps/geospatial visualization. Akriti owns transport
research and verified sources. Punam owns documentation and release coordination.

### Files you create

- `backend/app/transport/adapters/base.py` — the `TransportAdapter` interface (see
  transport model doc for the method signatures).
- `backend/app/transport/adapters/mo_bus.py`, `mo_e_ride.py`, `odisha_yatri.py`,
  `auto_rickshaw.py`, `taxi.py`, `walking.py` — one per provider Akriti verified as
  in-scope. Each reads from DB (post-import) or `data/transport/static/` directly for
  early dev, and reports its own `data_tier` honestly based on what Akriti verified —
  **never implement a "live" method for a provider Akriti marked static/estimate-only.**
- `backend/app/transport/graph/build_graph.py` — builds a graph of stops (nodes) +
  walking edges (from geospatial distances) + route edges (from `RouteStop` topology).
- `backend/app/transport/graph/pathfind.py` — shortest/simplest multimodal path search
  given a mode-preference constraint (e.g. avoid long walks, minimize transfers).
- `backend/app/transport/service.py` — `plan_transport_hop(from_place, to_place,
  constraints) -> TransportHop`, the public function Smarak's itinerary logic calls.
  Wraps graph + adapters, outputs the exact `legs` shape from the contract doc, including
  `data_tier` and a clear `"unavailable"` mode + reason when no route can be found within
  constraints.
- `backend/tests/test_transport/` — unit tests per adapter + pathfinding tests with known
  fixture stops/routes.

## Files you need to read
- Smarak's `backend/app/services/itinerary/` once it exists, to make sure your
  `plan_transport_hop` signature matches what Smarak actually calls.

## What must be completed before you start
- Akriti's Phase 1 provider verification and the latest relevant research handoff.
- Smarak's Phase 2 live-verified database/import outputs, recorded in
  `docs/handoffs/2026-08-17_RUDRA_PHASE2_TRANSPORT_HANDOFF.md`.
- A scope check and Markdown task report identifying the Phase 3 files, dependencies,
  and ownership boundary.

## What you hand off
- `plan_transport_hop()` service → Smarak (itinerary logic calls it per hop).
- `get_provider_status()` (small function exposing `data_tier` + notes) → Smarak's AI
  orchestration, so the AI can honestly caveat transport info.

## Definition of done
- [ ] Every demo-relevant provider has a working adapter reporting the correct
      `data_tier` (matching what Akriti verified — no adapter overclaims live data).
- [ ] `plan_transport_hop` returns a real multimodal plan (e.g. walk→bus→walk) for at
      least one real from/to pair in the demo scenario, matching the contract shape.
- [ ] Failure state handled: an unreachable pair returns `mode: "unavailable"` with a
      reason, not a crash or a fabricated plan.
- [ ] Tests pass with fixture data (don't require a live DB for unit tests where
      avoidable).

## Checklist
[ ] `TransportAdapter` base interface defined
[ ] Adapter per demo-relevant provider, `data_tier` correctly reported
[ ] Graph builder (stops + walking edges + route edges)
[ ] Pathfinding respecting mode-preference constraints
[ ] `plan_transport_hop` matches the itinerary contract's `hops`/`legs` shape exactly
[ ] `get_provider_status` exposed for the AI layer
[ ] Unit tests for adapters + pathfinding
[ ] Handed off to Smarak, with the interface and evidence documented for Punam's shared
project context

## Required evidence protocol

Before work, read the canonical documents, this team document, the build guide, current
`docs/MEMORY.md`, the latest relevant handoff, and the latest relevant phase report;
identify dependencies, ownership boundaries, and planned changes. During work, preserve
provider evidence and data tiers, record decisions, blockers, tests, and unresolved
questions, and never invent provider facts. After work, inspect the diff, run relevant
tests, create/update a Markdown task or session report, record files/tests/decisions/
limitations, create dependent-agent handoffs, and update MEMORY only for actual state.

## Reusable AI-start prompt

```text
You are assisting Rudra on O-Travelz backend, APIs, integrations, transportation
providers, and routing.

Before coding, read docs/PRD.md, docs/RULES.md, docs/ARCHITECTURE.md, docs/PHASES.md,
docs/MEMORY.md, docs/REPOSITORY_MAP.md, docs/team/RUDRA.md, the Rudra build guide, the
latest relevant handoff, and the latest relevant phase completion report.

Report the current phase, status, task, dependencies, blockers, and next action. Own
backend/API wiring, verified provider adapters, integrations, and routing. Do not own
ranking, itinerary semantics, AI orchestration, complete frontend UX, or authoritative
map/geospatial visualization. Never invent provider APIs, routes, fares, schedules, or
live status. If the request conflicts with the canonical documents, STOP and report the
conflict. Do not code until the user says to proceed.
```
