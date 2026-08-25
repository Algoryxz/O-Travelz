# O-Travelz Build Guides

Use these after reading `START_HERE.md`, the six canonical documents, your personal file
in `docs/team/`, current `docs/MEMORY.md`, the latest relevant handoff, and the latest
relevant phase report. Phase 2 engineering acceptance is complete; the canonical Phase 3
gate is satisfied, while AMA research closure remains explicitly open.

- `SMARAK_BUILD_GUIDE.md` — core brain, database, semantics, ranking, itinerary, AI orchestration
- `AKRITI_BUILD_GUIDE.md` — research and verified data
- `RUDRA_BUILD_GUIDE.md` — backend, APIs, integrations, providers, routing
- `PUNAM_BUILD_GUIDE.md` — documentation, project context, phases, evidence, demo, release readiness
- `DEEPTIMAN_BUILD_GUIDE.md` — complete frontend and user experience
- `SUSMITA_BUILD_GUIDE.md` — maps, geospatial, routes, route lines, multimodal visualization

Each guide contains:
- what to build
- what each major area/file means
- build order
- what not to put there
- a ready-to-copy Claude/Codex prompt
- definition-of-done checklist

Team-wide rule: inspect the diff after AI-generated changes and do not allow unrelated
ownership changes. If the requested work conflicts with the canonical project documents,
stop and report the conflict instead of guessing.

Every meaningful task must produce Markdown evidence. Before work, record planned files,
dependencies, and ownership boundaries. During work, record decisions, blockers, tests,
and unresolved questions. After work, inspect `git diff`/`git status`, run relevant tests,
create/update a task/session/phase report, record files and results, and create a handoff
for dependent agents. Update MEMORY only for actual state changes and REPOSITORY_MAP only
when actual paths change.
