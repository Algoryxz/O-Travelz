"""Comprehensive unit and integration tests for Phase 12 Step 6:
Provider-neutral AI adapter, configuration boundary, error normalization,
security boundary, untrusted output handling, and secret masking.
"""
from __future__ import annotations

import io
import json
import logging
import urllib.error
import urllib.request
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.ai.adapter import (
    AIProviderAdapter,
    GenericHTTPProviderAdapter,
    MockProviderAdapter,
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
    ProviderErrorCode,
    ProviderTimeoutError,
    ProviderUnavailableError,
    RateLimitExceededError,
    ToolCall,
    ToolDefinition,
    ToolResult,
    ToolStatus,
    UnsupportedCapabilityError,
)
from app.ai.conversation import GroundedConversationOrchestrator
from app.ai.registry import ToolRegistry
from app.ai.schemas import AIStatus
from app.ai.tools.adapters import create_default_tool_registry
from app.core.config import Settings, settings
from app.main import app
from app.services.itinerary import ItineraryService
from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
from app.transport.adapters.walking import Coordinate



@pytest.fixture
def mock_places():
    return [
        type(
            "MockPlace",
            (),
            {
                "id": f"p{i}",
                "name": f"Place {i}",
                "district": "Puri",
                "category_id": "temple",
                "latitude": 20.2 + i * 0.01,
                "longitude": 85.8 + i * 0.01,
                "interests": [type("Int", (), {"name": "heritage", "canonical_name": "heritage"})()],
                "category": type("Cat", (), {"name": "temple", "canonical_name": "temple"})(),
                "description": f"Test place {i}",
                "is_medical": False,
                "is_transit": False,
                "contact_phone": None,
                "emergency_phone": None,
                "address": f"Address {i}",
                "verification_status": "verified",
                "source": "official_dataset",
            },
        )()
        for i in range(1, 10)
    ]


class MockPlacesDB:
    def __init__(self, places: list):
        self._places = places

    def query(self, *args, **kwargs):
        return self

    def join(self, *args, **kwargs):
        return self

    def options(self, *args, **kwargs):
        return self

    def filter(self, *args, **kwargs):
        return self

    def all(self):
        return self._places


class MockTransport:
    def plan_transport_hop(self, args: Any):
        from app.schemas.transport import DataTier, TransportHopContract

        return TransportHopContract(
            from_sequence=0,
            to_sequence=1,
            mode="walk",
            estimated_minutes=10,
            estimated_cost=None,
            legs=[{"mode": "walk", "detail": "Walking"}],
            data_tier=DataTier.STATIC,
        )

    def get_provider_status(self, args: Any):
        from app.schemas.transport import DataTier, ProviderStatusContract

        return ProviderStatusContract(
            provider_id="ama-bus",
            data_tier=DataTier.STATIC,
            notes="Operational",
        )


@pytest.fixture
def test_registry(mock_places) -> ToolRegistry:
    verified_places = [
        VerifiedPlace(
            database_id=p.id,
            category_id=p.category_id,
            name=p.name,
            coordinate=Coordinate(p.latitude, p.longitude),
            interests=("heritage",),
        )
        for p in mock_places
    ]
    repo = InMemoryPlaceRepository(verified_places)
    transport = MockTransport()
    itinerary = ItineraryService(repo, transport)
    db = MockPlacesDB(mock_places)
    return create_default_tool_registry(db, itinerary, transport)


@pytest.fixture
def test_boundary(test_registry: ToolRegistry) -> ToolExecutionBoundary:
    return ToolExecutionBoundary(test_registry)


@pytest.fixture
def test_orchestrator(test_registry: ToolRegistry, test_boundary: ToolExecutionBoundary) -> GroundedConversationOrchestrator:
    return GroundedConversationOrchestrator(
        registry=test_registry,
        boundary=test_boundary,
        provider_adapter=MockProviderAdapter(),
    )



# ==============================================================================
# 1. CONFIGURATION BOUNDARY TESTS
# ==============================================================================

