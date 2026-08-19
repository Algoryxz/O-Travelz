# O-Travelz Project Memory

**Status**: Canonical Current-State Ledger (Phase 8 Demo Preparation & Release Baseline Complete)

This is a project-state record, not general AI memory.

---

## Current State & Phase Completion Summary

- **Phase 0 (Canonical Contracts & Freeze)**: Accepted.
- **Phase 1 (Research & Verification)**: Accepted.
- **Phase 2 (Database & Importers)**: Accepted.
- **Phase 3 (Transport Graph & Providers)**: Accepted with explicit limitations.
- **Phase 4 (Ranking & Itinerary Generation)**: Accepted.
- **Phase 5 (AI Orchestration & Grounding)**: Accepted.
- **Phase 6A (Geospatial, Map Projection V2 & Live Azure Storage)**: **ACCEPTED & VERIFIED**.
- **Phase 6B (Frontend Implementation & UX Pass)**: **ACCEPTED & VERIFIED**.
- **Phase 7 (Readiness & Integration Gate)**: **PASS — COMPLETE & VERIFIED**.
- **Phase 8 (Demo Preparation & Rehearsal)**: **PASS — COMPLETE & VERIFIED**.

---

## Canonical Demo Baseline & Rehearsal Status

1. **Approved Scenarios**:
   - **Scenario 1**: *The Odisha Heritage Triangle* (Bhubaneswar $\rightarrow$ Puri $\rightarrow$ Konark, 3 days $\rightarrow$ AI-refined to 2 days).
   - **Scenario 2**: *Coastal Eco-Tourism & Wildlife* (Puri $\rightarrow$ Chilika $\rightarrow$ Konark, 2 days with AI safety clarification & explicit 3-day extension).
2. **Rehearsal Evidence**:
   - Automated rehearsal script [`scratch/phase8_demo_rehearsal.py`](file:///c:/Users/smara/Desktop/o-travelz/scratch/phase8_demo_rehearsal.py) and frontend test suite [`canonical_demo_flow.test.tsx`](file:///c:/Users/smara/Desktop/o-travelz/frontend/tests/canonical_demo_flow.test.tsx) pass with 100% reproducibility.
3. **Documentation Package**:
   - Demo Runbook: [`docs/DEMO_RUNBOOK.md`](file:///c:/Users/smara/Desktop/o-travelz/docs/DEMO_RUNBOOK.md)
   - Demonstration Evidence: [`docs/DEMO_EVIDENCE.md`](file:///c:/Users/smara/Desktop/o-travelz/docs/DEMO_EVIDENCE.md)
   - Known Limitations: [`docs/KNOWN_LIMITATIONS.md`](file:///c:/Users/smara/Desktop/o-travelz/docs/KNOWN_LIMITATIONS.md)

---

## Quality Gate Baseline

- **Backend Pytest**: **274 passed**, 1 warning (100% green, 0 failures).
- **Frontend Vitest**: **128 passed** across 16 test suites (100% green, 0 failures).
- **Frontend Production Build**: Clean Vite build (`dist/` generated with 0 errors).
- **Git Diff Check**: Clean (0 whitespace/conflict warnings).
- **Working Tree**: Uncommitted product implementation baseline.

---

## Live Cloud & Storage Architecture

- **Azure Storage Account**: `stotravelzprod` (`centralindia`, `Standard_LRS`, `StorageV2`).
- **Container Security**: `otravelz-images` (Private container, `AllowBlobPublicAccess = false`).
- **Authentication**: Entra ID / `DefaultAzureCredential` via Azure CLI identity.
- **Image Inventory**: 50/50 canonical Whole-Odisha destinations have verified, destination-specific photography ingested with full Creative Commons / Wikimedia Commons legal provenance and WebP multi-variant generation (`hero`, `card`, `thumbnail`).
- **Delivery**: Secure backend proxy (`GET /api/v1/images/{storage_key}`) with `Cache-Control: public, max-age=31536000, immutable`.
- **Fallback**: Verified multi-image sets and client-side fallbacks in `imageAdapter.ts` / `imageService.ts`.

---

## Real-Product Traveler Journey & Handoff Baseline

- **Destination Discovery**: Real-time filtering by region, category, and keyword across all 50 canonical Whole-Odisha places with real photography.
- **Verified Place Details**: Reusable modal presenting descriptions, durations, price tiers, coordinates, and official source links without debug or UUID identifiers.
- **Map & Itinerary Identity**: Canonical names (`feature.name`), categories, and regions bound from database records through projection contracts; zero `"Point #N"` or debug `{ID: ...}` labels.
- **Transport Authority & Hierarchy**: Walking strictly constrained to $\le 2000\text{ m}$; intercity and non-walkable journeys $> 2000\text{ m}$ routed via the backend road engine (`mode="road"`) with realistic duration and distance calculations. Multimodal transit (Mo Bus) preserved.
- **Traveler Handoff Flows**:
  - *Place Details $\rightarrow$ Plan Trip*: Pre-populates `start = place.name` and seeds canonical category into `interests` if empty, preserving existing traveler intent.
  - *Saved Places $\rightarrow$ Plan with Saved*: Aggregates distinct canonical categories into `interests` and binds starting location.
  - *Map Marker Popup $\rightarrow$ Plan Trip*: Direct React callback path from Leaflet pin popups into the planning workspace.

---

## Explicit Scope Freeze

- Zero AI in frontend components.
- Zero client-side route synthesis or coordinate mathematics.
- Zero unapproved product features (no hotel booking, flights, profiles, payments, social, or external booking).
- Strict contract enforcement via Pydantic `extra="forbid"`.
- Next state: **Release Presentation & Demonstration Ready**.
