# O-TRAVELZ Mobile V4 — Android Component Architecture Specification

> **Authoritative Native Android Component Architecture (Material 3 Expressive Editorial)**<br>
> Scope: **Jetpack Compose Native Components, Slot Structures, and Window Size Class Behaviors**<br>
> Governance: **Zero Shared UI Code; Pure Android M3 Expressive Implementation**<br>
> Wave: `M3` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Architectural Philosophy: Material 3 Expressive Editorial

The Android component system for O-TRAVELZ Mobile V4 adheres strictly to **Material 3 Expressive** guidelines combined with the cultural restraint of the *Modern Odisha Cultural Atlas*:
- **No generic wrappers**: Built natively with Jetpack Compose standard slot APIs (`content: @Composable () -> Unit`).
- **Edge-to-Edge native**: All components consume `WindowInsets` (`safeDrawing`, `systemBars`, `ime`) rather than applying manual hardcoded padding.
- **Adaptive by design**: Components adapt across `WindowWidthSizeClass` (`Compact` <600dp, `Medium` 600–839dp, `Expanded` ≥840dp).
- **Zero Vibe Code**: No synthetic elevation blurs, purple gradients, or fake vehicle positions.

---

## 2. Component Taxonomy & Inventory

The Android component inventory comprises 10 functional families encompassing 44 native components:

1. **Navigation**: `AtlasNavigationBar`, `AtlasNavigationRail`, `RootDestinationItem`.
2. **Discovery**: `AtlasPlaceCard`, `CompactPlaceRow`, `DistrictFilterChip`, `CategoryFilterChip`, `SearchField`, `CuratedCollectionHeader`.
3. **Truth & Status**: `AndroidTruthBadge`, `OfflineBanner`, `WeatherStateCard`, `DataUnavailableCard`.
4. **Place Detail**: `PlaceHeroMedia`, `PlaceIdentityBlock`, `PlacePracticalInfo`, `PlaceTruthSection`, `NearbyPlacesSection`.
5. **Map**: `MapAnnotation`, `SelectedMapEntitySheet`, `MapLayerControl`, `LocationStateIndicator`.
6. **Planning**: `PlannerConstraintGroup`, `DurationSelector`, `PaceSelector`, `TransportPreferenceSelector`, `NaturalLanguageRefinement`, `ItineraryDayCard`, `JourneyLegRow`.
7. **Trips**: `ActiveTripHeader`, `TripTimeline`, `ActiveMilestoneCard`, `CompletedMilestoneRow`, `SkippedMilestoneRow`.
8. **Transit**: `RouteSummaryRow`, `StopTimelineRow`, `ScheduledDepartureRow`, `FirstMileChip`, `CandidateStopDisclosure`, `RouteGeometryDisclosure`.
9. **Essentials**: `EssentialServiceRow`, `EmergencyShortcut`.
10. **Contribution & System**: `ContributionEntryCard`, `RideVerificationStatus`, `StopConfirmationControl`, `LoadingSkeleton`, `EmptyContentState`, `RetryState`, `PermissionEducationSheet`.

---

## 3. Detailed Component Architecture Specifications

### 3.1 Navigation Family

#### `AtlasNavigationBar`
- **Anatomy**: Fixed bottom bar container wrapping 4 root destinations (`Discover`, `Map`, `Trips`, `You`).
- **M3 States**: `DEFAULT`, `SCRIMMED_SCROLLING`.
- **Slot Structure**: `windowInsets: WindowInsets`, `content: @Composable RowScope.() -> Unit`.
- **Touch Behavior**: Standard M3 ripple on destination item tap; 48dp minimum accessible height.
- **Motion Behavior**: Smooth icon pill indicator transition with `sharedAxisX` navigation transition.
- **TalkBack Semantics**: `Modifier.semantics { role = Role.Tab }` with selected state announcement.
- **Font Scale Behavior**: Text labels hide automatically at font scale >1.3x in compact mode to prevent overlap; full title exposed via long-press tooltip.
- **Adaptive Adaptation**: Rendered in `Compact` mode; swapped for `AtlasNavigationRail` in `Medium` and `Expanded` modes.
- **Edge-to-Edge**: Automatically consumes `WindowInsets.navigationBars`.
- **Predictive Back**: N/A (root destination bar).
- **Provisional vs Locked**: Locked M3 container structure; provisional bar height (80dp).

