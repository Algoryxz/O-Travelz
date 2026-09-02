# O-TRAVELZ V4 — Implementation Roadmap & Execution Backlog

> **Authoritative Phase-by-Phase Implementation Backlog**  
> Branch: `feature/v4-platform-rebuild` | Date: `2026-09-02`

---

## 1. Execution Philosophy & Quality Gates

The V4 implementation proceeds in **18 strictly ordered phases**. 

Mass-building of UI screens is disallowed until data contracts, domain models, and information architecture are locked. Each phase must leave the repository in a **fully runnable and testable state**.

---

## 2. The 18 Implementation Phases

### Phase 1: Master Audit & Classification `[x] COMPLETE`
- [x] **1.1** Audit old mobile code across `PORT_TO_KMP`, `PORT_TO_ANDROID_V4`, `PORT_TO_IOS_V4`, `REFERENCE_ONLY`, `DELETE_FROM_V4`.
- [x] **1.2** Author `docs/V4_MASTER_AUDIT.md`.

---

### Phase 2: Fresh Branch Initialization `[x] COMPLETE`
- [x] **2.1** Verify commit reference on `main` (`51ab34ed0342d575e55ff799189b3dd19e8aee84`).
- [x] **2.2** Create and push `feature/v4-platform-rebuild` to remote origin.

---

### Phase 3: Extract Reusable Domain Logic & Contracts `[/] IN PROGRESS`
- [x] **3.1** Author architectural specifications:
  - `docs/V4_PRODUCT_ARCHITECTURE.md`
  - `docs/V4_DATA_GRAPH.md`
  - `docs/V4_TRANSPORT_ARCHITECTURE.md`
  - `docs/V4_MOBUS_REALTIME_AUDIT.md`
  - `docs/V4_ARTISAN_DATA_MODEL.md`
  - `docs/V4_WEB_INFORMATION_ARCHITECTURE.md`
  - `docs/V4_MOBILE_INFORMATION_ARCHITECTURE.md`
  - `docs/V4_DESIGN_SYSTEM.md`
  - `docs/V4_SHARED_CORE_SCOPE.md`
  - `docs/V4_IOS_PARITY_MATRIX.md`
  - `docs/V4_APPLE_READINESS.md`
  - `docs/V4_BACKLOG.md`
- [ ] **3.2** Extract Haversine distance math, First-Mile thresholds, and timetable logic into pure Kotlin files for KMP core.

---

### Phase 4: Clean Legacy Mobile from V4 Worktree `[ ] NOT STARTED`
- [ ] **4.1** Clear legacy `mobile/android/` UI screens and screenshot artifacts on `feature/v4-platform-rebuild`.
- [ ] **4.2** Establish clean root layout: `mobile/shared/`, `mobile/android/`, `mobile/ios/`.

---

### Phase 5: KMP Shared Core Skeleton (`mobile/shared/`) `[ ] NOT STARTED`
- [ ] **5.1** Setup Gradle KMP build with JVM/Android and Apple XCFramework targets.
- [ ] **5.2** Implement `com.otravelz.shared.domain.*` (PlaceSummary, PlaceDetail, TransitStop, ItineraryPlan, WeatherContext).
- [ ] **5.3** Implement `HaversineDistance`, `GeoBoundingBox`, `FirstMileEngine`, `TimetableEngine`, `ItineraryRules`, `SearchFilterEngine`.
- [ ] **5.4** Implement `LocalizationKeys` and `GreetingEngine` (keys only).
- [ ] **5.5** Setup `commonTest` suite for deterministic math and engines.

---

### Phase 6: Fresh Android Shell (`mobile/android/`) `[ ] NOT STARTED`
- [ ] **6.1** Initialize clean Android app with Kotlin 2.0+ and Jetpack Compose (Material 3).
- [ ] **6.2** Link `:mobile:shared` dependency.
- [ ] **6.3** Implement 5-tab scaffold: `Home`, `Explore`, `Plan`, `Trips`, `You`.
- [ ] **6.4** Setup Room database (`SavedPlaceEntity`, `SavedTripEntity`) and `LocationManager`.

---

