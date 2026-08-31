"""Provider-neutral AI adapter interface, generic HTTP adapter, and adapter factory.

Enables future AI providers (Azure OpenAI, Google Gemini, NVIDIA, OpenAI, Local) to plug into
O-Travelz without coupling the domain architecture to any proprietary vendor SDK.
All implementations enforce strict secret masking, zero-cost budget guards, and offline deterministic fallbacks.
"""
from __future__ import annotations

import json
import logging
import re
import time
import urllib.error
import urllib.request
from abc import ABC, abstractmethod
from typing import Any, Callable
from uuid import uuid4

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
    UnsupportedCapabilityError,
)
from app.ai.routing import ProviderCapabilities, TaskRouter, TaskType
from app.ai.telemetry import ai_telemetry
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIProviderAdapter(ABC):
    """Abstract protocol for pluggable, provider-neutral AI backends."""

    capabilities: ProviderCapabilities = ProviderCapabilities()

    @abstractmethod
    def generate(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDefinition] | None = None,
        **kwargs: Any,
    ) -> AdapterResponse:
        """Generate a response or request tool calls from the model."""
        raise NotImplementedError

    @abstractmethod
    def get_status(self) -> dict[str, Any]:
        """Return diagnostic status metadata without exposing secrets."""
        raise NotImplementedError


class MockProviderAdapter(AIProviderAdapter):
    """Deterministic, offline provider adapter for unit testing and local simulation."""

    capabilities: ProviderCapabilities = ProviderCapabilities(
        text=True,
        vision=True,
        tools=True,
        structured_output=True,
        multilingual=True,
        complex_reasoning=True,
        fast_inference=True,
    )

    def __init__(
        self,
        default_response: str = "I can assist you with discovering Odisha travel destinations.",
        canned_tool_calls: list[ToolCall] | None = None,
        custom_handler: Callable[[list[ChatMessage], list[ToolDefinition] | None], AdapterResponse] | None = None,
    ) -> None:
        self.default_response = default_response
        self.canned_tool_calls = canned_tool_calls or []
        self.custom_handler = custom_handler
        self.call_history: list[list[ChatMessage]] = []

    def generate(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDefinition] | None = None,
        **kwargs: Any,
    ) -> AdapterResponse:
        self.call_history.append(messages)

        if self.custom_handler is not None:
            return self.custom_handler(messages, tools)

        if self.canned_tool_calls:
            return AdapterResponse(
                content=None,
                tool_calls=self.canned_tool_calls,
                finish_reason=FinishReason.TOOL_CALLS,
                metadata={"provider": "mock", "tool_count": len(self.canned_tool_calls)},
            )

        # Inspect last user message for basic keyword-based mock tool triggers
        last_user_msg = next(
            (m.content for m in reversed(messages) if m.role == ChatRole.USER and m.content),
            "",
        )
        lower_msg = last_user_msg.lower() if last_user_msg else ""

        # Deterministic simulation: If user asks for places, emit search_places tool call
        if "place" in lower_msg or "puri" in lower_msg or "temple" in lower_msg:
            return AdapterResponse(
                content=None,
                tool_calls=[
                    ToolCall(
                        id=f"call_{uuid4().hex[:8]}",
                        name="search_places",
                        arguments={"query": "Puri", "limit": 5},
                    )
                ],
                finish_reason=FinishReason.TOOL_CALLS,
                metadata={"provider": "mock", "simulated": True},
            )

        return AdapterResponse(
            content=self.default_response,
            tool_calls=[],
            finish_reason=FinishReason.STOP,
            metadata={"provider": "mock"},
        )

    def get_status(self) -> dict[str, Any]:
        return {
            "provider": "mock",
            "model": "deterministic-offline-mock",
            "configured": True,
            "available": True,
            "is_offline": True,
        }


class RuleBasedProviderAdapter(AIProviderAdapter):
    """Deterministic offline rule-based adapter for Odisha trip planning."""

    capabilities: ProviderCapabilities = ProviderCapabilities(
        text=True,
        vision=False,
        tools=False,
        structured_output=True,
        multilingual=True,
        complex_reasoning=False,
        fast_inference=True,
    )

    def __init__(self) -> None:
        pass


    def generate(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDefinition] | None = None,
        **kwargs: Any,
    ) -> AdapterResponse:
        from app.ai.multilingual import (
            detect_language,
            extract_multilingual_days,
            extract_multilingual_interests,
            resolve_multilingual_location,
        )

        last_user_msg = next(
            (m.content for m in reversed(messages) if m.role == ChatRole.USER and m.content),
            "",
        )

        lang = detect_language(last_user_msg)
        days = extract_multilingual_days(last_user_msg) or 2
        interests = extract_multilingual_interests(last_user_msg)
        location = resolve_multilingual_location(last_user_msg) or "Bhubaneswar"

        lower_msg = last_user_msg.lower()

        is_planning = any(
            w in lower_msg
            for w in [
                "plan",
                "trip",
                "itinerary",
                "visit",
                "tour",
                "day",
                "days",
                "ଯାତ୍ରା",
                "ଯୋଜନା",
                "ଦିନ",
                "ପ୍ଲାନ",
                "दिन",
                "यात्रा",
                "टूर",
            ]
        )

        # If planning query and build_itinerary is available (or tools is None), emit canonical tool call
        available_tool_names = [t.name for t in (tools or [])] if tools is not None else ["build_itinerary"]
        if is_planning and "build_itinerary" in available_tool_names:
            constraints: dict[str, Any] = {
                "days": days,
                "start": location,
            }
            if interests:
                constraints["interests"] = interests

            return AdapterResponse(
                content=None,
                tool_calls=[
                    ToolCall(
                        id=f"call_{uuid4().hex[:8]}",
                        name="build_itinerary",
                        arguments={"constraints": constraints},
                    )
                ],
                finish_reason=FinishReason.TOOL_CALLS,
                metadata={"provider": "rule_based", "language": lang},
            )

        # Fallback text response for non-planning or clarification queries
        if lang == "or":
            text = f"ଆପଣଙ୍କୁ ଓଡ଼ିଶା ଭ୍ରମଣ ଯୋଜନାରେ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?"
        elif lang == "hi":
            text = f"मैं ओडिशा यात्रा योजना में आपकी कैसे मदद कर सकता हूँ?"
        else:
            text = "I can help you plan a customized itinerary across Odisha. Please mention your preferred destinations, number of days, or interests."


        return AdapterResponse(
            content=text,
            tool_calls=[],
            finish_reason=FinishReason.STOP,
            metadata={"provider": "rule_based", "language": lang},
        )

    def get_status(self) -> dict[str, Any]:
        return {
            "provider": "rule_based",
            "model": "deterministic-odisha-rules",
            "configured": True,
            "available": True,
            "is_offline": True,
        }


