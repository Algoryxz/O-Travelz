"""Tests for AI Checkpoint 3: Verified Domain Tools (Weather + Crowd + Transit)."""
from datetime import datetime, time
import pytest
from app.ai.contracts import ChatMessage, ChatRole, ClaimType, EvidenceItem, ToolCall, ToolStatus
from app.ai.conversation import GroundedConversationOrchestrator, GroundedConversationResponse
from app.ai.model import RuleBasedModelAdapter
from app.ai.schemas import AIStatus, IntentKind, PlanningConstraints
from app.ai.tools.adapters import (
    EstimateCrowdToolAdapter,
    GetTransitOptionsToolAdapter,
    GetWeatherToolAdapter,
    create_default_tool_registry,
)
from app.schemas.weather import WeatherObservation, WeatherResponse
from app.services.crowd.models import CrowdEstimate
from app.services.crowd.service import CrowdService
from tests.test_ai_grounded_conversation import MockTransportHopPlanner, mock_places, test_orchestrator


class MockWeatherAdapter:
    """Mock weather adapter returning verified Open-Meteo observations."""

    def __init__(self, should_fail: bool = False) -> None:
        self.should_fail = should_fail

    def fetch_weather(self, lat: float, lon: float, location_name: str) -> WeatherResponse:
        if self.should_fail:
            obs = WeatherObservation(
                location_name=location_name,
                lat=lat,
                lon=lon,
                observed_at="2026-08-31T12:00:00Z",
                condition="Unavailable",
                freshness_timestamp="2026-08-31T12:00:00Z",
                status="unavailable",
                error_reason="Provider connection timed out",
            )
            return WeatherResponse(location_name=location_name, current=obs)

        obs = WeatherObservation(
            location_name=location_name,
            lat=lat,
            lon=lon,
            observed_at="2026-08-31T12:00:00Z",
            temperature_c=31.2,
            apparent_temperature_c=35.0,
            condition="Partly Cloudy",
            humidity_pct=72,
            precipitation_probability_pct=40,
            wind_speed_kmh=18.5,
            advice="Pleasant coastal breeze; carry light umbrella.",
            freshness_timestamp="2026-08-31T12:00:00Z",
            status="available",
            provider="Open-Meteo",
        )
        return WeatherResponse(location_name=location_name, current=obs)


class MockWeatherService:
    def __init__(self, should_fail: bool = False) -> None:
        self.adapter = MockWeatherAdapter(should_fail=should_fail)

    def get_weather_for_location(self, lat=None, lon=None, location_name=None):
        return self.adapter.fetch_weather(
            lat=lat or 19.8135,
            lon=lon or 85.8312,
            location_name=location_name or "Puri",
        )


# ==============================================================================
# 1. Weather Tool Tests (1-3)
# ==============================================================================

class TestWeatherTool:
    def test_1_valid_location_returns_sourced_weather(self):
        service = MockWeatherService()
        adapter = GetWeatherToolAdapter(service)
        res = adapter.execute({"location": "Puri"})
        assert res.status == ToolStatus.OK
        assert res.data["location"] == "Puri"
        assert res.data["temperature_c"] == 31.2
        assert res.data["condition"] == "Partly Cloudy"
        assert res.data["source"] == "Open-Meteo"
        assert res.data["claim_type"] == "live"

    def test_2_unavailable_provider_returns_safe_error_or_unavailable(self):
        service = MockWeatherService(should_fail=True)
        adapter = GetWeatherToolAdapter(service)
        res = adapter.execute({"location": "UnknownLocation"})
        assert res.status == ToolStatus.UNAVAILABLE
        assert res.data["status"] == "unavailable"
        assert res.data["claim_type"] == "unknown"
        assert "timed out" in res.data["error_reason"]

    def test_3_no_fabricated_fields(self):
        service = MockWeatherService()
        adapter = GetWeatherToolAdapter(service)
        res = adapter.execute({"location": "Konark"})
        data = res.data
        # Ensure only supported schema fields are returned
        allowed_keys = {
            "location", "temperature_c", "apparent_temperature_c", "condition",
            "humidity_pct", "precipitation_probability_pct", "wind_speed_kmh",
            "advice", "observed_at", "freshness_timestamp", "status",
            "claim_type", "source", "error_reason",
        }
        assert set(data.keys()).issubset(allowed_keys)


# ==============================================================================
# 2. Crowd Intelligence Tests (4-9)
# ==============================================================================

