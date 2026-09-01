# Work Order

Status: supporting phase summary. The canonical phase order, acceptance criteria, tests,
exit criteria, and handoffs are in `docs/PHASES.md`.

Dependency-driven, not calendar-driven — a phase starts when its inputs exist, and
several phases can run in parallel once their prerequisites are met.

## Phase 0 — Core brain, architecture context & repo skeleton
**Who:** Smarak for the core brain and database; Rudra for backend/API wiring; Punam for
shared project context and architecture documentation.
**What:** This repo structure, `docs/architecture/*`, DB schema doc, backend skeleton
(FastAPI app boots, empty routers), CI config for `pytest`.
**Produces:** `backend/app/main.py`, `backend/app/models/*` (empty/skeleton),
`docs/architecture/*`.
**Must be finished before:** everyone else's Phase 1+ work starts (they need to know
where files go and the DB shape).

## Phase 1 — Research & verified data
**Who:** Akriti
**Can start:** immediately, parallel to Phase 0 (doesn't depend on code, only on the doc
templates in `docs/transportation/01-providers.md` and `data/README.md`, which exist
from Phase 0).
**What:** Fill `docs/transportation/01-providers.md`, populate `data/places/`,
`data/transport/static/`, `data/transport/fares/`.
**Produces:** verified data files (see Akriti's team file for exact schema/paths).
**Must be finished (at least a usable v1 subset) before:** Phase 2 (DB import),
Phase 3 (transport adapters).

## Phase 2 — Database & import
**Who:** Smarak (schema already scaffolded in Phase 0; now populate real migrations +
import scripts), consuming Akriti's Phase 1 output.
**Produces:** working Postgres schema, `scripts/import_places.py`,
`scripts/import_transport.py`, seeded local dev DB.
**Status:** Engineering acceptance is complete. Final AMA Phase 6A research closure is
complete without a defensible GIS identity crosswalk; unresolved data-quality items
remain explicit and do not invalidate the verified database/import outputs. AMA
coordinate mapping and AMA route geometry remain outside the gated Phase 6A scope.

**Must be finished before:** Phase 3 and Phase 4 database dependencies are satisfied by
the live-verified Phase 2 outputs; each later phase still follows its own canonical gate
in `docs/PHASES.md`.

## Phase 3 — Transportation module
**Who:** Rudra
**Depends on:** Phase 1 provider verification and Phase 2 database/import outputs; both
canonical inputs are available. Unresolved research states remain explicit.
**Produces:** `backend/app/transport/adapters/*`, `backend/app/transport/graph/*`,
working `plan_transport_hop` service.
**Must be finished before:** Phase 4 can produce real (non-mocked) hops; Phase 4 can
still build against a mock in parallel.

## Phase 4 — Deterministic ranking + itinerary generation
**Who:** Smarak
**Depends on:** Phase 2 (DB). Can build ranking against seeded place data as soon as
Phase 2 lands; itinerary generation needs Phase 3's transport service for real hops
(mockable before then).
**Produces:** `backend/app/services/ranking/*`, `backend/app/services/itinerary/*`, the
`POST /itinerary/plan` endpoint (facts-only, no AI text yet), contract doc kept in sync.

## Phase 5 — AI orchestration layer
**Who:** Smarak
**Depends on:** tool contracts (can start against mocked tools immediately after
Phase 0), then wires to real Phase 4/Phase 3 implementations once available.
**Produces:** accepted `backend/app/ai/*`, grounded `AIResponse`, and the separate
`POST /ai/plan` conversational refinement endpoint. The deterministic
`POST /itinerary/plan` contract remains unchanged.

## Phase 6 — Frontend
**Who:** Deeptiman
**Depends on:** the itinerary JSON contract (`docs/architecture/05-contracts.md`), which
exists from Phase 0/4 — can build against fixture JSON immediately, doesn't need to wait
for backend to be fully wired.
**Produces:** `frontend/src/*` — itinerary view, map view, transport hop rendering,
conversation panel.

## Phase 7 — Integration & testing
**Who:** Punam coordinates documentation, shared context, evidence, demo, and
release/readiness tracking; each implementation owner contributes validation for their
own module.
**What:** track frontend/backend integration, end-to-end evidence, contract mismatches,
demo readiness, and release readiness without taking ownership of implementation
subsystems.
**Produces:** passing `pytest` + `vitest` suites, a working local demo via
`infra/docker-compose.yml`.

## Phase 8 — Demo prep
**Who:** everyone
**What:** pick 1–2 clean demo scenarios (e.g. "1 day in Bhubaneswar, temple + food,
budget-conscious"), make sure data is solid for that scenario, rehearse.

## Parallelism summary

```
Phase 0 (Smarak)
   ├── Phase 1 (Akriti)         [parallel with Phase 0, after templates exist]
   │      └── Phase 2 (Smarak)
   │             ├── Phase 3 (Rudra)
   │             └── Phase 4 (Smarak) ── mockable before Phase 3 finishes
   │                    └── Phase 5 (Smarak) ── mockable before Phase 4 finishes
   └── Phase 6 (Deeptiman)       [buildable against fixture JSON from day 1]
Phase 7 (Punam coordination + all owners) → Phase 8 (all)
```
