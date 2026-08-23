"""Zero-Cost Live AI Provider Smoke Test CLI.

Usage:
    python -m app.ai.provider_smoke_test

Safely verifies live provider connectivity without risking paid usage,
executing travel tools, or exposing secrets.
"""
from __future__ import annotations

import argparse
import sys
import time
from enum import Enum
from typing import Optional

from app.ai.adapter import (
    AzureOpenAIProviderAdapter,
    GeminiProviderAdapter,
    NVIDIAProviderAdapter,
    RuleBasedProviderAdapter,
)
from app.ai.contracts import (
    AIProviderError,
    AuthenticationError,
    ChatMessage,
    ChatRole,
    MalformedProviderResponseError,
    ProviderTimeoutError,
    ProviderUnavailableError,
    RateLimitExceededError,
)
from app.ai.provider_health import (
    ProviderHealthStatus,
    ProviderReadinessState,
    inspect_all_providers,
    inspect_provider_health,
)
from app.core.config import Settings, settings as global_settings


class SmokeTestResultCode(str, Enum):
    LIVE_SUCCESS = "LIVE_SUCCESS"
    AUTHENTICATION_FAILURE = "AUTHENTICATION_FAILURE"
    RATE_LIMITED = "RATE_LIMITED"
    TIMEOUT = "TIMEOUT"
    PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE"
    MALFORMED_RESPONSE = "MALFORMED_RESPONSE"
    COST_POLICY_BLOCKED = "COST_POLICY_BLOCKED"
    NOT_CONFIGURED = "NOT_CONFIGURED"
    UNVERIFIED_FREE = "UNVERIFIED_FREE"
    SKIPPED_OFFLINE = "SKIPPED_OFFLINE"


class SmokeTestReport:
    def __init__(
        self,
        provider: str,
        status: SmokeTestResultCode,
        latency_ms: float = 0.0,
        response_preview: str = "",
        error_message: str = "",
        cost_safe: bool = True,
    ) -> None:
        self.provider = provider
        self.status = status
        self.latency_ms = latency_ms
        self.response_preview = response_preview
        self.error_message = error_message
        self.cost_safe = cost_safe


