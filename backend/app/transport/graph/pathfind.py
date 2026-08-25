"""Deterministic shortest-path search for the bounded transport graph."""
import heapq
from dataclasses import dataclass

from app.transport.graph.build_graph import GraphEdge, TransportGraph


@dataclass(frozen=True)
class PathResult:
    edges: tuple[GraphEdge, ...]


def _edge_score(edge: GraphEdge) -> tuple[int, int]:
    """Return ``(unknown_duration_edges, known_minutes)`` for one edge.

    An unknown duration contributes only to the explicit unknown-count dimension. It
    must never be treated as zero minutes. Known-duration paths are preferred over
    paths containing unknown durations; among paths with the same unknown status,
    known minutes and hop count remain deterministic tie-breakers.
    """
    if edge.estimated_minutes is None:
        return (1, 0)
    return (0, edge.estimated_minutes)


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
            unknown_edges, known_minutes = _edge_score(edge)
            next_score = (
                score[0] + unknown_edges,
                score[1] + known_minutes,
                score[2] + 1,
            )
            edge_signature = f"{edge.source}>{edge.target}:{edge.mode}:{edge.provider or ''}:{edge.route or ''}"
            heapq.heappush(queue, (next_score, signature + (edge_signature,), edge.target, edges + (edge,)))
    return None
