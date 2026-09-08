# O-TRAVELZ Mobile V4 — Persistence Migration Policy

> **Authoritative Specification: Database Versioning and Migration Strategy**  
> Engines: **Room SQLite (v1) & SwiftData (Schema V1)**  
> Wave: `M14` | Status: `APPROVED_POLICY` | Date: `2026-09-08`

---

## 1. Schema Baseline (v1)

Wave M14 introduces the initial production persistence schema:
- **Room Database Version**: `1`
- **SwiftData Schema**: Baseline V1
- **Export Schema**: Retained locally; destructive migrations prohibited in production releases (`fallbackToDestructiveMigration()` is strictly disabled for production releases).

---

## 2. Future Migration Guidelines (v2+)

When future feature waves (e.g. M15+) require schema mutations:

1. **Non-Destructive by Default**:
   - New columns must be declared `nullable` or provide a sensible default value.
   - For Android Room, explicit `Migration(1, 2)` objects with SQL `ALTER TABLE` statements must be authored and validated via automated unit migration tests (`MigrationTestHelper`).
   - For iOS SwiftData, use `VersionedSchema` and `SchemaMigrationPlan` to specify lightweight or custom migrations.
2. **Snapshot Backward Compatibility**:
   - Any additions to `constraintsSnapshotJson` or stop metadata must maintain backward-compatible deserialization for trips created under v1.
3. **Canonical Decoupling**:
   - Because canonical places and transit routes live in read-only assets or are fetched from the backend, changes to the canonical catalog **never** require database migrations in user tables.
