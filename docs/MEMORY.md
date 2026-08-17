# O-Travelz Project Memory

Status: canonical current-state ledger

This is a project-state record, not general AI memory. Update it after major
architectural, contract, phase, or readiness changes.

## Current phase

Phase 2 — Database and import (first importer slice only; phase not complete).

## Phase status

The Phase 0 foundation is complete for the approved scope. Open decisions remain
explicitly recorded and gate only the affected later implementation work; they were not
silently resolved.

The final repository-preparation pass is also complete: fresh-account onboarding,
handoff artifacts, phase review templates, scope checks, and role-specific AI-start
prompts are present.

The first independent Phase 2 place-import slice is implemented. Phase 2 remains
incomplete because the canonical lat/lon-to-PostGIS-location mapping is still an
OPEN DECISION and the current place file contains no verified records.

The generic transport-import foundation is implemented and tested, but no current
Akriti transport file is importable as production data because coordinates, duplicate
stop identities, provider tier aggregation, and estimate metadata remain unresolved.

## Completed work

- Repository-wide read-only audit completed.
- Existing documentation compared with the actual repository.
- Fixed six-person ownership model confirmed.
- Canonical product requirements documented in `docs/PRD.md`.
- Canonical project rules documented in `docs/RULES.md`.
- Canonical architecture documented in `docs/ARCHITECTURE.md`.
- Canonical build sequence documented in `docs/PHASES.md`.
- Canonical repository map documented in `docs/REPOSITORY_MAP.md`.
- Current project state recorded here.
- Canonical SQLAlchemy transport-hop semantics now require `legs` and `data_tier`.
- Initial Alembic configuration and migration were added for the current model.
- Backend transport, itinerary, API, and AI-tool schemas were added without execution
  logic.
- Frontend/backend contract types and contract tests were added without UI.
- Frontend/map ownership boundary was recorded without geometry implementation.
- Data import scripts provide strict validation and guarded database-import entry points;
  production writes remain gated by verified data and approved semantics.
- The first Phase 2 place-import slice now provides strict pre-write validation,
  deterministic category upserts, provenance-preserving place upserts behind an
  explicit location-mapping hook, and idempotency tests.
- The transport importer foundation now normalizes and dependency-orders providers,
  stops, routes, route-stops, scheduled trips, and fare rules with idempotency and
  data-tier/estimate validation tests.
- Local database health ordering was added to Docker Compose.
- Session, task-completion, phase-review, scope-check, and start/end prompts were added
  under `docs/handoffs/`.
- Phase completion report template was added under `docs/phases/`.
- `README.md` and `START_HERE.md` were rewritten as concise fresh-account entry points.
- Team documents now contain reusable role-specific AI-start prompts.
- Build guides now point to actual team documents and the canonical Vite frontend choice.
- Supporting phase/architecture documents now identify their canonical counterparts.
- Ownership scan found no stale claims assigning AI to Deeptiman, complete frontend to
  Susmita, ranking/itinerary to Punam, database to Akriti, or ranking to Rudra.
- Final README and START_HERE onboarding paths were verified.

## Active work

The first Phase 2 place-import slice and the generic transport-import foundation are
complete for their approved boundaries. The next implementation action is to resolve
the coordinate and transport-tier/estimate decisions and receive seed-ready verified
data from Akriti before enabling production persistence.

## Gated work

Remaining Phase 2 work remains gated by its documented dependencies and affected
`OPEN DECISION` items. This is an intentional phase gate, not a technical failure.

## Blocked work

No work is marked permanently blocked. The following work is intentionally gated:

- provider research implementation until its Phase 1 start conditions are accepted;
- full place database import until verified data and the lat/lon-to-PostGIS mapping
  decision are ready;
- transport database seeding until stop coordinates, duplicate stop identity, provider
  tier aggregation, and estimate metadata are approved or supplied in representable
  form;
- transport, ranking, itinerary, AI, maps, and frontend implementation until their
  phase dependencies and contracts are satisfied.

## Frozen decisions

