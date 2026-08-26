# O-Travelz Phase 1 — Places Research + Coordinate Audit v2

**Audit date:** 2026-08-17
**Records:** 32

## What was audited

- Duplicate IDs: PASS
- Placeholder records: PASS
- Source present on every record: PASS
- Verification date present on every record: PASS
- Coordinates within valid geographic range: PASS where coordinates are present
- Conflicting coordinate evidence: explicitly documented rather than silently resolved
- Opening hours: only retained where a source was found
- Price/visit-duration fields: left null where not adequately verified

## Important correction

Nandankanan Zoological Park's point coordinate from the earlier batch was removed and set to null.
The official Nandankanan page publishes a geographic range that does not agree with the earlier point,
so the project rule "do not guess coordinates" requires us to withhold the point until an authoritative
point-level source is identified.

## Coordinate confidence

**High / cross-checked:**
- Chitrakarini Temple — ASI/IGNCA evidence
- Kedar Gouri Temple — two published coordinate sources
- Kapilesvara Siva Temple — Wikidata + OSM-derived cross-check
- Ananta Vasudeva — ASI-referenced Wikidata + independent mapped point
- Lingaraj — independent mapped point agrees closely with prior coordinate
- Mukteswar — independent published coordinate agrees exactly with prior point
- Dhauli Shanti Stupa — independent published coordinate agrees closely

**Approximate / needs final authoritative point check:**
- Bharati Matha
- Megheswar
- Nageshwar
- Talesvara
- Regional Science Centre
- Indira Gandhi Park
- Buddha Jayanti Park

## Dataset status

This batch now has 32 records, meeting the numeric 30–50 target. It is **not yet final production truth**
because several coordinates are explicitly flagged as approximate and Nandankanan remains coordinate-unknown.

The correct next step is to replace every approximate coordinate with an authoritative point-level source where
possible, or set it to null before Smarak's import.
