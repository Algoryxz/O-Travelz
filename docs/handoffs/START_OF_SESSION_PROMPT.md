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

Check the requested work against the canonical documents. If it conflicts with them,
STOP and report the conflict using CURRENT, DOCUMENTED, PROBLEM, PROPOSED CANONICAL
VERSION, OWNER, and DEPENDENTS. Do not guess.

Do not code until the user explicitly tells you to proceed.
```
