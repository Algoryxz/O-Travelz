# O-Travelz Build Guide

Before starting, read `START_HERE.md`, the six canonical documents, `docs/team/PUNAM.md`,
the latest relevant handoff, and the latest relevant phase completion report.

## PUNAM — Documentation, Shared Context & Release Readiness

## Own
- repository documentation and shared project context
- phase tracking and status reporting
- architecture decisions/documentation records
- evidence and decision logs
- demo and presentation materials
- release/readiness documentation and checklists

## Coordinate with

- Smarak for core-brain, database, data-semantics, ranking, itinerary, and AI decisions
- Rudra for backend/API/integration and routing decisions
- Akriti for research, verification, places, sources, and transport research
- Deeptiman for the complete frontend and user experience
- Susmita for maps, geospatial, routes, route lines, and multimodal visualization

## Do not own

Do not implement ranking, itinerary logic, AI orchestration, backend/API behavior,
transport providers, frontend, or maps.

## Build order

1. Keep the repository map and ownership model current
2. Track phase inputs, outputs, dependencies, and status
3. Record architecture decisions and evidence
4. Maintain contract and cross-team documentation
5. Prepare demo, presentation, and release/readiness materials

## Mandatory Markdown evidence

Before work, read the six canonical documents, the Punam team document, current MEMORY,
the latest relevant handoff/report, and identify dependencies, ownership boundaries, and
planned documentation changes. During work, record decisions, blockers, checks, stale
claims, and unresolved questions. After work, inspect the diff, run relevant checks,
create/update a Markdown task/session/phase report, record files/evidence/limitations,
create dependent-agent handoffs, update MEMORY only for actual state, and update
REPOSITORY_MAP only when actual paths change.

## Done

- [ ] Documentation reflects the canonical ownership model
- [ ] Phase status and dependencies are traceable
- [ ] Architecture decisions have supporting evidence
- [ ] Demo and presentation materials are current
- [ ] Release/readiness checklist is complete
