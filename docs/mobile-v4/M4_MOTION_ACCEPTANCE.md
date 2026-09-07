# O-TRAVELZ Mobile V4 ? Motion & Micro-Interaction Design Acceptance

> **Authoritative Multiplatform Motion Specification & Acceptance Report**<br>
> Scope: **Wave M4 Design Acceptance Freeze**<br>
> Governance: **Restrained Editorial Physics; Zero Gratuitous GPU-Draining Animation**<br>
> Version: `4.0.0` | Status: `FROZEN_SPECIFIED` | Date: `2026-09-07`

---

## 1. Core Motion Philosophy

O-TRAVELZ Mobile V4 adheres to an **editorial atlas** motion philosophy. Transitions serve to maintain spatial orientation and communicate deterministic truth states, never to entertain or mask slow artificial loaders.

### Anti-Vibe-Code Motion Rules:
- **NO Continuous Glow**: Zero pulsating glow effects or breathing neon outlines.
- **NO Parallax Wallpaper**: Zero background image drifting that burns mobile batteries.
- **NO Fake Bus Animations**: Buses NEVER move smoothly along routes unless real vehicle telemetry is connected.
- **NO GPU Blurring Loops**: Blur is restricted to native iOS materials and Android surface scrims.

---

## 2. Semantic Timing & Physics Tokens

Motion durations and easing curves are classified semantically to permit platform-native runtime mapping:

| Semantic Class | Duration Band | Android Mapping (Compose) | iOS Mapping (SwiftUI) | Intent & Usage |
|---|---|---|---|---|
| **IMMEDIATE** | `0ms ? 100ms` | `snap()` / `tween(80, LinearEasing)` | `.snappy(duration: 0.1)` | Chip selection, toggle state, active tab indication. |
| **FAST** | `150ms ? 200ms` | `tween(180, FastOutSlowInEasing)` | `.easeOut(duration: 0.18)` | Tooltip reveal, badge state change, micro-expansions. |
| **STANDARD** | `250ms ? 350ms` | `spring(dampingRatio: 0.85f, stiffness: 400f)` | `.spring(response: 0.32, dampingFraction: 0.86)` | Card container transform, bottom sheet expansion, screen push. |
| **EMPHASIZED** | `400ms ? 600ms` | `spring(dampingRatio: 0.8f, stiffness: 300f)` | `.spring(response: 0.45, dampingFraction: 0.82)` | Fullscreen modal presentation, complex itinerary card reveal. |
| **INTERACTIVE_GESTURE** | `1:1 Velocity Driven` | `AnchoredDraggable` / `pointerInput` | `.interactiveSpring()` | Detent sheet dragging, predictive back gesture, dismiss swipe. |

---

## 3. Surface & Interaction Motion Audit

### 3.1 Tab Switching
- **Behavior**: Instantaneous view swap accompanied by subtle 120ms crossfade of top app bar title and action icons.
- **Android**: `NavigationBar` indicator pill scales horizontally (`1.0` -> `1.15` -> `1.0`) over 200ms.
- **iOS**: Native `TabView` haptic selection; zero synthetic sliding between tab roots.

### 3.2 Card Opening (Place Detail / Itinerary Milestone)
- **Android**: M3 Container Transform. The hero card expands seamlessly from the feed into the fullscreen detail canvas with shared boundary clipping.
- **iOS**: Interactive sheet presentation. Sheet expands from `.medium` detent (45% height) to `.large` (92% height) using native Apple spring physics.

### 3.3 Sheet Expansion & Map Inspection
- **Physics**: Zero overshoot bouncing that obscures map pins.
- **Snapping**: Snaps decisively to `.medium` (shows place name, photo, and quick route action) and `.large` (shows full cultural essay, opening hours, and transit timetable).

### 3.4 Active Trip Milestone Completion
- **Feedback**: Milestone card checkbox triggers immediate checkmark fill (`80ms`), accompanied by `HAPTIC_TRIP_MILESTONE`. The completed milestone gently collapses into a 48dp summary row over `250ms`, revealing the next upcoming milestone.

### 3.5 Offline Banner Appearance
- **Trigger**: Network connection drop.
- **Transition**: Slides down smoothly from behind the top app bar over `220ms` (`FAST`), pushing content down slightly without layout jank. When connection returns, banner dissolves out over `150ms`.

---

## 4. Reduced Motion & Accessibility Fallback

Both platforms must honor the user system preference for **Reduce Motion**:
- **Behavior**: All spatial transforms (zooms, container expansions, slide-ins) are disabled.
- **Replacement**: Clean opacity crossfades (`150ms`) or instantaneous cut swaps.
- **Sheet Dismissal**: Drag gestures continue to track finger 1:1, but release snaps instantly without bouncy spring oscillation.