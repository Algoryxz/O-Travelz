# AGENTS.md — O-TRAVELZ Coding Agent Operating Rules

> Read this file before making any changes to the O-TRAVELZ repository.
> This file is intentionally concise. Full context lives in `PROJECT_CONTEXT.md`.

---

## Step 1 — Read Context Before Coding

Before changing **any** code in this repository:

1. Read [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) — project background, architecture, and operating rules.
2. Read [`ROUND2_PLAN.md`](ROUND2_PLAN.md) — current checkpoint status and ordered implementation plan.
3. Read [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md) if modifying service boundaries or introducing new modules.
4. Read [`DATA_QUALITY.md`](DATA_QUALITY.md) if touching destinations, images, or publishability logic.
5. Read [`TRANSIT_DATA.md`](TRANSIT_DATA.md) if touching Mo Bus / Ama Bus stops, routes, schedules, or the transit graph.
6. Read [`DEMO_RUNBOOK.md`](DEMO_RUNBOOK.md) if modifying startup, environment, or demo behavior.

---

## Step 2 — Inspect Before Editing

7. Inspect the **current Git HEAD** of relevant files. Do not assume state from documentation alone.
8. Check recent `git log` for the affected module when the change involves a previously known bug or recent refactor.

---

## Critical Rules

### What this project is
- An **existing Round 2 prototype**, not a greenfield project.
- Round 1 is complete. The team has qualified for Round 2.

### What not to do
- Do NOT rebuild the project from scratch.
- Do NOT introduce a new framework without an explicit decision.
- Do NOT perform large architectural rewrites unless they improve correctness, reliability, or Round 2 delivery.
- Do NOT fabricate travel data, transit stops, coordinates, or fares.
- Do NOT invent bus fares (current fare dataset is universally null/unknown).
- Do NOT present scheduled timetable data as live GPS tracking.
- Do NOT use the phrase "real-time bus location" or "live arrival" unless genuine telemetry is implemented.
- Do NOT publish a destination to the public catalog without a verified usable image.
- Do NOT treat research/staging data as automatically production-ready.
- Do NOT make AI the source of canonical facts (coordinates, schedules, phone numbers, opening hours).
- Do NOT silently delete or downgrade working functionality.

### What the AI owns
AI (conversation, intent parsing, multilingual) owns:
- Intent understanding
- Natural language interpretation
- Explanation of deterministic plan output
- Conversational refinement

AI does NOT own:
- Coordinates
- Route numbers
- Schedules
- Opening hours
- Fares
- Itinerary facts

### Transit — one source of truth
There must be ONE canonical transit dataset.
Do not independently maintain a separate backend transit universe and a different frontend transit universe.
Frontend fallback data must be generated from or directly consume the canonical canonical transit files.

### Images — hard rule
> **NO VERIFIED IMAGE = NO PUBLIC DESTINATION.**

A place may remain in staging but must not appear in the production catalog without at least one validated, relevant, high-quality image.

### After every meaningful change
- Run focused unit tests for the changed module.
- Run the broader test suite after significant changes.
- Run `tsc` (TypeScript check) after frontend changes.
- Ensure the repository remains runnable.

### Commit discipline
- Prefer small atomic commits.
- Each commit must leave the app in a runnable state.
- Do not commit `.env` files or secrets.
- Do not mix documentation-only changes with code changes in the same commit.

---

## When Documentation Conflicts with Code

> **Current code + current verified data wins.**

Update documentation when you discover the code has diverged from what is documented.
Do not silently accept stale documentation as fact.

---

## Documentation Update Rule

If a code change materially changes any of the following, update the relevant canonical document **in the same commit**:

- Architecture or service boundaries (`SYSTEM_DESIGN.md`)
- Dataset record counts or coverage (`PROJECT_CONTEXT.md`, `TRANSIT_DATA.md`)
- Product behavior or claimed functionality (`PROJECT_CONTEXT.md`)
- Publishability rules (`DATA_QUALITY.md`)
- Demo startup procedure (`DEMO_RUNBOOK.md`)
- Supported AI providers (`PROJECT_CONTEXT.md`)
- Transit coverage or stop verification status (`TRANSIT_DATA.md`)

Do not leave documentation knowingly stale after a code change.

---

## Truthfulness Labels

Use explicit labels in UI and API responses where data is not fully live:

| Type | Label to use |
|---|---|
| Verified coordinates | `Verified` |
| Published schedule time | `Scheduled` |
| Haversine/heuristic distance | `Estimated` |
| Live Open-Meteo weather | `Live` |
| Researched static rating | `Researched` |
| Bundled offline data | `Fallback` |
| Curated dataset | `Curated` |
