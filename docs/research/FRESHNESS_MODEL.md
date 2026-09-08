# O-TRAVELZ V4 — Freshness Model

## Purpose

The Freshness Model categorizes the temporal dynamics of data discovered by research subagents. It ensures the platform never misrepresents static or scheduled data as live telemetry, adhering to the Anti-Vibe-Code and Transit Truth Boundary constraints.

---

## Freshness Taxonomy

| Freshness Code | Definition | Update Frequency | Domain Examples | Platform Semantics & Restrictions |
|---|---|---|---|---|
| `STATIC` | Immutable physical or historical facts. | Decades or centuries. | Geographic coordinates of hills/rivers, historical temple foundation centuries, UNESCO inscription dates, district names. | Cached indefinitely; offline-first in mobile bundle. |
| `SLOW_CHANGING` | Operational rules established by policy or statute. | Annual or seasonal. | Monument opening hours, ticket fee structures, camera charges, weekly temple closure days, district boundary gazettes. | Requires timestamped verification (`last_updated`). Must re-verify quarterly. |
| `SCHEDULED` | Predetermined timetables published in advance. | Monthly, quarterly, or seasonal revisions. | Mo Bus official timetable, Ama Bus route frequency tables, Indian Railways published train schedules, Biju Patnaik Airport flight schedules. | **CRITICAL**: Never present scheduled timetable data as live vehicle tracking. Displays as "Scheduled Departure". |
| `CURRENT` | Recent environmental or operational observations. | Hourly or sub-hourly. | IMD weather observation, Air Quality Index (AQI), active cyclone warnings from OSDMA, daily temple ritual timings. | Requires short-lived client caching (TTL $\le$ 30 minutes) and explicit observation timestamp. |
| `REALTIME` | Live telemetry directly streamed from hardware sensors or AVL feeds. | Sub-minute (< 60 seconds). | Bus GPS coordinates (latitude/longitude from on-vehicle transponder), active road congestion speeds, live flight radar positions. | **CRITICAL**: The phrases "real-time bus location" or "live arrival" are strictly forbidden unless a genuine AVL stream is active. (Currently NOT present in baseline transit). |
| `UNKNOWN` | Discovery lacks explicit timestamp, publication metadata, or revision history. | Indeterminate. | Undated circulars, orphaned PDF tables, unversioned API endpoints. | Must be flagged for manual inspection before inclusion. |

---

## Anti-Fabrication Constraints

1. **The Scheduled vs. Realtime Boundary**:
   - Subagents must rigorously distinguish between a published timetable (`SCHEDULED`) and an automated vehicle location feed (`REALTIME`).
   - If an API provides estimated arrival times based strictly on scheduled headway, it is `SCHEDULED`.
2. **Fare Timeliness**:
   - Ticket prices and bus fares are strictly `SLOW_CHANGING`. If official fare tables are not dated within the current operating year, they must be flagged for manual re-verification.
3. **Emergency Alerts**:
   - Weather alerts must be labeled `CURRENT` and must reference the issuing bulletin number from IMD / OSDMA.
