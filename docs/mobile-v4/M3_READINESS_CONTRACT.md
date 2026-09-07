# O-TRAVELZ Mobile V4 — Wave M3 Readiness Contract

> **Authoritative Wave Boundary & Governance Contract**<br>
> Wave Target: **`M3 — Component Architecture & Interactive Prototype Specification`**<br>
> Architecture Strategy: **Dual-Native (Compose M3 + SwiftUI HIG) with KMP Deterministic Core**<br>
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Objective of Wave M3

Wave M3 exists to translate the frozen visual directions (`ANDROID_A_ATLAS_MATERIAL` and `IOS_A_EDITORIAL_ATLAS`) into **formal component architectures, state matrices, interaction specifications, and clickable prototype flows** before production project bootstrap begins in Wave M5.

---

## 2. In-Scope Permitted Activities (`M3_ALLOWED_SCOPE`)

Wave M3 is strictly authorized to perform the following specification and design tasks:

1. **Component Taxonomy & Cataloging**:
   - Establish a comprehensive, platform-specific component taxonomy for Android (Material 3) and iOS (Apple HIG).
   - Define exact component slots, container hierarchies, and prop interfaces.
2. **Component State Matrices**:
   - Document all valid operational states for every component: `Default`, `Pressed`, `Focused`, `Disabled`, `LoadingSkeleton`, `OfflineCached`, `ErrorRetryable`.
   - Specify visual representations for each state using frozen semantic tokens.
3. **Component Anatomy & Dimensioning**:
   - Specify internal paddings, icon scales, text slot alignments, and corner radius tokens.
   - Calibrate provisional layout constants (e.g. bottom sheet detents, card heights) on target screen ratios.
4. **Interaction & Gesture Semantics**:
   - Define touch gesture bindings, drag velocity thresholds, and swipe actions.
   - Map semantic haptic events (`HAPTIC_SELECTION`, `HAPTIC_CONFIRMATION`, `HAPTIC_WARNING`, `HAPTIC_TRIP_MILESTONE`) to specific component actions.
5. **Interactive Prototype Specifications**:
   - Design interactive transition choreographies across the 6 Golden Journeys (J1, J3, J5, J6, J8, J12).
   - Refine interactive Stitch prototypes where useful.
6. **Component Accessibility Contracts**:
   - Define required TalkBack and VoiceOver semantics properties (`contentDescription`, `accessibilityLabel`, `accessibilityHint`, `accessibilityValue`).
   - Define focus trap and focus restoration contracts for modal bottom sheets and full-screen covers.
   - Document Dynamic Type and Android font scaling ($2.0\times$) container reflow rules for every component.
7. **Component Test Assertions & Test Matrices**:
   - Write behavioral testing specifications that automated UI tests will execute in Wave M21.
8. **Figma Canvas Reconstruction (CONDITIONAL)**:
   - If and ONLY if authenticated MCP read/write access is verified, reconstruct foundational variables, token collections, and component sets in the Figma workspace per `docs/mobile-v4/FIGMA_RECONSTRUCTION_PLAN.md`.

---

## 3. Strict Non-Goals & Prohibitions (`M3_PROHIBITIONS`)

Wave M3 is a **specification and design wave**, NOT an implementation wave. Under no circumstances may Wave M3 perform any of the following:

- ❌ **NO Android Project Scaffolding**: Do NOT create `build.gradle.kts`, `settings.gradle.kts`, or Android app modules.
- ❌ **NO iOS Project Scaffolding**: Do NOT create Xcode project files (`.xcodeproj`, `project.pbxproj`), targets, or workspaces.
- ❌ **NO Production Compose Screens**: Do NOT write production `@Composable` UI code in `mobile/android/`.
- ❌ **NO Production SwiftUI Screens**: Do NOT write production SwiftUI `View` code in `mobile/ios/`.
- ❌ **NO Networking Implementation**: Do NOT configure Retrofit, OkHttp, Ktor, or URLSession clients.
- ❌ **NO Database Implementation**: Do NOT implement Room SQLite schemas or SwiftData models.
- ❌ **NO KMP Shared Core Changes**: Do NOT modify `mobile/shared/`.
- ❌ **NO Backend Changes**: Do NOT modify FastAPI services or Aiven PostgreSQL schemas.
- ❌ **NO Web V4 Changes**: Do NOT touch `web/` or shared web packages.
- ❌ **NO Canonical Data Mutations**: Do NOT alter transit schedules, stops, or place JSON files in `data/`.

---

## 4. Acceptance Criteria for Wave M3 Completion

Wave M3 will be accepted only when:
1. Complete Component Specifications exist for both Android (Compose) and iOS (SwiftUI).
2. All 8 core surfaces have documented component anatomy breakdowns.
3. Every component has an accessibility contract specifying TalkBack/VoiceOver labels and font scale reflow behavior.
4. Interactive prototype specifications cover all 6 Golden Journeys.
5. Zero production code, zero scaffolding, and zero data mutations have occurred.
