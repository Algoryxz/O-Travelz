# Smarak Phase 4 Implementation Handoff

## Status

**READY FOR ACCEPTANCE REVIEW — PHASE 4 NOT ACCEPTED**

The approved Phase 4 implementation is complete for this implementation run. Acceptance
remains a separate review decision and must not be inferred from the passing test suite.

## Repository state

- Branch: `main`
- Current HEAD: `d6a0291734f40dbe76e113b014d574104eb5f7d3`
- Phase 3 remains accepted with explicit limitations at that commit.
- Existing Phase 2/Phase 3, Smarak, and Susmita working-tree changes were preserved.
- No commit, reset, stash, revert, provider data edit, migration, or database model
  change was performed by this implementation run.

## Akriti evidence integration pass

The supplied Akriti evidence package was inspected at
`C:\Users\smara\Downloads\O-Travelz_Phase4_Akriti_Verified_Handoff_FINAL_2026-08-18.zip`.
The six SHA-256 values listed in its `MANIFEST.json` matched the archive entries.
Its 32-record `verified_places.csv` matches the reviewed v5.1 place handoff exactly:
32 stable IDs (`place_001`–`place_032`), 9 categories, 8 complete coordinate pairs,
24 NULL coordinate pairs, and 32 verification dates. The current repository's
`data/places/places.json` contains the same 32 place facts, while the reviewed v5.1
handoff is the source that carries the stable IDs and research/audit metadata used by
the Phase 2 importer and database model.

The 83-record BQS inventory, 36-record Route 12 reconciliation, 36-record ordered
Route 12 extraction, and 13-route AMA E-Ride source were reconciled against the
existing research inputs. They remain evidence-only. The 22 explicit normalized BQS
matches are not treated as place records; the 14 `NEW_NON_BQS_OR_UNRESOLVED` Route 12
rows are not promoted; and the AMA E-Ride stop coordinates/external references remain
unresolved/NULL. The existing Phase 3 transport boundary remains authoritative.

The only implementation adjustment in this pass was an explicit verified-place query
filter (`Place.verified_at IS NOT NULL`) plus its focused repository regression test.
No Akriti CSV/JSON was copied into production tables, no duplicate places were added,
and no schema, migration, transport, frontend, or itinerary-semantic change was made.

## Implemented semantics

- Verified-place repository projection preserves database UUID, canonical category
  identifier, name, research ID, and coordinate availability.
- Ranking uses only exact normalized interest/category relevance and the approved
  relevance/category/name/research-ID/UUID order.
- All verified places can rank; only coordinate-bearing places enter routed itinerary
  selection.
- Global selection is unique and capped at three stops per requested day.
- Day objects are deterministic and preserve global ranking order and supplied date
  labels.
- Start resolution is exact and deterministic through verified place identity/name
  lookup; no geocoder or coordinate inference exists.
- Start-to-first-stop uses `from_sequence=0`; same-day hops use actual positive stop
  sequences; no return-to-start hop is created.
- Phase 3 `TransportService` remains the routing boundary. Returned legs, tier,
  nullable duration/cost, provider, and unavailable reasons are preserved.
- Unavailable hops remain in the itinerary and are distinct from complete planning
  failures.
- The facts-only response uses a deterministic empty `explanation` field.
- `POST /itinerary/plan` is registered and uses the existing structured API error
  contract for request/planning failures.
- The API/schema contract adds `unknown` only for an honest unavailable/unsupported
  state; the Phase 2 database enum remains `static`/`scheduled`/`live`.

## Files created by this implementation

- `backend/app/api/itinerary_routes.py`
- `backend/app/services/ranking/repository.py`
- `backend/app/services/ranking/service.py`
- `backend/app/services/itinerary/service.py`
- `backend/tests/test_place_repository.py`
- `backend/tests/test_ranking.py`
- `backend/tests/test_itinerary.py`
- `backend/tests/test_itinerary_api.py`
- `backend/tests/test_frontend_itinerary_fixture.py`
- `docs/handoffs/2026-08-18_SMARAK_PHASE4_DECISIONS.md`
- `docs/handoffs/2026-08-18_SMARAK_PHASE4_IMPLEMENTATION_HANDOFF.md`

## Files modified for Phase 4

