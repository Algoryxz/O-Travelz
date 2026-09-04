# O-TRAVELZ V4 — Master Implementation Roadmap

> **Authoritative Execution Roadmap**  
> Active Branch: `feature/v4-platform-rebuild`  
> Current Platform Order: **1. Docs Sync $\rightarrow$ 2. Web V4 $\rightarrow$ 3. iOS V4 $\rightarrow$ 4. Android V4 $\rightarrow$ 5. QA**  
> Document Version: `4.0.0` | Last Updated: `2026-09-04`

---

## 1. Master Checkpoint Overview

| Checkpoint | Scope | Target Deliverables | Operational State |
|---|---|---|---|
| **Checkpoint 1** | **Documentation & Architecture Synchronization** | Consolidate `docs/v4/` suite, archive obsolete files, update root context. | `[CURRENT / IN PROGRESS]` |
| **Checkpoint 2** | **Website V4 Redesign & Capability Integration** | Modern Odisha Cultural Atlas web application, MapLibre GL JS, editorial detail. | `[PLANNED]` |
| **Checkpoint 3** | **iOS V4 Native Implementation** | SwiftUI app, Apple MapKit, SwiftData, hardware validation on physical iPhone. | `[PLANNED]` |
| **Checkpoint 4** | **Android V4 Native Implementation** | Jetpack Compose app, Google Maps SDK Compose, Room DB, emulator matrix. | `[PLANNED]` |
| **Checkpoint 5** | **Cross-Platform QA & Performance Audits** | Domain parity verification, offline flight check, Lighthouse / Frame-rate audits. | `[PLANNED]` |

---

## 2. Detailed Execution Breakdown

### Checkpoint 1: Documentation & Architecture Synchronization `[CURRENT]`
- [x] **1.1** Forensic git sync and repository status check (`dd4cc26`).
- [x] **1.2** Author `docs/v4/PRODUCT.md` with PRD, anti-vibe-code rules, and multidimensional truth model.
- [x] **1.3** Author `docs/v4/ARCHITECTURE.md` with cross-platform topology and Aiven DB runtime.
- [x] **1.4** Author `docs/v4/DATA_AND_CONTRACTS.md` with verified bootstrap inventory (204 places, 154 routes).
- [x] **1.5** Author `docs/v4/DESIGN.md` with Modern Odisha Cultural Atlas visual tokens.
- [x] **1.6** Author `docs/v4/MAPS_AND_TRANSPORT.md` with provider decisions and September 2026 pricing.
- [x] **1.7** Author `docs/v4/MEDIA_LANGUAGE_VOICE.md` with WebP and video pipeline design.
- [x] **1.8** Author `docs/v4/SKILLS_AND_TOOLING.md` with 5-tier skills governance.
- [x] **1.9** Author `docs/v4/RELEASE_AND_QA.md` with physical iPhone validation protocol.
- [x] **1.10** Author `docs/v4/adr/ADR-001_MAP_STACK_DECISION.md`.
- [x] **1.11** Archive legacy documents (`MOBILE.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, loose `V4_*.md`).
- [x] **1.12** Update root context files (`PROJECT_CONTEXT.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README.md`).

---

### Checkpoint 2: Website V4 Redesign & Capability Integration `[PLANNED]`
Execution proceeds in twelve strictly ordered steps:
1. **Technical Baseline**: Validate React 18, Vite, TypeScript strict compilation, and prune obsolete dependencies.
2. **Design Semantics**: Implement design tokens (Sandstone, Terracotta, Chilika Blue, Slate) and typography scales.
3. **Global Navigation & Shell**: 8-section responsive navigation (Explore, Map, Plan, Transport, Culture, Artisans, Stories, Community).
4. **Explore / Atlas**: Spatial grid and card feed with progressive filtering across all 30 districts.
5. **Interactive Map**: MapLibre GL JS integration; select and audit vector tile provider; hook to `/api/map/projection`.
6. **Place Detail**: Magazine-grade editorial place page with verified WebP photography, cultural context, and truth badges.
7. **Home Experience**: Editorial cultural atlas landing page (no giant vague hero, no fake counters).
8. **Constraint Planner**: Itinerary builder respecting opening hours, transit hops, and meal windows.
9. **Culture & Living Heritage**: Dedicated artisan cluster pages (Raghurajpur, Pipili, Cuttack Tarakasi).
10. **Legal & Trust Foundation**: Accessible Privacy Policy, Terms & Conditions, and About ("Built by Algoryxz").
11. **Technical-Debt Cleanup**: Remove static JSON bundle duplications; route all entity queries through backend API.
12. **Performance & Accessibility**: Run Lighthouse audits (target performance $\ge 90$); verify WCAG AA contrast.

---

### Checkpoint 3: iOS V4 Native Implementation `[PLANNED]`
1. **Xcode Project Setup**: Initialize clean SwiftUI application targeting iOS 17.0+ (`mobile/ios/`).
2. **Shared Core Linking**: Generate and link `OTravelzCore.xcframework` from `mobile/shared/`.
3. **Design System & Assets**: Configure asset catalog with Sandstone/Slate color sets and SF Symbols.
4. **Explore & Place Detail**: Native high-density list and detail sheet with live Open-Meteo weather card.
5. **Apple MapKit Canvas**: Full-screen `SwiftUI.Map` with custom temple, craft, and transit annotations.
6. **Navigation Handoff**: One-tap trigger launching Google Maps or Apple Maps via universal URLs.
7. **Local Persistence**: SwiftData models (`SavedPlace`, `SavedTrip`) with offline synchronization.
8. **Physical Hardware Verification**: Validate on real iPhone (GPS transitions, VoiceOver, 60fps rendering).

---

### Checkpoint 4: Android V4 Native Implementation `[PLANNED]`
1. **Module Scaffolding**: Setup `mobile/android/` with Kotlin 2.0+, Jetpack Compose, and Material 3.
2. **Shared Core Linking**: Link `:mobile:shared` via Gradle.
3. **Explore & Place Detail**: Material 3 screens adapting the shared product journeys natively.
4. **Google Maps SDK Compose**: Integrate `com.google.maps.android:maps-compose` with custom marker styling.
5. **Local Persistence**: Room SQLite database with KSP compiler.
6. **Navigation Intent**: Launch external Google Maps navigation via standard Android Intent.
7. **Emulator Matrix Verification**: Automated tests on Pixel virtual devices (API 34/35).
8. **Physical Hardware Benchmark**: Performance profiling upon hardware availability.

---

### Checkpoint 5: Cross-Platform QA & Performance Audits `[PLANNED]`
1. **Deterministic Parity Audit**: Verify identical business outputs across Web, iOS, and Android for standard travel fixtures.
2. **Offline Flight Check**: Confirm full offline navigability of all 204 places in Airplane Mode.
3. **Security & Quota Check**: Assert all API keys have strict bundle/SHA/domain restrictions and zero unmetered endpoints.
