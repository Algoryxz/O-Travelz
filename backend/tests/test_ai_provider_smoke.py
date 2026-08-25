"""Test suite for Phase 12 Step 9: Zero-Cost Live AI Provider Smoke Test & Activation Verification.

Tests preflight diagnostics, cost-safety policy enforcement, smoke-test single-shot execution,
error normalization, secret masking, and deterministic fallbacks.
"""
import io
import json
import logging
import urllib.error
from unittest.mock import MagicMock, patch

import pytest

from app.ai.contracts import (
    ChatMessage,
    ChatRole,
    FinishReason,
    ProviderErrorCode,
)
from app.ai.provider_health import (
    ProviderHealthStatus,
    ProviderReadinessState,
    inspect_all_providers,
    inspect_provider_health,
)
from app.ai.provider_smoke_test import (
    SmokeTestReport,
    SmokeTestResultCode,
    execute_single_provider_smoke_test,
    run_all_smoke_tests,
)
from app.core.config import Settings


def make_mock_http_response(status: int = 200, data: dict | str = None, headers: dict = None):
    """Helper creating a mocked urllib HTTP response context manager."""
    if data is None:
        raw_bytes = b"{}"
    elif isinstance(data, str):
        raw_bytes = data.encode("utf-8")
    else:
        raw_bytes = json.dumps(data).encode("utf-8")

    mock_resp = MagicMock()
    mock_resp.status = status
    mock_resp.read.return_value = raw_bytes
    mock_resp.headers = headers or {}
    mock_resp.__enter__.return_value = mock_resp
    mock_resp.__exit__.return_value = None
    return mock_resp


# ==============================================================================
# 1. Preflight Diagnostics & Credential Absence Tests
# ==============================================================================
class TestProviderPreflightDiagnostics:
    def test_missing_azure_credentials_reports_not_configured(self):
        settings = Settings(ai_api_key=None, ai_api_base_url=None)
        status = inspect_provider_health("azure_openai", settings)
        assert status.configured is False
        assert status.credential_present is False
        assert status.readiness_state == ProviderReadinessState.NOT_CONFIGURED
        assert status.live_check_allowed is False

    def test_missing_gemini_credentials_reports_not_configured(self):
        settings = Settings(ai_gemini_api_key=None)
        status = inspect_provider_health("gemini", settings)
        assert status.configured is False
        assert status.credential_present is False
        assert status.readiness_state == ProviderReadinessState.NOT_CONFIGURED
        assert status.live_check_allowed is False

    def test_missing_nvidia_credentials_reports_not_configured(self):
        settings = Settings(ai_nvidia_api_key=None)
        status = inspect_provider_health("nvidia", settings)
        assert status.configured is False
        assert status.credential_present is False
        assert status.readiness_state == ProviderReadinessState.NOT_CONFIGURED
        assert status.live_check_allowed is False

    def test_external_providers_disabled_reports_configured_but_disabled(self):
        settings = Settings(
            ai_allow_external_provider=False,
            ai_api_key="sk-azure-12345",
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
        )
        status = inspect_provider_health("azure_openai", settings)
        assert status.configured is True
        assert status.credential_present is True
        assert status.readiness_state == ProviderReadinessState.CONFIGURED_BUT_DISABLED
        assert status.live_check_allowed is False

    def test_safe_offline_rule_based_always_safe_to_test(self):
        settings = Settings(ai_allow_external_provider=False)
        status = inspect_provider_health("rule_based", settings)
        assert status.readiness_state == ProviderReadinessState.CONFIGURED_SAFE_TO_TEST
        assert status.live_check_allowed is True
        assert status.paid_provider_enabled is False

    def test_inspect_all_providers_returns_ordered_hierarchy(self):
        statuses = inspect_all_providers()
        assert len(statuses) == 5
        names = [s.provider for s in statuses]
        assert names == ["azure_openai", "gemini", "nvidia", "groq", "rule_based"]


