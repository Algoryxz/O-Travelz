"""
Unit test suite for Phase 6C Research Input Queue.

Tests:
- Deterministic extraction from Phase 6B priority queue.
- Filtering of already-verified and ambiguous stops.
- Rich route context (OD, neighbors, terminus, priority reasons).
- Configurable batch sizing.
"""

import pytest
from pathlib import Path
from scripts.build_phase_6c_research import build_phase_6c_queue

BASE_DIR = Path(__file__).resolve().parents[2]


def test_phase_6c_queue_generation_and_size():
    """Verify that the queue generates the requested batch size deterministically."""
    queue_25 = build_phase_6c_queue(batch_size=25)
    assert len(queue_25) == 25

    queue_10 = build_phase_6c_queue(batch_size=10)
    assert len(queue_10) == 10
    # First 10 items must match identically
    for i in range(10):
        assert queue_25[i]["canonical_stop_name"] == queue_10[i]["canonical_stop_name"]


def test_phase_6c_queue_contains_rich_context():
    """Verify that every queued item contains rich operational transit context."""
    queue = build_phase_6c_queue(batch_size=15)

    for item in queue:
        assert "canonical_stop_name" in item
        assert "service_region" in item
        assert "route_ids" in item
        assert isinstance(item["route_ids"], list)
        assert item["route_count"] == len(item["route_ids"])
        assert "origin_destination_context" in item
        assert "neighboring_route_stops" in item
        assert "priority_score" in item
        assert item["priority_score"] > 0
        assert "reason_for_priority" in item


def test_phase_6c_queue_excludes_already_verified_stops():
    """Verify that stops already verified in Phase 6B are excluded from the research queue."""
    queue = build_phase_6c_queue(batch_size=50)
    queued_names = {item["canonical_stop_name"].upper().strip() for item in queue}

    # Major Phase 6B verified stops must NOT be re-queued
    forbidden_verified_hubs = {
        "BHUBANESWAR RAILWAY STATION",
        "BARAMUNDA ISBT",
        "BADAMBADI",
        "SCB MEDICAL",
        "AIIMS",
        "ROURKELA NEW BUS STAND",
        "BERHAMPUR RAILWAY STATION",
        "KHETRAJPUR RAILWAY STATION",
        "KEONJHAR BUS STAND",
    }

    for hub in forbidden_verified_hubs:
        assert hub not in queued_names, f"Already-verified hub {hub} was re-queued in Phase 6C"
