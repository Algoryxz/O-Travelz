# Akriti → O-Travelz Phase 2 Compatibility Matrix

Audit date: 2026-08-17

This report records the compatibility pass against the repository as it exists in
this checkout. The original ZIPs and their extracted contents are preserved under
the two sibling handoff directories. No PostgreSQL import was performed.

## Preserved handoffs

| Package | Location | SHA-256 |
|---|---|---|
| Places v5.1 | `data/research/handoffs/places_v5.1/O-Travelz_Phase1_places_v5.1_FINAL_HANDOFF.zip` | `4c2405b31ef50d61e3bb7a10517996b0418fcf92e07645b6a5ad516a5e4c568b` |
| Transport final/rechecked | `data/research/handoffs/transport_phase1_final/O-Travelz_Phase1_FINAL_RECHECKED_2026-08-17.zip` | `892a7b1e4a8f1b5332d15f4a94fbd3b721c3e81ad98b5ddfd00b931f8871e20b` |

The transport `MANIFEST.json` contains 29 package files and all listed hashes and
sizes match. `MANIFEST.json` is the manifest itself and is not self-listed.

## Places v5.1

### Verification result

- 32 records retained; 0 duplicate research IDs.
- 9 categories; all 32 category references resolve to `categories.json.id`.
- 8 complete coordinate pairs; 24 paired-null coordinate values; 0 one-sided pairs.
- All non-null coordinates are finite and within geographic ranges.
- 32 sources and 32 date-only `verified_at` values (`2026-08-17`).
- No placeholder records.
- `place_022` uses the Government of Odisha Hindu Religious Endowment Commission
  Ram Mandir source.
- Only Nandankanan retains a structured seasonal opening-hours object. Other
  unsupported hours remain null.

### Field compatibility

| Source field | Current importer field | Database field | Status | Exact reason / required action |
|---|---|---|---|---|
| `id` | none | none | 🔵 KEEP AS RESEARCH/EVIDENCE | Research traceability ID; PostgreSQL UUID remains database-generated. Retained in the original handoff only. |
| `name` | `name` | `places.name` | 🟢 KEEP / IMPORT | Direct mapping; strict non-blank validation passes. |
| `category` | `category` | `places.category_id` | 🟡 TRANSFORM THEN IMPORT | Category references use handoff IDs. They are compatible after deterministic category-ID projection to the current category-name input. |
| `lat` | `lat` | `places.location` Y | 🟢 KEEP / IMPORT | Eight finite values map as `lat → Y`; no axis swap or inference. |
| `lon` | `lon` | `places.location` X | 🟢 KEEP / IMPORT | Eight finite values map as `lon → X`; no axis swap or inference. |
| paired null `lat`/`lon` | paired null `lat`/`lon` | `places.location = NULL` | 🟢 KEEP / IMPORT | Approved nullable-location model and migration permit verified places without defensible coordinates. |
| `description` | `description` | `places.description` | 🟢 KEEP / IMPORT | Direct nullable string mapping. |
| `opening_hours` | `opening_hours` | `places.opening_hours` | 🟢 KEEP / IMPORT | JSON-serializable structured Nandankanan schedule is preserved; unsupported values remain null. |
| `avg_visit_minutes` | `avg_visit_minutes` | `places.avg_visit_minutes` | 🟢 KEEP / IMPORT | All values are null; no value is invented. |
| `price_tier` | `price_tier` | `places.price_tier` | 🟢 KEEP / IMPORT | All values are null; no value is invented. |
| `source` | `source` | `places.source` | 🟢 KEEP / IMPORT | All 32 provenance URLs are retained. |
| `verified_at` | `verified_at` | `places.verified_at` | 🟢 KEEP / IMPORT | Date-only ISO values pass validation and are parsed by the existing importer; no time was added to the source data. |
| `coordinate_verification` | none | none | 🔵 KEEP AS RESEARCH/EVIDENCE | Audit evidence, not a current database field. |
| `coordinate_audit_status` | none | none | 🔵 KEEP AS RESEARCH/EVIDENCE | Audit evidence, not a current database field. |
| `audit_status` | none | none | 🔵 KEEP AS RESEARCH/EVIDENCE | Research QA evidence, not a current database field. |
| `source_provenance_note` | none | none | 🔵 KEEP AS RESEARCH/EVIDENCE | Provenance explanation is retained in the original handoff; required source URL remains canonical. |

### Deterministic Places transformation applied

The repository canonical files were populated from the preserved v5.1 handoff:

- `data/places/categories.json`: `categories[].id` became the existing importer
  `categories[].name` value. Display labels and descriptions were not silently
  substituted for the canonical IDs.
- `data/places/places.json`: retained only the fields accepted by the existing
  importer. Research IDs and audit-only fields remain available in the preserved
  handoff and were not promoted to database columns.

The resulting canonical files validate with `scripts/import_places.py --validate`.

## Transport handoff: file-by-file matrix

