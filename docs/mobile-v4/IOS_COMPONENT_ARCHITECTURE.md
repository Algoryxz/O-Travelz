# O-TRAVELZ Mobile V4 — iOS Component Architecture Specification

> **Authoritative Native iOS Component Architecture (Apple HIG Publication System)**<br>
> Scope: **SwiftUI Native Views, View Modifiers, NavigationStacks, and Detents**<br>
> Governance: **Zero Shared UI Code; Pure Apple HIG / SwiftUI Implementation (iOS 17.0+ Baseline)**<br>
> Wave: `M3` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Architectural Philosophy: Apple HIG Publication System

The iOS component system for O-TRAVELZ Mobile V4 adheres strictly to **Apple Human Interface Guidelines (HIG)** and modern **SwiftUI declarative patterns**:
- **Native SwiftUI idioms**: Uses standard container views (`NavigationStack`, `TabView`, `List(..., style: .insetGrouped)`, `ContentUnavailableView`).
- **Dynamic Type first**: All views support dynamic text scaling from `xSmall` through accessibility sizes (`AX1`–`AX5`) without text clipping or truncated labels.
- **Haptic feedback semantics**: Native tactile feedback using `UIImpactFeedbackGenerator` and `UINotificationFeedbackGenerator` bound to meaningful user interactions.
- **Progressive enhancement gating**: iOS 17.0+ baseline deployment target. Future visual effects (such as iOS 18/26+ Liquid Glass APIs) are gated strictly behind runtime availability checks (`#available(iOS 26, *)`), never raising deployment targets prematurely.

---

## 2. Component Taxonomy & Inventory

The iOS component inventory comprises 10 functional families encompassing 44 native SwiftUI components:

1. **Navigation**: `AtlasTabItem`, `AtlasNavigationTitle`, `AtlasToolbarAction`.
2. **Discovery**: `EditorialPlaceCard`, `CompactPlaceRow`, `DistrictFilter`, `CategoryFilter`, `SearchField`, `CuratedSectionHeader`.
3. **Truth & Status**: `IOSTruthBadge`, `OfflineStatusBanner`, `WeatherSummaryView`, `DataUnavailableView`.
4. **Place Detail**: `PlaceHeroMedia`, `PlaceIdentityHeader`, `PlacePracticalInfo`, `PlaceTruthSection`, `NearbyPlacesSection`.
5. **Map**: `MapAnnotationView`, `SelectedMapEntitySheet`, `MapLayerMenu`, `LocationStateIndicator`.
6. **Planning**: `PlannerConstraintSection`, `DurationControl`, `PaceControl`, `TransportPreference`, `NaturalLanguageRefinement`, `ItineraryDaySection`, `JourneyLegRow`.
7. **Trips**: `ActiveTripHeader`, `TripTimeline`, `ActiveMilestoneCard`, `CompletedMilestoneRow`, `SkippedMilestoneRow`.
8. **Transit**: `RouteSummaryRow`, `StopTimelineRow`, `ScheduledDepartureRow`, `FirstMileLabel`, `CandidateStopDisclosure`, `RouteGeometryDisclosure`.
9. **Essentials**: `EssentialServiceRow`, `EmergencyShortcut`.
10. **Contribution & System**: `ContributionEntryCard`, `RideVerificationStatus`, `StopConfirmationControl`, `ProgressView state`, `ContentUnavailableView state`, `RetryView`, `PermissionEducationSheet`.

---

## 3. Detailed Component Architecture Specifications

### 3.1 Navigation Family

#### `AtlasTabItem`
- **Anatomy**: System tab bar item with SF Symbol icon and localized title (`Text("Discover")`).
- **SwiftUI Intent**: Standard `TabView` with `.tabItem { Label(...) }`.
- **VoiceOver**: "Discover, tab, 1 of 4".
- **Haptics**: `UISelectionFeedbackGenerator.selectionChanged()` on tab change.
- **Dynamic Type**: Scales smoothly; system adapts to accessibility sizes automatically.
- **Provisional vs Locked**: Locked HIG tab bar contract.

#### `AtlasNavigationTitle`
- **Anatomy**: Large title display in navigation bar with Odia cultural subtitle.
- **SwiftUI Intent**: `.navigationTitle("Discover")` with `.navigationBarTitleDisplayMode(.large)`.
- **System Material**: Translucent blurred material on scroll under nav bar.

#### `AtlasToolbarAction`
- **Anatomy**: Circular button with SF Symbol (`bookmark`, `line.3.horizontal.decrease.circle`).
- **Touch Target**: 44x44pt hit frame guarantee.

---

### 3.2 Discovery Family

#### `EditorialPlaceCard`
- **Anatomy**: Full-width publication card with continuous rounded corners (12pt), 16:9 verified photograph, dark scrim gradient, editorial title (New York serif), Odia script subtitle, district capsule, and truth badge.
- **SwiftUI Intent**: `VStack` embedded within `NavigationLink(value: place)`.
- **Content Rules**: Strictly verified authentic WebP photograph.
- **VoiceOver**: "Konark Sun Temple, Puri district. Verified official. Double tap to open."
- **Dynamic Type**: Reflows from horizontal pill row to vertical stack when Dynamic Type exceeds `accessibilityLarge`.
- **Motion**: Standard iOS interactive push transition or `.navigationTransition(.zoom)`.
- **Reduce Motion**: Instant cross-fade transition when `UIAccessibility.isReduceMotionEnabled` is true.
- **Liquid Glass Gate**: Visual border enhancement gated behind `#available(iOS 26, *)`.
- **Provisional vs Locked**: Locked HIG layout rules; provisional 12pt corner radius.

