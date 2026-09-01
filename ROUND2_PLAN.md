# ROUND2_PLAN.md — O-TRAVELZ SOA IDEATHON 2026 Round 2 Implementation Plan

> Full technical strategy is in `PROJECT_CONTEXT.md` and the `implementation_plan.md` artifact.
> This file tracks ordered checkpoints and per-task status.
> Update this file as tasks are completed.

**Status key**: `[ ]` not started · `[/]` in progress · `[x]` complete · `[-]` blocked/deferred

## AI Intelligence Scope Freeze (Round 2)

> **STATUS: FEATURE COMPLETE FOR ROUND 2 (FEATURE-FROZEN)**
>
> - **Completed**: Structured multilingual constraints, tool orchestration (weather, crowd, transit), localized single-stop replacement, Evidence Drawer & ClaimBadges, multimodal landmark vision & cosine fallback, task-aware routing, privacy-safe telemetry, 51-case deterministic AI benchmark suite.
> - **Allowed Work**: Bug fixes, regression fixes, grounding fixes, truthful wording/labels, demo hardening.
> - **Deferred Work**: Additional AI product capabilities, model experimentation, custom training, major routing refactors.

---

## Checkpoint 1 — P0 Stability

Goal: The app must not crash on any standard demo interaction. All unsupported product claims must be removed.

- [ ] **1.1** Fix `grounded_msg` UnboundLocalError in `backend/app/ai/conversation.py`
  - Inspect current HEAD first — may already be fixed.
  - If present: initialize `grounded_msg` to safe default before conditional assignment block.
  - Add regression test: non-planning conversational message must not raise `UnboundLocalError`.

- [ ] **1.2** Add regression test for conversational no-tool path
  - File: `backend/tests/test_conversation.py`
  - Test: `test_converse_conversational_question_no_tool`
  - Verify: non-empty message returned, no 500/exception

- [ ] **1.3** Remove misleading product claims
  - Files: `README.md`, `frontend/src/pages/DemoHome.tsx`, tooltip/label text
  - Remove: "zero hallucination guarantee", "real-time bus tracking", "AI vision recognition", "live restaurant ratings"
  - Remove: any invented ₹ fare values
  - Replace with honest equivalents (see `PROJECT_CONTEXT.md` > Truthfulness Rules)

- [ ] **1.4** Fix `doctor.ps1` dual-port database probe
  - Probe port 5433 (Docker PostGIS) then fall back to 5432 (native PostgreSQL)
  - Report clearly which database connection is active

- [ ] **1.5** Add `GET /system/status` health endpoint
  - File: `backend/app/main.py`
  - Returns: `{database, ai, weather, transit, auth}` with status and minimal details
  - Frontend: subtle demo-mode indicator only — do not clutter production UX

- [ ] **1.6** Manual UI button verification
  - Every primary button on `DemoHome.tsx` and `ItineraryPlannerPage.tsx` must produce a visible result
  - "Share trip" and "Save trip" must either work or display "Coming soon" — not silently freeze
  - AI Copilot must handle both planning and non-planning messages without 500

**Checkpoint 1 done when**: App runs, no 500 on any standard demo interaction, misleading claims removed.

---

## Checkpoint 2 — Image Pipeline & Publishability (Image Track A1)

