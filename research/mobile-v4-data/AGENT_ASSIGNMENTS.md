# O-TRAVELZ V4 — Subagent Research Assignment Matrix

## Overview

This document specifies the division of research responsibilities between Antigravity subagents (`GIS_API_RESEARCHER`, `PROVENANCE_POLICY_RESEARCHER`, and `ADVERSARIAL_EVIDENCE_REVIEWER`), establishing domain ownership, model tier assignments, and mandatory independent research-thread cross-validation handoffs.

---

## Runtime Capabilities & Constraints

```yaml
VENDOR_INDEPENDENCE: false
THREAD_INDEPENDENCE: true
PROMPT_INDEPENDENCE: true
MODEL_TIER_DIVERSITY: true
MODEL_FAMILY_DIVERSITY: false
```

---

## 1. Domain Ownership Matrix

| Domain / Gap Area | Primary Assigned Agent | Review & Audit Agent | Cross-Validation Gate |
|---|---|---|---|
| **Transit GIS & Feeds (GTFS / APIs)** | `GIS_API_RESEARCHER` (`flash`) | `ADVERSARIAL_EVIDENCE_REVIEWER` (`pro`) | Mandatory for P1 Stop Coordinates |
| **Route Geometry & Polylines** | `GIS_API_RESEARCHER` (`flash`) | `ADVERSARIAL_EVIDENCE_REVIEWER` (`pro`) | Geometric bounding check |
| **District Boundary Polygons** | `GIS_API_RESEARCHER` (`flash`) | `ADVERSARIAL_EVIDENCE_REVIEWER` (`pro`) | Survey of India / Census check |
| **Civic Amenities & Safety GIS** | `GIS_API_RESEARCHER` (`flash`) | Lead Orchestrator | Phone / coordinate sanity check |
| **Weather & Early Warning Feeds** | `GIS_API_RESEARCHER` (`flash`) | Lead Orchestrator | IMD / OSDMA schema check |
| **Destination Operating Hours** | `PROVENANCE_POLICY_RESEARCHER` (`pro`) | `ADVERSARIAL_EVIDENCE_REVIEWER` (`pro`) | Government circular comparison |
| **Entry Fees & Camera Tariffs** | `PROVENANCE_POLICY_RESEARCHER` (`pro`) | `ADVERSARIAL_EVIDENCE_REVIEWER` (`pro`) | Mandatory dual check |
| **Visitor Accessibility Records** | `PROVENANCE_POLICY_RESEARCHER` (`pro`) | `ADVERSARIAL_EVIDENCE_REVIEWER` (`pro`) | Mandatory dual check |
| **Destination Imagery & Licensing** | `PROVENANCE_POLICY_RESEARCHER` (`pro`) | `ADVERSARIAL_EVIDENCE_REVIEWER` (`pro`) | Commons license & EXIF audit |
| **Artisan Cooperatives & GI Crafts** | `PROVENANCE_POLICY_RESEARCHER` (`pro`) | `ADVERSARIAL_EVIDENCE_REVIEWER` (`pro`) | Registered society verification |
| **Culinary Heritage Provenance** | `PROVENANCE_POLICY_RESEARCHER` (`pro`) | `ADVERSARIAL_EVIDENCE_REVIEWER` (`pro`) | GI tag / institutional history |
| **Rail / Aviation Schedule Policy** | `GIS_API_RESEARCHER` (`flash`) | `PROVENANCE_POLICY_RESEARCHER` (`pro`) | Schedule vs. Realtime check |
| **Future RAG Document Corpus** | `PROVENANCE_POLICY_RESEARCHER` (`pro`) | Lead Orchestrator | Copyright / attribution review |
| **Catalog Reconciliation** | `GIS_API_RESEARCHER` (`flash`) | Lead Orchestrator | Schema and UUID parity check |

---

## 2. Detailed Agent Roles & Focus

### GIS_API_RESEARCHER (Runtime Tier: FLASH)
- **Technical Focus**: Rapid endpoint inspection, API payload parsing, GIS layer interrogation (ArcGIS REST, FeatureServer, WMS, GeoJSON), and structured data harvesting.
- **Active Task Queue**:
  1. `TRANSIT_STOP_COORDINATE_CLOSURE`: Query Odisha SDI and CRUT endpoints for Ama Bus stop geometries.
  2. `TRANSIT_ROUTE_GEOMETRY_GAPS`: Inspect spatial shape polyline availability for Mo Bus routes.
  3. `ODISHA_DISTRICT_BOUNDARIES`: Locate simplified public GeoJSON boundaries for Odisha's 30 districts.
  4. `CIVIC_SERVICES_EXPANSION`: Map police, fire, and health GIS endpoints.
  5. `WEATHER_WARNING_FEEDS`: Identify live CAP/RSS/JSON alert feeds from IMD and OSDMA.

### PROVENANCE_POLICY_RESEARCHER (Runtime Tier: PRO)
- **Documentary Focus**: Deep provenance analysis, statutory document reading, licensing scrutiny, terms of service evaluation, and cultural taxonomy.
- **Active Task Queue**:
  1. `DESTINATION_OPENING_HOURS`: Extract weekly opening matrices for top 25 heritage monuments from ASI/Tourism circulars.
  2. `DESTINATION_ENTRY_FEES`: Document official ticket fee schedules, exemptions, and camera permits.
  3. `DESTINATION_ACCESSIBILITY`: Search Accessible India Campaign and ASI audit reports for physical barrier data.
  4. `VERIFIED_DESTINATION_MEDIA`: Review Wikimedia Commons high-resolution photography with verifiable CC BY / CC BY-SA licenses.
  5. `ARTISAN_AND_CRAFT_DATA`: Gather registered society details for Pattachitra, Silver Filigree (Tarakasi), and Sambalpuri textiles.

### ADVERSARIAL_EVIDENCE_REVIEWER (Runtime Tier: PRO)
- **Audit Focus**: Adversarially audit structured JSON output returned by worker threads after execution completes.
- **Operating Rules**: Receives structured findings after research workers finish; performs targeted web searches only if coordinate anomalies, licensing ambiguities, or Anti-Vibe-Code rule violations (e.g. fabricated fares, fake reviews, AI-generated images) are flagged.

---

## 3. Mandatory Cross-Check Protocol

Verification relies on **independent Antigravity research-thread cross-validation**:
1. **Any discovery proposed for promotion to canonical** (`data/**/canonical/`).
2. **Transit stop coordinate discoveries**: `GIS_API_RESEARCHER` identifies the geospatial endpoint; `PROVENANCE_POLICY_RESEARCHER` or `ADVERSARIAL_EVIDENCE_REVIEWER` audits the official operator notification to confirm stop naming and locality concordance.
3. **Accessibility assertions**: `GIS_API_RESEARCHER` checks map facilities/infrastructure layers; `PROVENANCE_POLICY_RESEARCHER` audits the institutional text.
4. **Licensed media provenance**: `GIS_API_RESEARCHER` checks file availability; `PROVENANCE_POLICY_RESEARCHER` verifies license attribution and copyright compatibility.
