# Phase 2 Frontend Dependency Handoff — Deeptiman

## Owner

Smarak/Punam → Deeptiman

## Phase

Phase 2 handoff → later Phase 6B frontend integration

## Status

Phase 2 engineering acceptance is complete. Frontend feature implementation is not part
of this handoff.

## Available dependency state

The database/import layer provides verified source metadata and explicit unknown states.
AMA stop coordinates may be NULL and Route 12 mappings/geometry may be unavailable. Any
future UI must render unavailable/unknown states honestly through approved API/map
contracts.

## Ownership boundary

Deeptiman owns the complete frontend and user experience, including presentation of
approved itinerary, transport, loading, error, data-tier, and replanning states. Deeptiman
does not own AI, ranking, itinerary generation, database semantics, provider logic,
routing, or authoritative geometry.

## Dependency and next action

Wait for approved later API and map contracts as defined by `docs/PHASES.md`. Do not add
discovery, persistence, routing, map calculation, or other unauthorized frontend
features. Record all future work in Markdown evidence.
