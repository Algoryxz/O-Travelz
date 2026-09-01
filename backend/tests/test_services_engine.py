"""Unit tests for the backend EssentialsService domain engine."""
import pytest
from app.services.essentials.service import (
    EssentialsService,
    calculate_haversine_km,
    format_distance,
    is_valid_coordinate,
)

def test_coordinate_validation():
    assert is_valid_coordinate(20.5056, 85.8267) is True
    assert is_valid_coordinate(15.0, 85.0) is False  # Outside Odisha S bound
    assert is_valid_coordinate(25.0, 85.0) is False  # Outside Odisha N bound
    assert is_valid_coordinate(20.0, 75.0) is False  # Outside Odisha W bound
    assert is_valid_coordinate(20.0, 95.0) is False  # Outside Odisha E bound
    assert is_valid_coordinate(0.0, 0.0) is False    # Placeholder (0,0) rejected
    assert is_valid_coordinate(None, 85.0) is False
    assert is_valid_coordinate("invalid", 85.0) is False

def test_haversine_distance():
    # Cuttack to Bhubaneswar (~25 km)
    dist = calculate_haversine_km(20.4638, 85.8942, 20.2961, 85.8245)
    assert 20.0 <= dist <= 30.0

def test_format_distance():
    assert format_distance(0.4) == "400 m away"
    assert format_distance(4.88) == "4.9 km away"
    assert format_distance(36.2) == "36 km away"

def test_nearby_search_dhabaleswar():
    # Dhabaleswar coordinates
    res = EssentialsService.search_nearby_services(
        lat=20.5056,
        lon=85.8267,
        category="healthcare",
        requested_radius_km=5.0,
    )
    assert res.count >= 1
    assert res.services[0].id == "hosp_athagarh_sdh"
    assert res.services[0].distance_km < 6.0
    assert res.services[0].distance_semantics == "straight_line_haversine"

def test_nearby_search_category_filtering():
    res_police = EssentialsService.search_nearby_services(
        lat=20.5056,
        lon=85.8267,
        category="police",
        requested_radius_km=5.0,
    )
    assert res_police.count >= 1
    for item in res_police.services:
        assert item.category == "police"

def test_progressive_radius_expansion_remote_site():
    # Gahirmatha Marine Sanctuary (remote beach)
    res = EssentialsService.search_nearby_services(
        lat=20.7303,
        lon=87.0506,
        category="healthcare",
        requested_radius_km=5.0,
    )
    # Should expand to 50km
    assert res.is_expanded is True
    assert res.active_radius_km > 5.0
    assert res.count >= 1
    assert res.services[0].distance_km > 25.0

def test_destination_safety_lookup():
    adv = EssentialsService.get_destination_safety("round2_east_018")
    assert adv is not None
    assert adv.destination_name == "Dhabaleswar Island Temple"
    assert adv.nearest_police_station_id == "police_dhabaleswar_outpost"
    assert len(adv.emergency_contacts) >= 2
    assert len(adv.safety_advisories) >= 1

def test_destination_safety_by_name():
    adv = EssentialsService.get_destination_safety("Ansupa Lake")
    assert adv is not None
    assert adv.destination_id == "round2_east_019"
    assert adv.nearest_hospital_id == "hosp_banki_sdh"

def test_haversine_zero_distance():
    assert calculate_haversine_km(20.5056, 85.8267, 20.5056, 85.8267) == 0.0

def test_subcategory_filtering():
    res_chc = EssentialsService.search_nearby_services(
        lat=20.5906,
        lon=86.2522,
        category="healthcare",
        subcategory="chc",
        requested_radius_km=15.0,
    )
    assert res_chc.count >= 1
    for s in res_chc.services:
        assert s.subcategory == "chc"

def test_empty_result_invalid_coordinates():
    res_invalid = EssentialsService.search_nearby_services(
        lat=0.0,
        lon=0.0,
        category="healthcare",
    )
    assert res_invalid.count == 0
    assert len(res_invalid.services) == 0

def test_get_destination_safety_non_existent():
    adv = EssentialsService.get_destination_safety("totally_non_existent_place_xyz")
    assert adv is None

def test_get_nearby_services_for_destination():
    grouped = EssentialsService.get_nearby_services_for_destination(
        lat=20.5056,
        lon=85.8267,
        destination_id="round2_east_018",
        destination_name="Dhabaleswar Island Temple",
    )
    assert grouped.total_services_count > 0
    assert len(grouped.healthcare) >= 1
    assert len(grouped.police) >= 1
    assert grouped.safety_advisory is not None
    assert grouped.distance_semantics == "straight_line_haversine"
