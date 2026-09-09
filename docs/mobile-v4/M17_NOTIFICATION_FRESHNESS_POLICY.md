# M17 Notification Freshness Policy: Stale Schedule Semantics & Disclaimers

## 1. Truth Boundary
Timetable schedules published by CRUT (Mo Bus / Ama Bus) represent scheduled operations. They are not telemetry.

## 2. Notification Copy Requirements
Every transit departure reminder payload must:
1. Include the explicit word **"Scheduled"** in the title or first sentence.
2. Include the scheduled time formatted with **"IST"** (e.g. `08:30 IST`).
3. Include the operational advisory: **"Check operator information before travel"** in the body or secondary line.

## 3. Stale Timetable Degradation
- If a route's effective date is older than 90 days, the reminder text adds: *"Static timetable notice: Confirm live timings with CRUT."*
- If a schedule is marked suspended or has zero departures: The *"Remind me"* action is disabled in the UI.
- No algorithmic guessing or speculative departure adjustments are permitted.
