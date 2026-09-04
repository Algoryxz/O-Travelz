# AGENTS.md — O-TRAVELZ Coding Agent Operating Rules

> Read this file before making any changes to the O-TRAVELZ repository.
> Full context lives in `PROJECT_CONTEXT.md` and the authoritative V4 suite in `docs/v4/`.

---

## Step 1 — Read Context Before Coding

Before changing **any** code in this repository:

1. Read [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) — project background, architecture, and operating rules.
2. Read the authoritative V4 documentation suite in [`docs/v4/`](docs/v4/):
   - [`docs/v4/PRODUCT.md`](docs/v4/PRODUCT.md) — PRD, jobs-to-be-done, multidimensional truth model, anti-vibe-code rules.
   - [`docs/v4/ARCHITECTURE.md`](docs/v4/ARCHITECTURE.md) — platform topology, KMP shared core, Aiven DB runtime.
   - [`docs/v4/DATA_AND_CONTRACTS.md`](docs/v4/DATA_AND_CONTRACTS.md) — verified bootstrap inventory, schemas, OpenAPI sync.
   - [`docs/v4/DESIGN.md`](docs/v4/DESIGN.md) — Modern Odisha Cultural Atlas visual language and tokens.
   - [`docs/v4/MAPS_AND_TRANSPORT.md`](docs/v4/MAPS_AND_TRANSPORT.md) — MapKit, Google Maps SDK, MapLibre GL JS, CRUT truth boundary.
   - [`docs/v4/MEDIA_LANGUAGE_VOICE.md`](docs/v4/MEDIA_LANGUAGE_VOICE.md) — WebP image gates, video pipeline, Odia localization.
   - [`docs/v4/SKILLS_AND_TOOLING.md`](docs/v4/SKILLS_AND_TOOLING.md) — approved local and task-specific skills.
   - [`docs/v4/RELEASE_AND_QA.md`](docs/v4/RELEASE_AND_QA.md) — hardware validation protocol, allowed UI network states.
   - [`docs/v4/ROADMAP.md`](docs/v4/ROADMAP.md) — 5-stage platform execution plan.
3. Read [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md) if modifying backend service boundaries or introducing new modules.
4. Read [`DATA_QUALITY.md`](DATA_QUALITY.md) if touching destinations, images, or publishability logic.
5. Read [`TRANSIT_DATA.md`](TRANSIT_DATA.md) if touching Mo Bus / Ama Bus stops, routes, schedules, or the transit graph.

---

## Step 2 — Inspect Before Editing

6. Inspect the **current Git HEAD** of relevant files. Do not assume state from documentation alone.
7. Check recent `git log` for the affected module when the change involves a previously known bug or recent refactor.
8. Current code and verified data **always** win over stale documentation.

---

## Critical Rules

### What this project is
- **O-TRAVELZ V4**: An intelligent travel platform and digital cultural atlas for Odisha, built by Algoryxz.
- Active Rebuild Priority: 1. Docs Sync $\rightarrow$ 2. Web V4 $\rightarrow$ 3. iOS V4 $\rightarrow$ 4. Android V4 $\rightarrow$ 5. QA.

### What not to do
- Do NOT rebuild the project from scratch or discard working backend logic.
- Do NOT fabricate travel data, transit stops, coordinates, or fares.
- Do NOT invent bus fares (fares are strictly `null` until official fare tables are ingested).
- Do NOT present scheduled timetable data as live GPS vehicle tracking.
- Do NOT use the phrases "real-time bus location" or "live arrival" unless genuine vehicle telemetry is implemented.
- Do NOT publish a destination to the public catalog without a verified, authentic image (`NO VERIFIED IMAGE = NO PUBLIC DESTINATION`).
- Do NOT make AI the source of canonical facts (coordinates, schedules, phone numbers, opening hours).
- Do NOT introduce purple/neon gradients, fake counters, fake reviews, or AI-generated tourist photos (Anti-Vibe-Code Rules).
- Do NOT introduce new Azure dependencies (Azure is deprecated / retirement in progress).
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

### Transit — One Source of Truth
There must be ONE canonical transit dataset (`data/transport/canonical/`). Frontend and mobile fallback data must be generated from or directly consume the canonical transit files.

### Deterministic Parity Contract
The KMP shared core (`mobile/shared/`) provides **deterministic domain parity for shared fixtures**. Mathematical outputs, bounding box classifications, timetable evaluations, and first-mile distance bands evaluate identically across platforms.

### Documentation Update Rule
If a code change materially alters architecture, database schemas, API contracts, truth semantics, or platform capabilities, update the relevant document in `docs/v4/` in the same commit.
