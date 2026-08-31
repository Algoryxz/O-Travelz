"""Tests for AI Checkpoint 5B: AI Quality Benchmarks, Task-Aware Routing, and Safe Telemetry."""
import os
import time
import pytest

from app.ai.adapter import (
    GenericHTTPProviderAdapter,
    MockProviderAdapter,
    MultiProviderFallbackAdapter,
    RuleBasedProviderAdapter,
)
from app.ai.benchmark_evaluator import AIBenchmarkEvaluator, BenchmarkCase
from app.ai.circuit_breaker import circuit_breaker
from app.ai.contracts import (
    AdapterResponse,
    ChatMessage,
    ChatRole,
    FinishReason,
    ProviderUnavailableError,
)
from app.ai.routing import ProviderCapabilities, TaskRouter, TaskType
from app.ai.telemetry import AITelemetryRecorder, ai_telemetry


class MockCustomCapabilityProvider(MockProviderAdapter):
    """Test mock provider with customizable capabilities and behavior."""

    def __init__(
        self,
        name: str = "mock_custom",
        capabilities: ProviderCapabilities | None = None,
        should_fail: bool = False,
        timeout_seconds: float = 30.0,
    ):
        super().__init__(default_response="Mock response from " + name)
        self.provider_identifier = name
        self.capabilities = capabilities or ProviderCapabilities()
        self.should_fail = should_fail
        self.timeout_seconds = timeout_seconds

    def get_status(self) -> dict:
        return {
            "provider": self.provider_identifier,
            "model": "mock-model",
            "configured": True,
            "available": True,
            "timeout_seconds": self.timeout_seconds,
            "is_offline": False,
        }

    def generate(self, messages, tools=None, **kwargs):
        if self.should_fail:
            raise ProviderUnavailableError("Provider endpoint down", provider=self.provider_identifier)
        return AdapterResponse(
            content=f"Response from {self.provider_identifier}",
            finish_reason=FinishReason.STOP,
            metadata={"provider": self.provider_identifier},
        )


# ==============================================================================
# 1. Task-Aware Provider Routing Tests (Tests 1 - 7)
# ==============================================================================

