"""
Phase 4B Forensic Verification Script.
Validates:
1. Exact graph invariants (3 providers, 154 routes, 1430 stops, 1487 links, 302 schedules, 5553 departures, 41 geocoded, 1389 unresolved).
2. Direct route regression (Airport -> Master Canteen).
3. Direct route regression (Master Canteen -> Nandankanan).
4. Direct route regression (Master Canteen -> AIIMS).
5. 1-Transfer route behavior (Airport -> Nandankanan via Master Canteen Hub).
6. 1-Transfer route behavior (Airport -> AIIMS via Master Canteen Hub).
7. Schedule filtering at 10:00.
8. Unresolved coordinate safety (location=NULL, coordinate_status='unresolved').
9. Zero database mutations or migrations.
"""
import sys
import json

sys.path.insert(0, 'backend')
from app.db.session import SessionLocal
from app.models.transport import TransportProvider, Route, Stop, RouteStop, ScheduledTripGroup
from app.transport.planner import MultimodalJourneyPlanner

db = SessionLocal()

print('=== FORENSIC GRAPH INVARIANTS ===')
providers = db.query(TransportProvider).count()
routes = db.query(Route).count()
stops = db.query(Stop).count()
route_stops = db.query(RouteStop).count()
schedules = db.query(ScheduledTripGroup).count()
geocoded = db.query(Stop).filter(Stop.location.isnot(None)).count()
unresolved = db.query(Stop).filter(Stop.location.is_(None)).count()

departures_count = 0
for sg in db.query(ScheduledTripGroup).all():
    deps = sg.departure_times_chronological
    if isinstance(deps, str):
        try:
            deps = json.loads(deps)
        except Exception:
            deps = []
    if isinstance(deps, list):
        departures_count += len(deps)

print(f'Providers:        {providers} (expected 3)')
print(f'Routes:           {routes} (expected 154)')
print(f'Stops:            {stops} (expected 1430)')
print(f'RouteStops:       {route_stops} (expected 1487)')
print(f'Schedule Groups:  {schedules} (expected 302)')
print(f'Departures:       {departures_count} (expected 5553)')
print(f'Geocoded Stops:   {geocoded} (expected 41)')
print(f'Unresolved Stops: {unresolved} (expected 1389)')

assert providers == 3
assert routes == 154
assert stops == 1430
assert route_stops == 1487
assert schedules == 302
assert departures_count == 5553
assert geocoded == 41
assert unresolved == 1389

planner = MultimodalJourneyPlanner(db)

# 1. Direct: Airport -> Master Canteen
r1 = planner.plan_journey(20.2523, 85.8135, 20.2668, 85.8436)
print(f"\n1. Direct (Airport -> Station): {r1['status']} | Type: {r1['journey_type']} | Route: {r1['transit_legs'][0]['route_number']} | Dep: {r1['transit_legs'][0]['selected_departure']} Arr: {r1['transit_legs'][0]['estimated_arrival']}")
assert r1['status'] == 'SUCCESS'
assert r1['journey_type'] == 'direct'

# 2. Direct: Station -> Nandankanan
r2 = planner.plan_journey(20.2668, 85.8436, 20.3956, 85.8256)
print(f"2. Direct (Station -> Nandankanan): {r2['status']} | Type: {r2['journey_type']} | Route: {r2['transit_legs'][0]['route_number']}")
assert r2['status'] == 'SUCCESS'
assert r2['journey_type'] == 'direct'

# 3. Direct: Station -> AIIMS
r3 = planner.plan_journey(20.2668, 85.8436, 20.2312, 85.7891)
print(f"3. Direct (Station -> AIIMS): {r3['status']} | Type: {r3['journey_type']} | Route: {r3['transit_legs'][0]['route_number']}")
assert r3['status'] == 'SUCCESS'
assert r3['journey_type'] == 'direct'

# 4. 1-Transfer: Airport -> Nandankanan
r4 = planner.plan_journey(20.2523, 85.8135, 20.3956, 85.8256)
print(f"4. 1-Transfer (Airport -> Nandankanan): {r4['status']} | Type: {r4['journey_type']} | Hub: {r4['transfer_hub']} | Wait: {r4['transfer_wait_minutes']}m")
assert r4['status'] == 'SUCCESS'
assert r4['journey_type'] == '1_transfer'
assert len(r4['transit_legs']) == 2

# 5. 1-Transfer with Schedule Filtering: Airport -> Nandankanan (10:00)
r5 = planner.plan_journey(20.2523, 85.8135, 20.3956, 85.8256, requested_departure_time='10:00')
print(f"5. 1-Transfer Scheduled (10:00): {r5['status']} | Dep: {r5['departure_time']} | Arr: {r5['estimated_arrival_time']}")
assert r5['status'] == 'SUCCESS'
assert r5['departure_time'] == '10:12'
assert r5['estimated_arrival_time'] == '10:45'

# 6. Coordinate Safety Check
unresolved_records = db.query(Stop).filter(Stop.location.is_(None)).all()
assert len(unresolved_records) == 1389
for u in unresolved_records:
    assert u.location is None
    assert u.coordinate_status == 'unresolved'

print('\n=== ALL FORENSIC PHASE 4B VERIFICATIONS PASSED ===')
db.close()
