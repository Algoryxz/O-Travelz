# O-TRAVELZ Mobile V4 — M7 Chrome Model & Adaptive Window Contract

> Authoritative specification for application chrome, safe area insets, navigation bars, and top bars across form factors.
> Wave: M7 | Scope: Dual-Native (Jetpack Compose & SwiftUI) | Status: APPROVED

---

## 1. Window Size Classes & Chrome Adaptation

In accordance with docs/mobile-v4/ADAPTIVE_LAYOUT_CONTRACT.md:

### Compact Width (< 600dp / iOS Compact Width)
- **Target Form Factors**: Portrait smartphones, split-screen phone apps.
- **Bottom Navigation**:
  - Android: ndroidx.compose.material3.NavigationBar docked to the bottom.
  - iOS: SwiftUI.TabView with .tabItem configured.
- **Top App Bar**:
  - Android: ndroidx.compose.material3.TopAppBar pinned to top, transparent/surfaceContainer background.
  - iOS: Large navigation title (.navigationBarTitleDisplayMode(.large)).
- **Safe Area Insets**: Edge-to-edge transparent navigation bar and status bar; content padded by system insets via Scaffold(innerPadding) on Android and safeAreaPadding on iOS.

### Medium & Expanded Width (>= 600dp / iOS Regular Width)
- **Target Form Factors**: Unfolded foldables, landscape phones, Android tablets (7 - 12), iPads (Split View & Full Screen), Chromebooks.
- **Leading Navigation Rail / Sidebar**:
  - Android: ndroidx.compose.material3.NavigationRail anchored to the start edge (illMaxHeight()). Content pane receives the remaining width (weight(1f)).
  - iOS: SwiftUI.NavigationSplitView presenting root items in a sidebar list (.listStyle(.sidebar)), hosting the active destination in detail.
- **Top App Bar**:
  - Maintained within each root content container, ensuring title hierarchy is preserved on wide displays.
- **Content Max Width Constraint**:
  - Content containers wrap content within a max-width envelope (600dp reading/form container) centered in the pane to prevent over-stretched UI.

---

## 2. Insets, IME & Edge-to-Edge Acceptance

- Both platforms maintain pure edge-to-edge layout execution.
- MainActivity.kt executes enableEdgeToEdge() on launch.
- Status bar and navigation bar colors are derived from the surface palette (Deep Basalt for dark mode, Sunlit Sandstone for light mode).
- Scaffolds automatically route window insets so neither top bars nor bottom rails are clipped by cutouts or system bars.
