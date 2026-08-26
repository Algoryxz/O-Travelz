# O-Travelz Phase 1 — Places Handoff v5.1 FINAL

Corrected handoff package based on the v5 research dataset. Research/place IDs are retained for traceability;
the PostgreSQL database is expected to generate its own UUID primary keys.

- 32 retained places
- 0 removed
- 32 sources
- 32 `verified_at` values (calendar date only; no time invented)
- 8 non-null coordinate pairs after the v5.1 re-review
- 24 intentionally null coordinate pairs
- canonical category identifiers are the `id` values in `categories.json`; `places.json.category` must equal a category `id`
- category display names remain in `categories.json.name`
- no placeholder records
- no duplicate research/place IDs

## v5.1 corrections

### Category contract
The category contract is explicit: `categories.json.id` is the canonical identifier, and `places.json.category`
references that identifier exactly. `categories.json.name` is a display label only. No category meaning or slug was changed.

### Coordinates
The eight v5.1 coordinates that had already been nulled remain null. A further five previously retained
coordinates were removed because their audit text still described them as provisional or lacking authoritative
point-level confirmation:

- `place_019` — Brahmeswar Temple
- `place_021` — Rameshwar Deula
- `place_027` — Nageshwar Temple
- `place_028` — Talesvara Siva Temple
- `place_029` — Kapilesvara Siva Temple

No coordinate was inferred or guessed.

### Ram Mandir provenance
`place_022` now cites the Government of Odisha Hindu Religious Endowment Commission's Ram Mandir page,
which directly supports the retained place information. The previous Wikimedia Commons URL was removed as
the record's source because it did not match the provenance identified in the audit.

### Opening hours
The five compact opening-hours strings were reviewed. Nandankanan Zoological Park has an authoritative
official publication that supports a seasonal weekly schedule, so its hours are represented structurally.
The other four compact strings did not establish a defensible weekly schedule from their cited sources and
were set to `null` rather than inventing one.

### Verification date
`verified_at` remains the actual calendar date `2026-08-17`. No time-of-day was invented. If the database
requires a DateTime rather than a Date, that remains a database/import-layer decision for Smarak.


## Final validation — 2026-08-17

The final package was mechanically checked for:
- 32 records and 0 duplicate research/place IDs
- every `places.json.category` matching a canonical `categories.json.id`
- every coordinate being either a complete lat/lon pair or both `null`
- every non-null coordinate having `coordinate_audit_status: "high"`
- no compact time-range strings remaining in `opening_hours`
- all `verified_at` values remaining date-only in `YYYY-MM-DD` form
- valid source URLs on all 32 records
- Ram Mandir provenance matching the Government of Odisha Hindu Religious Endowment Commission source

No PostgreSQL/PostGIS schema or UUID-primary-key decision is encoded in this research handoff.
