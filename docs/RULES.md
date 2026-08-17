# O-Travelz Project Rules

Status: canonical rules for humans and AI coding assistants

These rules apply to every change in the repository. `docs/PRD.md` defines product
scope, `docs/ARCHITECTURE.md` defines system boundaries, `docs/PHASES.md` defines when
work is allowed, and `docs/MEMORY.md` records current state.

## Authority and conflict handling

The authoritative order is:

1. Explicit approved project decisions and the fixed ownership model.
2. The six canonical documents in `docs/`.
3. Supporting architecture, transportation, team, and build-guide documents.
4. Existing implementation, which may be incomplete and must be compared with the
   canonical documents.

If a requested change conflicts with a canonical document, the human or AI assistant
must stop and ask for approval. It must report the conflict as:

```text
CURRENT:
DOCUMENTED:
PROBLEM:
PROPOSED CANONICAL VERSION:
OWNER:
DEPENDENTS:
```

No assistant may silently resolve an architectural, contract, ownership, or product
scope conflict.

## Product and feature rules

- No feature creep.
- A feature is implementable only when it appears in `docs/PRD.md` or has explicit
  approval through the change process.
- Do not add screens, buttons, flows, settings, persistence, profiles, favorites,
  dashboards, admin systems, notifications, social features, or gamification because
  they seem useful.
- Do not convert a future idea or an `OPEN DECISION` into implementation work.
- Do not redesign the application while implementing an approved change.

## Repository and architecture rules

- Use the paths in `docs/REPOSITORY_MAP.md`.
- Do not invent duplicate files, duplicate services, duplicate contracts, or new
  top-level folders.
- Reuse an existing service or contract when one exists.
- Do not improvise architecture inside a feature task.
- Keep AI orchestration separate from deterministic business logic.
- Keep provider integrations separate from ranking, itinerary logic, and AI.
- Keep authoritative geospatial calculations separate from the complete frontend.
- Keep documentation and release coordination separate from implementation ownership.

## Fixed ownership boundaries

- Smarak owns the core brain, database, data semantics, ranking, itinerary logic, and AI
  orchestration.
- Akriti owns research, verification, places, sources, and transport research.
- Rudra owns backend, APIs, external integrations, transportation providers, and
  routing.
- Susmita owns maps, geospatial behavior, routes, route lines, and multimodal map
  visualization.
- Deeptiman owns the complete frontend and user experience.
- Punam owns documentation, shared context, phases, evidence, demo, presentation, and
  release readiness.

Ownership does not transfer because another subsystem consumes an output. Cross-owner
contracts require coordination and an explicit handoff.

## Contract-first development

- Stabilize the database, transport, itinerary, API, AI-tool, frontend/backend, and
  frontend/map contracts before feature implementation.
- Do not silently change an existing contract.
- A contract change must identify its owner, dependents, migration or compatibility
  impact, tests, and documentation update.
- Backend and frontend must test against the same structured itinerary shape.
- Map consumers must use supplied geometry and identifiers rather than inventing facts.

## Phase rules

- Work only in the current phase unless the phase document explicitly allows parallel
  work.
- A later-phase task must not silently enter an earlier phase.
- A phase is complete only when its exit criteria and tests pass.
- A verbal claim that work is done is not an exit criterion.
- Handoffs require the documented deliverable, contract shape, tests, and evidence.
- The current phase and status must be updated in `docs/MEMORY.md` after a major state
  change.

## Testing rules

- Run the tests relevant to every changed area.
- Add or update tests for new behavior and contract changes.
- Backend tests use `pytest`.
- Frontend tests use `vitest` and component tests against contract fixtures.
- AI tests use recorded tool-call transcripts rather than live model calls.
- Transport tests cover normalization, multimodal journeys, missing data, provider
  failure, and data-tier preservation.
- Do not claim a phase is complete when its required test environment is unavailable;
  record the limitation in `docs/MEMORY.md`.

## Documentation rules

- Update the relevant canonical document when a decision or contract changes.
- Keep `docs/MEMORY.md` current with completed, active, blocked, and gated work.
- Keep `docs/REPOSITORY_MAP.md` aligned with actual files and explicitly mark future
  paths as `TO CREATE`.
- Record evidence for architecture decisions and phase completion.
- Supporting documents must not contradict canonical documents.

## AI factuality rules

- AI explains and orchestrates; it does not become a source of travel facts.
- Every factual claim in an AI response must come from a current-turn deterministic tool
  result or verified structured data returned by that tool.
- AI must call a tool for place details, routes, fares, schedules, distances, durations,
  provider status, and geometry.
- If a tool has no answer, AI must say that the information is unavailable or uncertain.
- AI must not invent route numbers, fares, opening hours, travel times, coordinates,
  provider APIs, or live status.
- AI must not hand-edit a structured itinerary to satisfy a follow-up request.

## Dependency rules

- Use the existing dependency choices unless an explicit change is approved.
- A new dependency requires a documented reason, owner approval, compatibility review,
  test impact, and update to the relevant dependency file.
- Do not add a dependency to compensate for an unresolved architecture decision.
- Do not add a provider SDK before provider verification is complete.

## Change approval rules

- Documentation-only changes may update the six canonical documents and their directly
  necessary cross-references.
- Application code must not be changed during a documentation-only task.
- A request that expands scope, changes ownership, changes a contract, or bypasses a
  phase requires explicit approval from the affected owner and Punam's project-context
  record.
- When uncertain, stop and ask rather than guessing.