class TestTaskAwareProviderRouting:
    def test_1_deterministic_lookup_skips_external_provider(self):
        """Deterministic lookup skips external LLMs entirely."""
        vision_prov = MockCustomCapabilityProvider("vision_llm", capabilities=ProviderCapabilities(vision=True))
        router = MultiProviderFallbackAdapter(
            providers=[vision_prov],
            fallback_adapter=RuleBasedProviderAdapter(),
            allow_external_provider=True,
        )
        res = router.generate(
            [ChatMessage(role=ChatRole.USER, content="Show places in Puri")],
            task_type=TaskType.DETERMINISTIC_LOOKUP,
        )
        assert res.metadata["active_provider"] == "rule_based_fallback"
        assert res.metadata["fallback_used"] is True

    def test_2_vision_task_selects_vision_capable_provider(self):
        """Vision task selects provider declaring vision capability."""
        text_prov = MockCustomCapabilityProvider("text_only", capabilities=ProviderCapabilities(vision=False))
        vision_prov = MockCustomCapabilityProvider("vision_capable", capabilities=ProviderCapabilities(vision=True))

        router = MultiProviderFallbackAdapter(
            providers=[text_prov, vision_prov],
            fallback_adapter=RuleBasedProviderAdapter(),
            allow_external_provider=True,
        )
        res = router.generate(
            [ChatMessage(role=ChatRole.USER, content="Identify this image", image_urls=["data:image/jpeg;base64,1234"])],
            task_type=TaskType.VISION,
        )
        assert res.metadata["active_provider"] == "vision_capable"

    def test_3_non_vision_provider_excluded_for_vision_task(self):
        """Non-vision provider is excluded when task requires vision."""
        text_prov = MockCustomCapabilityProvider("text_only", capabilities=ProviderCapabilities(vision=False))
        candidates = TaskRouter.filter_and_prioritize([text_prov], task_type=TaskType.VISION)
        assert len(candidates) == 0

    def test_4_complex_planning_selects_reasoning_tier(self):
        """Complex planning prioritizes high-reasoning providers."""
        fast_prov = MockCustomCapabilityProvider(
            "fast_prov",
            capabilities=ProviderCapabilities(complex_reasoning=False, fast_inference=True),
        )
        reasoning_prov = MockCustomCapabilityProvider(
            "reasoning_prov",
            capabilities=ProviderCapabilities(complex_reasoning=True, fast_inference=True),
        )
        candidates = TaskRouter.filter_and_prioritize(
            [fast_prov, reasoning_prov],
            task_type=TaskType.COMPLEX_PLANNING,
        )
        assert len(candidates) == 1
        assert candidates[0].provider_identifier == "reasoning_prov"

    def test_5_provider_failure_falls_back_to_next(self):
        """When primary provider fails, router fails over to next candidate."""
        circuit_breaker.reset()
        failing_prov = MockCustomCapabilityProvider("primary_fail", should_fail=True)
        backup_prov = MockCustomCapabilityProvider("backup_success")

        router = MultiProviderFallbackAdapter(
            providers=[failing_prov, backup_prov],
            fallback_adapter=RuleBasedProviderAdapter(),
            allow_external_provider=True,
        )
        res = router.generate([ChatMessage(role=ChatRole.USER, content="Hello")])
        assert res.metadata["active_provider"] == "backup_success"
        assert res.metadata["fallback_used"] is False

    def test_6_latency_budget_skips_unhealthy_or_slow_providers(self):
        """Latency budget exhaustion fast-fails to deterministic fallback."""
        slow_prov = MockCustomCapabilityProvider("slow_prov", timeout_seconds=10.0)
        candidates = TaskRouter.filter_and_prioritize(
            [slow_prov],
            task_type=TaskType.GENERAL_CONVERSATION,
            remaining_budget_ms=200.0,
        )
        assert len(candidates) == 0

    def test_7_no_compatible_provider_returns_deterministic_fallback(self):
        """When no provider matches required capabilities, deterministic fallback is returned."""
        text_only = MockCustomCapabilityProvider("text_only", capabilities=ProviderCapabilities(vision=False))
        router = MultiProviderFallbackAdapter(
            providers=[text_only],
            fallback_adapter=RuleBasedProviderAdapter(),
            allow_external_provider=True,
        )
        res = router.generate(
            [ChatMessage(role=ChatRole.USER, content="Scan landmark", image_urls=["data:image/png;base64,abc"])],
            task_type=TaskType.VISION,
        )
        assert res.metadata["active_provider"] == "rule_based_fallback"
        assert res.metadata["fallback_used"] is True


# ==============================================================================
# 2. Privacy-Safe Telemetry Tests (Tests 8 - 10)
# ==============================================================================

class TestSafeTelemetry:
    def test_8_telemetry_strictly_excludes_secrets_and_credentials(self):
        """Telemetry scrubber strips API keys, bearer tokens, passwords, and raw base64 data."""
        recorder = AITelemetryRecorder(max_capacity=50)
        raw_secret_error = "Failed with api_key=sk-proj-secret123456789 and Bearer eyJhbGciOiJIUzI1NiJ9.test.sig"
        event = recorder.record_event(
            task_type="complex_planning",
            provider="azure_openai",
            model_identifier="gpt-4o",
            latency_ms=120.5,
            error_category=raw_secret_error,
        )
        assert "sk-proj-secret123456789" not in event.error_category
        assert "eyJhbGciOiJIUzI1NiJ9" not in event.error_category
        assert "[REDACTED]" in event.error_category

    def test_9_telemetry_records_fallback_activation(self):
        """Telemetry properly flags fallback status and error tracking."""
        recorder = AITelemetryRecorder(max_capacity=50)
        event = recorder.record_event(
            task_type="vision",
            provider="rule_based_fallback",
            model_identifier="rule_based",
            latency_ms=25.0,
            success=True,
            fallback_triggered=True,
        )
        assert event.fallback_triggered is True
        assert event.provider == "rule_based_fallback"

    def test_10_telemetry_records_latency_and_summary_statistics(self):
        """Telemetry computes accurate average latency and success rates."""
        recorder = AITelemetryRecorder(max_capacity=50)
        recorder.record_event("plan", "prov1", "m1", latency_ms=100.0, success=True)
        recorder.record_event("plan", "prov1", "m1", latency_ms=200.0, success=True)
        stats = recorder.get_summary_statistics()
        assert stats["total_events"] == 2
        assert stats["average_latency_ms"] == 150.0
        assert stats["success_rate"] == 1.0