The current transport importer consumes JSON topology, schedule, and fare inputs;
it does not promote CSV reconciliation or evidence files. The current `Stop` model
requires a physical location, and the importer intentionally rejects unresolved
stop coordinates before persistence. No transport record was imported or made
importable by weakening that guard.

| File | Actual schema / counts | Canonical model / field mapping | Status | Exact reason | Required action |
|---|---|---|---|---|---|
| `FINAL_RECHECK_QA.json` | QA object; counts 32 places, 83 BQS, 648 regional ordered rows, 354 regional candidates, 36 Route 12 rows; 8 checks | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Explicitly reports incomplete primary topology and `engineering_ready=false`. | Preserve as QA evidence; do not seed. |
| `FINAL_RECHECK_REPORT.md` | Recheck narrative | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Documents June 1, 2026 current schedule reference and missing March detailed-stoppages payload. | Use as handoff evidence. |
| `README.md` | Package scope/status text | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Correctly limits claims and separates incomplete Capital Region topology. | No code action. |
| `MANIFEST.json` | 29 file paths, byte sizes, SHA-256 values | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Integrity manifest; all listed hashes/sizes verified. | Preserve for provenance. |
| `data/README.md` | Data ownership and directory contract | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Package guidance, not seed data. | No code action. |
| `data/places/categories.json` | 9 objects: `id`, `name`, `description` | `Category.name` | 🔵 KEEP AS RESEARCH/EVIDENCE | Duplicate package copy; Places v5.1 handoff is the authoritative place package used for canonicalization. | Do not import this duplicate. |
| `data/places/places.json` | 32 objects with alternate `latitude`, `longitude`, `verification_date` names plus research fields | `Place` | 🔵 KEEP AS RESEARCH/EVIDENCE | Duplicate/stale package copy with a different field contract. Using it would risk replacing final v5.1 semantics. | Use the preserved Places v5.1 package instead. |
| `data/research/Sambalpur_AMA_Bus_route_stop_extraction_v1.csv` | 596 rows; 9 route IDs; UP/DOWN; coordinates empty; status `UNKNOWN` | `Route`, `Stop`, `RouteStop` | 🔵 KEEP AS RESEARCH/EVIDENCE | Regional ordered evidence only; no physical coordinates or canonical stop identities. | Keep evidence; do not seed current Capital Region. |
| `data/research/ama_bus_source_register_2026-08-17.json` | Primary/secondary source registry plus 3 blocked inputs | No direct database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Records source authority and missing primary files. | Preserve; unblock only when primary payloads are available. |
| `data/research/final_correction_note_2026-08-17.md` | Correction narrative | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Records a superseded August schedule claim; must not become current schedule data. | Preserve as audit history. |
| `data/research/final_handoff_recheck_2026-08-17.md` | Recheck corrections and validation narrative | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Confirms Route 12 is not promoted and current schedule times are not digitized. | No import. |
| `data/research/phase1_final_handoff_status_2026-08-17.md` | Completion/blocker narrative | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Explicitly identifies missing CRUT primary topology and schedule payloads. | Preserve blocker evidence. |
| `data/research/places_final_audit_report.md` | Older Places audit text | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Package context and audit history, not transport data. | Do not use as the final Places source. |
| `data/research/places_research_notes.md` | Older Places research notes | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Package context and audit history, not transport data. | Do not use as the final Places source. |
| `data/transport/static/ama_bus.json` | 36 stops, 1 Route 12 sequence, all 36 coordinate pairs null; secondary source | `TransportProvider`, `Stop`, `Route`, `RouteStop` | ⚠️ NEEDS CODE/SCHEMA CHANGE | Route 12 is explicitly partial/secondary, stop physical positions are unresolved, and current `Stop.location` is non-null. Existing importer correctly blocks persistence. | Obtain authoritative current topology and defensible stop coordinates; then reconcile against current importer/model. Do not make null stops importable. |
| `data/transport/static/ama_bus_bqs_inventory_83.csv` | 83 official BQS rows; coordinates empty; unresolved status | `Stop` | 🔵 KEEP AS RESEARCH/EVIDENCE | Official baseline but not the complete stop universe and no usable locations. | Keep as baseline/reconciliation evidence; never treat 83 as the network. |
| `data/transport/static/ama_bus_stop_reconciliation.csv` | 83 reconciliation rows; canonical IDs and current matches blank | `Stop` identity | 🔵 KEEP AS RESEARCH/EVIDENCE | Reconciliation ledger is incomplete and contains no defensible canonical IDs. | Do not assign IDs; wait for authoritative topology. |
| `data/transport/static/ama_bus_schedule.json` | Current schedule reference only (`2026-06-01`, `times_imported=false`) plus historical Route 09 times | `ScheduledTrip` | 🔵 KEEP AS RESEARCH/EVIDENCE | Current primary schedule content is not extracted; historical 2025 times cannot be presented as current. | Preserve reference/evidence; do not import departure times. |
| `data/transport/fares/ama_bus_fares.json` | Verified minimum fare and AC/non-AC one-day/thirty-day pass rules; no full distance-band table | `FareRule` | ⚠️ NEEDS CODE/SCHEMA CHANGE | Current `FareRule` stores one `rule_type` and one amount, so it cannot preserve the pass dimensions and thresholds without a semantic contract change. | Keep evidence; approve a lossless fare contract before deterministic transformation/import. |
| `data/transport/capital_region/capital_region_current_source_status.json` | Official source status; March topology and June schedule listed but payloads unavailable | No direct database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Directly records the Capital Region blocker and rejects the previous August claim. | Preserve; no fabricated replacement. |
| `data/transport/capital_region/ama_bus_evidence_register.csv` | 8 source-register rows with official/secondary URLs and verification notes | No direct database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Evidence index, not canonical topology. | Preserve source provenance. |
| `data/transport/capital_region/ama_bus_route12_ordered_stop_extraction.csv` | 36 ordered rows; direction unspecified; 22 conservative BQS matches; 14 new/unresolved; no coordinates | `Route`, `Stop`, `RouteStop` | 🔵 KEEP AS RESEARCH/EVIDENCE | Secondary Route 12 candidate extraction is not the complete CRUT network and cannot resolve physical stop locations or canonical IDs. | Do not seed or treat as complete network. |
| `data/transport/capital_region/ama_bus_stop_candidates_reconciled.csv` | 36 candidates; all coordinates empty/unresolved; candidate reconciliation statuses | `Stop` | 🔵 KEEP AS RESEARCH/EVIDENCE | Candidate identities are not verified physical stops and have no coordinates. | Preserve for later reconciliation only. |
| `data/transport/regional/ama_bus_regional_stop_candidates.csv` | 354 candidates; `REG-0001`… IDs are candidate-only; coordinates empty; no cross-source physical merge | `Stop` | 🔵 KEEP AS RESEARCH/EVIDENCE | Candidate IDs must not become canonical IDs; no physical coordinates or verified identity merge. | Keep evidence; do not promote IDs. |
| `data/transport/regional/ama_bus_regional_ordered_stops_berhampur_keonjhar.csv` | 648 ordered rows across Berhampur/Keonjhar; coordinates empty; UP/DOWN/PUBLISHED_SEQUENCE | `Route`, `Stop`, `RouteStop` | 🔵 KEEP AS RESEARCH/EVIDENCE | Regional extraction is not the current Capital Region network and cannot be persisted with unresolved locations. | Leave outside the current Phase 2 seed. |
| `data/transport/regional/ama_bus_regional_route_summary.csv` | 19 route/direction summaries | `Route` | 🔵 KEEP AS RESEARCH/EVIDENCE | Aggregate evidence without canonical route/stop identity or locations. | No import. |
| `docs/transportation/00-transport-model.md` | Transport entities, tiers, estimate rules | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Supporting handoff documentation; repository canonical documents remain unchanged. | Use only as package context. |
| `docs/transportation/01-providers.md` | Frozen provider verification record | `TransportProvider` semantics | 🔵 KEEP AS RESEARCH/EVIDENCE | Capability verification does not itself provide importable topology, schedule, or live data. | Preserve; provider adapter work remains separate. |
| `docs/team/AKRITI.md` | Ownership and handoff instructions | No database entity | 🔵 KEEP AS RESEARCH/EVIDENCE | Team/context documentation. | No code action. |