> **STATUS: TRACK A1 COMPLETE (CANONICAL INGESTION + QUALITY PIPELINE + SHADOW PUBLISHABILITY)**
>
> - **Completed (Track A1)**:
>   - Canonical manifest contract & typed Pydantic models with 100% backward compatibility (`backend/app/storage/manifest.py`)
>   - Ingestion safety hardening: aspect ratio [0.5, 3.0], 50M pixel decompression bomb guard, strict WebP format (`backend/app/storage/processor.py`, `backend/app/storage/downloader.py`)
>   - Unified CLI ingestion pipeline (`scripts/ingest_destination_images.py`) supporting URL, local file, batch, and regional candidates with SHA-256 duplicate detection
>   - Unified Destination Image Auditor (`scripts/audit_destination_images.py`) generating authoritative shadow report `data/images/sources/publishability_report.json`
>   - Canonical Image Pipeline Integrity Validator (`scripts/validate_image_pipeline.py`) verifying structural, dimensional, and cryptographic storage consistency
>   - Five-case end-to-end pilot verified (idempotency, provenance safety block, dry-run research validation, duplicate detection, generic evidence rejection)
>   - **Verified Baseline**: 161 production places, 50 canonical manifest records, 81 local variant sets, 45 exact verified images, 45 shadow-publishable destinations (27.95%), 0 pipeline integrity errors.
> - **Shadow Mode Note**: All publishability evaluation remains in shadow mode; production visibility in `places.json` and the frontend was not altered during A1.
> - **Next Image Workstreams**: Track A2 (Legacy Production Image Provenance Recovery for 31 unmanifested places) / Track A3 (Controlled Regional Image Acquisition for Round 2 candidates).

- [x] **2.1** Canonical Manifest Contract & Safety Hardening (`backend/app/storage/manifest.py`, `processor.py`)
- [x] **2.2** Unified Destination Image Ingestion CLI (`scripts/ingest_destination_images.py`)
- [x] **2.3** Unified Destination Image Auditor & Shadow Publishability Engine (`scripts/audit_destination_images.py`)
- [x] **2.4** Canonical Image Pipeline Integrity Validator (`scripts/validate_image_pipeline.py`)
- [x] **2.5** Five-Case End-to-End Pilot Execution (`backend/tests/test_image_pilot_end_to_end.py`)
- [x] **2.6** (Track A2) Legacy Production Image Provenance Recovery (31 unmanifested places)
  - **Status**: COMPLETE. All 31 legacy unmanifested places audited across external web discovery.
  - **Ingested**: 20 canonical records (17 EXACT_LOCATION_VERIFIED, 3 RELATED_LOCATION_ONLY food hubs).
  - **Strict Evidence**: Reconciled to 112 records in `strict_photo_evidence_registry.json` (0 sync gaps).
  - **Description Repairs**: 7 factual archaeological description repairs completed (`place_012`, `place_018`, `place_020`, `place_021`, `place_022`, `place_026`, `place_027`).
  - **Unrecoverable Backlog**: 11 places structured in `data/images/sources/a2_unrecoverable_backlog.json` for first-party/community acquisition.
  - **Shadow Publishable Metrics**: 62 / 161 destinations (38.51%) pass all 8 publishability gates (up from 45 at start of Track A).
  - **Integrity**: 0 validator errors, 100% byte-identical legacy asset preservation.
- [ ] **2.7** (Track A3) Controlled Regional Image Acquisition for Round 2 Candidates
- [ ] **2.8** (Track A4) Production Catalog Publishability Enforcement & Visibility Cutover

**Checkpoint 2 / Track A1 done when**: Canonical image ingestion and quality pipeline complete, 0 integrity errors, shadow publishability baseline established, full regression tests passing.

---

## Checkpoint 3 — Transit Canonicalization

Goal: One unified, authoritative transit source of truth. Frontend fallback data derived from canonical files.

- [ ] **3.1** Run transit coordinate resolution script
  - File: `scripts/transit_coordinate_resolution.py`
  - Tier 1: promote the 17 Nominatim-geocoded stops from `stop_geocoding_report.json`
  - Tier 3: cross-reference stop names against `places.json` canonical coordinates
  - Never fabricate coordinates for Tier 4 (ambiguous/unresolved) stops

- [ ] **3.2** Generate `data/transport/canonical/stops.json`
  - Canonical stop model: `stop_id`, `canonical_name`, `aliases[]`, `city`, `district`, `lat`, `lon`, `coordinate_source`, `coordinate_confidence`, `served_routes[]`, `is_terminal`, `is_interchange`, `verification_status`, `verified_at`
  - Verification statuses for production: `VERIFIED_OFFICIAL`, `VERIFIED_GEOSPATIAL`, `RESOLVED_HIGH_CONFIDENCE` only
  - Target: 80–120 verified stops (currently ~46)

