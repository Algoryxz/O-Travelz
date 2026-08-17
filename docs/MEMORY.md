# O-Travelz Project Memory

Status: canonical current-state ledger

This is a project-state record, not general AI memory. Update it after major
architectural, contract, phase, or readiness changes.

## Current phase

Phase 0 — Canonical context and contract freeze.

## Phase status

The Phase 0 foundation is complete for the approved scope. Open decisions remain
explicitly recorded and gate only the affected later implementation work; they were not
silently resolved.

The final repository-preparation pass is also complete: fresh-account onboarding,
handoff artifacts, phase review templates, scope checks, and role-specific AI-start
prompts are present.

Feature freeze is active. No Phase 1+ application features are approved by this
foundation pass.

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
- Data import scripts now provide validation-only preflight entry points; database writes
  remain Phase 2.
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

None for this Phase 0 implementation task. The next project action is review and
resolution of the listed open decisions before affected later phases begin.

## Gated work

Phase 1 and later implementation work remains gated by its documented dependencies and
any affected `OPEN DECISION` items. This is an intentional phase gate, not a technical
failure.

## Blocked work

No work is marked permanently blocked. The following work is intentionally gated:

- provider research implementation until its Phase 1 start conditions are accepted;
- database write/import implementation until verified data and database decisions are
  ready;
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
- Exact GeoJSON and frontend/map integration contract.
- API request validation, error schema, versioning, and anonymous-user behavior.

## Known implementation issues

- Backend currently exposes only `/health`.
- Ranking, itinerary, AI, API routers, geospatial behavior, and transport graph/service
  are not implemented.
- Only the base transport adapter exists.
- Database migration scaffolding exists; database write/import remains Phase 2.
- `data/places/places.json` contains an explicit example placeholder.
- No transport provider static records or fare records exist.
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
- Backend Phase 0 tests: 6 passed, 1 skipped because the bundled runtime lacks the
  already-declared `geoalchemy2` dependency.
- Data preflight: place and transport validation commands completed with warnings for
  the existing placeholder/no-provider state.
- Frontend TypeScript/Vitest tests: not run because frontend dependencies and TypeScript
  tooling are not installed locally.
- Migration Python syntax: validated with the available Python runtime.
- Docker Compose configuration: parsed successfully with database health ordering; the
  obsolete `version` key was removed.
- Feature-creep scan: no Phase 1+ providers, ranking, itinerary generation, AI
  execution, map geometry, or frontend UI was added.
- Application feature code: unchanged; only Phase 0 foundation files were added or
  updated.
