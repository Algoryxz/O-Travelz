# O-Travelz Build Guide

## How to use this guide

Use this guide with Claude, Codex, Cursor, Copilot, or another coding assistant.

Rules:
- Work only on files you own unless a shared contract genuinely needs coordination.
- Read `START_HERE.md`, the six canonical documents, and your personal team document first.
- Reuse existing code; do not create duplicate services.
- Do not invent factual travel information.
- Keep AI orchestration separate from deterministic business logic.
- Build one logical piece at a time, test it, and inspect the diff.

# RUDRA — Backend, APIs & Transportation Integrations

## Own
- `backend/` backend/API wiring assigned to Rudra
- external integrations
- `backend/app/transport/`
- assigned transport API routes
- `backend/tests/transport/`
- transport implementation documentation

## Build order
1. Transport contracts/types
2. Provider adapter interface
3. Verified provider implementations
4. Normalization
5. Transport planning/service
6. Transport API
7. Failure/fallback handling
8. Tests

## What the backend and transport layer means
Provider-specific data must be normalized into a common O-Travelz transport model.

A journey can be:
`walk -> bus -> walk`
or
`walk -> auto -> train -> walk`

Preserve whether information is STATIC, SCHEDULED, or LIVE.

Do not fake integrations for AMA BUS/Mo Bus, Mo E-Ride, or Odisha Yatri. Use only verified sources/APIs.

## Claude/Codex prompt
```text
You are implementing O-Travelz transportation backend code.

Read START_HERE.md, the six canonical documents, docs/team/RUDRA.md, and all transportation contracts.

Work only on Rudra-owned transport files. Use the provider adapter interface and normalize provider results into the shared transport model. Preserve static/scheduled/live status. Never invent routes, schedules, fares, or provider APIs.

Keep Smarak's ranking, itinerary, and AI orchestration outside the backend integration
and transport-provider layer. Keep Deeptiman's frontend and Susmita's map/geospatial
implementation outside it. Add tests for normalization, multimodal journeys, missing
data, provider failure, and freshness/status.
```

## Done
- [ ] Provider abstraction exists
- [ ] Verified providers are implemented appropriately
- [ ] No fake API integrations
- [ ] Results normalize correctly
- [ ] Multimodal journeys work
- [ ] Static/scheduled/live status survives
- [ ] Failure states are handled
- [ ] Transport API is tested
