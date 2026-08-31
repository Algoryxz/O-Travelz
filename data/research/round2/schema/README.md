# Round 2 Research Schemas

This directory contains the canonical JSON Schemas used by all regional researchers during Round 2.

## Schemas

1. **`candidate.schema.json`**
   - Defines the structure for destination candidate records staged in `candidates.json` across all regions.
   - Validates required fields (`research_id`, `name`, `district`, `region`, `category`, `researcher`, `verification_status`), coordinate boundaries (Odisha bounding box 17.8°N-22.6°N, 81.4°E-87.5°E), and field types.
   - Note: A record being schema-valid does NOT imply it is production-ready.

2. **`source.schema.json`**
   - Defines the structure for provenance/source tracking records staged in `sources.json`.
   - Links back to `research_id` and captures source type, title, URL, access date, and supported fields.

## Validation

Run the validator from repository root:

```bash
python scripts/validate_round2_research.py
```
