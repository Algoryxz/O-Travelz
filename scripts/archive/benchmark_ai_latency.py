"""Latency benchmark for Phase 12 Step 12 Production Readiness.

Measures p50, p95, and p99 execution latencies over 200 iterations for:
1. RuleBasedProviderAdapter
2. GroundingVerifier
3. SearchCorrectionService
4. GroundedConversationOrchestrator (Offline deterministic conversational turn)
"""
import statistics
import time

from app.ai.adapter import RuleBasedProviderAdapter
from app.ai.contracts import ChatMessage, ChatRole
from app.ai.conversation import GroundedConversationOrchestrator
from app.ai.grounding_verifier import GroundingVerifier
from app.ai.model import RuleBasedModelAdapter
from app.ai.tools.adapters import create_default_tool_registry

from app.db.session import SessionLocal
from app.services.search.search_correction import SearchCorrectionService


def percentile(data, pct):
    data_sorted = sorted(data)
    idx = int(len(data_sorted) * (pct / 100.0))
    return data_sorted[min(idx, len(data_sorted) - 1)]


def benchmark_components():
    iterations = 200

    # 1. RuleBasedProviderAdapter
    adapter = RuleBasedProviderAdapter()
    messages = [ChatMessage(role=ChatRole.USER, content="Plan a 3-day heritage tour to Puri and Konark")]
    times_adapter = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        adapter.generate(messages)
        t1 = time.perf_counter()
        times_adapter.append((t1 - t0) * 1000.0)

    # 2. GroundingVerifier
    places = [
        {"id": "p1", "name": "Jagannath Temple", "district": "Puri", "lat": 19.8049, "lon": 85.8179},
        {"id": "p2", "name": "Konark Sun Temple", "district": "Puri", "lat": 19.8876, "lon": 86.0945},
    ]
    message = "Visit Jagannath Temple in Puri and then Konark Sun Temple."
    times_verifier = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        GroundingVerifier.verify_response(message=message, places=places)
        t1 = time.perf_counter()
        times_verifier.append((t1 - t0) * 1000.0)

    # 3. SearchCorrectionService
    db = SessionLocal()
    times_correction = []
    try:
        queries = ["poori", "bhuvneshwar", "konarkk", "chandipurr", "cuttackk"]
        for i in range(iterations):
            q = queries[i % len(queries)]
            t0 = time.perf_counter()
            SearchCorrectionService.generate_suggestions(q, db=db, limit=5)
            t1 = time.perf_counter()
            times_correction.append((t1 - t0) * 1000.0)
    finally:
        db.close()

    # 4. GroundedConversationOrchestrator full turn
    db_orch = SessionLocal()
    try:
        registry = create_default_tool_registry(db_orch)
        orchestrator = GroundedConversationOrchestrator(
            registry=registry,
            provider_adapter=adapter,
            model_adapter=RuleBasedModelAdapter(),
        )
        times_orchestrator = []
        for _ in range(iterations):
            t0 = time.perf_counter()
            orchestrator.converse(messages)
            t1 = time.perf_counter()
            times_orchestrator.append((t1 - t0) * 1000.0)
    finally:
        db_orch.close()


    print("=== LATENCY BENCHMARK RESULTS (200 iterations, ms) ===")
    print(f"1. RuleBasedProviderAdapter: p50={percentile(times_adapter, 50):.3f}ms, p95={percentile(times_adapter, 95):.3f}ms, p99={percentile(times_adapter, 99):.3f}ms")
    print(f"2. GroundingVerifier:        p50={percentile(times_verifier, 50):.3f}ms, p95={percentile(times_verifier, 95):.3f}ms, p99={percentile(times_verifier, 99):.3f}ms")
    print(f"3. SearchCorrectionService:  p50={percentile(times_correction, 50):.3f}ms, p95={percentile(times_correction, 95):.3f}ms, p99={percentile(times_correction, 99):.3f}ms")
    print(f"4. E2E Grounded Turn:        p50={percentile(times_orchestrator, 50):.3f}ms, p95={percentile(times_orchestrator, 95):.3f}ms, p99={percentile(times_orchestrator, 99):.3f}ms")


if __name__ == "__main__":
    benchmark_components()
