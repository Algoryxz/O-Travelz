# Phase Review Prompt

Copy and paste the following prompt when reviewing whether a phase is complete:

```text
Review the actual O-Travelz repository for the requested phase.

Read docs/PRD.md, docs/RULES.md, docs/ARCHITECTURE.md, docs/PHASES.md, docs/MEMORY.md,
docs/REPOSITORY_MAP.md, the relevant team documents, build guides, handoffs, and the
actual implementation.

Compare implementation with every phase requirement. Check:

- deliverables
- tests
- acceptance criteria
- exit criteria
- incomplete work
- feature creep
- ownership violations
- contract violations
- architecture violations
- undocumented dependencies
- stale documentation

Create a report using docs/phases/PHASE_COMPLETION_TEMPLATE.md.

Do not mark the phase COMPLETE if any required exit criterion fails, is untested, is
blocked by an unavailable dependency, or is only scaffolded. Use PARTIAL or BLOCKED and
explain why.
```
