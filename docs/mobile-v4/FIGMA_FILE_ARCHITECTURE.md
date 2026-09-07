# O-TRAVELZ Mobile V4 — Figma Canonical File Architecture

> **Authoritative Canvas Page Hierarchy, Workspace Boundaries, and Platform Partitioning Contract**<br>
> Scope: **Figma Canonical Design System Workspace ("O-TRAVELZ Mobile V4")**<br>
> Governance: **Dual-Native Parallel Architecture (Android M3 Expressive / iOS Apple HIG)**<br>
> Wave: `M3` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Executive File Identification & Canvas Governance

The canonical design repository for O-TRAVELZ Mobile V4 is hosted in a single authoritative Figma workspace file:

- **File Name**: `O-TRAVELZ Mobile V4`
- **File Role**: Authoritative source of visual truth, component definitions, variable collections, responsive layouts, and interactive golden-journey prototypes.
- **Architectural Boundary**: Android and iOS component and screen pages are strictly separated. Shared semantic tokens and truth state concepts reside in dedicated foundation pages, but platform components and presentation flows are never merged into cross-platform generic abstractions.

---

## 2. Canvas Page Hierarchy & Responsibilities

The file structure is organized into four distinct functional tiers: Shared Foundations (00–03), Android System (10–15), iOS System (20–25), and Exploratory Archives (90, 99).

```
O-TRAVELZ Mobile V4
│
├── [SHARED FOUNDATIONS & SYSTEM SEMANTICS]
│   ├── 00 — Product Foundations
│   ├── 01 — Shared Semantics
│   ├── 02 — Truth & Status
│   └── 03 — Shared Content Patterns
│
├── [ANDROID NATIVE SYSTEM (Material 3 Expressive Editorial)]
│   ├── 10 — Android Foundations
│   ├── 11 — Android Components
│   ├── 12 — Android Patterns
│   ├── 13 — Android Core Screens
│   ├── 14 — Android Motion
│   └── 15 — Android Prototypes
│
├── [iOS NATIVE SYSTEM (Apple HIG Publication System)]
│   ├── 20 — iOS Foundations
│   ├── 21 — iOS Components
│   ├── 22 — iOS Patterns
│   ├── 23 — iOS Core Screens
│   ├── 24 — iOS Motion
│   └── 25 — iOS Prototypes
│
└── [ARCHIVE & EXPLORATION]
    ├── 90 — Stitch Exploration Archive
    └── 99 — Deprecated / Rejected
```

---

## 3. Detailed Page Breakdown & Contents

### Page `00 — Product Foundations`
- **Purpose**: High-level platform principles, version index, and cultural design guidelines.
- **Contents**:
  - File Cover, Version Changelog, and Active Wave Indicator (`M3`).
  - *Modern Odisha Cultural Atlas* aesthetic manifesto (warm basalt canvas, sandstone ochre, terracotta accents, editorial restraint).
  - Multidimensional Truth Hierarchy reference documentation.
  - Zero-Vibe-Code constraints: strict ban on purple/neon gradients, fake counters, simulated live vehicle tracking, and fabricated reviews.

### Page `01 — Shared Semantics`
- **Purpose**: Variable collections and mathematical design foundations shared across both native systems.
- **Contents**:
  - Variable Collections: `Shared/Color`, `Shared/Spacing` (4px geometric base, `space.1` through `space.12`), `Shared/Radius`, and `Shared/Elevation`.
  - Mode matrices: `Dark Atlas` (primary baseline) and `Warm Sandstone` (editorial daytime/reading mode).
  - Typography scale reference (cross-referenced to platform font families: Inter/Roboto/Noto Odia on Android; SF Pro/New York on iOS).

### Page `02 — Truth & Status`
- **Purpose**: Canonical definitions of data honesty badges, status ribbons, and degraded service indicators.
- **Contents**:
  - Truth State Visual Specifications: `VerifiedOfficial`, `ScheduledDeparture`, `LiveWeather`, `EstimatedDistance`, `CandidateStop`, and `Unavailable`.
  - Offline mode visual contracts: `Bundled & Guaranteed`, `Persisted After Use`, `Optional Download`, `Network Required`, and `Provider Dependent`.
  - AI state indicators: `Available`, `Degraded / Deterministic Fallback`, and `Unavailable`.
  - Non-live transit boundary indicators (explicit rejection of "real-time bus location" or "live arrival" claims).

### Page `03 — Shared Content Patterns`
- **Purpose**: Abstract structural templates for common traveler content blocks before platform styling.
- **Contents**:
  - Place Summary and Hero Media slot structures.
  - Weather Snapshot and Practical Info data card templates.
  - Route Summary and Stop Timeline data row templates.
  - Essential Civic & Medical facility summary layouts (211 verified facilities).

---

