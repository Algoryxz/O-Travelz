# ADR-003: Normalized Cross-Entity Relationships and Canonical Media Registry

* **Status**: Accepted
* **Date**: 2026-09-04
* **Decision Makers**: Algoryxz Core Architecture Team
* **Context**: Architectural boundary for cross-entity knowledge graph and unified media assets in O-TRAVELZ V4.

---

## 1. Context and Problem Statement

O-TRAVELZ V4 models intricate cultural, geographical, and transit connections across Odisha:
* A `Place` relates to nearby `Stop` entities (first-mile transit).
* A `Place` relates to an `ArtisanCluster` (e.g. Raghurajpur Pattachitra, Pipili Applique).
* A `Place` relates to culinary traditions (e.g. Pahala Rasagola, Kendrapara Rasabali).

Storing these relationships in an ad-hoc `places.relationships` JSONB blob creates severe data debt:
1. No referential integrity or foreign key validation.
2. Inability to query reverse relationships efficiently without expensive full-table JSONB scans.
3. High risk of circular reference anomalies and stale entity IDs.

Similarly, media handling was previously tied exclusively to `place_images`:
1. Non-place entities (stops, craft traditions, artisans) had no structured media mechanism.
2. Images were duplicated across entities rather than referenced.
3. Media assets lacked content hash deduplication, perceptual hashing, and explicit verification status.

---

## 2. Decision

The platform adopts a **Normalized Graph and Central Media Registry Architecture**:

### 2.1. Normalized Cross-Entity Relationships (`entity_relationships`)
Cross-entity edges are stored in a normalized relational table:
* Columns: `id`, `source_entity_type`, `source_entity_id`, `target_entity_type`, `target_entity_id`, `relationship_type`, `confidence`, `provenance`, `properties`, `created_at`.
* Constraint: Unique constraint on `(source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type)`.
* Indexes: B-tree indexes on `(source_entity_type, source_entity_id)`, `(target_entity_type, target_entity_id)`, and `relationship_type`.
* **Confidence Semantics**: The `confidence` column is strictly nullable and **never** defaulted to `HIGH`. Confidence must be explicitly derived from verification evidence or calculated algorithms.

### 2.2. Canonical Media Registry (`media_assets`)
All media (images, videos, audio) is registered once in a canonical table:
* Columns: `id`, `media_type`, `content_sha256` (UNIQUE), `mime_type`, `width`, `height`, `duration_ms`, `storage_backend`, `storage_key` (UNIQUE), `variants` (JSON), `perceptual_hash`, `license`, `creator`, `attribution`, `source_url`, `verification_status`, `created_at`.
* Verification Status values: `EXACT_LOCATION_VERIFIED`, `RELATED_LOCATION`, `TECHNICAL_VECTOR`, `UNVERIFIED`, `REJECTED`.

### 2.3. Entity-to-Media Association (`entity_media`)
Entities link to media assets through a many-to-many junction table:
* Columns: `id`, `entity_type`, `entity_id`, `media_asset_id` (FK `media_assets.id` ON DELETE CASCADE), `association_type` (e.g. `primary`, `hero`, `gallery`, `thumbnail`), `sort_order`, `alt_text`, `caption`, `created_at`.
* Constraint: Unique on `(entity_type, entity_id, media_asset_id, association_type)`.

### 2.4. Legacy Deprecation Path (`place_images`)
* `place_images` is preserved intact as a backward-compatible legacy store for existing endpoints (`/api/places`, `/places/{id}/images`) and bootstrap invariant scripts.
* It is not a competing source of truth; synchronization scripts project primary media assets into `place_images` during the transition period.

---

## 3. Consequences

### Positive
* Bidirectional traversal between any two entities (e.g. "Find all places associated with this transit corridor" or "Find all crafts originating from this district").
* Content-addressed storage and deduplication via SHA-256 prevents duplicate disk and cloud storage consumption.
* Strict photographic truth boundary: Media assets cannot masquerade as exact location captures unless `verification_status = 'EXACT_LOCATION_VERIFIED'`.
* Zero regression on existing mobile and web endpoints.

### Negative / Trade-offs
* Requires join queries through `entity_relationships` and `entity_media`, mitigated by covering compound indexes.