class GenericHTTPProviderAdapter(AIProviderAdapter):
    """Provider-neutral HTTP REST adapter for OpenAI-compatible LLM endpoints.

    Uses Python standard library (urllib) to avoid vendor SDK dependencies.
    Enforces strict timeouts, retry safety, secret masking, and canonical error mapping.
    """

    capabilities: ProviderCapabilities = ProviderCapabilities(
        text=True,
        vision=False,
        tools=True,
        structured_output=True,
        multilingual=True,
        complex_reasoning=True,
        fast_inference=True,
    )

    def __init__(
        self,
        api_base_url: str | None = None,
        api_key: str | None = None,
        model_name: str | None = None,
        timeout_seconds: float = 30.0,
        max_retries: int = 2,
        provider_identifier: str = "openai_compatible",
    ) -> None:
        self.api_base_url = api_base_url.rstrip("/") if api_base_url else None
        self._api_key = api_key
        self.model_name = model_name or "gpt-4o-mini"
        self.timeout_seconds = max(1.0, float(timeout_seconds))
        self.max_retries = max(0, int(max_retries))
        self.provider_identifier = provider_identifier

    def get_status(self) -> dict[str, Any]:
        """Return diagnostic status metadata with zero credential leakage."""
        return {
            "provider": self.provider_identifier,
            "model": self.model_name,
            "configured": bool(self.api_base_url),
            "available": bool(self.api_base_url and self._api_key),
            "timeout_seconds": self.timeout_seconds,
            "max_retries": self.max_retries,
            "is_offline": False,
        }

    def generate(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDefinition] | None = None,
        **kwargs: Any,
    ) -> AdapterResponse:
        if not self.api_base_url:
            raise MissingConfigurationError(
                f"AI provider base URL is not configured for {self.provider_identifier}.",
                provider=self.provider_identifier,
            )

        payload = self._build_payload(messages, tools, **kwargs)
        endpoint_url = self._resolve_endpoint_url()
        timeout_seconds = kwargs.get("timeout_seconds")

        raw_response = self._execute_request_with_retries(endpoint_url, payload, timeout_seconds=timeout_seconds)
        return self._parse_response(raw_response)

    def _resolve_endpoint_url(self) -> str:
        base = self.api_base_url or ""
        if base.endswith("/chat/completions"):
            return base
        return f"{base}/chat/completions"

    def _build_payload(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDefinition] | None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        formatted_messages: list[dict[str, Any]] = []
        for msg in messages:
            item: dict[str, Any] = {
                "role": msg.role.value if hasattr(msg.role, "value") else str(msg.role),
            }
            if getattr(msg, "image_urls", None):
                parts: list[dict[str, Any]] = []
                if msg.content:
                    parts.append({"type": "text", "text": msg.content})
                for url in msg.image_urls:
                    parts.append({"type": "image_url", "image_url": {"url": url}})
                item["content"] = parts
            elif msg.content is not None:
                item["content"] = msg.content
            if msg.tool_call_id:
                item["tool_call_id"] = msg.tool_call_id
            if msg.name:
                item["name"] = msg.name
            if msg.tool_calls:
                item["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.name,
                            "arguments": json.dumps(tc.arguments) if isinstance(tc.arguments, dict) else str(tc.arguments),
                        },
                    }
                    for tc in msg.tool_calls
                ]
            formatted_messages.append(item)

        payload: dict[str, Any] = {
            "model": kwargs.get("model_name") or self.model_name,
            "messages": formatted_messages,
        }

        if tools:
            payload["tools"] = [
                {
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": tool.input_schema,
                    },
                }
                for tool in tools
            ]
            payload["tool_choice"] = "auto"

        if "temperature" in kwargs:
            payload["temperature"] = kwargs["temperature"]
        if "max_tokens" in kwargs:
            payload["max_tokens"] = kwargs["max_tokens"]
        elif "max_completion_tokens" in kwargs:
            payload["max_completion_tokens"] = kwargs["max_completion_tokens"]
        if "response_format" in kwargs:
            payload["response_format"] = kwargs["response_format"]

        return payload

    def _get_headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"
        return headers

    def _execute_request_with_retries(
        self,
        endpoint_url: str,
        payload: dict[str, Any],
        timeout_seconds: Optional[float] = None,
    ) -> dict[str, Any]:
        encoded_data = json.dumps(payload).encode("utf-8")
        headers = self._get_headers()
        effective_timeout = max(0.5, float(timeout_seconds if timeout_seconds is not None else self.timeout_seconds))

        attempts = 0
        max_attempts = 1 + self.max_retries

        while attempts < max_attempts:
            attempts += 1
            req = urllib.request.Request(
                endpoint_url,
                data=encoded_data,
                headers=headers,
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=effective_timeout) as response:
                    resp_bytes = response.read()
                    if len(resp_bytes) > 500_000:
                        raise MalformedProviderResponseError(
                            "AI provider response payload exceeds maximum safe size (500KB).",
                            provider=self.provider_identifier,
                        )
                    try:
                        return json.loads(resp_bytes.decode("utf-8"))
                    except Exception as json_err:
                        raise MalformedProviderResponseError(
                            "AI provider returned non-JSON response payload.",
                            provider=self.provider_identifier,
                        ) from json_err


            except urllib.error.HTTPError as http_err:
                code = http_err.code
                if code in (401, 403):
                    raise AuthenticationError(
                        f"AI provider authentication failed (HTTP {code}).",
                        provider=self.provider_identifier,
                        status_code=code,
                    ) from http_err
                if code == 429:
                    if attempts < max_attempts:
                        time.sleep(0.5 * attempts)
                        continue
                    raise RateLimitExceededError(
                        "AI provider rate limit exceeded (HTTP 429).",
                        provider=self.provider_identifier,
                        status_code=code,
                    ) from http_err
                if code in (500, 502, 503, 504):
                    if attempts < max_attempts:
                        time.sleep(0.5 * attempts)
                        continue
                    raise ProviderUnavailableError(
                        f"AI provider endpoint unavailable (HTTP {code}).",
                        provider=self.provider_identifier,
                        status_code=code,
                    ) from http_err

                raise ProviderUnavailableError(
                    f"AI provider returned HTTP error {code}.",
                    provider=self.provider_identifier,
                    status_code=code,
                ) from http_err

            except (urllib.error.URLError, TimeoutError, OSError) as net_err:
                if isinstance(net_err, TimeoutError) or "timed out" in str(net_err).lower():
                    if attempts < max_attempts:
                        time.sleep(0.5 * attempts)
                        continue
                    raise ProviderTimeoutError(
                        f"AI provider request timed out after {self.timeout_seconds}s.",
                        provider=self.provider_identifier,
                    ) from net_err

                if attempts < max_attempts:
                    time.sleep(0.5 * attempts)
                    continue
                raise ProviderUnavailableError(
                    "AI provider endpoint is unreachable.",
                    provider=self.provider_identifier,
                ) from net_err

        raise ProviderUnavailableError(
            "AI provider request failed after maximum retries.",
            provider=self.provider_identifier,
        )

    def _parse_response(self, data: dict[str, Any]) -> AdapterResponse:
        if not isinstance(data, dict):
            raise MalformedProviderResponseError(
                "Invalid response schema from AI provider: Root must be a dictionary.",
                provider=self.provider_identifier,
            )

        choices = data.get("choices")
        if not isinstance(choices, list) or len(choices) == 0:
            raise MalformedProviderResponseError(
                "Invalid response schema from AI provider: Missing or empty 'choices' list.",
                provider=self.provider_identifier,
            )

        choice = choices[0]
        if not isinstance(choice, dict):
            raise MalformedProviderResponseError(
                "Invalid response schema from AI provider: 'choices[0]' must be a dictionary.",
                provider=self.provider_identifier,
            )

        message_obj = choice.get("message", {})
        content = message_obj.get("content")

        tool_calls: list[ToolCall] = []
        raw_tool_calls = message_obj.get("tool_calls")
        if isinstance(raw_tool_calls, list):
            for tc in raw_tool_calls:
                if not isinstance(tc, dict):
                    continue
                tc_id = tc.get("id") or f"call_{uuid4().hex[:8]}"
                fn_obj = tc.get("function", {})
                fn_name = fn_obj.get("name", "unknown")
                raw_args = fn_obj.get("arguments", "{}")

                if isinstance(raw_args, str):
                    try:
                        parsed_args = json.loads(raw_args)
                    except Exception as json_err:
                        raise MalformedProviderResponseError(
                            "Tool call arguments must be valid JSON.",
                            provider=self.provider_identifier,
                        ) from json_err
                elif isinstance(raw_args, dict):
                    parsed_args = raw_args
                else:
                    parsed_args = {}

                tool_calls.append(ToolCall(id=tc_id, name=fn_name, arguments=parsed_args))


        raw_finish = choice.get("finish_reason")
        if raw_finish == "tool_calls" or (tool_calls and raw_finish in (None, "stop")):
            finish_reason = FinishReason.TOOL_CALLS
        elif raw_finish == "length":
            finish_reason = FinishReason.LENGTH
        elif raw_finish == "error":
            finish_reason = FinishReason.ERROR
        else:
            finish_reason = FinishReason.STOP

        return AdapterResponse(
            content=content,
            tool_calls=tool_calls,
            finish_reason=finish_reason,
            metadata={
                "provider": self.provider_identifier,
                "model": data.get("model", self.model_name),
                "id": data.get("id"),
            },
        )