- [ ] **3.3** Generate `data/transport/canonical/routes.json`
  - All 154 CRUT routes from `data/research/transit/extraction/routes_extracted.json`
  - Fields: `route_id`, `route_number`, `route_name`, `operator`, `origin`, `destination`, `service_area`, `verification_status`, `source_document`, `effective_date`

- [ ] **3.4** Generate `data/transport/canonical/route_stops.json`
  - Route-stop sequences using canonical stop IDs
  - Only include sequences with verified/confirmed stop orders; mark partial sequences explicitly

- [ ] **3.5** Update `frontend/src/data/staticTransitStops.ts`
  - Generate from canonical `stops.json` — do not hand-edit independently
  - Target: 80+ stops with verified coordinates

- [ ] **3.6** Update backend importer to load canonical stops + routes
  - File: `backend/app/transport/importer.py`
  - Replace separate `ama_bus.json` / `ama_e_ride.json` seed with canonical files

- [ ] **3.7** Update `TransitEngine` to use canonical stop IDs consistently
  - File: `backend/app/transport/engine.py`

**Checkpoint 3 done when**: One canonical transit dataset used by backend and frontend. ~80+ verified stops. All research data clearly distinguished from production data.

---

## Checkpoint 4 — Multimodal Intelligence (Primary Novelty)

Goal: For each itinerary leg, show a verified side-by-side Private vs Public transit comparison.

- [ ] **4.1** Add `multimodal_comparison` to itinerary stop/leg schema
  - File: `backend/app/schemas/itinerary.py`
  - Fields: `private_option`, `public_option`, `public_option_available: bool`

- [ ] **4.2** Implement `TransitComparator` module
  - File: `backend/app/transport/comparator.py`
  - Private: Haversine distance × 1.25 road factor → estimated duration
  - Public: nearest boarding stop from canonical registry → verified route → exit stop → walking time → next scheduled departure from timetable
  - If no verified connection: `public_option_available = false`, message: "No verified public-transit option is currently available for this leg."

- [ ] **4.3** Integrate `TransitComparator` into itinerary service
  - File: `backend/app/services/itinerary/service.py`

- [ ] **4.4** Render multimodal comparison card in planner UI
  - File: `frontend/src/pages/ItineraryPlannerPage.tsx`
  - Show: Private column (distance, estimated duration) + Public column (stop, route, next departure, total time)
  - Labels: "Estimated" on private duration, "Scheduled · CRUT timetable" on departure time

- [ ] **4.5** Scheduled departure countdown badge on transit stop cards
  - Compute from `transitTimetables.ts` vs current IST clock
  - Label: `Next Route 09 departure: 18:35 IST · Scheduled`
  - Source line: `Published CRUT timetable (2026-08-21)`

- [ ] **4.6** Write unit tests for `TransitComparator`
  - File: `backend/tests/test_transit_comparator.py`
  - Mock canonical stop registry and schedule data

**Checkpoint 4 done when**: A judge can request a leg (e.g., Lingaraj Temple → Puri Beach) and see a Private vs Public comparison with honest labels and a scheduled departure time.

---

## Checkpoint 5 — Explainability & Polish

Goal: The planner explains its recommendations. Source/confidence labels are visible on key data fields.

- [ ] **5.1** Add "Why this stop?" rationale to itinerary stop output
  - File: `backend/app/services/itinerary/service.py`
  - Deterministic rules: distance from previous stop, open during time slot, interest match, reduced backtracking
  - No invented AI justification — pure deterministic logic

- [ ] **5.2** Add confidence/source labels to UI
  - Key fields: departure time (`Scheduled`), distance (`Estimated`), weather (`Live · Open-Meteo`), rating (`Researched · Aug 2026`), place data (`Verified`)
  - Keep labels subtle — do not clutter the UX

- [x] **5.3** Single-stop replacement endpoint
  - Localized itinerary stop replacement service & tool adapter (`backend/app/services/itinerary/replacement_service.py`)
  - Frontend Evidence Drawer component & claim badge integration

