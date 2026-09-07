# O-TRAVELZ Mobile V4 ? Haptic Feedback Acceptance Specification

> **Authoritative Multiplatform Haptic Specification**<br>
> Scope: **Wave M4 Design Acceptance Freeze**<br>
> Governance: **Tactile Confirmation; Zero Gratuitous Buzzing**<br>
> Version: `4.0.0` | Status: `FROZEN_SPECIFIED` | Date: `2026-09-07`

---

## 1. Core Haptic Principles

Haptics in O-TRAVELZ Mobile V4 provide discrete physical confirmation of critical traveler interactions. They ground digital actions in reality.

### Anti-Vibe-Code Haptic Rules:
- **NO Scrolling Haptics**: Never trigger haptic ticks while scrolling lists, feeds, or maps.
- **NO Decorative Vibration**: Never buzz during passive reading, image viewing, or animation loops.
- **NO Typing Haptics**: Never override system keyboard haptic preferences during search or prompt input.

---

## 2. Semantic Haptic Events

All tactile feedback is strictly defined via semantic events:

| Semantic Event | Android Mapping | iOS Mapping | Trigger & Context |
|---|---|---|---|
| `HAPTIC_SELECTION` | `HapticFeedbackConstants.CLOCK_TICK` | `UIImpactFeedbackGenerator(.light)` | Tapping category filter chip, segmented button, or tab. |
| `HAPTIC_CONFIRMATION` | `HapticFeedbackConstants.CONFIRM` | `UINotificationFeedbackGenerator(.success)` | Saving a destination, bookmarking an itinerary, completing download. |
| `HAPTIC_WARNING` | `HapticFeedbackConstants.REJECT` | `UINotificationFeedbackGenerator(.warning)` | Selecting a candidate transit stop, route unmapped warning, offline drop. |
| `HAPTIC_TRIP_MILESTONE` | `HapticFeedbackConstants.LONG_PRESS` | `UIImpactFeedbackGenerator(.heavy)` | Manually marking an Active Trip milestone as completed. |
| `HAPTIC_RIDE_START` | `HapticFeedbackConstants.GESTURE_START` | `UIImpactFeedbackGenerator(.medium)` | Traveler taps "Start Journey / Active Navigation". |
| `HAPTIC_RIDE_STOP` | `HapticFeedbackConstants.GESTURE_END` | `UINotificationFeedbackGenerator(.success)` | Traveler taps "Complete Trip". |

---

## 3. Platform Parity & Graceful Degradation

- **Android Reference Device (Vivo Y19 / Android 12)**: Standard eccentric rotating mass (ERM) motor. Haptic calls gracefully degrade to standard vibration duration without throwing or blocking UI thread.
- **Pixel / Haptic Actuator**: Linear resonant actuator (LRA) provides crisp, localized clicks.
- **iOS (Taptic Engine)**: Standard iOS feedback generators used with prepared state for low-latency firing.