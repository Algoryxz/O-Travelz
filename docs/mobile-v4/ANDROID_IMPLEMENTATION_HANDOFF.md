# O-TRAVELZ Mobile V4 ? Android Implementation Handoff Pack

> **Authoritative Native Implementation Handoff Specification for Android V4**<br>
> Visual System: `ANDROID_A_ATLAS_MATERIAL` (Material 3 Expressive Editorial)<br>
> Scope: **Wave M5+ Implementation Guidance**<br>
> Version: `4.0.0` | Status: `LOCKED_SPECIFICATION` | Date: `2026-09-07`

---

## 1. Android Engineering Foundations

### Target Configuration
- **Language**: Kotlin `2.0+`
- **Build Tool**: Gradle `8.6+` (AGP 8.6)
- **UI Framework**: Jetpack Compose (Compose BOM `2024.09.00+`)
- **Min SDK**: `26` (Android 8.0 Oreo)
- **Target / Compile SDK**: `35` (Android 15)
- **Reference Hardware**: Vivo Y19 (MediaTek Helio P65, 4GB RAM, Android 12 / API 31)

### Visual Architecture
- **Root Shell**: `NavigationSuiteScaffold` mapping to `NavigationBar` on phones and `NavigationRail` on medium/expanded devices.
- **Window Insets**: Full edge-to-edge support with `enableEdgeToEdge()`, transparent status and navigation bars.
- **Back Navigation**: Modern `PredictiveBackHandler` container transforms between list feeds and detail surfaces.

---

## 2. Core Surface Specifications

### `A01` ? Discover Root
- **Dependencies**: `TopAppBar`, `CategoryPillFilter`, `DestinationHeroCard`, `TruthBadgeM3`
- **Tokens**: `surface.canvas`, `surface.card`, `accent.terracotta`, `text.primary`
- **Data Inputs**: Destination list from shared KMP core (`id`, `name`, `district`, `photoCount`, `isVerified`)
- **Degraded State (`A01-D`)**: Displays `OfflineStateBannerM3` when offline; shows cached cards with discrete offline pill.

### `A02` ? Place Detail
- **Dependencies**: `EditorialMediaPager`, `QuickFactsGrid`, `CulturalContextEssayCard`, `FloatingActionButton`
- **Tokens**: `surface.canvas`, `surface.elevated`, `accent.sandstone`, `accent.terracotta`
- **Truth Rules**: Photo count badge reflects distinct source assets. Video button appears ONLY when genuine video asset exists. NO fallback 3D.
- **Degraded State (`A02-D`)**: Text-first layout when media is pending; no generic landscape placeholder art.

### `A03` ? Map Selected Place
- **Dependencies**: `GoogleMap` (Compose), `MapEntityBottomSheet`, `DestinationPin`, `TransitStopPin`
- **Behavior**: Selected destination reveals `ModalBottomSheet` with drag handle; quick route action button.
- **Degraded State (`A03-D`)**: When location is denied, map centers on Odisha state bounds with sandstone cluster markers.

### `A04` ? Plan Input
- **Dependencies**: `ConstraintInputForm`, `SegmentedButtonRow`, `StructuredPaceSlider`
- **Inputs**: Duration, transport mode, pacing, starting hub, optional natural language refinement.
- **Degraded State (`A04-D`)**: Network required notice on conversational prompt field; structured generator remains fully functional.

### `A05` ? Itinerary Result
- **Dependencies**: `ItineraryMilestoneCard`, `TransitLegCard`, `WeatherSummaryPill`
- **Degraded State (`A05-D`)**: Unmapped transit legs flagged with advisory banner: "Local transport advisory ? route geometry unmapped".

### `A06` ? Trips Root
- **Dependencies**: `SavedTripCard`, `EmptyStateView`
- **Storage**: Room SQLite persistence.
- **Degraded State (`A06-D`)**: Editorial empty state encouraging trip generation.

### `A07` ? Active Trip Execution
- **Dependencies**: `ActiveTripTimeline`, `MilestoneCompletionToggle`, `ExternalNavIntentLauncher`
- **Behavior**: Vertical milestone timeline with manual checkoff. Zero fake automated geofence arrival claims.
- **Degraded State (`A07-D`)**: Cached trip timeline active; offline badge prominent.

### `A08` ? Transit Route Detail
- **Dependencies**: `RouteBadgeHeader`, `TransitStopTruthRow`, `ScheduleDisclosureCard`
- **Truth Rules**: Departures formatted strictly as `Scheduled ? HH:MM IST`. Fare formatted strictly as `Fare information unavailable`.
- **Degraded State (`A08-D`)**: When geometry is unmapped, map polyline is suppressed and advisory banner is rendered.

### `A09` ? You Root
- **Dependencies**: `OfflineCacheManagerRow`, `LanguageToggleRow`, `AccountStatusCard`
- **Degraded State (`A09-D`)**: Signed-out state retains full local storage, saved places, and offline downloads.