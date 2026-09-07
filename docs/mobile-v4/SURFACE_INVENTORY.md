# O-TRAVELZ Mobile V4 — Complete Surface Inventory

> **Authoritative UI Architecture Specification**  
> Surface Model: **Minimalist, Coherent Surface Hierarchy (Ponytail Enforced)**  
> Total Surfaces: **30 Defined Surfaces** (5 Roots, 7 Full/Detail Screens, 11 Sheets, 4 Dialogs, 1 Overlay, 1 System, 1 Intent Service)  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Classification Vocabulary

- **`ROOT`**: One of the five primary bottom-bar tab destinations (`Discover`, `Map`, `Plan`, `Trips`, `You`).
- **`FULL_SCREEN`**: Full viewport presentation pushed onto the platform navigation stack.
- **`DETAIL`**: Comprehensive editorial inspection surface for a specific entity (Place, Route, Saved Trip).
- **`SHEET`**: Contextual bottom sheet anchored to the current viewport (e.g. Filter Drawer, Selected Node Preview, Stop Detail).
- **`OVERLAY`**: Fullscreen modal layer (e.g. Media Viewer gallery with gestures).
- **`DIALOG`**: Focused modal confirmation prompt (e.g. Emergency Call confirmation, Check-In submission).
- **`SYSTEM_SURFACE`**: OS-managed surface (e.g. System Splash screen, Dynamic Island).
- **`NO_UI_SERVICE`**: Headless operating system intent trigger (e.g. External Navigation handoff to Google/Apple Maps).

---

## 2. Master Surface Table

| Surface ID | Surface Name | Classification | Parent Route | Android Presentation | iOS Presentation |
|---|---|---|---|---|---|
| `entry_splash` | Native Splash | `SYSTEM_SURFACE` | OS Root | Android 12 SplashScreen API | LaunchScreen.storyboard / Asset |
| `entry_onboarding` | First-Run Guide | `FULL_SCREEN` | App Root | Edge-to-edge HorizontalPager | FullScreenCover paged TabView |
| `entry_permission` | Context Permission | `DIALOG` | Current Surface | Material 3 AlertDialog | Standard Alert dialog |
| `discover_root` | Discover (Atlas) | `ROOT` | BottomBar Tab 0 | LazyColumn + M3 Expressive | ScrollView + LazyVGrid + HIG |
| `search_drawer` | Search Bar & Drawer | `SHEET` | `discover_root` | ModalBottomSheet with SearchBar | Searchable modifier with scope |
| `filter_sheet` | District/Category Filter| `SHEET` | `discover_root` | FilterChip flow layout | Form with Section pickers |
| `place_detail` | Place Editorial Detail| `DETAIL` | Any Place Link | ModalBottomSheet -> FullScreen | Sheet (detents .medium, .large)|
| `media_gallery` | Fullscreen Photo Viewer| `OVERLAY` | `place_detail` | Zoomable Coil AsyncImage | TabView with MagnifyGesture |
| `map_canvas` | Cartography Canvas | `ROOT` | BottomBar Tab 1 | Google Maps Compose | Apple MapKit (SwiftUI.Map) |
| `map_layer_sheet` | Map Layer Toggles | `SHEET` | `map_canvas` | Floating M3 SegmentedControl | Glass toolbar floating sheet |
| `map_node_preview`| Selected Map Node | `SHEET` | `map_canvas` | Swipeable bottom card | Custom presentationDetent sheet |
| `plan_root` | Constraint Planner | `ROOT` | BottomBar Tab 2 | M3 Stepper form | Form with grouped sections |
| `plan_result` | Itinerary Timeline | `DETAIL` | `plan_root` | LazyColumn timeline items | List with custom Timeline rows |
| `ai_chat_sheet` | Grounded AI Assistant| `SHEET` | `plan_result` | ModalBottomSheet + IME insets | Sheet with .keyboardToolbar |
| `trips_root` | Trips & Bookmarks | `ROOT` | BottomBar Tab 3 | M3 PrimaryTabRow | Segmented Picker control |
| `active_trip_view`| Active Day Timeline | `DETAIL` | `trips_root` | Ongoing Hero Card + Checklist | Persistent header + Section List |
| `saved_trip_detail`| Saved Trip Overview| `DETAIL` | `trips_root` | Standard Scaffold detail | NavigationStack push |
| `transit_directory`| 154-Route Portal | `DETAIL` | `discover_root` | Searchable LazyColumn | NavigationLink destination |
| `route_detail` | Route Stop Sequence| `DETAIL` | `transit_directory`| Route polyline mini-map + List| MapPolyline + List |
| `stop_detail` | Bus Stop Timetable | `SHEET` | Any Stop Link | ModalBottomSheet (IST clocks) | PresentationDetent sheet |
| `essentials_sheet`| Emergency Contacts | `SHEET` | `you_root` / `map` | M3 ModalBottomSheet | Action sheet with tel: URLs |
| `emergency_dialog`| Call Confirmation | `DIALOG` | `essentials_sheet`| AlertDialog -> Intent.ACTION_DIAL| confirmationDialog -> tel:// |
| `contributions_hub`| Community Staging | `DETAIL` | `you_root` | Standard Scaffold list | NavigationStack detail |
| `transit_checkin` | Stop Check-In | `DIALOG` | `route_detail` | M3 Check-in modal dialog | SwiftUI Sheet with check-in button|
| `photo_capture` | Camera Contribution| `FULL_SCREEN` | `contributions_hub`| CameraX PreviewView | AVFoundation / PhotosPicker |
| `you_root` | You & Sovereign Prefs| `ROOT` | BottomBar Tab 4 | M3 Expressive settings list | Form with grouped navigation |
| `offline_manager` | Offline Atlas Footprint| `DETAIL` | `you_root` | Storage meter + download buttons| Gauge meter + Section actions |
| `settings_view` | Language & Theme | `DETAIL` | `you_root` | RadioButton group | Picker navigation view |
| `legal_view` | Trust, Privacy & Terms| `DETAIL` | `you_root` | WebView or Native Markdown | Text view with markdown links |
| `external_nav` | Turn-by-Turn Handoff| `NO_UI_SERVICE`| Any Place/Stop | Intent.ACTION_VIEW (Google Maps)| UIApplication.shared.open (URLs)|

---

## 3. Ponytail Reduction Principles Applied

1. **Eliminated Standalone "Transit Tab"**: Transit directory is accessed contextually from Discover, Map layers, and Plan hops. Eliminates an entire lonely directory root.
2. **Merged Search and Filter**: Filter chips live directly in the Search and Discover headers; no disconnected "Search Results Screen" separate from the main catalog.
3. **Turn-by-Turn Routing as Headless Service**: Avoided building an internal turn-by-turn navigation engine with audio voice guidance ($0 development cost; 0 maintenance lines of routing code; leverages external Google Maps / Apple Maps).
