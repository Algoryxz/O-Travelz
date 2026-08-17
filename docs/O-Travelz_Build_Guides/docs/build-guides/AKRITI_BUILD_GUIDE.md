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

# AKRITI — Research, Verification & Data

## Own
- `data/places/`
- `data/transport/`
- `data/research/` for working notes and source material
- research/provider-verification parts of `docs/transportation/`

## Build order
1. Confirm research fields against the data schema
2. Research and verify places
3. Record sources and verification dates
4. Research transport providers
5. Separate static/scheduled/live information
6. Mark unavailable/unknown information explicitly
7. Produce seed-ready data
8. Validate before handoff

## What to put in data
Place records should contain the canonical name, category, coordinates, useful verified attributes, source, and freshness/verification information required by the schema.

Transport research must cover:
- AMA BUS / Mo Bus
- Mo E-Ride
- Odisha Yatri
- rail/intercity options where relevant
- other relevant local modes

Never assume an API exists. Record whether information is researched, verified, available via API, scheduled, live, unavailable, or unknown.

## Claude/Codex prompt
```text
You are implementing O-Travelz research and verified data.

Read START_HERE.md, the six canonical documents, docs/team/AKRITI.md, the data schema, and transportation documentation.

Work only on Akriti-owned data/research files. For every factual field, use a reliable source and record source/freshness information in the project's format. Never invent missing information.

For transport providers, distinguish static, scheduled, live, unavailable, and unknown data. Do not assume an API exists.

Validate data against the documented schema and report uncertainties before handoff.
```

## Done
- [ ] Place records are consistent
- [ ] Coordinates are checked
- [ ] Sources are recorded
- [ ] Verification status/date is recorded where required
- [ ] Transport providers researched
- [ ] API availability verified rather than assumed
- [ ] Static/scheduled/live clearly separated
- [ ] Unknown information remains unknown
- [ ] Data is ready for Smarak's import layer
