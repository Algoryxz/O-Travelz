# M17 Notification Domain Model: Schema, Payloads & Truth Classes

## 1. Domain Entities

```kotlin
/**
 * Canonical notification intent representation.
 */
data class NotificationIntent(
    val notificationId: String,          // Deterministic unique ID (e.g. "rem_tr_route10_0830_15m")
    val type: NotificationType,          // TRANSIT_DEPARTURE, TRIP_START, TRIP_MILESTONE
    val title: String,                  // e.g. "Route 10 — Scheduled departure in 15 min"
    val body: String,                   // e.g. "08:30 IST from Master Canteen. Check operator before travel."
    val scheduledAtEpochMs: Long,       // Exact epoch millisecond timestamp for trigger
    val relatedEntityId: String,        // Route ID or Trip ID
    val deepLinkUri: String,            // "otravelz://route/{routeId}"
    val truthClass: TruthClass          // SCHEDULED, PLANNED, USER_REMINDER
)

enum class NotificationType {
    TRANSIT_DEPARTURE,
    TRIP_START,
    TRIP_MILESTONE
}

enum class TruthClass {
    SCHEDULED,      // Derived from static published timetables
    PLANNED,        // User-planned itinerary milestone
    USER_REMINDER   // Explicit user-configured alert
}
```

## 2. Notification ID Generation Strategy
Deterministic ID format:
- `rem_tr_{routeId}_{cleanDepartureTime}_{offsetMinutes}m`
- Example: For Route `mo_bus_10`, departure `08:30`, 15-minute reminder:
  `rem_tr_mo_bus_10_0830_15m`

This guarantees:
1. Re-tapping the same departure with the same offset updates/cancels the identical notification request rather than creating duplicates.
2. Direct cancellation by route ID and departure time.

## 3. Platform Parity
- **Android**: Scheduled via `AlarmManager` with standard `setAndAllowWhileIdle` (or `setExactAndAllowWhileIdle` where permitted) broadcasting to an internal explicit `TransitReminderReceiver`.
- **iOS**: Scheduled via `UNCalendarNotificationTrigger` or `UNTimeIntervalNotificationTrigger` with `UNNotificationRequest`.
