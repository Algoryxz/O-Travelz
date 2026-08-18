# O-Travelz Project Memory

Status: canonical current-state ledger

This is a project-state record, not general AI memory. Update it after major
architectural, contract, phase, or readiness changes.

## Current phase

Phase 2 engineering acceptance is complete. Phase 2 research closure remains open for
explicitly tracked AMA data-quality items. Phase 3 transportation/routing is accepted
with explicit limitations at `d6a0291`. Phase 4 deterministic ranking, itinerary
generation, and facts-only API behavior are accepted on 2026-08-18 at `d843bb4`.
Phase 5 grounded AI orchestration is **ACCEPTED WITH EXPLICIT LIMITATIONS** as of
2026-08-18. Phase 6A and 6B remain gated by their own dependencies; Phase 6 work has
not started.

## Phase status

The Phase 0 foundation is complete for the approved scope. Open decisions remain
explicitly recorded and gate only the affected later implementation work; they were not
silently resolved.

The final repository-preparation pass is also complete: fresh-account onboarding,
handoff artifacts, phase review templates, scope checks, and role-specific AI-start
prompts are present.

The v5.1 place handoff is now audited and accepted by the importer contract: 32 places,
9 canonical category IDs, 8 complete coordinate pairs, 24 intentional NULL pairs, 32
sources, 32 date-only verification values, no placeholders, no duplicate research IDs,
and no unresolved category references. The live database-backed migration, production
import, and post-import verification have now passed for the reviewed place handoff.

The generic transport-import foundation is implemented and tested. The corrected AMA Bus
handoff is now validated by a dedicated adapter: 72 identity-confirmed stops are
representable with NULL coordinates, 95 routes and 193 schedule groups preserve 3,617
times across raw/normalized/chronological layers, and 11 BQS records plus 36 Route 12
rows remain explicitly unresolved. The confirmed AMA Bus slice is now imported and
verified in the live PostgreSQL/PostGIS database; research uncertainties remain outside
confirmed production stops.

Phase 2 engineering acceptance is complete. Research closure is intentionally open and
does not make the verified migration/import implementation incomplete. The canonical
Phase 3 gate is satisfied because Phase 1 provider verification and the Phase 2
database/import outputs are available.

Phase 3 bounded transport implementation was accepted with explicit limitations in
`docs/handoffs/2026-08-18_SMARAK_PHASE3_INTEGRATION_REVIEW_2.md`. The approved Phase 4
decision record is `docs/handoffs/2026-08-18_SMARAK_PHASE4_DECISIONS.md`; the Phase 4
acceptance record is `docs/handoffs/2026-08-18_SMARAK_PHASE4_ACCEPTANCE_HANDOFF.md`.
Phase 4 implementation is accepted and now serves as the canonical deterministic
itinerary baseline.

Phase 5 implementation is accepted with explicit limitations. Its provider-neutral
orchestrator validates structured intent, calls only approved deterministic tools,
and returns grounded `AIResponse` messages. Raw `ModelResponse.message` is quarantined;
only accepted current-turn claims and finite safe framing reach public factual prose.
The accepted record is `docs/handoffs/2026-08-18_SMARAK_PHASE5_ACCEPTANCE_HANDOFF.md`.

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
- Data import scripts provide strict validation, approved coordinate mapping, paired-null
  location handling, provenance-preserving upserts, and transaction-safe database entry
  points; the reviewed place and AMA confirmed slices have passed live production import.
- The first Phase 2 place-import slice now provides strict pre-write validation,
  deterministic category upserts, provenance-preserving place upserts, approved
  `POINT(lon lat)` mapping with SRID 4326, nullable-location handling, optional custom
  location-builder hooks, and idempotency tests.
- `Place.location` is nullable and has a reversible Alembic migration for verified
  places whose exact coordinates are not defensibly known.
- Migration `0003_preserve_v51_place_metadata` preserves v5.1 research IDs, category
  display metadata, provenance notes, and coordinate/audit metadata.
- `scripts/import_places.py --data-dir data/research/handoffs/places_v5.1/data/places`
  validates the reviewed handoff without rewriting its research facts. The importer
  remains deterministic, transaction-safe, idempotent, and provenance-preserving.
- `scripts/verify_places.py` provides read-only JSON post-import evidence for counts,
  provenance, duplicates, NULL-coordinate semantics, and PostGIS point/SRID checks.