- [x] **5.4** Multimodal Landmark Recognition & Canonical Grounding (Checkpoint AI-5A)
  - Multimodal image classification pipeline with security sanitization (`image_validator.py`, `landmark_classifier.py`)
  - Canonical dataset destination grounding with cosine fallback

- [x] **5.5** AI Quality Benchmarks, Task-Aware Routing & Safe Telemetry (Checkpoint AI-5B)
  - 51-case deterministic benchmark dataset (`data/benchmarks/ai/benchmark_cases.json`)
  - Multi-dimensional evaluator (`benchmark_evaluator.py`, `run_ai_benchmarks.py`)
  - Capability-based task router (`routing.py`) with zero-cost and latency budget guards
  - Privacy-safe telemetry recorder (`telemetry.py`) with credential redaction

**Checkpoint 5 done when**: Multimodal vision, evidence drawer, task-aware routing, and deterministic benchmark suite are verified and passing all regression gates.

---

## Checkpoint 6 — Database Expansion & Regional Research

Goal: Expand destination catalog across all 30 districts via structured regional research. All additions must pass automated staging validation and publishability gates.

- [ ] **6.1** Regional research staging & team assignments (see [`ROUND2_TEAM.md`](ROUND2_TEAM.md))
  - Eastern: Rudra (Cuttack, Jagatsinghpur, Jajpur, Bhadrak, Kendrapara, Dhenkanal, Angul)
  - Western: Akriti (Sambalpur, Bargarh, Jharsuguda, Balangir, Subarnapur, Nuapada, Deogarh, Sundargarh)
  - Southern: Susmita (Ganjam, Gajapati, Koraput, Rayagada, Nabarangpur, Malkangiri, Kalahandi, Kandhamal, Boudh)
  - Northern: Punam (Mayurbhanj, Balasore, Keonjhar, Puri, Khordha, Nayagarh)
  - Priority target districts: Boudh (2), Nuapada (2), Deogarh (2), Bargarh (2), Rayagada (2), Nabarangpur (2), Kendrapara (2)

- [ ] **6.2** Automated validation of staged records
  - Run: `python scripts/validate_round2_research.py`
  - Validates schemas, bounding box (17.8–22.6°N, 81.4–87.5°E), district-region alignment, duplicates

- [ ] **6.3** Gather evidence & provenance for staged candidates
  - Verified coordinates (OSM / satellite cross-check)
  - Sourced factual description (≥ 50 characters)
  - Provenance URL or document logged in `sources.json`
  - Reusable CC-licensed image lead logged in `candidates.json`

- [ ] **6.4** Core review & image pipeline
  - Human cross-review by Core (Deepti + Smarak)
  - Run image validation and variant generation

- [ ] **6.5** Publishability evaluation & production promotion
  - Gate evaluation (`scripts/update_publishability.py`)
  - Promotion to `data/places/places.json` by Core only

**Checkpoint 6 done when**: 15–20 new publishable destinations added across underrepresented districts, all with verified coordinates and validated images.

---

## Transit Track B — Canonical Mo Bus & Ama Bus Transit Network

- [x] **Track B1 — Canonical Data Foundation & Compiler Pipeline**
  - Canonical output directory created: `data/transport/canonical/` (`stops.json`, `routes.json`, `route_stops.json`, `schedules.json`, `aliases.json`, `network.json`, `build_report.json`)
  - 154 routes compiled from official schedule PDFs
  - 1,430 logical canonical stops with stable IDs
  - 164 directional sequence lists (1,491 stop occurrences)
  - 302 schedules compiled with 5,549 validated `HH:MM` departure times (0 malformed)
  - 2,924 alias mappings registered
  - Two explicit stop sets maintained: Logical Canonical Stops vs Routable Geographic Stops
  - Zero coordinate fabrication enforced (unresolved stops stay `lat: null`, `lon: null`)
  - Offline deterministic compiler: `scripts/compile_canonical_transit.py`
  - Integrity validator: `scripts/validate_canonical_transit.py`
  - Test suite: `backend/tests/test_canonical_transit_pipeline.py` (14 passing assertions)