# ==============================================================================
# 2. Smoke Test Single-Shot Execution & Response Normalization
# ==============================================================================
class TestSmokeTestExecution:
    def test_disabled_external_provider_blocks_live_smoke_request(self):
        settings = Settings(
            ai_allow_external_provider=False,
            ai_api_key="sk-azure-12345",
            ai_api_base_url="https://test.openai.azure.com",
        )
        with patch("urllib.request.urlopen") as mock_urlopen:
            report = execute_single_provider_smoke_test("azure_openai", settings)
            assert mock_urlopen.call_count == 0
            assert report.status == SmokeTestResultCode.COST_POLICY_BLOCKED
            assert report.cost_safe is True

    @patch("urllib.request.urlopen")
    def test_azure_successful_smoke_response(self, mock_urlopen):
        mock_data = {
            "choices": [{"message": {"role": "assistant", "content": "O-TRAVELZ PROVIDER OK"}}]
        }
        mock_urlopen.return_value = make_mock_http_response(200, mock_data)

        settings = Settings(
            ai_allow_external_provider=True,
            ai_api_key="sk-azure-12345",
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
        )
        report = execute_single_provider_smoke_test("azure_openai", settings)
        assert report.status == SmokeTestResultCode.LIVE_SUCCESS
        assert "O-TRAVELZ PROVIDER OK" in report.response_preview
        assert report.latency_ms > 0
        assert report.cost_safe is True
        assert mock_urlopen.call_count == 1

    @patch("urllib.request.urlopen")
    def test_gemini_successful_smoke_response(self, mock_urlopen):
        mock_data = {
            "candidates": [{"content": {"parts": [{"text": "O-TRAVELZ PROVIDER OK"}]}}]
        }
        mock_urlopen.return_value = make_mock_http_response(200, mock_data)

        settings = Settings(
            ai_allow_external_provider=True,
            ai_gemini_api_key="gemini-key-12345",
            ai_gemini_model_name="gemini-1.5-flash",
        )
        report = execute_single_provider_smoke_test("gemini", settings)
        assert report.status == SmokeTestResultCode.LIVE_SUCCESS
        assert "O-TRAVELZ PROVIDER OK" in report.response_preview
        assert report.cost_safe is True
        assert mock_urlopen.call_count == 1

    @patch("urllib.request.urlopen")
    def test_nvidia_successful_smoke_response(self, mock_urlopen):
        mock_data = {
            "choices": [{"message": {"role": "assistant", "content": "O-TRAVELZ PROVIDER OK"}}]
        }
        mock_urlopen.return_value = make_mock_http_response(200, mock_data)

        settings = Settings(
            ai_allow_external_provider=True,
            ai_nvidia_api_key="nvapi-key-12345",
            ai_nvidia_model_name="meta/llama-3.1-8b-instruct",
        )
        report = execute_single_provider_smoke_test("nvidia", settings)
        assert report.status == SmokeTestResultCode.LIVE_SUCCESS
        assert "O-TRAVELZ PROVIDER OK" in report.response_preview
        assert report.cost_safe is True
        assert mock_urlopen.call_count == 1

    @patch("urllib.request.urlopen")
    def test_authentication_failure_normalization(self, mock_urlopen):
        http_err = urllib.error.HTTPError(
            url="https://test.openai.azure.com",
            code=401,
            msg="Unauthorized",
            hdrs={},
            fp=io.BytesIO(b'{"error": "Access Denied"}'),
        )
        mock_urlopen.side_effect = http_err

        settings = Settings(
            ai_allow_external_provider=True,
            ai_api_key="bad-key",
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
        )
        report = execute_single_provider_smoke_test("azure_openai", settings)
        assert report.status == SmokeTestResultCode.AUTHENTICATION_FAILURE
        assert report.cost_safe is True

    @patch("urllib.request.urlopen")
    def test_rate_limit_normalization(self, mock_urlopen):
        http_err = urllib.error.HTTPError(
            url="https://test.openai.azure.com",
            code=429,
            msg="Too Many Requests",
            hdrs={},
            fp=io.BytesIO(b'{"error": "Quota Exceeded"}'),
        )
        mock_urlopen.side_effect = http_err

        settings = Settings(
            ai_allow_external_provider=True,
            ai_api_key="sk-key",
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
        )
        report = execute_single_provider_smoke_test("azure_openai", settings)
        assert report.status == SmokeTestResultCode.RATE_LIMITED
        assert report.cost_safe is True

    @patch("urllib.request.urlopen")
    def test_timeout_normalization(self, mock_urlopen):
        mock_urlopen.side_effect = TimeoutError("Request timed out")

        settings = Settings(
            ai_allow_external_provider=True,
            ai_api_key="sk-key",
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
        )
        report = execute_single_provider_smoke_test("azure_openai", settings)
        assert report.status == SmokeTestResultCode.TIMEOUT
        assert report.cost_safe is True

    @patch("urllib.request.urlopen")
    def test_malformed_response_normalization(self, mock_urlopen):
        mock_urlopen.return_value = make_mock_http_response(200, "<html>Not JSON</html>")

        settings = Settings(
            ai_allow_external_provider=True,
            ai_api_key="sk-key",
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
        )
        report = execute_single_provider_smoke_test("azure_openai", settings)
        assert report.status == SmokeTestResultCode.MALFORMED_RESPONSE
        assert report.cost_safe is True


