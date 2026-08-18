from app.db.base import Base  # noqa: F401
from app.models.transport import DataTier
from app.transport.adapters.base import NormalizedRoute, NormalizedStop
from app.transport.adapters.mo_bus import MoBusAdapter
from app.transport.adapters.mo_e_ride import MoERideAdapter
from app.transport.adapters.walking import Coordinate
from app.transport.graph import GraphNode, build_graph, find_path


def _graph():
    adapter = MoBusAdapter(
        [NormalizedStop("a", "A", 20.000, 85.000), NormalizedStop("b", "B", 20.000, 85.009)],
        [NormalizedRoute("r1", "Verified Route", ("a", "b"), estimated_minutes_per_segment=1)],
    )
    return build_graph(GraphNode("place:from", Coordinate(20.000, 84.999)), GraphNode("place:to", Coordinate(20.000, 85.010)), [adapter])


def test_graph_creates_verified_nodes_provider_edges_and_walking_edges():
    graph = _graph()
    assert "stop:ama-bus:a" in graph.nodes
    assert any(edge.mode == "walk" for edge in graph.edges)
    provider_edge = next(edge for edge in graph.edges if edge.provider == "ama-bus")
    assert provider_edge.data_tier is DataTier.SCHEDULED
    assert provider_edge.route == "Verified Route"


def test_pathfinding_is_deterministic_and_multimodal():
    graph = _graph()
    first = find_path(graph, "place:from", "place:to")
    second = find_path(graph, "place:from", "place:to")
    assert first == second
    assert [edge.mode for edge in first.edges] == ["walk", "bus", "walk"]


def test_unreachable_graph_returns_none():
    graph = _graph()
    assert find_path(graph, "place:to", "place:from") is None


def test_e_ride_edge_preserves_its_provider_mode():
    adapter = MoERideAdapter(
        [NormalizedStop("a", "A", 20, 85), NormalizedStop("b", "B", 20, 85.001)],
        [NormalizedRoute("r1", "Verified fixture route", ("a", "b"))],
    )
    graph = build_graph(GraphNode("place:from", Coordinate(20, 85)), GraphNode("place:to", Coordinate(20, 85.002)), [adapter])
    assert next(edge for edge in graph.edges if edge.provider == "mo-e-ride").mode == "e-rickshaw"
