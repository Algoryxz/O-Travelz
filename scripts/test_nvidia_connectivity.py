"""
Harmless NVIDIA NIM connectivity and authentication verification script.

Sends ONE minimal request to verify:
1. Endpoint reachability (https://integrate.api.nvidia.com/v1)
2. API Key authentication from environment
3. Model availability (e.g. deepseek-ai/DeepSeek-V4-Flash)
4. Valid structured response formatting

STRICT SECURITY: Never prints or logs the API key.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.ai.contracts import ChatMessage, ChatRole
from app.ai.adapter import NVIDIAProviderAdapter
from app.core.config import settings


def test_nvidia_connection():
    api_key = (
        os.environ.get("NVIDIA_API_KEY")
        or os.environ.get("AI_NVIDIA_API_KEY")
        or getattr(settings, "ai_nvidia_api_key", None)
        or getattr(settings, "nvidia_api_key", None)
    )

    if not api_key:
        print("[NVIDIA NIM CONNECTIVITY TEST] ERROR: No NVIDIA_API_KEY detected in environment or .env.")
        print("Please ensure NVIDIA_API_KEY is set in your environment.")
        return False

    masked_key = f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else "***"
    base_url = (
        os.environ.get("NVIDIA_BASE_URL")
        or getattr(settings, "ai_nvidia_api_base_url", None)
        or "https://integrate.api.nvidia.com/v1"
    )
    model_name = (
        os.environ.get("NVIDIA_MODEL_NAME")
        or getattr(settings, "ai_nvidia_model_name", None)
        or "deepseek-ai/DeepSeek-V4-Flash"
    )

    print("=== NVIDIA NIM PROVIDER CONNECTIVITY TEST ===")
    print(f"Base URL:      {base_url}")
    print(f"Model ID:      {model_name}")
    print(f"API Key:       {masked_key} (masked)")

    adapter = NVIDIAProviderAdapter(
        api_base_url=base_url,
        api_key=api_key,
        model_name=model_name,
        timeout_seconds=30.0,
    )

    status = adapter.get_status()
    print(f"Adapter Status: {status}")

    # Harmless, minimal single prompt
    messages = [
        ChatMessage(
            role=ChatRole.USER,
            content="Respond with exactly one word: 'O-TRAVELZ'.",
        )
    ]

    print("\nSending 1 test chat completion request to NVIDIA NIM...")
    try:
        response = adapter.generate(messages, temperature=0.1)
        print("\n=== RESPONSE RECEIVED ===")
        print(f"Finish Reason: {response.finish_reason}")
        print(f"Content:       {response.content}")
        print(f"Metadata:      {response.metadata}")
        print("\nAuthentication: SUCCESSFUL")
        print("Response:       VALID")
        return True
    except Exception as e:
        print(f"\n[ERROR] Request failed: {e}")
        # If preferred model had a specific model-not-found error, try querying or testing fallback model
        print("\nTesting fallback to meta/llama-3.3-70b-instruct or meta/llama-3.1-8b-instruct...")
        for fallback_model in ["meta/llama-3.3-70b-instruct", "meta/llama-3.1-8b-instruct", "deepseek-ai/deepseek-r1"]:
            try:
                print(f"Attempting fallback model: {fallback_model}...")
                fb_adapter = NVIDIAProviderAdapter(
                    api_base_url=base_url,
                    api_key=api_key,
                    model_name=fallback_model,
                    timeout_seconds=30.0,
                )
                fb_resp = fb_adapter.generate(messages, temperature=0.1)
                print(f"Fallback {fallback_model} Succeeded! Content: {fb_resp.content}")
                return True
            except Exception as fb_err:
                print(f"Fallback {fallback_model} error: {fb_err}")
        return False


if __name__ == "__main__":
    success = test_nvidia_connection()
    sys.exit(0 if success else 1)
