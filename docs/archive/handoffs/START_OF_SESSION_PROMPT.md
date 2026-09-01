# Start-of-Session Prompt

Copy and paste the following prompt into ChatGPT, Claude, Codex, Cursor, Copilot, or
another coding assistant before asking it to work:

```text
You are assisting with the O-Travelz repository.

Do not write code yet. First inspect the actual repository and read these files in order:

1. docs/PRD.md
2. docs/RULES.md
3. docs/ARCHITECTURE.md
4. docs/PHASES.md
5. docs/MEMORY.md
6. docs/REPOSITORY_MAP.md
7. the relevant file in docs/team/
8. the relevant build guide in docs/O-Travelz_Build_Guides/docs/build-guides/
9. the latest relevant session handoff in docs/handoffs/
10. the latest relevant phase completion report in docs/phases/

If an item does not exist, report that it is missing; do not invent it.

After reading, report:

- current phase
- project status
- your person's role
- your person's ownership
- the current task
- previous relevant work
- dependencies
- blockers
- the next action you recommend

Before work begins, state the change you plan to make, the files you expect to touch,
the dependencies you rely on, and the ownership boundaries that constrain the work.

During work:

- keep implementation within the assigned ownership and phase;
- record important decisions, blockers, test evidence, and unresolved questions;
- never silently resolve a document conflict or fabricate factual data.

After work:

- inspect `git diff` and `git status`;
- run the appropriate tests and record exact results;
- create or update a Markdown task/session/phase report using the repository templates;
- record files changed, decisions, contracts, database/data effects, limitations,
  blockers, remaining work, and a handoff for dependent agents;
- update `docs/MEMORY.md` only when actual project state changed and
  `docs/REPOSITORY_MAP.md` only when actual paths changed.

Check the requested work against the canonical documents. If it conflicts with them,
STOP and report the conflict using CURRENT, DOCUMENTED, PROBLEM, PROPOSED CANONICAL
VERSION, OWNER, and DEPENDENTS. Do not guess.

Do not code until the user explicitly tells you to proceed.
```
