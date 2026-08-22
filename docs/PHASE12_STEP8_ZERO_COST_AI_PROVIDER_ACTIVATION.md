# Phase 12 Step 8 — Zero-Cost Multi-Provider AI Activation & Production Fallback

## 1. Title & Status
- **Title**: Phase 12 Step 8 — Zero-Cost Multi-Provider AI Activation & Production Fallback
- **Status**: `COMPLETE — PASS`
- **Execution Date**: August 2026

---

## 2. Executive Summary & Hard Business Constraint

Phase 12 Step 8 activates the O-Travelz provider-neutral AI architecture using an explicit **zero-cost multi-provider priority strategy** under a strict, immutable budget policy:

> **HARD BUDGET CEILING: ₹0**
> The system is architecturally guaranteed to never silently incur paid usage. It fails safe to deterministic offline rule-based execution rather than attempting unauthorized paid requests.

### Multi-Provider Priority Chain
1. **Azure OpenAI (Primary)**: Uses the project owner's active free Azure access allocation.
2. **Google Gemini API (Secondary)**: Uses available free developer tier allowance.
3. **NVIDIA API (Tertiary Optional)**: Uses free trial/developer quota via OpenAI-compatible endpoints.
4. **`RuleBasedProviderAdapter` (Mandatory Fallback)**: Deterministic, offline, zero-cost Whole-Odisha travel parser.
5. **`MockProviderAdapter` (Test Fallback)**: Test suite simulation engine.

---

## 3. Architecture & Implementation

### 3.1. Zero-Cost Safety Policy & Settings (`backend/app/core/config.py`)
- `ai_allow_external_provider: bool = False`: Master switch preventing outbound AI network traffic unless explicitly enabled.
- `ai_allow_paid_provider: bool = False`: Hard protection blocking any provider configured with billable payment methods.
- Default runtime settings: `ai_provider = "mock"` (or `"rule_based"`), `ai_allow_external_provider = False`.

### 3.2. Provider Adapters (`backend/app/ai/adapter.py`)
- **`AzureOpenAIProviderAdapter`**: Standard library `urllib` HTTP client targeting `{api_base_url}/openai/deployments/{deployment_name}/chat/completions?api-version={api_version}` with `api-key` header auth.
- **`GeminiProviderAdapter`**: Standard library `urllib` client targeting `{api_base_url}/models/{model_name}:generateContent` with `x-goog-api-key` header auth. Converts canonical `ChatMessage` to Gemini `contents` and `ToolDefinition` to `functionDeclarations`.
- **`NVIDIAProviderAdapter`**: Generic HTTP adapter targeting `https://integrate.api.nvidia.com/v1/chat/completions` with bearer token auth.
- **`MultiProviderFallbackAdapter`**: Prioritized router enforcing the ₹0 budget ceiling:
  - If `allow_external_provider == False`, routes immediately to `RuleBasedProviderAdapter` with 0 HTTP calls.
  - If enabled, sequentially attempts Azure -> Gemini -> NVIDIA.
  - If any provider encounters `AIProviderError` (timeout, 429 rate limit, 503 unavailable, 401 auth failure), logs a masked diagnostic and seamlessly attempts the next provider.
  - If all external providers fail, falls back to `RuleBasedProviderAdapter` without throwing errors to the traveler.

---

## 4. Environment Variables Reference

