import pytest

from app.db.base import Base  # noqa: F401
from app.models.transport import DataTier
from app.transport.adapters.base import NormalizedRoute, NormalizedStop
from app.transport.adapters.mo_bus import MoBusAdapter
from app.transport.adapters.mo_e_ride import MoERideAdapter
from app.transport.adapters.walking import Coordinate


def test_mo_bus_adapter_preserves_identity_tier_and_unknown_fare():
    adapter = MoBusAdapter([NormalizedStop("s1", "Verified stop", 20.2, 85.8)], [NormalizedRoute("r1", "Route 1", ("s1",))])
    assert adapter.provider_name == "ama-bus"
    assert adapter.get_data_tier() is DataTier.SCHEDULED
    assert adapter.get_stops()[0].name == "Verified stop"
    assert adapter.estimate_fare("s1", "s1") is None


def test_e_ride_default_is_explicitly_empty_not_fabricated():
    adapter = MoERideAdapter()
    assert adapter.get_stops() == []
    assert adapter.get_routes() == []
    assert adapter.get_data_tier() is DataTier.SCHEDULED
    assert adapter.transport_mode == "e-rickshaw"


def test_coordinate_rejects_invalid_geometry_instead_of_routing_it():
    with pytest.raises(ValueError, match="latitude"):
        Coordinate(91, 85)
