# O-Travelz Canonical Build Phases

Status: canonical phase order and completion gates

Work is dependency-driven. A phase is complete only when its exit criteria and tests
pass. A phase owner cannot declare completion by assertion alone. Work marked forbidden
must not enter the phase silently.

## Phase 0 — Canonical context and contract freeze

**Objective**

Create and validate the single source of truth before feature development.

**Owner**

Punam coordinates. All six owners approve the sections affecting their responsibilities.

**Dependencies**

The approved repository audit and the existing repository.

**Allowed work**

- Create or update the six canonical documents.
- Reconcile terminology, ownership, product scope, phase gates, and repository paths.
- Record unresolved matters explicitly as `OPEN DECISION`.
- Define the database, transport, itinerary, API, AI-tool, frontend/backend, and
  frontend/map contract surfaces without implementing features.
- Align the canonical database model with the approved semantics and add migration
  scaffolding.
- Add contract-only schemas, boundary types, validation tests, reproducible preflight
  entry points, and infrastructure health checks.

**Forbidden work**

- Full AI implementation.
- Ranking, itinerary generation, transport providers, routing, maps, or frontend
  feature implementation.
- Phase 1 research data or provider verification.
- Product-scope expansion or silent architecture decisions.

**Deliverables**

- `docs/PRD.md`
- `docs/RULES.md`
- `docs/ARCHITECTURE.md`
- `docs/PHASES.md`
- `docs/MEMORY.md`
- `docs/REPOSITORY_MAP.md`
- Canonical SQLAlchemy model alignment and initial Alembic migration.
- Transport, itinerary, API, AI-tool, and frontend/backend contract schemas.
- Phase 0 contract tests and data preflight commands.
- Frontend/map ownership boundary record.
- Reproducible database health check in local infrastructure.

**Acceptance criteria**

- A fresh developer can identify product scope, ownership, current state, and valid
  repository paths without prior conversation context.
- Contract and migration scaffolding is present without Phase 1+ product behavior.
- Handoff and review templates are available for future work.

**Exit criteria**

- All six documents exist.
- They use consistent ownership and terminology.
- The PRD, rules, architecture, phases, and repository map do not contradict one
  another.
- All unresolved choices are marked `OPEN DECISION`.
- Feature freeze is active until the documented decisions are approved.
- Contract schemas validate the existing itinerary fixture shape and reject undocumented
  fields.
- Migration scaffolding describes the current canonical database model.
- Data preflight commands validate source shape without importing unverified data.
- No Phase 1+ implementation exists.

**Tests/evidence**

- Cross-document contradiction check.
- Path check against the actual repository.
- Scope check confirming no Phase 1+ implementation files changed.
- Backend contract and model tests.
- Data preflight validation.
- Migration/configuration syntax validation.

**Handoff**

Punam records the verified baseline in `MEMORY.md`; every owner reads the canonical
documents before starting later work.

## Phase 1 — Research and verified data

**Objective**

Produce sourced, verified place and transportation data for the initial scope.

**Owner**

Akriti.

**Dependencies**

Phase 0 contracts and data rules.

**Allowed work**

- Research and verify places, sources, coordinates, categories, and relevant attributes.
- Verify transport providers and their available static, scheduled, or live information.
- Prepare seed-ready data in the documented data paths.

**Forbidden work**

- Database implementation or migrations.
- Provider adapters, backend APIs, ranking, itinerary logic, AI, frontend, or maps.
- Invented or unsourced facts.

**Deliverables**

- Completed provider verification entries.
- Sourced place and category data.
- Static transport topology and schedule/frequency data where verified.
- Fare data where verified.
- Verification evidence and dates.

**Acceptance criteria**

- Required place and provider records are sourced, attributable, and explicit about
  unknown or unavailable information.
- No provider capability, route, fare, schedule, or coordinate is presented without
  evidence.
- The verified data can be handed to Smarak for import and Rudra for integration.

**Exit criteria**

- Every initially required provider is explicitly verified, unavailable, or unknown.
- Demo-relevant data has sources and verification information.
- Static, scheduled, live, and estimate status is unambiguous.
- Data passes the agreed schema validation.

**Tests/evidence**

- Data-shape validation.
- Source and freshness review.
- Provider verification review.

**Handoff**

Akriti hands verified data to Smarak for import and to Rudra for provider planning.

## Phase 2 — Database and import

**Objective**

Create a reproducible database schema and import the verified Phase 1 data.

**Owner**

Smarak.

**Dependencies**

Phase 0 database contract and Phase 1 verified data.

**Current status**

Phase 2 engineering acceptance is complete. Research closure remains open for
explicitly tracked AMA data-quality items; those items are represented as unknown or
unresolved states and are not engineering failures.

