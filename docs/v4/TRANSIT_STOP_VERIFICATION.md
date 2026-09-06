# O-TRAVELZ V4 — Transit Stop Crowdsourced & Local Verification Specification

> **Authoritative Specification Document**  
> Document Version: `1.0.0` | Last Updated: `2026-09-06`  
> Purpose: **Framework for Passenger Observations, Field Verification, and Epistemic Promotion for Transit Stops**  
> Credit: **Built by Algoryxz**

---

## 1. Executive Summary & Core Mission

A critical challenge across Odisha's transit networks (CRUT Mo Bus and Ama Bus) is that official timetables describe 1,430 stops, but only a fraction have official GPS coordinates. Traditional tech platforms either invent approximate coordinates via naive geometric interpolation (strictly banned in O-TRAVELZ) or drop the stops entirely.

O-TRAVELZ solves this through a **two-tier epistemic architecture**:
1. **Algorithmic Topology & Candidate Ranking (Wave C5)**: Binds real external physical objects (OSM transit nodes, civic amenities, places, settlements) to route sequences without mathematical fabrication.
2. **Crowdsourced Field Observations (Wave C6 / Mobile Foundation)**: Enables riders and local cultural contributors to record ground-truth boarding points, physical shelters, and route boards with privacy-first data minimization.

---

## 2. Privacy & Data Minimization Architecture

> [!IMPORTANT]
> **Zero Invasive Tracking Policy**:
> O-TRAVELZ does NOT record, track, or retain continuous user GPS breadcrumbs. The observation system operates strictly on **event-driven, explicit user action**.

### 2.1 Core Privacy Rules
- **Explicit Opt-in**: Observation recording triggers only when a user explicitly taps "I am boarding here", "I alighted here", or "Submit Stop Evidence".
- **Ephemeral Session Hashes**: Contributor identities are hashed using a salted rotating daily key (`device_session_hash`). No raw hardware UDIDs, phone numbers, or user account IDs are linked to physical coordinate logs.
- **Immediate Spatial Truncation**: Coordinate readings are snapped to a 5-meter boundary; high-frequency background GPS is never requested.

---

## 3. Observation Data Schema (`stop_observations`)

Observations submitted by passengers or local contributors conform to the following schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "StopObservation",
  "type": "object",
  "required": [
    "observation_id",
    "canonical_stop_id",
    "route_id",
    "timestamp",
    "latitude",
    "longitude",
    "accuracy_m",
    "observation_type",
    "session_hash"
  ],
  "properties": {
    "observation_id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique observation identifier"
    },
    "canonical_stop_id": {
      "type": "string",
      "description": "Canonical stop ID from data/transport/canonical/stops.json"
    },
    "route_id": {
      "type": "string",
      "description": "Serving route ID being ridden or observed"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 UTC timestamp of observation"
    },
    "latitude": {
      "type": "number",
      "minimum": 17.5,
      "maximum": 23.0
    },
    "longitude": {
      "type": "number",
      "minimum": 81.0,
      "maximum": 88.0
    },
    "accuracy_m": {
      "type": "number",
      "minimum": 0.5,
      "maximum": 100.0,
      "description": "Reported GPS horizontal accuracy in meters"
    },
    "observation_type": {
      "type": "string",
      "enum": [
        "BOARDED_BUS",
        "ALIGHTED_BUS",
        "STOP_SIGN_SEEN",
        "SHELTER_SEEN",
        "ROUTE_BOARD_SEEN",
        "MANUAL_PIN_CONFIRMATION"
      ]
    },
    "session_hash": {
      "type": "string",
      "description": "Salted SHA-256 hash of device session for deduplication"
    },
    "photo_evidence_uri": {
      "type": "string",
      "nullable": true,
      "description": "Optional local photo path of shelter or signage"
    },
    "signage_text": {
      "type": "string",
      "nullable": true,
      "description": "Observed text on route board (English or Odia)"
    },
    "route_number_seen": {
      "type": "string",
      "nullable": true,
      "description": "Bus route number displayed on vehicle"
    }
  }
}
```

---

## 4. Consensus & Promotion Threshold Rules

> [!CAUTION]
> **Anti-Vibe Rule: One observation NEVER auto-promotes to canonical truth.**

### 4.1 Rejection Gates (Automatic Outlier Filtration)
1. **Speed Gate**: If recorded velocity at trigger exceeds $15\text{ km/h}$, the observation is rejected as an "in-motion" misfire.
2. **Accuracy Gate**: Readings with `accuracy_m > 30.0` are rejected as degraded GPS fixes.
3. **Bounding Gate**: Coordinates must lie within $2.5\text{ km}$ of the expected route corridor segment.

### 4.2 Clustering & Consensus Ladder
To graduate from an observation to canonical verification, observations must meet the **3-Tier Consensus Ladder**:

| Tier | Required Consensus | Resulting Epistemic Status | UI Map Behavior | First-Mile Allowed |
|---|---|---|---|---|
| **Tier 1: Single Observation** | 1 observation from 1 user | Logged in `stop_observations` table | Invisible to public catalog | NO |
| **Tier 2: Multi-User Cluster** | $\ge 3$ distinct `session_hash` events within $25\text{ m}$ radius across $\ge 2$ separate calendar days | `CANDIDATE_HIGH` in staging registry | Estimated stop marker with pending badge | NO |
| **Tier 3: Audited Consensus** | $\ge 5$ distinct user clusters OR 1 photo-verified signage upload audited by team | `VERIFIED_GEOSPATIAL` promoted to canonical `stops.json` | Exact stop marker | YES |

---

## 5. Mobile & Frontend Implementation Roadmap

### 5.1 Passenger Feedback Flow
1. When a user opens an active route or itinerary leg, a non-intrusive action button appears:  
   `[Tap when boarding at {stop_name}]`.
2. When tapped, the client captures the current single GPS fix, verifies accuracy $\le 20\text{ m}$, prompts optional photo capture of the bus stop board, and queues the encrypted observation payload.
3. Offline submissions are buffered in local device storage (SwiftData / Room / LocalStorage) and synced when connectivity returns.

### 5.2 Contributor Verification Dashboard
Local contributors and survey volunteers access the prioritized queue generated in `reports/transit_c5_manual_resolution_queue.json`. The dashboard presents one-click Mapillary, Overpass, and search queries for each unresolved stop, allowing manual reviews to resolve ambiguous clusters efficiently.
