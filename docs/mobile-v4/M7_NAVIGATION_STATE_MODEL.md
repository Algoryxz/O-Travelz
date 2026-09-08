# O-TRAVELZ Mobile V4 - M7 Navigation State Model & Chrome Architecture

> Authoritative specification for root navigation state, adaptive chrome, and container lifecycle across Android & iOS.
> Wave: M7 | Architecture: Dual-Native (Jetpack Compose & SwiftUI) | Status: APPROVED

---

## 1. The Frozen 5-Root Navigation Model

The root navigation structure consists of exactly 5 roots across both Android and iOS:

1. **Discover** (discover): Cultural exploration, spotlight trails, verified places. Root home destination.
2. **Map** (map): Interactive geographic atlas, surveyed transit layers, spatial filtering.
3. **Plan** (plan): Deterministic itinerary planning, multi-day scheduling, route optimization.
4. **Trips** (	rips): Active journey tracking, saved itineraries, offline packs.
5. **You** (you): Profile, settings, storage management, civic feedback, truth transparency.

### Route Identifiers & Metadata

| Root Name | Android Enum | iOS Case | Android Title Res | iOS String Key | Android M3 Icon | iOS SF Symbol |
|---|---|---|---|---|---|---|
| Discover | NavDestination.DISCOVER | .discover | R.string.nav_discover | nav_discover | Explore / Sparkles | sparkles |
| Map | NavDestination.MAP | .map | R.string.nav_map | nav_map | Map | map |
| Plan | NavDestination.PLAN | .plan | R.string.nav_plan | nav_plan | Calendar / Schedule | calendar.badge.clock |
| Trips | NavDestination.TRIPS | .trips | R.string.nav_trips | nav_trips | Luggage / Suitcase | suitcase |
| You | NavDestination.YOU | .you | R.string.nav_you | nav_you | Person | person |

---

## 2. Adaptive Chrome Architecture

### Breakpoints & Layout Mapping

Following docs/mobile-v4/ADAPTIVE_LAYOUT_CONTRACT.md:

- **Compact Width (< 600dp / iOS Compact)**:
  - Navigation Component: Bottom NavigationBar (Android) / Bottom TabView (iOS).
  - Top Bar: Standard M3 TopAppBar (Android) / Large Navigation Title (iOS).
  - Touch Targets: Min 48x48dp (Android) / 44x44pt (iOS).
- **Medium Width (600dp - 839dp / iOS Regular)**:
  - Navigation Component: Leading NavigationRail (Android) / Leading Rail or Sidebar (iOS).
  - Top Bar: Compact / Medium Top Bar within content canvas.
- **Expanded Width (>= 840dp / iOS Regular Large)**:
  - Navigation Component: Leading NavigationRail (Android) / Sidebar (iOS).
  - Content Layout: Wide content pane with balanced horizontal margins.

---

## 3. Reselection & Back-Navigation Semantics

### Tab Reselection Policy
- Tapping the active tab again is **idempotent**.
- In root states, reselection scrolls content to top (or performs a no-op in placeholder state).
- Reselection **does not** recreate the view hierarchy or reload network state.

### Back Navigation Semantics (Android)
- When on any non-home tab (MAP, PLAN, TRIPS, YOU), pressing the system Back button switches the active tab back to DISCOVER.
- When on DISCOVER, pressing Back delegates to the system to exit the application.
- This prevents unexpected app exits from secondary tabs and aligns with Android core navigation guidelines.

### Root Restoration
- Active tab state is preserved across configuration changes (rotation, theme change, folding/unfolding) via 
ememberSaveable on Android and @SceneStorage / @State on iOS.
