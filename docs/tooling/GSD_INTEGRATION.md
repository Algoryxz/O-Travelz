# GSD Core Integration — O-TRAVELZ

## Overview

GSD (Git. Ship. Done.) is integrated into O-TRAVELZ as a meta-prompting and lifecycle orchestration framework. It operates in strict alignment with O-TRAVELZ's deterministic roadmap, anti-vibe-code principles, and multidimensional truth model.

---

## Installation & Runtime Specification

- **Package**: `@opengsd/gsd-core` (Version: `1.13.0`)
- **Runtime**: `antigravity`
- **Installation Path**: `C:\Users\smara\.gemini\antigravity\gsd-core`
- **Skills Path**: `C:\Users\smara\.gemini\config\skills\` (72 installed skills)
- **Configuration Defaults**: `~/.gsd/defaults.json` (`"runtime": "antigravity"`, `"resolve_model_ids": "omit"`)
- **Command Namespace**: `/gsd-*` (e.g., `/gsd-plan-phase`, `/gsd-execute-phase`, `/gsd-verify-work`, `/gsd-ship`)

---

## Governance & Authority Hierarchy

GSD does **not** replace O-TRAVELZ's existing governance. When executing any task, the following hierarchy strictly governs all actions:

1. **Repository Current Evidence** (`git HEAD`, real source code, passing tests, active schemas)
2. **Canonical V4 Roadmap** (`docs/mobile-v4/ROADMAP.md` & `docs/v4/ROADMAP.md`)
3. **Active Wave / Stage Brief** (e.g., current wave acceptance criteria and hard stops)
4. **GSD Phase Execution Structure** (Phase planning, execution breakdown, verification)
5. **Ralph Execution Loop** (Subordinate iterative worker loop)
6. **Individual Agent Tools & Skills** (Graphify, Ponytail, Mobile platform skills)

---

## Mapping O-TRAVELZ Waves to GSD Phases

O-TRAVELZ uses discrete, hardened milestone waves (e.g., M13, M14, M15, M16). GSD maps onto this structure as follows:

| O-TRAVELZ Wave Concept | GSD Lifecycle Phase | GSD Workflow / Skill | Role & Output |
|---|---|---|---|
| **Wave Authorization** | Milestone Framing | `/gsd-discuss-phase` | User defines scope, boundaries, and acceptance criteria. |
| **Forensic Baseline** | Phase Planning | `/gsd-plan-phase` | Agent verifies `git HEAD`, dependencies, and writes deterministic plan. |
| **Bounded Iteration** | Phase Execution | `/gsd-execute-phase` | Dispatches Ralph loop or direct subagent tasks against plan. |
| **Wave Verification** | Phase Verification | `/gsd-verify-work` | Runs deterministic unit tests, lint, compiler checks, and context validation. |
| **Wave Acceptance** | Phase Delivery | `/gsd-ship` | Emits `reports/<wave>_acceptance.json`, updates docs, triggers Hard Stop. |

---

## Hard-Stop Semantics

GSD must enforce O-TRAVELZ's non-negotiable hard-stop semantics:
- **Never Auto-Advance**: GSD must never autonomously proceed from one wave to the next (e.g., M15 $\rightarrow$ M16) without explicit user authorization.
- **Fail Fast**: If any truth boundary is violated (fake data, unverified coordinates, invented fares, Stage G2 mutation), execution must halt immediately.
- **Human In The Loop**: User approval is required between the plan phase and the execution phase.

---

## Graphify & Ponytail Integration

- **Graphify**: GSD workflows leverage `graphify` knowledge graphs (`graphify-out/`) for structural navigation and AST-level impact analysis. After phase modifications, `graphify update .` maintains graph freshness.
- **Ponytail**: Prior to phase completion, Ponytail audits (`/ponytail-review`, `/ponytail-audit`) ensure zero speculative abstractions, minimal lines of code, and standard-library-first implementations.

---

## What GSD May Write vs. Must Never Overwrite

### What GSD May Write:
- `.planning/` directory files for transient session tracking (`.planning/STATE.md`, `.planning/phases/`)
- Temporary task PRDs in `docs/tasks/`
- Standard acceptance reports under `reports/`

### What GSD Must NEVER Overwrite:
- `docs/mobile-v4/` (Canonical mobile platform documentation)
- `docs/v4/` (Authoritative V4 platform suite)
- `PROJECT_CONTEXT.md` & `AGENTS.md` (Ground-truth architecture rules)
- `SYSTEM_DESIGN.md`, `DATA_QUALITY.md`, `TRANSIT_DATA.md` (Core domain contracts)
- `data/` directory (`data/transport/canonical/`, verified bootstrap catalogs)
- Historic wave acceptance reports in `reports/` (reports are strictly additive)