#### `CompactPlaceRow`
- **Anatomy**: Inset grouped cell with 56x56pt image, bold title, category label, and trailing disclosure indicator (`Image(systemName: "chevron.right")`).
- **SwiftUI Intent**: `HStack` within `List(style: .insetGrouped)`.

#### `DistrictFilter` / `CategoryFilter`
- **Anatomy**: Horizontal scrolling pill bar with `.buttonStyle(.borderedProminent)` when active and `.buttonStyle(.bordered)` when inactive.
- **Haptics**: Light impact feedback on selection.

#### `SearchField`
- **Anatomy**: Native search field embedded in navigation toolbar.
- **SwiftUI Intent**: `.searchable(text: $query, prompt: "Search temples, crafts, wildlife...")`.

---

### 3.3 Truth & Status Family

#### `IOSTruthBadge`
- **Anatomy**: Capsule with SF Symbol leading icon and bold caption label.
- **SwiftUI Intent**: `Label("Verified Official", systemImage: "checkmark.seal.fill").font(.caption.weight(.semibold))`.
- **States**: `VERIFIED` (.green), `SCHEDULED` (.orange), `LIVE` (.cyan), `ESTIMATED` (.secondary), `CANDIDATE` (.amber), `UNAVAILABLE` (.gray).
- **VoiceOver**: Explicit state reading: "Data confidence: Verified Official".
- **Haptics**: Medium impact on long-press to open provenance sheet.

#### `OfflineStatusBanner`
- **Anatomy**: Subtle top banner with `.thinMaterial` background and SF Symbol `wifi.slash`.
- **VoiceOver**: "Offline mode active. Using downloaded atlas."

#### `WeatherSummaryView`
- **Anatomy**: Inset card displaying live weather glyph, temperature, and Open-Meteo attribution.

---

### 3.4 Place Detail Family

#### `PlaceHeroMedia`
- **Anatomy**: Edge-to-edge photo gallery header with pagination dots and photographer credit overlay.
- **SwiftUI Intent**: `TabView(selection: $page) { ... }.tabViewStyle(.page)`.
- **VoiceOver**: Accessible image description with copyright attribution.

#### `PlaceIdentityHeader`
- **Anatomy**: Serif monument title, Odia script name, district tag, and verification badge.

#### `PlacePracticalInfo`
- **Anatomy**: Inset grouped section listing opening hours, entrance ticket rules, photography guidelines.
- **SwiftUI Intent**: `Section("Visiting Information") { LabeledContent(...) }`.

---

### 3.5 Map Family

#### `MapAnnotationView`
- **Anatomy**: Custom `Annotation` pin with category symbol and colored circle background.
- **SwiftUI Intent**: MapKit `Annotation(coordinate: ...) { ... }`.
- **Touch Target**: 44x44pt hit frame.

#### `SelectedMapEntitySheet`
- **Anatomy**: Native bottom sheet with detents `.presentationDetents([.fraction(0.35), .large])` and `.presentationDragIndicator(.visible)`.
- **VoiceOver**: Sheet title announced automatically on appearance.

---

### 3.6 Planning & Trips Families

#### `PlannerConstraintSection`
- **Anatomy**: Form sections with native `Picker` controls (`.pickerStyle(.segmented)`).

#### `ActiveTripHeader`
- **Anatomy**: Inset header with progress gauge (`ProgressView(value: current, total: total)`) and next milestone action.

#### `ActiveMilestoneCard`
- **Anatomy**: Prominent action card highlighting current destination with "Arrived" swipe action or button.
- **Haptics**: Heavy impact on milestone completion.

---

### 3.7 Transit Family

#### `RouteSummaryRow`
- **Anatomy**: Mo Bus route badge, origin/destination terminal labels, and next scheduled departure.
- **Content Rules**: Strict timetable indication; fares displayed strictly as "Fare information unavailable" (never raw null or invented payment methods).

#### `StopTimelineRow`
- **Anatomy**: Timeline node, stop name, candidate dashed outline if unverified, and scheduled time in `Font.caption.monospacedDigit()`.

#### `FirstMileLabel`
- **Anatomy**: Walking icon, distance in meters, and straight-line estimate disclaimer.

---

### 3.8 Essentials & Contribution Families

#### `EssentialServiceRow`
- **Anatomy**: Hospital/police facility name, phone number button with `Link("Call", destination: URL(string: "tel:...")!)`.
- **Touch Target**: 44x44pt minimum.

#### `ContributionEntryCard`
- **Anatomy**: Inset grouped form for community photo or stop verification submission with "Pending Review" status.

---

### 3.9 System State Family

#### `ProgressView state`
- **Anatomy**: Native Apple spinner with descriptive loading label.

#### `ContentUnavailableView state`
- **Anatomy**: iOS 17+ native `ContentUnavailableView(title, systemImage: ..., description: ...)`.

#### `RetryView`
- **Anatomy**: `ContentUnavailableView` configured with primary retry action button.

#### `PermissionEducationSheet`
- **Anatomy**: Modal sheet explaining transparent location use with clear "Continue" and "Skip" buttons.
