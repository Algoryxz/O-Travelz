# Ralph Loop for Antigravity — O-TRAVELZ Integration

## Overview

Ralph Loop (`alexj11324.ralph-loop-for-antigravity-updated`) is an iterative execution loop extension for Antigravity. It enables bounded, autonomous iteration cycles against a structured task specification while maintaining fresh agent context per iteration.

---

## Forensic Inspection Baseline

- **RALPH_INSTALLED**: `true`
- **RALPH_VERSION**: `0.7.43`
- **RALPH_PATH**: `C:\Users\smara\.antigravity-ide\extensions\alexj11324.ralph-loop-for-antigravity-updated-0.7.43-universal`
- **RALPH_INVOCATION**:
  - Command Palette: `Ralph: Start Ralph Loop` (`ralph.start`)
  - Pause/Resume: `Ralph: Pause/Resume Ralph Loop` (`ralph.pause`)
  - Stop Gracefully: `Ralph: Stop Ralph Loop` (`ralph.stop`)
  - Emergency Abort: `Ralph: Emergency Stop Ralph Loop` (`ralph.emergency`)
  - Sidebar: Dedicated Ralph Loop Activity Bar container (`ralph-loop-container`)
- **RALPH_CONFIG_PATH**: Workspace `.vscode/settings.json` or User Settings under `ralphLoop.*`
- **RALPH_STOP_CONDITION_MODEL**:
  - Unique completion token generated per run (e.g., `ralph-done-<session_id>`) placed in progress file
  - Stable Threshold: 7 consecutive poll intervals without content growth
  - Backpressure gates: `test`, `lint`, `build` must pass
- **RALPH_MAX_ITERATION_SUPPORT**: `ralphLoop.maxIterations` (configurable integer; bounded to 5–15 for O-TRAVELZ wave tasks)
- **RALPH_GIT_BEHAVIOR**: Supports per-iteration git branching/commit (`ralphLoop.toggleUseGit`). For O-TRAVELZ, auto-commit is kept OFF during active iteration and executed atomically after test green.
- **RALPH_AGENT_INVOCATION_MODEL**: Fresh Antigravity cascade session per task iteration reading `docs/tasks/PRD.md`, appending progress to `docs/tasks/progress.txt`.

---

## Hierarchy: Subordinate Execution Loop

Ralph operates strictly as a **subordinate execution engine**. It never defines architecture or chooses milestones independently.

```text
GSD Milestone / Wave Scope
         ↓
Approved GSD Plan (implementation_plan.md)
         ↓
Task Specification (docs/tasks/PRD.md)
         ↓
Ralph Iterative Execution Loop
  [ Read Task → Implement → Run Tests → Log Progress ]
         ↓
Backpressure Verification (Lint + Test + Build)
         ↓
GSD Verification & Wave Acceptance
```

---

## Hard-Stop & Deterministic Safety Rules

Ralph MUST NOT:
1. **Choose a new roadmap wave** or jump to subsequent waves (e.g. M15 $\rightarrow$ M16).
2. **Bypass human/GSD phase approval**.
3. **Continue after a hard stop** or test failure.
4. **Repeatedly rewrite already passing code** without a concrete failure.
5. **Alter canonical transit, coordinates, or staging data** (`data/transport/canonical/`).
6. **Execute unbounded or infinite loops**.

---

## Safe Loop Termination Conditions

The loop must terminate deterministically under any of the following conditions:
1. **Completion Marker**: The agent emits the unique `ralph-done-*` marker into `docs/tasks/progress.txt`.
2. **Acceptance Criteria Met**: All tasks in `docs/tasks/PRD.md` are marked completed.
3. **Backpressure Green**: Configured test, lint, and build commands succeed.
4. **Zero P0/P1 Defects**: No regressions or unresolved errors.
5. **Max Iteration Guard**: Iteration counter reaches configured limit (e.g., 10 iterations).
6. **Hard-Stop Trigger**: Any human interrupt or boundary violation occurs.

---

## Recommended Workspace Configuration

To enforce bounded execution in O-TRAVELZ, configure `.vscode/settings.json`:

```json
{
  "ralphLoop.maxIterations": 10,
  "ralphLoop.pollInterval": "4s",
  "ralphLoop.gracePolls": 5,
  "ralphLoop.taskFile": "docs/tasks/PRD.md",
  "ralphLoop.progressFile": "docs/tasks/progress.txt",
  "ralphLoop.promptFile": "docs/tasks/prompt.md",
  "ralphLoop.enabledBackpressure": [
    "test",
    "lint",
    "build"
  ],
  "ralphLoop.testCommand": "npm test --if-present",
  "ralphLoop.lintCommand": "npm run lint --if-present",
  "ralphLoop.buildCommand": "npm run build --if-present"
}
```