#### `AtlasNavigationRail`
- **Anatomy**: Vertical rail pinned to start edge for foldable/tablet screens.
- **M3 States**: `DEFAULT`, `EXPANDED_HEADER`.
- **Slot Structure**: `header: @Composable () -> Unit`, `content: @Composable ColumnScope.() -> Unit`.
- **Adaptive Adaptation**: Activates in `Medium` and `Expanded` window size classes (width ≥600dp).
- **Edge-to-Edge**: Consumes `WindowInsets.displayCutout` and `WindowInsets.statusBars`.
- **Provisional vs Locked**: Locked slot contract; provisional 72dp rail width.

#### `RootDestinationItem`
- **Anatomy**: Icon with pill indicator container and label typography (`labelMedium`).
- **M3 States**: `UNSELECTED`, `SELECTED`, `PRESSED`, `FOCUSED`.
- **Slot Structure**: `icon: @Composable () -> Unit`, `label: @Composable () -> Unit`.
- **TalkBack Semantics**: "Discover, tab, 1 of 4, selected".

---

### 3.2 Discovery Family

#### `AtlasPlaceCard`
- **Anatomy**: 16:9 verified hero image container, sandstone accent overlay, destination title (Odia + English), district tag, verification badge slot, and bookmark toggle slot.
- **M3 States**: `DEFAULT`, `HOVERED` (chromebook), `FOCUSED`, `PRESSED`.
- **Content Rules**: Strict enforcement: destination MUST have verified authentic photo. No AI-generated stock photography.
- **Slot Structure**: `imageSlot: @Composable () -> Unit`, `badgeSlot: @Composable () -> Unit`, `actionSlot: @Composable () -> Unit`.
- **Touch Behavior**: Tap opens Place Detail; long-press triggers quick-action contextual bottom sheet. Minimum touch target 48x48dp on action buttons.
- **Motion Behavior**: Material 3 Container Transform into Place Detail surface (`sharedBounds`).
- **TalkBack Semantics**: "Place card: Konark Sun Temple, Puri district. Verified official. Double tap to view details."
- **Font Scale Behavior**: Title wraps up to 3 lines before truncating; layout expands vertically without clipping.
- **Adaptive Adaptation**: 1 column on `Compact` phone; 2 columns on `Medium` tablet; 3 columns staggered on `Expanded` desktop.
- **Edge-to-Edge**: Inner padding respects screen edge margins (16dp `space.4`).
- **Predictive Back**: Smoothly shrinks back to card origin on predictive back swipe.
- **Provisional vs Locked**: Locked M3 slot structure; provisional 16dp corner radius.

#### `CompactPlaceRow`
- **Anatomy**: 64x64dp square verified thumbnail, two-line title/category typography, right-aligned distance pill.
- **M3 States**: `DEFAULT`, `SELECTED`, `DISABLED`.
- **TalkBack Semantics**: Single focus group reading title, district, and distance.

#### `DistrictFilterChip` / `CategoryFilterChip`
- **Anatomy**: FilterChip with leading check icon, label, and sandstone outline.
- **M3 States**: `UNSELECTED`, `SELECTED`, `PRESSED`.
- **Slot Structure**: `selected: Boolean`, `onClick: () -> Unit`, `label: @Composable () -> Unit`.
- **Touch Behavior**: Instant selection toggle; haptic feedback click.
- **TalkBack Semantics**: Role: Checkbox.

#### `SearchField`
- **Anatomy**: Full-width M3 SearchBar with leading search icon, clear button, and voice input shortcut.
- **M3 States**: `RESTING_BAR`, `ACTIVE_FULLSCREEN`.
- **Edge-to-Edge**: Handles `WindowInsets.ime` padding smoothly on keyboard raise.

---

### 3.3 Truth & Status Family

#### `AndroidTruthBadge`
- **Anatomy**: Compact tonal pill with leading vector status glyph and high-contrast label (`labelSmall`).
- **M3 States**: `VERIFIED`, `SCHEDULED`, `LIVE`, `ESTIMATED`, `CANDIDATE`, `UNAVAILABLE`.
- **Content Rules**: Never display "Live" for transit bus departures.
- **Slot Structure**: `icon: @Composable () -> Unit`, `label: @Composable () -> Unit`.
- **Touch Behavior**: Tap opens Truth Verification Sheet explaining data provenance.
- **TalkBack Semantics**: Clear announcement of verification confidence tier.
- **Provisional vs Locked**: Locked semantic states; provisional 8dp corner radius.

