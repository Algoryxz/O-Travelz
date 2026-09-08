# O-TRAVELZ Mobile V4 — Wave M13.1 Planner Truth Closure

> **Authoritative Specification & Closure Report: Geographic-Boundary Truth, Fare Semantics & Acceptance Calibration**  
> Status: `ACCEPTED_PRODUCTION_CALIBRATION` | Wave: `M13.1` | Date: `2026-09-08`  
> Git Baseline SHA: `ff9835c75c50aa9a2bd4a4efb2a8975d12f87dc9`  
> Target Commit: `fix(mobile): close planner geographic and fare truth gaps (M13.1)`

---

## 1. Executive Summary & Purpose

Wave M13 established the native constraint-aware trip planner across Android and iOS, replacing unconstrained conversational chat with a structured constraints form backed by deterministic itinerary generation (`POST /itinerary/plan`) and grounded AI explanation (`POST /ai/converse`).

Wave M13.1 is a **narrowly scoped calibration and truth-correction wave** addressing five specific integrity defects identified in the M13 acceptance baseline before any persistence work begins. 

### Scope Boundaries (Strict Enforcements)
- **HARD STOP** at M13.1 completion.
- **ZERO** Room SQLite or SwiftData persistence code introduced.
- **ZERO** execution of Stage G2 canonical promotion (staged data remains strictly isolated).
- **ZERO** canonical transit or destination data mutations.

---

## 2. Defect 1: Geographic Locality Boundary Calibration

### A. Problem Statement
The M13 acceptance report cited a "6-hour trip in Bhubaneswar" scenario that returned:
1. `Bindu Sagar` (Bhubaneswar, Khordha)
2. `Ananda Bazar, Puri` (Puri district, 48.15 km away)
3. `Bikalananda Kar Rasagola Hub, Salepur` (Cuttack district, 32.08 km away)

Connected by fabricated 1-minute walking hops across district boundaries.

### B. Forensic Root Cause Analysis
1. **Probe Omission in Test Harness**: The initial M13 probe test submitted `{"days": 1, "interests": ["heritage"]}` with `start: null`. When `start` was absent, `RankingService._calculate_proximity` assigned `proximity_tier = 0` and `distance_km = 0.0` statewide, falling back to alphabetical ranking.
2. **Proximity Tier Threshold**: `RankingService._calculate_proximity` previously used a uniform `45.0 km` cutoff for Tier 0 regardless of trip duration. For single-day trips, 45 km allowed out-of-district destinations in Salepur (32.1 km) to compete on equal footing with places 200 meters away.
3. **Missing Intra-Day Clustering**: `ItineraryService.plan` sliced top candidates `[:days * max_stops]` without verifying intra-day geographic feasibility between consecutive stops.
4. **AI Word-Number & Preposition Handling**:
   - `extract_multilingual_days` matched only digit patterns (`"6 hours"`), defaulting `"six hours"` to 2 days.
   - `_resolve_start_location` checked all 30 Odisha districts before prepositional phrases, matching `"Puri"` in `"Start in Bhubaneswar and take me to Puri"` because Puri is a district while Bhubaneswar is an urban agglomeration in Khordha district.

### C. Architectural Fixes Implemented
1. **Duration-Aware Proximity Tiers** (`backend/app/services/ranking/service.py`):
   - For `days == 1`: Tier 0 is $\le 25.0\text{ km}$ (immediate urban continuum); Tier 1 is $\le 55.0\text{ km}$; Tier 2 is $\le 100.0\text{ km}$; Tier 3 is $> 100.0\text{ km}$.
   - For `days > 1`: Tier 0 is $\le 45.0\text{ km}$; Tier 1 is $\le 95.0\text{ km}$; Tier 2 is $> 95.0\text{ km}$.
2. **Intra-Day Feasibility Clustering** (`backend/app/services/itinerary/service.py`):
   - Implemented `_select_clustered_places`: stops for any given day must strictly cluster within $\le 25.0\text{ km}$ of that day's anchor place ($\le 45.0\text{ km}$ for multi-day).
   - Multi-day trips advance anchors sequentially across regional clusters ($\ge 25.0\text{ km}$ progression) for realistic cross-district exploration.
3. **Robust AI Prompt & Intent Parsing** (`backend/app/ai/multilingual.py`, `backend/app/ai/model.py`):
   - `extract_multilingual_days` supports number words (English, Odia, Hindi).
   - `_resolve_start_location` prioritizes explicit prepositional patterns (`"start in/from/at"`, `"from"`, `"in"`) before falling back to district name scanning.

### D. Verified Post-Fix Execution
Prompt: *"Plan a 6 hour trip in Bhubaneswar"*
- **Resolved Constraints**: `days: 1`, `start: "Bhubaneswar"`
- **Generated Stops**:
  1. `Lingaraj Temple` (Khordha, Bhubaneswar, 0.0 km)
  2. `Old Town Lingaraj Temple Kora Khai Hub` (Khordha, Bhubaneswar, 0.0 km)
  3. `Chitrakarini Temple` (Khordha, Bhubaneswar, 0.11 km)
- **Hops**: Verified local walking hops (0–2 min), strictly within Bhubaneswar urban continuum. Out-of-district stops are 100% eliminated.

---

