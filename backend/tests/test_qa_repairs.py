"""Targeted QA & Integration Regression Tests for Post-Phase 4 Repairs."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.location.geocoding import reverse_geocode_coordinates, _clean_administrative_name, _is_administrative_ward
from app.db.session import SessionLocal
from app.models.transport import TransportProvider, Route, Stop, ScheduledTripGroup, RouteStop
from app.models.place import Place

client = TestClient(app)


def test_clean_administrative_name():
    """Verify administrative suffix stripping."""
    assert _clean_administrative_name("Bhubaneswar Municipal Corporation") == "Bhubaneswar"
    assert _clean_administrative_name("Cuttack Municipal Corporation") == "Cuttack"
    assert _clean_administrative_name("Puri Municipality") == "Puri"
    assert _clean_administrative_name("Baripada Notified Area Council") == "Baripada"
    assert _clean_administrative_name("Balasore NAC") == "Balasore"
    assert _clean_administrative_name("Bhubaneswar") == "Bhubaneswar"
    assert _clean_administrative_name(None) is None


def test_is_administrative_ward():
    """Verify ward filtering."""
    assert _is_administrative_ward("Ward 41") is True
    assert _is_administrative_ward("Ward 12") is True
    assert _is_administrative_ward("Hanspal") is False
    assert _is_administrative_ward("Saheed Nagar") is False


def test_reverse_geocode_coordinates_no_raw_coordinates():
    """Verify reverse geocoding returns clean human-readable locality without raw coordinates."""
    coords_list = [
        (20.31, 85.89),      # Hanspal / Balianta
        (20.2667, 85.8436),  # Master Canteen
        (20.4625, 85.8828),  # Cuttack
        (19.8135, 85.8312),  # Puri
        (19.8876, 86.0945),  # Konark
    ]
    for lat, lon in coords_list:
        res = reverse_geocode_coordinates(lat, lon)
        assert "locality" in res
        loc = res["locality"]
        assert loc is not None
        assert "°" not in loc, f"Found raw coordinate format in locality: {loc}"
        assert "Municipal Corporation" not in loc, f"Found administrative suffix in locality: {loc}"
        assert res["state"] == "Odisha"
        assert res["country"] == "India"


@pytest.mark.integration
def test_place_detail_response_includes_research_id():
    """Verify PlaceDetailResponse includes research_id field."""
    response = client.get("/places")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    first_place = data[0]
    place_id = first_place["id"]

    detail_response = client.get(f"/places/{place_id}")
    assert detail_response.status_code == 200
    detail_data = detail_response.json()
    assert "id" in detail_data
    assert "research_id" in detail_data
    assert "name" in detail_data
    assert "category" in detail_data


@pytest.mark.integration
def test_nearby_stops_api_contract():
    """Verify /transport/stops/nearby returns verified geocoded stops."""
    # Near Master Canteen Bhubaneswar
    response = client.get("/transport/stops/nearby?lat=20.2667&lon=85.8436&radius_m=5000&limit=4")
    assert response.status_code == 200
    stops = response.json()
    assert isinstance(stops, list)
    assert len(stops) > 0
    first_stop = stops[0]
    assert "stop_id" in first_stop
    assert "name" in first_stop
    assert "latitude" in first_stop
    assert "longitude" in first_stop
    assert "distance_m" in first_stop
    assert "walking_estimate_mins" in first_stop
    assert "routes_serving_stop" in first_stop


@pytest.mark.integration
def test_transport_map_api_contract():
    """Verify /transport/map returns stops and verified route geometries."""
    response = client.get("/transport/map")
    assert response.status_code == 200
    data = response.json()
    assert "stops" in data
    assert "routes" in data
    assert "total_routes" in data
    assert "total_stops" in data
    assert data["total_routes"] == 154
    assert data["total_stops"] == 1430


@pytest.mark.integration
def test_multimodal_journey_planning_api_contract():
    """Verify multimodal journey planning endpoint returns valid JSON structure."""
    payload = {
        "origin_lat": 20.2667,
        "origin_lon": 85.8436,
        "destination_lat": 20.2520,
        "destination_lon": 85.8178,
        "max_walking_distance_m": 3000,
        "include_food": True,
    }
    response = client.post("/transport/plan-journey", json=payload)
    assert response.status_code == 200
    journey = response.json()
    assert "status" in journey
    assert "journey_type" in journey
    assert "transit_legs" in journey
    assert "walking_legs" in journey
    assert "total_estimated_duration_minutes" in journey


@pytest.mark.integration
def test_database_invariants_post_phase_4():
    """Verify authoritative database invariants."""
    db = SessionLocal()
    try:
        provider_count = db.query(TransportProvider).count()
        assert provider_count == 3, f"Expected 3 providers, got {provider_count}"

        route_count = db.query(Route).count()
        assert route_count == 154, f"Expected 154 routes, got {route_count}"

        total_stops = db.query(Stop).count()
        assert total_stops == 1430, f"Expected 1430 total stops, got {total_stops}"

        geocoded_stops = db.query(Stop).filter(Stop.location != None).count()  # noqa: E711
        assert geocoded_stops == 41, f"Expected 41 geocoded stops, got {geocoded_stops}"

        route_stops = db.query(RouteStop).count()
        assert route_stops == 1487, f"Expected 1487 route stops, got {route_stops}"

        trip_groups = db.query(ScheduledTripGroup).count()
        assert trip_groups == 302, f"Expected 302 trip groups, got {trip_groups}"

        all_groups = db.query(ScheduledTripGroup).all()
        departures_count = sum(len(g.departure_times_chronological or []) for g in all_groups)
        assert departures_count == 5553, f"Expected 5553 departures, got {departures_count}"

        total_places = db.query(Place).count()
        assert total_places == 204, f"Expected 204 total places (161 sanctuaries + 43 food), got {total_places}"
    finally:
        db.close()


def test_location_routes_endpoints():
    """Verify both /location/reverse-geocode and /location/current endpoints return 200."""
    res1 = client.get("/location/reverse-geocode?lat=20.2667&lon=85.8436")
    assert res1.status_code == 200
    data1 = res1.json()
    assert "locality" in data1
    assert "city" in data1

    res2 = client.get("/location/current?lat=20.2667&lon=85.8436")
    assert res2.status_code == 200
    data2 = res2.json()
    assert "locality" in data2
    assert "city" in data2

