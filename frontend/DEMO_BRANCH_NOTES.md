# Frontend Demo Branch Notes

## What this branch is

`demo/frontend-figma-alignment` is an internal visual and UX reference branch. It
adapts the Figma export into the repository's `frontend/` structure so the team can
review the proposed experience while backend phases are still being built.

## What this branch is not

The page is not connected to production data, backend endpoints, AI providers, ranking,
itinerary generation, persistence, or authoritative map geometry. Values in
`frontend/src/demo/mockData.ts` are fabricated for visual demonstration only and must
not be described as verified or live in commits, PRs, or product copy.

## Contract mapping

- `frontend/src/demo/types.ts` extends `PlaceSummary` for presentation-only place metadata.
- `frontend/src/demo/mockData.ts` uses `PlaceSummary`, `TransportHop`, and
  `ItineraryPlanResponse` from `frontend/src/api/contracts.ts`.
- Itinerary stops and transport hops follow `backend/app/schemas/itinerary.py` and
  `backend/app/schemas/transport.py`.
- API error and response envelope types remain defined by `backend/app/schemas/api.py`
  and mirrored in `frontend/src/api/contracts.ts`.
- `frontend/src/components/map/MapPlaceholder.tsx` accepts an
  `ItineraryPlanResponse`; geometry and route-line behavior remain outside this branch.

## Before this becomes real

1. Replace the demo arrays with the Phase 4 itinerary and places API response.
2. Preserve `data_tier` and explicit unavailable reasons from the transport contract.
3. Integrate the Phase 6A map contract supplied by Susmita's geospatial subsystem.
4. Connect the Phase 5 grounded AI conversation and refinement flow to deterministic
   backend services.
5. Remove exploratory screens and no-op actions unless the PRD open decisions are
   explicitly approved.
6. Add frontend behavior tests in the later Phase 6B implementation pass.
