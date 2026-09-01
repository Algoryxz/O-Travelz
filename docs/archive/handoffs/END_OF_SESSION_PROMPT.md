# End-of-Session Prompt

Copy and paste the following prompt when closing a developer or AI session:

```text
Before ending this session, inspect the actual repository changes.

1. Compare changed files with docs/PRD.md, docs/RULES.md, docs/ARCHITECTURE.md,
   docs/PHASES.md, docs/MEMORY.md, and docs/REPOSITORY_MAP.md.
2. Check for feature creep, ownership violations, contract changes, architecture changes,
   and work that entered a forbidden phase.
3. Run the relevant tests where possible.
4. Report every test run, pass, failure, skip, unavailable dependency, and limitation.
5. Create a session handoff using docs/handoffs/TEMPLATE.md and, for meaningful work,
   a task or phase report using the corresponding template.
6. Update docs/MEMORY.md when actual project state changed.
7. Update docs/REPOSITORY_MAP.md when paths, ownership, or phase placement changed.
8. Update phase tracking only when evidence supports the change.

Use exactly one status: COMPLETE, PARTIAL, BLOCKED, or DEFERRED.

The report must include: Task, Owner, Phase, Objective, Dependencies, Scope, Files
changed, Implementation summary, Decisions, Contracts affected, Tests run, Test
results, Database/data changes, Research/source changes, Known limitations, Unresolved
questions, Blockers, Handoff, Next action, and Timestamp. Create/update a handoff for
every dependent owner.

Never claim scaffolded work is complete. Never hide failed tests. Distinguish completed
work, incomplete work, blockers, open decisions, and recommended next steps.
```
