# M17 Notification Product Model: High-Utility Local Reminders

## 1. Editorial Core Principle
> **Notifications must help a traveler execute an explicit saved trip or scheduled transit action. They must never simulate live transit, generate engagement spam, or make stale data look current.**

O-TRAVELZ treats traveler attention with editorial restraint and utmost transparency.

---

## 2. Notification Candidate Evaluation

| Candidate | Description | Verdict | Reason & Policy Rule |
|---|---|---|---|
| **N1 — Scheduled Transit Departure Reminder** | Local reminder 10, 15, or 30 minutes before a scheduled CRUT / Mo Bus / Ama Bus departure. | **`IMPLEMENT_NOW`** | Directly serves transit execution. Based on deterministic canonical timetable data. Always labeled as *"Scheduled departure"*, never *"Bus arriving"*. |
| **N2 — Saved-Trip Reminder** | Reminder for upcoming planned trip. | **`DEFER`** | M14 `SavedTripEntity` does not store an explicit user-selected trip calendar date. Inventing arbitrary dates is strictly forbidden. |
| **N3 — Active-Trip Milestone Reminder** | Notification when approaching or arriving at a trip milestone. | **`DEFER`** | Prohibited from inferring user arrival via background GPS. In-app milestone checklist on Active Trip screen remains authoritative. |
| **N4 — Weather Warning Alert** | Severe squall/cyclone warning notification. | **`DEFER`** | Open-Meteo current forecasts cannot substitute for official IMD / SACHET disaster bulletins. No pseudo-emergency notifications. |
| **N5 — Generic Destination Engagement** | *"Explore the temples of Puri this weekend!"* | **`REJECT`** | **STRICTLY PROHIBITED.** Anti-vibe-code and anti-spam policy explicitly bans engagement bait. |
| **N6 — Contribution Review Status** | Review approval notification for community photos. | **`DEFER`** | Contribution upload workflow is scheduled for Wave M19. |

---

## 3. Truth Classification of Notification Payloads

```
+-------------------------------------------------------------------------+
|                    TRUTHFUL NOTIFICATION CONTRACT                       |
+-------------------------------------------------------------------------+
| * Title: Route [Number] — Scheduled Departure in [X] min                |
| * Body:  Scheduled [HH:mm] IST from [Origin]. Check operator before trip|
| * Truth Class: SCHEDULED_TIMETABLE                                      |
| * Forbidden Words: "arriving", "nearby", "live", "approaching", "delay" |
+-------------------------------------------------------------------------+
```

### Prohibited Copy vs Mandatory Truth Copy
- **PROHIBITED**: *"Route 10 bus is arriving in 15 minutes!"*
- **MANDATORY**: *"Route 10 — Scheduled departure in 15 min (08:30 IST). Scheduled timetable only."*

---

## 4. Operational Invariants
1. **Local Scheduling**: Scheduled via native OS alarm facilities (`AlarmManager` on Android, `UNUserNotificationCenter` on iOS).
2. **Account Independence**: Functions identically when signed out or signed in.
3. **Offline Survivability**: Once scheduled, alerts trigger without active network.
4. **Contextual Opt-In**: Requested only upon tapping *"Remind me"* on a departure.
