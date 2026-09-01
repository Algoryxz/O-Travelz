import sys
import json

sys.path.insert(0, 'backend')
from app.db.session import SessionLocal
from app.transport.planner import MultimodalJourneyPlanner

db = SessionLocal()
planner = MultimodalJourneyPlanner(db)

print('=== 1. Direct: Airport -> Master Canteen ===')
r1 = planner.plan_journey(20.2523, 85.8135, 20.2668, 85.8436)
print(f"Status: {r1['status']} | Type: {r1['journey_type']} | Transfers: {r1['transfer_count']}")
for leg in r1['transit_legs']:
    print(f"  Leg: Route {leg['route_number']} ({leg['boarding_stop_name']} -> {leg['alighting_stop_name']}) dep={leg['selected_departure']} arr={leg['estimated_arrival']}")

print('\n=== 2. Direct: Station -> Nandankanan ===')
r2 = planner.plan_journey(20.2668, 85.8436, 20.3956, 85.8256)
print(f"Status: {r2['status']} | Type: {r2['journey_type']} | Transfers: {r2['transfer_count']}")
for leg in r2['transit_legs']:
    print(f"  Leg: Route {leg['route_number']} ({leg['boarding_stop_name']} -> {leg['alighting_stop_name']}) dep={leg['selected_departure']} arr={leg['estimated_arrival']}")

print('\n=== 3. 1-Transfer: Airport -> Nandankanan ===')
r3 = planner.plan_journey(20.2523, 85.8135, 20.3956, 85.8256)
print(f"Status: {r3['status']} | Type: {r3['journey_type']} | Transfers: {r3['transfer_count']} | Transfer Hub: {r3['transfer_hub']} | Wait: {r3['transfer_wait_minutes']} mins")
print(f"Departure: {r3['departure_time']} | Arrival: {r3['estimated_arrival_time']} | Duration: {r3['total_estimated_duration_minutes']} mins")
for leg in r3['transit_legs']:
    print(f"  Leg: Route {leg['route_number']} ({leg['boarding_stop_name']} -> {leg['alighting_stop_name']}) dep={leg['selected_departure']} arr={leg['estimated_arrival']}")

print('\n=== 4. 1-Transfer: Airport -> Nandankanan (requested 10:00) ===')
r4 = planner.plan_journey(20.2523, 85.8135, 20.3956, 85.8256, requested_departure_time='10:00')
print(f"Status: {r4['status']} | Type: {r4['journey_type']} | Departure: {r4['departure_time']} | Arrival: {r4['estimated_arrival_time']}")
for leg in r4['transit_legs']:
    print(f"  Leg: Route {leg['route_number']} ({leg['boarding_stop_name']} -> {leg['alighting_stop_name']}) dep={leg['selected_departure']} arr={leg['estimated_arrival']}")

print('\n=== 5. 1-Transfer: Airport -> AIIMS ===')
r5 = planner.plan_journey(20.2523, 85.8135, 20.2312, 85.7891)
print(f"Status: {r5['status']} | Type: {r5['journey_type']} | Transfers: {r5['transfer_count']} | Transfer Hub: {r5['transfer_hub']}")
for leg in r5['transit_legs']:
    print(f"  Leg: Route {leg['route_number']} ({leg['boarding_stop_name']} -> {leg['alighting_stop_name']}) dep={leg['selected_departure']} arr={leg['estimated_arrival']}")

db.close()
