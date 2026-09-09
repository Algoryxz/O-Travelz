# M18 Offline Package Ingestion Contract

## 1. Overview & Quarantine Scope
- **Current Operational Status**: `ARCHITECTURE_READY`
- **Production Ingestion Status**: `PRODUCTION_INGESTION_BLOCKED_PENDING_STAGE_G2`
- **Stage G2 Status**: `LOCKED / NOT STARTED`

This contract establishes the conceptual format, verification invariants, and loader boundaries for future offline data packages qualified in Stage G1 (`data/staging/mobile/`). **Zero candidate datasets are promoted or bundled into production mobile assets in Wave M18.**

---

## 2. Shared Ingestion Manifest Specification

Every optional offline data bundle ingested in subsequent waves must be governed by a deterministic JSON manifest adhering to the following schema:

```json
{
  "dataset_id": "string (e.g. odisha_district_boundaries_simplified)",
  "schema_version": "1.0.0",
  "content_sha256": "hex-encoded 64-character SHA-256 digest of payload",
  "record_count": 30,
  "raw_bytes": 79872,
  "compressed_bytes": 19148,
  "source_ids": ["src_geoboundaries_adm2_simplified"],
  "truth_class": "RESEARCH_DERIVED_SIMPLIFIED",
  "freshness_class": "STATIC_ANNUAL",
  "license": "CC-BY-4.0",
  "attribution_required": true,
  "packaging_class": "OPTIONAL_DOWNLOAD"
}
```

---

## 3. Ingestion Pre-Conditions
Before any candidate package is promoted to production mobile assets in Stage G2:
1. Full Stage G2 promotion protocol must be formally authorized.
2. Canonical protection checks must pass with zero unapproved overwrite mutations.
3. Content SHA-256 hashes must be verified against committed staging files.
4. Attribution requirements must be mapped to the mobile application's About/Data Sources screen.
