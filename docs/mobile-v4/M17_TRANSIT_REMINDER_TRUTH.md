# M17 Transit Reminder Truth: IST Timezone Arithmetic & Rejection of Past Departures

## 1. Canonical Timezone Rule
> **All transit departures in O-TRAVELZ are strictly defined in Indian Standard Time (IST — `Asia/Kolkata`, UTC+05:30).**

Even if a traveler's device is physically in another timezone (e.g., planning a trip to Odisha from the UK or US), timetable hours (`08:30`) represent 08:30 AM in Bhubaneswar/Puri, **never** 08:30 in the local device timezone.

## 2. Trigger Calculation Algorithm

```
Given:
  departureTimeStr = "HH:mm" (e.g., "08:30")
  offsetMinutes    = 10, 15, or 30 (e.g., 15)
  targetDate       = Today in IST (or tomorrow if all today's departures passed)

Steps:
1. Parse HH and mm from departureTimeStr.
2. Construct ZonedDateTime in ZoneId.of("Asia/Kolkata") for targetDate at HH:mm:00.
3. departureEpochMs = zonedDateTime.toInstant().toEpochMilli()
4. triggerEpochMs   = departureEpochMs - (offsetMinutes * 60 * 1000)
5. nowEpochMs       = System.currentTimeMillis() (current instant)

Evaluation:
  IF triggerEpochMs <= nowEpochMs:
    REJECT: Departure has already passed or reminder window has elapsed.
    DO NOT SCHEDULE.
    Return PassedDepartureRejection(nowEpochMs, triggerEpochMs)
  ELSE:
    SCHEDULE at triggerEpochMs via OS scheduler.
```

## 3. Mathematical Verification Across Timezones

| Scenario | Device Timezone | Timetable Time | Target Moment in IST | Trigger Epoch ms |
|---|---|---|---|---|
| Local Traveler in Cuttack | IST (`UTC+05:30`) | `14:00` (15m reminder) | 14:00 IST | Equivalent to 13:45 IST |
| Pre-Trip Planner in London | GMT (`UTC+00:00`) | `14:00` (15m reminder) | 14:00 IST (08:30 GMT) | Equivalent to 08:15 GMT (13:45 IST) |
| Pre-Trip Planner in Tokyo | JST (`UTC+09:00`) | `14:00` (15m reminder) | 14:00 IST (17:30 JST) | Equivalent to 17:15 JST (13:45 IST) |

Epoch milliseconds represent the exact universal point in time when 15 minutes remain before the bus departs the Odisha terminal.

## 4. Rejection Policy
- Departures earlier than the current IST minute: **Rejected**.
- Departures within the offset window (e.g., departure in 5 minutes, but user requested a 15-minute reminder): **Rejected** (notification cannot fire in the past).
- User feedback: Clear, calm explanation (e.g., *"This scheduled departure has already passed"* or *"The 15-minute reminder window for this departure has passed"*).
