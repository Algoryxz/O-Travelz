"""Dedicated provider isolation and independent verification test suite.

Verifies the 7 explicit production isolation scenarios:
Test 1: Only Gemini key configured -> Gemini responds successfully.
Test 2: Only Azure OpenAI credentials configured -> Azure OpenAI responds successfully.
Test 3: Only NVIDIA credentials configured -> NVIDIA responds successfully.
Test 4: All external providers disabled/no keys -> Deterministic rule-based planner responds successfully.
Test 5: Azure enabled but deliberately unavailable -> Gemini is attempted.
Test 6: Azure + Gemini unavailable -> NVIDIA is attempted.
Test 7: All external providers unavailable -> Deterministic rule engine responds.
"""
from __future__ import annotations

import json
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.ai.adapter import (
    AzureOpenAIProviderAdapter,
    GeminiProviderAdapter,
    NVIDIAProviderAdapter,
    RuleBasedProviderAdapter,
    create_provider_adapter,
)
from app.ai.contracts import ChatMessage, ChatRole
from app.core.config import Settings
from app.main import app


def make_mock_http_response(status: int = 200, data: dict | str = None):
    if data is None:
        raw_bytes = b"{}"
    elif isinstance(data, str):
        raw_bytes = data.encode("utf-8")
    else:
        raw_bytes = json.dumps(data).encode("utf-8")

    mock_resp = MagicMock()
    mock_resp.status = status
    mock_resp.read.return_value = raw_bytes
    mock_resp.headers = {}
    mock_resp.__enter__.return_value = mock_resp
    mock_resp.__exit__.return_value = None
    return mock_resp