### Page `10 — Android Foundations`
- **Purpose**: Android-specific design tokens, Material 3 Expressive theming, and layout metrics.
- **Contents**:
  - M3 Color Scheme aliases mapped to Shared Semantic Variables.
  - M3 Typography Roles (Display, Headline, Title, Body, Label) using Android system font stacks.
  - Window Size Class definitions: Compact (<600dp), Medium (600–839dp), Expanded (≥840dp).
  - Android 15 edge-to-edge system insets, gesture navigation safe zones, and elevation tonal palettes.

### Page `11 — Android Components`
- **Purpose**: Canonical Material 3 component library built with Figma Auto Layout and Component Properties.
- **Contents**:
  - Navigation: `AtlasNavigationBar`, `AtlasNavigationRail`, `RootDestinationItem`.
  - Discovery & Feeds: `AtlasPlaceCard`, `CompactPlaceRow`, `DistrictFilterChip`, `CategoryFilterChip`, `SearchField`, `CuratedCollectionHeader`.
  - Status & Truth: `AndroidTruthBadge`, `OfflineBanner`, `WeatherStateCard`, `DataUnavailableCard`.
  - Place Detail: `PlaceHeroMedia`, `PlaceIdentityBlock`, `PlacePracticalInfo`, `PlaceTruthSection`, `NearbyPlacesSection`.
  - Map Components: `MapAnnotation`, `SelectedMapEntitySheet`, `MapLayerControl`, `LocationStateIndicator`.
  - Planning & Trips: `PlannerConstraintGroup`, `DurationSelector`, `PaceSelector`, `TransportPreferenceSelector`, `NaturalLanguageRefinement`, `ItineraryDayCard`, `JourneyLegRow`, `ActiveTripHeader`, `TripTimeline`, `ActiveMilestoneCard`, `CompletedMilestoneRow`, `SkippedMilestoneRow`.
  - Transit & Essentials: `RouteSummaryRow`, `StopTimelineRow`, `ScheduledDepartureRow`, `FirstMileChip`, `CandidateStopDisclosure`, `RouteGeometryDisclosure`, `EssentialServiceRow`, `EmergencyShortcut`.
  - System States: `LoadingSkeleton`, `EmptyContentState`, `RetryState`, `PermissionEducationSheet`.

### Page `12 — Android Patterns`
- **Purpose**: Reusable multi-component composite patterns following Android idioms.
- **Contents**:
  - ModalBottomSheet and StandardBottomSheet behavioral patterns.
  - First-Mile Distance Band composite callouts (`WALKABLE`, `INTERMEDIATE`, `EXTENDED`).
  - Search filter bar with sticky scrolling and horizontal chip overflow.
  - Offline fallback banners integrated into top app bars.

### Page `13 — Android Core Screens`
- **Purpose**: Canonical high-fidelity reference screens for the 9 core mobile surfaces.
- **Contents**:
  - 1. `Discover Root` (Compact phone + Medium tablet variant)
  - 2. `Place Detail` (Standard phone + scrolled state)
  - 3. `Map with Selected Entity` (MapLibre vector styling + 280dp sheet)
  - 4. `Plan Input` (Constraint chips + natural language input)
  - 5. `Itinerary Result` (Day timeline + departure cards)
  - 6. `Active Trip` (Current milestone hero + timeline)
  - 7. `Transit Route Detail` (Stop sequence + timetable disclosure)
  - 8. `Trips Root` (Saved & active trips carousel)
  - 9. `You Root` (Offline packs + contribution history)
  - Degraded / offline sibling frames for every core screen.

### Page `14 — Android Motion`
- **Purpose**: Motion choreographies, easing curves, and transition specifications.
- **Contents**:
  - Material 3 Shared Axis transition specs (Z-axis drill-in, X-axis tab switch).
  - Container Transform choreography (PlaceCard $\rightarrow$ PlaceDetail).
  - Predictive Back preview arcs and gesture cancellation behavior.
  - Low-power / Reduce Motion instant cut alternatives.

### Page `15 — Android Prototypes`
- **Purpose**: Clickable interactive flows wired for mobile user testing.
- **Contents**:
  - 6 Golden Journey interactive prototypes (J1 First-Time Visitor, J3 AI Planning, J5 Transit-Dependent Trip, J6 Active Trip, J8 Offline Trip, J12 Location Permission Denied).
  - Strict wiring of Back actions, BottomSheet drag-to-dismiss, and error retry states.

---

### Page `20 — iOS Foundations`
- **Purpose**: iOS-specific design tokens, Apple HIG semantic color mappings, and Human Interface metrics.
- **Contents**:
  - Apple HIG Semantic Color aliases (`systemBackground`, `secondarySystemBackground`, `label`, `secondaryLabel`, `separator`).
  - SF Pro and New York serif typography text styles with Dynamic Type size steps (xSmall to AX5).
  - Layout Margins, Safe Area Insets (Dynamic Island / Home Indicator), and Split View size classes (Compact / Regular).
  - Background material definitions (`regularMaterial`, `thinMaterial`, `ultraThinMaterial`) and progressive enhancement gates.

