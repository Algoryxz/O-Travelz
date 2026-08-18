# O-Travelz Product Requirements Document

Status: canonical product scope

This document is the product source of truth. A capability is an implementation
requirement only when it is stated here. The repository's existing documentation and
the approved architecture audit are the sources for this document. No additional
features are implied.

## Product purpose

O-Travelz is a transportation-aware trip-planning system for exploring a city, starting
with Bhubaneswar/Odisha. It produces realistic day plans and multi-day plans that show
which verified places to visit, in what order, and how to get between them.

The central product principle is:

> AI orchestrates. It does not invent facts.

## Target user

A visitor planning time in Bhubaneswar/Odisha who wants a practical itinerary grounded
in verified place and transportation information, including walking and local transit
between stops.

## Core problem

Ordinary trip planners may list attractions or hand off to a generic directions tool,
but they do not make local transportation a first-class part of the itinerary. O-Travelz
must connect verified places into a realistic sequence with transportation-aware hops.

## User journey

1. The user provides dates, interests, pace, transport budget, mobility constraints,
   number of days, and a starting location such as a hotel.
2. The system selects candidate places matching the request using verified data and
   deterministic ranking.
3. The system sequences the places into day-by-day plans.
4. For each hop between places, the system computes a transport plan using verified
   provider data and deterministic routing.
5. The frontend presents the itinerary, map information, transport details, and a
   grounded explanation.
6. The user may edit constraints or ask a refinement question, such as reducing walking
   or reducing daily transport cost.
7. The system converts the change into structured constraints and recalculates through
   deterministic services. AI does not hand-edit itinerary facts.

## Approved screens and actions

The exact approved views are:

- Itinerary view: show the plan by day, ordered stops, times, and transport hops.
- Map view: show places and available route or hop information supplied by backend
  contracts.
- Conversation/refinement panel: accept user intent and follow-up changes, then present
  grounded explanations.

The user may:

- provide planning constraints;
- view the generated itinerary;
- inspect transportation details for a hop;
- view the map representation of the plan;
- edit constraints or ask a refinement question;
- confirm the current plan where the implemented flow presents confirmation.

`OPEN DECISION`: Team documents also mention a separate discovery/search screen,
filters, place cards, and recommendation presentation. The product owner must decide
whether those are separate screens or part of the approved itinerary/conversation flow
before implementation.

`OPEN DECISION`: The database documentation mentions saving and revisiting plans. No
save, profile, or persistence user journey is currently approved in this PRD.

## Core features

- Verified place data for the initial city scope.
- Deterministic candidate selection and ranking.
- Day-by-day itinerary sequencing.
- Transportation-aware hops between itinerary stops.
- Multimodal legs such as walk → bus → walk when verified data supports them.
- Map representation of places and route information.
- AI intent understanding, deterministic tool orchestration, grounded explanation, and
  conversational refinement.
- Honest handling of missing routes, unavailable provider data, and approximate data.

## Transportation capabilities

The transportation model may represent walking, Mo Bus/AMA Bus, Mo E-Ride, Odisha
Yatri, auto/e-rickshaw, taxi, and intercity train options where the provider and data
are verified and the option is in scope.

Transport data is classified as static, scheduled, or live. Live behavior is allowed
only where a provider genuinely exposes a verified live source. Static or estimated
information must not be presented as live information.

If no route can be found within the constraints, the itinerary must surface an
unavailable transport state rather than silently dropping a stop or fabricating a plan.

## AI capabilities

AI may:

- turn free-text intent into structured constraints;
- call approved deterministic tools;
- explain returned structured results in plain language;
- process refinement requests by producing new structured constraints and calling the
  deterministic services again.

AI may not independently state place, address, opening-hour, fare, route, or duration
facts. Every factual statement must be traceable to current-turn tool output.

## Map capabilities

The map presents places, stops, route lines, and multimodal route information supplied
by the backend/geospatial contracts. AI does not compute geometry. The frontend consumes
the map subsystem and does not recreate authoritative geospatial calculations.

The exact GeoJSON and map-layer contract is unresolved and is tracked as an `OPEN
DECISION` in `docs/ARCHITECTURE.md`.

## Itinerary capabilities

An itinerary contains an identifier, constraints, ordered days, ordered places within
each day, planned arrival/departure values where available, and transport hops. A hop
may contain multiple ordered legs and a data-tier label. Grounded conversational prose
is returned by the accepted `AIResponse` envelope; the canonical `ItineraryResponse`
keeps its deterministic facts-only `explanation` field.

Phase 4's deterministic implementation ranks globally by exact canonical
interest/category relevance, selects unique coordinate-bearing places with a maximum of
three stops per day, preserves global rank order, and retains unavailable transport hops
with explicit reasons. It does not infer missing coordinates, timing, fares, durations,
or pace/mobility compliance. Its `explanation` remains empty facts-only output; accepted
Phase 5 grounded prose is returned through the separate `AIResponse` envelope.

## Replanning capabilities

Replanning is constraint-based. Supported Phase 5 refinements (`days`, `interests`,
`dates`, and `start`) are converted into structured constraints and passed back through
the deterministic itinerary service. Walking/mobility, pace, and lower transport-budget
optimization remain unsupported and must be reported honestly. The AI must not directly
rewrite itinerary facts or route details.

## Constraints

- Initial geographic scope is Bhubaneswar/Odisha.
- Place and transportation facts must be sourced and verified.
- The system must not fabricate routes, fares, schedules, travel times, opening hours,
  coordinates, or provider capabilities.
- Provider integrations require verification before implementation.
- The frontend does not call AI providers directly.
- The product must degrade honestly when only static or estimated data exists.
- No feature may be implemented unless it is listed in this PRD or explicitly approved
  through the change process in `docs/RULES.md`.

## Acceptance criteria

The product scope is satisfied only when:

- a plan can be represented as ordered days, stops, and transport hops using the
  documented itinerary contract;
- factual itinerary content comes from verified data or deterministic services;
- transport hops preserve their data tier and expose multimodal legs where available;
- unavailable transport is surfaced explicitly;
- AI explanations are grounded in current-turn deterministic tool output;
- user refinements cause structured recalculation rather than text-only edits;
- the frontend can render itinerary, map, transport, and conversation states from the
  approved contracts;
- backend and frontend contract tests pass for the implemented scope;
- the initial demo can run against the verified Bhubaneswar/Odisha data subset.

## Explicitly out of scope

- Payments or booking.
- Live GPS tracking of the user.
- Coverage beyond Bhubaneswar/Odisha before the initial model is proven.
- Any provider integration that has not been verified.
- Favorites, profiles, dashboards, admin systems, social features, notifications, or
  gamification.
- A save/revisit-plan workflow unless the `OPEN DECISION` above is explicitly approved.
- Any separate discovery/search experience unless the `OPEN DECISION` above is
  explicitly approved.

## Future ideas, not requirements

The following are recorded only so they are not mistaken for approved scope:

- A saved-plan or revisit workflow.
- A separate discovery/search screen with filters and place cards.
- Additional geographic coverage.
- Additional live provider integrations after verification.
