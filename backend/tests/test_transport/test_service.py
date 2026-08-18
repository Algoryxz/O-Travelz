import pytest

from app.ai.schemas import GetProviderStatusArgs, PlanTransportHopArgs
from app.transport.adapters.base import NormalizedRoute, NormalizedStop, TransportAdapter
from app.transport.adapters.mo_bus import MoBusAdapter
from app.transport.adapters.walking import Coordinate, walking_distance_meters
from app.transport.service import MappingPlaceResolver, ProviderNotAvailableError, TransportService


def _args(start="from", end="to"):
    return PlanTransportHopArgs(from_place={"id": start, "name": start, "category": "test"}, to_place={"id": end, "name": end, "category": "test"}, constraints={"days": 1})


def test_walking_is_deterministic_and_uses_no_fare():
    service = TransportService(MappingPlaceResolver({"from": Coordinate(20.0, 85.0), "to": Coordinate(20.0, 85.001)}), [])
    first, second = service.plan_transport_hop(_args()), service.plan_transport_hop(_args())
    assert first == second
    assert first.mode == "walk"
    assert first.estimated_cost is None
    assert walking_distance_meters(Coordinate(20, 85), Coordinate(20, 85.001)) > 0


def test_missing_coordinates_and_missing_place_are_unavailable_with_reasons():
    service = TransportService(MappingPlaceResolver({"from": None, "to": Coordinate(20, 85)}), [])
    assert "no verified coordinates" in service.plan_transport_hop(_args()).reason
    assert "could not be resolved" in service.plan_transport_hop(_args("missing", "to")).reason


def test_verified_fixture_produces_ordered_multimodal_hop_and_conservative_tier():
    adapter = MoBusAdapter(
        [NormalizedStop("a", "A", 20, 85), NormalizedStop("b", "B", 20, 85.009)],
        [NormalizedRoute("route", "Verified Route", ("a", "b"), 1)],
    )
    service = TransportService(MappingPlaceResolver({"from": Coordinate(20, 84.999), "to": Coordinate(20, 85.010)}), [adapter])
    hop = service.plan_transport_hop(_args())
    assert [leg.mode for leg in hop.legs] == ["walk", "bus", "walk"]
    assert hop.estimated_cost is None
    assert hop.data_tier.value == "static"


class BrokenAdapter(TransportAdapter):
    provider_name = "broken"
    def get_stops(self): raise RuntimeError("provider unavailable")
    def get_routes(self): raise RuntimeError("provider unavailable")
    def get_data_tier(self): raise RuntimeError("provider unavailable")
    def estimate_fare(self, from_stop, to_stop): return None


def test_provider_failure_isolated_and_walking_remains_available():
    service = TransportService(MappingPlaceResolver({"from": Coordinate(20, 85), "to": Coordinate(20, 85.001)}), [BrokenAdapter()])
    assert service.plan_transport_hop(_args()).mode == "walk"


def test_provider_status_is_honest_and_unknown_capability_is_not_mapped_to_a_tier():
    service = TransportService(MappingPlaceResolver({}), [MoBusAdapter()])
    status = service.get_provider_status(GetProviderStatusArgs(provider_id="ama-bus"))
    assert status.data_tier.value == "scheduled"
    assert "no verified live source" not in status.notes.lower()
    with pytest.raises(ProviderNotAvailableError):
        service.get_provider_status(GetProviderStatusArgs(provider_id="odisha-yatri"))