# ==============================================================================
# 3. Security, Masking, & Execution Invariant Tests
# ==============================================================================
class TestSmokeTestSecurityInvariants:
    def test_secret_masking_in_health_status(self):
        settings = Settings(
            ai_api_key="my-super-secret-azure-token-xyz1234",
            ai_gemini_api_key="gemini-secret-5678",
        )
        azure_status = inspect_provider_health("azure_openai", settings)
        gemini_status = inspect_provider_health("gemini", settings)

        assert "1234" in azure_status.credential_preview
        assert "super-secret" not in azure_status.credential_preview
        assert "5678" in gemini_status.credential_preview
        assert "gemini-secret" not in gemini_status.credential_preview


    @patch("urllib.request.urlopen")
    def test_no_credential_leakage_in_error_messages(self, mock_urlopen):
        secret_token = "azure-super-confidential-token-9999"
        http_err = urllib.error.HTTPError(
            url="https://test.openai.azure.com",
            code=401,
            msg="Unauthorized",
            hdrs={},
            fp=io.BytesIO(b'{"error": "Unauthorized key"}'),
        )
        mock_urlopen.side_effect = http_err

        settings = Settings(
            ai_allow_external_provider=True,
            ai_api_key=secret_token,
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
        )
        report = execute_single_provider_smoke_test("azure_openai", settings)
        assert secret_token not in report.error_message
        assert secret_token not in json.dumps(report.__dict__)

    def test_rule_based_smoke_test_always_succeeds_offline(self):
        report = execute_single_provider_smoke_test("rule_based")
        assert report.status == SmokeTestResultCode.LIVE_SUCCESS
        assert report.cost_safe is True
        assert report.latency_ms >= 0

    @patch("urllib.request.urlopen")
    def test_smoke_test_never_retries(self, mock_urlopen):
        # Even on network failure, max_retries is 0 so exactly 1 call is made
        mock_urlopen.side_effect = TimeoutError("Timed out")

        settings = Settings(
            ai_allow_external_provider=True,
            ai_api_key="sk-key",
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
            ai_max_retries=5,  # Global config has 5 retries, smoke test must override to 0
        )
        report = execute_single_provider_smoke_test("azure_openai", settings)
        assert mock_urlopen.call_count == 1
        assert report.status == SmokeTestResultCode.TIMEOUT