- The six-person ownership model is fixed:
  - Smarak — core brain, database, data semantics, ranking, itinerary, AI.
  - Akriti — research, verification, places, sources, transport research.
  - Rudra — backend, APIs, integrations, providers, routing.
  - Susmita — maps, geospatial, routes, route lines, multimodal visualization.
  - Deeptiman — complete frontend and user experience.
  - Punam — documentation, context, phases, evidence, demo, presentation, release.
- AI orchestrates and does not invent factual travel information.
- Verified data and deterministic services are the source of truth.
- Initial geographic scope is Bhubaneswar/Odisha.
- The documented frontend package direction is React + TypeScript + Vite.
- Transport data tiers are static, scheduled, and live; live requires verification.
- The six canonical documents are the project single source of truth.
- Feature freeze is active.
- Phase 0 contract schemas are validation boundaries, not feature implementations.

## Known open decisions

- Whether discovery/search, filters, place cards, and recommendations are separate
  approved screens or part of the existing itinerary/conversation flow.
- Whether saved/revisited plans are an approved product feature; the current PRD treats
  them as out of scope.
- Canonical mapping from research/API `lat`/`lon` to the PostGIS `location` field.
- Final fare-rule field names and verification metadata.
- Exact metadata for estimates while preserving the three transport data tiers.
- How one provider's static and scheduled source files map to the model's singular
  `TransportProvider.data_tier`.
- Exact GeoJSON and frontend/map integration contract.
- API request validation, error schema, versioning, and anonymous-user behavior.

## Known implementation issues

- Backend currently exposes only `/health`.
- Ranking, itinerary, AI, API routers, geospatial behavior, and transport graph/service
  are not implemented.
- Only the base transport adapter exists.
- Database migration scaffolding exists; the first place-import slice is implemented,
  but full place persistence remains gated by the coordinate mapping decision.
- `data/places/places.json` contains an explicit example placeholder.
- No transport provider static records or fare records have been imported; the current
  Akriti files contain unresolved stop coordinates and duplicate E-Ride stop names.
- Complete frontend source implementation is absent; Phase 0 boundary types, map
  ownership notes, and contract tests exist.
- Docker Compose does not currently include a frontend service.
- Provider verification documentation is still unfilled.
- Git metadata is not available at the workspace root.

## Approved architecture decisions

- Frontend consumes backend JSON and does not call AI providers directly.
- AI calls deterministic tools rather than querying the database directly.
- Transport adapters preserve data tier and expose honest failure states.
- A transport hop is one planning unit between itinerary stops and may contain multiple
  ordered legs.
- Susmita owns authoritative map/geospatial behavior; Deeptiman integrates it.
- Rudra owns backend/API wiring and routing; Smarak owns ranking, itinerary meaning, and
  AI orchestration.
- Punam coordinates documentation, phase tracking, evidence, demo, and readiness.

## Feature-freeze status

ACTIVE. No feature may be added unless it is listed in `docs/PRD.md` or approved using
the change rules in `docs/RULES.md`.

## Last verified state

Date: 2026-08-17

- Backend health test: passed with the available bundled Python environment.
- Backend tests: 29 passed, 1 skipped because the bundled runtime lacks the
  already-declared `geoalchemy2` dependency.
- Place importer tests: 8 passed, including validation, category/place import,
  idempotency, duplicate prevention, provenance preservation, and placeholder rejection.
- Transport importer tests: 15 passed, covering all six transport entities, dependency
  ordering, references, idempotency, provenance, tiers, unknown fare state, estimate
  rejection, and coordinate guards.
- Place preflight: correctly rejected the existing placeholder record. Transport
  preflight correctly rejected duplicate unresolved E-Ride stop identities.
- Frontend TypeScript/Vitest tests: not run because frontend dependencies and TypeScript
  tooling are not installed locally.
- Migration Python syntax: validated with the available Python runtime.
- Docker Compose configuration: parsed successfully with database health ordering; the
  obsolete `version` key was removed.
- Feature-creep scan: no Phase 1+ providers, ranking, itinerary generation, AI
  execution, map geometry, or frontend UI was added.
- No Phase 3+ functionality was added: ranking, itinerary generation, AI execution,
  provider integrations, routing, map geometry, and frontend UI remain absent.