**Completed within the current Phase 2 boundary**

- The place coordinate mapping architecture is approved: `lon` → X, `lat` → Y,
  `Geography(POINT, SRID 4326)`.
- The nullable place-coordinate architecture is approved and represented in the
  Place model and reversible migration.
- The place importer implements the approved coordinate mapping and paired-null
  behavior without fabricating coordinates.
- Coordinate validation and importer transaction/idempotency tests are implemented.
- The corrected v5.1 handoff is audited and accepted without changing its research facts.
- Category IDs, research IDs, provenance notes, and coordinate/audit metadata are
  preserved by the model, migration, and importer.
- The empty-database offline migration path emits PostGIS geography/index definitions,
  applies nullable place location, and creates the enum exactly once.
- The declared geoalchemy2 runtime is available and the backend suite passes.
- Live PostgreSQL 16.4/PostGIS 3.4.3 migration reached
  `0004_transport_research_layers` from an empty database; current-schema upgrade is a
  no-op at head.
- Live geography types, SRID 4326, GiST indexes, valid `POINT(lon lat)` persistence,
  NULL-coordinate persistence, and transaction rollback were verified.
- The v5.1 place handoff was imported and verified: 9 categories, 32 places, 24
  intentional NULL locations, no placeholders, duplicates, orphan categories, or
  invalid spatial rows. A second import created no new records.
- The corrected AMA Bus handoff was imported through its dedicated adapter: 72 confirmed
  stops, 95 routes, 193 schedule groups, and 3,617 departure times. Provenance and all
  three timetable layers were preserved; a second import created no duplicates.
- The 11 unresolved BQS records and all 36 Route 12 rows without canonical candidates
  were excluded from confirmed stop and route-stop production records.

**Research closure remains open**

- All 83 AMA coordinates remain unresolved.
- Three BQS near-name variants require physical confirmation.
- Eight official BQS records lack March stoppage-source evidence.
- Route 12 has 36 unresolved canonical route-stop mappings.
- The corrected AMA Bus package contains no structured fare payload.

These are research/source-closure items. They must not be resolved by inference or
treated as migration/import engineering failures.

Akriti remains responsible for research correctness, provenance, and the canonical data
handoff. Smarak remains responsible for database semantics, importer behavior,
coordinate mapping, and deterministic core implementation.

**Allowed work**

- Implement migrations and database semantics.
- Complete place and transport import behavior.
- Seed a local development database.
- Add database and import tests.

**Forbidden work**

- Ranking or itinerary implementation.
- AI orchestration.
- Provider integrations or frontend behavior.
- Changing source semantics without Akriti coordination.

**Deliverables**

- Reproducible schema migrations.
- Working place and transport import scripts.
- Seeded local database.
- Provenance-preserving database records.

**Acceptance criteria**

- The schema can be reproduced from an empty database using the approved migration path.
- Imported records preserve required source and verification semantics.
- Database and import behavior remains separate from ranking, AI, frontend, and provider
  integration behavior.

**Engineering acceptance evidence**

- PostgreSQL 16.4/PostGIS 3.4.3 live database: container `infra-db-1`, healthy.
- Full backend suite: 82 passed.
- Place preflight, AMA preflight, live spatial SQL, post-import verification, idempotent
  re-import, and live rollback checks passed.
- `alembic check` reports only PostGIS extension-owned catalog tables outside application
  metadata; this is an autogenerate comparison limitation, not application-schema drift.

**Exit criteria**

- Migrations run from an empty database.
- Verified data imports without placeholder records.
- Geometry, provenance, and freshness fields match the approved contract.
- Import and database tests pass.

**Tests/evidence**

- Migration-from-empty test.
- Import validation and idempotency tests.
- Database model/contract tests.

**Handoff**

Smarak hands the verified Phase 2 database/import outputs to Rudra and the deterministic
services. The Phase 3 gate is satisfied as defined here: Phase 1 provider verification
and Phase 2 database/import outputs are available. Rudra may begin Phase 3 transportation
and routing work while preserving every unresolved research state.

## Phase 3 — Transportation and routing

**Objective**

Normalize verified providers and produce deterministic multimodal transport hops.

**Owner**

Rudra.

**Dependencies**

Phase 1 provider verification and Phase 2 database/import outputs.

**Gate status**

Satisfied for Phase 3 entry. This does not authorize Phase 4, Phase 5, Phase 6A, or
Phase 6B work, and it does not close AMA research uncertainties.

**Allowed work**

- Implement provider adapters for verified providers.
- Build transport graph and pathfinding.
- Implement transport-hop planning and provider status behavior.
- Implement explicit unavailable and fallback states.

