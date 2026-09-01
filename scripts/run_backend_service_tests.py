#!/usr/bin/env python3
"""Standalone test runner for backend services, API contracts, and AI tools."""
import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.abspath("backend"))

from app.services.essentials.service import (
    EssentialsService,
    calculate_haversine_km,
    format_distance,
    is_valid_coordinate,
)
from app.ai.contracts import ToolStatus
from app.ai.tools.get_nearby_services import GetNearbyServicesTool
from app.ai.tools.get_destination_safety import GetDestinationSafetyTool
from app.schemas.service import (
    NearbyServicesListResponse,
    NearbyServicesGroupedResponse,
    DestinationSafetyContract,
)

def run_tests():
    print("=================================================================")
    print("Running Backend Essentials Service & AI Tool Test Suite")
    print("=================================================================")
    passed = 0
    total = 0

    def test(name, fn):
        nonlocal passed, total
        total += 1
        try:
            fn()
            print(f"[PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"[FAIL] {name}: {e}")

    # 1. Coordinate tests
    def t1():
        assert is_valid_coordinate(20.5056, 85.8267) is True
        assert is_valid_coordinate(15.0, 85.0) is False
        assert is_valid_coordinate(25.0, 85.0) is False
        assert is_valid_coordinate(0.0, 0.0) is False
        assert is_valid_coordinate(None, 85.0) is False
    test("Coordinate validation within Odisha bounding box", t1)

    # 2. Haversine distance
    def t2():
        dist = calculate_haversine_km(20.4638, 85.8942, 20.2961, 85.8245)
        assert 20.0 <= dist <= 30.0
    test("Haversine distance calculation (Cuttack -> Bhubaneswar)", t2)

    # 3. Distance formatting
    def t3():
        assert format_distance(0.4) == "400 m away"
        assert format_distance(4.88) == "4.9 km away"
        assert format_distance(36.2) == "36 km away"
    test("Human-readable distance formatting", t3)

    # 4. Search nearby Dhabaleswar
    def t4():
        res = EssentialsService.search_nearby_services(
            lat=20.5056,
            lon=85.8267,
            category="healthcare",
            requested_radius_km=5.0,
        )
        assert isinstance(res, NearbyServicesListResponse)
        assert res.count >= 1
        assert res.services[0].id == "hosp_athagarh_sdh"
        assert res.services[0].distance_km < 6.0
        assert res.services[0].distance_semantics == "straight_line_haversine"
    test("Nearby healthcare search around Dhabaleswar", t4)

    # 5. Category filtering
    def t5():
        res_police = EssentialsService.search_nearby_services(
            lat=20.5056,
            lon=85.8267,
            category="police",
            requested_radius_km=5.0,
        )
        assert res_police.count >= 1
        for item in res_police.services:
            assert item.category == "police"
    test("Category filtering integrity", t5)

    # 6. Progressive radius expansion for remote location
    def t6():
        res = EssentialsService.search_nearby_services(
            lat=20.7303,
            lon=87.0506, # Gahirmatha
            category="healthcare",
            requested_radius_km=5.0,
        )
        assert res.is_expanded is True
        assert res.active_radius_km > 5.0
        assert res.count >= 1
        assert res.services[0].distance_km > 25.0
    test("Progressive radius expansion on remote sanctuary (Gahirmatha)", t6)

    # 7. Destination safety lookup by ID
    def t7():
        adv = EssentialsService.get_destination_safety("round2_east_018")
        assert isinstance(adv, DestinationSafetyContract)
        assert adv.destination_name == "Dhabaleswar Island Temple"
        assert adv.nearest_police_station_id == "police_dhabaleswar_outpost"
        assert len(adv.emergency_contacts) >= 2
        assert len(adv.safety_advisories) >= 1
    test("Destination safety advisory lookup by ID", t7)

    # 8. Destination safety lookup by Name
    def t8():
        adv = EssentialsService.get_destination_safety("Ansupa Lake")
        assert isinstance(adv, DestinationSafetyContract)
        assert adv.destination_id == "round2_east_019"
        assert adv.nearest_hospital_id == "hosp_banki_sdh"
    test("Destination safety advisory lookup by Name", t8)

    # 9. Grouped discovery for destination
    def t9():
        grouped = EssentialsService.get_nearby_services_for_destination(
            lat=20.5056,
            lon=85.8267,
            destination_id="round2_east_018",
            destination_name="Dhabaleswar Island Temple",
        )
        assert isinstance(grouped, NearbyServicesGroupedResponse)
        assert grouped.total_services_count > 0
        assert len(grouped.healthcare) >= 1
        assert len(grouped.police) >= 1
        assert grouped.safety_advisory is not None
    test("Grouped essentials and safety for destination", t9)

    # 10. AI Tool: GetNearbyServicesTool
    def t10():
        tool = GetNearbyServicesTool()
        result = tool.execute({
            "lat": 20.5056,
            "lon": 85.8267,
            "category": "healthcare",
            "radius_km": 10.0,
            "limit": 3
        })
        assert result.status == ToolStatus.OK
        assert "services" in result.data
        services = result.data.get("services", [])
        assert len(services) >= 1
        assert services[0]["category"] == "healthcare"
    test("AI Tool get_nearby_services execution", t10)

    # 11. AI Tool: GetDestinationSafetyTool
    def t11():
        tool = GetDestinationSafetyTool()
        result = tool.execute({
            "destination_id_or_name": "Gahirmatha Marine Sanctuary"
        })
        assert result.status == ToolStatus.OK
        assert result.data["found"] is True
        assert result.data["advisory"]["destination_id"] == "round2_east_001"
        assert len(result.data["advisory"]["emergency_contacts"]) >= 1
    test("AI Tool get_destination_safety execution", t11)

    # 12. AI Tool: GetDestinationSafetyTool for unknown destination
    def t12():
        tool = GetDestinationSafetyTool()
        result = tool.execute({
            "destination_id_or_name": "Unknown Nowhere Place"
        })
        assert result.status == ToolStatus.OK
        assert result.data["found"] is False
        assert "112" in result.data["message"]
    test("AI Tool get_destination_safety fallback for unknown place", t12)

    print("\n=================================================================")
    print(f"SUMMARY: Total: {total} | Passed: {passed} | Failed: {total - passed}")
    print("=================================================================")
    if passed == total:
        print("RESULT: PASS -- All Backend Service & AI Tool Tests Passed!")
        return 0
    return 1

if __name__ == "__main__":
    sys.exit(run_tests())
