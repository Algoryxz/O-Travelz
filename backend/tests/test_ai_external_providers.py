"""Focused unit and integration test suite for Phase 12 Step 8:
Zero-Cost Multi-Provider AI Activation & Production Fallback.
Tests Azure OpenAI, Google Gemini, NVIDIA API adapters, MultiProviderFallbackAdapter,
zero-cost safety guards, secret masking, and deterministic fallbacks.
"""
import io
import json
import logging
import urllib.error
from typing import Any
from unittest.mock import MagicMock, patch

import pytest

from app.ai.adapter import (
    AzureOpenAIProviderAdapter,
    GeminiProviderAdapter,
    GenericHTTPProviderAdapter,
    MockProviderAdapter,
    MultiProviderFallbackAdapter,
    NVIDIAProviderAdapter,
    RuleBasedProviderAdapter,
    create_provider_adapter,
)
from app.ai.boundary import ToolExecutionBoundary
from app.ai.contracts import (
    AdapterResponse,
    AIProviderError,
    AuthenticationError,
    ChatMessage,
    ChatRole,
    FinishReason,
    MalformedProviderResponseError,
    MissingConfigurationError,
    ProviderTimeoutError,
    ProviderUnavailableError,
    RateLimitExceededError,
    ToolCall,
    ToolDefinition,
    ToolStatus,
)
from app.ai.registry import ToolRegistry
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
# 1. Configuration & Zero-Cost Guard Tests
# ==============================================================================
class TestZeroCostSafetyPolicy:
    def test_default_settings_is_safe_offline_zero_cost(self):
        settings = Settings()
        assert settings.ai_allow_external_provider is False
        assert settings.ai_allow_paid_provider is False
        assert settings.ai_provider == "mock"


    def test_factory_returns_offline_fallback_when_external_disabled(self):
        settings = Settings(
            ai_provider="azure_openai",
            ai_allow_external_provider=False,
            ai_api_key="secret-key",
            ai_api_base_url="https://example.openai.azure.com",
        )
        adapter = create_provider_adapter(settings)
        # Should be multi-provider adapter configured to route to fallback immediately
        assert isinstance(adapter, MultiProviderFallbackAdapter)
        status = adapter.get_status()
        assert status["allow_external_provider"] is False

        # When generate is called, it should immediately return deterministic response with 0 HTTP calls
        with patch("urllib.request.urlopen") as mock_urlopen:
            resp = adapter.generate([ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")])
            assert mock_urlopen.call_count == 0
            assert resp.metadata.get("provider") == "rule_based"


# ==============================================================================
# 2. Azure OpenAI Adapter Tests
# ==============================================================================
class TestAzureOpenAIProviderAdapter:
    def test_azure_url_and_header_formatting(self):
        adapter = AzureOpenAIProviderAdapter(
            api_base_url="https://my-resource.openai.azure.com",
            api_key="azure-secret-key-123",
            deployment_name="gpt-4o-mini-prod",
            api_version="2024-02-15-preview",
        )
        url = adapter._resolve_endpoint_url()
        assert url == "https://my-resource.openai.azure.com/openai/deployments/gpt-4o-mini-prod/chat/completions?api-version=2024-02-15-preview"
        headers = adapter._get_headers()
        assert headers["api-key"] == "azure-secret-key-123"

    def test_azure_get_status_never_exposes_api_key(self):
        adapter = AzureOpenAIProviderAdapter(
            api_base_url="https://my-resource.openai.azure.com",
            api_key="super-secret-azure-token",
            deployment_name="gpt-4o-mini",
        )
        status = adapter.get_status()
        assert "super-secret" not in json.dumps(status)
        assert status["provider"] == "azure_openai"
        assert status["available"] is True

    @patch("urllib.request.urlopen")
    def test_azure_successful_text_generation(self, mock_urlopen):
        mock_data = {
            "id": "chatcmpl-azure-123",
            "model": "gpt-4o-mini",
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": "Welcome to Odisha."},
                    "finish_reason": "stop",
                }
            ],
        }
        mock_urlopen.return_value = make_mock_http_response(200, mock_data)

        adapter = AzureOpenAIProviderAdapter(
            api_base_url="https://my-resource.openai.azure.com",
            api_key="azure-secret",
            deployment_name="gpt-4o-mini",
        )
        messages = [ChatMessage(role=ChatRole.USER, content="Hello")]
        resp = adapter.generate(messages)

        assert resp.content == "Welcome to Odisha."
        assert resp.finish_reason == FinishReason.STOP
        assert resp.metadata["provider"] == "azure_openai"

    @patch("urllib.request.urlopen")
    def test_azure_successful_tool_call_generation(self, mock_urlopen):
        mock_data = {
            "id": "chatcmpl-azure-456",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": None,
                        "tool_calls": [
                            {
                                "id": "call_azure_789",
                                "type": "function",
                                "function": {
                                    "name": "build_itinerary",
                                    "arguments": json.dumps({"constraints": {"days": 3, "start": "Puri"}}),
                                },
                            }
                        ],
                    },
                    "finish_reason": "tool_calls",
                }
            ],
        }
        mock_urlopen.return_value = make_mock_http_response(200, mock_data)

        adapter = AzureOpenAIProviderAdapter(
            api_base_url="https://my-resource.openai.azure.com",
            api_key="azure-secret",
            deployment_name="gpt-4o-mini",
        )
        messages = [ChatMessage(role=ChatRole.USER, content="Plan 3 days in Puri")]
        tools = [
            ToolDefinition(
                name="build_itinerary",
                description="Build travel itinerary",
                input_schema={"type": "object", "properties": {"constraints": {"type": "object"}}},
            )
        ]
        resp = adapter.generate(messages, tools)

        assert len(resp.tool_calls) == 1
        assert resp.tool_calls[0].id == "call_azure_789"
        assert resp.tool_calls[0].name == "build_itinerary"
        assert resp.tool_calls[0].arguments == {"constraints": {"days": 3, "start": "Puri"}}
        assert resp.finish_reason == FinishReason.TOOL_CALLS

    @patch("urllib.request.urlopen")
    def test_azure_auth_error_redacts_credentials(self, mock_urlopen):
        http_err = urllib.error.HTTPError(
            url="https://my-resource.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-15-preview",
            code=401,
            msg="Unauthorized",
            hdrs={},
            fp=io.BytesIO(b'{"error": {"message": "Invalid API key"}}'),
        )
        mock_urlopen.side_effect = http_err

        adapter = AzureOpenAIProviderAdapter(
            api_base_url="https://my-resource.openai.azure.com",
            api_key="sk-azure-secret-token",
            deployment_name="gpt-4o-mini",
            max_retries=0,
        )

        with pytest.raises(AuthenticationError) as exc_info:
            adapter.generate([ChatMessage(role=ChatRole.USER, content="Hello")])

        assert "sk-azure-secret-token" not in str(exc_info.value)