- The transport importer foundation now normalizes and dependency-orders providers,
  stops, routes, route-stops, scheduled trips, and fare rules with idempotency and
  data-tier/estimate validation tests.
- The shared `TransportHopContract` now requires a human-readable reason whenever
  `mode="unavailable"`; this is a contract validation fix, not a transport planner.
- Migration `0004_transport_research_layers` adds nullable, provenance-bearing transport
  stop identities; route source metadata; `TransportProviderSource`; `ScheduledTripGroup`;
  and explicit fare unknown/status fields.
- `scripts/import_ama_bus.py` is a dedicated, checksum/schema-validating AMA Bus adapter.
  It imports only the 72 records with canonical stop IDs, preserves NULL coordinates and
  timetable layers, imports 95 routes and 193 groups, and reports rather than promotes
  11 unresolved BQS records and 36 unmapped Route 12 source rows.
- Live import evidence: 9 categories/32 places and 72 AMA stops/95 routes/193 schedule
  groups/3,617 departure times are persisted; AMA stops retain NULL locations and
  unresolved coordinate status.
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
- Phase 5 grounded AI orchestration, deterministic tool adapters, grounding snapshot,
  claim validation, refinement behavior, and `POST /ai/plan` were implemented and
  accepted with explicit limitations.
- Phase 5 acceptance evidence: full backend suite 153 passed with 1 warning; Phase 5
  suite 19 passed with 1 warning; compileall and `git diff --check` passed.

## Active work

Phase 2 handoff and documentation synchronization are complete for the verified current
state. Phase 3 transport/routing is accepted only within its explicit limitations;
Akriti research closure remains a parallel data-quality responsibility and must not be
resolved through inference or schema shortcuts. Susmita's 2026-08-18 preparation slice
contains contract-independent WGS84 validation and clearly labelled geometry/transport
fixtures; it does not define a map payload or implement routing. Phase 4 contains the
approved deterministic ranking, itinerary sequencing, sequence-aware transport
integration, and facts-only API work, and that implementation is accepted.
Phase 5 grounding and orchestration are accepted with explicit limitations and are now
the available AI dependency for later approved consumers.

## Gated work

Phase 3 entry, the approved Phase 4 implementation, and the Phase 5 acceptance gate are
satisfied. Phase 6A and Phase 6B remain gated by their own dependencies. Production transport work
beyond the verified AMA slice remains limited by source evidence and explicit unresolved
states.

## Blocked work

No work is marked permanently blocked. The following work is intentionally gated:

- research closure for AMA coordinates, identities, route-stop mappings, and fares;
- production transport seeding beyond the verified AMA Bus slice until source evidence
  is supplied in representable form;
- Phase 6A/6B implementation until each phase's canonical dependencies and contracts are
  satisfied.

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

## Place coordinate architecture — approved

- Canonical research/API coordinates are `lat`/`lon`.
- The PostGIS representation is `Geography(POINT, SRID 4326)`.
- `lon` maps to X and `lat` maps to Y.
- `lat=20.2961`, `lon=85.8245` becomes `POINT(85.8245 20.2961)`.
- Coordinates must be finite and within valid geographic ranges.
- Coordinates must never be fabricated, inferred, or substituted from nearby landmarks.
- A verified place may have `location=NULL` when its exact coordinates cannot be
  defensibly verified.
- `NULL` location means verified place plus unknown or unsupported geographic position;
  it does not mean invalid or unverified.
- Null-location places cannot participate in geospatial calculations, routing, or
  itinerary selection that requires a physical coordinate.
- When a coordinate is later verified, update the existing place instead of creating a
  duplicate.

## Importer implementation status

- `scripts/import_places.py` defaults to `WKTElement("POINT(lon lat)", srid=4326)`.
- Both coordinates `NULL` produce `location=NULL`.
- Exactly one coordinate `NULL` is rejected.
- Missing coordinate fields are rejected.
- Finite, range, NaN, and infinite-coordinate validation remains enforced.
- The obsolete `LocationMappingDecisionRequired` guard was removed.
- The CLI imports through `import_records`.
- Existing `location_builder` hooks remain supported.
- Provenance, idempotency, and rollback behavior remain supported.

## Known open decisions

- Whether discovery/search, filters, place cards, and recommendations are separate
  approved screens or part of the existing itinerary/conversation flow.
