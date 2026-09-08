# O-TRAVELZ V4 — Subagent Research Assignment Matrix

## Overview

This document specifies the division of research responsibilities between `GEMINI_BROWSER_RESEARCHER` and `CLAUDE_BROWSER_RESEARCHER`, establishing clear domain ownership, primary investigative focus, and mandatory cross-validation handoffs.

---

## 1. Domain Ownership Matrix

| Domain / Gap Area | Primary Assigned Agent | Secondary / Review Agent | Cross-Validation Gate |
|---|---|---|---|
| **Transit GIS & Feeds (GTFS / APIs)** | `GEMINI_BROWSER_RESEARCHER` | `CLAUDE_BROWSER_RESEARCHER` | Mandatory for P1 Stop Coordinates |
| **Route Geometry & Polylines** | `GEMINI_BROWSER_RESEARCHER` | Lead Orchestrator | Geometric bounding check |
| **District Boundary Polygons** | `GEMINI_BROWSER_RESEARCHER` | `CLAUDE_BROWSER_RESEARCHER` | Survey of India / Census check |
| **Civic Amenities & Safety GIS** | `GEMINI_BROWSER_RESEARCHER` | Lead Orchestrator | Phone / coordinate sanity check |
| **Weather & Early Warning Feeds** | `GEMINI_BROWSER_RESEARCHER` | Lead Orchestrator | IMD / OSDMA schema check |
| **Destination Operating Hours** | `CLAUDE_BROWSER_RESEARCHER` | Lead Orchestrator | Government circular comparison |
| **Entry Fees & Camera Tariffs** | `CLAUDE_BROWSER_RESEARCHER` | `GEMINI_BROWSER_RESEARCHER` | Mandatory dual check |
| **Visitor Accessibility Records** | `CLAUDE_BROWSER_RESEARCHER` | `GEMINI_BROWSER_RESEARCHER` | Mandatory dual check |
| **Destination Imagery & Licensing** | `CLAUDE_BROWSER_RESEARCHER` | Lead Orchestrator | Commons license & EXIF audit |
| **Artisan Cooperatives & GI Crafts** | `CLAUDE_BROWSER_RESEARCHER` | Lead Orchestrator | Registered society verification |
| **Culinary Heritage Provenance** | `CLAUDE_BROWSER_RESEARCHER` | Lead Orchestrator | GI tag / institutional history |
| **Rail / Aviation Schedule Policy** | `GEMINI_BROWSER_RESEARCHER` | `CLAUDE_BROWSER_RESEARCHER` | Schedule vs. Realtime check |
| **Future RAG Document Corpus** | `CLAUDE_BROWSER_RESEARCHER` | Lead Orchestrator | Copyright / attribution review |
| **Catalog Reconciliation** | `GEMINI_BROWSER_RESEARCHER` | Lead Orchestrator | Schema and UUID parity check |

---

## 2. Detailed Agent Focus

### GEMINI_BROWSER_RESEARCHER
- **Technical Strengths**: Rapid endpoint inspection, API payload parsing, GIS layer interrogation (ArcGIS REST, FeatureServer, WMS, GeoJSON), and structured data harvesting.
- **Initial Task Queue**:
  1. `TRANSIT_STOP_COORDINATE_CLOSURE`: Query Odisha SDI and CRUT endpoints for Ama Bus stop geometries.
  2. `TRANSIT_ROUTE_GEOMETRY_GAPS`: Inspect spatial shape polyline availability for Mo Bus routes.
  3. `ODISHA_DISTRICT_BOUNDARIES`: Locate simplified public GeoJSON boundaries for Odisha's 30 districts.
  4. `CIVIC_SERVICES_EXPANSION`: Map police, fire, and health GIS endpoints.
  5. `WEATHER_WARNING_FEEDS`: Identify live CAP/RSS/JSON alert feeds from IMD and OSDMA.

### CLAUDE_BROWSER_RESEARCHER
- **Analytical Strengths**: Deep provenance analysis, statutory document reading, licensing scrutiny, terms of service evaluation, and nuanced cultural taxonomy.
- **Initial Task Queue**:
  1. `DESTINATION_OPENING_HOURS`: Extract weekly opening matrices for top 25 heritage monuments from ASI/Tourism circulars.
  2. `DESTINATION_ENTRY_FEES`: Document official ticket fee schedules, exemptions, and camera permits.
  3. `DESTINATION_ACCESSIBILITY`: Search Accessible India Campaign and ASI audit reports for physical barrier data.
  4. `VERIFIED_DESTINATION_MEDIA`: Review Wikimedia Commons high-resolution photography with verifiable CC BY / CC BY-SA licenses.
  5. `ARTISAN_AND_CRAFT_DATA`: Gather registered society details for Pattachitra, Silver Filigree (Tarakasi), and Sambalpuri textiles.

---

## 3. Mandatory Cross-Check Domains

Both agents must independently investigate and cross-check:
1. **Any discovery proposed for promotion to canonical** (`data/**/canonical/`).
2. **Transit stop coordinate discoveries**: Gemini identifies the geospatial endpoint; Claude audits the official operator notification to confirm stop naming and locality concordance.
3. **Accessibility assertions**: Gemini checks map facilities/infrastructure layers; Claude audits the institutional text and user reviews.
4. **Licensed media provenance**: Gemini verifies file dimensions and MIME type; Claude verifies license attribution and copyright compatibility.
