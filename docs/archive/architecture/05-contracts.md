# Itinerary JSON Contract

Status: supporting itinerary-contract detail. The executable backend schemas and
frontend mirror are the implementation boundary; `docs/ARCHITECTURE.md` is the
canonical architecture source.

This is the shape returned by `POST /itinerary/plan` and consumed by the frontend
(map + list rendering) and the AI orchestration layer. Backend and frontend must both
test against this shape — it is the single most important contract in the repo.
Punam owns the documentation and shared project context for this contract. Smarak owns
its data semantics and itinerary meaning. Rudra owns backend/API wiring, while Deeptiman
and Susmita consume the contract in their respective frontend and map/geospatial layers.

Executable Phase 0 boundary models are in `backend/app/schemas/itinerary.py`,
`backend/app/schemas/transport.py`, and `backend/app/schemas/api.py`. The matching
frontend types are in `frontend/src/api/contracts.ts`. Phase 4 implements the
deterministic API route and feature services; accepted Phase 5 provides grounded
explanation orchestration through the separate `AIResponse` boundary.

```json
{
  "itinerary_id": "uuid",
  "constraints": { "days": 2, "interests": ["temples", "food"], "start": "Hotel X" },
  "days": [
    {
      "day_number": 1,
      "date": "2026-09-01",
      "stops": [
        {
          "sequence": 1,
          "place": { "id": "uuid", "name": "Lingaraj Temple", "category": "temple" },
          "planned_arrival": "09:00",
          "planned_departure": "10:15"
        }
      ],
      "hops": [
        {
          "from_sequence": 1,
          "to_sequence": 2,
          "mode": "walk+bus",
          "estimated_minutes": 22,
          "estimated_cost": 15,
          "legs": [
            { "mode": "walk", "detail": "8 min to Old Town bus stop" },
            { "mode": "bus", "provider": "Mo Bus", "route": "5", "detail": "3 stops" },
            { "mode": "walk", "detail": "4 min to destination" }
          ],
          "data_tier": "static"
        }
      ]
    }
  ],
  "explanation": ""
}
```

Rules:
- Every fact in `explanation` must be traceable to a field above.
- Phase 4 returns an empty deterministic `explanation`; AI-generated prose is not part
  of the Phase 4 response.
- `from_sequence=0` is reserved for a resolved start origin; itinerary stop sequences
  remain positive. An unavailable/unsupported hop may use `data_tier="unknown"` when a
  static, scheduled, or live tier would be misleading.
- `data_tier` on each hop must be surfaced in the UI (e.g. a small "approximate" badge
  when not live) so the user isn't misled about certainty.
- An unavailable hop must carry a human-readable `reason`; normal hops may omit it.
- The executable Phase 0 schemas reject fields that are not present in this contract.
