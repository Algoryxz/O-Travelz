# O-Travelz Phase 1 — Places Resolution Audit v5.1

Verification date: 2026-08-17

## Result

- Records retained: 32
- Records removed: 0
- Existing research/place IDs retained for traceability: 32
- Records with source: 32/32
- Records with `verified_at`: 32/32 (date-only values; no verification time was established)
- Duplicate IDs: 0
- Placeholder records: 0
- Canonical category values used by `places.json`: 9/9 matched exactly to `categories.json.id`
- Non-null coordinate pairs after v5.1 re-review: 8
- Intentionally null coordinate pairs: 24

## v5.1 handoff corrections

### 1. Category contract

The canonical category representation is the identifier in `categories.json.id`. Every `places.json.category`
value must equal one of those identifiers exactly:

`temple`, `museum`, `market`, `park`, `monument`, `lake`, `planetarium`, `sports_venue`, `science_center`.

The title-case `categories.json.name` values are display labels and are not the canonical identifiers.
No category meaning was changed.

### 2. Ram Mandir provenance

`place_022` (Ram Mandir, Bhubaneswar) previously carried a Wikimedia Commons category URL even though
the research audit identified the Government of Odisha Hindu Religious Endowment Commission as the
supporting source.

The source has been corrected to:

https://hinduendowments.odisha.gov.in/temples/ram-mandir-temple/

The Government of Odisha page directly identifies Shri Ram Mandir in Bhubaneswar and describes the temple.
The JSON record and this audit now use the same provenance. The Wikimedia URL was not retained as the
record source.

### 3. Coordinate re-review

The eight coordinates previously marked medium/approximate in the v5 package had already been set to null
in the earlier v5.1 cleanup. A second review found five additional records whose non-null coordinate evidence
was still explicitly provisional or lacked authoritative point-level confirmation:

- `place_019` — Brahmeswar Temple: prior coordinate explicitly described as provisional.
- `place_021` — Rameshwar Deula: prior coordinate explicitly described as provisional.
- `place_027` — Nageshwar Temple: Wikidata-derived point lacked authoritative point-level confirmation.
- `place_028` — Talesvara Siva Temple: Wikidata-derived point lacked authoritative point-level confirmation.
- `place_029` — Kapilesvara Siva Temple: Wikidata-derived point was cross-checked but lacked authoritative point-level confirmation.

All five latitude/longitude pairs were therefore set to `null`. No coordinates were guessed or inferred.

The retained non-null coordinates were left unchanged where the existing audit supplied defensible point-level
evidence. The coordinate verification/audit fields remain in `places.json`.

### 4. Opening hours

Five records contained compact time-range strings:

- `place_007` — Chausathi Yogini Temple, Hirapur
- `place_009` — Nandankanan Zoological Park
- `place_022` — Ram Mandir, Bhubaneswar
- `place_025` — Kedar Gouri Temple
- `place_032` — Buddha Jayanti Park

`place_009` was upgraded to a structured seasonal weekly representation because the official Nandankanan
publication supports both the weekly Monday closure and the visitor hours for April–September and
October–March.

The other four values were set to `null`. Their cited evidence did not establish a defensible weekly
schedule suitable for a structured importer field, so no weekly pattern was invented.

### 5. Verification date

The research establishes the calendar date `2026-08-17` for the audit. No source establishes a time of day.
Therefore `verified_at` remains exactly `2026-08-17` in the JSON.

If the final database schema requires a DateTime rather than a Date, the conversion/population rule remains
a database/import-layer decision for Smarak. No timestamp was fabricated.

## Research evidence retained

The coordinate verification/audit fields remain in `places.json`, including `coordinate_verification`,
`coordinate_audit_status`, and `audit_status`. Research notes remain in
`data/research/places_research_notes.md`.

No research place was removed. Existing supported descriptive facts were not rewritten except where needed
to correct the Ram Mandir source provenance and the explicitly requested handoff cleanup.

## IDs

Existing `place_###` IDs remain unchanged for research traceability. They are not PostgreSQL primary keys.
PostgreSQL UUID generation remains a database/import-layer decision.

## Missing data policy

Opening hours, average visit time, price tier, and coordinates remain `null` where the available evidence
does not responsibly support the field.


## Final handoff validation

Mechanical validation completed on 2026-08-17:
- 32 records; 0 duplicate IDs.
- 9/9 category identifiers resolve exactly through `categories.json.id`.
- All 8 non-null coordinate records have `coordinate_audit_status: "high"`.
- All other 24 records have both `lat` and `lon` set to `null`.
- No compact time-range strings remain in `opening_hours`.
- All 32 `verified_at` values are date-only `YYYY-MM-DD` values.
- All 32 records contain an HTTP(S) source URL.
- `place_022` uses the Government of Odisha Hindu Religious Endowment Commission Ram Mandir page as its source.