class TestConfigurationBoundary:
    """Verify provider settings, safe offline defaults, and secret isolation."""

    def test_default_settings_is_safe_offline_mock(self):
        default_settings = Settings(_env_file=None)
        assert default_settings.ai_provider == "mock"
        assert default_settings.ai_model_name is None
        assert default_settings.ai_api_key is None
        assert default_settings.ai_api_base_url is None
        assert default_settings.ai_timeout_seconds == 30.0
        assert default_settings.ai_max_retries == 2

    def test_custom_environment_settings(self):
        custom_settings = Settings(
            ai_provider="openai_compatible",
            ai_model_name="local-llama",
            ai_api_key="secret-token-12345",
            ai_api_base_url="http://localhost:11434/v1",
            ai_timeout_seconds=45.0,
            ai_max_retries=3,
        )
        assert custom_settings.ai_provider == "openai_compatible"
        assert custom_settings.ai_model_name == "local-llama"
        assert custom_settings.ai_api_key == "secret-token-12345"
        assert custom_settings.ai_api_base_url == "http://localhost:11434/v1"
        assert custom_settings.ai_timeout_seconds == 45.0
        assert custom_settings.ai_max_retries == 3


# ==============================================================================
# 2. PROVIDER FACTORY TESTS
# ==============================================================================

class TestProviderFactory:
    """Verify provider adapter factory resolution and safe offline fallbacks."""

    def test_factory_resolves_mock_adapter(self):
        custom_settings = Settings(ai_provider="mock")
        adapter = create_provider_adapter(custom_settings)
        assert isinstance(adapter, MockProviderAdapter)
        status = adapter.get_status()
        assert status["provider"] == "mock"
        assert status["is_offline"] is True

    def test_factory_resolves_rule_based_adapter(self):
        custom_settings = Settings(ai_provider="rule_based")
        adapter = create_provider_adapter(custom_settings)
        assert isinstance(adapter, RuleBasedProviderAdapter)
        status = adapter.get_status()
        assert status["provider"] == "rule_based"
        assert status["is_offline"] is True

    def test_factory_resolves_openai_compatible_adapter(self):
        custom_settings = Settings(
            ai_provider="openai_compatible",
            ai_api_base_url="http://localhost:8080/v1",
            ai_model_name="mistral-7b",
            ai_api_key="sk-test-secret-12345",
        )
        adapter = create_provider_adapter(custom_settings)
        assert isinstance(adapter, GenericHTTPProviderAdapter)
        status = adapter.get_status()
        assert status["provider"] == "openai_compatible"
        assert status["model"] == "mistral-7b"
        assert status["configured"] is True
        assert status["available"] is True
        assert status["is_offline"] is False

    def test_factory_custom_provider_raises_missing_config(self):
        custom_settings = Settings(ai_provider="custom")
        with pytest.raises(MissingConfigurationError) as exc_info:
            create_provider_adapter(custom_settings)
        assert "Custom AI provider is not configured" in str(exc_info.value)
        assert exc_info.value.code == ProviderErrorCode.MISSING_CONFIGURATION

    def test_factory_unknown_provider_raises_unsupported_capability(self):
        custom_settings = Settings(ai_provider="unsupported_vendor_xyz")
        with pytest.raises(UnsupportedCapabilityError) as exc_info:
            create_provider_adapter(custom_settings)
        assert "Unsupported AI provider: 'unsupported_vendor_xyz'" in str(exc_info.value)
        assert exc_info.value.code == ProviderErrorCode.UNSUPPORTED_CAPABILITY


# ==============================================================================
# 3. ADAPTER STATUS & SECRET ISOLATION
# ==============================================================================

class TestAdapterStatusAndSecretIsolation:
    """Verify get_status() returns required operational metadata without leaking secrets."""

    def test_mock_status_never_exposes_secrets(self):
        adapter = MockProviderAdapter()
        status = adapter.get_status()
        assert "api_key" not in status
        assert "authorization" not in status
        assert "secret" not in status
        assert status["provider"] == "mock"

    def test_http_status_never_exposes_api_key(self):
        adapter = GenericHTTPProviderAdapter(
            api_base_url="https://api.example.com/v1",
            api_key="sk-super-secret-production-key-99999",
            model_name="test-model",
        )
        status = adapter.get_status()
        assert status["provider"] == "openai_compatible"
        assert status["model"] == "test-model"
        assert status["configured"] is True
        assert status["available"] is True

        # Assert no credential values or keys exist in status dictionary
        status_str = json.dumps(status)
        assert "sk-super-secret" not in status_str
        assert "api_key" not in status
        assert "authorization" not in status
        assert "token" not in status


