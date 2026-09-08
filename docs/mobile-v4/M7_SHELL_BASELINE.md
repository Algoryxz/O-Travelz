# O-TRAVELZ Mobile V4 — M7 Shell Baseline & Architectural Acceptance

> Dual-Native Shell Baseline established in Wave M7.
> Scope: **Android (Jetpack Compose) & iOS (SwiftUI)**
> Head SHA Baseline: eature/v4-platform-rebuild

---

## 1. Summary of Capabilities Established

Wave M7 has transitioned the raw bootstrap applications from M5/M6 into full, adaptive native application shells:

1. **Frozen 5-Root Navigation Model**:
   - Discover: Cultural trails & spotlight destinations.
   - Map: Geographic atlas with transit boundaries.
   - Plan: Deterministic itinerary solver.
   - Trips: Active journeys & saved offline packs.
   - You: Profile, offline storage & transparency.
2. **Adaptive Chrome Execution**:
   - **Compact Width (< 600dp / iOS Compact)**: Bottom navigation bar (NavigationBar / TabView), full edge-to-edge rendering, and M3 TopAppBar / large navigation title.
   - **Medium & Expanded Width (>= 600dp / iOS Regular)**: Start-anchored vertical rail (NavigationRail / NavigationSplitView sidebar) with fluid content pane and centered reading envelopes (maxWidth 600dp).
3. **Deterministic State & Back Press Navigation**:
   - Tab reselection is strictly idempotent.
   - Android back-press contract intercepts navigation on secondary roots (MAP, PLAN, TRIPS, YOU) and redirects back to DISCOVER root prior to exiting the application.
   - State restoration across configuration changes verified via ememberSaveable.
4. **Localization Parity**:
   - Full string parity across English (en) and Odia (or) for all root titles, subtitles, and descriptions.
5. **Zero Launch Networking Contract**:
   - Confirmed 0 network calls initiated during application initialization or shell rendering.
6. **Strict Anti-Vibe-Code & Boundary Adherence**:
   - Zero mock data, zero fake places, zero fabricated GPS tracking.
   - No modifications to backend, web, shared core fixtures, or canonical transit datasets.

---

## 2. Platform Verification Matrix

| Platform | Navigation Engine | Adaptive Chrome | Unit Tests | Build / Lint | Runtime Execution |
|---|---|---|---|---|---|
| **Android** | Jetpack Compose + ememberSaveable | NavigationBar / NavigationRail | PASS (19 tests) | assembleDebug PASS, lintDebug PASS (0 errors) | ACTIVE |
| **iOS** | SwiftUI TabView + NavigationSplitView | TabView / NavigationSplitView | PASS (Static) | PASS (PBXproj consistency) | PENDING_MACOS |
