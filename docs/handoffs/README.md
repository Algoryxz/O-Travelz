# Session Handoffs

This directory is the operational handoff system for O-Travelz. Every meaningful
developer or AI session should leave a concise, factual handoff so the next person can
continue without the original conversation.

## Files

- `TEMPLATE.md` — session handoff template.
- `TASK_COMPLETION_TEMPLATE.md` — task-level completion record.
- `START_OF_SESSION_PROMPT.md` — reusable prompt for beginning work.
- `END_OF_SESSION_PROMPT.md` — reusable prompt for closing work.
- `PHASE_REVIEW_PROMPT.md` — reusable prompt for reviewing a phase.
- `SCOPE_CHECK_PROMPT.md` — reusable anti-feature-creep and ownership check.

Phase completion reports use `docs/phases/PHASE_COMPLETION_TEMPLATE.md`.

## Handoff rules

- Record actual work, not intended work.
- Use exactly one status: `COMPLETE`, `PARTIAL`, `BLOCKED`, or `DEFERRED`.
- List every created, modified, and deleted file.
- State tests run, test results, failed tests, unavailable tools, known problems, and
  incomplete work.
- Record contract, architecture, ownership, dependency, or phase changes explicitly.
- Update `docs/MEMORY.md` when project state changes.
- Update `docs/REPOSITORY_MAP.md` when paths, ownership, or phase placement changes.
- Never mark a task or phase complete when its criteria are not verified.

Recommended handoff filename:

```text
YYYY-MM-DD_<PERSON>_<short-topic>.md
```

Do not use handoffs to create a competing source of truth. Canonical decisions belong in
the six files listed in `START_HERE.md`; handoffs record what happened and point back to
those decisions.