class AzureOpenAIProviderAdapter(GenericHTTPProviderAdapter):
    """Provider adapter for Microsoft Azure OpenAI Service.

    Supports configurable Azure endpoints, deployments, api-versions,
    and api-key authentication headers with zero vendor SDK requirements.
    """

    capabilities: ProviderCapabilities = ProviderCapabilities(
        text=True,
        vision=True,
        tools=True,
        structured_output=True,
        multilingual=True,
        complex_reasoning=True,
        fast_inference=True,
    )

    def __init__(
        self,
        api_base_url: str | None = None,
        api_key: str | None = None,
        deployment_name: str | None = None,
        api_version: str = "2024-12-01-preview",
        timeout_seconds: float = 30.0,
        max_retries: int = 2,
    ) -> None:
        super().__init__(
            api_base_url=api_base_url,
            api_key=api_key,
            model_name=deployment_name or "gpt-5-mini",
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
            provider_identifier="azure_openai",
        )
        self.deployment_name = deployment_name or "gpt-5-mini"
        self.api_version = api_version

    def _resolve_endpoint_url(self) -> str:
        base = self.api_base_url or ""
        if "openai/deployments" in base:
            sep = "&" if "?" in base else "?"
            return f"{base}{sep}api-version={self.api_version}"
        return f"{base}/openai/deployments/{self.deployment_name}/chat/completions?api-version={self.api_version}"

    def _get_headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self._api_key:
            headers["api-key"] = self._api_key
        return headers

    def get_status(self) -> dict[str, Any]:
        status = super().get_status()
        status["deployment_name"] = self.deployment_name
        status["api_version"] = self.api_version
        return status


