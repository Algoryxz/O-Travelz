# O-TRAVELZ Documentation Index

This directory and the root-level context files form the shared documentation layer for O-TRAVELZ.

---

## Canonical Context Files (root directory)

| File | Purpose | Who reads it |
|---|---|---|
| [`/PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) | **Primary source of truth.** Full project background, architecture, verified product capabilities, operating rules. | All coding assistants, all team members |
| [`/AGENTS.md`](../AGENTS.md) | Concise operating rules for AI coding agents. Points to PROJECT_CONTEXT.md. | All coding assistants |
| [`/ROUND2_TEAM.md`](../ROUND2_TEAM.md) | Team role assignments, 30-district regional ownership, and research guidelines. | All team members, regional researchers |
| [`/ROUND2_PLAN.md`](../ROUND2_PLAN.md) | Ordered implementation checkpoints with task status tracking. | All coding assistants, team leads |
| [`/SYSTEM_DESIGN.md`](../SYSTEM_DESIGN.md) | Service boundary documentation: what each domain owns and does not own. | When modifying architecture or introducing modules |
| [`/DATA_QUALITY.md`](../DATA_QUALITY.md) | Destination publishability requirements and image validation pipeline. | When touching places, images, or catalog gates |
| [`/TRANSIT_DATA.md`](../TRANSIT_DATA.md) | Canonical transit data model, current inventory, stop/route specifications, operating rules. | When touching Mo Bus / Ama Bus data, stops, routes, schedules |
| [`/DEMO_RUNBOOK.md`](../DEMO_RUNBOOK.md) | Demo startup procedure, service level definitions, fallback flows, sample prompts. | Before any demo; when modifying startup or environment |

---

## Tool-Specific Entry Points (root directory)

These files are intentionally minimal. They point to the canonical context above.
**Never duplicate project context in these files.**

| File | Tool |
|---|---|
| [`/CLAUDE.md`](../CLAUDE.md) | Claude / Claude Code |
| [`/GEMINI.md`](../GEMINI.md) | Gemini / Antigravity IDE |
| [`/.github/copilot-instructions.md`](../.github/copilot-instructions.md) | GitHub Copilot / Cursor / Windsurf / VS Code AI |

For other tools (Codex, future agents): read `PROJECT_CONTEXT.md` and `AGENTS.md` directly.

---

## Round 2 Regional Research Staging & Validation

Regional destination research is staged in:

- `data/research/round2/eastern/` — Eastern region (Lead: Rudra)
- `data/research/round2/western/` — Western region (Lead: Akriti)
- `data/research/round2/southern/` — Southern region (Lead: Susmita)
- `data/research/round2/northern/` — Northern region (Lead: Punam)
- `data/research/round2/schema/` — Canonical JSON Schemas (`candidate.schema.json`, `source.schema.json`)

**Validation tool**:
```bash
python scripts/validate_round2_research.py
```

---

## Research Artifacts (not documentation)

Research and analysis outputs are stored in `data/research/`. These are **inputs to pipelines**, not production documentation:

- `data/research/transit/` — transit extraction reports, geocoding review, route/stop research
- `data/research/food/` — food and restaurant research
- `data/images/sources/` — image manifest, audit data, rejected candidates

Do not treat research artifacts as authoritative product documentation.
When research data becomes canonical, it moves to `data/transport/canonical/` or `data/places/places.json` with proper provenance.

---

## Update Policy

When a code change materially changes any documented behavior, dataset count, or capability:
**update the relevant canonical document in the same commit.**

Do not leave documentation knowingly stale.
When documentation conflicts with code: current code + current data wins.
