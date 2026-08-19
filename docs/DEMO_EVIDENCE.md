# O-Travelz Phase 8 Demo & Readiness Evidence

**Document Status**: Canonical Release Evidence
**Coordination**: Punam & Engineering Team
**Scope**: Full validation metrics, test counts, Azure live verification, and criteria mapping.

---

## 1. Quality Gates & Test Results

### 1.1 Backend Suite (`pytest backend/tests`)
- **Total Tests**: **274 passed**
- **Warnings**: 1 (Pydantic v2 `config` deprecation warning in `backend/app/core/config.py`)
- **Failures**: **0**
- **Test Modules**:
  - `test_ai_phase5.py`: 19 passed
  - `test_ama_bus_adapter.py`: 5 passed
  - `test_data_validation.py`: 2 passed
  - `test_geospatial_validation.py`: 14 passed
  - `test_health.py`: 1 passed
  - `test_image_ingestion.py`: 15 passed
  - `test_image_model.py`: 8 passed
  - `test_image_proxy.py`: 4 passed
  - `test_image_storage.py`: 10 passed
  - `test_import_places.py`: 50 passed
  - `test_import_transport.py`: 15 passed
  - `test_itinerary.py`: 7 passed
  - `test_itinerary_api.py`: 3 passed
  - `test_phase0_contracts.py`: 7 passed
  - `test_phase0_database.py`: 4 passed
  - `test_phase6a_map_http.py`: 49 passed
  - `test_phase6a_map_projection.py`: 29 passed
  - `test_place_repository.py`: 2 passed
  - `test_places_api.py`: 6 passed
  - `test_ranking.py`: 3 passed
  - `test_transport/`: 20 passed

### 1.2 Frontend Suite (`vitest run`)
- **Total Tests**: **121 passed** across 15 suites
- **Failures**: **0**
- **Test Modules**:
  - `map_components.test.tsx`: 13 passed
  - `image_api_consumption.test.tsx`: 9 passed
  - `itinerary_components.test.tsx`: 17 passed
  - `canonical_demo_flow.test.tsx`: 8 passed
  - `ux_correction_regression.test.tsx`: 10 passed
  - `image_pipeline_and_discover_pass.test.tsx`: 8 passed
  - `master_ui_ux_completion.test.tsx`: 9 passed
  - `master_productization_matrix.test.tsx`: 6 passed
  - `whole_odisha_product.test.tsx`: 6 passed
  - `ai_components.test.tsx`: 8 passed
  - `client.test.ts`: 11 passed
  - `map_flow.test.ts`: 4 passed
  - `ai_flow.test.ts`: 6 passed
  - `itinerary_flow.test.ts`: 4 passed
  - `contracts.test.ts`: 2 passed

### 1.3 Production Build
- **Command**: `npm --prefix frontend run build` (`tsc && vite build`)
- **Result**: `✓ built in 4.64s` (0 TypeScript errors, clean bundle).

---

## 2. Live Cloud Infrastructure Verification

- **Subscription**: `Azure subscription 1` (`bf088c00-1345-40c5-ae2d-cc5d3d7b37fd`)
- **Tenant**: `Default Directory` (`eab00a04-9b9a-47b3-b68b-e015086ce796`)
- **Resource Group**: `rg-otravelz-prod` (`centralindia`)
- **Storage Account**: `stotravelzprod` (`StorageV2`, `Standard_LRS`, `Hot` tier)
- **Container**: `otravelz-images` (**PRIVATE**, anonymous blob access disabled)
- **RBAC**: `Storage Blob Data Contributor` assigned to signed-in CLI identity
- **Blobs Present**: **68 WebP blobs** verified live under `places/` hierarchy
- **Image Proxy Verification**:
  - `GET /api/v1/images/places/place_bbsr_001/6565b97835e5/hero.webp` $\rightarrow$ `200 OK` (6,772 bytes, `image/webp`, `Cache-Control: public, max-age=31536000, immutable`)
  - Missing image $\rightarrow$ `404 Not Found`
  - Path traversal attempt $\rightarrow$ `404/400 Blocked`

---

