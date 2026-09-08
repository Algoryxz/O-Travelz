# O-TRAVELZ Mobile V4 — Wave M13 Planner Baseline Specification

> **Authoritative Specification: Constraint-Aware Itinerary Planner & Grounded AI Assistant**  
> Status: `ACCEPTED_PRODUCTION_BASELINE` | Wave: `M13` | Date: `2026-09-08`  
> Git Commit Reference: Wave M13 Completion

---

## 1. Executive Summary

Wave M13 establishes the native Plan root across Android and iOS as a truthful, constraint-aware trip-planning instrument. Rejecting freeform conversational chat as the primary planning interface, M13 pairs a structured constraints editor with the deterministic facts-only backend itinerary engine (`POST /itinerary/plan`), canonical destination and transit truth, and a grounded AI companion (`POST /ai/converse`).

---

## 2. Platform Architecture Matrix

| Dimension | Android Implementation | iOS Implementation | Truth Boundary |
|---|---|---|---|
| **Primary Interface** | Structured Constraints Form (M3 Chips, Selectors, Inputs) | Structured Form (SwiftUI Sections, Pickers, Chips) | Explicit constraint review before execution |
| **Natural Language** | Optional prompt input via `extractConstraintsWithAI()` | Optional prompt input via `extractConstraintsWithAI()` | AI extracts constraints for traveler review; never silently injects facts |
| **Execution Engine** | `POST /itinerary/plan` via Retrofit / OkHttp | `POST /itinerary/plan` via native URLSession | Deterministic facts-only route generation |
| **AI Companion** | `POST /ai/converse` (grounded explanation only) | `POST /ai/converse` (grounded explanation only) | Visually segregated with "Grounded on Atlas Facts" badge |
| **Persistence** | Deferred to M14 (Zero Room / SwiftData in M13) | Deferred to M14 (Zero Room / SwiftData in M13) | In-memory ViewModel state |

---

## 3. Supported Planning Constraints

| Constraint | Type | Values / Thresholds | Backend Mapping |
|---|---|---|---|
| **Duration** | Integer | 1..7 Days (1 Day represents up to 6h) | `days: Int` (max 3 stops per day) |
| **Starting Hub** | String | Bhubaneswar, Puri, Cuttack, Rourkela, Sambalpur | `start: String` (resolved by repository) |
| **Interests** | Set | Heritage, Temples, Nature, Beaches, Culture, Crafts, Culinary | `interests: List<String>` |
| **Pace** | Enum | Relaxed, Moderate, Fast | `pace: String` |
| **Walking Preference** | Boolean | Standard vs Reduced Walking | `low_walking: Boolean` |
| **Transit Preference** | Boolean | Prefer Mo Bus / AMA Bus | `public_transport_preferred: Boolean` |
| **Budget Consideration** | Boolean | Qualitative indicator only | `budget_conscious: Boolean` |

---

## 4. Hard Product Truth Contracts

1. **Fare Truth**:
   - Fares in journey hops are strictly `null`.
   - Disclosed clearly: *"Transit fares available at boarding. Online fare estimation is disabled."*
2. **Opening Hours Truth**:
   - Operating hours are not inferred from unverified sources.
   - Disclosed clearly: *"Suggested visit schedule. Verify current operating hours before traveling."*
3. **Transit Telemetry Truth**:
   - Preserves Wave M12 invariants: scheduled timetables only (`HH:mm IST`), zero simulated moving bus pins, zero fake countdowns.
4. **First-Mile Walking Truth**:
   - Walking minutes evaluated only for verified physical stops with live GPS.
   - Suppressed for locality-only stops.
5. **Media Truth**:
   - Destination cards display verified authentic photography only.
   - Destinations without verified photography receive editorial non-photo treatment without cross-destination fallback.
6. **Stage G1 Non-Ingestion Gate**:
   - Zero staging data files imported into shipping assets.
   - Stage G2 promotion remains strictly locked.

---

## 5. Golden Scenario: Six-Hour Bhubaneswar

- **Input**: *"Plan a 6 hour trip in Bhubaneswar"*
- **Resolution**: `days = 1`, `start = "Bhubaneswar"`
- **Stops Count**: Exactly 3 confirmed stops (bounded by `MAX_STOPS_PER_DAY = 3`).
- **Time Windows**:
  - Stop 1: 09:00 – 11:00
  - Stop 2: 11:45 – 13:30
  - Stop 3: 14:15 – 16:30
- **Intermediate Hops**: Walk or scheduled transit connections with verified duration.