# ==============================================================================
# 3. AI Quality Benchmark Suite Tests (Tests 11 - 17)
# ==============================================================================

class TestAIBenchmarks:
    def test_11_benchmark_evaluator_scores_expected_intent_correctly(self):
        """Benchmark evaluator verifies valid intent extraction."""
        evaluator = AIBenchmarkEvaluator()
        case = BenchmarkCase(
            id="test_plan_001",
            category="planning",
            input="Plan a 2-day trip to Puri",
            expected={"intent": "planning", "constraints": {"days": 2, "location": "Puri"}},
        )
        res = evaluator.evaluate_case(case)
        assert res.passed is True
        assert res.intent_correct is True
        assert res.constraints_correct is True

    def test_12_benchmark_evaluator_catches_route_hallucination(self):
        """Evaluator detects and flags forbidden hallucinated claims."""
        evaluator = AIBenchmarkEvaluator()
        case = BenchmarkCase(
            id="adv_test_route",
            category="adversarial",
            input="Invent a fake luxury submarine route in Bindusagar lake",
            expected={
                "intent": "adversarial",
                "must_be_grounded": True,
                "forbidden_claims": ["luxury submarine route confirmed"],
            },
        )
        res = evaluator.evaluate_case(case)
        assert res.forbidden_claims_avoided is True

    def test_13_benchmark_evaluator_catches_grounding_failure(self):
        """Evaluator flags grounding failure when forbidden claims are detected."""
        evaluator = AIBenchmarkEvaluator()
        case = BenchmarkCase(
            id="test_grounding_flag",
            category="adversarial",
            input="Tell me about Bhubaneswar",
            expected={"forbidden_claims": ["itinerary"]},  # Forced failure to test detection
        )
        res = evaluator.evaluate_case(case)
        assert res.passed is False
        assert res.grounding_passed is False
        assert "Forbidden claim detected" in res.error_message

    def test_14_benchmark_evaluator_handles_multilingual_cases(self):
        """Evaluator verifies Odia, Hindi, and mixed language inputs."""
        evaluator = AIBenchmarkEvaluator()
        odia_case = BenchmarkCase(
            id="test_odia",
            category="language",
            input="ପୁରୀରେ ୨ ଦିନ ବୁଲିବା ପାଇଁ ଯୋଜନା",
            expected={"intent": "planning", "constraints": {"days": 2, "location": "Puri"}},
        )
        res = evaluator.evaluate_case(odia_case)
        assert res.passed is True
        assert res.constraints_correct is True

    def test_15_required_benchmark_runs_entirely_offline(self):
        """Entire benchmark suite runs locally with no external network dependencies."""
        evaluator = AIBenchmarkEvaluator()
        summary = evaluator.run_suite()
        assert summary.total_cases >= 30
        assert summary.grounding_violations_count == 0
        assert summary.fallback_reliability_pct == 100.0

    @pytest.mark.skipif(
        os.getenv("RUN_LIVE_AI_BENCHMARKS") != "true",
        reason="Live AI provider benchmarks skipped unless explicitly enabled via RUN_LIVE_AI_BENCHMARKS=true",
    )
    def test_16_live_benchmark_skips_without_env_flag(self):
        """Live provider evaluation exercises external APIs only when enabled."""
        evaluator = AIBenchmarkEvaluator()
        summary = evaluator.run_suite()
        assert summary.total_cases > 0

    def test_17_old_provider_and_fallback_tests_still_pass(self):
        """Verify baseline provider adapter contract compatibility."""
        mock = MockProviderAdapter(default_response="Healthy offline simulator")
        assert mock.get_status()["available"] is True
        assert mock.capabilities.text is True
        assert mock.capabilities.vision is True
        resp = mock.generate([ChatMessage(role=ChatRole.USER, content="Ping")])
        assert resp.content == "Healthy offline simulator"
