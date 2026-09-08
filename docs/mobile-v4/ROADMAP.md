# O-TRAVELZ Mobile V4 — Master Implementation Roadmap (Waves M0 – M30)

> **Authoritative 31-Wave Parallel Execution Roadmap**  
> Architecture: **Dual-Native (Jetpack Compose + SwiftUI) with KMP Deterministic Shared Core**  
> Branch: `feature/v4-platform-rebuild`  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Master Parallel Wave Structure Overview

Implementation executes across 31 strictly ordered waves where Android and iOS proceed in **parallel parity**, ensuring neither platform becomes a template or afterthought for the other.

| Wave | Scope & Focus | Operational State |
|---|---|---|
| **M0** | Repository forensics, skills audit, platform policies, KMP & Map SDK decisions | `[COMPLETED]` |
| **M0.5** | Figma MCP integration, Stitch capability audit, design workspace setup, architecture closure | `[COMPLETED]` |
| **M1** | Product anatomy, Information Architecture, and core user journeys | `[COMPLETED]` |
| **M2** | Parallel Android & iOS visual exploration using Stitch + Figma | `[COMPLETED]` |
| **M3** | Component Architecture & Interactive Prototype Specification | `[COMPLETED]` |
| **M4** | Parallel clickable prototypes and formal design acceptance freeze | `[COMPLETED]` |
| **M5** | Fresh production Android and iOS project bootstrap | `[COMPLETED]` |
| **M6** | API contracts, DTO generation, and native networking clients | `[COMPLETED]` |
| **M7** | App shells, root navigation, and adaptive chrome | `[COMPLETED]` |
| **M8** | Editorial Cultural Atlas: Discover + Place Detail Production Vertical Slice | `[COMPLETED]` |
| **M9** | Discover feed, spatial filtering, and full-text search | `[NEXT]` |
| **M10** | Place Detail editorial sheets, verified photography, and live weather cards | `[PLANNED]` |
| **M11** | Native mapping canvases (Google Maps Compose & Apple MapKit) | `[PLANNED]` |
| **M12** | 154-Route transit directory, stop details, and timetable evaluation | `[PLANNED]` |
| **M13** | Constraint-aware itinerary builder and grounded AI conversational assistant | `[PLANNED]` |
| **M14** | Trips persistence (Room SQLite & SwiftData) with offline sync | `[PLANNED]` |
| **M15** | Emergency essentials, civic contacts, and artisan clusters | `[PLANNED]` |
| **M16** | Authentication, secure session exchange, and user profiles | `[PLANNED]` |
| **M17** | Push notifications and local transit departure countdowns | `[PLANNED]` |
| **M18** | Complete offline flight check and bundle synchronizer | `[PLANNED]` |
| **M19** | Community photo contributions and CameraX / AVCapture validation | `[PLANNED]` |
| **M20** | Crowdsourced transit check-in and ride verification consensus | `[PLANNED]` |
| **M21** | Accessibility audit (VoiceOver, TalkBack, Dynamic Type, AA contrast) | `[PLANNED]` |
| **M22** | Dual-script localization (English & Odia) and font rendering | `[PLANNED]` |
| **M23** | Performance optimization, 60fps frame budgets, and APK/IPA trimming | `[PLANNED]` |
| **M24** | Security, privacy manifests (PrivacyInfo), and Play Data Safety | `[PLANNED]` |
| **M25** | Hardware device matrix validation (Vivo Y19, Pixel, Physical iPhone) | `[PLANNED]` |
| **M26** | Chaos drills, cold-boot telemetry, and network failure recovery | `[PLANNED]` |
| **M27** | Android Release Candidate generation and signing | `[PLANNED]` |
| **M28** | iOS Release Candidate generation and TestFlight packaging | `[PLANNED]` |
| **M29** | Multiplatform Golden Journey live end-to-end verification | `[PLANNED]` |
| **M30** | Final Mobile V4 platform acceptance and production handoff | `[PLANNED]` |

