"""Unit test suite for Phase 12 Step 10: Provider Circuit Breaker & Latency Budgets.

Tests circuit state transitions (CLOSED -> OPEN -> HALF_OPEN -> CLOSED), failover without latency spikes, and recovery probing.
"""
import time
import pytest

from app.ai.circuit_breaker import CircuitState, ProviderCircuitBreaker


class TestProviderCircuitBreaker:
    def test_initial_state_is_closed_and_allowed(self):
        cb = ProviderCircuitBreaker(failure_threshold=3, cooldown_seconds=5.0)
        assert cb.get_state("azure_openai") == CircuitState.CLOSED
        assert cb.is_allowed("azure_openai") is True

    def test_failures_below_threshold_remain_closed(self):
        cb = ProviderCircuitBreaker(failure_threshold=3, cooldown_seconds=5.0)
        cb.record_failure("azure_openai")
        cb.record_failure("azure_openai")
        assert cb.get_state("azure_openai") == CircuitState.CLOSED
        assert cb.is_allowed("azure_openai") is True

    def test_reaching_threshold_opens_circuit_and_blocks_requests(self):
        cb = ProviderCircuitBreaker(failure_threshold=3, cooldown_seconds=5.0)
        cb.record_failure("azure_openai")
        cb.record_failure("azure_openai")
        cb.record_failure("azure_openai")

        assert cb.get_state("azure_openai") == CircuitState.OPEN
        assert cb.is_allowed("azure_openai") is False

    def test_cooldown_transitions_open_to_half_open(self):
        cb = ProviderCircuitBreaker(failure_threshold=2, cooldown_seconds=0.1)
        cb.record_failure("gemini")
        cb.record_failure("gemini")
        assert cb.get_state("gemini") == CircuitState.OPEN

        time.sleep(0.15)
        # After cooldown, transitions to HALF_OPEN to probe
        assert cb.get_state("gemini") == CircuitState.HALF_OPEN
        assert cb.is_allowed("gemini") is True

    def test_probe_success_resets_circuit_to_closed(self):
        cb = ProviderCircuitBreaker(failure_threshold=2, cooldown_seconds=0.1)
        cb.record_failure("nvidia")
        cb.record_failure("nvidia")
        time.sleep(0.15)
        assert cb.get_state("nvidia") == CircuitState.HALF_OPEN

        # Probe succeeds
        cb.record_success("nvidia")
        assert cb.get_state("nvidia") == CircuitState.CLOSED
        assert cb.is_allowed("nvidia") is True

    def test_half_open_prevents_probe_storm(self):
        cb = ProviderCircuitBreaker(failure_threshold=2, cooldown_seconds=0.1)
        cb.record_failure("provider_x")
        cb.record_failure("provider_x")
        time.sleep(0.15)
        assert cb.get_state("provider_x") == CircuitState.HALF_OPEN

        # First request gets the probe permit
        assert cb.is_allowed("provider_x") is True

        # Simultaneous second request is blocked from probing to prevent a storm
        assert cb.is_allowed("provider_x") is False

        # Once probe fails, circuit opens again
        cb.record_failure("provider_x")
        assert cb.get_state("provider_x") == CircuitState.OPEN


class TestDynamicLatencyBudget:
    def test_fallback_adapter_exhausted_budget_falls_back_instantly(self):
        from app.ai.adapter import GenericHTTPProviderAdapter, MultiProviderFallbackAdapter, RuleBasedProviderAdapter
        from app.ai.contracts import ChatMessage, ChatRole

        primary = GenericHTTPProviderAdapter(
            api_base_url="https://slow.api.com",
            api_key="key",
            provider_identifier="slow_primary",
        )
        fallback = RuleBasedProviderAdapter()

        multi = MultiProviderFallbackAdapter(
            providers=[primary],
            fallback_adapter=fallback,
            allow_external_provider=True,
        )

        # Budget of 0 ms must skip external provider immediately
        messages = [ChatMessage(role=ChatRole.USER, content="Plan 1 day in Puri")]
        res = multi.generate(messages, latency_budget_ms=0)

        assert res.metadata.get("active_provider") == "rule_based_fallback"
        assert res.metadata.get("fallback_used") is True
        assert "all_providers:budget_exhausted" in res.metadata.get("fallback_errors", [])