class GeminiProviderAdapter(AIProviderAdapter):
    """Provider adapter for Google Gemini REST API.

    Translates canonical ChatMessage and ToolDefinition contracts into Google Gemini
    generateContent schemas using Python standard library (urllib).
    """

    capabilities: ProviderCapabilities = ProviderCapabilities(
        text=True,
        vision=True,
        tools=True,
        structured_output=True,
        multilingual=True,
        complex_reasoning=True,
        fast_inference=True,
    )


    def __init__(
        self,
        api_base_url: str | None = None,
        api_key: str | None = None,
        model_name: str | None = None,
        timeout_seconds: float = 30.0,
        max_retries: int = 2,
    ) -> None:
        self.api_base_url = (api_base_url or "https://generativelanguage.googleapis.com/v1beta").rstrip("/")
        self._api_key = api_key
        self.model_name = model_name or "gemini-1.5-flash"
        self.timeout_seconds = max(1.0, float(timeout_seconds))
        self.max_retries = max(0, int(max_retries))
        self.provider_identifier = "gemini"

    def get_status(self) -> dict[str, Any]:
        return {
            "provider": self.provider_identifier,
            "model": self.model_name,
            "configured": bool(self.api_base_url),
            "available": bool(self.api_base_url and self._api_key),
            "timeout_seconds": self.timeout_seconds,
            "max_retries": self.max_retries,
            "is_offline": False,
        }

    def _resolve_endpoint_url(self) -> str:
        return f"{self.api_base_url}/models/{self.model_name}:generateContent"

    def _get_headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self._api_key:
            headers["x-goog-api-key"] = self._api_key
        return headers

    def _build_payload(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDefinition] | None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        contents: list[dict[str, Any]] = []
        for msg in messages:
            role = "user" if msg.role == ChatRole.USER else "model"
            parts: list[dict[str, Any]] = []
            if msg.content:
                parts.append({"text": msg.content})
            if getattr(msg, "image_urls", None):
                for img_url in msg.image_urls:
                    if img_url.startswith("data:") and ";base64," in img_url:
                        mime_part, b64_data = img_url.split(";base64,", 1)
                        mime_type = mime_part.replace("data:", "").strip()
                        parts.append({
                            "inlineData": {
                                "mimeType": mime_type or "image/jpeg",
                                "data": b64_data,
                            }
                        })
                    else:
                        parts.append({
                            "inlineData": {
                                "mimeType": "image/jpeg",
                                "data": img_url,
                            }
                        })
            if msg.tool_calls:
                for tc in msg.tool_calls:
                    parts.append({
                        "functionCall": {
                            "name": tc.name,
                            "args": tc.arguments,
                        }
                    })
            if parts:
                contents.append({"role": role, "parts": parts})

        payload: dict[str, Any] = {"contents": contents}

        if tools:
            function_declarations = [
                {
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.input_schema,
                }
                for t in tools
            ]
            payload["tools"] = [{"functionDeclarations": function_declarations}]

        return payload

    def generate(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDefinition] | None = None,
        **kwargs: Any,
    ) -> AdapterResponse:
        if not self._api_key:
            raise MissingConfigurationError(
                "Gemini API key is not configured.",
                provider=self.provider_identifier,
            )

        payload = self._build_payload(messages, tools, **kwargs)
        endpoint_url = self._resolve_endpoint_url()
        headers = self._get_headers()
        encoded_data = json.dumps(payload).encode("utf-8")

        attempts = 0
        max_attempts = 1 + self.max_retries
        effective_timeout = max(0.5, float(kwargs.get("timeout_seconds") or self.timeout_seconds))

        while attempts < max_attempts:
            attempts += 1
            req = urllib.request.Request(
                endpoint_url,
                data=encoded_data,
                headers=headers,
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=effective_timeout) as response:
                    resp_bytes = response.read()
                    if len(resp_bytes) > 500_000:
                        raise MalformedProviderResponseError(
                            "Gemini response payload exceeds maximum safe size (500KB).",
                            provider=self.provider_identifier,
                        )
                    try:
                        data = json.loads(resp_bytes.decode("utf-8"))
                        return self._parse_gemini_response(data)
                    except AIProviderError:
                        raise
                    except Exception as json_err:
                        raise MalformedProviderResponseError(
                            "Gemini returned non-JSON or invalid response payload.",
                            provider=self.provider_identifier,
                        ) from json_err


            except urllib.error.HTTPError as http_err:
                code = http_err.code
                if code in (401, 403):
                    raise AuthenticationError(
                        f"Gemini authentication failed (HTTP {code}).",
                        provider=self.provider_identifier,
                    ) from http_err
                if code == 429:
                    if attempts < max_attempts:
                        time.sleep(0.5 * attempts)
                        continue
                    raise RateLimitExceededError(
                        "Gemini rate limit exceeded (HTTP 429).",
                        provider=self.provider_identifier,
                    ) from http_err
                if code in (500, 502, 503, 504):
                    if attempts < max_attempts:
                        time.sleep(0.5 * attempts)
                        continue
                    raise ProviderUnavailableError(
                        f"Gemini service unavailable (HTTP {code}).",
                        provider=self.provider_identifier,
                    ) from http_err

                raise ProviderUnavailableError(
                    f"Gemini returned HTTP error {code}.",
                    provider=self.provider_identifier,
                ) from http_err

            except (urllib.error.URLError, TimeoutError, OSError) as net_err:
                if isinstance(net_err, TimeoutError) or "timed out" in str(net_err).lower():
                    if attempts < max_attempts:
                        time.sleep(0.5 * attempts)
                        continue
                    raise ProviderTimeoutError(
                        f"Gemini request timed out after {self.timeout_seconds}s.",
                        provider=self.provider_identifier,
                    ) from net_err

                if attempts < max_attempts:
                    time.sleep(0.5 * attempts)
                    continue
                raise ProviderUnavailableError(
                    "Gemini endpoint is unreachable.",
                    provider=self.provider_identifier,
                ) from net_err

        raise ProviderUnavailableError(
            "Gemini request failed after maximum retries.",
            provider=self.provider_identifier,
        )

    def _parse_gemini_response(self, data: dict[str, Any]) -> AdapterResponse:
        if not isinstance(data, dict):
            raise MalformedProviderResponseError(
                "Gemini response root must be a dictionary.",
                provider=self.provider_identifier,
            )

        candidates = data.get("candidates")
        if not isinstance(candidates, list) or len(candidates) == 0:
            raise MalformedProviderResponseError(
                "Gemini response missing candidates list.",
                provider=self.provider_identifier,
            )

        candidate = candidates[0]
        content_obj = candidate.get("content", {})
        parts = content_obj.get("parts", [])

        text_content: str | None = None
        tool_calls: list[ToolCall] = []

        for part in parts:
            if "text" in part:
                text_content = part["text"]
            if "functionCall" in part:
                fc = part["functionCall"]
                fn_name = fc.get("name", "unknown")
                args = fc.get("args", {})
                tool_calls.append(
                    ToolCall(
                        id=f"call_{uuid4().hex[:8]}",
                        name=fn_name,
                        arguments=args if isinstance(args, dict) else {},
                    )
                )

        finish_reason = FinishReason.TOOL_CALLS if tool_calls else FinishReason.STOP

        return AdapterResponse(
            content=text_content,
            tool_calls=tool_calls,
            finish_reason=finish_reason,
            metadata={"provider": self.provider_identifier, "model": self.model_name},
        )


