# Smarak Phase 4 Approved Decisions

## Status

Approved for Phase 4 implementation on 2026-08-18. This is a decision record, not a
Phase 4 acceptance record. Phase 4 remains **NOT ACCEPTED** until implementation,
tests, regression evidence, and scope/fabrication audit pass.

## Akriti evidence reconciliation

The supplied evidence handoff was inspected at:
`C:\Users\smara\Downloads\O-Travelz_Phase4_Akriti_Verified_Handoff_FINAL_2026-08-18.zip`.
The archive contains `README.md`, `MANIFEST.json`, and the five listed data files:
`verified_places.csv`, `verified_bqs_inventory_83.csv`,
`route12_reconciliation_36.csv`, `route12_ordered_36.csv`, and
`ama_e_ride_verified_source.json`. Every SHA-256 entry in `MANIFEST.json` matched the
corresponding archive entry. The manifest's embedded `source_archive` label is
`O-Travelz-main (2).zip`; this is package metadata and does not change the supplied
archive path or its contents.

The verified-place CSV contains 32 unique stable IDs (`place_001` through `place_032`),
9 canonical categories, 8 complete coordinate pairs, 24 intentional NULL coordinate
pairs, 32 `2026-08-17` verification dates, and one populated opening-hours value. It
matches the reviewed v5.1 place handoff at
`data/research/handoffs/places_v5.1/data/places/places.json` row-for-row across the
identity, category, source, coordinate, verification, and audit fields. The Phase 2
database/import boundary therefore remains authoritative; the CSV is validation
evidence, not a second runtime source of truth.

The BQS file contains 83 unique records, all with unresolved NULL coordinates. The
Route 12 reconciliation contains 36 unique candidate records: 22
`BQS_MATCH_NORMALIZED` and 14 `NEW_NON_BQS_OR_UNRESOLVED`. The ordered Route 12 file
contains the same 36 records in supplied stop sequence 1 through 36, with direction
remaining `UNSPECIFIED_IN_SOURCE`. The AMA E-Ride evidence contains 13 route records
and 129 route-stop references (122 unique stop names); all stop coordinates are
unresolved and all external references are NULL. These transport files remain
evidence/research inputs and are not promoted into the place inventory or used to
construct geometry, fares, durations, schedules, or live capability.

The current Phase 4 SQL repository now explicitly filters `Place.verified_at IS NOT
NULL` before projecting candidates. It preserves the existing Phase 4 projection of
database UUID, Akriti research ID, canonical category, name, and coordinate
availability. Source/provenance and audit fields remain preserved by the Phase 2
database/import layer but are not required by the current ranking or itinerary
response contract. No production data import, duplicate creation, schema change,
migration, transport redesign, or frontend change was required.

## Ranking

- The only ranking signal is canonical interest/category relevance.
- A normalized interest matching the canonical category identifier scores relevance 1;
  non-matching categories score 0.
- With no interests, all verified candidates have equal relevance.
- Interest normalization is trim plus case normalization only; no fuzzy or semantic
  mapping is added.
- Ordering is relevance descending, canonical category identifier ascending, canonical
  place name ascending, research ID ascending when present, then database UUID
  ascending.
- All verified places may be ranked, including verified places with `NULL` coordinates.
- Coordinate eligibility is a separate itinerary/routing filter.
- Ranking does not use transport capability, unknown cost/duration, popularity,
  inferred preferences, opening-hour guesses, coordinates, AI, ML, or randomness.

## Itinerary selection and sequencing

- Rank globally once, then select at most `days * 3` unique coordinate-bearing places.
- A day has a maximum of three stops; places are not duplicated.
- Preserve global ranking order while distributing selected stops into day 1, day 2,
  and subsequent requested days.
- Emit the requested number of deterministic day objects, including empty trailing days
  when the eligible candidate pool is smaller.
- Requested dates label corresponding days only. They do not imply unverified schedule
  or timing facts.
- Planned arrival/departure remain `null` unless actual verified structured timing is
  used; Phase 4 does not infer timing.
- `pace` and `mobility` are preserved in constraints but are not claimed as optimized.
- No automatic return-to-start is created.

## Start and transport hops

- `start` is resolved only through an exact deterministic verified-origin lookup; no
  geocoder or text-to-coordinate inference is added.
- A valid resolved start creates a first hop from the origin to day-one sequence 1.
- `from_sequence=0` is the contract sentinel for the non-itinerary start origin;
  ordinary itinerary hops use their actual positive stop sequences.
- Consecutive stops on the same day produce hops `N -> N+1`.
- The itinerary service calls the existing Phase 3 `TransportService` and does not
  implement routing.
- The smallest Phase 3 contract change adds optional sequence fields with backwards-
  compatible defaults; the service propagates them into returned hops.
- Unavailable hops remain in the itinerary with a reason; stops are never silently
  removed.
- Returned duration, cost, provider, legs, and data tier are preserved. Unknown cost
  remains `null`.
- The API/schema boundary uses `unknown` for an unavailable/unsupported tier that
  cannot honestly be represented as static, scheduled, or live. The Phase 2 database
  enum remains unchanged because Phase 4 does not persist new transport source tiers.

## API and facts-only response

- Implement `POST /itinerary/plan` with the existing request and structured API error
  contract.
- A complete planning/request failure is an API error; an individual unavailable hop is
  a valid itinerary hop with an explicit reason.
- No new API versioning system is introduced.
- The response `explanation` field is the deterministic empty string in Phase 4. No AI
  or generated prose is used; Phase 5 may later populate grounded explanation through
  its approved orchestration boundary.
- If no coordinate-bearing candidate can produce a valid routed plan, return a
  deterministic planning failure rather than a successful empty itinerary.

## Inherited limitations

Phase 3 remains accepted only with its explicit limitations. AMA Bus and Mo E-Ride do
not provide source-backed coordinate-bearing routing records in the current repository;
fare/cost may remain unknown; no live provider capability is claimed; and map/GeoJSON
behavior remains out of scope. These limitations produce explicit unavailable hops or
nullable fields and are not closed by this decision record.

## Ownership and downstream impact

Smarak owns ranking and itinerary semantics. Rudra's existing transport/API boundary is
consumed and minimally extended for sequence propagation. AI, map/geospatial, frontend,
and provider owners receive the structured output after Phase 4 implementation; none is
implemented or changed here beyond contract mirrors required for consistency.
