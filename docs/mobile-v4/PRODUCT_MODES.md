# O-TRAVELZ Mobile V4 — Product Modes & State Transitions

> **Authoritative Behavioral Specification**  
> Concept: **Situational Product Modes without Fragile Global State Machines**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. The Mode Concept

Travelers move through distinct cognitive states while interacting with travel technology. O-TRAVELZ adapts its surface prominence, telemetry polling frequency, and primary action affordances based on **5 contextual product modes**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           1. DISCOVERY_MODE                             │
│                  (Browse, Inspire, Filter, Read, Bookmark)              │
└────────────┬─────────────────────────────┬──────────────────────────────┘
             │ Select multiple places      │ Inspect transit corridor
             ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────────────────────┐
│     2. PLANNING_MODE      │ │              4. TRANSIT_MODE              │
│ (Constraints, Solver, AI) │ │ (154 Routes, Stops, Timetables, Geometry) │
└────────────┬──────────────┘ └────────────┬──────────────────────────────┘
             │ "Start Trip"                │ Check in on bus
             ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────────────────────┐
│    3. ACTIVE_TRIP_MODE    │ │          5. CONTRIBUTION_MODE             │
│ (Timeline, Next Leg, Nav) │ │      (Ride Verification, Stop Audit)      │
└────────────┬──────────────┘ └───────────────────────────────────────────┘
             │ Trip Completed / Share Feedback
             ▼
     (Return to Discovery / Contribution)
```

---

## 2. Mode Specifications

### 2.1 DISCOVERY_MODE (Default Idle State)
- **User Intent**: Explore the cultural atlas, browse places across 30 districts, read artisanal profiles, and bookmark favorites.
- **Surface Focus**: Discover feed, Search drawer, Map exploration canvas, Place Detail sheets.
- **Hardware Telemetry**:
  - GPS: Passive / coarse ("Near Me" only when requested). Zero background location tracking.
  - Network: Standard HTTP caching; images loaded lazily.
- **Primary CTA**: "Save to Trip" or "View on Map".

### 2.2 PLANNING_MODE (Itinerary Construction)
- **User Intent**: Formulate a feasible multi-day or single-day schedule respecting strict opening hours and bus timetables.
- **Surface Focus**: Plan tab, Constraint form, Itinerary day timelines, Grounded AI Chat sheet.
- **Hardware Telemetry**: Zero GPS polling; deterministic computation on backend/local rule engine.
- **Primary CTA**: "Save Itinerary" or "Refine with AI".

### 2.3 ACTIVE_TRIP_MODE (On-the-Ground Navigation)
- **User Intent**: Executing an itinerary today. Needs immediate clarity on next stop, bus departure clock, walking access, and turn-by-turn handoff.
- **Surface Focus**: Trips tab (Active view), Navigation handoff button, Contextual Map with route polyline, Emergency essentials sheet.
- **Hardware Telemetry**:
  - GPS: Active foreground location (`LocationState.LiveDeviceLocation`) to evaluate `FirstMileEngine` walking distance to next stop.
  - Network: Stale-while-revalidate for weather updates; full offline fallback enabled.
- **Primary CTA**: "Navigate" (Hands off to Google Maps / Apple Maps) or "Mark Stop Visited".

### 2.4 TRANSIT_MODE (Public Mobility Investigation)
- **User Intent**: Look up bus route schedules, check stop sequences, verify transfer points, and check upcoming departure times in IST.
- **Surface Focus**: Transit directory module, Map route overlay, Stop Detail sheet.
- **Hardware Telemetry**: Passive location to find nearest transit stop within 1,500m.
- **Primary CTA**: "View Schedule" or "Check First-Mile Walk".

### 2.5 CONTRIBUTION_MODE (Community Intelligence & Rider Consensus)
- **User Intent**: Verify bus stop physical coordinates while riding a transit line or submit a photo/correction for a cultural monument.
- **Surface Focus**: You $\rightarrow$ Contributions, Transit Check-In dialog, Camera capture viewfinder.
- **Hardware Telemetry**: High-accuracy GPS snapshot during stop check-in; Camera hardware capture.
- **Primary CTA**: "Confirm Stop Check-In" or "Submit Contribution".

---

## 3. Contextual Transitions (No Monolithic "Mode Manager")

Following Ponytail minimalism, O-TRAVELZ does **not** introduce a heavyweight global state machine class (`ModeManager.kt`). Modes are naturally represented by the **currently active route in the navigation backstack** and the presence of an active `SavedTrip`:

- If `activeTripId != null` and current date falls within trip dates $\rightarrow$ **ACTIVE_TRIP_MODE** auto-surfaces as default view in Trips tab.
- If user navigates into transit route detail $\rightarrow$ **TRANSIT_MODE** UI rules apply locally.
- When user exits to root feed $\rightarrow$ Returns cleanly to **DISCOVERY_MODE**.
