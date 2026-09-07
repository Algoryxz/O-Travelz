# O-TRAVELZ Mobile V4 — Design Evidence Levels & Verification Taxonomy

> **Authoritative Evidence Calibration Framework**<br>
> Scope: **Distinguishing Conceptual Design Claims from Runtime & Physical Hardware Verification**<br>
> Wave: `M2.1` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. The Seven Authoritative Evidence Levels

To prevent premature claims or ambiguity between design intent, conceptual review, and actual compiled binary behavior, all mobile documentation, architectural reports, and acceptance criteria must classify assertions into one of these seven explicit evidence tiers:

| Tier | Identifier | Rigorous Definition & Verification Boundary |
|---|---|---|
| **Tier 1** | **`SPECIFIED`** | A product, design, or architectural requirement formally documented in repository specifications (e.g. PRD, information architecture, truth contracts). Represents design intent and non-negotiable standards. |
| **Tier 2** | **`CONCEPT_REVIEWED`** | A visual layout, component composition, or user flow reviewed in conceptual exploration tooling (Stitch, Figma, or static design mockups). Proves conceptual shape and information density, but NOT runtime execution. |
| **Tier 3** | **`CONCEPTUALLY_FEASIBLE`** | An interaction, motion curve, or layout reflow pattern assessed as structurally feasible based on official platform guidelines (Apple HIG, Material 3, Android Compose specs, SwiftUI docs), but not yet executed in code. |
| **Tier 4** | **`IMPLEMENTED`** | Written and committed in native platform source code (Kotlin/Compose, Swift/SwiftUI, or KMP shared core). Exists in the repository tree and compiles. |
| **Tier 5** | **`AUTOMATED_RUNTIME_VERIFIED`** | Executed and validated through automated tests (unit tests, Compose UI tests, XCTest/Swift Testing, screenshot diffing, Robolectric, or headless emulator runs). Verified by test assertion logs. |
| **Tier 6** | **`PHYSICAL_DEVICE_VERIFIED`** | Executed, profiled, and validated on physical target hardware (e.g. Vivo Y19 / MediaTek Helio P65 for Android; physical iPhone 11/15/16 for iOS). Measured for real frame times, thermal throttling, memory footprint, and tactile feedback. |
| **Tier 7** | **`PROVIDER_VERIFIED`** | Confirmed directly against live, authoritative external SDK behavior, external API contracts, or official provider documentation (e.g. Google Maps SDK terms, Apple MapKit capabilities, CRUT timetable datasets). |

---

## 2. Evidence Boundary Rules for Mobile V4

1. **Pre-Implementation Waves (M0 through M4)**:
   - Claims must NEVER exceed `SPECIFIED`, `CONCEPT_REVIEWED`, `CONCEPTUALLY_FEASIBLE`, or `PROVIDER_VERIFIED`.
   - Any claim of `IMPLEMENTED`, `AUTOMATED_RUNTIME_VERIFIED`, or `PHYSICAL_DEVICE_VERIFIED` prior to Wave M5 (Project Bootstrap) is structurally invalid.
2. **Accessibility Statements**:
   - Static layout contrast ratios and touch bounding boxes derived from design specifications are `SPECIFIED` or `CONCEPT_REVIEWED`.
   - Real TalkBack/VoiceOver traversal, dynamic font reflow under system font scaling ($2.0\times$ / AX5), and keyboard focus restoration remain `CONCEPTUALLY_FEASIBLE` until validated in native runtimes (`AUTOMATED_RUNTIME_VERIFIED` in M21).
3. **Performance Statements**:
   - Absence of blurs, complex shaders, or heavy layers represents `CONCEPTUALLY_FEASIBLE` design architecture.
   - Assertions of "60fps", "120fps ProMotion", or "zero frame drops" remain strictly `DEFER_TO_PHYSICAL_DEVICE` until profiled via Macrobenchmark / Instruments in Waves M23 and M25.
4. **Motion & Layout Values**:
   - Millisecond durations, spring damping fractions, and bottom sheet heights in conceptual design documents are `PROVISIONAL_M3_TUNING_VALUE` or `DESIGN_STARTING_POINT`, not frozen runtime absolutes.
