# O-TRAVELZ Mobile V4 — Motion Direction & Interaction Physics

> **Authoritative Motion Specification**<br>
> Scope: **Platform-Native Physics for Android (Material 3) & iOS (SwiftUI Springs)**<br>
> Wave: `M2` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Core Motion Philosophy: Purposeful, Restrained, Informative

In O-TRAVELZ, motion is not entertainment or decorative flair. Motion serves exactly three functional purposes:
1. **Spatial Continuity**: Explaining where the traveler came from and where they are going.
2. **State Clarification**: Providing instant visual feedback on actions (saving a trip, marking a stop visited).
3. **Physical Ergonomics**: Harmonizing with physical thumb gestures on moving buses and walking trails.

> **The Ponytail Motion Rule**:
> If an animation does not clarify spatial relationship or confirm an action, **delete it**. Zero gratuitous looping animations. Zero decorative particles.

---

## 2. Android Native Motion System (Material 3 Expressive)

Android motion leverages official Jetpack Compose and Material 3 motion tokens, calibrated to ensure smooth 60fps execution on entry-level hardware (e.g., Vivo Y19 / Helio P65):

### 2.1 Predictive Back Gesture Continuity
- **Standard**: Follows Android 14+ Predictive Back gesture physics.
- **Behavior**: As the user swipes from the left or right edge, the current surface scales down slightly ($0.92\times$) and elevates, revealing the parent destination list underneath before committing the back navigation.
- **Spring Parameters**: `spring(dampingRatio = 0.85f, stiffness = Spring.StiffnessMediumLow)`.

### 2.2 Container Transform & Shared Axis
- **Card-to-Detail Expansion**: Tapping a cultural place card morphs the container bounds directly into the full-bleed Place Detail surface (`sharedBounds` in Compose Animation).
- **Duration**: Clamped between $250\text{ ms}$ and $320\text{ ms}$.
- **Tab Switching**: Uses horizontal Shared Axis ($X$-axis translation, $180\text{ ms}$) between adjacent tabs (Explore $\leftrightarrow$ Map $\leftrightarrow$ Plan $\leftrightarrow$ Transit $\leftrightarrow$ You).

### 2.3 Map Selection & Sheet Physics
- **Marker Tap**: Map camera smoothly animates to center the selected pin with an intentional bottom offset ($120\text{ dp}$).
- **Bottom Preview Sheet**: Slides up with `ModalBottomSheetDefaults.properties` using standard M3 decel interpolation (`FastOutSlowInEasing`, $200\text{ ms}$).

### 2.4 Active Trip Milestone Progress
- **Mark Visited**: When traveler marks a stop visited, the active checkmark icon triggers a single tactical scale bounce ($1.0 \rightarrow 1.2 \rightarrow 1.0$, $180\text{ ms}$), followed by an immediate upward slide of the timeline list ($250\text{ ms}$).

### 2.5 Shimmer / Skeleton Loading Policy
- **Policy**: Clean, subtle tonal pulse ($#161B22 \leftrightarrow #21262D$) at $1.2\text{ Hz}$. Never bright or distracting. Ceases immediately upon data resolution.

### 2.6 Low-End Device / Accessibility Motion Reduction
- When system `ANIMATOR_DURATION_SCALE == 0` or battery saver is active, all transitions collapse to an instantaneous $50\text{ ms}$ alpha crossfade.

---

## 3. iOS Native Motion System (SwiftUI Springs & Haptics)

iOS motion adheres strictly to Apple Human Interface Guidelines and SwiftUI declarative spring physics:

### 3.1 SwiftUI Sheet Physics & Presentation Detents
- **Sheet Physics**: Driven by `.interactiveSpring(response: 0.35, dampingFraction: 0.82, blendDuration: 0)`.
- **Presentation Detents**: Smooth rubber-band snapping between `.fraction(0.25)` (compact preview), `.fraction(0.6)` (mid inspection), and `.large` (full detail).
- **Dismissal**: Follows finger velocity; flicking down dismisses the sheet instantaneously with natural inertia.

### 3.2 NavigationStack Push & Matched Geometry
- **Hierarchy Transitions**: Default SwiftUI `NavigationStack` horizontal slide with interactive swipe-to-pop from the leading edge.
- **Matched Geometry**: Used sparingly and strictly for the hero destination photo thumbnail expanding into the header image. Never applied to complex multi-element lists to prevent layout hitches.

### 3.3 MapKit Selection & Camera Pitch
- **Annotation Tap**: Map camera executes a smooth pitch and heading rotation with `.easeOut(duration: 0.35)` to focus on the selected cultural monument.

### 3.4 Tactile Haptic Integration
- **Haptic Feedback**:
  - `UIImpactFeedbackGenerator(style: .light)` on bottom tab tap and filter chip selection.
  - `UIImpactFeedbackGenerator(style: .medium)` on "Save Bookmark" toggle.
  - `UINotificationFeedbackGenerator().notificationOccurred(.success)` on completing an active trip milestone.

### 3.5 Liquid Glass Transitions (Progressive Enhancement)
- **Supported Devices (iOS 26+)**: Native `.glassEffect()` controls smoothly morph and increase specular opacity when interacting with touch down states.
- **Baseline Devices (iOS 17+)**: Native `.ultraThinMaterial` maintains static blur with standard system opacity changes ($1.0 \rightarrow 0.8$). Zero custom shader hacks.

### 3.6 Reduce Motion Compliance
- If `UIAccessibility.isReduceMotionEnabled` is `true`, all sheets, push transitions, and expansion springs instantaneously convert to simple, non-spatial crossfades (`.opacity`).

---

## 4. Cross-Platform Motion Comparison Summary

| Interaction Point | Android Native Implementation | iOS Native Implementation |
|---|---|---|
| **Root Tab Switch** | Shared Axis X ($180\text{ ms}$, fade-through) | Instantaneous TabView switch with native crossfade |
| **Card to Detail** | Compose Container Transform ($280\text{ ms}$) | NavigationStack push or matched photo frame |
| **Map Preview Sheet** | M3 ModalBottomSheet slide ($200\text{ ms}$) | SwiftUI .sheet with interactiveSpring ($350\text{ ms}$) |
| **Milestone Completed** | Checkmark scale bounce + haptic tick | Success notification haptic + list reorder animation |
| **Back Navigation** | Predictive Back (scale down + reveal) | Interactive edge swipe-to-pop |
| **Motion Accessibility** | Respects system animator duration scale | Respects `UIAccessibility.isReduceMotionEnabled` |
