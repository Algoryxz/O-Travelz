# O-TRAVELZ Mobile V4 — Responsive & Adaptive Design Contract

> **Authoritative Adaptive Layout Specification for Android & iOS Window Size Classes**<br>
> Scope: **Form-Factor Adaptation (Phone, Foldable, Tablet, Landscape, Split View)**<br>
> Governance: **Zero Hardcoded Screen Dimensions; Pure Window Size Class Semantics**<br>
> Wave: `M3` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Architectural Philosophy: Semantic Window Classes

O-TRAVELZ Mobile V4 rejects device-specific hacks (e.g., `if (isPixel8)`) and arbitrary screen dimension locks. Instead, layouts are governed entirely by **Platform Window Size Classes**:

- **Android (Compose WindowSizeClass)**:
  - `Compact Width` (<600dp): Portrait smartphones.
  - `Medium Width` (600–839dp): Foldable unfolded inner displays, small tablets (e.g., 7–8"), landscape phones.
  - `Expanded Width` (≥840dp): Full-size tablets (e.g., 10–12"), Chromebooks, desktop-class windows.

- **iOS (SwiftUI UserInterfaceSizeClass)**:
  - `Compact Width`: All iPhones in portrait, smaller iPhones in landscape, iPad 1/3 Split View.
  - `Regular Width`: iPads in full screen or 1/2–2/3 Split View, larger iPhones (Plus/Pro Max) in landscape.

---

## 2. Screen-by-Screen Adaptive Adaptation Contract

### 1. Discover Root
- **what grows**: Content card grid width and gallery image container widths expand to fill column slot widths.
- **what reflows**:
  - `Compact`: Single-column feed or 2-column compact grid.
  - `Medium`: 2-column staggered publication grid with sticky filter chip row.
  - `Expanded`: 3-column editorial grid with persistent side filter drawer.
- **what becomes side-by-side**: Hero destination spotlight sits beside a curated trail list in `Expanded` width.
- **what remains fixed**: Category filter chip height (36dp/pt), bottom navigation item touch targets (48dp / 44pt minimum).
- **what becomes rail/sidebar**:
  - Android: `AtlasNavigationBar` transforms into `AtlasNavigationRail` pinned to start edge in `Medium` and `Expanded`.
  - iOS: Standard TabBar transforms into `NavigationSplitView` sidebar on iPad Regular width.
- **what becomes sheet/panel**: Filter drawer on phone becomes a fixed left panel on Expanded width.
- **text scaling behavior**: Display hero scales gracefully with `min(32sp, 5vw)`; titles wrap up to 3 lines without clipping.
- **map behavior**: Embedded mini-map preview expands from 120dp banner to interactive side column.

---

### 2. Place Detail
- **what grows**: Descriptive cultural prose column width (capped at 680dp/pt max reading line length to preserve editorial legibility).
- **what reflows**:
  - `Compact`: Linear vertical scroll: Hero Media $\rightarrow$ Identity $\rightarrow$ Practical Info $\rightarrow$ Truth Section $\rightarrow$ Nearby.
  - `Medium / Expanded`: Two-column layout: Left column contains Sticky Media Hero & Map Location; Right column contains scrollable Practical Info, Visiting Hours, and Cultural Heritage narrative.
- **what becomes side-by-side**: Media carousel and Practical visiting information card grid.
- **what remains fixed**: Verified truth badge dimensions, Action button hit targets.
- **what becomes sheet/panel**: Transit directions and full photo gallery present as floating modal panel in Expanded width instead of full-screen push.
- **text scaling behavior**: Practical fact tables (`LabeledContent`) reflow from horizontal key-value rows to vertical stacks under accessibility text sizes (`AX1`–`AX5` / font scale >1.5x).

---

### 3. Map with Selected Entity
- **what grows**: Vector map viewport expands to consume full window canvas.
- **what reflows**: Entity details presentation.
- **what becomes side-by-side**:
  - `Compact`: Full-screen map with bottom sheet docked at bottom (`280dp` peek / `50%` / `90%`).
  - `Medium / Expanded`: Map takes 60–70% width on right; Selected entity details dock as a persistent 360dp left card/panel.
- **what remains fixed**: Map control floating buttons (Layer selector, My Location) maintain 48x48dp / 44x44pt touch zones.
- **what becomes rail/sidebar**: Destination list displays as an interactive left sidebar alongside the live map.
- **what becomes sheet/panel**: BottomSheet transforms into persistent Left Surface Panel on width ≥600dp / Regular width.
- **map behavior**: Camera auto-framing accounts for panel margins, centering pins in the visible map region.

---

### 4. Plan Input
- **what grows**: Natural language input container width (capped at 640dp for focus).
- **what reflows**: Duration and pace segmented buttons expand from horizontal scroll to full-width segmented rows.
- **what becomes side-by-side**: Constraints form (Duration, Pace, Transport) sits on left; Live preview of suggested destinations sits on right.
- **what remains fixed**: Button heights and touch targets.
- **what becomes sheet/panel**: N/A.
- **text scaling behavior**: Segmented button labels wrap or convert to vertical stacked chips at accessibility font scales.

---

### 5. Itinerary Result
- **what grows**: Timeline width and day chapter containers.
- **what reflows**:
  - `Compact`: Vertical timeline of Day 1, Day 2, Day 3 stacked sequentially.
  - `Medium / Expanded`: Multi-column layout with Day selector tabs on left and active day timeline in center; overview map rendered simultaneously on right.
- **what becomes side-by-side**: Day itinerary sequence and transit route map rendered concurrently on screen.
- **what remains fixed**: Departure time mono pills (`10:15 AM IST`) maintain strict fixed geometry.

---

### 6. Active Trip
- **what grows**: Progress bar and milestone card hero dimensions.
- **what reflows**:
  - `Compact`: Single-column vertical experience: Hero Active Milestone at top, upcoming queue below.
  - `Medium / Expanded`: Split view: Active milestone hero & direct actions on left; live map tracking next stop on right.
- **what becomes side-by-side**: Current action card and trip route map.
- **what remains fixed**: Primary action button ("Mark Arrived") stays anchored and immediately tappable.
- **text scaling behavior**: Large milestone title reflows without obscuring the "Arrived" action button.

---

### 7. Transit Route Detail
- **what grows**: Stop sequence timeline list height and map route corridor view.
- **what reflows**:
  - `Compact`: Split screen: Top 35% map polyline, bottom 65% scrollable stop list.
  - `Medium / Expanded`: 50/50 side-by-side split: Left pane displays full route stop sequence and departure timetable; Right pane displays interactive map with surveyed stop pins and polyline.
- **what becomes side-by-side**: Timetable stop sequence and full-height map canvas.
- **what remains fixed**: Mo Bus route badge pill, Scheduled departure time typography.

---

### 8. Trips Root
- **what grows**: Saved journey card widths.
- **what reflows**:
  - `Compact`: Vertical list of saved trips with horizontal active trip hero.
  - `Medium / Expanded`: 2-column or 3-column card grid of past and upcoming journeys.
- **what becomes side-by-side**: Active trip overview card and saved itineraries grid.

---

### 9. You Root
- **what grows**: Storage management progress bar and settings list width.
- **what reflows**: Inset grouped settings list expands up to 600dp max width, centered on tablet/desktop displays to avoid stretched list rows.
- **what becomes side-by-side**: Profile & Offline pack manager on left; App Settings, Civic Feedback, and Legal provenance on right.
- **what remains fixed**: Switch toggles, download action buttons.

---

## 3. Adaptation Summary Matrix

| Surface | Compact (<600dp / Compact) | Medium (600–839dp / Regular) | Expanded (≥840dp / Regular Large) |
|---|---|---|---|
| **Discover** | 1–2 Col Grid • Bottom Nav | 2 Col Grid • Nav Rail / Split | 3 Col Grid • Persistent Drawer |
| **Place Detail** | Single Column Linear Scroll | 2 Col (Media Left, Info Right) | 2 Col (Max Reading Width 680dp) |
| **Map Entity** | Bottom Sheet Peek (280dp) | Side Panel (360dp) + Map | Side Panel (400dp) + Full Map |
| **Plan Input** | Vertical Form Stack | Form Left • Suggestion Right | Centered Focus Card (640dp max) |
| **Itinerary** | Sequential Day Stack | Day Tabs • Timeline Center | Timeline Center • Map Right |
| **Active Trip** | Hero Card Top • Queue Below | Hero Left • Map Right | Hero Left • Map Right • Detail Drawer |
| **Transit Route**| Top Map (35%) • Bottom Stops | 50/50 Side-by-Side Split | 40/60 Side-by-Side Split |
| **Trips Root** | Single Column List | 2 Col Grid | 3 Col Grid |
| **You Root** | Inset Grouped List | Centered Grouped (600dp max) | 2 Col Settings & Storage Panel |
