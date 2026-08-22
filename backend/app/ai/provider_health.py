"""Safe provider preflight diagnostics and health status models.

Evaluates configuration, zero-cost budget guards, credential presence,
and readiness for external AI providers without initiating outbound network calls.
"""
from __future__ import annotations

from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field

from app.core.config import Settings, settings as global_settings


class ProviderReadinessState(str, Enum):
    NOT_CONFIGURED = "NOT_CONFIGURED"
    CONFIGURED_BUT_DISABLED = "CONFIGURED_BUT_DISABLED"
    CONFIGURED_SAFE_TO_TEST = "CONFIGURED_SAFE_TO_TEST"
    BLOCKED_BY_COST_POLICY = "BLOCKED_BY_COST_POLICY"
    UNVERIFIED_FREE = "UNVERIFIED_FREE"


class ProviderHealthStatus(BaseModel):
    model_config = {"protected_namespaces": ()}

    provider: str
    configured: bool
    credential_present: bool
    credential_preview: str = Field(default="[NOT SET]")
    externally_enabled: bool
    paid_provider_enabled: bool
    endpoint_configured: bool
    model_configured: bool
    readiness_state: ProviderReadinessState
    live_check_allowed: bool
    details: str = Field(default="")



def _mask_secret(secret: Optional[str]) -> str:
    """Safely mask secrets, showing only the last 4 characters if available."""
    if not secret:
        return "[NOT SET]"
    if len(secret) <= 4:
        return "****"
    return f"****{secret[-4:]}"


def inspect_provider_health(
    provider_name: str,
    settings: Optional[Settings] = None,
) -> ProviderHealthStatus:
    """Evaluate health and readiness for a specific provider without making network requests."""
    cfg = settings or global_settings
    name = provider_name.lower().strip()

    externally_enabled = getattr(cfg, "ai_allow_external_provider", False)
    paid_enabled = getattr(cfg, "ai_allow_paid_provider", False)

    if name == "rule_based":
        return ProviderHealthStatus(
            provider="rule_based",
            configured=True,
            credential_present=False,
            credential_preview="[N/A - OFFLINE]",
            externally_enabled=True,
            paid_provider_enabled=False,
            endpoint_configured=True,
            model_configured=True,
            readiness_state=ProviderReadinessState.CONFIGURED_SAFE_TO_TEST,
            live_check_allowed=True,
            details="Deterministic Whole-Odisha rule-based engine (Zero cost, 100% offline).",
        )

    if name == "mock":
        return ProviderHealthStatus(
            provider="mock",
            configured=True,
            credential_present=False,
            credential_preview="[N/A - OFFLINE]",
            externally_enabled=True,
            paid_provider_enabled=False,
            endpoint_configured=True,
            model_configured=True,
            readiness_state=ProviderReadinessState.CONFIGURED_SAFE_TO_TEST,
            live_check_allowed=True,
            details="Deterministic test mock adapter (Zero cost, 100% offline).",
        )

    if name == "azure_openai":
        api_key = getattr(cfg, "ai_api_key", None)
        base_url = getattr(cfg, "ai_api_base_url", None)
        deployment = getattr(cfg, "ai_azure_deployment_name", None) or getattr(cfg, "ai_model_name", None)
        configured = bool(api_key and base_url)

        if not configured:
            state = ProviderReadinessState.NOT_CONFIGURED
            allowed = False
            details = "Missing AI_API_KEY or AI_API_BASE_URL for Azure OpenAI."
        elif not externally_enabled:
            state = ProviderReadinessState.CONFIGURED_BUT_DISABLED
            allowed = False
            details = "Configured but blocked: AI_ALLOW_EXTERNAL_PROVIDER is false."
        else:
            state = ProviderReadinessState.CONFIGURED_SAFE_TO_TEST
            allowed = True
            details = "Configured with valid credentials and external requests explicitly permitted."

        return ProviderHealthStatus(
            provider="azure_openai",
            configured=configured,
            credential_present=bool(api_key),
            credential_preview=_mask_secret(api_key),
            externally_enabled=externally_enabled,
            paid_provider_enabled=paid_enabled,
            endpoint_configured=bool(base_url),
            model_configured=bool(deployment),
            readiness_state=state,
            live_check_allowed=allowed,
            details=details,
        )

    if name == "gemini":
        api_key = getattr(cfg, "ai_gemini_api_key", None)
        base_url = getattr(cfg, "ai_gemini_api_base_url", None)
        model = getattr(cfg, "ai_gemini_model_name", "gemini-1.5-flash")
        configured = bool(api_key and base_url)

        if not configured:
            state = ProviderReadinessState.NOT_CONFIGURED
            allowed = False
            details = "Missing AI_GEMINI_API_KEY for Google Gemini."
        elif not externally_enabled:
            state = ProviderReadinessState.CONFIGURED_BUT_DISABLED
            allowed = False
            details = "Configured but blocked: AI_ALLOW_EXTERNAL_PROVIDER is false."
        else:
            state = ProviderReadinessState.CONFIGURED_SAFE_TO_TEST
            allowed = True
            details = "Configured with valid credentials and external requests explicitly permitted."

        return ProviderHealthStatus(
            provider="gemini",
            configured=configured,
            credential_present=bool(api_key),
            credential_preview=_mask_secret(api_key),
            externally_enabled=externally_enabled,
            paid_provider_enabled=paid_enabled,
            endpoint_configured=bool(base_url),
            model_configured=bool(model),
            readiness_state=state,
            live_check_allowed=allowed,
            details=details,
        )

    if name == "nvidia":
        api_key = getattr(cfg, "ai_nvidia_api_key", None)
        base_url = getattr(cfg, "ai_nvidia_api_base_url", None)
        model = getattr(cfg, "ai_nvidia_model_name", "meta/llama-3.1-8b-instruct")
        configured = bool(api_key and base_url)

        if not configured:
            state = ProviderReadinessState.NOT_CONFIGURED
            allowed = False
            details = "Missing AI_NVIDIA_API_KEY for NVIDIA API."
        elif not externally_enabled:
            state = ProviderReadinessState.CONFIGURED_BUT_DISABLED
            allowed = False
            details = "Configured but blocked: AI_ALLOW_EXTERNAL_PROVIDER is false."
        else:
            state = ProviderReadinessState.CONFIGURED_SAFE_TO_TEST
            allowed = True
            details = "Configured with valid credentials and external requests explicitly permitted."

        return ProviderHealthStatus(
            provider="nvidia",
            configured=configured,
            credential_present=bool(api_key),
            credential_preview=_mask_secret(api_key),
            externally_enabled=externally_enabled,
            paid_provider_enabled=paid_enabled,
            endpoint_configured=bool(base_url),
            model_configured=bool(model),
            readiness_state=state,
            live_check_allowed=allowed,
            details=details,
        )

    return ProviderHealthStatus(
        provider=name,
        configured=False,
        credential_present=False,
        credential_preview="[N/A]",
        externally_enabled=externally_enabled,
        paid_provider_enabled=paid_enabled,
        endpoint_configured=False,
        model_configured=False,
        readiness_state=ProviderReadinessState.NOT_CONFIGURED,
        live_check_allowed=False,
        details=f"Unrecognized provider name: '{name}'.",
    )


def inspect_all_providers(settings: Optional[Settings] = None) -> list[ProviderHealthStatus]:
    """Inspect health across all known providers in prioritized order."""
    return [
        inspect_provider_health("azure_openai", settings),
        inspect_provider_health("gemini", settings),
        inspect_provider_health("nvidia", settings),
        inspect_provider_health("rule_based", settings),
    ]