class NVIDIAProviderAdapter(GenericHTTPProviderAdapter):
    """Provider adapter for NVIDIA API Catalog (OpenAI-compatible inference endpoints)."""

    capabilities: ProviderCapabilities = ProviderCapabilities(
        text=True,
        vision=False,
        tools=True,
        structured_output=True,
        multilingual=True,
        complex_reasoning=True,
        fast_inference=True,
    )

    def __init__(
        self,
        api_base_url: str | None = None,
        api_key: str | None = None,
        model_name: str | None = None,
        timeout_seconds: float = 30.0,
        max_retries: int = 2,
    ) -> None:
        import os

        resolved_key = (
            api_key
            or getattr(settings, "ai_nvidia_api_key", None)
            or getattr(settings, "nvidia_api_key", None)
            or os.environ.get("NVIDIA_API_KEY")
            or os.environ.get("AI_NVIDIA_API_KEY")
        )
        resolved_model = (
            model_name
            or getattr(settings, "ai_nvidia_model_name", None)
            or os.environ.get("NVIDIA_MODEL_NAME")
            or "meta/llama-3.1-8b-instruct"
        )
        resolved_base = (
            api_base_url
            or getattr(settings, "ai_nvidia_api_base_url", None)
            or os.environ.get("NVIDIA_BASE_URL")
            or "https://integrate.api.nvidia.com/v1"
        )

        super().__init__(
            api_base_url=resolved_base,
            api_key=resolved_key,
            model_name=resolved_model,
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
            provider_identifier="nvidia",
        )