class TestCrowdIntelligence:
    def test_4_weekend_midday_heritage_place_high(self):
        crowd_service = CrowdService()
        # Saturday at 12:00 for Heritage place
        dt_sat_noon = datetime(2026, 9, 5, 12, 0)  # Saturday
        place = {"id": "p3", "name": "Konark Sun Temple", "category": "heritage"}
        est = crowd_service.estimate_crowd(place, arrival_datetime=dt_sat_noon)
        assert est.level == "high"
        assert est.confidence in ("medium", "high")
        assert est.claim_type == "estimated"

    def test_5_early_morning_lower_than_midday(self):
        crowd_service = CrowdService()
        place = {"id": "p3", "name": "Konark Sun Temple", "category": "heritage"}
        dt_morning = datetime(2026, 9, 5, 7, 0)  # Saturday 07:00
        dt_noon = datetime(2026, 9, 5, 12, 0)  # Saturday 12:00

        est_m = crowd_service.estimate_crowd(place, arrival_datetime=dt_morning)
        est_n = crowd_service.estimate_crowd(place, arrival_datetime=dt_noon)

        order = {"low": 1, "moderate": 2, "high": 3}
        assert order[est_m.level] < order[est_n.level]

    def test_6_unknown_place_returns_unknown_safely(self):
        crowd_service = CrowdService()
        est = crowd_service.estimate_crowd(None)
        assert est.level == "unknown"
        assert est.confidence == "low"
        assert any("missing" in f.lower() for f in est.factors)

    def test_7_closed_attraction_never_receives_recommended_closed_window(self):
        crowd_service = CrowdService()
        place = {
            "id": "m1",
            "name": "Odisha State Museum",
            "category": "museum",
            "opening_hours": {"open": "10:00", "close": "17:00"},
        }
        # Arrival at 21:00 (closed)
        dt_night = datetime(2026, 9, 5, 21, 0)
        est = crowd_service.estimate_crowd(place, arrival_datetime=dt_night)
        assert est.level == "unknown"
        assert any("closed" in f.lower() for f in est.factors)
        # Recommended window must be within valid operating hours (10:00 - 17:00)
        assert est.recommended_window is not None
        assert est.recommended_window.start >= "10:00"
        assert est.recommended_window.end <= "17:00"

    def test_8_avoid_crowds_preference_affects_signal_and_factors(self):
        crowd_service = CrowdService()
        place = {"id": "p1", "name": "Jagannath Temple", "category": "temple"}
        dt_noon = datetime(2026, 9, 5, 12, 0)

        est_normal = crowd_service.estimate_crowd(place, arrival_datetime=dt_noon, avoid_crowds=False)
        est_avoid = crowd_service.estimate_crowd(place, arrival_datetime=dt_noon, avoid_crowds=True)

        assert any("crowd avoidance" in f.lower() for f in est_avoid.factors)
        assert est_avoid.recommended_window is not None

    def test_9_weather_context_influences_recommended_window_and_factors(self):
        crowd_service = CrowdService()
        place = {"id": "b1", "name": "Puri Golden Beach", "category": "beach"}
        dt_noon = datetime(2026, 9, 5, 12, 0)
        weather_rain = {"precipitation_probability_pct": 80, "condition": "Heavy Rain"}

        est = crowd_service.estimate_crowd(place, arrival_datetime=dt_noon, weather_context=weather_rain)
        assert any("precipitation" in f.lower() or "safety" in f.lower() for f in est.factors)


# ==============================================================================
# 3. Transit Options Tool Tests (10-14)
# ==============================================================================

class TestTransitOptionsTool:
    def test_10_verified_route_returns_route_stop_schedule(self):
        planner = MockTransportHopPlanner()
        adapter = GetTransitOptionsToolAdapter(planner)
        res = adapter.execute({"origin_id": "p1", "destination_id": "p2"})
        assert res.status == ToolStatus.OK
        assert res.data["available"] is True
        assert res.data["mode"] == "walk"
        assert res.data["estimated_minutes"] == 12
        assert len(res.data["legs"]) > 0
        assert res.data["claim_type"] == "scheduled"

    def test_11_no_verified_route_returns_unavailable_safely(self):
        class UnavailableTransportPlanner:
            def plan_transport_hop(self, args):
                from app.schemas.transport import DataTier, TransportHopContract
                return TransportHopContract(
                    from_sequence=args.from_sequence,
                    to_sequence=args.to_sequence,
                    mode="unavailable",
                    estimated_minutes=None,
                    estimated_cost=None,
                    legs=[],
                    data_tier=DataTier.UNKNOWN,
                    reason="No verified transport path connects these places.",
                )

        adapter = GetTransitOptionsToolAdapter(UnavailableTransportPlanner())
        res = adapter.execute({"origin_id": "remote_1", "destination_id": "remote_2"})
        assert res.status == ToolStatus.OK
        assert res.data["available"] is False
        assert "No verified public-transit option" in res.data["message"]

    def test_12_no_invented_fares(self):
        planner = MockTransportHopPlanner()
        adapter = GetTransitOptionsToolAdapter(planner)
        res = adapter.execute({"origin_id": "p1", "destination_id": "p2"})
        # Verify fare is not invented or present in data
        assert "estimated_cost" not in res.data or res.data.get("estimated_cost") is None

    def test_13_no_live_tracking_fields(self):
        planner = MockTransportHopPlanner()
        adapter = GetTransitOptionsToolAdapter(planner)
        res = adapter.execute({"origin_id": "p1", "destination_id": "p2"})
        # Must not claim live GPS or live telemetry
        assert "live_bus_location" not in res.data
        assert "gps_telemetry" not in res.data
        assert res.data["claim_type"] != "live"

    def test_14_malformed_schedule_handled_safely(self):
        class ExceptionTransportPlanner:
            def plan_transport_hop(self, args):
                raise ValueError("Corrupt timetable data")

        adapter = GetTransitOptionsToolAdapter(ExceptionTransportPlanner())
        res = adapter.execute({"origin_id": "p1", "destination_id": "p2"})
        assert res.status == ToolStatus.ERROR
        assert "failed" in res.reason.lower()


