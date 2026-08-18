# O-Travelz Repository Map

Status: canonical map of actual repository paths

This document describes the repository as it exists. A path marked `TO CREATE` is
mentioned by approved project documentation but does not currently exist. Empty
directories are listed when they establish an ownership boundary.

## Root files and directories

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `README.md` | Project summary and entry links | Punam | 0 | Stable orientation and high-level scope | Detailed implementation or conflicting requirements | Canonical documents |
| `START_HERE.md` | Contributor onboarding | Punam | 0 | Reading order, workflow, test commands | Product decisions that override canonical docs | `docs/` |
| `backend/` | FastAPI, database-facing models, contracts, backend services, transport | Rudra for backend/API; Smarak for models/core logic | 0–5 | Backend implementation in assigned subareas | Frontend, research source files, authoritative map UI | `data/`, database, contracts |
| `frontend/` | React/TypeScript/Vite user experience | Deeptiman | 6B | Complete frontend and frontend tests | AI, ranking, itinerary logic, provider logic, authoritative geospatial calculations | API and map contracts |
| `data/` | Verified sourced input data | Akriti | 1 | Research-ready and import-ready factual data | AI-generated placeholders or application logic | Sources and import scripts |
| `docs/` | Canonical and supporting project documentation | Punam | 0–8 | Requirements, rules, architecture, phases, context, evidence | Application implementation | Repository and owner decisions |
| `infra/` | Local stack configuration | Rudra, coordinated with affected owners | 2/7 | Environment and local deployment configuration | Product logic or provider facts | Backend, frontend, database |
| `scripts/` | Data import and development scripts | Smarak | 2 | Import and seed workflows | Ranking, AI, frontend, provider UI | `data/`, database models |

## Canonical documentation

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `docs/PRD.md` | Frozen product requirements and scope | Punam with all owners | 0 | Approved journeys, screens, actions, acceptance, out-of-scope | Implementation detail or speculative features | Repository audit and approved decisions |
| `docs/RULES.md` | Human and AI project rules | Punam | 0 | Scope, ownership, contracts, testing, factuality, approvals | Feature requirements or code | PRD and architecture |
| `docs/ARCHITECTURE.md` | Canonical system architecture and boundaries | Punam with Smarak and all owners | 0 | Components, data flow, ownership, contracts, open decisions | Source code or unapproved redesign | PRD and existing architecture docs |
| `docs/PHASES.md` | Canonical phase order and exit gates | Punam | 0–8 | Objectives, owners, dependencies, allowed/forbidden work, tests, handoffs | Feature implementation | Architecture and contracts |
| `docs/MEMORY.md` | Current project-state ledger | Punam | 0–8 | Current phase, status, decisions, issues, evidence | General AI memory or prose requirements | All canonical documents |
| `docs/REPOSITORY_MAP.md` | Actual path and ownership map | Punam | 0 | Existing paths and explicit `TO CREATE` paths | Invented files presented as existing | Actual repository tree |