### Phase 7: Fresh iOS Shell (`mobile/ios/`) `[ ] NOT STARTED`
- [ ] **7.1** Initialize clean Xcode project with Swift 5.9+ / SwiftUI (iOS 17.0+).
- [ ] **7.2** Link `OTravelzCore.xcframework`.
- [ ] **7.3** Implement 5-tab shell (`TabView` with `NavigationStack`).
- [ ] **7.4** Implement SwiftUI design tokens (`ColorTokens`, `TypographyTokens`, `SpacingTokens`).
- [ ] **7.5** Setup `SwiftData` container (`SavedPlace`, `SavedTrip`).

---

### Phase 8: New Web Information Architecture (`frontend/`) `[ ] NOT STARTED`
- [ ] **8.1** Modernize Web IA to 8 primary sections: `Explore`, `Plan`, `Map`, `Transport`, `Culture`, `Artisans`, `Stories`, `Community`.
- [ ] **8.2** Apply *Modern Odisha Cultural Atlas* design direction with warm sandstone and slate dark modes.

---

### Phase 9: Design System Prototypes & Brand Integration `[ ] NOT STARTED`
- [ ] **9.1** Standardize canonical SVG logos and brand assets across Web, Android, and iOS.
- [ ] **9.2** Implement `TruthBadge` component across all three platforms (`VERIFIED`, `SCHEDULED`, `LIVE`, `ESTIMATED`, `FALLBACK`).

---

### Phase 10: Places & Artisans Data Layer `[ ] NOT STARTED`
- [ ] **10.1** Integrate 12 living craft traditions and verified artisan clusters (Raghurajpur, Pipili, Cuttack Tarakasi, Sambalpuri).
- [ ] **10.2** Expand backend models and database migrations for `CraftTradition`, `ArtisanCluster`, and `Artisan`.

---

### Phase 11: Real Maps Architecture `[ ] NOT STARTED`
- [ ] **11.1** Web: MapLibre GL JS full-screen map with vector tiles and multi-layer toggles.
- [ ] **11.2** Android: MapLibre Native / Compose Spatial discovery.
- [ ] **11.3** iOS: Apple MapKit (`SwiftUI.Map`) with custom temple and craft annotations.

---

### Phase 12: Multimodal Transport Graph `[ ] NOT STARTED`
- [ ] **12.1** Implement backend graph routing across Aviation, Rail, Intercity Bus, and Local Transit.
- [ ] **12.2** Expose unified `/api/v1/transport/multimodal-route` endpoint.

---

### Phase 13: Proper Mo Bus Experience `[ ] NOT STARTED`
- [ ] **13.1** Network map and stop sequence viewer for all 154 CRUT routes.
- [ ] **13.2** Next scheduled departure lookup based on IST clock blocks.
- [ ] **13.3** Pluggable `TransitRealtimeProvider` adapter in backend.

---

### Phase 14: Indian Railways Layer `[ ] NOT STARTED`
- [ ] **14.1** Model Odisha railway hubs (BBS, PURI, CTC, SBP, BAM, BLS).
- [ ] **14.2** Add scheduled tourist rail connections and station interchange links.

---

### Phase 15: Commercial Aviation Layer `[ ] NOT STARTED`
- [ ] **15.1** Model commercial airports (Bhubaneswar BBI, Jharsuguda JRG).
- [ ] **15.2** Add static flight connectivity corridors and airport transit connection guides.

---

### Phase 16: Grounded Itinerary Planner V4 `[ ] NOT STARTED`
- [ ] **16.1** Constraint-aware multi-day planner factoring in meal windows, opening hours, transit hops, and craft clusters.
- [ ] **16.2** Deterministic "Why this stop?" explainability generator.

---

### Phase 17: Community & Living Heritage Submissions `[ ] NOT STARTED`
- [ ] **17.1** Staged community submissions for cultural landmarks, artisan workshops, and photo evidence.
- [ ] **17.2** Zero-permission `PhotosPicker` on iOS and modern PhotoPicker on Android.

---

### Phase 18: Performance, QA & Demo Hardening `[ ] NOT STARTED`
- [ ] **18.1** End-to-end multiplatform test suites (Pytest, KMP CommonTest, Android JUnit/Compose tests, iOS XCTest).
- [ ] **18.2** Offline flight check: Airplane mode verification across Web, Android, and iOS.
- [ ] **18.3** App Store submission checklist audit.