# ==============================================================================
# 4. Tool Routing & Intent Selection Tests (15-17)
# ==============================================================================

class TestToolRouting:
    def test_15_weather_query_selects_get_weather(self):
        adapter = RuleBasedModelAdapter()
        # English
        res_en = adapter.parse_intent("Will it rain in Puri today?")
        assert res_en["kind"] == IntentKind.PLANNING.value
        assert any(tc["name"] == "get_weather" for tc in res_en["tool_calls"])

        # Odia
        res_or = adapter.parse_intent("ପୁରୀରେ ଆଜି ପାଣିପାଗ କିପରି ଅଛି?")
        assert any(tc["name"] == "get_weather" for tc in res_or["tool_calls"])

        # Hindi
        res_hi = adapter.parse_intent("पुरी में आज मौसम कैसा रहेगा?")
        assert any(tc["name"] == "get_weather" for tc in res_hi["tool_calls"])

    def test_16_crowd_query_selects_estimate_crowd(self):
        adapter = RuleBasedModelAdapter()
        # English
        res_en = adapter.parse_intent("Is Konark Sun Temple crowded around noon?")
        assert res_en["kind"] == IntentKind.PLANNING.value
        assert any(tc["name"] == "estimate_crowd" for tc in res_en["tool_calls"])

        # Odia
        res_or = adapter.parse_intent("କୋଣାର୍କ ମନ୍ଦିରରେ କେତେ ଭିଡ଼ ଅଛି?")
        assert any(tc["name"] == "estimate_crowd" for tc in res_or["tool_calls"])

    def test_17_transit_query_selects_get_transit_options(self):
        adapter = RuleBasedModelAdapter()
        # English
        res_en = adapter.parse_intent("How to go from Puri to Konark by bus?")
        assert res_en["kind"] == IntentKind.PLANNING.value
        assert any(tc["name"] == "get_transit_options" for tc in res_en["tool_calls"])


# ==============================================================================
# 5. Evidence Item Claim Types (18-20)
# ==============================================================================

class TestEvidenceItemClaimTypes:
    def test_18_weather_evidence_claim_type_live(self, test_orchestrator):
        test_orchestrator.weather_service = MockWeatherService()
        # Register in tool registry
        test_orchestrator.registry._tools["get_weather"] = GetWeatherToolAdapter(test_orchestrator.weather_service)

        res = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="What is the weather in Puri?")
        ])
        assert res.status == AIStatus.SUCCESS
        assert len(res.evidence_items) > 0
        w_ev = next(e for e in res.evidence_items if e.title == "Current weather")
        assert w_ev.claim_type == ClaimType.LIVE
        assert "Open-Meteo" in w_ev.source

    def test_19_crowd_evidence_claim_type_estimated(self, test_orchestrator):
        res = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="Is Konark crowded around noon?")
        ])
        assert res.status == AIStatus.SUCCESS
        assert len(res.evidence_items) > 0
        c_ev = next(e for e in res.evidence_items if e.title == "Expected crowd")
        assert c_ev.claim_type == ClaimType.ESTIMATED
        assert "O-TRAVELZ crowd heuristic" in c_ev.source

    def test_20_transit_evidence_claim_type_scheduled(self, test_orchestrator):
        res = test_orchestrator.converse([
            ChatMessage(role=ChatRole.USER, content="How to go from Puri to Konark by bus?")
        ])
        assert res.status == AIStatus.SUCCESS
        assert len(res.evidence_items) > 0
        t_ev = next(e for e in res.evidence_items if "departure" in e.title.lower() or "transit" in e.title.lower())
        assert t_ev.claim_type in (ClaimType.SCHEDULED, ClaimType.UNKNOWN)