### Page `21 — iOS Components`
- **Purpose**: Canonical Apple-native component library built with Auto Layout and Component Properties.
- **Contents**:
  - Navigation: `AtlasTabItem`, `AtlasNavigationTitle`, `AtlasToolbarAction`.
  - Discovery & Feeds: `EditorialPlaceCard`, `CompactPlaceRow`, `DistrictFilter`, `CategoryFilter`, `SearchField`, `CuratedSectionHeader`.
  - Status & Truth: `IOSTruthBadge`, `OfflineStatusBanner`, `WeatherSummaryView`, `DataUnavailableView`.
  - Place Detail: `PlaceHeroMedia`, `PlaceIdentityHeader`, `PlacePracticalInfo`, `PlaceTruthSection`, `NearbyPlacesSection`.
  - Map Components: `MapAnnotationView`, `SelectedMapEntitySheet`, `MapLayerMenu`, `LocationStateIndicator`.
  - Planning & Trips: `PlannerConstraintSection`, `DurationControl`, `PaceControl`, `TransportPreference`, `NaturalLanguageRefinement`, `ItineraryDaySection`, `JourneyLegRow`, `ActiveTripHeader`, `TripTimeline`, `ActiveMilestoneCard`, `CompletedMilestoneRow`, `SkippedMilestoneRow`.
  - Transit & Essentials: `RouteSummaryRow`, `StopTimelineRow`, `ScheduledDepartureRow`, `FirstMileLabel`, `CandidateStopDisclosure`, `RouteGeometryDisclosure`, `EssentialServiceRow`, `EmergencyShortcut`.
  - System States: `ProgressView state`, `ContentUnavailableView state`, `RetryView`, `PermissionEducationSheet`.

### Page `22 — iOS Patterns`
- **Purpose**: Composite Apple HIG UI patterns.
- **Contents**:
  - Inset Grouped List patterns with custom disclosure indicators.
  - Native sheet presentations with `.presentationDetents([.fraction(0.35), .large])` and `.presentationDragIndicator(.visible)`.
  - Dynamic Type vertical reflow structures for metadata rows.
  - Context Menu and Pull-Down Menu interactions.

### Page `23 — iOS Core Screens`
- **Purpose**: Canonical high-fidelity reference screens for the 9 core mobile surfaces.
- **Contents**:
  - 1. `Discover Root` (iPhone 16 Pro + iPad Split View regular width)
  - 2. `Place Detail` (Editorial hero + inset grouped practical info)
  - 3. `Map with Selected Entity` (Apple Maps SDK vector styling + detent sheet)
  - 4. `Plan Input` (Grouped form controls + Siri-style prompt field)
  - 5. `Itinerary Result` (Editorial day chapters + transit legs)
  - 6. `Active Trip` (Live milestone card + navigation toolbar)
  - 7. `Transit Route Detail` (Stop sequence with truth disclosure)
  - 8. `Trips Root` (Saved & offline itineraries)
  - 9. `You Root` (Settings, downloaded regions, feedback)
  - Degraded / offline sibling frames for every core screen.

### Page `24 — iOS Motion`
- **Purpose**: SwiftUI spring curves, interactive transitions, and haptic choreography.
- **Contents**:
  - Interactive Spring curves (`response: 0.38s, dampingFraction: 0.82`).
  - Sheet rubber-banding and drag resistance profiles.
  - CoreHaptics semantic event choreography (`selectionChanged`, `impactMedium`, `notificationWarning`).
  - UIAccessibility `isReduceMotionEnabled` cross-fade substitutions.

### Page `25 — iOS Prototypes`
- **Purpose**: Clickable interactive flows wired for iOS UX evaluation.
- **Contents**:
  - 6 Golden Journey interactive prototypes (J1 First-Time Visitor, J3 AI Planning, J5 Transit-Dependent Trip, J6 Active Trip, J8 Offline Trip, J12 Location Permission Denied).
  - Native swipe-to-dismiss sheets, navigation push/pop, and modal sheet stacks.

---

### Page `90 — Stitch Exploration Archive`
- **Purpose**: Storage for conceptual HTML/React prototypes generated during Waves M2 and M3.
- **Rules**: Explicitly tagged as *Reference Only — Non-Production*. Not consumed by native mobile engineers.

### Page `99 — Deprecated / Rejected`
- **Purpose**: Preserves discarded visual directions, rejected neon/glass prototypes, and legacy Mobile V1–V3 artifacts to prevent architectural regression.

---

## 4. Separation & Handoff Principles

1. **Strict Page Separation**: Android and iOS components are hosted on separate pages (`11` vs `21`) and screens on separate pages (`13` vs `23`). Cross-pollination is prohibited.
2. **Variable Inheritance**: Both native platforms bind their local alias collections directly to Page `01 — Shared Semantics`, ensuring absolute visual parity for colors, spacing, and truth badges while preserving native UI component structure.
3. **Traceability**: Every frame and component on Pages `11`, `13`, `21`, and `23` maps directly to a verified ID in `docs/mobile-v4/SURFACE_INVENTORY.md` and `docs/mobile-v4/TRUTH_CONTRACTS.md`.