| Environment Variable | Default Value | Description |
| :--- | :--- | :--- |
| `AI_PROVIDER` | `"mock"` | Primary provider identifier (`"mock"`, `"rule_based"`, `"azure_openai"`, `"gemini"`, `"nvidia"`, `"multi_provider"`) |
| `AI_ALLOW_EXTERNAL_PROVIDER` | `false` | Zero-cost safety guard. Must be set to `true` to permit outbound model requests |
| `AI_ALLOW_PAID_PROVIDER` | `false` | Hard ₹0 protection guard. Prevents billable provider requests |
| `AI_FALLBACK_PROVIDER` | `"rule_based"` | Mandatory deterministic fallback adapter identifier |
| `AI_API_BASE_URL` | `null` | Base endpoint URL for Azure OpenAI |
| `AI_API_KEY` | `null` | API key for Azure OpenAI (redacted in status, logs, exceptions) |
| `AI_AZURE_DEPLOYMENT_NAME` | `null` | Deployment model name for Azure OpenAI (e.g. `gpt-4o-mini`) |
| `AI_AZURE_API_VERSION` | `"2024-02-15-preview"` | Azure REST API version |
| `AI_GEMINI_API_KEY` | `null` | API key for Google Gemini (redacted in status, logs, exceptions) |
| `AI_GEMINI_MODEL_NAME` | `"gemini-1.5-flash"` | Gemini model identifier |
| `AI_GEMINI_API_BASE_URL` | `"https://generativelanguage.googleapis.com/v1beta"` | Gemini REST base endpoint |
| `AI_NVIDIA_API_KEY` | `null` | API key for NVIDIA Catalog |
| `AI_NVIDIA_MODEL_NAME` | `"meta/llama-3.1-8b-instruct"` | NVIDIA model identifier |
| `AI_TIMEOUT_SECONDS` | `30.0` | HTTP request timeout in seconds |
| `AI_MAX_RETRIES` | `2` | Maximum retry attempts per provider |

---

## 5. Security & Grounding Invariants

1. **Tool-Call Security**: `ToolExecutionBoundary` remains the sole authority for tool execution. Provider adapters cannot execute code directly.
2. **Secret Redaction**: `get_status()`, `AIProviderError`, and logs automatically mask all API keys and bearer tokens.
3. **Multilingual Grounding**: Natural language interpretation supports English, Odia (**ଓଡ଼ିଆ**), Hindi (**हिन्दी**), and mixed-script queries without synthetic data fabrication.
4. **Zero Fabrication**: All destination facts, schedules, and hops originate strictly from verified database records.
5. **Zero External Dependencies**: Implemented using pure Python standard library `urllib.request` (0 vendor SDKs added).

---

## 6. Quality Gate Verification

| Quality Gate | Command | Result |
| :--- | :--- | :--- |
| **New Multi-Provider Test Suite** | `pytest backend/tests/test_ai_external_providers.py -v` | **17 passed in 1.52s (100% PASS)** |
| **All AI Backend Tests** | `pytest backend/tests/test_ai_*.py` (7 test files) | **139 passed in 3.80s (100% PASS)** |
| **Full Backend Pytest Suite** | `pytest backend/tests` (42 test files) | **640 passed, 2 deselected in 24.36s (100% PASS)** |
| **Python Syntax & Compilation** | `python -m compileall backend scripts` | **0 errors (Exit Code 0)** |
| **Full Frontend Vitest Suite** | `npm --prefix frontend test` (38 test files) | **334 passed, 5 skipped in 7.79s (100% PASS)** |
| **Frontend Production Build** | `npm --prefix frontend run build` | **0 errors in 8.78s** |
| **Git Diff Formatting** | `git diff --check` | **Clean (0 format errors)** |

---

## 7. Operational Instructions

### To Enable Live Zero-Cost Multi-Provider Mode
Set the following in `.env` (using your free tier credentials):
```text
AI_PROVIDER=multi_provider
AI_ALLOW_EXTERNAL_PROVIDER=true
AI_ALLOW_PAID_PROVIDER=false
AI_API_BASE_URL=https://<your-azure-resource>.openai.azure.com
AI_API_KEY=<your-azure-key>
AI_AZURE_DEPLOYMENT_NAME=gpt-4o-mini
AI_GEMINI_API_KEY=<your-gemini-key>
AI_GEMINI_MODEL_NAME=gemini-1.5-flash
```

### To Disable All External Providers & Run 100% Offline
```text
AI_PROVIDER=rule_based
AI_ALLOW_EXTERNAL_PROVIDER=false
AI_ALLOW_PAID_PROVIDER=false
```
