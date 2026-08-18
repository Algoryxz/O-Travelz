from app.db.base import Base  # noqa: F401
from app.models.transport import DataTier
from app.transport.adapters.base import NormalizedRoute, NormalizedStop
from app.transport.adapters.mo_bus import MoBusAdapter
from app.transport.adapters.mo_e_ride import MoERideAdapter
from app.transport.adapters.walking import Coordinate
from app.transport.graph import GraphEdge, GraphNode, TransportGraph, build_graph, find_path


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


def test_known_walking_duration_beats_unknown_provider_duration():
    graph = TransportGraph()
    graph.add_node(GraphNode("origin", Coordinate(20.0, 85.0)))
    graph.add_node(GraphNode("transfer", Coordinate(20.0, 85.001)))
    graph.add_node(GraphNode("destination", Coordinate(20.0, 85.002)))
    graph.add_edge(
        GraphEdge(
            "origin",
            "destination",
            "walk",
            "Known walking fallback",
            DataTier.STATIC,
            estimated_minutes=20,
        )
    )
    graph.add_edge(
        GraphEdge(
            "origin",
            "transfer",
            "bus",
            "Unknown-duration provider leg",
            DataTier.SCHEDULED,
            provider="ama-bus",
            route="R-unknown",
            estimated_minutes=None,
        )
    )
    graph.add_edge(
        GraphEdge(
            "transfer",
            "destination",
            "walk",
            "Known walking transfer",
            DataTier.STATIC,
            estimated_minutes=1,
        )
    )

    path = find_path(graph, "origin", "destination")

    assert path is not None
    assert [edge.mode for edge in path.edges] == ["walk"]
    assert path.edges[0].estimated_minutes == 20


def test_unknown_duration_remains_unknown_and_path_selection_is_deterministic():
    graph = TransportGraph()
    graph.add_node(GraphNode("origin", Coordinate(20.0, 85.0)))
    graph.add_node(GraphNode("destination", Coordinate(20.0, 85.001)))
    graph.add_edge(
        GraphEdge(
            "origin",
            "destination",
            "bus",
            "Unknown-duration provider leg",
            DataTier.SCHEDULED,
            provider="ama-bus",
            route="R-unknown",
            estimated_minutes=None,
        )
    )

    first = find_path(graph, "origin", "destination")
    second = find_path(graph, "origin", "destination")

    assert first == second
    assert first is not None
    assert first.edges[0].estimated_minutes is None
    assert first.edges[0].provider == "ama-bus"
    assert first.edges[0].data_tier is DataTier.SCHEDULED


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