**Forbidden work**

- Inventing provider APIs, routes, schedules, fares, or live status.
- Ranking, itinerary sequencing, or AI orchestration.
- Complete frontend or authoritative map visualization.

**Deliverables**

- Common adapter interface and verified adapters.
- Graph and pathfinding behavior.
- `plan_transport_hop` behavior matching the transport contract.
- `get_provider_status` behavior.
- Transport tests.

**Acceptance criteria**

- Verified provider data is normalized through the common adapter contract.
- Multimodal and unavailable-hop results preserve data tier and reasons.
- No adapter claims an unverified API, route, fare, schedule, or live status.

**Exit criteria**

- Demo-relevant verified providers return honest data tiers.
- At least one real fixture pair produces a multimodal hop where data supports it.
- Unreachable pairs return an unavailable result with a reason.
- Missing provider data does not crash the planner.

**Tests/evidence**

- Adapter normalization tests.
- Pathfinding and multimodal tests.
- Missing-data, provider-failure, and data-tier tests.

**Handoff**

Rudra hands transport planning and provider-status contracts to Smarak, Susmita, and
Deeptiman.

## Phase 4 — Deterministic ranking and itinerary generation

**Objective**

Select verified places and build facts-only day-by-day itineraries.

**Owner**

Smarak.

**Dependencies**

Phase 0 semantic contracts and Phase 2 database; Phase 3 transport for real hops.

**Allowed work**

- Implement deterministic ranking and candidate selection.
- Implement itinerary sequencing and day planning.
- Call the transport-hop service for itinerary hops.
- Expose the facts-only itinerary API contract.

**Forbidden work**

- AI-generated facts or prose as a substitute for deterministic output.
- Provider-specific integrations or routing implementation.
- Frontend or map visualization implementation.

**Deliverables**

- Ranking service.
- Itinerary service.
- Facts-only `POST /itinerary/plan` behavior.
- Contract fixtures and tests.

**Acceptance criteria**

- Identical constraints produce deterministic ranking and itinerary output.
- Every itinerary hop is structured, transport-aware, and either planned or explicitly
  unavailable.
- The facts-only output matches the approved itinerary contract.

**Exit criteria**

- Ranking is deterministic and explainable.
- Itinerary output matches the approved contract.
- Transport hops are included or explicitly unavailable.
- Facts-only API and contract tests pass.

**Tests/evidence**

- Ranking determinism tests.
- Itinerary sequencing tests.
- Contract and unavailable-hop tests.

**Handoff**

Smarak hands the structured itinerary contract to AI, API, map, and frontend owners.

## Phase 5 — AI orchestration

**Objective**

Add grounded intent understanding, tool orchestration, explanation, and refinement.

**Owner**

Smarak.

**Dependencies**

Phase 0 AI-tool contract; real Phase 3 and Phase 4 services for integrated behavior.

**Allowed work**

- Implement structured intent parsing.
- Implement approved deterministic tool calls.
- Generate explanations only from current-turn tool results.
- Implement conversational refinement through structured constraints.

**Forbidden work**

- Direct database access from AI.
- AI ranking, route planning, geometry, fare calculation, or itinerary editing.
- Unverified factual claims.

**Deliverables**

- AI schemas and tool interface.
- Grounded explanation behavior.
- Refinement behavior.
- Recorded tool-call transcript tests.

**Acceptance criteria**

- AI intent becomes structured constraints and approved tool calls.
- Explanations contain only facts returned by current-turn deterministic tools.
- Refinement causes deterministic recalculation rather than text-only itinerary edits.

**Exit criteria**

- AI calls the correct tools with structured arguments.
- Explanations contain no facts absent from tool output.
- Missing information is stated as missing or uncertain.
- Refinement re-calls deterministic services.

**Tests/evidence**

- Recorded transcript tests.
- Factual-grounding tests.
- Refinement and tool-argument tests.

**Handoff**

Smarak hands the grounded response contract to Rudra and Deeptiman.

## Phase 6A — Maps and geospatial subsystem

**Objective**

Represent verified places, stops, route lines, and multimodal paths for map consumption.

**Owner**

Susmita.

**Dependencies**

Phase 0 map contract; Phase 3 routing outputs and Phase 4 itinerary identifiers.
Fixture data may be used while dependent services are incomplete.

**Allowed work**

- Implement map/geospatial representations.
- Implement route-line and multimodal visualization behavior.
- Define and test the map integration handoff.

**Forbidden work**

- Complete frontend shell or non-map UX.
- Replacing Rudra's backend routing or authoritative transport facts.
- Inventing coordinates or route geometry.

