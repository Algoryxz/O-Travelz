"""Concurrency test suite for Phase 12 Step 11: Sliding Window Rate Limiter.

Tests multi-threaded simultaneous requests, lock safety, and exact limit boundaries.
"""
import concurrent.futures
import threading
import pytest

from app.ai.rate_limit import SlidingWindowRateLimiter
from app.core.config import Settings


class TestRateLimiterConcurrency:
    def test_concurrent_requests_strictly_bounded_by_limit(self):
        limiter = SlidingWindowRateLimiter()
        limit = 10
        settings = Settings(ai_rate_limit_requests=limit, ai_rate_limit_window_seconds=60)

        num_threads = 30
        results = []

        def worker():
            allowed, _ = limiter.check_and_record("concurrent-client", is_external_request=False, settings=settings)
            return allowed

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(worker) for _ in range(num_threads)]
            for f in concurrent.futures.as_completed(futures):
                results.append(f.result())

        # Exactly `limit` requests must succeed, the rest must fail
        allowed_count = sum(1 for r in results if r is True)
        rejected_count = sum(1 for r in results if r is False)

        assert allowed_count == limit
        assert rejected_count == num_threads - limit

    def test_concurrent_separate_clients_have_isolated_counters(self):
        limiter = SlidingWindowRateLimiter()
        limit = 5
        settings = Settings(ai_rate_limit_requests=limit, ai_rate_limit_window_seconds=60)

        clients = [f"client-{i}" for i in range(5)]
        results_per_client = {c: [] for c in clients}

        def worker(client_id):
            allowed, _ = limiter.check_and_record(client_id, is_external_request=False, settings=settings)
            return client_id, allowed

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(worker, c) for c in clients for _ in range(5)]
            for f in concurrent.futures.as_completed(futures):
                cid, allowed = f.result()
                results_per_client[cid].append(allowed)

        # Each client must have exactly 5 allowed requests
        for cid, res_list in results_per_client.items():
            assert sum(1 for r in res_list if r is True) == limit
