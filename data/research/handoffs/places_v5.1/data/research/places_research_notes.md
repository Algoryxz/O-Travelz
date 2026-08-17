# O-Travelz Phase 1 — Places Research + Coordinate Audit v2.1

**Audit date:** 2026-08-17  
**Records:** 32

## Contract notes

`categories.json.id` is the canonical category identifier. `places.json.category` references that identifier
exactly. `categories.json.name` is a display label.

The research/place IDs remain traceability identifiers only; they are not PostgreSQL primary keys.

## Coordinate re-review

The v5.1 handoff was reviewed again for any retained coordinate whose audit evidence was still provisional
or lacked authoritative point-level confirmation.

Five such records were set to null:

- Brahmeswar Temple (`place_019`)
- Rameshwar Deula (`place_021`)
- Nageshwar Temple (`place_027`)
- Talesvara Siva Temple (`place_028`)
- Kapilesvara Siva Temple (`place_029`)

The eight coordinates that had already been nulled in the prior v5.1 cleanup remain null. Retained coordinates
were not changed when the existing evidence was considered defensible at point level.

## Opening-hours re-review

The five compact opening-hours strings were reviewed against their cited sources.

Nandankanan Zoological Park (`place_009`) is supported by an official Nandankanan publication that states
Monday is the weekly zoo holiday and gives visitor hours of 07:30–17:30 for April–September and
08:00–17:00 for October–March. Its JSON value is therefore structured as a seasonal weekly schedule.

The other four compact values — Chausathi Yogini Temple, Ram Mandir, Kedar Gouri Temple, and Buddha Jayanti
Park — were set to null because the cited evidence did not establish a sufficiently defensible weekly
schedule. No weekly schedule was invented.

## Ram Mandir provenance correction

The Ram Mandir record now uses the Government of Odisha Hindu Religious Endowment Commission's direct
Ram Mandir page as its source. The previous Wikimedia Commons URL was removed because it did not match the
source identified as supporting the retained place information.

## Verification date

The verified calendar date remains `2026-08-17`. No verification time was established, so no timestamp was
invented. A DateTime conversion, if required by the database, remains a handoff decision for Smarak.

## Dataset status

This remains a research handoff cleanup, not a claim that every place has a point coordinate or structured
opening-hours schedule. Missing values remain null where exact support is absent.
