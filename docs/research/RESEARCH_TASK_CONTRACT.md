# O-TRAVELZ V4 — Research Task Contract & Output Specification

## Purpose

This document specifies the formal contract for dispatching research tasks from Antigravity Lead to research subagents (`GEMINI_BROWSER_RESEARCHER` and `CLAUDE_BROWSER_RESEARCHER`), as well as the standard JSON output format required for all returned findings.

---

## 1. Input Task Contract Schema

Every task delegated to a subagent must strictly include the following fields:

```markdown
### TASK DISPATCH CONTRACT

- **TASK_ID**: [Unique string identifier, e.g. TRANSIT_STOP_COORD_SOURCE_001]
- **DOMAIN**: [Transit | Tourism | Heritage | GIS | Civic | Accommodation | Weather]
- **RESEARCH_QUESTION**: [Clear, unambiguous query describing exactly what must be found]
- **CURRENT_REPO_TRUTH**: [What is currently known/committed in the repo to prevent re-inventing]
- **WHY_IT_MATTERS**: [Product impact or architectural dependency in Mobile V4]
- **PRIORITY**: [P1 | P2 | P3]
- **PREFERRED_SOURCE_TYPES**: [Array of acceptable authoritative source types, e.g. Government API, Official Portal, ASI Registry]
- **DISALLOWED_SOURCE_TYPES**: [Array of unverified source types, e.g. SEO travel blogs, TripAdvisor scrapers, AI summaries]
- **EXPECTED_OUTPUT**: [Specific fields expected in the findings]
- **STOP_CONDITIONS**: [Criteria to stop searching, e.g., 2 official primary URLs found or confirm no public endpoint exists]
- **CROSS_VALIDATION_REQUIRED**: [true | false]
```

### Example Task Dispatch

```markdown
TASK_ID: TRANSIT_STOP_COORD_SOURCE_001
DOMAIN: Transit GIS
RESEARCH_QUESTION: Find authoritative or institutionally defensible machine-readable sources for unresolved Ama Bus stop coordinates in Odisha.
CURRENT_REPO_TRUTH: 47 stops in staging have missing or coarse coordinates; canonical transit graph must remain untouched.
WHY_IT_MATTERS: Mobile V4 MapRootView requires valid coordinates to draw stop markers and calculate first-mile walking distance bands.
PRIORITY: P1
PREFERRED_SOURCE_TYPES: [CRUT official open data, Odisha Spatial Data Infrastructure (OSDI), Mo Bus / Ama Bus portal, District NIC GIS]
DISALLOWED_SOURCE_TYPES: [Aggregator blogs, forum posts, ungrounded LLM completions]
EXPECTED_OUTPUT: Endpoint URLs, data format, publisher/owner, schema snippet, freshness, license, rate limits.
STOP_CONDITIONS: Stop when authoritative API/GeoJSON/CSV is identified and sample coordinates extracted, or confirmed private.
CROSS_VALIDATION_REQUIRED: true
```

---

## 2. Standard Subagent Output Schema

Subagents must return their findings exclusively in structured JSON format. **No prose-only dumps or ungrounded conversational narratives are permitted.**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SubagentResearchResult",
  "type": "object",
  "required": [
    "task_id",
    "agent",
    "status",
    "findings",
    "sources",
    "recommended_next_action",
    "confidence"
  ],
  "properties": {
    "task_id": {
      "type": "string",
      "description": "Identifier matching the dispatched task"
    },
    "agent": {
      "type": "string",
      "enum": ["GEMINI_BROWSER_RESEARCHER", "CLAUDE_BROWSER_RESEARCHER"]
    },
    "status": {
      "type": "string",
      "enum": ["FOUND", "PARTIAL", "NOT_FOUND", "BLOCKED", "CONFLICT"]
    },
    "findings": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Key factual statements extracted from verified sources"
    },
    "sources": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "title",
          "url",
          "organization",
          "source_type",
          "official",
          "format",
          "license",
          "access_method",
          "freshness",
          "last_updated",
          "runtime_usable",
          "ingestion_usable",
          "cache_usable",
          "limitations"
        ],
        "properties": {
          "title": { "type": "string" },
          "url": { "type": "string", "format": "uri" },
          "organization": { "type": "string" },
          "source_type": { "type": "string" },
          "official": { "type": "boolean" },
          "format": { "type": "string" },
          "license": { "type": "string" },
          "access_method": { "type": "string" },
          "freshness": {
            "type": "string",
            "enum": ["STATIC", "SLOW_CHANGING", "SCHEDULED", "CURRENT", "REALTIME", "UNKNOWN"]
          },
          "last_updated": { "type": "string" },
          "runtime_usable": { "type": "boolean" },
          "ingestion_usable": { "type": "boolean" },
          "cache_usable": { "type": "boolean" },
          "limitations": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    },
    "recommended_next_action": {
      "type": "string",
      "description": "Concrete proposal for Antigravity Lead or cross-validation step"
    },
    "confidence": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0
    }
  }
}
```

---

## 3. Status Definitions

| Status | Meaning |
|---|---|
| `FOUND` | Complete authoritative source located, verified, and extracted. |
| `PARTIAL` | High-quality source located, but covers only a subset of requested entities or attributes. |
| `NOT_FOUND` | Exhaustive search across primary and secondary institutional archives yielded no defensible source. |
| `BLOCKED` | Source exists but is strictly gated behind mandatory user authentication, CAPTCHA, or prohibited terms. |
| `CONFLICT` | Discovery contradicts current repository staging or an independent subagent finding. |