KNOWN_GROQ_VISION_MODELS = frozenset({
    "llama-3.2-11b-vision-preview",
    "llama-3.2-90b-vision-preview",
    "llama-3.2-11b-vision",
    "llama-3.2-90b-vision",
})


class GroqProviderAdapter(GenericHTTPProviderAdapter):
    """Provider adapter for Groq Cloud API (OpenAI-compatible ultra-fast inference).

    Features:
    - Ultra-fast text generation via LLaMA 3.3 / 3.1
    - Multimodal image reasoning via LLaMA 3.2 Vision
    - Capability-aware validation and error handling
    - Secret masking and fallback compatibility
    """

    capabilities: ProviderCapabilities = ProviderCapabilities(
        text=True,
        vision=True,
        tools=True,
        structured_output=True,
        multilingual=True,
        complex_reasoning=False,
        fast_inference=True,
    )


    def __init__(
        self,
        api_base_url: str | None = None,
        api_key: str | None = None,
        model_name: str | None = None,
        vision_model_name: str | None = None,
        timeout_seconds: float = 30.0,
        max_retries: int = 2,
    ) -> None:
        import os

        resolved_key = (
            api_key
            or getattr(settings, "ai_groq_api_key", None)
            or getattr(settings, "groq_api_key", None)
            or os.environ.get("GROQ_API_KEY")
            or os.environ.get("AI_GROQ_API_KEY")
        )
        resolved_model = (
            model_name
            or getattr(settings, "ai_groq_model_name", None)
            or getattr(settings, "groq_model", None)
            or os.environ.get("GROQ_MODEL")
            or os.environ.get("AI_GROQ_MODEL_NAME")
            or "llama-3.3-70b-versatile"
        )
        resolved_vision_model = (
            vision_model_name
            or getattr(settings, "ai_groq_vision_model_name", None)
            or os.environ.get("GROQ_VISION_MODEL")
            or "llama-3.2-11b-vision-preview"
        )
        resolved_base = (
            api_base_url
            or getattr(settings, "ai_groq_api_base_url", None)
            or getattr(settings, "groq_base_url", None)
            or os.environ.get("GROQ_BASE_URL")
            or os.environ.get("AI_GROQ_API_BASE_URL")
            or "https://api.groq.com/openai/v1"
        )

        super().__init__(
            api_base_url=resolved_base,
            api_key=resolved_key,
            model_name=resolved_model,
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
            provider_identifier="groq",
        )
        self.vision_model_name = resolved_vision_model

    def is_vision_capable(self, model: str | None = None) -> bool:
        target = (model or self.model_name or "").lower()
        return any(v in target for v in ("vision", "vl", "11b-vision", "90b-vision")) or target in KNOWN_GROQ_VISION_MODELS

    def get_status(self) -> dict[str, Any]:
        status = super().get_status()
        status["vision_model"] = self.vision_model_name
        status["is_vision_capable"] = self.is_vision_capable()
        return status

    def generate(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDefinition] | None = None,
        **kwargs: Any,
    ) -> AdapterResponse:
        if not self._api_key and not kwargs.get("api_key"):
            raise MissingConfigurationError(
                "Groq API key is not configured.",
                provider=self.provider_identifier,
            )

        # Multimodal capability check
        has_images = any(getattr(m, "image_urls", None) for m in messages) or bool(kwargs.get("images"))
        target_model = kwargs.get("model_name") or self.model_name

        if has_images:
            if not self.is_vision_capable(target_model):
                if self.is_vision_capable(self.vision_model_name):
                    # Route to configured vision model
                    kwargs["model_name"] = self.vision_model_name
                else:
                    raise UnsupportedCapabilityError(
                        f"Configured model '{target_model}' on Groq is text-only. "
                        f"Multimodal vision requests require a vision-capable model (e.g. '{self.vision_model_name}').",
                        provider=self.provider_identifier,
                    )

        return super().generate(messages, tools, **kwargs)