## Supporting documentation

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `docs/architecture/00-overview.md` | Existing supporting architecture overview | Punam/Smarak | 0 | Detailed background and rationale | A competing product or architecture authority | `docs/ARCHITECTURE.md` |
| `docs/architecture/02-database.md` | Existing supporting database detail | Smarak | 2 | Entity rationale and database detail | Unapproved schema changes | Database contract |
| `docs/architecture/03-ai.md` | Existing supporting AI detail | Smarak | 5 | AI role and tool concepts | AI facts or provider logic | AI contract |
| `docs/architecture/05-contracts.md` | Existing itinerary JSON contract detail | Punam/Smarak/Rudra | 4–7 | Structured itinerary shape and contract detail | Untracked alternate response shape | `docs/ARCHITECTURE.md` |
| `docs/transportation/00-transport-model.md` | Existing transport model detail | Rudra/Akriti/Smarak | 1–3 | Provider tiers, adapters, routing concepts | Unverified provider claims | Transport contract |
| `docs/transportation/01-providers.md` | Provider verification record/template | Akriti | 1 | Evidence for provider availability and data tiers | Adapter implementation | Verified research |
| `docs/phases/README.md` | Existing phase-plan source material | Punam | 0 | Historical/supporting phase detail | A second phase authority | `docs/PHASES.md` |
| `docs/phases/PHASE_COMPLETION_TEMPLATE.md` | Phase completion report template | Punam | 0–8 | Verified phase reviews | Unverified status claims | `docs/PHASES.md`, `docs/MEMORY.md` |
| `docs/handoffs/` | Session, task, phase-review, and scope-check handoff system | Punam | 0–8 | Handoff records and reusable templates/prompts | A competing source of truth | Canonical documents |
| `docs/handoffs/README.md` | Handoff operating rules | Punam | 0–8 | Status and handoff requirements | Implementation decisions | `docs/RULES.md` |
| `docs/handoffs/TEMPLATE.md` | Session handoff template | Punam | 0–8 | Session facts, files, tests, blockers, next step | Vague or unverified claims | Actual session changes |
| `docs/handoffs/TASK_COMPLETION_TEMPLATE.md` | Task completion template | Punam | 0–8 | Task-level implementation and handoff facts | Phase completion claims | Task evidence |
| `docs/handoffs/START_OF_SESSION_PROMPT.md` | Reusable AI session-start prompt | Punam | 0–8 | Required reading and no-code-before-approval instruction | Product requirements | Canonical documents |
| `docs/handoffs/END_OF_SESSION_PROMPT.md` | Reusable AI session-end prompt | Punam | 0–8 | Change inspection, tests, handoff, and ledger updates | Unverified completion | Handoff template |
| `docs/handoffs/PHASE_REVIEW_PROMPT.md` | Reusable phase-review prompt | Punam | 0–8 | Exit/acceptance/ownership/feature-creep review | Automatic phase completion | Phase requirements |
| `docs/handoffs/SCOPE_CHECK_PROMPT.md` | Reusable scope and conflict prompt | Punam | 0–8 | Approved/blocked/unclear decision format | Silent conflict resolution | PRD, rules, architecture |
| `docs/team/` | Six team ownership documents | Punam with each owner | 0–8 | Operational ownership and handoffs | Contradictory ownership or product scope | Canonical documents |
| `docs/O-Travelz_Build_Guides/docs/build-guides/` | Existing AI coding guides | Punam with each owner | 0–8 | Owner-specific build guidance | New authority that overrides canonical rules | `docs/RULES.md`, `docs/REPOSITORY_MAP.md` |
| `docs/project-context/` | Existing empty project-context directory | Punam | 0–8 | Future supporting context/evidence if approved | Untracked canonical decisions | `docs/MEMORY.md` |

