# O-TRAVELZ Mobile V4 — Interaction & Motion Specification

> **Authoritative Specification for Dual-Native Motion Choreography and Transitions**<br>
> Scope: **Interaction Choreography, Back Behavior, Reduced Motion, Haptics, and Platform Divergence**<br>
> Governance: **Zero Premature Milliseconds; Native Platform Transition Engines (M3 vs SwiftUI)**<br>
> Wave: `M3` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Architectural Philosophy: Native Motion Choreography

Motion in O-TRAVELZ Mobile V4 reinforces orientation, physical reality, and cultural dignity:
- **No artificial delays**: Animations are functional spatial bridges, never decorative pauses.
- **Platform transition primitives**: Android uses **Material 3 Expressive motion** (Shared Axis, Container Transform, Predictive Back). iOS uses **SwiftUI interactive springs** (`response: 0.35s, dampingFraction: 0.82`) and native `NavigationStack` push/pop.
- **Accessibility & Reduced Motion**: When `Reduce Motion` is active on either platform, all spatial transitions collapse to instantaneous (or 50ms) opacity cross-fades.
- **Tactile feedback**: Meaningful haptic impulses confirm milestone completion, bookmark saving, and mode transitions; decorative rumble is prohibited.

---

## 2. Interaction Specifications (21 Critical Interactions)

### 1. `Open Place Detail`
- **trigger**: Tap on `AtlasPlaceCard` (Android) or `EditorialPlaceCard` (iOS).
- **initial_state**: Resting card in Discover feed or search list.
- **transition**:
  - Android: Container Transform (`Modifier.sharedBounds`) expanding card boundaries into full-screen `PlaceDetail` surface.
  - iOS: SwiftUI `.navigationTransition(.zoom)` or standard `NavigationStack` push with matched geometry.
- **intermediate_state**: Card bounds expand while photo scales smoothly to hero container aspect ratio.
- **final_state**: `PlaceDetail` surface fully mounted; status bar adapts to photo scrim.
- **cancel_behavior**: Releasing tap before threshold cancels ripple/highlight without navigating.
- **back_behavior**: Edge swipe back or back button collapses surface smoothly to source card.
- **accessibility_behavior**: Focus lands on `PlaceIdentityBlock` (monument title).
- **reduced_motion_behavior**: Direct cross-fade (0ms transform, 50ms fade).
- **haptic_semantic_event**: `impactLight` on tap.
- **platform_divergence**: Android supports Predictive Back preview; iOS supports interactive edge-swipe gesture with rubber-banding.

---

### 2. `Close Place Detail`
- **trigger**: Tap back button in TopAppBar / NavigationToolbar or swipe back.
- **initial_state**: Full-screen `PlaceDetail`.
- **transition**: Reverse container transform back to card position in scroll hierarchy.
- **final_state**: Discover feed restored at identical scroll position.
- **accessibility_behavior**: Focus restored to originating card.
- **haptic_semantic_event**: None.

---

### 3. `Save Place`
- **trigger**: Tap bookmark icon button on card or detail screen.
- **initial_state**: `SavedStateIndicator` in `UNSAVED` state (outlined bookmark).
- **transition**: Icon bounce / scale pulse (1.0 $\rightarrow$ 1.25 $\rightarrow$ 1.0).
- **intermediate_state**: Bookmark fills with sandstone accent.
- **final_state**: `SAVED_LOCAL` state; toast or snackbar confirms: "Saved to local collection".
- **cancel_behavior**: N/A (atomic toggle).
- **back_behavior**: State persists across navigation.
- **accessibility_behavior**: State announcement: "Saved to collection".
- **haptic_semantic_event**: `impactMedium` (Android) / `UINotificationFeedbackGenerator(.success)` (iOS).

---

### 4. `Filter Places`
- **trigger**: Tap on `DistrictFilterChip` or `CategoryFilterChip`.
- **initial_state**: Chip unselected; list showing all places.
- **transition**: Chip container morphs to sandstone-filled state; list content fades out (100ms) and fades in with filtered subset (150ms).
- **final_state**: Filtered list displayed with updated count.
- **accessibility_behavior**: TalkBack/VoiceOver announces: "Filtered: [count] places found in [District]".
- **haptic_semantic_event**: `selectionChanged`.

---

### 5. `Switch Root Tabs`
- **trigger**: Tap on destination item in `AtlasNavigationBar` or `TabView`.
- **initial_state**: Originating tab active.
- **transition**:
  - Android: `sharedAxisX` horizontal slide (180ms provisional).
  - iOS: Instant native `TabView` page swap without cross-fade.
- **final_state**: New tab root displayed with preserved back-stack state.
- **haptic_semantic_event**: `selectionChanged`.

---

### 6. `Select Map Marker`
- **trigger**: Tap on map vector pin (`MapAnnotation`).
- **initial_state**: Resting pin; bottom sheet dismissed or in collapsed mini-peek.
- **transition**: Pin scales up 1.2x with sandstone glow; bottom sheet animates to 280dp / `.fraction(0.35)` peek detent.
- **final_state**: Selected entity details displayed; map camera centers pin above sheet margin.
- **cancel_behavior**: Tapping empty map area deselects pin and dismisses sheet.
- **accessibility_behavior**: Focus shifts to sheet title; TalkBack reads name, category, and first-mile walking distance.
- **haptic_semantic_event**: `impactLight`.

