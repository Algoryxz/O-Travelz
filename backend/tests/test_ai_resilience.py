"""Test suite for Phase 12 Step 11: Production AI Resilience & Provider Output Safety.

Tests malformed payload rejection, oversized response safety, non-retryable auth errors,
transient error recovery, and non-blocking degradation.
"""
from __future__ import annotations

import json
import pytest

from app.ai.adapter import (
    GenericHTTPProviderAdapter,
    MultiProviderFallbackAdapter,
    RuleBasedProviderAdapter,
)
from app.ai.contracts import (
    AuthenticationError,
    ChatMessage,
    ChatRole,
    MalformedProviderResponseError,
    ProviderUnavailableError,
)


class TestAIResilience:
    def test_oversized_response_payload_rejected(self, monkeypatch):
        adapter = GenericHTTPProviderAdapter(
            api_base_url="https://api.fake.com",
            api_key="test-key",
            model_name="test-model",
            provider_identifier="generic_test",
        )

        oversized_data = ("x" * 600_000).encode("utf-8")

        class MockResponse:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                pass

            def read(self):
                return oversized_data

        monkeypatch.setattr("urllib.request.urlopen", lambda req, timeout=None: MockResponse())

        messages = [ChatMessage(role=ChatRole.USER, content="Hello")]
        with pytest.raises(MalformedProviderResponseError) as exc_info:
            adapter.generate(messages)
        assert "exceeds maximum safe size" in str(exc_info.value)

    def test_malformed_json_response_raises_canonical_error(self, monkeypatch):
        adapter = GenericHTTPProviderAdapter(
            api_base_url="https://api.fake.com",
            api_key="test-key",
            model_name="test-model",
            provider_identifier="generic_test",
        )

        class MockResponse:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                pass

            def read(self):
                return b"<html>502 Bad Gateway</html>"

        monkeypatch.setattr("urllib.request.urlopen", lambda req, timeout=None: MockResponse())

        messages = [ChatMessage(role=ChatRole.USER, content="Hello")]
        with pytest.raises(MalformedProviderResponseError) as exc_info:
            adapter.generate(messages)
        assert "non-JSON" in str(exc_info.value)

    def test_auth_error_fails_immediately_without_retry(self, monkeypatch):
        adapter = GenericHTTPProviderAdapter(
            api_base_url="https://api.fake.com",
            api_key="invalid-key",
            model_name="test-model",
            max_retries=3,
        )

        call_count = 0

        import urllib.error

        def mock_urlopen(req, timeout=None):
            nonlocal call_count
            call_count += 1
            raise urllib.error.HTTPError(
                url="https://api.fake.com",
                code=401,
                msg="Unauthorized",
                hdrs={},
                fp=None,
            )

        monkeypatch.setattr("urllib.request.urlopen", mock_urlopen)

        messages = [ChatMessage(role=ChatRole.USER, content="Hello")]
        with pytest.raises(AuthenticationError):
            adapter.generate(messages)

        # 401 must not be retried: call count must be exactly 1
        assert call_count == 1

    def test_fallback_recovers_when_primary_provider_fails(self, monkeypatch):
        primary = GenericHTTPProviderAdapter(
            api_base_url="https://primary.api.com",
            api_key="key",
            provider_identifier="primary",
        )
        fallback = RuleBasedProviderAdapter()

        import urllib.error

        def mock_urlopen(req, timeout=None):
            raise urllib.error.HTTPError(
                url="https://primary.api.com",
                code=503,
                msg="Service Unavailable",
                hdrs={},
                fp=None,
            )

        monkeypatch.setattr("urllib.request.urlopen", mock_urlopen)

        multi = MultiProviderFallbackAdapter(
            providers=[primary],
            fallback_adapter=fallback,
            allow_external_provider=True,
        )

        messages = [ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")]
        res = multi.generate(messages)

        assert res.metadata.get("active_provider") == "rule_based_fallback"
        assert res.metadata.get("fallback_used") is True
        assert len(res.metadata.get("fallback_errors", [])) > 0