- Whether saved/revisited plans are an approved product feature; the current PRD treats
  them as out of scope.
- Exact metadata for estimates while preserving the three transport data tiers.
- Whether unresolved transport research records should receive a separate research-only
  persistence layer; the AMA Bus adapter currently keeps the 11 unresolved BQS records
  outside confirmed `stops`.
- Exact GeoJSON and frontend/map integration contract.
- Any future API versioning, authentication, or persistence behavior outside the bounded
  Phase 4 anonymous endpoint.

## Known implementation issues

- Phase 4 ranking, itinerary, and facts-only API behavior are accepted; Phase 5 AI
  orchestration is accepted with explicit limitations; map and frontend production
  behavior remain unimplemented.
- The generic transport importer remains provider-neutral; the corrected AMA Bus package
  is handled by `scripts/import_ama_bus.py` and its confirmed slice is live-imported.
- Database migrations include the v5.1 metadata preservation migration and the live-tested
  transport research-layer migration; place persistence and verification are live-tested.
- The corrected AMA import contains one scheduled provider-source/tier layer and no
  structured fare payload; no fare value was fabricated. Older generic transport seed
  files remain outside the confirmed AMA production slice and retain their own research
  limitations.
- Complete frontend source implementation is absent; Phase 0 boundary types, map
  ownership notes, and contract tests exist.
- Docker Compose does not currently include a frontend service.
- Provider verification is recorded in the frozen Phase 1 provider record; public API
  integration remains unverified where that record says so.

## Approved architecture decisions

- Frontend consumes backend JSON and does not call AI providers directly.
- AI calls deterministic tools rather than querying the database directly.
- Transport adapters preserve data tier and expose honest failure states.
- A transport hop is one planning unit between itinerary stops and may contain multiple
  ordered legs.
- Susmita owns authoritative map/geospatial behavior; Deeptiman integrates it.
- Rudra owns backend/API wiring and routing; Smarak owns ranking, itinerary meaning, and
  AI orchestration.
- Akriti owns research correctness, provenance, and canonical data handoffs; Smarak
  owns database semantics, importer behavior, coordinate mapping, and the deterministic
  core.
- Punam coordinates documentation, phase tracking, evidence, demo, and readiness.
- Phase 4 ranks by exact canonical category relevance, filters coordinate-bearing places
  for routed selection, caps days at three unique stops, preserves global order, and
  returns an empty deterministic explanation. Phase 5 returns separate grounded prose
  through `AIResponse`.
- `from_sequence=0` represents a resolved start origin; the public schema's `unknown`
  tier is used when an unavailable state cannot honestly be assigned static, scheduled,
  or live. The Phase 2 database enum remains unchanged.

## Feature-freeze status

ACTIVE. No feature may be added unless it is listed in `docs/PRD.md` or approved using
the change rules in `docs/RULES.md`.

## Last verified state

Date: 2026-08-18

- Backend health test: passed with the available bundled Python environment.
- Full backend test suite: 82 passed with the declared `geoalchemy2==0.15.2` runtime
  available.
- Phase 4 acceptance audit: all 12 critical requirements passed.
- Phase 4 implementation regression: full backend suite `134 passed, 1 warning`;
  backend application compile check passed; the existing frontend itinerary fixture
  parsed through the backend contract.
- Phase 4 focused suite: `16 passed, 1 warning`.
- Phase 5 acceptance: `19 passed, 1 warning`; full backend regression `153 passed, 1
  warning`; compileall and `git diff --check` passed.
- Phase 3 control regression run after the shared unavailable-reason contract fix: full
  backend suite 83 passed; focused transport-contract tests 6 passed.
- v5.1 place preflight and importer compatibility tests passed; 32 places and 9
  categories validate, including paired coordinates, provenance, verification dates,
  category references, and idempotent research-ID upserts.
- Transport importer tests: 20 passed (15 generic plus 5 AMA Bus adapter tests), covering all six transport entities, dependency
  ordering, references, idempotency, provenance, tiers, unknown fare state, estimate
  rejection, and coordinate guards.
- Current place preflight passed for both the repository projection and the reviewed v5.1
  handoff. Transport preflight correctly rejected duplicate unresolved E-Ride stop
  identities before any database write.
- Frontend TypeScript/Vitest tests: not run because `frontend/node_modules` and the
  frontend tooling are not installed locally; the shared fixture was validated through
  the backend itinerary contract.