---

## 2. Detailed Wave Specifications

### Wave M0: Repository Forensics & Architecture Closure `[COMPLETED]`
- **Objective**: Establish exact repository truth, audit skills, eliminate previous planning contradictions, evaluate KMP and Map SDK alternatives.
- **Android Scope**: Audit toolchain, establish minSdk 26 provisional, compileSdk 35, reference hardware Vivo Y19 (Android 12 / API 31).
- **iOS Scope**: Correct iOS deployment target to iOS 17.0+ (reject premature iOS 18 baseline), establish progressive enhancement policy for Liquid Glass.
- **Skills Used**: `ponytail`, `graphify`, official Android skills, `swift-ios-skills`.
- **Dependencies**: Clean Git checkout on `feature/v4-platform-rebuild`.
- **Artifacts**: 17 audit reports in `reports/mobile_v4_m0_*.json`.
- **Tests**: Forensic Git inspections, command validations.
- **Acceptance Criteria**: 0 production screens created; 0 build files scaffolded; platform policies aligned with docs.
- **Non-Goals**: No production app code; no Xcode project; no Gradle module creation.

### Wave M0.5: Design Infrastructure & Workspace Setup `[COMPLETED]`
- **Objective**: Configure official Figma MCP integration, audit Stitch capabilities, establish design workspace hierarchy.
- **Android Scope**: Define Material 3 Expressive token mappings in design workspace.
- **iOS Scope**: Define Apple HIG token mappings in design workspace.
- **Skills Used**: `Figma MCP`, `Stitch MCP`, `design-system`, `brand`, `ui-ux-pro-max`.
- **Dependencies**: Wave M0 completion.
- **Artifacts**: `reports/mobile_v4_m0_figma_mcp_capability.json`, `reports/mobile_v4_m0_stitch_capability.json`, `docs/mobile-v4/*.md`.
- **Tests**: Figma remote streamable HTTP probe, Stitch schema verification.
- **Acceptance Criteria**: Figma MCP reachable, page structure established, zero production code created.
- **Non-Goals**: No final screens; no code scaffolding.

### Wave M1: Product Anatomy & Journey Specification `[COMPLETED]`
- **Objective**: Formally define information architecture, navigation anatomy, and end-to-end user journeys.
- **Android Scope**: Map 5-tab root to Adaptive Navigation (Bottom Bar on phones, Navigation Rail on tablets).
- **iOS Scope**: Map 5-tab root to NavigationStack (iPhone) and NavigationSplitView (iPad).
- **Skills Used**: `android-adaptive`, `swiftui-navigation`, `ui-ux-pro-max`.
- **Dependencies**: Wave M0.5 approval.
- **Artifacts**: `docs/mobile-v4/INFORMATION_ARCHITECTURE.md`, `docs/mobile-v4/JOURNEYS.md`.
- **Tests**: User journey flow reviews against PRD truth boundaries.
- **Acceptance Criteria**: All 204 places, 154 routes, and 7 core journeys mapped to screen states.
- **Non-Goals**: No code implementation; no UI layout code.

### Wave M2: Parallel Android/iOS Visual Exploration `[COMPLETED]`
- **Objective**: Generate 2–3 architectural visual alternatives per major screen using Stitch MCP and reconstruct approved concepts in Figma.
- **Android Scope**: Material 3 visual exploration (pill chips, rounded card corners, dark basalt surfaces).
- **iOS Scope**: Apple HIG visual exploration (hairline dividers, native materials, typography hierarchy).
- **Skills Used**: `Stitch MCP`, `Figma MCP`, `frontend-design`, `brand`.
- **Dependencies**: Wave M1 completion.
- **Artifacts**: Selected directions in `docs/mobile-v4/ANDROID_VISUAL_DIRECTION.md` and `docs/mobile-v4/IOS_VISUAL_DIRECTION.md`.
- **Tests**: Editorial critique against Modern Odisha Cultural Atlas standards; anti-vibe-code compliance check.
- **Acceptance Criteria**: Single winning Android and iOS visual directions selected and truth-tested across 8 core surfaces.
- **Non-Goals**: Zero Stitch code committed; no mobile project files modified.

