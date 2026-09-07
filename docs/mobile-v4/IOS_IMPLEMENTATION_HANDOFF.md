# O-TRAVELZ Mobile V4 ? iOS Implementation Handoff Pack

> **Authoritative Native Implementation Handoff Specification for iOS V4**<br>
> Visual System: `IOS_A_EDITORIAL_ATLAS` (Apple HIG Publication System)<br>
> Scope: **Wave M5+ Implementation Guidance**<br>
> Version: `4.0.0` | Status: `LOCKED_SPECIFICATION` | Date: `2026-09-07`

---

## 1. iOS Engineering Foundations

### Target Configuration
- **Language**: Swift `6.0+` (Swift Concurrency with strict isolation)
- **Deployment Target**: iOS `17.0+` (Deliberate baseline preserving broad hardware compatibility)
- **UI Framework**: SwiftUI (with UIKit bridges for MapKit annotations where required)
- **Architecture**: Modern MV with `@Observable` models
- **Reference Hardware**: iPhone 13 / 14 / 15 / 16 across Standard and Pro tiers

### Visual Architecture
- **Root Shell**: Native `TabView` mapping to 5 root tabs (`Discover`, `Map`, `Plan`, `Trips`, `You`). On iPad, adapts to `NavigationSplitView`.
- **Navigation**: `NavigationStack` with large navigation titles that collapse on scroll.
- **Materials**: Native system materials (`.ultraThinMaterial`, `.regularMaterial`) with hairline separators (`0.5pt`).
- **Sheets**: Native sheet presentations with presentation detents (`.presentationDetents([.medium, .large])`).

---

## 2. Core Surface Specifications

### `I01` ? Discover Root
- **Dependencies**: `NavigationStack`, `EditorialCardHIG`, `FilterChipBarHIG`, `TruthBadgeHIG`
- **Tokens**: `Color(uiColor: .systemBackground)`, `Color.accentColor` (Terracotta), hairline separators
- **Dynamic Type**: All headlines scale with `.font(.title.weight(.bold))`; chips wrap dynamically.
- **Degraded State (`I01-D`)**: System offline banner appears below navigation bar; cached indicators active.

### `I02` ? Place Detail
- **Dependencies**: `MediaCarouselHIG`, `MetadataRowGroup`, `CulturalNarrativeBlock`
- **Presentation**: Presented via `.sheet(detents: [.medium, .large])` or pushed on `NavigationStack`.
- **Truth Rules**: Photo count counts distinct source assets. Video affordance appears ONLY when video asset exists.
- **Degraded State (`I02-D`)**: Text-first layout; 0 verified photos badge; no synthetic artwork.

### `I03` ? Map Selected Place
- **Dependencies**: `Map` (MapKit), `MapDetentSheet`, `MapAnnotationMarker`
- **Detents**: Sheet snaps to `.medium` (shows place overview) and `.large` (shows complete cultural facts).
- **Degraded State (`I03-D`)**: Slashed location arrow when permission denied; manual pan active.

### `I04` ? Plan Input
- **Dependencies**: `Form`, `Picker`, `PaceSegmentedControl`, `NaturalLanguageInputField`
- **Degraded State (`I04-D`)**: Network required prompt notice; structured form remains active.

### `I05` ? Itinerary Result
- **Dependencies**: `ItineraryMilestoneRow`, `TransitLegDisclosureGroup`
- **Degraded State (`I05-D`)**: Unmapped transit legs flagged with advisory notice.

### `I06` ? Trips Root
- **Dependencies**: `SavedTripTile`, `ContentUnavailableView`
- **Storage**: SwiftData persistence (`@Model`).
- **Degraded State (`I06-D`)**: `ContentUnavailableView` with editorial trip generator prompt.

### `I07` ? Active Trip Execution
- **Dependencies**: `ActiveTripTimelineHIG`, `MilestoneCheckmarkButton`, `OpenInMapsButton`
- **Behavior**: Vertical timeline with manual checkoff. Native intent handoff to Apple Maps.
- **Degraded State (`I07-D`)**: Cached timeline active with offline indicator.

### `I08` ? Transit Route Detail
- **Dependencies**: `RouteBadgeView`, `StopTruthDetailRow`, `FareStatusCard`
- **Truth Rules**: Departures formatted strictly as `Scheduled ? HH:MM IST`. Fare formatted strictly as `Fare information unavailable`.
- **Degraded State (`I08-D`)**: When geometry is unmapped, polyline is suppressed and advisory is rendered.

### `I09` ? You Root
- **Dependencies**: `List` (Grouped), `OfflineDownloadCell`, `LanguageToggleCell`
- **Degraded State (`I09-D`)**: Local storage active; optional Sign in with Apple button.