## Backend

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `backend/app/main.py` | FastAPI application entrypoint and health endpoint | Rudra | 0 | API app wiring | Ranking or AI implementation embedded in entrypoint | FastAPI |
| `backend/app/core/config.py` | Environment-backed settings | Rudra with Smarak for database semantics | 0–2 | Runtime configuration | Product requirements or provider facts | Pydantic settings |
| `backend/app/db/base.py` | SQLAlchemy base and model import hub | Smarak | 0–2 | Database metadata registration | API routes or import policy | SQLAlchemy models |
| `backend/app/db/session.py` | SQLAlchemy engine and session dependency | Smarak | 0–2 | Database sessions | Business logic | Database configuration |
| `backend/app/models/` | Current SQLAlchemy model files | Smarak | 0–2 | Database entities and semantics | API schemas, provider adapters, UI state | PostgreSQL/PostGIS |
| `backend/app/schemas/` | Validated Phase 0 boundary schemas | Smarak/Rudra by contract | 0–5 | Database-adjacent API, itinerary, and transport contracts | Unvalidated ad hoc payloads or service logic | Canonical contracts |
| `backend/app/schemas/common.py` | Shared constraint and place-summary schemas | Smarak | 0 | Reusable boundary primitives | Service behavior or database writes | PRD and contracts |
| `backend/app/schemas/transport.py` | Transport hop and provider-status schemas | Rudra/Smarak | 0/3/4 | Transport contract types, start sentinel, and honest unknown tier | Provider adapters or provider facts | Transport contract |
| `backend/app/schemas/itinerary.py` | Itinerary request/response schemas | Smarak | 0/4 | Structured itinerary boundary | Itinerary generation | Itinerary contract |
| `backend/app/schemas/api.py` | HTTP error and itinerary response schemas | Rudra/Smarak | 0/4–7 | API boundary types | Route implementation | API contract |
| `backend/app/api/` | API routers and HTTP wiring | Rudra | 4–7 | `itinerary_routes.py` and transport routing | Ranking or AI internals | Backend service contracts |
| `backend/app/api/itinerary_routes.py` | Facts-only `POST /itinerary/plan` router | Rudra with Smarak semantics | 4 | Request validation, service invocation, structured planning failures | ORM exposure, AI prose, frontend behavior | Itinerary service and API schemas |
| `backend/app/services/ranking/` | Deterministic ranking and verified-place boundary | Smarak | 4 | Canonical relevance ranking, tie-breaks, repository projection | Provider integrations or AI | Database/place data |
| `backend/app/services/ranking/repository.py` | Verified-place query/projection boundary | Smarak | 4 | Place/category identity, provenance-relevant fields, coordinate eligibility | Geocoding or inferred facts | Phase 2 models/import |
| `backend/app/services/ranking/service.py` | Conservative deterministic ranking service | Smarak | 4 | Exact category relevance and approved stable ordering | ML, LLM, popularity, transport ranking | `repository.py`, constraints |
| `backend/app/services/itinerary/` | Deterministic itinerary generation | Smarak | 4 | Global selection, day capacity/order, transport-hop coordination | Frontend, provider adapters, routing | Ranking and transport service |
| `backend/app/services/itinerary/service.py` | Facts-only day/stop sequencing service | Smarak | 4 | Three-stop capacity, unique places, start/consecutive hops, deterministic ID | Routing or AI explanation | Ranking service, Phase 3 transport |
| `backend/app/ai/` | AI package with Phase 0 schemas only | Smarak | 0/5 | `schemas.py` contract types; later orchestration in approved paths | Deterministic facts, route logic, direct DB access | Approved tools and contracts |
| `backend/app/ai/schemas.py` | AI tool argument/result schemas | Smarak | 0/5 | Fixed tool-call boundary types | Model execution or factual constants | Deterministic service contracts |
| `backend/app/ai/tools/` | Existing empty AI tools package | Smarak | 5 | `TO CREATE`: fixed deterministic tool wrappers | Provider SDK clients or factual constants | Ranking, itinerary, transport services |
| `backend/app/geospatial/` | Geospatial preparation package; public map representation remains gated | Susmita for geospatial behavior; Rudra for backend routing outputs | 3/6A | Contract-independent validation and later approved geometry/map representations | Complete frontend, routing, or invented geometry | Transport and map contracts |
| `backend/app/geospatial/validation.py` | Contract-independent WGS84 coordinate/LineString validation | Susmita | 6A preparation | Validate supplied geometry and preserve NULL/unknown state | Route calculation, distance calculation, geometry inference, public map payload | Approved geometry source and future map contract |
| `backend/app/transport/adapters/base.py` | Common transport adapter interface | Rudra | 3 | Provider-neutral adapter contract | Provider-specific facts not verified | Provider verification and transport model |
| `backend/app/transport/adapters/` | Existing adapter package | Rudra | 3 | `TO CREATE`: verified provider adapters | Ranking, itinerary, or AI | `data/transport/`, database |
| `backend/app/transport/graph/` | Existing empty graph package | Rudra | 3 | `TO CREATE`: stop/walking graph and pathfinding | Map UI or authoritative place ranking | Transport data and geospatial outputs |
| `backend/app/transport/` | Transport subsystem | Rudra | 3 | Adapters, graph, planning service | Core ranking, AI, complete frontend | Provider verification and database |
| `backend/tests/` | Backend health, Phase 0 contract, Phase 2 database/import, and later subsystem tests | Relevant implementation owner | 0–7 | Unit, contract, migration, spatial, import, and integration tests | Test-only product behavior | Backend dependencies |
| `backend/tests/test_ama_bus_adapter.py` | Corrected AMA Bus adapter tests | Smarak/Akriti | 2 | Schema validation, confirmed-slice filtering, timetable preservation, idempotency, rollback, and unresolved-state checks | Research fact changes | AMA handoff and transport models |
| `backend/tests/test_data_validation.py` | Source-data preflight tests | Smarak | 2 | Place/transport shape, provenance, coordinate, and duplicate validation | Database writes or research edits | `scripts/data_validation.py` |
| `backend/tests/test_place_repository.py` | Phase 4 verified-place repository projection tests | Smarak | 4 | Canonical category and place identity projection | Database writes or research edits | `backend/app/services/ranking/repository.py` |
| `backend/tests/test_ranking.py` | Phase 4 deterministic ranking tests | Smarak | 4 | Interest/category relevance, null-coordinate ranking, tie-breaks | Product recommendations or AI behavior | Ranking service |
| `backend/tests/test_itinerary.py` | Phase 4 deterministic itinerary tests | Smarak | 4 | Capacity, uniqueness, day distribution, starts, hops, failures, facts-only output | Frontend behavior | Itinerary service and transport contract |
| `backend/tests/test_itinerary_api.py` | Phase 4 itinerary API tests | Rudra/Smarak | 4 | Success, structured planning failure, validation errors, shared response shape | Frontend UI or AI behavior | Itinerary router and API schemas |
| `backend/tests/test_frontend_itinerary_fixture.py` | Backend validation of the shared frontend itinerary fixture | Smarak/Deeptiman/Rudra | 4/6B | Same fixture parses through the backend itinerary contract | Frontend UI behavior | `frontend/tests/fixtures/sample_itinerary.json`, itinerary schemas |
| `backend/tests/test_geospatial_validation.py` | Phase 6A preparation tests for supplied geometry and current transport contract semantics | Susmita | 6A preparation | Coordinate/LineString validation, NULL preservation, ordered synthetic legs, tier/provider/unavailable preservation | Routing, geometry inference, public map contract | `backend/app/geospatial/validation.py`, fixture cases |
| `backend/tests/fixtures/geospatial_cases.json` | Clearly labelled known/null/unavailable geometry and synthetic contract-only cases | Susmita | 6A preparation | Regression fixtures for geometry/data-tier/leg-order preservation | Real-world route claims or fabricated geometry | Verified repository data and current transport contract |
| `backend/alembic.ini` | Alembic configuration | Smarak | 0–2 | Migration runner configuration | Runtime product settings | `backend/alembic/` |
| `backend/alembic/` | Alembic environment and Phase 2 schema migration chain | Smarak | 0–2 | Reproducible database schema changes through the live-verified head | Feature data or provider logic | SQLAlchemy models, PostgreSQL/PostGIS |
| `backend/alembic/env.py` | Alembic runtime environment | Smarak | 0–2 | Settings and model metadata wiring | Application request handling | `backend/alembic.ini`, SQLAlchemy models |
| `backend/alembic/versions/0001_initial_schema.py` | Initial canonical database migration | Smarak | 0–2 | Current model tables and PostGIS extension | Seed data or later-phase behavior | Database contract |
| `backend/alembic/versions/0002_make_place_location_nullable.py` | Nullable verified-place location migration | Smarak | 2 | Reversible NULL-coordinate semantics | Fabricated coordinates | Place contract |
| `backend/alembic/versions/0003_preserve_v51_place_metadata.py` | v5.1 provenance and audit metadata migration | Smarak | 2 | Research IDs, category display metadata, and place audit fields | Research fact changes | v5.1 handoff, SQLAlchemy models |
| `backend/alembic/versions/0004_transport_research_layers.py` | Transport research-layer migration | Smarak | 2 | Nullable stop identity metadata, route source metadata, provider source/tier, schedule groups, and fare unknown/status fields | Fabricated transport facts or Phase 3 behavior | AMA handoff, SQLAlchemy models |
| `backend/requirements.txt` | Python dependency pins | Rudra with affected owners | 0–7 | Approved backend dependencies | Unapproved packages | Backend implementation |
| `backend/Dockerfile` | Backend container definition | Rudra | 7 | Backend build/run configuration | Application feature code | Backend package |