### Wave M3: Component Architecture & Interactive Prototype Specification `[COMPLETED]`
- **Objective**: Design platform-native motion, gestures, and interaction physics; reconstruct canonical components and token variables; specify interactive golden journey prototypes.
- **Android Scope**: Predictive back gestures, shared element container transforms, M3 Expressive component architecture.
- **iOS Scope**: SwiftUI interactive spring curves, sheet dismissal drag physics, Apple HIG component architecture.
- **Skills Used**: `swiftui-animation`, `swiftui-gestures`, `android-adaptive`, `ui-ux-pro-max`, `design-system`, `ponytail`.
- **Dependencies**: Wave M2 completion.
- **Artifacts**: `docs/mobile-v4/FIGMA_FILE_ARCHITECTURE.md`, `docs/mobile-v4/SHARED_COMPONENT_SEMANTICS.md`, `docs/mobile-v4/ANDROID_COMPONENT_ARCHITECTURE.md`, `docs/mobile-v4/IOS_COMPONENT_ARCHITECTURE.md`, `docs/mobile-v4/COMPONENT_STATE_VARIANTS.md`, `docs/mobile-v4/INTERACTION_SPECIFICATION.md`, `docs/mobile-v4/ADAPTIVE_LAYOUT_CONTRACT.md`, `docs/mobile-v4/COMPONENT_ACCESSIBILITY_CONTRACTS.md`, `docs/mobile-v4/MICROCOPY_SYSTEM.md`, `docs/mobile-v4/DESIGN_TO_NATIVE_HANDOFF.md`, and comprehensive machine-readable acceptance reports.
- **Tests**: Reduce Motion accessibility verification, Ponytail component review, zero production code proof.
- **Acceptance Criteria**: Full motion and interaction specs documented with duration, easing curves, fallback states, and 12 golden-journey interactive prototype flows.
- **Non-Goals**: No native code implementation.

### Wave M4: Clickable Prototypes & Design Acceptance Freeze `[COMPLETED]`
- **Objective**: Build fully interactive clickable prototypes for Android and iOS in Figma and execute formal design freeze.
- **Android Scope**: Android interactive prototype demonstrating phone and foldable layouts.
- **iOS Scope**: iOS interactive prototype demonstrating iPhone and iPad layouts.
- **Skills Used**: `Figma MCP`, `ui-ux-pro-max`.
- **Dependencies**: Wave M3 completion.
- **Artifacts**: Signed design freeze report and frozen Figma token set.
- **Tests**: Interactive journey walkthroughs across all 7 core journeys.
- **Acceptance Criteria**: Formal sign-off on design tokens, typography, and component specifications.
- **Non-Goals**: No production app code.

### Wave M5: Fresh Android & iOS Project Bootstrap `[COMPLETED]`
- **Objective**: Initialize clean production project structures for Android and iOS.
- **Android Scope**: Bootstrap `mobile/android/` with Kotlin 2.0.21, AGP 8.6, Compose BOM, wiring `:shared` Gradle dep.
- **iOS Scope**: Initialize clean Xcode project `mobile/ios/OTravelz.xcodeproj` targeting iOS 17.0+, link `OTravelzCore.xcframework`.
- **Skills Used**: `android-testing-setup`, `android-edge-to-edge`, `swift-architecture`, `swift-testing`, `ponytail`.
- **Dependencies**: Wave M4 design freeze.
- **Artifacts**: Clean compilable empty shells on both platforms, baseline docs, and 20 validation reports.
- **Tests**: `./gradlew :android:testDebugUnitTest` and `:android:assembleDebug` succeed.
- **Acceptance Criteria**: Both empty shells configured with zero errors; Android debug APK generated; shared KMP integration verified.
- **Non-Goals**: No screen implementation; no mock data bundles.

