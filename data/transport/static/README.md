# data/transport/static/ — file shape

One `<provider>.json` per provider with stops + route topology, and a
`<provider>_schedule.json` with either real timetables or explicit headway estimates.
Owner: Akriti (fill in), consumed by Rudra's adapters and Smarak's import script.

## `<provider>.json`

```json
{
  "provider": "Mo Bus",
  "mode": "bus",
  "stops": [
    { "name": "Old Town Bus Stand", "lat": 20.24, "lon": 85.83, "external_ref": null }
  ],
  "routes": [
    {
      "name": "5",
      "stop_sequence": ["Old Town Bus Stand", "Lingaraj Square", "Rail Sadan"]
    }
  ],
  "source": "REQUIRED"
}
```

## `<provider>_schedule.json`

Either real times:
```json
{ "route": "5", "explicit_departure_times": ["06:00", "06:20", "06:40"], "source": "..." }
```

Or, when no fixed timetable exists (the common case) — an explicit estimate, never a
fabricated exact time:
```json
{
  "route": "5",
  "headway_minutes_min": 15,
  "headway_minutes_max": 20,
  "hours": "06:00-21:00",
  "basis": "estimate",
  "source": "REQUIRED — how this estimate was derived"
}
```
