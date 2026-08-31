# ROUND2_PLAN.md — O-TRAVELZ SOA IDEATHON 2026 Round 2 Implementation Plan

> Full technical strategy is in `PROJECT_CONTEXT.md` and the `implementation_plan.md` artifact.
> This file tracks ordered checkpoints and per-task status.
> Update this file as tasks are completed.

**Status key**: `[ ]` not started · `[/]` in progress · `[x]` complete · `[-]` blocked/deferred

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

## Checkpoint 2 — Image Pipeline & Publishability

Goal: Every place in the public catalog must pass a validated image gate. The gate is deterministic and auditable.

- [ ] **2.1** Add `publishable` and `image_status` fields to Place model
  - File: `backend/app/models/place.py`
  - Add Alembic migration
  - Fields: `publishable: bool = False`, `image_status: Optional[str]`, `publishability_reason: Optional[str]`

- [ ] **2.2** Write `scripts/image_audit.py`
  - Read `data/images/sources/manifest.json` (50 entries, currently all `quality_status: "unknown"`)
  - Validate: dimensions, aspect ratio, file size, SHA256 vs blacklist, source domain
  - Write `data/images/quality_report.json`

- [ ] **2.3** Write `scripts/image_validate.py`
  - Deterministic gate (no AI): valid file format, ≥ 800×450 px, 0.5–3.0 aspect ratio, 50 KB – 25 MB
  - Set `quality_status: "verified" | "rejected" | "needs_review"`

- [ ] **2.4** Write `scripts/update_publishability.py`
  - For each place in `places.json`, check if gate criteria are met
  - Set `publishable: true/false` and `publishability_reason`

- [ ] **2.5** Add `?publishable=true` filter to `/places` API
  - File: `backend/app/api/places_routes.py`
  - Default: `publishable=true` for public catalog

- [ ] **2.6** Frontend: filter destination catalog to publishable places only
  - Files: `frontend/src/pages/stitch/StitchDestinationsPage.tsx` and related

- [ ] **2.7** (Optional) Write `scripts/image_acquire.py`
  - Wikimedia Commons API search for destinations without manifest entries
  - Human review before any image is accepted into catalog

**Checkpoint 2 done when**: All public-facing destinations have at least one quality-checked image. Places without verified images are hidden from the catalog (research/staging only).

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

- [ ] **5.3** Single-stop replacement endpoint
  - File: `backend/app/api/itinerary_routes.py`
  - Input: current itinerary, stop index to replace, user preferences
  - Output: suggested replacement respecting distance, time window, interests
  - No full trip regeneration required

- [ ] **5.4** Write `start_demo.ps1` — one-command demo startup
  - Start Docker + verify PostGIS on 5433 or 5432
  - Start backend uvicorn
  - Start frontend Vite dev server
  - Open browser to `http://localhost:5173`
  - Print `GET /system/status` summary
  - If Docker unavailable: start in L3 mode and notify team

**Checkpoint 5 done when**: Each itinerary stop shows a one-line rationale. Source labels are present on key data fields. Demo startup is a single command.

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