#### `OfflineBanner`
- **Anatomy**: Non-intrusive top banner with offline cloud icon and offline tier explanation.
- **M3 States**: `SHOWN`, `DISMISSED`.
- **Content Rules**: Explicitly lists disabled features (AI, live weather).
- **TalkBack Semantics**: Announced via polite live region upon network transition.

#### `WeatherStateCard`
- **Anatomy**: Card container showing temperature, condition glyph, and Open-Meteo attribution.
- **M3 States**: `LIVE_FETCHED`, `CACHED_STALE`, `UNAVAILABLE`.
- **Content Rules**: Stale readings must display "Cached at [HH:MM] IST".

---

### 3.4 Place Detail Family

#### `PlaceHeroMedia`
- **Anatomy**: Edge-to-edge media pager supporting authentic verified photography, photographer attribution pill, and optional verified 3D viewer launch button.
- **M3 States**: `IMAGE_LOADED`, `BLURHASH_PLACEHOLDER`, `OFFLINE_CACHED`.
- **Edge-to-Edge**: Extends under status bar with scrim gradient overlay.

#### `PlaceIdentityBlock`
- **Anatomy**: High-contrast display title (English + Odia script), district breadcrumb, and heritage category badge.
- **Font Scale Behavior**: Handles 2.0x font scaling without horizontal clipping.

#### `PlacePracticalInfo`
- **Anatomy**: Grid of verified practical facts: visiting hours, entry fee (or Free), photography rules, and dress code.
- **Content Rules**: All hours verified against monument administrative rules.

#### `PlaceTruthSection`
- **Anatomy**: Transparent provenance breakdown showing survey date, surveying agency, and photo license.

---

### 3.5 Map Family

#### `MapAnnotation`
- **Anatomy**: Custom vector pin with category glyph and verification colored halo.
- **M3 States**: `DEFAULT`, `SELECTED`, `CLUSTERED`.
- **Touch Behavior**: 48x48dp touch target hit zone.

#### `SelectedMapEntitySheet`
- **Anatomy**: `ModalBottomSheet` with peek (180dp), half (50%), and expanded (90%) detents displaying place summary, route details, and first-mile walking guidance.
- **Predictive Back**: Predictive back scales and dismisses sheet to peek state.

---

### 3.6 Planning & Trips Families

#### `PlannerConstraintGroup`
- **Anatomy**: Grouped selection controls for duration (half-day, 1-day, 3-day), travel pace (relaxed, moderate, intensive), and transport preference (Mo Bus transit, private auto/taxi).

#### `ActiveTripHeader` & `TripTimeline`
- **Anatomy**: Sticky trip progress bar showing completed/total milestones, current milestone hero card, and vertical timeline connecting upcoming stops.

#### `ActiveMilestoneCard`
- **Anatomy**: High-visibility card highlighting next action: destination arrival, bus board/alight, or lunch break. Action buttons: "Arrived / Done", "Skip", "Navigate".

---

### 3.7 Transit Family

#### `RouteSummaryRow`
- **Anatomy**: Route badge (e.g., "Mo Bus 10"), terminal points ("Biju Patnaik Airport $\leftrightarrow$ Nandankanan"), frequency interval, and scheduled departure indicator.
- **Content Rules**: Fares displayed as `null` or "Pay on Bus". No live arrival countdowns.

#### `StopTimelineRow`
- **Anatomy**: Vertical transit line node, stop name (English + Odia), candidate indicator if unverified, and scheduled departure time.

#### `FirstMileChip`
- **Anatomy**: Compact chip displaying walking distance in meters and distance band label (`WALKABLE` <500m, `INTERMEDIATE` 500-1200m, `EXTENDED` >1200m).

---

### 3.8 Essentials & Contribution Families

#### `EssentialServiceRow`
- **Anatomy**: Facility name, category tag (Hospital, Police, Women Safety), distance, and direct dial action button (`ACTION_DIAL` Intent).

#### `ContributionEntryCard`
- **Anatomy**: Card allowing travelers to submit missing stop photos or report closed facilities; clearly indicates "Pending Community Review".

---

### 3.9 System State Family

#### `LoadingSkeleton`
- **Anatomy**: Subdued shimmer surface containers matching card layouts without jarring spinners.

#### `EmptyContentState`
- **Anatomy**: Centered icon, honest explanation of zero results, and primary filter clear action.

#### `RetryState`
- **Anatomy**: Actionable error view with retry button and fallback to offline cached data.

#### `PermissionEducationSheet`
- **Anatomy**: Pre-permission bottom sheet explaining transparent utility before requesting OS location.
