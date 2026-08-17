# Akriti — Research, Verification & Verified Source Data

## Read first
- `docs/transportation/01-providers.md`
- `docs/transportation/00-transport-model.md` (just the "data tiers" section)
- `data/README.md`

## What you build

You own research, verification, places, sources, and transport research. Nothing
downstream is allowed to guess at facts — it all comes from what you collect and verify
here. This is real research work: check official
sources, government/transit authority sites, published timetables, on-the-ground
knowledge — not AI-generated guesses.

Smarak owns the database implementation and data semantics that store this information.
Rudra owns backend/API integrations and routing. Do not implement database behavior or
transport-provider integrations here.

### Files you create

- `docs/transportation/01-providers.md` — **fill in the template** for every provider
  listed (Mo Bus/AMA Bus, Mo E-Ride, Odisha Yatri, Auto/e-rickshaw, Taxi, Train). For
  each: does an API/open data feed exist, what's the best available substitute if not,
  who verified it and when.
- `data/places/places.json` — list of places (temples, museums, markets, parks, food
  spots) with: name, category, lat/lon, description, opening_hours (omit field
  entirely if genuinely unknown — don't guess), avg_visit_minutes, price_tier, source
  (URL or "on-the-ground, verified <date>").
- `data/places/categories.json` — the category list referenced above.
- `data/transport/static/<provider>.json` — one file per provider with stops and routes
  (topology: which stops each route visits, in order). Shape defined in
  `data/transport/static/README.md` (create this too, documenting the exact JSON shape
  you're using so Smarak's import script and Rudra's adapters can rely on it).
- `data/transport/static/<provider>_schedule.json` — where real timetables exist,
  digitize them; where they don't, record headway estimates
  (`{"headway_minutes_min": 15, "headway_minutes_max": 20, "hours": "06:00-21:00"}`)
  instead — and say so explicitly, don't leave it ambiguous.
- `data/transport/fares/<provider>_fares.json` — fare rules (flat / distance-banded /
  route-specific) with source.

## Files you need to read
- `docs/architecture/02-database.md` — so your JSON files map cleanly onto the DB
  entities Smarak will import them into (same field names where possible).

## What must be completed before you start
Nothing — you can start as soon as the doc templates exist (Phase 0, which is quick).
Your work runs in parallel with Smarak's Phase 0.

## What you hand off
- Provider verification doc → Rudra (so he knows which adapters can support scheduled/
  live data vs. static/estimate only).
- `data/places/*`, `data/transport/*` → Smarak (import scripts), and indirectly to
  everyone downstream.

## Definition of done
- [ ] Every provider in the initial list has a filled-in entry in
      `01-providers.md` — no provider assumed to have an API without evidence.
- [ ] At least ~30–50 real places covering the initial demo area, with verified
      coordinates.
- [ ] At least the 1–2 transport providers most relevant to the demo scenario have
      usable static (stop/route) data, even if schedule data is estimate-only.
- [ ] Every data file has a `source` field on every record — no unsourced facts.

## Checklist
[ ] Provider verification doc filled in for all 6 initial providers
[ ] `data/places/places.json` + `categories.json` created with sources
[ ] `data/transport/static/README.md` documents the JSON shape
[ ] Static stop/route data for demo-relevant providers
[ ] Schedule data (real or explicit headway-estimate) for demo-relevant providers
[ ] Fare data for demo-relevant providers
[ ] Handed off to Smarak, confirmed import script runs cleanly against it

## Reusable AI-start prompt

```text
You are assisting Akriti on O-Travelz research and verification.

Before coding, read docs/PRD.md, docs/RULES.md, docs/ARCHITECTURE.md, docs/PHASES.md,
docs/MEMORY.md, docs/REPOSITORY_MAP.md, docs/team/AKRITI.md, the Akriti build guide,
the latest relevant handoff, and the latest relevant phase completion report.

Report the current phase, status, task, dependencies, blockers, and next action. Work
only on verified research, places, sources, and transport research. Do not implement
database behavior, backend APIs, provider integrations, routing, AI, frontend, or maps.
Never invent travel facts or provider capabilities. If the request conflicts with the
canonical documents, STOP and report the conflict. Do not code until the user says to
proceed.
```
