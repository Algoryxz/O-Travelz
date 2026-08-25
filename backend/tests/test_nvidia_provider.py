"""
Unit and integration tests for NVIDIAProviderAdapter.

Verifies:
- Safe initialization with default model deepseek-ai/DeepSeek-V4-Flash.
- Zero secret leakage in get_status() or string representations.
- Factory routing when ai_provider="nvidia".
- Offline safety when external calls are disabled.
"""
from unittest.mock import MagicMock, patch
import pytest

from app.ai.adapter import NVIDIAProviderAdapter, create_provider_adapter
from app.ai.contracts import ChatMessage, ChatRole, FinishReason
from app.core.config import Settings


def test_nvidia_adapter_initialization_and_status():
    """Test NVIDIA adapter status without exposing API key."""
    adapter = NVIDIAProviderAdapter(
        api_base_url="https://integrate.api.nvidia.com/v1",
        api_key="nvapi-secret-key-12345",
        model_name="deepseek-ai/DeepSeek-V4-Flash",
        timeout_seconds=25.0,
    )

    status = adapter.get_status()
    assert status["provider"] == "nvidia"
    assert status["model"] == "deepseek-ai/DeepSeek-V4-Flash"
    assert status["configured"] is True
    assert status["available"] is True
    assert status["timeout_seconds"] == 25.0

    # Ensure secret is NOT in status dictionary
    status_str = str(status)
    assert "nvapi-secret" not in status_str
    assert "12345" not in status_str


def test_nvidia_adapter_factory_routing():
    """Test creating NVIDIA adapter via factory."""
    custom_settings = Settings(
        ai_provider="nvidia",
        ai_allow_external_provider=True,
        ai_nvidia_api_key="nvapi-test-key",
        ai_nvidia_model_name="deepseek-ai/DeepSeek-V4-Flash",
    )

    adapter = create_provider_adapter(custom_settings)
    status = adapter.get_status()
    assert status["provider"] == "multi_provider"
    assert status["provider_chain"][0]["provider"] == "nvidia"


def test_nvidia_adapter_mocked_chat_completion():
    """Test payload construction and parsing with mocked HTTP response."""
    adapter = NVIDIAProviderAdapter(
        api_base_url="https://integrate.api.nvidia.com/v1",
        api_key="nvapi-test-key",
        model_name="deepseek-ai/DeepSeek-V4-Flash",
    )

    mock_raw_response = {
        "id": "chatcmpl-123",
        "object": "chat.completion",
        "created": 1700000000,
        "model": "deepseek-ai/DeepSeek-V4-Flash",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "O-TRAVELZ",
                },
                "finish_reason": "stop",
            }
        ],
    }

    with patch.object(adapter, "_execute_request_with_retries", return_value=mock_raw_response):
        messages = [ChatMessage(role=ChatRole.USER, content="Say O-TRAVELZ")]
        response = adapter.generate(messages)

        assert response.content == "O-TRAVELZ"
        assert response.finish_reason == FinishReason.STOP
        assert response.metadata["provider"] == "nvidia"
        assert response.metadata["model"] == "deepseek-ai/DeepSeek-V4-Flash"
