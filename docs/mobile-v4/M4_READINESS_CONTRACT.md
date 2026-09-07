# O-TRAVELZ Mobile V4 — Wave M4 Readiness Contract

> **Authoritative Gate Contract Governing Transition from Wave M3/M3.1 to Wave M4**<br>
> Scope: **Readiness Verification for Clickable Prototypes & Design Acceptance Freeze**<br>
> Governance: **Zero Premature Native Scaffolding; Strict Dual-Native Parallelism**<br>
> Wave: `M3.1` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Readiness Verification Checklist

Wave M4 (*Clickable Prototypes & Design Acceptance Freeze*) is permitted to proceed ONLY when all the following gates evaluate to `PASS`:

| Gate ID | Condition & Invariant | Status | Evidence Location |
|---|---|---|---|
| **GATE_M4_01** | Selected Android Direction Frozen (`ANDROID_A_ATLAS_MATERIAL`). | `PASS` | `docs/mobile-v4/ANDROID_VISUAL_DIRECTION.md` |
| **GATE_M4_02** | Selected iOS Direction Frozen (`IOS_A_EDITORIAL_ATLAS`). | `PASS` | `docs/mobile-v4/IOS_VISUAL_DIRECTION.md` |
| **GATE_M4_03** | Transit Geometry Non-Fabrication Rule Enforced (Zero synthetic straight chords across unresolved gaps). | `PASS` | `reports/mobile_v4_m3_1_transit_geometry_truth_correction.json` |
| **GATE_M4_04** | Fare Presentation Policy Enforced (Strictly *"Fare information unavailable"*; zero "Pay on Bus" or raw nulls). | `PASS` | `reports/mobile_v4_m3_1_fare_truth_correction.json` |
| **GATE_M4_05** | Offline AI Truth Calibrated (Remote is `NETWORK_REQUIRED`; local fallback requires packaged solver verification). | `PASS` | `reports/mobile_v4_m3_1_ai_offline_truth_correction.json` |
| **GATE_M4_06** | Artifact Evidence Reconciled (All un-materialized specs honestly labeled `SPECIFIED`). | `PASS` | `reports/mobile_v4_m3_1_artifact_evidence_reconciliation.json` |
| **GATE_M4_07** | Figma Auth Truth & Alternative Documented (Interactive OAuth grant path or documented headless bridge). | `PASS` | `reports/mobile_v4_m3_1_figma_auth_reconciliation.json` |
| **GATE_M4_08** | Token Foundation Materially Available (71 variables locked in schema). | `PASS` | `reports/mobile_v4_m3_token_reconstruction.json` |
| **GATE_M4_09** | High-Leverage Components Materially Available (20 primitives staged). | `PASS` | `reports/mobile_v4_m3_1_figma_component_materialization.json` |
| **GATE_M4_10** | Production Mobile Code Invariant (Zero Kotlin/SwiftUI screens, zero Gradle/Xcode scaffolding). | `PASS` | Git HEAD clean verification |

---

## 2. Authorized Scope for Wave M4

Wave M4 is designated: **Clickable Prototypes & Design Acceptance Freeze**.

### What Wave M4 MAY Do:
1. Construct canonical Android screens in Figma based on `reports/mobile_v4_m3_core_screen_reconstruction.json`.
2. Construct canonical iOS screens in Figma based on `reports/mobile_v4_m3_core_screen_reconstruction.json`.
3. Wire interactive transitions, detent bottom sheets, and back navigation across the 6 golden journeys (`J1`, `J3`, `J5`, `J6`, `J8`, `J12`).
4. Test and validate degraded state frames (offline banner, candidate stop disclosures, location denied).
5. Conduct rigorous visual QA against the *Modern Odisha Cultural Atlas* design tokens.
6. Calibrate provisional layout metrics and motion spring curves.
7. Execute the formal multiplatform Design Acceptance Freeze.

### What Wave M4 MUST NOT Do:
1. **NO Android Scaffolding**: Do NOT create `build.gradle.kts`, Android manifests, or `MainActivity.kt`.
2. **NO Xcode Scaffolding**: Do NOT create `project.pbxproj`, Info.plist, or `OTravelzApp.swift`.
3. **NO Production UI Code**: Do NOT write `@Composable` functions or SwiftUI `View` structs.
4. **NO Persistence Implementation**: Do NOT configure Room SQLite or SwiftData schemas.
5. **NO Networking Implementation**: Do NOT write Retrofit/Ktor/URLSession API clients.
6. **NO Core/Backend Alterations**: Zero modifications to `mobile/shared/`, backend services, Web V4, or canonical data.

---

## 3. Exit Criteria for Wave M4

Wave M4 will be marked complete only when:
- 12 interactive prototype flows are fully clickable and pass truth-state inspections.
- Both Android M3 and iOS HIG design systems receive formal signed acceptance.
- The design system freeze report (`reports/mobile_v4_m4_design_freeze.json`) is committed.
- Zero production code has been added to the repository.
