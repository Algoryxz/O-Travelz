# Phase 12 Step 6 — External AI Provider Integration & Provider-Neutral Production Adapter

## 1. Title & Status
- **Title**: Phase 12 Step 6 — External AI Provider Integration & Provider-Neutral Production Adapter
- **Status**: `BLOCKED / PROVIDER DECISION REQUIRED`
- **Execution Date**: August 2026

---

## 2. Canonical Provider Audit Findings & Architectural Stop Condition
An exhaustive audit of the canonical documentation (`docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/PHASES.md`, `docs/MEMORY.md`, `docs/REPOSITORY_MAP.md`, `docs/RULES.md`, `docs/PHASE12_STEP4_AI_TOOL_ADAPTER.md`, `docs/PHASE12_STEP5_MULTILINGUAL_GROUNDED_AI.md`) confirms:
1. **No commercial or self-hosted model provider is canonically authorized or selected** (e.g. Azure OpenAI, Google Gemini, Anthropic Claude, OpenAI, Ollama, vLLM).
2. Installing vendor SDKs or silently making a proprietary provider choice is strictly forbidden by repository rules.
3. Therefore, Phase 12 Step 6 has implemented the **complete provider-neutral production infrastructure** (environment configuration, adapter factory, generic HTTP adapter, canonical failure taxonomy, security boundary, payload protection, and secret isolation) while explicitly recording that live commercial model activation remains **blocked pending an authorized architectural decision**.

---

## 3. Architecture Overview

```text
Traveler Request (English / Odia / Hindi / Mixed)
    ↓
POST /ai/converse (or POST /ai/plan)
    ↓
GroundedConversationOrchestrator
    ↓
create_provider_adapter(settings)
    ├── mock (MockProviderAdapter - Default Safe Offline Mode)
    ├── rule_based (RuleBasedProviderAdapter - Deterministic Whole-Odisha Parser)
    └── openai_compatible (GenericHTTPProviderAdapter - Standard REST / JSON Protocol)
    ↓
Model Generates AdapterResponse (Text or Canonical ToolCalls)
    ↓
ToolExecutionBoundary (backend/app/ai/boundary.py)
    ├── Strict Tool Allowlisting (Reject eval, exec, os.system, unregistered functions)
    ├── Pydantic Argument Validation (Reject malformed arguments)
    └── Exception Containment
    ↓
Verified Domain Services (SearchService, ItineraryService, TransportService)
    ↓
Structured ToolResult & GroundingContext
    ↓
Grounded Multilingual Response Envelope (GroundedConversationResponse)
    ↓
Traveler
```

---

## 4. Configuration Boundary (`backend/app/core/config.py`)
Extended the application `Settings` with provider-neutral settings supporting environment variables:
- `ai_provider: str = "mock"` (supported values: `"mock"`, `"rule_based"`, `"openai_compatible"`, `"custom"`)
- `ai_model_name: Optional[str] = None`
- `ai_api_key: Optional[str] = None` (never logged, never serialized in responses)
- `ai_api_base_url: Optional[str] = None`
- `ai_timeout_seconds: float = 30.0`
- `ai_max_retries: int = 2`

**Safe Offline Default**: When environment variables are absent, `Settings` defaults to `ai_provider="mock"`, ensuring all tests and local development run 100% offline with zero network credentials.

---

## 5. Canonical Provider Error Taxonomy (`backend/app/ai/contracts.py`)
Established unified classification and structured exception hierarchy:
- `ProviderErrorCode`:
  - `PROVIDER_UNAVAILABLE`: Endpoint unreachable or DNS/connection failure.
  - `MISSING_CONFIGURATION`: Missing base URL or credentials.
  - `AUTHENTICATION_FAILURE`: HTTP 401 / 403 authorization rejection.
  - `TIMEOUT`: Network/socket timeout exceeding `ai_timeout_seconds`.
  - `MALFORMED_RESPONSE`: Invalid JSON or unexpected response payload.
  - `UNSUPPORTED_CAPABILITY`: Requested feature (e.g. tool calling) unsupported by provider.
  - `RATE_LIMIT_EXCEEDED`: HTTP 429 rate limit or quota exhaustion.
  - `PROVIDER_ERROR`: Generic upstream provider failure.
- `AIProviderError`: Base exception enforcing automatic regex masking of API keys, bearer tokens, and credentials in error messages.
- Specific Subclasses: `ProviderUnavailableError`, `MissingConfigurationError`, `AuthenticationError`, `ProviderTimeoutError`, `MalformedProviderResponseError`, `UnsupportedCapabilityError`, `RateLimitExceededError`.

---

## 6. Provider Adapter Implementations & Factory (`backend/app/ai/adapter.py`)
1. `AIProviderAdapter(ABC)`:
   - `generate(messages, tools=None, **kwargs) -> AdapterResponse`
   - `get_status() -> dict[str, Any]` (reports provider name, model, configuration/availability state, with 0 secret exposure).
2. `MockProviderAdapter`: Deterministic offline simulator for automated testing.
3. `RuleBasedProviderAdapter`: Deterministic Whole-Odisha parser wrapping `RuleBasedModelAdapter`.
4. `GenericHTTPProviderAdapter`: Standard REST client using Python standard library `urllib` (0 vendor SDKs):
   - Enforces timeout (`ai_timeout_seconds`) and safe retries (`ai_max_retries`).
   - Translates canonical `ChatMessage` and `ToolDefinition` contracts into OpenAI-compatible chat completion JSON format.
   - Parses response choices, message content, and tool calls.
   - Preserves upstream `tool_call_id` or generates deterministic fallback `call_<uuid>`.
   - Normalizes all HTTP errors into canonical `AIProviderError` subclasses.
