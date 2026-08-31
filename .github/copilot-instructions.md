# GitHub Copilot Instructions — O-TRAVELZ

Before generating or modifying O-TRAVELZ code, follow these canonical context files:

- [`/PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) — project background, architecture, verified product truth
- [`/AGENTS.md`](../AGENTS.md) — coding agent rules and critical constraints
- [`/ROUND2_PLAN.md`](../ROUND2_PLAN.md) — current implementation checkpoints

Domain-specific rules:

- [`/SYSTEM_DESIGN.md`](../SYSTEM_DESIGN.md) — service boundaries (when modifying architecture)
- [`/DATA_QUALITY.md`](../DATA_QUALITY.md) — publishability and image pipeline rules (when touching places/images)
- [`/TRANSIT_DATA.md`](../TRANSIT_DATA.md) — canonical transit data model (when touching Mo Bus/Ama Bus)
- [`/DEMO_RUNBOOK.md`](../DEMO_RUNBOOK.md) — demo startup and fallback procedures

---

## Rules

- Do NOT fabricate travel data, transit stops, coordinates, or bus fares.
- Do NOT bypass the image publishability gate — no destination appears without a verified image.
- Do NOT describe scheduled timetable data as live GPS tracking or real-time bus location.
- Do NOT make AI the source of canonical facts (coordinates, schedules, phone numbers).
- There is ONE canonical transit source of truth — do not create a separate frontend transit universe.
- Inspect current `git HEAD` before suggesting changes based on documentation alone.
- Leave the repository in a runnable state after every meaningful change.