# ==============================================================================
# 4. GENERIC HTTP PROVIDER ADAPTER TESTS
# ==============================================================================

class TestGenericHTTPProviderAdapter:
    """Verify standard HTTP request formation, response parsing, tool call parsing, and retries."""

    def test_missing_base_url_raises_missing_configuration(self):
        adapter = GenericHTTPProviderAdapter(api_base_url=None)
        messages = [ChatMessage(role=ChatRole.USER, content="Hello")]
        with pytest.raises(MissingConfigurationError) as exc_info:
            adapter.generate(messages)
        assert exc_info.value.code == ProviderErrorCode.MISSING_CONFIGURATION

    def test_successful_text_generation(self):
        adapter = GenericHTTPProviderAdapter(
            api_base_url="https://api.example.com/v1",
            api_key="secret-key",
            model_name="test-model",
        )
        fake_response_body = json.dumps({
            "id": "chatcmpl-123",
            "model": "test-model",
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "Discover the heritage of Puri and Konark.",
                    },
                    "finish_reason": "stop",
                }
            ],
        }).encode("utf-8")

        mock_resp = MagicMock()
        mock_resp.read.return_value = fake_response_body
        mock_resp.getcode.return_value = 200
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp) as mock_urlopen:
            messages = [ChatMessage(role=ChatRole.USER, content="Tell me about Puri")]
            res = adapter.generate(messages)

            assert isinstance(res, AdapterResponse)
            assert res.content == "Discover the heritage of Puri and Konark."
            assert res.tool_calls == []
            assert res.finish_reason == FinishReason.STOP
            assert res.metadata["provider"] == "openai_compatible"
            assert res.metadata["model"] == "test-model"

            # Assert request URL and headers
            req_arg = mock_urlopen.call_args[0][0]
            assert req_arg.get_full_url() == "https://api.example.com/v1/chat/completions"
            assert req_arg.get_header("Authorization") == "Bearer secret-key"
            assert req_arg.get_header("Content-type") == "application/json"

    def test_successful_tool_call_parsing_and_id_preservation(self):
        adapter = GenericHTTPProviderAdapter(
            api_base_url="https://api.example.com/v1",
            api_key="secret-key",
            model_name="test-model",
        )
        fake_response_body = json.dumps({
            "id": "chatcmpl-tool-123",
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": None,
                        "tool_calls": [
                            {
                                "id": "call_abc123456",
                                "type": "function",
                                "function": {
                                    "name": "search_places",
                                    "arguments": json.dumps({"query": "Puri Jagannath Temple", "limit": 3}),
                                },
                            }
                        ],
                    },
                    "finish_reason": "tool_calls",
                }
            ],
        }).encode("utf-8")

        mock_resp = MagicMock()
        mock_resp.read.return_value = fake_response_body
        mock_resp.getcode.return_value = 200
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            tools = [
                ToolDefinition(
                    name="search_places",
                    description="Search verified places",
                    input_schema={"type": "object", "properties": {"query": {"type": "string"}}},
                )
            ]
            messages = [ChatMessage(role=ChatRole.USER, content="Find temples in Puri")]
            res = adapter.generate(messages, tools=tools)

            assert isinstance(res, AdapterResponse)
            assert len(res.tool_calls) == 1
            tc = res.tool_calls[0]
            assert tc.id == "call_abc123456"
            assert tc.name == "search_places"
            assert tc.arguments == {"query": "Puri Jagannath Temple", "limit": 3}
            assert res.finish_reason == FinishReason.TOOL_CALLS

    def test_tool_call_without_id_generates_deterministic_fallback(self):
        adapter = GenericHTTPProviderAdapter(api_base_url="https://api.example.com/v1")
        fake_response_body = json.dumps({
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "tool_calls": [
                            {
                                "function": {
                                    "name": "build_itinerary",
                                    "arguments": {"constraints": {"days": 2}},
                                },
                            }
                        ],
                    },
                    "finish_reason": "tool_calls",
                }
            ],
        }).encode("utf-8")

        mock_resp = MagicMock()
        mock_resp.read.return_value = fake_response_body
        mock_resp.getcode.return_value = 200
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            res = adapter.generate([ChatMessage(role=ChatRole.USER, content="Plan 2 days")])
            assert len(res.tool_calls) == 1
            assert res.tool_calls[0].id.startswith("call_")
            assert res.tool_calls[0].name == "build_itinerary"