### Wave M6: API Contracts, DTO Generation & Native Networking Clients `[COMPLETED]`
- **Objective**: Establish canonical API contract snapshot, drift enforcement, and minimal native Android and iOS networking clients against live public backend.
- **Android Scope**: Implement Retrofit 2.11 + OkHttp + Kotlinx Serialization DTOs and MockWebServer tests under `com.otravelz.android.data.network`.
- **iOS Scope**: Implement native URLSession + Swift 6 Codable DTOs and domain adapters under `mobile/ios/OTravelz/Networking/`.
- **Contract Enforcement**: Deterministic `mobile/contracts/openapi-mobile.json`, `scripts/check_mobile_api_contract.py`, and `backend/tests/test_mobile_api_contract.py`.
- **Tests**: 17 Android unit tests pass; 0 lint errors; live backend contract smoke verified against all 11 core endpoints.
- **Acceptance Criteria**: Dual-native typed networking clients compile; zero UI screen contamination; zero networking in `:shared`.

### Wave M7: App Shells, Root Navigation & Adaptive Chrome `[NEXT]`
- **M7 (App Shells)**: Root 5-tab navigation, adaptive navigation rail (Android), NavigationSplitView (iOS).
- **M8 (Home Screen)**: Editorial Cultural Atlas landing feed with living artisan features.
- **M9 (Discover & Search)**: District filtering across all 30 districts, spatial search.
- **M10 (Place Detail)**: Magazine-grade editorial sheets, WebP image loading, live weather card.
- **M11 (Mapping)**: Google Maps Compose on Android, Apple MapKit on iOS; custom pins.
- **M12 (Transit)**: 154-Route directory, CRUT Mo Bus timetables, locality chip boundaries.
- **M13 (AI Planner)**: Constraint-based itinerary generator, grounded AI conversational chat.
- **M14 (Trips & Persistence)**: Room SQLite (Android) and SwiftData (iOS) offline sync.
- **M15 (Essentials & Culture)**: Emergency civic contacts, artisan clusters, cultural essays.
- **M16 (Auth & Accounts)**: Sign in with Apple, Google Credential Manager, secure tokens.
- **M17 (Notifications)**: Local transit departure countdown notifications.
- **M18 (Offline Mode)**: Airplane mode flight check, cached WebP photos, deterministic KMP math.

### Waves M19–M26: Verification, Hardening & Compliance `[PLANNED]`
- **M19 (Contributions)**: CameraX / AVCapture community photo uploads.
- **M20 (Ride Verification)**: Multi-rider consensus check-in engine for candidate stop promotion.
- **M21 (Accessibility)**: VoiceOver / TalkBack audit, Dynamic Type scaling, AA contrast proof.
- **M22 (Localization)**: Dual-script English and Odia rendering with native fonts.
- **M23 (Performance)**: 60fps frame rate benchmarks, memory leak triage, APK/IPA size budgets.
- **M24 (Security & Privacy)**: PrivacyInfo.xcprivacy, Play Store Data Safety, zero plain-text tokens.
- **M25 (Device Matrix)**: Physical iPhone, Vivo Y19 (Android 12), and Pixel API 34/35 emulators.
- **M26 (Chaos Drills)**: Network failure recovery, cold boot handling, fail-closed assertions.

### Waves M27–M30: Release & Acceptance `[PLANNED]`
- **M27 (Android Release Candidate)**: Production AAB bundle signing, R8 optimization.
- **M28 (iOS Release Candidate)**: Xcode archive, TestFlight distribution packaging.
- **M29 (Mobile Golden Journey)**: Live end-to-end execution of all 7 core journeys on physical devices.
- **M30 (Final Platform Acceptance)**: Formal acceptance audit, handover documentation.