# ==============================================================================
# 3. Google Gemini Adapter Tests
# ==============================================================================
class TestGeminiProviderAdapter:
    def test_gemini_url_and_headers(self):
        adapter = GeminiProviderAdapter(
            api_base_url="https://generativelanguage.googleapis.com/v1beta",
            api_key="gemini-secret-api-key",
            model_name="gemini-1.5-flash",
        )
        url = adapter._resolve_endpoint_url()
        assert url == "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        headers = adapter._get_headers()
        assert headers["x-goog-api-key"] == "gemini-secret-api-key"

    def test_gemini_get_status_never_exposes_key(self):
        adapter = GeminiProviderAdapter(api_key="gemini-secret-12345")
        status = adapter.get_status()
        assert "gemini-secret" not in json.dumps(status)
        assert status["provider"] == "gemini"
        assert status["available"] is True

    @patch("urllib.request.urlopen")
    def test_gemini_successful_text_and_tool_call(self, mock_urlopen):
        mock_gemini_response = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {"text": "I am creating your Puri trip plan."},
                            {
                                "functionCall": {
                                    "name": "build_itinerary",
                                    "args": {"constraints": {"days": 2, "start": "Puri"}},
                                }
                            },
                        ]
                    },
                    "finishReason": "STOP",
                }
            ]
        }
        mock_urlopen.return_value = make_mock_http_response(200, mock_gemini_response)

        adapter = GeminiProviderAdapter(api_key="gemini-key", model_name="gemini-1.5-flash")
        messages = [ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")]
        resp = adapter.generate(messages)

        assert resp.content == "I am creating your Puri trip plan."
        assert len(resp.tool_calls) == 1
        assert resp.tool_calls[0].name == "build_itinerary"
        assert resp.tool_calls[0].arguments == {"constraints": {"days": 2, "start": "Puri"}}
        assert resp.finish_reason == FinishReason.TOOL_CALLS


# ==============================================================================
# 4. NVIDIA Adapter Tests
# ==============================================================================
class TestNVIDIAProviderAdapter:
    def test_nvidia_adapter_defaults(self):
        adapter = NVIDIAProviderAdapter(api_key="nvapi-secret-key")
        status = adapter.get_status()
        assert status["provider"] == "nvidia"
        assert status["model"] == "meta/llama-3.1-8b-instruct"
        assert "nvapi-secret" not in json.dumps(status)


# ==============================================================================
# 5. MultiProviderFallbackAdapter & Fallback Chain Tests
# ==============================================================================
class TestMultiProviderFallbackChain:
    def test_primary_azure_success_uses_azure(self):
        mock_azure = MagicMock(spec=AzureOpenAIProviderAdapter)
        mock_azure.get_status.return_value = {"provider": "azure_openai", "available": True}
        mock_azure.generate.return_value = AdapterResponse(
            content="Azure response",
            tool_calls=[],
            finish_reason=FinishReason.STOP,
            metadata={},
        )

        mock_gemini = MagicMock(spec=GeminiProviderAdapter)
        mock_gemini.get_status.return_value = {"provider": "gemini", "available": True}

        fallback = RuleBasedProviderAdapter()

        adapter = MultiProviderFallbackAdapter(
            providers=[mock_azure, mock_gemini],
            fallback_adapter=fallback,
            allow_external_provider=True,
        )

        resp = adapter.generate([ChatMessage(role=ChatRole.USER, content="Hello")])
        assert resp.content == "Azure response"
        assert resp.metadata.get("active_provider") == "azure_openai"
        assert mock_azure.generate.call_count == 1
        assert mock_gemini.generate.call_count == 0

    def test_azure_failure_falls_back_to_gemini(self):
        mock_azure = MagicMock(spec=AzureOpenAIProviderAdapter)
        mock_azure.get_status.return_value = {"provider": "azure_openai", "available": True}
        mock_azure.generate.side_effect = ProviderTimeoutError("Azure timed out", provider="azure_openai")

        mock_gemini = MagicMock(spec=GeminiProviderAdapter)
        mock_gemini.get_status.return_value = {"provider": "gemini", "available": True}
        mock_gemini.generate.return_value = AdapterResponse(
            content="Gemini fallback response",
            tool_calls=[],
            finish_reason=FinishReason.STOP,
            metadata={},
        )

        fallback = RuleBasedProviderAdapter()

        adapter = MultiProviderFallbackAdapter(
            providers=[mock_azure, mock_gemini],
            fallback_adapter=fallback,
            allow_external_provider=True,
        )

        resp = adapter.generate([ChatMessage(role=ChatRole.USER, content="Hello")])
        assert resp.content == "Gemini fallback response"
        assert resp.metadata.get("active_provider") == "gemini"
        assert mock_azure.generate.call_count == 1
        assert mock_gemini.generate.call_count == 1

    def test_all_external_providers_fail_falls_back_to_rule_based_deterministic(self):
        mock_azure = MagicMock(spec=AzureOpenAIProviderAdapter)
        mock_azure.get_status.return_value = {"provider": "azure_openai", "available": True}
        mock_azure.generate.side_effect = ProviderUnavailableError("Azure 503", provider="azure_openai")

        mock_gemini = MagicMock(spec=GeminiProviderAdapter)
        mock_gemini.get_status.return_value = {"provider": "gemini", "available": True}
        mock_gemini.generate.side_effect = RateLimitExceededError("Gemini 429", provider="gemini")

        fallback = RuleBasedProviderAdapter()

        adapter = MultiProviderFallbackAdapter(
            providers=[mock_azure, mock_gemini],
            fallback_adapter=fallback,
            allow_external_provider=True,
        )

        resp = adapter.generate(
            [ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")],
            tools=[ToolDefinition(name="build_itinerary", description="itinerary tool")],
        )

        assert resp.metadata.get("active_provider") == "rule_based_fallback"
        assert len(resp.tool_calls) == 1
        assert resp.tool_calls[0].name == "build_itinerary"
        assert resp.tool_calls[0].arguments["constraints"]["days"] == 2


# ==============================================================================
# 6. Security, Boundary, & Multilingual Invariants
# ==============================================================================
class TestSecurityAndGroundingInvariants:
    def test_tool_execution_boundary_rejects_arbitrary_python(self):
        registry = ToolRegistry()
        boundary = ToolExecutionBoundary(registry)

        # Attempt arbitrary injection
        malicious_call = ToolCall(name="__import__('os').system", arguments={"cmd": "whoami"})
        result = boundary.execute(malicious_call)

        assert result.status == ToolStatus.UNKNOWN
        assert "Unknown tool" in (result.error or "")

    def test_multilingual_odia_query_through_fallback_adapter(self):
        adapter = RuleBasedProviderAdapter()
        odia_message = ChatMessage(role=ChatRole.USER, content="ପୁରୀ ପାଇଁ ୩ ଦିନର ଯାତ୍ରା ଯୋଜନା କର")
        tools = [ToolDefinition(name="build_itinerary", description="build itinerary")]

        resp = adapter.generate([odia_message], tools=tools)

        assert len(resp.tool_calls) == 1
        assert resp.tool_calls[0].name == "build_itinerary"
        assert resp.tool_calls[0].arguments["constraints"]["days"] == 3
        assert resp.tool_calls[0].arguments["constraints"]["start"] == "Puri"

    def test_multilingual_hindi_query_through_fallback_adapter(self):
        adapter = RuleBasedProviderAdapter()
        hindi_message = ChatMessage(role=ChatRole.USER, content="पुरी के लिए 2 दिन का प्लान बनाओ")
        tools = [ToolDefinition(name="build_itinerary", description="build itinerary")]

        resp = adapter.generate([hindi_message], tools=tools)

        assert len(resp.tool_calls) == 1
        assert resp.tool_calls[0].name == "build_itinerary"
        assert resp.tool_calls[0].arguments["constraints"]["days"] == 2
        assert resp.tool_calls[0].arguments["constraints"]["start"] == "Puri"
