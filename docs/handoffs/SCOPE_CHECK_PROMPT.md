# Scope Check Prompt

Copy and paste the following prompt before implementing a requested change:

```text
Check this requested change against the actual O-Travelz repository and canonical docs.

Report exactly:

SCOPE: APPROVED / BLOCKED / UNCLEAR
OWNER:
PHASE:
FILES:
DEPENDENCIES:

FEATURE CREEP: YES / NO
OWNERSHIP CONFLICT: YES / NO
CONTRACT CONFLICT: YES / NO
ARCHITECTURE CONFLICT: YES / NO

Read docs/PRD.md, docs/RULES.md, docs/ARCHITECTURE.md, docs/PHASES.md,
docs/MEMORY.md, docs/REPOSITORY_MAP.md, the relevant team document, and the relevant
build guide before deciding.

If any conflict is YES, or if SCOPE is UNCLEAR, STOP. Report:

CURRENT:
DOCUMENTED:
PROBLEM:
PROPOSED CANONICAL VERSION:
OWNER:
DEPENDENTS:

Do not implement until the user explicitly resolves the conflict.

If implementation is approved, keep a Markdown task/session report. Before work record
the planned files, dependencies, and ownership boundary; during work record decisions,
tests, blockers, and unresolved questions; after work record the diff, exact test
results, files changed, limitations, handoff, and next action.
```