## Data

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `data/README.md` | Data rules and directory conventions | Akriti | 1 | Provenance and source requirements | Application logic | Database/import contract |
| `data/places/categories.json` | Current category records | Akriti | 1 | Sourced category input | Database-generated output | Place schema |
| `data/places/places.json` | Current place records | Akriti | 1 | Sourced place input | Example placeholders in final dataset | Place schema and sources |
| `data/transport/static/README.md` | Static transport file shape | Akriti | 1 | Provider topology/schedule input format | Provider implementation | Transport contract |
| `data/transport/static/` | Current provider topology and schedule research inputs | Akriti | 1 | Sourced provider topology/schedule files, including explicit unresolved values | Unsourced routes or schedules | Provider verification |
| `data/transport/fares/` | Current provider fare research inputs | Akriti | 1 | Sourced fares, including explicit unknown amounts | Guessed fares | Provider verification |
| `data/research/` | Research notes and reviewed handoff packages | Akriti | 1/2 | Source evidence and immutable research handoffs | Imported production records | Data rules |

## Frontend

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `frontend/package.json` | React/Vite dependencies and scripts | Deeptiman | 0/6B | Approved frontend tooling | Backend or AI implementation | Frontend contracts |
| `frontend/src/` | Phase 0 contract files and later frontend source tree | Deeptiman | 0/6B | Contract types and later complete frontend implementation | Ranking, itinerary logic, provider logic, authoritative geometry | API and map contracts |
| `frontend/src/api/` | Frontend/backend boundary types | Deeptiman | 0/6B | `contracts.ts` and later API client/types | Backend route implementation | API contract |
| `frontend/src/api/contracts.ts` | TypeScript mirror of the Phase 0 itinerary/transport/API contract | Deeptiman | 0 | Shared frontend/backend types | UI components or business logic | Backend schemas |
| `frontend/src/components/` | Existing empty component tree | Deeptiman | 6B | `TO CREATE`: approved user-facing components | Authoritative geospatial calculations | Frontend design and contracts |
| `frontend/src/components/itinerary/` | Existing empty itinerary component directory | Deeptiman | 6B | Itinerary presentation | Itinerary generation | Itinerary contract |
| `frontend/src/components/map/` | Map boundary record and later map integration | Deeptiman, integrating Susmita | 0/6A/6B | Boundary README and later presentation | Geometry calculation | Map contract |
| `frontend/src/components/map/README.md` | Phase 0 map ownership and boundary record | Susmita/Deeptiman | 0 | Ownership and unresolved map contract | Map implementation | Architecture and map contract |
| `frontend/src/components/transport/` | Existing empty transport component directory | Deeptiman | 6B | Transport-hop presentation | Transport planning | Transport contract |
| `frontend/src/pages/` | Existing empty page directory | Deeptiman | 6B | Approved screens only | Unapproved screens | PRD |
| `frontend/src/store/` | Existing empty state directory | Deeptiman | 6B | Approved presentation state | Database or AI state ownership | Frontend flow |
| `frontend/tests/fixtures/sample_itinerary.json` | Current frontend contract fixture | Deeptiman with Smarak/Rudra | 4/6B | Shared itinerary fixture data | Untracked alternate contract | Itinerary contract |
| `frontend/tests/` | Fixture and Phase 0 contract tests | Deeptiman | 0/6B | Contract and later component tests | Backend implementation | Frontend dependencies |
| `frontend/tests/contracts.test.ts` | Phase 0 TypeScript contract tests | Deeptiman | 0 | Type-level fixture coverage | Product behavior tests | `frontend/src/api/contracts.ts` |