## What survived

1. The final Places v5.1 package became canonical place/category input through the
   deterministic projection described above.
2. All original Places and Transport artifacts survived in separated handoff
   directories, including ZIPs, manifests, CSVs, JSON, Markdown, and QA evidence.
3. Transport source/provenance, BQS baseline, Route 12 evidence, regional evidence,
   fare evidence, and current schedule references survived as research artifacts.

## What was transformed

- Places category `id` → importer category `name`.
- Places research records → strict importer field set.
- No transport transformation was applied because each candidate would either lose
  unresolved physical identity/coordinate facts or misrepresent current schedule/fare
  semantics.

## What was dropped from canonical import

Nothing was deleted from the preserved handoffs. The following were deliberately not
promoted to canonical database seed data: unresolved transport stops, Route 12 as a
complete network, the 83 BQS rows as a complete universe, regional candidate IDs,
historical schedule times as current times, and a single flattened fare value.

## Remaining blockers

- The authoritative CRUT March 16, 2026 detailed-stoppages PDF payload is unavailable;
  complete current Capital Region route-stop topology and canonical stop IDs cannot be
  certified.
- The current CRUT June 1, 2026 schedule is listed but its primary PDF contents are not
  extracted; current departure times are unavailable.
- Current transport `Stop.location` is non-null and no defensible coordinates are
  present for the supplied transport stop records.
- The current fare model cannot represent the verified pass rules and thresholds
  losslessly.

## Engineering conclusion

The current Phase 2 importer can safely validate/import the transformed Places data,
subject to the configured database/PostGIS dependency for actual persistence. It must
not import the supplied Transport handoff yet. The correct next step is to obtain and
digitize the authoritative CRUT topology and current schedule, reconcile physical stop
identity and coordinates without guessing, then add focused transport contract tests
before any transport seed.
