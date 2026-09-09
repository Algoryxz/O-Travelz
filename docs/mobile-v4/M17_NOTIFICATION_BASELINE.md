# M17 Notification Baseline: Local Transit Departure Countdown Notifications

## 1. Wave Scope
- **Wave**: M17 — Local Notifications, Scheduled Transit Reminders, Trip Milestones & Truthful Notification Semantics
- **Preceding Accepted Wave**: M16 (Authentication, Account Identity & Local-First Continuity)
- **Branch**: `feature/v4-platform-rebuild`

## 2. Core Implementation Deliverables
1. **Local-First Architecture**:
   - Zero remote push servers, zero FCM / APNs remote endpoints, zero marketing automation.
   - All departure alerts scheduled locally on-device.
2. **Android Native Implementation**:
   - `NotificationModels.kt`, `TransitReminderCalculator.kt`, `NotificationChannels.kt`, `ActiveReminderStore.kt`, `TransitReminderReceiver.kt`, `TransitReminderScheduler.kt`.
   - `POST_NOTIFICATIONS` contextual progressive disclosure prompt with educational pre-permission dialog.
   - Deep link intent filter on `MainActivity` for `otravelz://route/*`.
   - Comprehensive unit test suite in `NotificationProductModelTest.kt`.
3. **iOS Native Parity Implementation**:
   - `NotificationModels.swift`, `TransitReminderCalculator.swift`, `ActiveReminderStore.swift`, `NotificationScheduler.swift`.
   - `RouteDetailView` integration with contextual permission check.
   - Swift Testing suite in `NotificationDomainTests.swift`.
4. **Editorial & Truth Guarantees**:
   - Calendar arithmetic countdown only ("Scheduled departure in 15 min").
   - Prohibited terms strictly enforced (0 instances of "arriving", "nearby", "live", "approaching").
   - IST (`Asia/Kolkata`) canonical timezone arithmetic across all devices.
   - Past departures and elapsed reminder windows strictly rejected.
   - Zero background location, zero polling loops, zero foreground services.

## 3. Invariants Verified
- `NOTIFICATION_ARCHITECTURE_TRUTHFUL`: True
- `LOCAL_NOTIFICATION_BASELINE`: True
- `TRANSIT_REMINDER_SUPPORTED`: True
- `TRANSIT_LABELS_SCHEDULED_NOT_LIVE`: True
- `ARRIVAL_COUNTDOWN_CLAIMS`: 0
- `LIVE_BUS_CLAIMS`: 0
- `IST_SCHEDULING_CORRECT`: True
- `NOTIFICATION_PERMISSION_CONTEXTUAL`: True
- `NO_LAUNCH_PERMISSION_PROMPT`: True
- `ANDROID_PENDING_INTENT_SECURE`: True
- `IOS_NOTIFICATION_ROUTE_SAFE`: True
- `SIGNED_OUT_REMINDERS_SUPPORTED`: True
- `SIGNOUT_DOES_NOT_BREAK_LOCAL_REMINDERS`: True
- `OFFLINE_LOCAL_NOTIFICATION_SUPPORTED`: True
- `BACKGROUND_LOCATION`: False
- `MARKETING_NOTIFICATIONS`: 0
