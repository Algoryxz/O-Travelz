# Claude Instructions — O-TRAVELZ

Before making any changes to this codebase, read these documents in order:

1. [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) — canonical project background, architecture, and operating rules
2. [`AGENTS.md`](AGENTS.md) — coding agent operating rules and critical constraints
3. [`ROUND2_PLAN.md`](ROUND2_PLAN.md) — current checkpoint status and ordered implementation plan

Then read domain-specific documentation when your task touches those areas:

| Task area | Read |
|---|---|
| Service boundaries, new modules | [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md) |
| Places, images, publishability | [`DATA_QUALITY.md`](DATA_QUALITY.md) |
| Transit stops, routes, schedules | [`TRANSIT_DATA.md`](TRANSIT_DATA.md) |
| Demo startup, environment, fallbacks | [`DEMO_RUNBOOK.md`](DEMO_RUNBOOK.md) |

---

## Critical reminders

- This is an **existing Round 2 prototype**, not a greenfield project.
- Do NOT rely on conversation memory over current repository state. Always inspect `git HEAD` first.
- Do NOT fabricate transit data, coordinates, or bus fares.
- Do NOT present scheduled timetable data as live GPS tracking.
- Do NOT publish a destination without a verified image.
- AI interprets intent; deterministic services own canonical facts.
- After any code change: run focused tests, run `tsc` if frontend, leave repo runnable.

When documentation conflicts with code: **current code + verified data wins**. Update docs accordingly.
