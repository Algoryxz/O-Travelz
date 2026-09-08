# O-TRAVELZ Mobile V4 — Wave M13 Planner Domain Model Specification

> **Authoritative Specification: Native Plan Domain Models & State**  
> Status: ACCEPTED_PRODUCTION_SPEC | Wave: M13 | Date: 2026-09-08  
> Git Commit Reference: Wave M13 Completion

---

## 1. Domain Model Hierarchy & Entity Boundaries

The planning domain operates across pure, platform-native Kotlin and Swift models without leaky abstractions:

`
                            ┌────────────────────────┐
                            │    PlanConstraints     │
                            ├────────────────────────┤
                            │ • days: Int (1..7)     │
                            │ • interests: Set       │
                            │ • pace: PlanPace       │
                            │ • startHub: String?    │
                            │ • lowWalking: Boolean  │
                            │ • publicTransit: Bool  │
                            │ • budgetConscious: Bool│
                            └───────────┬────────────┘
                                        │
                         Executes POST /itinerary/plan
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │       PlanResult       │
                            ├────────────────────────┤
                            │ • itineraryId: String  │
                            │ • days: List<PlanDay>  │
                            │ • explanation: String  │
                            │ • aiMessage: String?   │
                            │ • isAIGrounded: Bool   │
                            │ • warnings: List<Str>  │
                            └───────────┬────────────┘
                                        │
                  ┌─────────────────────┴─────────────────────┐
                  ▼                                           ▼
       ┌─────────────────────┐                     ┌─────────────────────┐
       │      PlanStop       │                     │     JourneyLeg      │
       ├─────────────────────┤                     ├─────────────────────┤
       │ • sequence: Int     │                     │ • fromSequence: Int │
       │ • placeId: String   │                     │ • toSequence: Int   │
       │ • placeName: String │                     │ • mode: String      │
       │ • category: String  │                     │ • estimatedMins: Int│
       │ • plannedArrival    │                     │ • dataTier: String  │
       │ • plannedDeparture  │                     │ • legDetail: String │
       │ • verifiedImageUrl  │                     │ • reason: String?   │
       └─────────────────────┘                     └─────────────────────┘
`

---

## 2. Core Entities

### PlanConstraints
- **Purpose**: Captures traveler's explicit planning requirements.
- **Fields**:
  - days: Int (1..7; default 1). Represents calendar duration. For "6 hours", days = 1 with 3 stops max.
  - interests: Set<PlanInterest> (Heritage, Temple, Nature, Beach, Culture, Crafts, Food).
  - pace: PlanPace (RELAXED, MODERATE, FAST).
  - startHub: String? (e.g. "Bhubaneswar", "Puri", "Cuttack", "Rourkela", "Sambalpur").
  - lowWalking: Boolean (requests reduced walking distance).
  - publicTransportPreferred: Boolean (prioritizes Mo Bus / AMA Bus transit hops).
  - udgetTransportPerDay: Double? (strictly null unless explicitly set; never fabricated).
  - udgetConscious: Boolean (qualitative indicator).

### PlanStop
- **Purpose**: A confirmed cultural atlas destination visit.
- **Fields**:
  - sequence: Int (1-indexed visit order within the day).
  - placeId: String (canonical database UUID matching PlaceDto.id).
  - placeName: String (official published destination name).
  - category: String (e.g. "temple", "heritage", "nature").
  - plannedArrival: String? (e.g. "09:00").
  - plannedDeparture: String? (e.g. "11:00").
  - erifiedImageUrl: String? (authentic verified WebP image; null if pending).

### JourneyLeg
- **Purpose**: Transit or walking leg connecting two consecutive itinerary stops.
- **Fields**:
  - romSequence: Int (0 represents trip start origin).
  - 	oSequence: Int (destination stop sequence).
  - mode: String (walk, 	ransit, us, unavailable).
  - estimatedMinutes: Int? (derived from deterministic routing or schedule).
  - estimatedCost: Double? (strictly null/unavailable unless verified; zero fake fares).
  - legDetail: String? (e.g. "Scheduled Mo Bus Route 10", "Walk 450m").
  - dataTier: String? (scheduled, static, unknown).
  - eason: String? (explanation when mode is unavailable).

### PlanDay
- **Purpose**: Groups ordered stops and intermediate hops for one calendar day.
- **Fields**:
  - dayNumber: Int (1-indexed day).
  - date: String? (optional ISO date).
  - stops: List<PlanStop> (max 3 stops per day).
  - hops: List<JourneyLeg> (hops connecting origin and stops).

### PlanResult
- **Purpose**: Complete immutable itinerary output.
- **Fields**:
  - itineraryId: String (canonical server-assigned deterministic ID).
  - constraints: PlanConstraints (exact constraints used for generation).
  - days: List<PlanDay>
  - explanation: String (deterministic backend explanation).
  - iCompanionMessage: String? (grounded conversational prose).
  - isAIGrounded: Boolean (flag confirming zero AI hallucinations).
  - warnings: List<String> (truth disclosures: opening hours, boarding fares).
