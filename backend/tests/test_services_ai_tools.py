"""Unit tests for AI tool execution boundary on services."""
from app.ai.contracts import ToolStatus
from app.ai.tools.get_nearby_services import GetNearbyServicesTool
from app.ai.tools.get_destination_safety import GetDestinationSafetyTool

def test_ai_tool_get_nearby_services():
    tool = GetNearbyServicesTool()
    result = tool.execute({
        "lat": 20.5056,
        "lon": 85.8267,
        "category": "healthcare",
        "radius_km": 10.0,
        "limit": 3
    })
    assert result.status == ToolStatus.OK
    assert "data" in result.data or "services" in result.data
    services = result.data.get("services", [])
    assert len(services) >= 1
    assert services[0]["category"] == "healthcare"

def test_ai_tool_get_destination_safety():
    tool = GetDestinationSafetyTool()
    result = tool.execute({
        "destination_id_or_name": "Gahirmatha Marine Sanctuary"
    })
    assert result.status == ToolStatus.OK
    assert result.data["found"] is True
    assert result.data["advisory"]["destination_id"] == "round2_east_001"
    assert len(result.data["advisory"]["emergency_contacts"]) >= 1

def test_ai_tool_get_destination_safety_unknown():
    tool = GetDestinationSafetyTool()
    result = tool.execute({
        "destination_id_or_name": "Unknown Nowhere Place"
    })
    assert result.status == ToolStatus.OK
    assert result.data["found"] is False
    assert "112" in result.data["message"]
