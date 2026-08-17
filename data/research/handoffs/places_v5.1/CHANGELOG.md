# CHANGELOG — O-Travelz Phase 1 Places

## v5.1 — 2026-08-17

This package is the corrected v5.1 handoff and supersedes the earlier v5.1 cleanup package.

### Changes from v5

- Made the category contract explicit: `categories.json.id` is the canonical identifier; `places.json.category` must match it exactly; `categories.json.name` is display-only.
- Corrected `place_022` (Ram Mandir, Bhubaneswar) provenance to the Government of Odisha Hindu Religious Endowment Commission source. The prior Wikimedia Commons URL was not retained as the record source.
- Re-reviewed the remaining non-null coordinates. Five additional provisional/non-authoritatively-supported points were set to `null`: `place_019`, `place_021`, `place_027`, `place_028`, and `place_029`.
- Retained all previously high-confidence point coordinates where the audit evidence was sufficiently defensible.
- Reviewed the five compact opening-hours values:
  - `place_009` Nandankanan Zoological Park was converted to a structured seasonal weekly schedule using its official publication.
  - `place_007`, `place_022`, `place_025`, and `place_032` were set to `null` because their cited evidence did not establish a defensible weekly schedule.
- Kept all 32 research/place IDs unchanged for traceability.
- Kept `verified_at` as the verified calendar date `2026-08-17`; no time was invented.
- Did not alter unsupported opening hours, average visit time, price tier, or other research facts.
- Database/PostGIS schema and UUID-primary-key decisions remain outside this research handoff.


### Final handoff validation — 2026-08-17

- Revalidated the complete 32-place package after the v5.1 corrections.
- Confirmed all category references resolve through canonical `categories.json.id` values.
- Confirmed every non-null coordinate is a complete pair and is marked `high`; all other coordinate fields are paired `null`.
- Confirmed no compact opening-hours strings remain.
- Confirmed all `verified_at` values preserve the calendar date only.
- Confirmed all source fields are populated with HTTP(S) URLs and Ram Mandir provenance is aligned with the audit.
- No additional research facts were changed.
