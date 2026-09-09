# Development Toolchain Orchestration Contract — O-TRAVELZ

## Overview

This contract establishes the unified operating model for all AI development tools and agents in O-TRAVELZ: **GSD Core**, **Ralph Loop**, **Antigravity**, **Roo Code**, **CodeRabbit**, **Graphify**, and **Ponytail**.

Each tool fulfills a distinct, non-overlapping responsibility in the platform engineering lifecycle.

---

## Tool Roles & Responsibilities Matrix

| Tool / Agent | Architectural Role | Scope of Authority | Primary Output |
|---|---|---|---|
| **GSD Core** | Lifecycle & Orchestration Engine | Milestone framing, phase decomposition, plan gating, and ship verification. | `.planning/` state, execution plans, phase gates. |
| **Antigravity** | Primary Implementation Agent | Interactive planning, high-context code authoring, and forensic investigations. | Production code, unit tests, bug fixes. |
| **Ralph Loop** | Bounded Iterative Executor | Autonomous task execution loops against structured PRD specs. | Iterative test-driven commits. |
| **Roo Code** | Alternate & Review Agent | Secondary code review, isolated refactoring, deep-dive test diagnostics. | Review feedback, targeted refactors. |
| **CodeRabbit** | Independent Automated PR Reviewer | Pull request gate, static analysis, security/regression detection. | PR review comments, AST lint warnings. |
| **Graphify** | Repository Knowledge Graph | AST analysis, relationship mapping, and structural dependency querying. | `graphify-out/` knowledge graph. |
| **Ponytail** | Architecture & Simplicity Discipline | Over-engineering auditing, dead-code elimination, stdlib-first enforcement. | Ponytail audit ledgers and simplification diffs. |

---

## Canonical Milestone Lifecycle

```text
               1. USER AUTHORIZES WAVE (e.g. M16)
                             ↓
                 2. GSD DISCUSS / PLAN PHASE
                             ↓
              3. ANTIGRAVITY FORENSIC BASELINE SYNC
          (Verify git HEAD, verify tests, check context)
                             ↓
               4. GSD APPROVED EXECUTION PLAN
                    (implementation_plan.md)
                             ↓
             5. RALPH BOUNDED IMPLEMENTATION LOOP
               (docs/tasks/PRD.md → progress.txt)
          (Bounded to 5-15 iterations; fresh context per task)
                             ↓
                 6. LOCAL TESTS, LINT & BUILD
                             ↓
          7. OPTIONAL ROO CODE SECOND-AGENT REVIEW
                             ↓
            8. PONYTAIL / PROJECT-SPECIFIC AUDIT
          (Check simplicity, no fake data, no dead code)
                             ↓
               9. ATOMIC GIT COMMIT & PULL REQUEST
                             ↓
            10. CODERABBIT INDEPENDENT REVIEW GATE
                             ↓
       11. RECONCILE ONLY EVIDENCE-BACKED FINDINGS
                             ↓
               12. FINAL GSD VERIFY & SHIP
          (Emit acceptance report: reports/<wave>_acceptance.json)
                             ↓
                   13. EXPLICIT HARD STOP
```

---

## Agent Collision Prevention Rules

To prevent merge conflicts, data corruption, and race conditions, the following rules are strictly binding:

1. **Single-Writer Working Tree Rule**: Only ONE agent may execute write operations on a git worktree at any given time.
   - When Antigravity writes $\rightarrow$ Roo is Read/Review Only.
   - When Roo writes $\rightarrow$ Antigravity is Paused or Read Only.
2. **Never Parallelize Critical Shared Files**: Multiple agents must NEVER concurrently edit:
   - Database migrations (`alembic/`, `Room` schemas, `SwiftData` models)
   - Dependency manifests (`package.json`, `build.gradle.kts`, `libs.versions.toml`, `Package.swift`)
   - Project configuration files (`project.pbxproj`, `.coderabbit.yaml`)
   - Canonical truth data (`data/transport/canonical/`)
3. **Isolated Worktree Isolation**: If concurrent agent experimentation is strictly necessary, each agent must operate in a completely separate git worktree:
   ```bash
   git worktree add ../o-travelz-experiment-a -b experiment/agent-a
   git worktree add ../o-travelz-experiment-b -b experiment/agent-b
   ```

---

## Secret & Permission Hygiene

- All private API keys, database credentials, OAuth tokens, and MCP configurations must reside exclusively in local user stores (`~/.gemini/`, `~/.vscode/`, `.env.local`).
- No agent is permitted to commit secrets or tokens to the repository.
- `.gitignore` coverage protects all local storage and temporary build artifacts.