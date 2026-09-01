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

planner = MultimodalJourneyPlanner(db)

# Scenario 1: Airport -> Master Canteen
r1 = planner.plan_journey(20.2523, 85.8135, 20.2668, 85.8436)
leg1 = r1['transit_legs'][0]['route_number'] if r1['transit_legs'] else 'NONE'
print(f"\nScenario 1 (Airport -> Master Canteen): {r1['status']} [Route: {leg1}]")

# Scenario 2: Master Canteen -> Nandankanan
r2 = planner.plan_journey(20.2668, 85.8436, 20.3956, 85.8256)
leg2 = r2['transit_legs'][0]['route_number'] if r2['transit_legs'] else 'NONE'
print(f"Scenario 2 (Station -> Nandankanan): {r2['status']} [Route: {leg2}]")

# Scenario 3: Master Canteen -> AIIMS
r3 = planner.plan_journey(20.2668, 85.8436, 20.2312, 85.7891)
leg3 = r3['transit_legs'][0]['route_number'] if r3['transit_legs'] else 'NONE'
print(f"Scenario 3 (Station -> AIIMS): {r3['status']} [Route: {leg3}]")

db.close()