**Deliverables**

- Approved map data contract.
- Place, stop, route-line, and multimodal representations.
- Map/geospatial tests and handoff evidence.

**Acceptance criteria**

- Map inputs and route representations come from approved backend contracts.
- Route lines and multimodal segments preserve their source semantics.
- Deeptiman can integrate the subsystem without duplicating authoritative geospatial
  calculations.

**Exit criteria**

- Supplied places and routes render correctly.
- Route lines and multimodal segments preserve their semantics.
- Missing geometry is handled honestly.
- Deeptiman can integrate without duplicating geospatial logic.

**Tests/evidence**

- Geometry and map-contract tests.
- Route-line and multimodal representation tests.

**Handoff**

Susmita hands the stable map contract and visualization subsystem to Deeptiman.

## Phase 6B — Complete frontend and user experience

**Objective**

Implement the approved user-facing itinerary, map, transport, and conversation flow.

**Owner**

Deeptiman.

**Dependencies**

Phase 0 itinerary/API/frontend-map contracts; Phase 6A map handoff; fixture data may be
used before backend integration is complete.

**Allowed work**

- Implement approved screens and presentation state.
- Integrate backend and map contracts.
- Render itinerary, transport details, data-tier labels, explanations, loading, error,
  and replanning states.

**Forbidden work**

- AI orchestration, ranking, itinerary logic, database semantics, provider logic,
  routing, or authoritative geospatial calculations.
- Unapproved discovery, profile, persistence, or other product features.

**Deliverables**

- Complete approved frontend flow.
- API and map integration.
- Frontend tests and integration evidence.

**Acceptance criteria**

- Approved itinerary, map, transport, and conversation views render the shared contract.
- Loading, error, data-tier, and replanning states are represented.
- Frontend behavior does not implement AI, ranking, itinerary, provider, routing, or
  authoritative geospatial logic.

**Exit criteria**

- Approved screens render the contract fixture and backend response.
- Transport tiers and unavailable states are visible.
- Refinement, loading, and error states work.
- Frontend tests pass.

**Tests/evidence**

- Component tests against contract fixtures.
- API-state and map-integration tests.
- Build verification.

**Handoff**

Deeptiman hands the integrated frontend to Phase 7 coordination.

## Phase 7 — Integration, testing, and readiness

**Objective**

Validate the complete local stack, contracts, evidence, and release readiness.

**Owner**

Punam coordinates. Each implementation owner validates their subsystem.

**Dependencies**

Phases 2–6B outputs and their handoff evidence.

**Allowed work**

- Run integration and end-to-end validation.
- Resolve documented contract mismatches with the affected owners.
- Prepare demo and release/readiness evidence.

**Forbidden work**

- Unapproved feature additions.
- Taking implementation ownership from another owner.
- Marking incomplete exit criteria as passed.

**Deliverables**

- Passing backend and frontend test suites.
- Local demo evidence using the approved stack.
- Contract mismatch log and resolution records.
- Readiness documentation.

**Acceptance criteria**

- The approved demo flow works across the integrated local stack.
- Contract mismatches, failed tests, known issues, and limitations are recorded.
- Readiness evidence is traceable to actual test and demo results.

**Exit criteria**

- The approved demo flow works end to end.
- Contract tests and relevant unit/component tests pass.
- Known issues and limitations are documented.
- Release/readiness evidence is complete.

**Tests/evidence**

- Full backend test suite.
- Full frontend test suite.
- Local integration/demo verification.

**Handoff**

Punam records the release-ready baseline in `MEMORY.md` and prepares Phase 8.

## Phase 8 — Demo preparation

**Objective**

Prepare and rehearse one or two approved, reproducible demo scenarios.

**Owner**

Everyone, coordinated by Punam.

**Dependencies**

Phase 7 readiness evidence and verified demo data.

**Allowed work**

- Select approved demo scenarios.
- Validate data and rehearse the documented flow.
- Prepare presentation and evidence materials.

**Forbidden work**

- Expanding product scope for the demo.
- Hiding unavailable, estimated, or unverified information.

**Deliverables**

- Reproducible demo scenarios.
- Presentation/demo evidence.
- Final known-limitations record.

**Acceptance criteria**

- Selected demo scenarios are reproducible.
- Displayed facts are sourced or deterministic.
- Estimated, unavailable, and unverified information is not hidden.

**Exit criteria**

- Selected scenarios run consistently.
- All displayed facts are sourced or deterministic.
- Demo limitations and data tiers are visible and documented.

**Tests/evidence**

- Scenario rehearsal.
- Final readiness checklist.

**Handoff**

Punam records the demo baseline and the team maintains the approved product scope.
