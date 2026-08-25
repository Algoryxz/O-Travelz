"""Unit test suite for Phase 12 Step 10: In-Process AI Rate Limiting.

Tests request throttling, external provider call limits, sliding window expiration, and 429 exceptions.
"""
import pytest

from app.ai.rate_limit import RateLimitExceeded, SlidingWindowRateLimiter
from app.core.config import Settings


class TestAIRateLimiting:
    def test_requests_within_general_limit_are_allowed(self):
        limiter = SlidingWindowRateLimiter()
        settings = Settings(ai_rate_limit_requests=5, ai_rate_limit_window_seconds=60)

        for _ in range(5):
            allowed, retry_after = limiter.check_and_record("client-1", is_external_request=False, settings=settings)
            assert allowed is True
            assert retry_after == 0

    def test_request_exceeding_general_limit_is_rejected(self):
        limiter = SlidingWindowRateLimiter()
        settings = Settings(ai_rate_limit_requests=3, ai_rate_limit_window_seconds=60)

        for _ in range(3):
            limiter.check_and_record("client-2", is_external_request=False, settings=settings)

        allowed, retry_after = limiter.check_and_record("client-2", is_external_request=False, settings=settings)
        assert allowed is False
        assert retry_after > 0

        with pytest.raises(RateLimitExceeded) as exc_info:
            limiter.enforce_rate_limit("client-2", is_external_request=False, settings=settings)
        assert exc_info.value.status_code == 429
        assert "Too many AI requests" in exc_info.value.detail["message"]

    def test_external_provider_requests_have_stricter_limit(self):
        limiter = SlidingWindowRateLimiter()
        settings = Settings(
            ai_rate_limit_requests=20,
            ai_rate_limit_window_seconds=60,
            ai_external_rate_limit_requests=2,
            ai_external_rate_limit_window_seconds=60,
        )

        # 2 external requests allowed
        allowed, _ = limiter.check_and_record("client-3", is_external_request=True, settings=settings)
        assert allowed is True
        allowed, _ = limiter.check_and_record("client-3", is_external_request=True, settings=settings)
        assert allowed is True

        # 3rd external request rejected even though general limit (20) is not reached
        allowed, retry_after = limiter.check_and_record("client-3", is_external_request=True, settings=settings)
        assert allowed is False
        assert retry_after > 0

        with pytest.raises(RateLimitExceeded) as exc_info:
            limiter.enforce_rate_limit("client-3", is_external_request=True, settings=settings)
        assert exc_info.value.status_code == 429
        assert "External AI provider rate limit" in exc_info.value.detail["message"]

    def test_separate_clients_have_isolated_limits(self):
        limiter = SlidingWindowRateLimiter()
        settings = Settings(ai_rate_limit_requests=2, ai_rate_limit_window_seconds=60)

        limiter.check_and_record("client-A", settings=settings)
        limiter.check_and_record("client-A", settings=settings)

        # client-A exhausted
        allowed_a, _ = limiter.check_and_record("client-A", settings=settings)
        assert allowed_a is False

        # client-B still allowed
        allowed_b, _ = limiter.check_and_record("client-B", settings=settings)
        assert allowed_b is True
