# O-Travelz Phase 1 — Akriti Final Research Handoff Status

Verification date: 2026-08-17

## Completed in this handoff

- Places v5 retained: 32 verified records.
- Places source/date audit retained: 32/32 sources, 32/32 verification dates, 0 duplicate IDs, 0 placeholders.
- Official CRUT BQS inventory independently captured: 83 published locations.
- AMA Bus current fare page verified: AC and Non-AC fares start at ₹5; current pass rules captured.
- CRUT official source register updated.
- Existing AMA Bus Route 12 secondary topology retained without promoting it to canonical status.
- Historical schedule explicitly retained as historical, not silently presented as the current August 2026 schedule.

## AMA Bus items that are NOT falsely marked complete

The complete canonical Capital Region AMA Bus topology cannot be certified from the files currently
available in the workspace.

CRUT's official Linktree identifies the primary document:
"AMA Bus Detailed Stoppages, Capital Region w.e.f 16th March, 2026"
and the current schedule:
"AMA Bus time Schedule, Capital Region w.e.f. 1st June, 2026".

The document listings are independently visible on CRUT's official Linktree, but the actual PDF contents
were not delivered in the uploaded repository/files and were not exposed as text by the web index.

Therefore this handoff deliberately does NOT invent:
- the complete current stop universe;
- current route-stop ordering;
- canonical stop IDs;
- BQS-to-current-stop reconciliation;
- current June 2026 route schedules.

## Required final inputs to unlock canonical AMA Bus completion

1. The actual March 2026 Detailed Stoppages PDF.
2. The actual August 2026 Capital Region Schedule PDF.
3. The two baseline CSVs referenced by the project context, if they are not intentionally replaced:
   - AMA_MoBus_current_BQS_stop_inventory_research_v1.csv
   - AMA_MoBus_route_stop_extraction_v1_routes86-93.csv

Once those are available, the remaining workflow is deterministic:
Extract → normalize → deduplicate → reconcile → resolve identity → assign canonical IDs →
coordinate audit → schedule audit → final JSON/schema QA.

## Important

This package is a research handoff, not a fabricated "complete" AMA Bus network. Any downstream importer
should treat `ama_bus.json` as PARTIAL until the primary March 2026 stoppage source is digitized.