class MultiProviderFallbackAdapter(AIProviderAdapter):
    """Zero-cost priority router mediating Azure OpenAI -> Gemini -> NVIDIA -> Groq -> RuleBased fallback.

    Enforces the ₹0 budget ceiling safety policy:
    - If allow_external_provider is False, immediately routes to deterministic rule-based fallback.
    - Attempts authorized providers strictly in configured priority sequence.
    - Never leaks credentials across failures or status responses.
    """

    def __init__(
        self,
        providers: list[AIProviderAdapter],
        fallback_adapter: AIProviderAdapter | None = None,
        allow_external_provider: bool = False,
    ) -> None:
        self.providers = providers
        self.fallback_adapter = fallback_adapter or RuleBasedProviderAdapter()
        self.allow_external_provider = allow_external_provider

    def get_status(self) -> dict[str, Any]:
        return {
            "provider": "multi_provider",
            "allow_external_provider": self.allow_external_provider,
            "provider_chain": [p.get_status() for p in self.providers],
            "fallback_provider": self.fallback_adapter.get_status(),
        }

    def generate(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDefinition] | None = None,
        **kwargs: Any,
    ) -> AdapterResponse:
        # Determine classified task type
        raw_task = kwargs.get("task_type")
        if isinstance(raw_task, str):
            try:
                task_type = TaskType(raw_task)
            except Exception:
                task_type = TaskType.GENERAL_CONVERSATION
        elif isinstance(raw_task, TaskType):
            task_type = raw_task
        elif any(getattr(m, "image_urls", None) for m in messages):
            task_type = TaskType.VISION
        elif tools and len(tools) > 0:
            task_type = TaskType.COMPLEX_PLANNING
        else:
            task_type = TaskType.GENERAL_CONVERSATION

        # Zero-Cost Guard or Deterministic Lookup: immediately use deterministic offline adapter
        if not self.allow_external_provider or task_type == TaskType.DETERMINISTIC_LOOKUP:
            fallback_start = time.time()
            res = self.fallback_adapter.generate(messages, tools, **kwargs)
            res.metadata["active_provider"] = "rule_based_fallback"
            res.metadata["fallback_used"] = True
            lat_ms = (time.time() - fallback_start) * 1000.0
            ai_telemetry.record_event(
                task_type=task_type.value,
                provider="rule_based_fallback",
                model_identifier="rule_based",
                latency_ms=lat_ms,
                success=True,
                fallback_triggered=True,
                tool_calls_count=len(res.tool_calls),
            )
            return res

        errors_encountered: list[str] = []
        start_time = time.time()
        raw_budget = kwargs.get("latency_budget_ms")
        budget_ms = float(raw_budget if raw_budget is not None else getattr(settings, "ai_request_latency_budget_ms", 8000))
        if budget_ms <= 300:
            logger.info("Latency budget exhausted immediately. Fast failover to deterministic offline fallback.")
            errors_encountered.append("all_providers:budget_exhausted")
            candidates = []
        else:
            # Task-aware provider filtering
            candidates = TaskRouter.filter_and_prioritize(
                self.providers,
                task_type=task_type,
                remaining_budget_ms=budget_ms,
            )


        for provider in candidates:
            # Check remaining latency budget
            elapsed_ms = (time.time() - start_time) * 1000.0
            remaining_budget_ms = budget_ms - elapsed_ms
            if remaining_budget_ms <= 300:
                logger.info("Latency budget exhausted. Fast failover to deterministic offline fallback.")
                errors_encountered.append("all_providers:budget_exhausted")
                break

            status = provider.get_status()
            provider_name = status.get("provider", "unknown")

            # Compute effective timeout for this attempt
            configured_timeout = getattr(provider, "timeout_seconds", 30.0)
            attempt_timeout = max(0.5, min(configured_timeout, remaining_budget_ms / 1000.0))

            try:
                provider_kwargs = dict(kwargs)
                provider_kwargs["timeout_seconds"] = attempt_timeout
                response = provider.generate(messages, tools, **provider_kwargs)
                lat_ms = (time.time() - start_time) * 1000.0
                response.metadata["active_provider"] = provider_name
                response.metadata["fallback_used"] = False
                response.metadata["provider_latency_ms"] = round(lat_ms, 1)
                try:
                    from app.ai.circuit_breaker import circuit_breaker
                    circuit_breaker.record_success(provider_name)
                except Exception:
                    pass

                ai_telemetry.record_event(
                    task_type=task_type.value,
                    provider=provider_name,
                    model_identifier=status.get("model", provider_name),
                    latency_ms=lat_ms,
                    success=True,
                    fallback_triggered=False,
                    tool_calls_count=len(response.tool_calls),
                )
                return response
            except AIProviderError as p_err:
                logger.warning(f"Provider '{provider_name}' failed: {p_err.code} - {p_err.message}. Attempting fallback.")
                errors_encountered.append(f"{provider_name}:{p_err.code}")
                try:
                    from app.ai.circuit_breaker import circuit_breaker
                    circuit_breaker.record_failure(provider_name)
                except Exception:
                    pass
            except Exception as err:
                logger.warning(f"Provider '{provider_name}' unexpected error: {err}. Attempting fallback.")
                errors_encountered.append(f"{provider_name}:unknown_error")
                try:
                    from app.ai.circuit_breaker import circuit_breaker
                    circuit_breaker.record_failure(provider_name)
                except Exception:
                    pass

        # Deterministic zero-cost fallback
        fallback_start = time.time()
        fallback_response = self.fallback_adapter.generate(messages, tools, **kwargs)
        total_lat_ms = (time.time() - start_time) * 1000.0
        fallback_response.metadata["active_provider"] = "rule_based_fallback"
        fallback_response.metadata["fallback_used"] = True
        fallback_response.metadata["fallback_errors"] = errors_encountered
        fallback_response.metadata["total_latency_ms"] = round(total_lat_ms, 1)

        ai_telemetry.record_event(
            task_type=task_type.value,
            provider="rule_based_fallback",
            model_identifier="rule_based",
            latency_ms=total_lat_ms,
            success=True,
            fallback_triggered=True,
            tool_calls_count=len(fallback_response.tool_calls),
            error_category=";".join(errors_encountered) if errors_encountered else None,
        )
        return fallback_response


