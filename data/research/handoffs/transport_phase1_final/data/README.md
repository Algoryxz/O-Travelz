# data/

Verified, sourced, human-curated data. This is the ground truth the rest of the system
is built on — everything here needs a `source` field on every record. No AI-generated
placeholders. Owner: Akriti (see `docs/team/AKRITI.md`).

```
places/                place data (see docs/architecture/02-database.md Place entity)
transport/static/      per-provider stop/route topology + schedule (real or headway-estimate)
transport/fares/       per-provider fare rules
research/              working notes, source links, anything not yet finalized into the
                         structured files above
```

These files get imported into Postgres by `scripts/import_places.py` and
`scripts/import_transport.py` (Smarak). Keep field names aligned with
`docs/architecture/02-database.md` so import stays a straightforward mapping.