- Migration Python syntax: validated with the available Python runtime.
- Alembic offline migration SQL: validated from empty-database scripts; `datatier` is
  created once, PostGIS geography/index definitions are present, nullable place and
  transport-stop locations are applied, and v5.1/transport provenance constraints and
  source-layer tables are emitted.
- Corrected AMA Bus package validation: checksum manifest passed; 83 BQS records,
  72 canonical stop IDs, 95 routes, 193 schedule groups, and 3,617 times reconciled.
- Live database verification: PostgreSQL 16.4/PostGIS 3.4; Alembic head
  `0004_transport_research_layers`; geography columns are `Point,4326` with GiST indexes;
  place and AMA imports, verification, idempotent re-imports, and transaction rollback
  checks passed.
- `alembic check` still reports PostGIS extension-owned catalog tables as absent from the
  application metadata; this is an autogenerate comparison limitation and was not used to
  alter the extension or application schema.
- `git diff --check`: passed.
- No Akriti data was modified; no unrelated models were modified; no commit was created.
- Docker Compose configuration is present with database health ordering; the live
  `infra-db-1` container was healthy during acceptance.
- Phase 4 scope/fabrication scan: no provider data, coordinates, fares, schedules,
  durations, map geometry, or frontend UI was added; Phase 5 AI execution remains
  behind its accepted provider-neutral/deterministic boundary.
- Phase 3 transport/routing is accepted with explicit limitations; Phase 4 ranking,
  itinerary generation, and API implementation are accepted. Phase 5 AI orchestration
  is accepted with explicit limitations; commercial provider integration, map geometry,
  and frontend UI remain absent.

## Evidence locations

- Phase 2 engineering acceptance and gate: `docs/PHASES.md`.
- Phase 3 control contract: `docs/handoffs/2026-08-17_SMARAK_PHASE3_CONTROL_REPORT.md`.
- Phase 3 acceptance tracking: `docs/phases/PHASE_3_ACCEPTANCE_CHECKLIST_2026-08-17.md`.
- Smarak Phase 3 decisions/progress: `docs/handoffs/2026-08-17_SMARAK_PHASE3_PROGRESS.md`.
- Rudra Phase 3 scope: `docs/handoffs/2026-08-18_RUDRA_PHASE3_SCOPE_REPORT.md`.
- Susmita Phase 3/6A dependency readiness: `docs/handoffs/2026-08-18_SUSMITA_PHASE3_DEPENDENCY_PHASE6A_READINESS_REPORT.md`.
- Susmita Phase 6A preparation evidence: `docs/handoffs/2026-08-18_SUSMITA_PHASE6A_PREPARATION_REPORT.md`.
- Smarak Phase 4 acceptance: `docs/handoffs/2026-08-18_SMARAK_PHASE4_ACCEPTANCE_HANDOFF.md`.
- Contract-independent geospatial validation: `backend/app/geospatial/validation.py` and
  `backend/tests/test_geospatial_validation.py`.
- Canonical architecture and model semantics: `docs/ARCHITECTURE.md`.
- Live acceptance and documentation synchronization: `docs/phases/`.
- Role handoffs: `docs/handoffs/`.
- Place post-import verifier: `scripts/verify_places.py`.
- AMA Bus adapter: `scripts/import_ama_bus.py`.

## Current next actions

1. Smarak reviews the Rudra and Susmita scope/readiness reports and resolves or approves
   their listed open decisions before implementation where needed.
2. Rudra begins only the bounded transportation/routing work defined in `docs/PHASES.md`,
   preserving every unknown/unresolved source state.
3. Susmita keeps the Phase 6A validation/fixture preparation bounded until Rudra outputs
   and the map contract are approved; no map payload or route behavior is inferred.
4. Smarak reviews actual Phase 3 code, tests, migrations, contracts, and handoffs before
   accepting any checklist item.
5. Phase 5 is accepted and may be consumed by later approved work through its grounded
  `AIResponse` boundary; it preserves the Phase 4 baseline, including empty
  `explanation`, `unknown` hop honesty, `from_sequence=0`, and inherited Phase 3 limits.
6. Akriti may close AMA coordinates, near-name identities, March-source evidence, Route
   12 mappings, and fare research only with new defensible source evidence.
7. Punam maintains canonical status, evidence, handoffs, and release-readiness records.
