# O-Travelz AI Provider Matrix (Source Code Reconciled)

`STATUS: VERIFIED FROM SOURCE CODE`

This document reflects the exact AI provider adapters, models, and fallback chains implemented in `backend/app/ai/adapter.py` and `backend/app/core/config.py`.

---

## 1. Provider Implementation & Runtime Status

| Provider | Actually Implemented? | Runtime Reachable? | Env Variable | Default / Configured Model | Required? | Fallback Position | Code File Citation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Deterministic Rule-Based** | **Yes** | **Yes (Always)** | *None* | `deterministic-odisha-rules` | **No (Built-in)** | **Final Grounded Anchor** | `backend/app/ai/adapter.py:155` |
| **Mock Simulator** | **Yes** | **Yes (Dev/Test)** | `AI_PROVIDER=mock` | `mock-odisha-agent` | No | Test Offline Simulator | `backend/app/ai/adapter.py:83` |
| **Google Gemini** | **Yes** | **Yes** | `AI_GEMINI_API_KEY` | `gemini-1.5-flash` | Optional | Secondary in `multi_provider` | `backend/app/ai/adapter.py:596` |
| **Azure OpenAI** | **Yes** | **Yes** | `AI_API_KEY` + `AI_API_BASE_URL` | `gpt-5-mini` | Optional | Primary in `multi_provider` | `backend/app/ai/adapter.py:546` |
| **NVIDIA API Catalog** | **Yes** | **Yes** | `AI_NVIDIA_API_KEY` | `meta/llama-3.1-8b-instruct`| Optional | Tertiary in `multi_provider` | `backend/app/ai/adapter.py:826` |
| **OpenAI Compatible REST**| **Yes** | **Yes** | `AI_API_KEY` + `AI_API_BASE_URL` | `AI_MODEL_NAME` | Optional | Standalone generic | `backend/app/ai/adapter.py:255` |
| **Groq** | **NO** | **NO** | *None* | *None* | **Not Implemented** | *N/A* | *No code exists in repo* |

---

## 2. Reconciled Answers to Direct Provider Questions

1. **Is Groq implemented?**
   * **NO**. There are zero Groq classes, endpoints, or environment variables in the backend source code. Earlier mentions were documentation errors and have been removed.
2. **Is OpenAI implemented?**
   * **Yes**, via `GenericHTTPProviderAdapter` (`provider="openai_compatible"`) and `AzureOpenAIProviderAdapter` (`provider="azure_openai"`).
3. **Is NVIDIA NIM implemented?**
   * **Yes**, via `NVIDIAProviderAdapter` (`backend/app/ai/adapter.py:826`) targeting `meta/llama-3.1-8b-instruct` at `https://integrate.api.nvidia.com/v1`.
4. **Is Gemini implemented?**
   * **Yes**, via `GeminiProviderAdapter` (`backend/app/ai/adapter.py:596`) using direct HTTP REST calls (`urllib`) to `https://generativelanguage.googleapis.com/v1beta`.
5. **Which Gemini model is actually configured in code?**
   * **`gemini-1.5-flash`** (configurable via `AI_GEMINI_MODEL_NAME` in `backend/app/core/config.py:38`).
6. **What is the exact fallback order in `MultiProviderFallbackAdapter`?**
   * When `AI_PROVIDER=multi_provider`:
     $$\text{Azure OpenAI} \longrightarrow \text{Google Gemini} \longrightarrow \text{NVIDIA NIM} \longrightarrow \text{RuleBasedProviderAdapter}$$
   * When `AI_PROVIDER=gemini`:
     $$\text{Google Gemini} \longrightarrow \text{Azure OpenAI} \longrightarrow \text{NVIDIA NIM} \longrightarrow \text{RuleBasedProviderAdapter}$$
7. **What happens if every external AI provider fails, times out, or runs out of budget?**
   * The `MultiProviderFallbackAdapter` catches errors, records circuit breaker telemetry, and routes to `RuleBasedProviderAdapter`, which parses keywords and emits canonical `build_itinerary` tool calls.
8. **Does deterministic planning work without ANY AI API key?**
   * **YES (100%)**. The core deterministic planner (`/itinerary/plan`) and offline rule-based parser require **zero external API keys, zero internet access to LLM APIs, and zero ongoing cloud billing**.