- [x] **Track B1.5 — Canonical Stop Coordinate Resolution & Verification**
  - Expanded verified coordinate coverage from 9 to **83 routable stops** across 3 strict provenance tiers:
    - Tier 1: Existing internal verified registries (31 stops with `VERIFIED_OFFICIAL`)
    - Tier 2: Canonical places catalog cross-reference (26 stops with `RESOLVED_HIGH_CONFIDENCE`)
    - Tier 3: External geospatial resolution via OSM Nominatim (26 stops with `VERIFIED_GEOSPATIAL`)
  - Zero coordinate fabrication: 1,347 unresolved stops remain strictly `lat: null`, `lon: null`
  - Network-value priority ranking generated: `geocoding_priority.json`
  - Persistent offline lookup cache: `geocoding_cache.json`
  - Ambiguous stop review queue: `coordinate_review_queue.json`
  - Route corridor sanity checker: flags excessive hops (> 75 km)
  - Top 25 interchange hubs coverage reached **52.0% (13/25)**
  - 58 routes now have ≥ 2 routable stops
  - Script: `scripts/resolve_canonical_transit_coordinates.py`
  - Unit tests: `backend/tests/test_transit_coordinate_resolution.py` (15 passing tests)

- [x] **Track B2 — Migrate Backend Routing to the Canonical Transit Network**
  - Built typed in-memory `CanonicalTransitRepository` (`backend/app/transport/canonical_repository.py`) indexing all 154 routes, 1,430 logical stops, 164 sequences, 302 schedules, and 2,924 aliases.
  - Strict separation of Logical Transit Graph (all 154 routes / 1,430 stops) vs Spatial Access Graph (83 verified coordinate stops).
  - Unresolved stops strictly excluded from nearest-stop lookups, spatial walking edges, and geometry.
  - Logical sequence reasoning allows intermediate unresolved stops without fabricating coordinates.
  - `MoBusAdapter`, `TransportService`, `TransitEngine`, and `MultimodalJourneyPlanner` wired directly to canonical data.
  - Schedule truthfulness: returns `data_tier = "scheduled"` with official timetable departure blocks; fares strictly `null`.
  - AI tools (`get_transit_options`, `plan_transport_hop`, `get_provider_status`) share the canonical backend truth.
  - Unit tests: `backend/tests/test_canonical_backend_routing.py` (18 passing assertions).
  - All 989 backend tests green.

- [x] **Track B3 — Sync Frontend Transit Fallbacks with Canonical Network**
  - Built deterministic generator `scripts/generate_frontend_transit_data.py` compiling TypeScript assets directly from `data/transport/canonical/`.
  - Added `--check` drift detector to prevent frontend and canonical data diverge.
  - Generated `frontend/src/data/staticTransitStops.ts` (strictly coordinate-bearing verified stops for map rendering).
  - Generated `frontend/src/data/staticTransitRoutes.ts` (all 154 canonical routes & logical sequence topology).
  - Generated `frontend/src/data/transitTimetables.ts` (all 302 schedules & 5,549 verified departure timestamps).
  - Standardized next-departure helper comparing against IST (`getNextScheduledDeparture`).
  - Standardized provenance labels ("Next scheduled departure: HH:MM IST", "Scheduled", "Published CRUT timetable").
  - Automated tests: `frontend/tests/canonical_frontend_transit_sync.test.tsx` (13 passing tests).
  - All 592 frontend tests passing, 0 failed; TypeScript check and Vite production build clean.

---

## Round 1 Feedback Mapping

*(Populate when judge feedback is received — do not invent)*

| Judge Suggestion | Meaning | Existing Support | Required Change | Demo Proof | Effort | Risk | Status |
|---|---|---|---|---|---|---|---|
| *(TBD)* | | | | | | | |

---

## Commit Log (update as commits are made)

| Commit SHA | Message | Checkpoint |
|---|---|---|
| *(none yet)* | | |