---

### 7. `Expand Map Sheet`
- **trigger**: Drag bottom sheet upward or tap sheet header.
- **initial_state**: 280dp / `.fraction(0.35)` peek detent.
- **transition**: Interactive drag with vertical spring physics.
- **intermediate_state**: Sheet tracks finger 1:1; map content dims slightly behind scrim.
- **final_state**: Expanded detent (90% screen height) showing full practical info, transit connections, and route stops.
- **cancel_behavior**: Releasing below snap threshold snaps back to peek detent.
- **reduced_motion_behavior**: Instant snap without inertia bounce.
- **haptic_semantic_event**: Light tick on passing detent threshold.

---

### 8. `Create Itinerary`
- **trigger**: Tap "Generate Itinerary" button in Plan Input.
- **initial_state**: Plan Input form filled.
- **transition**: Button displays subtle indeterminate shimmer; content cross-fades into deterministic timeline builder.
- **final_state**: `ItineraryResult` screen rendered with day chapters and transit legs.
- **accessibility_behavior**: Announces "Itinerary created for [N] days".
- **haptic_semantic_event**: `notificationSuccess`.

---

### 9. `Modify Itinerary`
- **trigger**: Drag milestone handle or tap "Remove Leg".
- **transition**: Sibling milestones shift vertically using layout reordering animations.
- **final_state**: Updated itinerary with recalculated timings.

---

### 10. `Save Itinerary`
- **trigger**: Tap "Save to My Trips".
- **final_state**: Itinerary written to local SQLite `Trips` table; persistent offline availability confirmed.
- **haptic_semantic_event**: `notificationSuccess`.

---

### 11. `Start Trip`
- **trigger**: Tap "Start Active Trip" button on saved itinerary.
- **transition**: Full-screen transition into `ActiveTrip` mode; persistent notification or Live Activity initialized.
- **final_state**: Active milestone card pinned to top; guidance mode active.

---

### 12. `Complete Milestone`
- **trigger**: Tap "Mark Arrived / Visited" on `ActiveMilestoneCard`.
- **initial_state**: Current milestone in `ACTIVE` state.
- **transition**: Milestone card slides right or checks off with green ripple; next milestone scrolls smoothly into focus.
- **final_state**: Milestone moved to `CompletedMilestoneRow`; progress bar increments.
- **accessibility_behavior**: "Milestone completed: [Place Name]. Next stop: [Next Name]."
- **haptic_semantic_event**: Heavy confirmation impact (`impactHeavy` / `notificationSuccess`).

---

### 13. `Skip Milestone`
- **trigger**: Tap "Skip" on `ActiveMilestoneCard`.
- **transition**: Card slides down into `SkippedMilestoneRow` with muted gray strikethrough.
- **haptic_semantic_event**: `selectionChanged`.

---

### 14. `Open Transit Route`
- **trigger**: Tap on `RouteSummaryRow`.
- **transition**: Pushes `TransitRouteDetail` with map polyline and stop sequence.

---

### 15. `Select Transit Stop`
- **trigger**: Tap on `StopTimelineRow`.
- **transition**: Highlights stop node; shows stop truth tier disclosure card.

---

### 16. `Open First-Mile Explanation`
- **trigger**: Tap on `FirstMileChip` / `FirstMileLabel`.
- **transition**: Opens modal explanation sheet explaining whether distance is Haversine straight-line or surveyed pedestrian walking path.

---

### 17. `Enter Offline State`
- **trigger**: Device network connectivity drops.
- **initial_state**: Online status.
- **transition**: `OfflineStateBanner` slides down smoothly from top navigation bar (200ms).
- **final_state**: UI indicates offline mode; live weather and AI inputs transition to cached/deterministic fallbacks.
- **accessibility_behavior**: Polite announcement: "Offline mode. Using on-device atlas."
- **haptic_semantic_event**: `notificationWarning`.

---

### 18. `Retry Backend Call`
- **trigger**: Tap "Retry" on `RetryState` or `ContentUnavailableView`.
- **transition**: Retry button shows spinner for max 3000ms; if successful, content fades in; if failed, shakes horizontally and shows error.

---

### 19. `Location Permission Denied`
- **trigger**: Traveler selects "Don't Allow" on system location dialog.
- **transition**: Map smoothly reverts to Odisha district center; location pin hidden; district selector pill appears.
- **final_state**: App functions 100% normally in manual exploration mode with zero nag dialogs.

---

### 20. `Contribution Submit`
- **trigger**: Tap "Submit Verification" for a stop photo or correction.
- **final_state**: Written to local Outbox table; card changes to "Pending Community Review".
- **haptic_semantic_event**: `notificationSuccess`.

---

### 21. `Ride Verification Start / Stop`
- **trigger**: Tap "Record Ride Trace" on transit route.
- **transition**: Prominent green recording dot pulses gently in status bar.
- **final_state**: Local GPS trace recorded to device sandbox; stop confirms stored locally.
- **haptic_semantic_event**: Distinct start/stop double tick.
