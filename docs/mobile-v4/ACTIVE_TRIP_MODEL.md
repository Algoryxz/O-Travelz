# O-TRAVELZ Mobile V4 — Active Trip Execution Model

> **Authoritative Behavioral Specification**  
> Model: **On-the-Ground Trip Execution Engine (Deterministic vs. Inferred Boundaries)**  
> Document Version: `4.1.0` | Last Updated: `2026-09-08` (Wave M14 Persistence Accepted)

---

## 1. The Active Trip Concept

A saved itinerary is a passive plan. An **Active Trip** is an operational day-of-travel state. The moment a traveler is physically executing an itinerary, their cognitive requirements shift from exploration to **immediate situational awareness**:
- *"Where do I go next?"*
- *"When does the next scheduled bus leave?"*
- *"How far do I have to walk right now?"*
- *"Where is the nearest water/medical emergency facility?"*

---

## 2. Activation Triggers & Lifecycle

```
┌──────────────────┐       User taps "Start Trip" OR       ┌──────────────────┐
│  SAVED_ITINERARY │ ────────────────────────────────────> │   ACTIVE_TRIP    │
└──────────────────┘     Calendar Date == Itinerary Date   └────────┬─────────┘
                                                                    │
                 ┌──────────────────────────────────────────────────┴──────────────────────────────────────────────────┐
                 ▼                                                  ▼                                                  ▼
          ┌─────────────┐                                    ┌─────────────┐                                    ┌─────────────┐
          │  DAY 1 LEG  │ ──────── Advance on Visit ───────> │  DAY 2 LEG  │ ─────── Complete Final Leg ──────> │  COMPLETED  │
          └─────────────┘                                    └─────────────┘                                    └─────────────┘
```

1. **Explicit Activation**: Traveler taps "Start Trip" on any saved itinerary.
2. **Implicit Calendar Prompt**: If today's date matches Day 1 of a saved itinerary, the Trips tab displays a high-priority prompt card: *"Start today's trip: Golden Triangle Day 1?"*
3. **Deactivation / Completion**: Traveler marks the final milestone completed or taps "End Trip". The itinerary transitions to `COMPLETED_TRIP` archive.

---

## 3. Step & Milestone State Machine

Each milestone in an active trip day exists in one of four states:

1. **`CURRENT`**: The active destination or transit hop right now.
   - Highlighted in primary Sandstone Ochre.
   - Displays live walking distance (if within 1,500m) and scheduled departure clock.
   - Primary Action: **"Navigate"** (launches external turn-by-turn).
   - Secondary Actions: **"Mark Visited"** or **"Skip Stop"**.
2. **`COMPLETED`**: Visited milestone.
   - Marked with a subtle green checkmark.
   - Collapsed to compact 1-line row to keep the screen focused on upcoming legs.
3. **`SKIPPED`**: Intentionally omitted milestone (e.g. skipped due to rain or fatigue).
   - Struck through in muted gray; subsequent transit connection timings automatically recalculate.
4. **`UPCOMING`**: Future milestones scheduled for later today.
   - Displays planned arrival window and scheduled bus connection.

---

## 4. Deterministic vs. Inferred Telemetry

O-TRAVELZ maintains a rigid boundary between what is evaluated deterministically and what is inferred:

| Dimension | Deterministic Truth (Guaranteed) | Prohibited Inferred Guesses (Anti-Vibe-Code) |
|---|---|---|
| **Transit Departures** | Evaluates strictly against published CRUT timetable tables in IST. | **Never** guess "Bus will arrive in 4 mins" without genuine vehicle GPS telemetry. |
| **Walking Feasibility** | Straight-line Haversine spherical math ($R = 6371.0088\text{ km}$). Bands: $\le 800\text{ m}$ (Reasonable), $\le 1500\text{ m}$ (Short Auto), $>1500\text{ m}$ (Cab). | **Never** guess road walking navigation or pedestrian crosswalk safety internally; delegate to external Google Maps handoff. |
| **Opening Hours** | Audited opening days (e.g. Odisha State Museum closed Mondays; Konark open sunrise to sunset). | **Never** guess "Likely open now" based on AI heuristics. |
| **Milestone Advancement** | Advances strictly upon **explicit traveler action** (tapping "Mark Visited" or "Skip"). | **Never** silently advance stops via geofence trigger alone (avoids falsely marking a stop visited when traveler merely drove past in a cab). |

---

## 5. Offline Retention & Emergency Access

1. **Zero Data Requirement**: All active trip data (destinations, coordinates, offline phone numbers, schedule departures) is stored in local Room SQLite / SwiftData storage.
2. **Persistent Essentials Access**: The Active Trip view includes a persistent floating shortcut to **Emergency Essentials** (Hospital, Police 112, Pharmacy), pre-filtered to the active destination's district.