- `backend/app/services/ranking/__init__.py`
- `backend/app/services/itinerary/__init__.py`
- `backend/app/schemas/transport.py`
- `backend/app/schemas/itinerary.py`
- `backend/app/ai/schemas.py` for backwards-compatible sequence propagation
- `backend/app/transport/service.py` for sequence propagation and unknown unavailable
  tier
- `backend/app/main.py`
- `backend/tests/test_phase0_contracts.py`
- `backend/tests/test_transport/test_service.py`
- `frontend/src/api/contracts.ts` for the shared `unknown` tier mirror; no frontend UI
  changed
- `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/PHASES.md`, `docs/MEMORY.md`,
  `docs/REPOSITORY_MAP.md`,
  `docs/architecture/05-contracts.md`, and the Phase 4 scope report
- `docs/transportation/00-transport-model.md` for the schema-level unknown honesty
  state

## Files modified in the Akriti evidence integration pass

- `backend/app/services/ranking/repository.py` to enforce the verified-place query
  boundary explicitly.
- `backend/tests/test_place_repository.py` to prove unverified place rows are excluded.
- `docs/handoffs/2026-08-18_SMARAK_PHASE4_DECISIONS.md` and this handoff to record the
  archive validation, counts, reconciliation, evidence-only boundary, and limitation
  status.

The repository also contains pre-existing modified/untracked files outside this list;
they were inspected for state and left untouched.

## Transport limitations inherited from Phase 3

- AMA Bus and Mo E-Ride do not have source-backed coordinate-bearing production routing
  records in the current repository.
- AMA fare/cost remains unknown and nullable.
- No live provider capability is claimed.
- Pace, mobility, and transport-budget semantics remain fail-closed in the existing
  transport service; the itinerary preserves the resulting unavailable hop rather than
  claiming unsupported compliance.
- Map geometry, GeoJSON, frontend behavior, and provider integrations remain outside
  Phase 4.

## Verification

| Command | Result |
|---|---|
| `\.\.venv\Scripts\python.exe -m pytest backend/tests -q` | **134 passed, 1 warning** after the Akriti boundary regression test |
| `\.\.venv\Scripts\python.exe -m compileall -q backend/app` | Passed |
| Shared frontend fixture validation through `ItineraryResponse` | Passed as part of backend suite |
| `git diff --check` | Passed; existing LF/CRLF conversion warnings only |
| Frontend Vitest/build | Not run; `frontend/node_modules` is absent |

The Akriti evidence validation also passed: all manifest hashes matched; verified
places matched the reviewed v5.1 handoff 32/32; BQS was 83/83 with unresolved
coordinates; Route 12 was 36/36 with 22 normalized BQS matches and 14 unresolved/non-
BQS records; ordered stop sequence was 1–36; and AMA E-Ride contained 13 routes with
129 unresolved stop references.

The pre-Akriti Phase 4 baseline was `133 passed, 1 warning`; the current result is
`134 passed, 1 warning` after adding one verified-boundary regression test. The
original Phase 2/Phase 3 baseline was `116 passed, 1 warning`. No existing tests were
removed or weakened.

## Scope/fabrication audit

- No AI, LLM, ML, randomization, fuzzy matching, provider integration, geocoder, map,
  frontend UI, migration, database-model redesign, or source-data change was added.
- No coordinates, fares, schedules, opening hours, durations, routes, or provider
  capabilities were fabricated.
- `NULL` coordinates remain explicit and exclude a place from routed selection only.
- Unknown transport costs remain `null`; unavailable hops retain reasons and an honest
  schema-level `unknown` tier.
- The implementation exposes no ORM objects from the API.

## Remaining limitations and acceptance items

- Phase 4 acceptance review has not yet occurred.
- Frontend tooling remains unavailable locally, although the shared fixture parses
  through the backend contract.
- Real provider-backed multimodal hops remain unavailable under the accepted Phase 3
  research limitations.
- Phase 5 AI explanation and orchestration remain unimplemented.

## Downstream implications

AI, map, and frontend consumers may use the structured itinerary contract after Phase 4
acceptance review. They must preserve empty facts-only explanation behavior for the Phase
4 response, handle `from_sequence=0` as a start-origin hop, preserve `unknown` tier and
unavailable reasons, and not infer missing provider facts or geometry.