def create_provider_adapter(settings: Any | None = None) -> AIProviderAdapter:
    """Factory creating an AIProviderAdapter instance based on environment settings.

    Supported provider configurations:
    - 'mock' -> MockProviderAdapter (default test offline simulator)
    - 'rule_based' -> RuleBasedProviderAdapter (deterministic Whole-Odisha parser)
    - 'azure_openai' -> AzureOpenAIProviderAdapter
    - 'gemini' -> GeminiProviderAdapter
    - 'nvidia' -> NVIDIAProviderAdapter
    - 'groq' -> GroqProviderAdapter
    - 'openai_compatible' -> GenericHTTPProviderAdapter
    - 'multi_provider' -> MultiProviderFallbackAdapter (Azure -> Gemini -> NVIDIA -> Groq -> RuleBased)

    Guarantees safe offline execution by default when settings are absent or external calls disabled.
    """
    if settings is None:
        try:
            from app.core.config import settings as app_settings

            settings = app_settings
        except Exception:
            return MockProviderAdapter()

    provider_name = (getattr(settings, "ai_provider", "mock") or "mock").lower().strip()
    allow_external = getattr(settings, "ai_allow_external_provider", False)

    if provider_name == "mock":
        return MockProviderAdapter()

    if provider_name == "rule_based":
        return RuleBasedProviderAdapter()

    # Azure OpenAI adapter instance
    azure_adapter = AzureOpenAIProviderAdapter(
        api_base_url=getattr(settings, "ai_api_base_url", None),
        api_key=getattr(settings, "ai_api_key", None),
        deployment_name=getattr(settings, "ai_azure_deployment_name", None) or getattr(settings, "ai_model_name", None),
        api_version=getattr(settings, "ai_azure_api_version", "2024-12-01-preview"),
        timeout_seconds=getattr(settings, "ai_timeout_seconds", 30.0),
        max_retries=getattr(settings, "ai_max_retries", 2),
    )

    # Google Gemini adapter instance
    gemini_adapter = GeminiProviderAdapter(
        api_base_url=getattr(settings, "ai_gemini_api_base_url", "https://generativelanguage.googleapis.com/v1beta"),
        api_key=getattr(settings, "ai_gemini_api_key", None),
        model_name=getattr(settings, "ai_gemini_model_name", "gemini-1.5-flash"),
        timeout_seconds=getattr(settings, "ai_timeout_seconds", 30.0),
        max_retries=getattr(settings, "ai_max_retries", 2),
    )

    # NVIDIA API adapter instance
    nvidia_adapter = NVIDIAProviderAdapter(
        api_base_url=getattr(settings, "ai_nvidia_api_base_url", "https://integrate.api.nvidia.com/v1"),
        api_key=getattr(settings, "ai_nvidia_api_key", None) or getattr(settings, "nvidia_api_key", None),
        model_name=getattr(settings, "ai_nvidia_model_name", "deepseek-ai/DeepSeek-V4-Flash"),
        timeout_seconds=getattr(settings, "ai_timeout_seconds", 30.0),
        max_retries=getattr(settings, "ai_max_retries", 2),
    )

    # Groq API adapter instance
    groq_adapter = GroqProviderAdapter(
        api_base_url=getattr(settings, "ai_groq_api_base_url", None) or getattr(settings, "groq_base_url", None),
        api_key=getattr(settings, "ai_groq_api_key", None) or getattr(settings, "groq_api_key", None),
        model_name=getattr(settings, "ai_groq_model_name", None) or getattr(settings, "groq_model", None),
        vision_model_name=getattr(settings, "ai_groq_vision_model_name", "llama-3.2-11b-vision-preview"),
        timeout_seconds=getattr(settings, "ai_timeout_seconds", 30.0),
        max_retries=getattr(settings, "ai_max_retries", 2),
    )

    # Multi-provider fallback chain (Azure -> Gemini -> NVIDIA -> Groq)
    if provider_name in ("multi_provider", "azure_openai", "gemini", "nvidia", "groq"):
        if not allow_external:
            # If external providers are disabled, return multi-provider adapter configured to route to fallback immediately
            return MultiProviderFallbackAdapter(
                providers=[azure_adapter, gemini_adapter, nvidia_adapter, groq_adapter],
                fallback_adapter=RuleBasedProviderAdapter(),
                allow_external_provider=False,
            )

        # Build prioritized chain
        chain: list[AIProviderAdapter] = []
        if provider_name == "azure_openai":
            chain = [azure_adapter, gemini_adapter, nvidia_adapter, groq_adapter]
        elif provider_name == "gemini":
            chain = [gemini_adapter, azure_adapter, nvidia_adapter, groq_adapter]
        elif provider_name == "nvidia":
            chain = [nvidia_adapter, azure_adapter, gemini_adapter, groq_adapter]
        elif provider_name == "groq":
            chain = [groq_adapter, azure_adapter, gemini_adapter, nvidia_adapter]
        else:
            chain = [azure_adapter, gemini_adapter, nvidia_adapter, groq_adapter]

        return MultiProviderFallbackAdapter(
            providers=chain,
            fallback_adapter=RuleBasedProviderAdapter(),
            allow_external_provider=True,
        )

    if provider_name == "openai_compatible":
        return GenericHTTPProviderAdapter(
            api_base_url=getattr(settings, "ai_api_base_url", None),
            api_key=getattr(settings, "ai_api_key", None),
            model_name=getattr(settings, "ai_model_name", None),
            timeout_seconds=getattr(settings, "ai_timeout_seconds", 30.0),
            max_retries=getattr(settings, "ai_max_retries", 2),
        )

    if provider_name == "custom":
        raise MissingConfigurationError(
            "Custom AI provider is not configured.",
            provider="custom",
        )

    raise UnsupportedCapabilityError(
        f"Unsupported AI provider: '{provider_name}'. Supported providers: mock, rule_based, azure_openai, gemini, nvidia, groq, openai_compatible, multi_provider.",
        provider=provider_name,
    )