## Scripts and infrastructure

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `scripts/import_places.py` | Place validation and database importer | Smarak | 2 | Strict place/category validation, coordinate mapping, nullable-location handling, provenance-preserving upserts | Ranking or frontend behavior | Place data and DB models |
| `scripts/verify_places.py` | Read-only post-import evidence generator | Smarak | 2 | Counts, provenance, duplicate, coordinate, and PostGIS checks | Database writes or product behavior | Place data and DB models |
| `scripts/import_transport.py` | Provider-neutral transport loader | Smarak | 2 | Generic provider/route/fare normalization and import boundary | Provider API implementation | Transport data and DB models |
| `scripts/import_ama_bus.py` | Corrected AMA Bus research-package adapter | Smarak/Akriti | 2 | Explicit package validation and provenance-preserving confirmed-slice import | Route topology or provider APIs | AMA Bus research handoff and transport schema |
| `scripts/data_validation.py` | Phase 0 source-data preflight helpers | Smarak | 0/2 | Schema-shape and provenance preflight | Database writes or provider research | `data/` contracts |
| `infra/docker-compose.yml` | Current local PostgreSQL/PostGIS and backend stack | Rudra | 2/7 | Local environment configuration | Product logic | Database and backend |

`OPEN DECISION`: The architecture documentation describes a whole-stack local demo,
while the current Compose file contains no frontend service. The required final local
stack shape must be approved before infrastructure changes.