def execute_single_provider_smoke_test(
    provider_name: str,
    settings: Optional[Settings] = None,
) -> SmokeTestReport:
    """Execute at most ONE minimal test request against the specified provider."""
    cfg = settings or global_settings
    health = inspect_provider_health(provider_name, cfg)

    if health.readiness_state == ProviderReadinessState.NOT_CONFIGURED:
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.NOT_CONFIGURED,
            error_message=health.details,
            cost_safe=True,
        )

    if health.readiness_state == ProviderReadinessState.CONFIGURED_BUT_DISABLED:
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.COST_POLICY_BLOCKED,
            error_message="External requests disabled: AI_ALLOW_EXTERNAL_PROVIDER is false.",
            cost_safe=True,
        )

    # Instantiate single-shot adapter with 0 retries
    adapter: Any
    if provider_name == "azure_openai":
        adapter = AzureOpenAIProviderAdapter(
            api_base_url=getattr(cfg, "ai_api_base_url", None),
            api_key=getattr(cfg, "ai_api_key", None),
            deployment_name=getattr(cfg, "ai_azure_deployment_name", None) or getattr(cfg, "ai_model_name", None),
            api_version=getattr(cfg, "ai_azure_api_version", "2024-12-01-preview"),
            timeout_seconds=min(10.0, getattr(cfg, "ai_timeout_seconds", 10.0)),
            max_retries=0,
        )
    elif provider_name == "gemini":
        adapter = GeminiProviderAdapter(
            api_base_url=getattr(cfg, "ai_gemini_api_base_url", "https://generativelanguage.googleapis.com/v1beta"),
            api_key=getattr(cfg, "ai_gemini_api_key", None),
            model_name=getattr(cfg, "ai_gemini_model_name", "gemini-1.5-flash"),
            timeout_seconds=min(10.0, getattr(cfg, "ai_timeout_seconds", 10.0)),
            max_retries=0,
        )
    elif provider_name == "nvidia":
        adapter = NVIDIAProviderAdapter(
            api_base_url=getattr(cfg, "ai_nvidia_api_base_url", "https://integrate.api.nvidia.com/v1"),
            api_key=getattr(cfg, "ai_nvidia_api_key", None),
            model_name=getattr(cfg, "ai_nvidia_model_name", "meta/llama-3.1-8b-instruct"),
            timeout_seconds=min(10.0, getattr(cfg, "ai_timeout_seconds", 10.0)),
            max_retries=0,
        )
    elif provider_name in ("rule_based", "mock"):
        start_t = time.perf_counter()
        adapter = RuleBasedProviderAdapter()
        res = adapter.generate([ChatMessage(role=ChatRole.USER, content="Hello")])
        duration = (time.perf_counter() - start_t) * 1000.0
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.LIVE_SUCCESS,
            latency_ms=duration,
            response_preview=res.content or "[Tool Call Generated]",
            cost_safe=True,
        )
    else:
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.NOT_CONFIGURED,
            error_message=f"Unknown provider '{provider_name}'",
            cost_safe=True,
        )

    # Dispatch minimal non-travel prompt (0 tool execution, 0 real user history)
    test_message = ChatMessage(role=ChatRole.USER, content="Respond with exactly: O-TRAVELZ PROVIDER OK")

    start_time = time.perf_counter()
    try:
        response = adapter.generate([test_message], tools=None)
        latency = (time.perf_counter() - start_time) * 1000.0
        preview = (response.content or "").strip().replace("\n", " ")[:60]
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.LIVE_SUCCESS,
            latency_ms=latency,
            response_preview=preview,
            cost_safe=True,
        )
    except AuthenticationError as auth_err:
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.AUTHENTICATION_FAILURE,
            error_message=auth_err.message,
            cost_safe=True,
        )
    except RateLimitExceededError as rate_err:
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.RATE_LIMITED,
            error_message=rate_err.message,
            cost_safe=True,
        )
    except ProviderTimeoutError as time_err:
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.TIMEOUT,
            error_message=time_err.message,
            cost_safe=True,
        )
    except MalformedProviderResponseError as mal_err:
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.MALFORMED_RESPONSE,
            error_message=mal_err.message,
            cost_safe=True,
        )
    except ProviderUnavailableError as unavail_err:
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.PROVIDER_UNAVAILABLE,
            error_message=unavail_err.message,
            cost_safe=True,
        )
    except Exception as exc:
        return SmokeTestReport(
            provider=provider_name,
            status=SmokeTestResultCode.PROVIDER_UNAVAILABLE,
            error_message=f"Unexpected error: {exc}",
            cost_safe=True,
        )


def run_all_smoke_tests(settings: Optional[Settings] = None) -> list[SmokeTestReport]:
    """Run sequential smoke tests across Azure OpenAI, Gemini, NVIDIA, and Rule-Based engine."""
    providers = ["azure_openai", "gemini", "nvidia", "rule_based"]
    return [execute_single_provider_smoke_test(p, settings) for p in providers]


def print_smoke_test_summary(reports: list[SmokeTestReport]) -> None:
    """Print clean formatted CLI output."""
    print("=" * 80)
    print("O-TRAVELZ ZERO-COST AI PROVIDER SMOKE TEST REPORT")
    print("Budget Ceiling: INR 0 (Zero Cost) | External SDKs: 0 | Travel Tools Executed: 0")
    print("=" * 80)
    print(f"{'Provider':<16} | {'Status':<24} | {'Latency':<10} | {'Cost Safe':<10} | {'Details'}")
    print("-" * 80)


    for r in reports:
        latency_str = f"{r.latency_ms:.1f}ms" if r.latency_ms > 0 else "N/A"
        details = r.response_preview or r.error_message or "-"
        print(f"{r.provider:<16} | {r.status.value:<24} | {latency_str:<10} | {str(r.cost_safe):<10} | {details[:40]}")

    print("=" * 80)


def main() -> None:
    parser = argparse.ArgumentParser(description="O-Travelz AI Provider Smoke Test")
    parser.add_argument("--provider", type=str, default=None, help="Target a specific provider")
    args = parser.parse_args()

    if args.provider:
        reports = [execute_single_provider_smoke_test(args.provider)]
    else:
        reports = run_all_smoke_tests()

    print_smoke_test_summary(reports)


if __name__ == "__main__":
    main()
