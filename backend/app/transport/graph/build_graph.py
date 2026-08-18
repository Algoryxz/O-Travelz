"""Build a small, evidence-only transport graph."""
from dataclasses import dataclass, field

from app.db.base import Base as _ModelBase  # noqa: F401
from app.models.transport import DataTier
from app.transport.adapters.base import NormalizedRoute, NormalizedStop, TransportAdapter
from app.transport.adapters.walking import Coordinate, walking_distance_meters, walking_minutes


@dataclass(frozen=True)
class GraphNode:
    id: str
    coordinate: Coordinate


@dataclass(frozen=True)
class GraphEdge:
    source: str
    target: str
    mode: str
    detail: str
    data_tier: DataTier
    provider: str | None = None
    route: str | None = None
    estimated_minutes: int | None = None


@dataclass
class TransportGraph:
    nodes: dict[str, GraphNode] = field(default_factory=dict)
    edges: list[GraphEdge] = field(default_factory=list)

    def add_node(self, node: GraphNode) -> None:
        self.nodes[node.id] = node

    def add_edge(self, edge: GraphEdge) -> None:
        if edge.source in self.nodes and edge.target in self.nodes:
            self.edges.append(edge)

    def outgoing(self, node_id: str) -> list[GraphEdge]:
        return sorted((edge for edge in self.edges if edge.source == node_id), key=lambda edge: (edge.target, edge.mode, edge.provider or "", edge.route or ""))


def add_walking_edge(graph: TransportGraph, source: str, target: str) -> None:
    """Add a directed straight-line walking edge when both verified coordinates exist."""
    start, end = graph.nodes.get(source), graph.nodes.get(target)
    if not start or not end:
        return
    distance = walking_distance_meters(start.coordinate, end.coordinate)
    graph.add_edge(GraphEdge(source, target, "walk", f"Walk approximately {distance} m (straight-line distance)", DataTier.STATIC, estimated_minutes=walking_minutes(distance)))


def add_adapter_data(graph: TransportGraph, adapter: TransportAdapter) -> None:
    """Add only coordinate-bearing stops and explicitly ordered adjacent route links."""
    stops = {stop.id: stop for stop in adapter.get_stops()}
    for stop in sorted(stops.values(), key=lambda item: item.id):
        if stop.latitude is not None and stop.longitude is not None:
            graph.add_node(GraphNode(f"stop:{adapter.provider_name}:{stop.id}", Coordinate(stop.latitude, stop.longitude)))
    tier = adapter.get_data_tier()
    for route in sorted(adapter.get_routes(), key=lambda item: item.id):
        for first, second in zip(route.stop_ids, route.stop_ids[1:]):
            source = f"stop:{adapter.provider_name}:{first}"
            target = f"stop:{adapter.provider_name}:{second}"
            if source not in graph.nodes or target not in graph.nodes:
                continue
            graph.add_edge(GraphEdge(source, target, adapter.transport_mode, f"Take {route.name}", tier, adapter.provider_name, route.name, route.estimated_minutes_per_segment))


def build_graph(origin: GraphNode, destination: GraphNode, adapters: list[TransportAdapter]) -> TransportGraph:
    graph = TransportGraph()
    graph.add_node(origin)
    graph.add_node(destination)
    for adapter in adapters:
        try:
            add_adapter_data(graph, adapter)
        except Exception:
            # Failure isolation occurs again in the service to retain a useful reason.
            continue
    add_walking_edge(graph, origin.id, destination.id)
    for node_id in sorted(graph.nodes):
        if node_id.startswith("stop:"):
            add_walking_edge(graph, origin.id, node_id)
            add_walking_edge(graph, node_id, destination.id)
    return graph