# ==============================================================================
# 5. FAILURE NORMALIZATION TESTS
# ==============================================================================

class TestFailureNormalization:
    """Verify HTTP and network error mapping into canonical exception taxonomy."""

    def test_401_403_authentication_failure(self):
        adapter = GenericHTTPProviderAdapter(api_base_url="https://api.example.com/v1", api_key="bad-key")
        http_err = urllib.error.HTTPError(
            url="https://api.example.com/v1",
            code=401,
            msg="Unauthorized",
            hdrs=MagicMock(),
            fp=io.BytesIO(b'{"error": "Invalid API key"}'),
        )
        with patch("urllib.request.urlopen", side_effect=http_err):
            with pytest.raises(AuthenticationError) as exc_info:
                adapter.generate([ChatMessage(role=ChatRole.USER, content="Test")])
            assert exc_info.value.code == ProviderErrorCode.AUTHENTICATION_FAILURE
            assert exc_info.value.status_code == 401

    def test_429_rate_limit_exceeded(self):
        adapter = GenericHTTPProviderAdapter(api_base_url="https://api.example.com/v1", max_retries=0)
        http_err = urllib.error.HTTPError(
            url="https://api.example.com/v1",
            code=429,
            msg="Too Many Requests",
            hdrs=MagicMock(),
            fp=io.BytesIO(b'{"error": "Rate limit exceeded"}'),
        )
        with patch("urllib.request.urlopen", side_effect=http_err):
            with pytest.raises(RateLimitExceededError) as exc_info:
                adapter.generate([ChatMessage(role=ChatRole.USER, content="Test")])
            assert exc_info.value.code == ProviderErrorCode.RATE_LIMIT_EXCEEDED
            assert exc_info.value.status_code == 429

    def test_timeout_normalization(self):
        adapter = GenericHTTPProviderAdapter(api_base_url="https://api.example.com/v1", max_retries=0)
        with patch("urllib.request.urlopen", side_effect=TimeoutError("Request timed out")):
            with pytest.raises(ProviderTimeoutError) as exc_info:
                adapter.generate([ChatMessage(role=ChatRole.USER, content="Test")])
            assert exc_info.value.code == ProviderErrorCode.TIMEOUT

    def test_unreachable_endpoint_normalization(self):
        adapter = GenericHTTPProviderAdapter(api_base_url="https://api.example.com/v1", max_retries=0)
        url_err = urllib.error.URLError(reason="Connection refused")
        with patch("urllib.request.urlopen", side_effect=url_err):
            with pytest.raises(ProviderUnavailableError) as exc_info:
                adapter.generate([ChatMessage(role=ChatRole.USER, content="Test")])
            assert exc_info.value.code == ProviderErrorCode.PROVIDER_UNAVAILABLE

    def test_malformed_json_response(self):
        adapter = GenericHTTPProviderAdapter(api_base_url="https://api.example.com/v1")
        mock_resp = MagicMock()
        mock_resp.read.return_value = b"<html><head><title>502 Bad Gateway</title></head></html>"
        mock_resp.getcode.return_value = 200
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            with pytest.raises(MalformedProviderResponseError) as exc_info:
                adapter.generate([ChatMessage(role=ChatRole.USER, content="Test")])
            assert exc_info.value.code == ProviderErrorCode.MALFORMED_RESPONSE

    def test_malformed_response_schema_missing_choices(self):
        adapter = GenericHTTPProviderAdapter(api_base_url="https://api.example.com/v1")
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps({"unexpected_field": 123}).encode("utf-8")
        mock_resp.getcode.return_value = 200
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            with pytest.raises(MalformedProviderResponseError) as exc_info:
                adapter.generate([ChatMessage(role=ChatRole.USER, content="Test")])
            assert exc_info.value.code == ProviderErrorCode.MALFORMED_RESPONSE

    def test_malformed_tool_call_arguments_json(self):
        adapter = GenericHTTPProviderAdapter(api_base_url="https://api.example.com/v1")
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps({
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "tool_calls": [
                            {
                                "id": "call_1",
                                "function": {
                                    "name": "search_places",
                                    "arguments": "{not_valid_json: 123",
                                },
                            }
                        ],
                    }
                }
            ]
        }).encode("utf-8")
        mock_resp.getcode.return_value = 200
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            with pytest.raises(MalformedProviderResponseError) as exc_info:
                adapter.generate([ChatMessage(role=ChatRole.USER, content="Test")])
            assert exc_info.value.code == ProviderErrorCode.MALFORMED_RESPONSE