class TestAIProviderIsolation:
    @patch("urllib.request.urlopen")
    def test_1_only_gemini_configured(self, mock_urlopen):
        """Test 1: Only Gemini key configured -> Gemini responds successfully."""
        mock_data = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {"text": "Gemini verified response for Odisha travel."}
                        ]
                    },
                    "finishReason": "STOP",
                }
            ]
        }
        mock_urlopen.return_value = make_mock_http_response(200, mock_data)

        settings = Settings(
            ai_provider="gemini",
            ai_allow_external_provider=True,
            ai_gemini_api_key="valid-gemini-test-key",
            ai_gemini_model_name="gemini-1.5-flash",
        )
        adapter = create_provider_adapter(settings)
        resp = adapter.generate([ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")])

        assert resp.content == "Gemini verified response for Odisha travel."
        assert resp.metadata["active_provider"] == "gemini"
        assert mock_urlopen.call_count == 1

    @patch("urllib.request.urlopen")
    def test_2_only_azure_openai_configured(self, mock_urlopen):
        """Test 2: Only Azure OpenAI credentials configured -> Azure OpenAI responds successfully."""
        mock_data = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "Azure OpenAI verified response for Odisha travel.",
                    },
                    "finish_reason": "stop",
                }
            ]
        }
        mock_urlopen.return_value = make_mock_http_response(200, mock_data)

        settings = Settings(
            ai_provider="azure_openai",
            ai_allow_external_provider=True,
            ai_api_key="valid-azure-test-key",
            ai_api_base_url="https://test-resource.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
        )
        adapter = create_provider_adapter(settings)
        resp = adapter.generate([ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")])

        assert resp.content == "Azure OpenAI verified response for Odisha travel."
        assert resp.metadata["active_provider"] == "azure_openai"
        assert mock_urlopen.call_count == 1

    @patch("urllib.request.urlopen")
    def test_3_only_nvidia_configured(self, mock_urlopen):
        """Test 3: Only NVIDIA credentials configured -> NVIDIA responds successfully."""
        mock_data = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "NVIDIA NIM verified response for Odisha travel.",
                    },
                    "finish_reason": "stop",
                }
            ]
        }
        mock_urlopen.return_value = make_mock_http_response(200, mock_data)

        settings = Settings(
            ai_provider="nvidia",
            ai_allow_external_provider=True,
            ai_nvidia_api_key="valid-nvapi-test-key",
            ai_nvidia_model_name="meta/llama-3.1-8b-instruct",
        )
        adapter = create_provider_adapter(settings)
        resp = adapter.generate([ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")])

        assert resp.content == "NVIDIA NIM verified response for Odisha travel."
        assert resp.metadata["active_provider"] == "nvidia"
        assert mock_urlopen.call_count == 1

    def test_4_all_external_disabled_or_no_keys(self):
        """Test 4: All external providers disabled/no keys -> Deterministic rule-based planner responds successfully."""
        settings = Settings(
            ai_provider="multi_provider",
            ai_allow_external_provider=False,
        )
        with patch("urllib.request.urlopen") as mock_urlopen:
            adapter = create_provider_adapter(settings)
            resp = adapter.generate([ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")])

            assert mock_urlopen.call_count == 0
            assert resp.metadata["provider"] == "rule_based"
            assert len(resp.tool_calls) == 1
            assert resp.tool_calls[0].name == "build_itinerary"
            assert resp.tool_calls[0].arguments["constraints"]["days"] == 2

    @patch("urllib.request.urlopen")
    def test_5_azure_unavailable_falls_back_to_gemini(self, mock_urlopen):
        """Test 5: Azure enabled but deliberately unavailable -> Gemini is attempted."""
        # Call 1 (Azure) -> Timeout/Failure; Call 2 (Gemini) -> Success
        gemini_success = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {"text": "Gemini fallback succeeded after Azure failure."}
                        ]
                    },
                    "finishReason": "STOP",
                }
            ]
        }
        mock_urlopen.side_effect = [
            TimeoutError("Azure request timed out"),
            make_mock_http_response(200, gemini_success),
        ]

        settings = Settings(
            ai_provider="multi_provider",
            ai_allow_external_provider=True,
            ai_api_key="azure-key",
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
            ai_gemini_api_key="gemini-key",
            ai_gemini_model_name="gemini-1.5-flash",
            ai_max_retries=0,
        )
        adapter = create_provider_adapter(settings)
        resp = adapter.generate([ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")])

        assert resp.content == "Gemini fallback succeeded after Azure failure."
        assert resp.metadata["active_provider"] == "gemini"
        assert mock_urlopen.call_count == 2

    @patch("urllib.request.urlopen")
    def test_6_azure_and_gemini_unavailable_falls_back_to_nvidia(self, mock_urlopen):
        """Test 6: Azure + Gemini unavailable -> NVIDIA is attempted."""
        # Call 1 (Azure) -> Error, Call 2 (Gemini) -> Error, Call 3 (NVIDIA) -> Success
        nvidia_success = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "NVIDIA fallback succeeded after Azure and Gemini failure.",
                    },
                    "finish_reason": "stop",
                }
            ]
        }
        mock_urlopen.side_effect = [
            TimeoutError("Azure request timed out"),
            TimeoutError("Gemini request timed out"),
            make_mock_http_response(200, nvidia_success),
        ]

        settings = Settings(
            ai_provider="multi_provider",
            ai_allow_external_provider=True,
            ai_api_key="azure-key",
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
            ai_gemini_api_key="gemini-key",
            ai_gemini_model_name="gemini-1.5-flash",
            ai_nvidia_api_key="nvidia-key",
            ai_nvidia_model_name="meta/llama-3.1-8b-instruct",
            ai_max_retries=0,
        )
        adapter = create_provider_adapter(settings)
        resp = adapter.generate([ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")])

        assert resp.content == "NVIDIA fallback succeeded after Azure and Gemini failure."
        assert resp.metadata["active_provider"] == "nvidia"
        assert mock_urlopen.call_count == 3

    @patch("urllib.request.urlopen")
    def test_7_all_external_providers_unavailable_falls_back_to_rule_based(self, mock_urlopen):
        """Test 7: All external providers unavailable -> Deterministic rule engine responds."""
        mock_urlopen.side_effect = [
            TimeoutError("Azure timed out"),
            TimeoutError("Gemini timed out"),
            TimeoutError("NVIDIA timed out"),
        ]

        settings = Settings(
            ai_provider="multi_provider",
            ai_allow_external_provider=True,
            ai_api_key="azure-key",
            ai_api_base_url="https://test.openai.azure.com",
            ai_azure_deployment_name="gpt-5-mini",
            ai_gemini_api_key="gemini-key",
            ai_gemini_model_name="gemini-1.5-flash",
            ai_nvidia_api_key="nvidia-key",
            ai_nvidia_model_name="meta/llama-3.1-8b-instruct",
            ai_max_retries=0,
        )
        adapter = create_provider_adapter(settings)
        resp = adapter.generate([ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")])

        assert resp.metadata["active_provider"] == "rule_based_fallback"
        assert resp.metadata["fallback_used"] is True
        assert len(resp.tool_calls) == 1
        assert resp.tool_calls[0].name == "build_itinerary"
        assert resp.tool_calls[0].arguments["constraints"]["days"] == 2
        assert mock_urlopen.call_count == 3
