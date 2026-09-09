# Roo Code in VS Code — O-TRAVELZ Integration

## Overview

Roo Code (`rooveterinaryinc.roo-cline`, v3.54.0) operates in VS Code as an alternate implementation, secondary review, and deep-dive diagnostic agent for O-TRAVELZ.

---

## Environment & Extension Baseline

- **Host Editor**: VS Code `1.134.0`
- **Extension ID**: `rooveterinaryinc.roo-cline`
- **Extension Version**: `3.54.0`
- **Configuration Storage**: `C:\Users\smara\AppData\Roaming\Code\User\globalStorage\rooveterinaryinc.roo-cline`
- **Custom Modes Support**: Architect, Code, Ask, Test, and custom domain modes.

---

## The Single-Writer Worktree Concurrency Rule

> **CRITICAL RULE**: ONLY ONE WRITE AGENT MAY OWN THE WORKING TREE AT ANY TIME.

| Agent State | Antigravity IDE | VS Code (Roo Code) |
|---|---|---|
| **Antigravity Writing** | Active Primary Writer | **READ / REVIEW ONLY** (Ask/Architect Mode) |
| **Roo Code Writing** | **PAUSED / READ ONLY** | Active Primary Writer (Code Mode) |
| **Simultaneous Work** | Isolated Git Worktree A | Isolated Git Worktree B |

Never permit Antigravity and Roo Code to autonomously edit the same file, branch, or working tree concurrently.

If concurrent work is ever required, spawn an isolated git worktree:
```bash
git worktree add ../o-travelz-roo-experiment -b roo/experiment-branch
```

---

## Recommended Roo Code Roles in O-TRAVELZ

1. **Independent Secondary Code Review**: Review Antigravity wave PR diffs before merge.
2. **Targeted Subsystem Refactoring**: Execute self-contained refactoring tasks derived from an approved GSD plan.
3. **Failing-Test Diagnosis**: Deep-dive into failing Kotlin / Swift / Jest test suites with isolated tracing.
4. **Platform-Specific Architecture Audits**: Inspect Compose / SwiftUI component trees for recomposition loops or state leaks.

---

## Non-Negotiable Operating Constraints

When operating in Roo Code, the agent must strictly adhere to:
- **`AGENTS.md` & `PROJECT_CONTEXT.md`**: Canonical project architecture and constraints.
- **Truth Boundaries**: No fabricated transit stops, no invented bus fares, no fake GPS telemetry, no synthetic review counters.
- **Stage G2 Lockdown**: Production data migrations and canonical data files (`data/transport/canonical/`) are strictly protected.
- **Hard-Stop Protocol**: Respect milestone boundaries and stop immediately when acceptance criteria are met.