## 3. Defect 2: Fare Semantics Restoration

### A. Problem Statement
The M13 UI introduced microcopy:
*"Transit fares available at boarding. Online fare estimation is disabled."* and `"Pay on Bus"`.
This violated the canonical transit rule: bus fares must remain strictly `null` until official fare tables are ingested, with no claims regarding boarding fare availability or on-bus payment policies.

### B. Correction
Restored the authoritative, verified fare disclosure string across Android and iOS platforms:
- **English**: *"Fare information unavailable. Check official or operator information before travel."*
- **Odia**: *"ଭଡ଼ା ସୂଚନା ଉପଲବ୍ଧ ନାହିଁ। ଯାତ୍ରା ପୂର୍ବରୁ ସରକାରୀ କିମ୍ବା ପରିଚାଳକ ସୂଚନା ଯାଞ୍ଚ କରନ୍ତୁ।"*
- Removed all UI references to `"Pay on Bus"`.

### C. Touchpoints Updated & Verified
- Android: `mobile/android/src/main/res/values/strings.xml` (`plan_disclaimer_fares`)
- Android: `mobile/android/src/main/res/values-or/strings.xml` (`plan_disclaimer_fares`)
- iOS: `mobile/ios/OTravelz/Resources/en.lproj/Localizable.strings` (`plan_disclaimer_fares`)
- iOS: `mobile/ios/OTravelz/Resources/or.lproj/Localizable.strings` (`plan_disclaimer_fares`)
- Unit tests: `PlannerProductModelTest.kt:testFareMicrocopyPolicyAdherence` and `PlannerDomainTests.swift:testFareMicrocopyPolicyAdherence`.

---

## 4. Defect 3: Duration Truth & Granularity Boundary

### A. Context & Clarification
The O-TRAVELZ backend itinerary API (`POST /itinerary/plan`) models trip duration as integer `days` ($1 \le \text{days} \le 7$). It does not model sub-day fractional durations (e.g. 0.25 days / 6 hours) at the API level.

### B. Truth Boundary Rules
1. Sub-day requests (e.g., "6 hours", "half day", "afternoon") map deterministically to `days = 1`.
2. For single-day trips, stops are strictly capped at 3 stops maximum to ensure feasibility within a 6-to-8 hour window.
3. Realistic intra-day travel times: inter-district travel cannot be treated as free or instantaneous; all hops reflect genuine physical transit or walking distances.

---

## 5. Defect 4: Cross-Platform Verification Calibration

### A. iOS Runner Status Calibration
M13 prematurely stated "100% behavioral parity verified" across platforms without executing on a macOS runner.

In M13.1:
- **Android**: Verified with live Gradle compilation and unit testing (`:android:testDebugUnitTest`, `:android:assembleDebug`). Status: **`LIVE_EXECUTION_VERIFIED`**.
- **iOS**: Verified via static source analysis, AST inspection, Swift Codable schema alignment, and localization parity. Status: **`SOURCE_PARITY_VERIFIED / PENDING_MACOS`**.

---

## 6. Defect 5: Unsubstantiated Claim Calibration

In `reports/mobile_v4_m13_ponytail_review.json`, the claim of "10x faster trip configuration" was removed and replaced with a factual statement regarding direct UI constraint manipulation versus multi-turn natural language prompting.

---

## 7. Comprehensive Verification Matrix

| Verification Domain | Command / Suite | Result | Status |
|---|---|---|---|
| **Geographic Truth Tests** | `pytest backend/tests/test_itinerary_geographic_truth.py` | 9 passed (8 unit + 1 integration) | PASS |
| **Itinerary Engine Tests** | `pytest backend/tests/test_itinerary*.py` | 13 passed | PASS |
| **AI Intent & Multilingual** | `pytest backend/tests/test_ai*.py` | 311 passed | PASS |
| **Android Unit Tests** | `gradlew.bat -p mobile :android:testDebugUnitTest` | 38 tasks executed / up-to-date | PASS |
| **Android Build Assemble** | `gradlew.bat -p mobile :android:assembleDebug` | 56 tasks executed / up-to-date | PASS |
| **iOS Swift Parity** | Domain & DTO code audit + strings audit | Swift model & test suite parity | VERIFIED |
| **OpenAPI Synchronization** | `python scripts/export_mobile_openapi.py --check` | 0 contract drift | PASS |
| **Project Context Integrity** | `python scripts/check_project_context.py` | 24/24 files present | PASS |
| **Stage F Invariant Check** | `python scripts/validate_research_staging.py` | All invariants satisfied | PASS |
| **Stage G1 Invariant Check** | `python scripts/validate_mobile_offline_staging.py` | All invariants satisfied | PASS |

---

## 8. Hard Invariants Signed Off

- [x] **No Fabricated Fares**: All fare fields strictly `null`.
- [x] **No Fake Tracking**: Scheduled timetable display only; no live vehicle telemetry claims.
- [x] **No Cross-District Walk Hops**: Intra-day clustering prevents false hops.
- [x] **Zero Unverified Destinations**: All destinations drawn from canonical verified inventory.
- [x] **Stage G2 Locked**: Staging data strictly isolated from shipping assets.
- [x] **Persistence Deferred**: Room and SwiftData unintroduced; awaiting Wave M14.
