"""Unit tests for Groq AI Provider Adapter and capability-driven multimodal routing."""
import json
from unittest.mock import MagicMock, patch
import pytest

from app.ai.adapter import (
    GroqProviderAdapter,
    create_provider_adapter,
    MultiProviderFallbackAdapter,
    RuleBasedProviderAdapter,
)
from app.ai.contracts import (
    AdapterResponse,
    ChatMessage,
    ChatRole,
    FinishReason,
    MissingConfigurationError,
    UnsupportedCapabilityError,
)
from app.core.config import Settings


def test_groq_adapter_registration_and_status():
    adapter = GroqProviderAdapter(
        api_key="gsk_sample_secret_key_12345",
        model_name="llama-3.3-70b-versatile",
        vision_model_name="llama-3.2-11b-vision-preview",
    )
    status = adapter.get_status()
    assert status["provider"] == "groq"
    assert status["model"] == "llama-3.3-70b-versatile"
    assert status["configured"] is True
    assert status["available"] is True
    # Secret safety check: key must never be present in status
    assert "gsk_sample_secret_key" not in json.dumps(status)
    assert status["vision_model"] == "llama-3.2-11b-vision-preview"


def test_groq_adapter_missing_key_resilience():
    adapter = GroqProviderAdapter(api_key=None)
    status = adapter.get_status()
    assert status["available"] is False
    with pytest.raises(MissingConfigurationError) as exc_info:
        adapter.generate([ChatMessage(role=ChatRole.USER, content="Hello")])
    assert exc_info.value.provider == "groq"
    assert "key" in exc_info.value.message.lower()


def test_groq_adapter_text_generation_mocked():
    adapter = GroqProviderAdapter(
        api_key="gsk_test_mock_key",
        model_name="llama-3.3-70b-versatile",
    )

    mock_resp_payload = {
        "id": "chatcmpl-test-123",
        "object": "chat.completion",
        "created": 1700000000,
        "model": "llama-3.3-70b-versatile",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "Bhubaneswar is known as the Temple City of India.",
                },
                "finish_reason": "stop",
            }
        ],
    }

    with patch.object(adapter, "_execute_request_with_retries", return_value=mock_resp_payload):
        resp = adapter.generate([
            ChatMessage(role=ChatRole.USER, content="Tell me about Bhubaneswar.")
        ])
        assert isinstance(resp, AdapterResponse)
        assert "Temple City" in (resp.content or "")
        assert resp.finish_reason == FinishReason.STOP
        assert resp.metadata["provider"] == "groq"


def test_groq_adapter_vision_routing_success():
    adapter = GroqProviderAdapter(
        api_key="gsk_test_mock_key",
        model_name="llama-3.3-70b-versatile",
        vision_model_name="llama-3.2-11b-vision-preview",
    )

    mock_resp_payload = {
        "id": "chatcmpl-vision-123",
        "object": "chat.completion",
        "model": "llama-3.2-11b-vision-preview",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "This image displays the stone chariot wheel of Konark Sun Temple.",
                },
                "finish_reason": "stop",
            }
        ],
    }

    with patch.object(adapter, "_execute_request_with_retries", return_value=mock_resp_payload) as mock_exec:
        msg = ChatMessage(
            role=ChatRole.USER,
            content="What landmark is this?",
            image_urls=["https://example.com/konark.jpg"],
        )
        resp = adapter.generate([msg])
        assert "Konark Sun Temple" in (resp.content or "")
        # Confirm model routed to vision model
        call_args = mock_exec.call_args
        payload = call_args[0][1]
        assert payload["model"] == "llama-3.2-11b-vision-preview"
        assert payload["messages"][0]["content"][1]["type"] == "image_url"


def test_groq_adapter_vision_unsupported_model_fails_cleanly():
    # Adapter configured with text model and no vision model available
    adapter = GroqProviderAdapter(
        api_key="gsk_test_mock_key",
        model_name="llama-3.1-8b-instant",
        vision_model_name="llama-3.1-8b-instant",  # Not vision-capable
    )

    msg = ChatMessage(
        role=ChatRole.USER,
        content="Describe this picture",
        image_urls=["https://example.com/image.jpg"],
    )

    with pytest.raises(UnsupportedCapabilityError) as exc_info:
        adapter.generate([msg])
    assert "multimodal vision" in exc_info.value.message.lower() or "vision-capable" in exc_info.value.message.lower()


def test_groq_factory_creation():
    settings = Settings(
        ai_provider="groq",
        ai_allow_external_provider=True,
        ai_groq_api_key="gsk_mock_factory_key",
        ai_groq_model_name="llama-3.3-70b-versatile",
    )
    adapter = create_provider_adapter(settings)
    assert isinstance(adapter, MultiProviderFallbackAdapter)
    status = adapter.get_status()
    assert status["provider"] == "multi_provider"
    assert status["allow_external_provider"] is True