5. `create_provider_adapter(settings)`: Factory resolving configured adapter or raising `MissingConfigurationError` / `UnsupportedCapabilityError`.

---

## 7. Security Boundary & Untrusted Output Containment
- **Zero Reflection / Eval**: All tool calls must resolve through `ToolExecutionBoundary`. Invocations of dangerous names (`eval`, `exec`, `os.system`, `subprocess.call`, `subprocess.run`, `__import__`, `open`) are rejected with `ToolStatus.UNKNOWN`.
- **Argument Validation**: Arguments undergo strict Pydantic validation before reaching domain logic; malformed payloads return `ToolStatus.INVALID` or `ToolStatus.ERROR`.
- **Payload & Loop Protection**:
  - Oversized conversation payloads (>100,000 characters) are rejected with `AIStatus.ERROR`.
  - Infinite tool-call loops are prevented via turn and execution guards.
- **Secret Isolation**:
  - `AIProviderError` automatically redacts bearer tokens and API keys.
  - `get_status()` never exposes `api_key` or authorization headers.
  - `AdapterResponse.metadata` never contains credential strings.

---

## 8. Exact Files Created
- [`backend/tests/test_ai_provider_adapter.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/tests/test_ai_provider_adapter.py): 30 focused unit and integration tests covering configuration, factory, HTTP adapter, failure normalization, security boundary, secret masking, and API routes.
- [`docs/PHASE12_STEP6_AI_PROVIDER_INTEGRATION.md`](file:///c:/Users/smara/Desktop/o-travelz/docs/PHASE12_STEP6_AI_PROVIDER_INTEGRATION.md): Authoritative Step 6 documentation.

---

## 9. Exact Files Modified
- [`backend/app/core/config.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/core/config.py): Added provider-neutral `ai_provider`, `ai_model_name`, `ai_api_key`, `ai_api_base_url`, `ai_timeout_seconds`, `ai_max_retries`.
- [`backend/app/ai/contracts.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/contracts.py): Added `ProviderErrorCode` enum and `AIProviderError` structured exception hierarchy with secret masking.
- [`backend/app/ai/adapter.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/adapter.py): Added `get_status()` contract, `RuleBasedProviderAdapter`, `GenericHTTPProviderAdapter`, and `create_provider_adapter` factory.
- [`backend/app/ai/__init__.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/__init__.py): Exported new provider adapter classes, exceptions, and factory.
- [`backend/app/ai/conversation.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/conversation.py): Added `AIProviderError` containment, payload size validation, and loop protections.
- [`backend/app/api/ai_routes.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/api/ai_routes.py): Wired `create_provider_adapter(settings)` into `get_grounded_orchestrator`.

---

## 10. Dependencies Added
- **External dependencies added**: **0** (Pure Python 3.12 standard library `urllib`, existing Pydantic V2, FastAPI, and SQLAlchemy).

---

## 11. Quality Gate Results

| Quality Gate | Command | Result |
| :--- | :--- | :--- |
| **Focused Step 6 Tests** | `pytest backend/tests/test_ai_provider_adapter.py` | **30 passed in 2.46s (100% PASS)** |
| **Step 4 Adapter Tests** | `pytest backend/tests/test_ai_tool_adapter.py` | **25 passed in 1.22s (100% PASS)** |
| **Step 5 Conversation Tests** | `pytest backend/tests/test_ai_grounded_conversation.py` | **16 passed in 2.54s (100% PASS)** |
| **All AI Test Suites** | `pytest backend/tests/test_ai_*.py` | **122 passed in 3.87s (100% PASS)** |
| **Full Backend Suite** | `pytest backend/tests` | **623 passed, 2 deselected in 21.15s (100% PASS)** |
| **Python Compilation** | `python -m compileall backend scripts` | **0 errors (Exit Code 0)** |
| **Full Frontend Suite** | `npm --prefix frontend test` | **323 passed, 5 skipped across 37 test files (100% PASS)** |
| **Frontend Production Build** | `npm --prefix frontend run build` | **0 errors, built in 8.08s** |
| **Git Diff Check** | `git diff --check` | **Clean (0 format errors)** |

---

## 12. Invariants Preserved
- SearchNormalizer, SearchService, and SearchRanker: **100% UNTOUCHED**
- Ranking formulas, weights, and tie-breakers: **100% UNTOUCHED**
- Database models, migrations, and canonical place records: **100% UNTOUCHED**
- Canonical multilingual taxonomy (Odia, Hindi, English): **100% UNTOUCHED**
- Non-leisure domain isolation (`hospital`, `emergency_facility`, `transit_hub`): **100% PRESERVED**
- Zero-fabrication guarantee: **100% PRESERVED**
- Step 4 `ToolExecutionBoundary` authority: **100% PRESERVED**
- Step 5 multilingual grounding semantics: **100% PRESERVED**
- Frontend multilingual search and navigation: **100% PRESERVED**

---

## 13. Explicit Statement on Provider Decision Blocker
**Status**: `PHASE 12 STEP 6 — BLOCKED / PROVIDER DECISION REQUIRED`

The provider-neutral production boundary is fully implemented, verified, and regression-tested. However, live commercial model activation is intentionally blocked because no commercial vendor (e.g. OpenAI, Google Gemini, Anthropic, Azure OpenAI) has been authorized in the canonical project documentation.

To activate a commercial model in production:
1. Canonical documentation must formally approve the vendor selection.
2. The appropriate environment variables (`AI_PROVIDER="openai_compatible"`, `AI_API_BASE_URL="..."`, `AI_API_KEY="..."`, `AI_MODEL_NAME="..."`) must be configured.
3. The existing `GenericHTTPProviderAdapter` and `GroundedConversationOrchestrator` will immediately communicate with the authorized endpoint without any modifications to domain services, ranking, database, or grounding boundaries.
