# Provider Verification

**Do not build a direct API integration for any provider until it's verified here.**
This file is the checklist/log Akriti (research) and Rudra (transport) keep updated.

For each provider, fill in:

## Template

```
### <Provider name>
- Mode: bus / paratransit / cab-hailing / rail / walk
- Does a public API or open data feed exist? (yes/no/unclear) — evidence/link
- If yes: what does it expose? (static schedule / live position / fares / all)
- If no: what's the best available substitute?
    - published PDF/website timetable → manually digitize into data/transport/static/
    - route topology observable on official maps → manually digitize
    - no public info at all → mark as "estimate only", get local knowledge from team,
      clearly label data_tier as static/estimate, do not present as authoritative
- Verified by: <name>, on <date>
- Data tier assigned: static | scheduled | live
```

## Providers to verify (initial list — expand as needed)

- Mo Bus / AMA Bus
- Mo E-Ride
- Odisha Yatri
- Auto / e-rickshaw (informal — likely no API; needs fare-estimation heuristics instead)
- Taxi (which local operators are relevant? any app with a usable API/deep link?)
- Train (intercity — IRCTC has no simple public API; likely need to link out rather than
  integrate, or use a verified data source if one exists)

**No entries yet — this is Akriti's first deliverable (Phase 1). Do not assume any of
the above has an API. Verify each one and fill in the template above before Rudra builds
an adapter that expects live/scheduled data for it.**
