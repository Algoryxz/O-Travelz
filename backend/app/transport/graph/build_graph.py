"""Build a small, evidence-only transport graph."""
from dataclasses import dataclass, field

from app.db.base import Base as _ModelBase  # noqa: F401
from app.models.transport import DataTier
from app.transport.adapters.base import NormalizedRoute, NormalizedStop, TransportAdapter
from app.transport.adapters.walking import (
    Coordinate,
    MAX_TRANSIT_TRANSFER_WALK_METERS,
    MAX_WALKING_DISTANCE_METERS,
    road_distance_meters,
    road_minutes,
    walking_distance_meters,
    walking_minutes,
)


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


def add_walking_edge(
    graph: TransportGraph,
    source: str,
    target: str,
    max_meters: int | None = MAX_WALKING_DISTANCE_METERS,
) -> bool:
    """Add a directed straight-line walking edge when both verified coordinates exist and distance <= max_meters."""
    start, end = graph.nodes.get(source), graph.nodes.get(target)
    if not start or not end:
        return False
    distance = walking_distance_meters(start.coordinate, end.coordinate)
    if max_meters is not None and distance > max_meters:
        return False
    mins = walking_minutes(distance)
    dist_str = f"{distance} m" if distance < 1000 else f"{round(distance / 1000, 1)} km"
    graph.add_edge(
        GraphEdge(
            source,
            target,
            "walk",
            f"Walk ~{dist_str} ({mins} min)",
            DataTier.STATIC,
            estimated_minutes=mins,
        )
    )
    return True


def add_road_edge(graph: TransportGraph, source: str, target: str) -> None:
    """Add a directed road/car travel edge for journeys between verified coordinates."""
    start, end = graph.nodes.get(source), graph.nodes.get(target)
    if not start or not end:
        return
    road_meters = road_distance_meters(start.coordinate, end.coordinate)
    mins = road_minutes(road_meters)
    road_km = round(road_meters / 1000, 1)
    if mins >= 60:
        hours = mins // 60
        remaining_mins = mins % 60
        duration_str = f"{hours}h {remaining_mins:02d}m" if remaining_mins > 0 else f"{hours}h"
    else:
        duration_str = f"{mins} min"
    graph.add_edge(
        GraphEdge(
            source,
            target,
            "road",
            f"Road ~{road_km} km ({duration_str})",
            DataTier.STATIC,
            estimated_minutes=mins,
        )
    )


def add_adapter_data(graph: TransportGraph, adapter: TransportAdapter) -> None:
    """Add only coordinate-bearing stops and logical sequence edges between verified stops."""
    stops = {stop.id: stop for stop in adapter.get_stops()}
    for stop in sorted(stops.values(), key=lambda item: item.id):
        if stop.latitude is not None and stop.longitude is not None:
            graph.add_node(GraphNode(f"stop:{adapter.provider_name}:{stop.id}", Coordinate(stop.latitude, stop.longitude)))
    tier = adapter.get_data_tier()

    for route in sorted(adapter.get_routes(), key=lambda item: item.id):
        # Find all stops in route that have coordinates
        routable_indices = [
            (idx, sid) for idx, sid in enumerate(route.stop_ids)
            if f"stop:{adapter.provider_name}:{sid}" in graph.nodes
        ]
        # Connect forward pairs of verified stops along the route sequence
        for a in range(len(routable_indices)):
            idx_a, sid_a = routable_indices[a]
            source = f"stop:{adapter.provider_name}:{sid_a}"
            for b in range(a + 1, len(routable_indices)):
                idx_b, sid_b = routable_indices[b]
                target = f"stop:{adapter.provider_name}:{sid_b}"
                stop_count = idx_b - idx_a
                est_mins = max(stop_count * (route.estimated_minutes_per_segment or 3), 3)
                stop_str = f" ({stop_count} stops)" if stop_count > 1 else ""
                graph.add_edge(
                    GraphEdge(
                        source=source,
                        target=target,
                        mode=adapter.transport_mode,
                        detail=f"Take {route.name}{stop_str}",
                        data_tier=tier,
                        provider=adapter.provider_name,
                        route=route.name,
                        estimated_minutes=est_mins,
                    )
                )


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

    # 1. Direct walk if walkable (<= 2000m)
    walked = add_walking_edge(graph, origin.id, destination.id, max_meters=MAX_WALKING_DISTANCE_METERS)

    # 2. Road travel for journeys between places beyond walking distance
    if not walked:
        add_road_edge(graph, origin.id, destination.id)

    # 3. Transit transfer connections (<= 1500m to transit stops)
    for node_id in sorted(graph.nodes):
        if node_id.startswith("stop:"):
            add_walking_edge(graph, origin.id, node_id, max_meters=MAX_TRANSIT_TRANSFER_WALK_METERS)
            add_walking_edge(graph, node_id, destination.id, max_meters=MAX_TRANSIT_TRANSFER_WALK_METERS)
    return graph