## Evidence and handoff records

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `docs/phases/PHASE_2_DOCUMENTATION_SYNC_REPORT_2026-08-17.md` | Final Phase 2 documentation/state synchronization report | Punam | 2/3 | Evidence-backed status, gate, handoffs, blockers, and next actions | New implementation or research facts | `docs/PHASES.md`, live acceptance evidence |
| `docs/handoffs/2026-08-17_RUDRA_PHASE2_TRANSPORT_HANDOFF.md` | Phase 2 transport outputs and Phase 3 boundaries for Rudra | Smarak/Punam | 2/3 | Confirmed outputs, unresolved states, ownership, and next action | Provider implementation | AMA adapter and Phase 3 contract |
| `docs/handoffs/2026-08-17_SUSMITA_PHASE2_GEOMETRY_HANDOFF.md` | Phase 2 geometry limitations for Susmita | Smarak/Punam | 2/6A | NULL/unavailable geometry semantics and dependencies | Invented coordinates or map implementation | Phase 2 spatial evidence |
| `docs/handoffs/2026-08-17_SMARAK_PHASE2_ACCEPTANCE_HANDOFF.md` | Phase 2 engineering acceptance record for Smarak | Punam | 2 | Verified implementation responsibilities and research boundary | Competing canonical status | `docs/MEMORY.md` |
| `docs/handoffs/2026-08-17_AKRITI_RESEARCH_CLOSURE_HANDOFF.md` | Remaining AMA research closure items for Akriti | Smarak/Punam | 2 | Explicit unresolved records and evidence needed | Guessed facts or schema changes | AMA research package |
| `docs/handoffs/2026-08-17_DEEPTIMAN_PHASE2_DEPENDENCY_HANDOFF.md` | Later frontend dependency record for Deeptiman | Smarak/Punam | 2/6B | API/map dependency and scope boundary | Unauthorized frontend features | Phase 3/6 contracts |
| `docs/handoffs/2026-08-17_PUNAM_DOCUMENTATION_SYNC_HANDOFF.md` | Documentation and release-readiness maintenance record | Punam | 2/7 | Canonical evidence and synchronization responsibilities | Implementation ownership | All canonical docs |
| `docs/handoffs/2026-08-17_SMARAK_PHASE3_CONTROL_REPORT.md` | Phase 3 control contract and actual-state discrepancy report | Smarak | 3 | Objective, scope, ownership, contracts, and exclusions | Agent implementation or unsupported completion claims | `docs/PHASES.md`, actual repository |
| `docs/handoffs/2026-08-17_SMARAK_PHASE3_PROGRESS.md` | Smarak Phase 3 coordination decision ledger | Smarak | 3 | Decisions, reasons, affected agents, tests, and unresolved questions | General memory or agent-owned implementation | Phase 3 evidence |
| `docs/phases/PHASE_3_ACCEPTANCE_CHECKLIST_2026-08-17.md` | Phase 3 requirement/owner/test/evidence tracker | Smarak/Punam | 3 | Acceptance status and blockers based on actual evidence | Unverified completion claims | `docs/PHASES.md`, agent reports |
| `docs/handoffs/2026-08-18_RUDRA_PHASE3_SCOPE_REPORT.md` | Rudra Phase 3 implementation scope and evidence plan | Punam/documentation sync | 3 | Actual repository state, provider scope, contracts, dependencies, blockers, and acceptance evidence | Phase 3 implementation or completion claims | Smarak Phase 3 control, provider record, Phase 2 transport handoff |
| `docs/handoffs/2026-08-18_SUSMITA_PHASE3_DEPENDENCY_PHASE6A_READINESS_REPORT.md` | Susmita Phase 3 dependency and Phase 6A preparation handoff | Punam/documentation sync | 3/6A | Rudra-to-Susmita requirements, map boundary, geometry rules, readiness, and tests | Phase 6A implementation or invented GeoJSON contract | Phase 2 geometry handoff, transport/itinerary contracts, Rudra output |
| `docs/handoffs/2026-08-18_SUSMITA_PHASE6A_PREPARATION_REPORT.md` | Susmita's bounded Phase 6A preparation evidence and open-decision/dependency record | Susmita/Punam | 6A preparation | Validation, fixture scope, Rudra dependency, and map-contract gap | Final map contract, routing, fabricated geometry, complete UX | Rudra output and Smarak contract decision |
| `docs/handoffs/2026-08-18_SMARAK_PHASE4_DECISIONS.md` | Approved Phase 4 deterministic semantics and contract decisions | Smarak | 4 | Ranking, itinerary, sequence propagation, facts-only API, and inherited limitations | Phase 4 acceptance claim or later-phase implementation | Phase 4 scope report and canonical documents |
| `docs/handoffs/2026-08-18_SMARAK_PHASE4_SCOPE_REPORT.md` | Phase 4 gate, repository reality, dependencies, and implementation plan | Smarak | 4 | Scope evidence and acceptance planning | Phase 4 completion claim | Canonical documents and Phase 3 handoff |
| `docs/handoffs/2026-08-18_SMARAK_PHASE4_IMPLEMENTATION_HANDOFF.md` | Phase 4 implementation evidence and downstream handoff | Smarak | 4 | Implemented semantics, files, tests, limitations, and acceptance status | Phase 4 acceptance claim without review | Phase 4 decisions and canonical documents |
| `docs/handoffs/2026-08-18_SMARAK_PHASE4_ACCEPTANCE_HANDOFF.md` | Phase 4 acceptance record and Phase 5 starting baseline | Smarak | 4/5 | Accepted deterministic semantics, evidence, inherited limitations, and explicit Phase 5 non-assumptions | New feature implementation or Phase 5 work before its gate opens | Phase 4 decisions and implementation handoff |