## 3. End-to-End Rehearsal Evidence

Live rehearsal via [`scratch/phase8_demo_rehearsal.py`](file:///c:/Users/smara/Desktop/o-travelz/scratch/phase8_demo_rehearsal.py):

```text
================================================================================
             PHASE 8 CANONICAL DEMO SCENARIOS REHEARSAL
================================================================================

################################################################################
REHEARSAL SCENARIO 1: Odisha Heritage Triangle (3 Days)
################################################################################
Step 1.1: Requesting 3-day Heritage Itinerary from Bhubaneswar...
  -> Generated Itinerary ID: itinerary-689fd9420c4e8e36655d5c9d
  -> Days generated: 3 (9 stops, 7 transport hops)
Step 1.2: Rehearsing AI Refinement (Adjust to 2 days starting from Puri)...
  -> AI Grounded Response: "Here is the grounded result. I built a 2-day itinerary with 6 planned stop(s)..."
  -> Refined Days: 2
Step 1.3: Projecting S1 stops to Map...
  -> Map features projected: 3 available Point features
Step 1.4: Verifying Live Azure Imagery for Lingaraj & Jagannath...
  -> Live Image GET /api/v1/images/place_bbsr_001: 200 OK (6772 bytes)
  -> Live Image GET /api/v1/images/place_puri_001: 200 OK (6978 bytes)
  -> SCENARIO 1 REHEARSAL RESULT: 100% REPRODUCIBLE PASS

################################################################################
REHEARSAL SCENARIO 2: Coastal & Nature Trail (2 Days)
################################################################################
Step 2.1: Requesting 2-day Nature/Beach Itinerary from Puri...
  -> Generated Itinerary ID: itinerary-6d814543ceada4a087fa5696
  -> Days generated: 2 (6 stops, 5 transport hops)
Step 2.2: Rehearsing AI Clarification behavior on ambiguous input...
  -> AI Safety Clarification: Status='clarification'
  -> Clarification Message: "How many days should I plan, and which Odisha region..."
Step 2.3: Rehearsing AI Explicit Refinement (Extend to 3 days with wildlife)...
  -> AI Refinement: Status='success'
  -> Refined Message: "Here is the grounded result. I built a 3-day itinerary with 9 planned stop(s)..."
  -> Refined Days: 3
  -> SCENARIO 2 REHEARSAL RESULT: 100% REPRODUCIBLE PASS
```

---

## 4. Distinction of Facts & Data Tiers

| Data Category | Representation in System | Example in UI |
| :--- | :--- | :--- |
| **Deterministic Facts** | Generated by backend Python engines | Stop sequence, travel time calculation, budget sum |
| **Sourced Facts** | Verified canonical dataset & licensing | Place name, coordinates, entry fee, CC BY-SA 4.0 license |
| **Estimated / Heuristic Data** | Explicitly tagged with data tiers | `data_tier: "heuristic"` or `data_tier: "static"` badge on transit hops |
| **Unavailable Data** | Explicit `unavailable_reason` tags | `"coordinate_unverified"`, `"provider_geometry_unavailable"` in Map drawer |

---

## 5. Phase 8 Acceptance & Exit Criteria Mapping

| Criterion | Source in PHASES.md | Observed Evidence | Verdict |
| :--- | :--- | :--- | :--- |
| **Selected demo scenarios are reproducible** | Phase 8 Acceptance | Scenarios 1 & 2 pass consistently in automated scripts and live server | **PASS** |
| **Displayed facts are sourced or deterministic** | Phase 8 Acceptance | Zero AI-generated facts; all stops sourced from verified DB records | **PASS** |
| **Estimated/unavailable info is not hidden** | Phase 8 Acceptance | `DataTierBadge` and `UnavailableHopAlert` represent all tiers explicitly | **PASS** |
| **Selected scenarios run consistently** | Phase 8 Exit | 100% pass across automated and manual test runs | **PASS** |
| **Limitations & data tiers documented** | Phase 8 Exit | Documented in `docs/KNOWN_LIMITATIONS.md` and `docs/DEMO_RUNBOOK.md` | **PASS** |
