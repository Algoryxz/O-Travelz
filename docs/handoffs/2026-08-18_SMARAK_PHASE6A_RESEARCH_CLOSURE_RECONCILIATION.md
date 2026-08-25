# O-Travelz Phase 6A Current-State Reconciliation

**Date:** 2026-08-18<br>
**Status:** Canonical current-state decision record; documentation/state reconciliation only<br>
**Starting checkpoint:** `a60befc`<br>
**Historical reports:** Preserved unchanged

## Decision

The final Phase 6A research investigation is closed without an authoritative
cross-system identity bridge. The official BhubaneswarOne `BusPISLocations` GIS
layer was identified, but no defensible record-level crosswalk was found between
the O-Travelz AMA/BQS research records and its GIS features.

Therefore, AMA coordinate-based stop mapping and AMA route geometry are **not part
of the current Phase 6A implementation scope**. No AMA coordinate, route geometry,
or inferred identity is admitted to the canonical project data. The feature may be
reopened only when an authoritative cross-system identity crosswalk is supplied and
verified.

## Exact research closure findings

- The corrected `AMA_BUS_BQS_FINAL_RECONCILIATION_2026-08-17.csv` and the missing
  72-ID reconciliation were not found in reachable or unreachable Git objects.
- The checked-in 83-row AMA/BQS inventory and reconciliation projection do not
  provide the missing 72 canonical-ID source package. `scripts/import_ama_bus.py`
  expects that corrected package and validates/imports a confirmed 72-record slice;
  it is not a source of the missing research records and does not infer coordinates.
- The official [BhubaneswarOne SmartElements `BusPISLocations` layer](https://bhubaneswarone.in/arcgis/rest/services/BhubaneswarOne/SmartElements/FeatureServer/11)
  exposes `location_n`, `bqs_jb`, `slno`, `objectid`, `bus_shelte`, `remark`,
  `latitude`, `longitude`, and point geometry, but no O-Travelz canonical stop ID.
- `bqs_jb` is not established as a stable BQS identifier; current official-layer
  evidence shows repeated BQS/JB values and nullable/editable fields. GIS
  `objectid`/`objectid_1` and `slno` are source-layer fields, not O-Travelz
  canonical IDs.
- The official [BusRouteNetwork service](https://bhubaneswarone.in/arcgis/rest/services/BhubaneswarOne/BusRouteNetwork/MapServer)
  exposes named route layers and a bus-stops layer, but the exposed service does
  not independently establish Route 12 stop identity or sequence. Name overlap is
  not identity proof.
- No official BhubaneswarOne/CRUT document or service examined supplied an explicit
  BQS-to-GIS record mapping. The [official CRUT listing](https://linktr.ee/crut_bbsr)
  and [official network-map PDF](https://cms.bhubaneswarone.in/uploadDocuments/content/MoBus_Phase2_final_Network_new.pdf)
  are source references, not record-level crosswalks.
- No Google, OSM, geocoding, name similarity, GIS object ID, `slno`, endpoint, or
  stop-order inference is promoted as authoritative evidence.
- No fabricated or inferred data was introduced.

## Scope and gate

Phase 6A implementation remains **gated and not authorized by this record**. If
the implementation gate is later opened, the reduced safe scope is limited to:

1. representations of verified places and supplied geometry whose source semantics
   are explicit;
2. an approved map/geospatial contract that preserves unavailable geometry honestly;
3. integration of verified backend/routing outputs without recreating their authority.

AMA coordinate-based stop mapping and AMA route geometry remain excluded. The AMA
feature can be reconsidered only after an authoritative cross-system identity
crosswalk links the O-Travelz records to official GIS features and supplies the
required identity/sequence semantics.

## Current ownership overlay

The canonical ownership model is unchanged: Susmita owns maps/geospatial, Rudra
owns backend/API/integrations/routing, Akriti owns research/verification, Deeptiman
owns the complete frontend, Punam owns documentation/release, and Smarak owns the
core/database/data semantics.

For the current temporary operating arrangement only:

- Susmita → Smarak: Smarak temporarily handles Phase 6A coordination and readiness
  execution while Susmita is unavailable. This is not a canonical ownership transfer.
- Rudra routing: Smarak temporarily handles the routing-side Phase 6A responsibility,
  coordination, and closure work normally supplied by Rudra. Rudra remains the routing
  authority; this does not authorize invented routing or geometry.
- Akriti's AMA research closure is complete as an unresolved closure: no current
  AMA coordinates, canonical identity crosswalk, or Route 12 closure may be promoted.
  Akriti's research authority remains available if a new authoritative source arrives.
- Deeptiman's Phase 6B work depends on a stable approved Phase 6A map contract and
  handoff; frontend code must not recreate authoritative geospatial logic.
- Punam coordinates the documentation and readiness sequence, including Phase 7/8
  coordination after the implementation phases are genuinely complete.

## Phase state and exact next sequence

- Phase 0: accepted foundation and canonical contracts.
- Phase 1: accepted verified research baseline, subject to preserved source limits.
- Phase 2: engineering/import acceptance complete; AMA research closure is now
  recorded as unresolved rather than silently promoted.
- Phase 3: accepted with explicit transport/routing limitations.
- Phase 4: accepted deterministic ranking, itinerary, and facts-only API baseline.
- Phase 5: accepted with explicit provider-neutral AI limitations at `a60befc`.
- Phase 6A: research closure complete; implementation remains gated with the reduced
  scope above. AMA coordinate mapping and AMA route geometry are excluded.
- Phase 6B: blocked on the approved Phase 6A contract/handoff and remaining frontend
  dependencies.
- Phase 7: follows only after Phase 6A and 6B implementation, tests, and handoffs.
- Phase 8: follows Phase 7 readiness evidence for reproducible demo preparation.

The next sequence is therefore: approve the remaining Phase 6A map contract and
authoritative supplied inputs → implement only the reduced Phase 6A scope when the
gate is explicitly opened → hand off to Deeptiman for Phase 6B → Punam coordinates
Phase 7 full-stack integration/readiness → the team prepares Phase 8 demos and the
final known-limitations record → Punam records the final demo/release baseline only
after the Phase 8 exit criteria pass.

## Remaining open decisions and blockers

Open decisions are the exact Phase 6A map payload/GeoJSON contract, geometry
availability states, and the approved source/semantics for any supplied route or
stop geometry. A future authoritative AMA/GIS crosswalk is also an explicit reopen
condition, not an assumed deliverable.

Blockers are the absent 72-ID source/reconciliation package, the absent defensible
AMA-to-GIS identity crosswalk, unresolved AMA coordinates, unresolved Route 12
identity/sequence evidence, and the dependent Phase 6A/6B contracts and handoffs.

## Evidence index

Relevant repository records include:

- `docs/MEMORY.md`
- `docs/PHASES.md`
- `docs/ARCHITECTURE.md`
- `docs/REPOSITORY_MAP.md`
- `docs/handoffs/2026-08-17_AKRITI_RESEARCH_CLOSURE_HANDOFF.md`
- `docs/handoffs/2026-08-18_SUSMITA_PHASE3_DEPENDENCY_PHASE6A_READINESS_REPORT.md`
- `docs/handoffs/2026-08-18_SUSMITA_PHASE6A_PREPARATION_REPORT.md`
- `docs/handoffs/2026-08-18_RUDRA_PHASE3_SCOPE_REPORT.md`
- `scripts/import_ama_bus.py`

Those historical handoffs remain evidence of their original preparation and
acceptance context. This record is the controlling current-state reconciliation
for the final Phase 6A research investigation.
