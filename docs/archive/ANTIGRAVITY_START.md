# ANTIGRAVITY_START.md — Antigravity Agent Onboarding & Operating Guide

> **For Antigravity AI Assistants working on O-TRAVELZ (SOA IDEATHON 2026 — Round 2).**
> Read this file immediately when a user opens this repository.

---

## 1. Automatic Teammate & Role Discovery

First, check if `.otravelz-local.json` exists at repository root:

```json
{
  "RoleId": "rudra",
  "Name": "Rudra",
  "Role": "Eastern Odisha Research",
  "Region": "eastern",
  "AssignedPath": "data\\research\\round2\\eastern",
  "Districts": "Cuttack, Jagatsinghpur, Jajpur, Bhadrak, Kendrapara, Dhenkanal, Angul",
  "IsFullMode": false
}
```

If present, adapt all responses and assistance specifically to that teammate's role and assigned domain.

---

## 2. Mandatory Document Reading Order

Before making or proposing any edits:

1. [`AGENTS.md`](AGENTS.md) — Coding agent operating rules and critical project constraints.
2. [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) — Canonical project background, architecture, and current metrics.
3. [`ROUND2_TEAM.md`](ROUND2_TEAM.md) — Team roles, regional ownership, and district assignments.
4. [`ROUND2_PLAN.md`](ROUND2_PLAN.md) — Round 2 implementation checkpoints.
5. Domain-specific documents:
   - For regional researchers: Regional `README.md` in `data/research/round2/<region>/` and schemas in `data/research/round2/schema/`.
   - For transit work: [`TRANSIT_DATA.md`](TRANSIT_DATA.md).
   - For image and catalog work: [`DATA_QUALITY.md`](DATA_QUALITY.md).
   - For architecture and service boundaries: [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md).

---

## 3. Team Roles & Scope

### Regional Researchers (Rudra, Akriti, Susmita, Punam)
- **Scope**: Research, verify, and stage destination candidates and primary sources in your assigned regional directory (`data/research/round2/<region>/`).
- **Files**: Edit `candidates.json` and `sources.json`.
- **Constraint**: Do NOT directly modify `data/places/places.json` (production catalog).
- **Validation**: Always run `.\.venv\Scripts\python.exe scripts\validate_round2_research.py`.

### Core Integration (Deepti, Smarak)
- **Scope**: Production promotion, image pipeline, transit graph, backend/frontend development, and database migrations.
- **Validation**: Full validation suite, unit tests, and production gate checks.

---

## 4. Inviolable Operating Rules

1. **Inspect before editing**: Check current Git HEAD; do not rely on assumptions.
2. **Never fabricate data**: Coordinates must come from OpenStreetMap or official government sources. Never invent fares, schedules, opening hours, or crowd ratings.
3. **No verified image = No public destination**: A place may remain in staging but cannot be promoted to the production catalog without a verified image.
4. **No cross-region staging edits**: Never edit another teammate's regional staging folder without explicit coordination.
5. **Safe Git workflows**: Use `.\scripts\safe_push.ps1` for pushing. Never force push (`--force` / `-f`). Never commit `.env` or secrets.

---

## 5. Standard Helper Commands

| Task | Command |
|---|---|
| Safe Git Push | `powershell -ExecutionPolicy Bypass -File .\scripts\safe_push.ps1 -Message "..."` |
| Pull Latest Updates | `powershell -ExecutionPolicy Bypass -File .\scripts\update_project.ps1` |
| Validate Research Data | `.\.venv\Scripts\python.exe scripts\validate_round2_research.py` |
| Check Project Context | `.\.venv\Scripts\python.exe scripts\check_project_context.py` |
| Run Health Doctor | `powershell -ExecutionPolicy Bypass -File .\doctor.ps1` |
| Start Dev Stack | `powershell -ExecutionPolicy Bypass -File .\scripts\start_dev.ps1` |
