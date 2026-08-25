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

Separate engineering acceptance from research closure. Mark engineering acceptance
COMPLETE only when the applicable exit criteria are verified by actual evidence. If the
canonical gate permits explicit unknown or unresolved research states, report those
under Research closure status rather than treating them as engineering failures. Use
PARTIAL or BLOCKED when an engineering criterion is actually missing, untested, or
unavailable. Do not infer a pass from intention or scaffolding.

Record the review in Markdown using the phase completion template and create handoffs for
the next phase owners.
```
