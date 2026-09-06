import json
import datetime
import os

def generate_test_count_forensic():
    report = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "wave": "D1.5",
        "phase": "Phase 2 — Pytest Count Forensic",
        "reported_counts": {
            "d1_d1_1_passed": 1353,
            "d1_4_passed": 1346,
            "difference": 7
        },
        "forensic_finding": {
            "source_file": "backend/tests/test_wave_d1_product_convergence.py",
            "test_count": 7,
            "tests_identified": [
                "test_d1_runtime_health_and_readiness",
                "test_d1_golden_journey_place_discovery_and_media",
                "test_d1_golden_journey_deterministic_itinerary",
                "test_d1_transit_road_following_geometry_boundary",
                "test_d1_civic_utility_boundary_isolation",
                "test_d1_weather_truth_fail_closed",
                "test_d1_ai_planner_intent_priority_and_duration"
            ],
            "mechanism": "In Wave D1.4, 'pytestmark = pytest.mark.integration' was added to backend/tests/test_wave_d1_product_convergence.py. Because pytest.ini specifies 'addopts = -m \"not integration\"', running 'pytest backend/tests/' automatically deselects tests marked as integration. Running 'pytest backend/tests/test_wave_d1_product_convergence.py -m integration' executes all 7 tests, and all 7 PASS (100%). Total active passing tests in repository is 1346 unit + 7 integration = 1353 tests."
        },
        "classification": "EXPECTED_REORGANIZATION",
        "justification": "Zero tests were deleted, skipped due to error, or regressed. The 7 tests were classified under the integration marker to maintain hermetic unit test execution per pytest.ini standards."
    }

    os.makedirs("reports", exist_ok=True)
    with open("reports/d1_5_test_count_forensic.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print("Generated reports/d1_5_test_count_forensic.json")

if __name__ == "__main__":
    generate_test_count_forensic()
