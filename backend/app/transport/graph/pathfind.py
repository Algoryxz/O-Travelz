"""Deterministic shortest-path search for the bounded transport graph."""
import heapq
from dataclasses import dataclass

from app.transport.graph.build_graph import GraphEdge, TransportGraph


@dataclass(frozen=True)
class PathResult:
    edges: tuple[GraphEdge, ...]


def _edge_score(edge: GraphEdge) -> tuple[int, int]:
    # Missing provider duration is not guessed. It has a deterministic but less
    # preferred routing score; output duration remains unknown.
    return (edge.estimated_minutes if edge.estimated_minutes is not None else 0, int(edge.estimated_minutes is None))


def find_path(graph: TransportGraph, origin_id: str, destination_id: str) -> PathResult | None:
    if origin_id not in graph.nodes or destination_id not in graph.nodes:
        return None
    queue: list[tuple[tuple[int, int, int], tuple[str, ...], str, tuple[GraphEdge, ...]]] = [((0, 0, 0), (), origin_id, ())]
    best: dict[str, tuple[tuple[int, int, int], tuple[str, ...]]] = {}
    while queue:
        score, signature, node, edges = heapq.heappop(queue)
        if node in best and best[node] <= (score, signature):
            continue
        best[node] = (score, signature)
        if node == destination_id:
            return PathResult(edges)
        for edge in graph.outgoing(node):
            minutes, unknown = _edge_score(edge)
            next_score = (score[0] + minutes, score[1] + unknown, score[2] + 1)
            edge_signature = f"{edge.source}>{edge.target}:{edge.mode}:{edge.provider or ''}:{edge.route or ''}"
            heapq.heappush(queue, (next_score, signature + (edge_signature,), edge.target, edges + (edge,)))
    return None
