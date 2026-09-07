# O-TRAVELZ Mobile V4 — Cross-Platform Presentation Matrix

> **Authoritative UI Behavioral & Platform Mapping Specification**  
> Principle: **Behavioral Parity without Forced Visual Symmetry**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Architectural Presentation Mappings

| Feature / Surface | Android Native Implementation | iOS Native Implementation | Parity / Divergence Rationale |
|---|---|---|---|
| **Root Navigation** | `NavigationBar` (Compact) / `NavigationRail` (Medium/Expanded) via `androidx.compose.material3.adaptive` | `TabView` with bottom bar on iPhone; `NavigationSplitView` with sidebar on iPad | Native platform ergonomic conventions. Adaptive rail for foldables/tablets on Android; split view on iPad. |
| **Navigation Transitions** | Predictive Back (`PredictiveBackHandler`) + Material Shared Axis X/Y transitions | Native `NavigationStack` push/pop with interactive swipe-from-edge gesture | Preserves expected platform gesture physics. |
| **Search Experience** | `DockedSearchBar` / `SearchBar` with animated expanded full-screen state | `.searchable(placement: .navigationBarDrawer)` with native scope buttons | Matches first-party Android and iOS search paradigms. |
| **Place Detail Sheet** | `ModalBottomSheet` with `rememberModalBottomSheetState(skipPartiallyExpanded = false)` | `.sheet` with `.presentationDetents([.fraction(0.4), .large])` and `.presentationDragIndicator(.visible)` | Android sheet uses Material handle; iOS sheet uses standard SwiftUI grabber with spring physics. |
| **Filter Drawer** | FlowLayout of `FilterChip` (Selected / Elevated) inside bottom sheet | Form with grouped `Picker` and `Toggle` inside sheet with "Done" toolbar item | Android favours dense chip wrapping; iOS favours structured grouped rows. |
| **Map Selection Preview**| Floating elevated `Card` anchored above bottom navigation bar | Native `.sheet` with small detent (`.height(180)`) overlaying MapKit | Android uses standard floating card; iOS uses native detent sheet. |
| **Route / Stop Sequence**| LazyColumn with custom canvas vertical timeline line and stop dot composables | `List` with custom `TimelineView` or sectioned disclosure groups | Both render vertical transit lines cleanly using platform list recycling. |
| **Itinerary Planner Form**| Material 3 `OutlinedTextField`, `SegmentedButton`, and `DatePickerDialog` | SwiftUI `Form` with native `Picker`, `Stepper`, and graphical `DatePicker` | First-party form controls ensure native autofill and accessibility. |
| **Media Viewer** | Fullscreen dialog with `Modifier.pointerInput` detecting double-tap zoom via Coil | `.fullScreenCover` with native `MagnifyGesture` and interactive dismiss drag | Smooth 60fps photo inspection with native gesture engines. |
| **Settings & Preferences**| `Scaffold` with categorized `ListItem` composables and M3 `Switch` | `Form` with grouped `Section` containers and native iOS `Toggle` | Android M3 settings hierarchy vs iOS HIG Settings hierarchy. |
| **Confirmation Prompts** | `AlertDialog` with `TextButton` ("Dismiss") and `Button` ("Confirm") | `.confirmationDialog` or `.alert` with `.cancel` and destructive roles | Action sheet style on iOS vs centered dialog on Android. |
| **Hardware Permissions** | Custom pre-prompt card followed by `rememberLauncherForActivityResult` | Custom pre-prompt view followed by `CLLocationManager.requestWhenInUseAuthorization` | Pre-permission education view is identical; system prompt is OS-native. |
| **Transient Feedback** | `SnackbarHost` anchored above navigation bar with action label | Native subtle banner or HUD notification; zero toast spam | Android uses standard Snackbar; iOS uses subtle in-app notification pill. |
| **Context Menus** | `DropdownMenu` anchored to trigger icon button | `.contextMenu` with SF Symbol menu items on long press | Standard long-press preview on iOS vs anchored dropdown on Android. |
| **Materials & Surfaces** | Solid tonal surfaces (`surfaceContainer`, `surfaceContainerHigh`) with hairline borders | Native system materials (`.ultraThinMaterial`, `.thinMaterial`) with hairline borders | iOS leverages hardware GPU translucency; Android leverages M3 tonal color surfaces. |