# ==============================================================================
# 6. SECURITY & UNTRUSTED OUTPUT HANDLING TESTS
# ==============================================================================

class TestSecurityBoundary:
    """Verify strict rejection of arbitrary Python execution, eval, exec, and code injection."""

    def test_rejection_of_arbitrary_callable_names(self, test_boundary: ToolExecutionBoundary):
        dangerous_names = [
            "eval",
            "exec",
            "os.system",
            "subprocess.call",
            "subprocess.run",
            "__import__",
            "open",
            "builtins.eval",
        ]
        for name in dangerous_names:
            tc = ToolCall(name=name, arguments={"command": "dir"})
            res = test_boundary.execute(tc)
            assert res.status == ToolStatus.UNKNOWN
            assert "not recognized" in (res.reason or "")
            assert res.data is None

    def test_rejection_of_malformed_tool_arguments(self, test_boundary: ToolExecutionBoundary):
        # build_itinerary expects a dict with constraints
        tc = ToolCall(name="build_itinerary", arguments={"constraints": "not-a-valid-dict"})
        res = test_boundary.execute(tc)
        assert res.status in (ToolStatus.INVALID, ToolStatus.ERROR)
        assert res.error is not None or res.reason is not None

    def test_oversized_payload_rejected_by_orchestrator(self, test_orchestrator: GroundedConversationOrchestrator):
        huge_content = "Plan " + ("A" * 120_000)
        msg = ChatMessage(role=ChatRole.USER, content=huge_content)
        res = test_orchestrator.converse([msg])
        assert res.status == AIStatus.ERROR
        assert "exceeds maximum allowed size" in res.message


# ==============================================================================
# 7. SECRET MASKING & LOGGING SANITIZATION
# ==============================================================================

class TestSecretMasking:
    """Verify secrets and bearer tokens are never exposed in exceptions, metadata, or logs."""

    def test_exception_redacts_bearer_token(self):
        raw_msg = "Failed with Authorization: Bearer sk-live-secret-key-1234567890"
        err = AIProviderError(raw_msg)
        assert "sk-live-secret-key" not in str(err)
        assert "[REDACTED]" in str(err)

    def test_exception_redacts_api_key_parameter(self):
        raw_msg = "Invalid request with key=sk-live-1234567890abcdef"
        err = AIProviderError(raw_msg)
        assert "sk-live-1234567890abcdef" not in str(err)
        assert "[REDACTED]" in str(err)

    def test_metadata_never_contains_credentials(self):
        adapter = GenericHTTPProviderAdapter(
            api_base_url="https://api.example.com/v1",
            api_key="super-secret-key-xyz",
            model_name="test-model",
        )
        fake_response_body = json.dumps({
            "choices": [{"message": {"role": "assistant", "content": "Hello"}, "finish_reason": "stop"}],
        }).encode("utf-8")

        mock_resp = MagicMock()
        mock_resp.read.return_value = fake_response_body
        mock_resp.getcode.return_value = 200
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            res = adapter.generate([ChatMessage(role=ChatRole.USER, content="Hi")])
            meta_str = json.dumps(res.metadata)
            assert "super-secret-key-xyz" not in meta_str
            assert "api_key" not in res.metadata


# ==============================================================================
# 8. RULE-BASED ADAPTER INTEGRATION TESTS
# ==============================================================================

