# O-TRAVELZ V4 — Research Subagent Orchestration Architecture

## Overview

To accelerate the O-TRAVELZ V4 rebuild without compromising repository truth, Antigravity orchestrates specialized research subagents operating concurrently in the background while mobile implementation proceeds uninterrupted.

Subagents are **fact gatherers and evidence auditors**, NOT canonical authorities. They never modify canonical repository data, production databases, or feature code.

---

## Runtime Capabilities & Constraints

Antigravity executes subagents within its native runtime environment under explicit architectural controls:

```yaml
VENDOR_INDEPENDENCE: false
THREAD_INDEPENDENCE: true
PROMPT_INDEPENDENCE: true
MODEL_TIER_DIVERSITY: true
MODEL_FAMILY_DIVERSITY: false
```

- **Thread Independence**: Subagents execute in isolated, parallel background conversation threads (`conversationId`).
- **Prompt Independence**: Each subagent persona is defined with specialized system prompts, domain boundaries, and tool grants.
- **Model Tier Diversity**: Tasks are assigned to model performance tiers (`flash` for high-throughput technical/GIS interrogation; `pro` for deep documentary analysis and adversarial review).
- **Vendor & Model Family Boundary**: Subagents route through Antigravity's unified backend infrastructure. Subagent roles represent **functional personas and prompt contracts**, not independent vendor APIs.
- **Quota Model**: All subagents share the parent workspace subscription quota.

---

## Topology

```mermaid
graph TD
    A[ANTIGRAVITY LEAD<br/>Orchestrator & Truth Guardian] -->|Assigns Technical Task (Tier: FLASH)| B[GIS_API_RESEARCHER<br/>APIs / GIS / Transport / Realtime Feeds]
    A -->|Assigns Documentary Task (Tier: PRO)| C[PROVENANCE_POLICY_RESEARCHER<br/>Authoritative Docs / Fees / Hours / Licensing]
    B -->|Returns Structured JSON| D[ADVERSARIAL_EVIDENCE_REVIEWER<br/>Model Tier: PRO / Anti-Vibe & License Auditor]
    C -->|Returns Structured JSON| D
    D -->|Verified Findings| E[STAGING LAYER<br/>data/staging/ & research/mobile-v4-data/]
    E -->|Explicit Human/Wave Review| F[CANONICAL REPOSITORY TRUTH<br/>data/transport/canonical/ etc.]
    D -.->|Conflict / License Rejection| G[CONFLICT_REQUIRES_REVIEW]
```

---

## Agent Roles & Division of Labor

### 1. ANTIGRAVITY_LEAD (Parent Session)
- **Role**: Platform architect, repository truth guardian, and orchestrator.
- **Responsibilities**:
  1. Inspect and defend canonical repository truth (`data/transport/canonical/`, verified places inventory).
  2. Maintain the research gap backlog (`research/mobile-v4-data/DATA_GAP_REGISTRY.json`).
  3. Dispatch bounded, unambiguous research tasks to subagents.
  4. Prevent duplicate research queries and redundant web traffic.
  5. Ingest structured subagent output via reactive system notifications.
  6. Enforce independent Antigravity research-thread cross-validation on high-priority (P1) discoveries.
  7. Run verification scripts against returned endpoints/URLs.
  8. Stage valid evidence into `data/staging/` or `research/mobile-v4-data/`.
  9. **Strict boundary**: NEVER automatically promote staged findings to canonical files.
  10. Continue Mobile V4 implementation tasks (Compose, Swift, KMP shared core) independently while subagents run.

### 2. GIS_API_RESEARCHER (Specialized Subagent — Runtime Tier: FLASH)
- **Mission**: Discover machine-readable, structured, geospatial, API, transit, and technical data sources.
- **Domains**:
  - Open transit APIs, GTFS static, GTFS-Realtime feeds
  - GeoJSON, ArcGIS REST endpoints, FeatureServer, MapServer, WMS, WFS, KML
  - Government open-data portals, Odisha GIS, State Spatial Data Infrastructure
  - CRUT / Mo Bus / Ama Bus structured data, unresolved stop coordinates, route geometry
  - Weather-warning feeds, civic amenities GIS layers
- **Runtime**: Native Antigravity subagent (`GIS_API_RESEARCHER`, model tier `flash`) equipped with `search_web` and `read_url_content`.

### 3. PROVENANCE_POLICY_RESEARCHER (Specialized Subagent — Runtime Tier: PRO)
- **Mission**: Discover authoritative documents, operational facts, licensing, provenance, accessibility evidence, media sources, and policy constraints.
- **Domains**:
  - Odisha Tourism official portals, district NIC portals (`<district>.nic.in`)
  - ASI (Archaeological Survey of India) protected monuments, UNESCO listings
  - Official monument/attraction opening hours, entry fees, weekly closures, camera rules
  - Visitor accessibility evidence (ramps, wheelchairs, terrain limitations)
  - Official contact numbers, administrative jurisdiction, artisan/craft cooperatives, GI tags
  - Public domain and CC-licensed photography provenance (Wikimedia Commons)
  - Legal reuse constraints, copyright, attribution guidelines
- **Runtime**: Native Antigravity subagent (`PROVENANCE_POLICY_RESEARCHER`, model tier `pro`) equipped with strict source-criticism system prompt.

### 4. ADVERSARIAL_EVIDENCE_REVIEWER (Audit Subagent — Runtime Tier: PRO)
- **Mission**: Adversarially audit structured findings returned by worker threads before lead verification and staging.
- **Operating Rules**:
  - Receives structured JSON findings only after research workers finish their tasks.
  - Does NOT perform web browsing unless a severe conflict, coordinate anomaly, or licensing ambiguity requires targeted verification.
  - Audits for Anti-Vibe-Code compliance (flags fabricated fares, unverified opening hours, or AI-generated image URLs).
  - Verifies spatial coordinate sanity (clipping within Odisha state bounding box `[17.78, 81.37, 22.57, 87.53]`).
  - Verifies open license compatibility (Wikimedia Commons CC BY / CC BY-SA / CC0 vs proprietary stock photos).

---

## Operating Invariants

1. **Subagents Are Not Authorities**: Subagents collect candidate facts and verifiable links; only vetted records can be staged.
2. **Independent Research-Thread Cross-Validation**: Dual independent subagent research threads must independently verify P1 discoveries before promotion.
3. **Canonical Data Freeze**: Neither subagents nor automated scripts may edit files under `data/**/canonical/`.
4. **No Unauthenticated Secret Scraping**: Strictly obey [`docs/research/RESEARCH_SAFETY_POLICY.md`](./RESEARCH_SAFETY_POLICY.md).
5. **Structured JSON Output Only**: No conversational essays or prose dumps; all findings must match the standard schema.
6. **Deterministic Lead Control**: Subagent lifecycle is governed via `define_subagent`, `invoke_subagent`, `manage_subagents`, and `send_message`.