class TestRuleBasedProviderAdapter:
    """Verify RuleBasedProviderAdapter protocol implementation."""

    def test_rule_based_generates_tool_call_for_planning(self):
        adapter = RuleBasedProviderAdapter()
        messages = [ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri with heritage")]
        res = adapter.generate(messages)
        assert isinstance(res, AdapterResponse)
        assert res.finish_reason == FinishReason.TOOL_CALLS
        assert len(res.tool_calls) == 1
        assert res.tool_calls[0].name == "build_itinerary"

    def test_rule_based_generates_clarification_content(self):
        adapter = RuleBasedProviderAdapter()
        messages = [ChatMessage(role=ChatRole.USER, content="hello, what can you do?")]
        res = adapter.generate(messages)
        assert isinstance(res, AdapterResponse)
        assert res.finish_reason == FinishReason.STOP
        assert res.content is not None
        assert len(res.tool_calls) == 0



# ==============================================================================
# 9. HTTP ENDPOINTS BACKWARD COMPATIBILITY
# ==============================================================================

class TestHTTPAIRoutesIntegration:
    """Verify /ai/plan and /ai/converse work with provider-neutral factory and orchestrator."""

    @pytest.fixture(autouse=True)
    def setup_app_orchestrator(self):
        from app.ai.boundary import ToolExecutionBoundary
        from app.ai.conversation import GroundedConversationOrchestrator
        from app.ai.model import RuleBasedModelAdapter
        from app.ai.registry import ToolRegistry
        from app.ai.tools.adapters import (
            BuildItineraryToolAdapter,
            GetProviderStatusToolAdapter,
            PlanTransportHopToolAdapter,
        )
        from app.api.ai_routes import get_grounded_orchestrator
        from app.schemas.transport import DataTier, ProviderStatusContract, TransportHopContract
        from app.services.itinerary import ItineraryService
        from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
        from app.transport.adapters.walking import Coordinate

        class MockTransport:
            def plan_transport_hop(self, args):
                return TransportHopContract(
                    from_sequence=getattr(args, "from_sequence", 0),
                    to_sequence=getattr(args, "to_sequence", 1),
                    mode="walk",
                    estimated_minutes=15,
                    data_tier=DataTier.STATIC,
                )

            def get_provider_status(self, args):
                return ProviderStatusContract(
                    provider_id=getattr(args, "provider_id", "ama-bus"),
                    data_tier=DataTier.STATIC,
                )

        verified = [
            VerifiedPlace(
                database_id="p1",
                category_id="temple",
                name="Jagannath Temple",
                coordinate=Coordinate(19.8080, 85.8250),
                interests=("heritage", "spirituality"),
            ),
            VerifiedPlace(
                database_id="p2",
                category_id="beach",
                name="Puri Beach",
                coordinate=Coordinate(19.8010, 85.8340),
                interests=("beach", "relaxation"),
            ),
        ]
        repo = InMemoryPlaceRepository(verified)
        trans = MockTransport()
        itin_svc = ItineraryService(repo, trans)

        reg = ToolRegistry()
        reg.register(BuildItineraryToolAdapter(itin_svc))
        reg.register(PlanTransportHopToolAdapter(trans))
        reg.register(GetProviderStatusToolAdapter(trans))

        orch = GroundedConversationOrchestrator(
            registry=reg,
            boundary=ToolExecutionBoundary(reg),
            model_adapter=RuleBasedModelAdapter(),
        )
        from app.api.ai_routes import get_ai_orchestrator, get_grounded_orchestrator

        class MockAIOrchestrator:
            def __init__(self, o):
                self.o = o
            def orchestrate(self, message, constraints=None):
                return self.o.plan_with_ai(message, constraints)

        app.dependency_overrides[get_ai_orchestrator] = lambda: MockAIOrchestrator(orch)
        app.dependency_overrides[get_grounded_orchestrator] = lambda: orch
        yield
        app.dependency_overrides.clear()

    def test_ai_plan_endpoint(self):
        client = TestClient(app)
        res = client.post("/ai/plan", json={"message": "Plan 2 days in Puri with temples"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["itinerary"] is not None
        assert len(data["itinerary"]["days"]) == 2

    def test_ai_converse_endpoint(self):
        client = TestClient(app)
        res = client.post(
            "/ai/converse",
            json={
                "messages": [{"role": "user", "content": "Plan a 2 day trip to Puri"}],
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["itinerary"] is not None
        assert data["is_grounded"] is True
        assert data["language"] == "en"
