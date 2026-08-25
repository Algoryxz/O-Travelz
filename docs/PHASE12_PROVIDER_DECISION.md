# Phase 12 Step 6A — Canonical AI Provider Selection Audit & Production Decision Preparation

## 1. Title & Status
- **Document Title**: Canonical AI Provider Selection Audit & Production Decision Preparation
- **Current Canonical Status**:
```text
PHASE 12 STEP 6 — BLOCKED / PROVIDER DECISION REQUIRED
```
- **Audit Date**: August 2026
- **Auditor**: O-Travelz Core Architecture & Verification Agent

---

## 2. Executive Summary & Objective

The O-Travelz repository has implemented Phase 12 Steps 1 through 7:
- **Phase 12 Steps 1–3**: Multilingual knowledge taxonomy (30 districts, 16 categories, 12 interests in English, Odia, Hindi), Unicode-safe search normalization, 8-tier deterministic search ranking, and live frontend search with Indic script typography.
- **Phase 12 Steps 4–5**: Provider-neutral AI contracts (`ToolDefinition`, `ToolCall`, `ToolResult`, `ChatMessage`, `AdapterResponse`), authoritative `ToolExecutionBoundary`, allowlisted `ToolRegistry`, multilingual grounding orchestrator (`GroundedConversationOrchestrator`), and `POST /ai/converse` endpoint.
- **Phase 12 Step 6 (Infrastructure)**: Environment-backed configuration, canonical provider error model (`AIProviderError`), generic HTTP/OpenAI-compatible protocol adapter (`GenericHTTPProviderAdapter`), adapter factory, and secret masking.
- **Phase 12 Step 7**: Frontend multi-turn grounded conversation integration (`useAIConversation`, `AIConversationPanel`, `AISidebar`) with grounded trust badges (*"Grounded in verified O-Travelz data"*) and tool activity indicators.

**The Crucial Blocker**:
No commercial, hosted, or self-hosted AI model provider (e.g. OpenAI, Google Gemini, Anthropic Claude, Azure OpenAI, Ollama, vLLM) has been canonically authorized or selected in the repository's authoritative documentation (`docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/PHASES.md`, `docs/RULES.md`).

This document provides a rigorous, objective, and auditable decision framework and comparative matrix to enable an explicit human provider decision by the project owner without prematurely coupling the codebase to any specific vendor.

---

## 3. Canonical Documentation & Repository Audit Findings

An exhaustive scan across all documentation, source code, scripts, and commit records yielded the following findings:

| Audit Dimension | Evidence Found in Repository | Canonical Decision Status |
| :--- | :--- | :--- |
| **`docs/PRD.md`** | Specifies deterministic itinerary generation, PostGIS geospatial projection, and natural language trip customization. | **NO provider specified** |
| **`docs/ARCHITECTURE.md`** | Defines layered architecture with provider-neutral AI adapter interface. | **NO provider specified** |
| **`docs/PHASES.md`** | Documents Phase 12 Steps 1–7; marks Step 6 provider decision as `BLOCKED / PROVIDER DECISION REQUIRED`. | **NO provider specified** |
| **`docs/RULES.md`** | Mandates zero external SDK additions without explicit authorization; forbids synthetic data fabrication. | **Prohibits silent provider choice** |
| **Environment Variables (`.env`, `.env.example`)** | Contains `ENVIRONMENT`, `DATABASE_URL`, `STORAGE_BACKEND`. Optional `AI_*` variables default to `"mock"`. | **Zero active provider API keys** |
| **Package Manifests (`requirements.txt`, `package.json`)** | `fastapi`, `sqlalchemy`, `pydantic`, `react`, `leaflet`, `vitest`. Zero AI vendor SDKs. | **Zero AI SDK dependencies** |
| **Source Code (`backend/app/ai/`)** | Implements `MockProviderAdapter`, `RuleBasedProviderAdapter`, and generic REST client `GenericHTTPProviderAdapter`. | **Provider-neutral protocol only** |

**Conclusion**: There is **NO canonical provider authorization** in the repository. The provider selection decision remains exclusively with human leadership.

---

## 4. Candidate Category Evaluation

The evaluation examines four hosted/commercial candidates and two self-hosted/open-model candidates against the O-Travelz architecture.

### 4.1. Hosted / Commercial Candidates

#### 4.1.1. OpenAI (e.g. GPT-4o, GPT-4o-mini)
- **Multilingual English/Odia/Hindi suitability**: Strong general Indic language understanding for Hindi; moderate to strong for Odia vocabulary and script tokenization (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Structured tool calling capability**: Native support for JSON Schema function calling with explicit `tool_choice` and parallel tool execution.
- **JSON/schema adherence**: Very high adherence to JSON Schema tool parameter definitions.
- **Streaming suitability**: Server-Sent Events (SSE) streaming format supported for chat completions and tool calls.
- **Latency considerations**: Cloud API round-trip latency depending on network region (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Deployment complexity**: Very low (REST endpoint over HTTPS; zero infrastructure management).
- **Credential/configuration requirements**: Requires `AI_API_KEY`, optional `AI_API_BASE_URL` (defaults to `https://api.openai.com/v1`), `AI_MODEL_NAME`.
- **Privacy/data-control implications**: User travel prompts transmitted to OpenAI cloud servers subject to OpenAI commercial terms and privacy policy.
- **Operational dependency**: Third-party cloud availability, rate limits, and uptime SLAs.
- **Integration complexity with `AIProviderAdapter`**: Direct drop-in compatibility with existing `GenericHTTPProviderAdapter` (`"openai_compatible"`).
- **Compatibility with `ToolExecutionBoundary`**: Fully compatible; tool call IDs and arguments map directly to `ToolCall` and `ToolExecutionBoundary`.
- **Suitability for offline development**: Not suitable offline without internet connectivity and active API key.
- **Suitability for production deployment**: High for managed cloud production.
- **Vendor lock-in considerations**: Low when accessed via standard OpenAI-compatible REST protocol.
- **Failure/retry behavior**: Well-documented HTTP error codes (401, 429, 500, 503) mapping directly to `AIProviderError`.
- **Cost model considerations**: Pay-per-token API consumption (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **External SDK requirement**: **NO SDK required**; supported natively via Python standard library `urllib` in `GenericHTTPProviderAdapter`.

---

#### 4.1.2. Google Gemini (e.g. Gemini 1.5 Pro, Gemini 1.5 Flash)
- **Multilingual English/Odia/Hindi suitability**: Strong Indic multilingual capabilities and multimodal context handling (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Structured tool calling capability**: Native function calling declaration format (`functionDeclarations`) and structured output mode.
- **JSON/schema adherence**: High adherence to OpenAPI / JSON Schema function declarations.
- **Streaming suitability**: REST and gRPC streaming supported.
- **Latency considerations**: Flash models offer low time-to-first-token (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Deployment complexity**: Low (Google Cloud managed REST endpoint).
- **Credential/configuration requirements**: Requires Google AI Studio API key or Google Cloud Vertex AI service account credentials.
- **Privacy/data-control implications**: Prompts transmitted to Google Cloud subject to Google enterprise/developer terms.
- **Operational dependency**: Google Cloud service uptime and quota management.
- **Integration complexity with `AIProviderAdapter`**: Minor mapping required if using native Google Gemini REST schema, or direct if routed through an OpenAI-compatible proxy gateway.
- **Compatibility with `ToolExecutionBoundary`**: Fully compatible; function declarations map 1-to-1 with `ToolDefinition`.
- **Suitability for offline development**: Not suitable offline without internet access.
- **Suitability for production deployment**: High for cloud and enterprise deployments.
- **Vendor lock-in considerations**: Moderate if using proprietary Gemini SDK features; low if using REST standard.
- **Failure/retry behavior**: Standard HTTP status codes mapping to `AIProviderError`.
- **Cost model considerations**: Pay-per-token / character with free tier allowances (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **External SDK requirement**: **NO SDK required** if using standard REST endpoints or proxy; optional `google-generativeai` SDK if native auth required.

---

#### 4.1.3. Anthropic (e.g. Claude 3.5 Sonnet, Claude 3.5 Haiku)
- **Multilingual English/Odia/Hindi suitability**: High quality reasoning across English and Hindi; Odia script handling requires validation (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Structured tool calling capability**: Native `tools` array with JSON Schema `input_schema` and `tool_use` content blocks.
- **JSON/schema adherence**: Very high fidelity tool argument formatting.
- **Streaming suitability**: SSE streaming supported with fine-grained tool block deltas.
- **Latency considerations**: Competitive latency across Sonnet and Haiku tiers (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Deployment complexity**: Low (REST endpoint over HTTPS).
- **Credential/configuration requirements**: Requires `x-api-key` header and `anthropic-version` header.
- **Privacy/data-control implications**: Data processed by Anthropic cloud under commercial API terms.
- **Operational dependency**: Anthropic API service availability.
- **Integration complexity with `AIProviderAdapter`**: Moderate (Anthropic uses `tool_use` inside `content` rather than OpenAI `choices[0].message.tool_calls`); straightforward adapter implementation or OpenAI-compatible proxy.
- **Compatibility with `ToolExecutionBoundary`**: Fully compatible with `ToolExecutionBoundary`.
- **Suitability for offline development**: Not suitable offline.
- **Suitability for production deployment**: High for managed cloud environments.
- **Vendor lock-in considerations**: Low to moderate.
- **Failure/retry behavior**: Clear HTTP status codes and error JSON.
- **Cost model considerations**: Pay-per-token API consumption (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **External SDK requirement**: **NO SDK required**; REST protocol can be implemented via standard library `urllib`.

---

#### 4.1.4. Azure OpenAI Service
- **Multilingual English/Odia/Hindi suitability**: Same model capabilities as OpenAI (GPT-4o / GPT-4o-mini).
- **Structured tool calling capability**: Native OpenAI tool-calling API format with enterprise SLA.
- **JSON/schema adherence**: Identical to OpenAI.
- **Streaming suitability**: SSE streaming with enterprise gateway options.
- **Latency considerations**: Latency depends on Azure resource region deployment (e.g. Central India, East US) (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Deployment complexity**: Moderate (Azure subscription, resource group, model deployment name, and IAM/role assignment required).
- **Credential/configuration requirements**: Requires `api-key` header (or Azure AD Managed Identity OAuth token) and `api-version` query parameter.
- **Privacy/data-control implications**: Enterprise data governance; data stays within Microsoft Azure tenant boundary; no model training on customer data.
- **Operational dependency**: Microsoft Azure cloud infrastructure.
- **Integration complexity with `AIProviderAdapter`**: Very low; fully compatible with `GenericHTTPProviderAdapter` with Azure query parameter header configuration.
- **Compatibility with `ToolExecutionBoundary`**: Fully compatible.
- **Suitability for offline development**: Not suitable offline.
- **Suitability for production deployment**: Extremely high for enterprise, sovereign, or compliance-restricted production.
- **Vendor lock-in considerations**: Moderate (Azure-specific URL and authentication scheme).
- **Failure/retry behavior**: Standard Azure REST error schemas mapping to `AIProviderError`.
- **Cost model considerations**: Azure consumption pricing or provisioned throughput units (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **External SDK requirement**: **NO SDK required**; standard HTTP client works directly.

---

### 4.2. Self-Hosted / Open-Model Candidates

#### 4.2.1. Ollama (e.g. Llama 3.1, Mistral, Gemma 2)
- **Multilingual English/Odia/Hindi suitability**: Depends heavily on selected open weights (e.g. Llama 3.1 has strong multilingual pretraining; smaller models may degrade on Odia script) (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Structured tool calling capability**: Native tool calling supported on compatible models (e.g. Llama 3.1, Mistral-Nemo) via Ollama `/api/chat` and `/v1/chat/completions`.
- **JSON/schema adherence**: Moderate to high depending on parameter size (8B vs 70B).
- **Streaming suitability**: Supported locally over HTTP.
- **Latency considerations**: Highly dependent on local hardware (GPU VRAM vs CPU inference) (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Deployment complexity**: Low to moderate for local machine (`ollama run llama3.1`); moderate for server orchestration.
- **Credential/configuration requirements**: No API key required for local instance; needs `AI_API_BASE_URL="http://localhost:11434/v1"`.
- **Privacy/data-control implications**: 100% on-premises / local data privacy; zero external network transmission.
- **Operational dependency**: Self-managed hardware, GPU resources, and process lifecycle.
- **Integration complexity with `AIProviderAdapter`**: Zero additional code; works immediately with existing `GenericHTTPProviderAdapter` (`"openai_compatible"`) pointing to `http://localhost:11434/v1`.
- **Compatibility with `ToolExecutionBoundary`**: Fully compatible.
- **Suitability for offline development**: **Outstanding (100% offline air-gapped development possible)**.
- **Suitability for production deployment**: Moderate (requires dedicated GPU instance management and scaling).
- **Vendor lock-in considerations**: Zero vendor lock-in; open model weights and open-source runtime.
- **Failure/retry behavior**: Standard local HTTP response errors.
- **Cost model considerations**: Fixed infrastructure / hardware compute costs (zero per-token API fees).
- **External SDK requirement**: **NO SDK required**.

---

#### 4.2.2. vLLM (High-Throughput Open Model Inference Server)
- **Multilingual English/Odia/Hindi suitability**: Depends on underlying open weights deployed (e.g. Qwen 2.5, Llama 3.1, Sarvam AI Indic models) (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Structured tool calling capability**: OpenAI-compatible `/v1/chat/completions` endpoint with guided decoding (outlines, json-schema) support.
- **JSON/schema adherence**: Very high when utilizing guided decoding constraints.
- **Streaming suitability**: High-performance PagedAttention SSE streaming.
- **Latency considerations**: Industry-leading throughput for multi-user concurrent serving (`REQUIRES CURRENT PROVIDER DOCUMENTATION / HUMAN VERIFICATION`).
- **Deployment complexity**: High (requires Linux/Docker container, NVIDIA CUDA GPUs, VRAM provisioning).
- **Credential/configuration requirements**: Optional bearer token; needs `AI_API_BASE_URL="http://<vllm-host>:8000/v1"`.
- **Privacy/data-control implications**: 100% private self-hosted or private cloud VPC infrastructure.
- **Operational dependency**: Self-hosted GPU cluster management, monitoring, and scaling.
- **Integration complexity with `AIProviderAdapter`**: Zero additional code; native drop-in with `GenericHTTPProviderAdapter`.
- **Compatibility with `ToolExecutionBoundary`**: Fully compatible.
- **Suitability for offline development**: Moderate to low (requires high-end local GPU workstation).
- **Suitability for production deployment**: Outstanding for high-scale private cloud / sovereign infrastructure.
- **Vendor lock-in considerations**: Zero lock-in.
- **Failure/retry behavior**: Standard HTTP status codes.
- **Cost model considerations**: GPU compute instance hourly costs (e.g. AWS EC2 g5/p4, Azure NC series).
- **External SDK requirement**: **NO SDK required**.

---

## 5. Qualitative Decision Framework & Comparison Matrix

| Evaluation Dimension | OpenAI (Hosted) | Google Gemini (Hosted) | Anthropic (Hosted) | Azure OpenAI (Enterprise) | Ollama (Local/Self-Hosted) | vLLM (GPU Cluster) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Grounded Tool Calling** | Native / High | Native / High | Native / High | Native / High | Native (Model dependent) | High (Guided decoding) |
| **2. Multilingual (En/Or/Hi)** | High (En/Hi), Mod (Or) | High (En/Hi/Or) | High (En/Hi), Mod (Or) | High (En/Hi), Mod (Or) | Weight dependent | Weight dependent |
| **3. Structured Schema Fidelity** | Very High | High | Very High | Very High | Moderate to High | Very High |
| **4. Security Boundary Fit** | Direct 1-to-1 | Direct 1-to-1 | Direct 1-to-1 | Direct 1-to-1 | Direct 1-to-1 | Direct 1-to-1 |
| **5. Privacy & Data Sovereignty** | Third-party cloud | Third-party cloud | Third-party cloud | Tenant-isolated cloud | **100% Air-gapped local** | **100% Private VPC** |
| **6. Operational Complexity** | **Very Low** | **Very Low** | **Very Low** | Low to Moderate | Moderate (Local) | High (GPU Infra) |
| **7. Reliability & Error Containment** | Proven HTTP codes | Proven HTTP codes | Proven HTTP codes | Enterprise SLA | Process dependent | Cluster dependent |
| **8. Cost Structure** | Per-token billing | Per-token billing | Per-token billing | Enterprise billing | Compute/Hardware only | Dedicated GPU compute |
| **9. Vendor Lock-In Risk** | Low (REST standard) | Moderate (Proprietary) | Low (REST standard) | Low (REST standard) | **Zero (Open Source)** | **Zero (Open Source)** |
| **10. Offline Dev Suitability** | None (Needs Cloud) | None (Needs Cloud) | None (Needs Cloud) | None (Needs Cloud) | **Outstanding (Local)** | Workstation dependent |
| **11. SDK Requirement** | **0 SDKs needed** | **0 SDKs needed** | **0 SDKs needed** | **0 SDKs needed** | **0 SDKs needed** | **0 SDKs needed** |
| **12. `AIProviderAdapter` Fit** | **Native `"openai_compatible"`** | Adapter or Proxy | Custom HTTP Adapter | **Native `"openai_compatible"`** | **Native `"openai_compatible"`** | **Native `"openai_compatible"`** |

---

## 6. Authoritative Human Decision Record

### Canonical Decision Status
```text
PHASE 12 STEP 8 — COMPLETE — PASS (Zero-Cost Multi-Provider AI Activation)
```

```yaml
provider_decision_record:
  decision_status: "AUTHORIZED & IMPLEMENTED (PHASE 12 STEP 8)"
  primary_provider: "azure_openai"
  secondary_provider: "gemini"
  tertiary_optional_provider: "nvidia"
  mandatory_fallback: "rule_based"
  test_fallback: "mock"
  budget_cost_constraint: "₹0 (Strict Zero-Cost Ceiling)"
  zero_cost_policy: "ai_allow_external_provider=false by default; fail safe to rule_based"
  sdk_requirement: "NONE (0 vendor SDKs, pure Python standard library urllib)"
  decision_date: "2026-08-22"
  approval_reference: "PHASE 12 STEP 8 DIRECTIVE"
```


---

## 7. Next Implementation Contract (Post-Decision Requirements)

Once the project owner authorizes a specific provider by completing the decision record above, the implementing engineer MUST abide by the following strict architectural constraints:

### 7.1. Mandatory Requirements
1. **Adapter Interface**: Implement or configure `AIProviderAdapter` (`backend/app/ai/adapter.py`).
2. **Canonical Contracts**: Utilize existing `ChatMessage`, `ToolDefinition`, `ToolCall`, `ToolResult`, and `AdapterResponse`.
3. **Preserve `ToolCall.id`**: Every generated tool invocation must preserve `id` throughout its execution lifecycle.
4. **Authoritative Execution**: Route 100% of tool executions through `ToolExecutionBoundary.execute()`.
5. **Allowlist Enforced**: Reject any tool invocation not explicitly registered in `ToolRegistry`.
6. **Schema Validation**: Parse and validate model-generated arguments against Pydantic models before domain execution.
7. **Error Normalization**: Map all provider failures to `AIProviderError` subclasses with clean HTTP error codes.
8. **Credential Redaction**: Ensure zero API keys, authorization tokens, or secrets are exposed in logs, exceptions, or responses.
9. **Multilingual Grounding**: Preserve domain fact grounding via `GroundedConversationOrchestrator`.
10. **Zero Frontend Rewrites**: Existing frontend `useAIConversation` and `AIConversationPanel` must remain untouched.

### 7.2. Strict Prohibitions
1. **NO Vendor SDKs**: Do NOT install `openai`, `google-generativeai`, `anthropic`, or heavy LLM frameworks. Use standard library `urllib` or existing `httpx`.
2. **NO Domain Bypass**: Do NOT place AI provider calls directly inside `SearchService`, `PlaceRepository`, or `ItineraryService`.
3. **NO Arbitrary Execution**: Do NOT allow model outputs to invoke Python builtins (`exec`, `eval`, `__import__`).
4. **NO Data Fabrication**: Do NOT allow the model to invent places, districts, transport routes, or phone numbers.
5. **NO Domain Contamination**: Preserve strict domain isolation for `hospital`, `emergency_facility`, and `transit_hub`.

---

## 8. Security & Credential Audit Results

- **Secrets in Git History / Working Copy**: **0 active secrets found**.
- **`.env` Inspection**: Contains only local PostgreSQL connection string and local filesystem storage path. Zero API keys.
- **Status Endpoint Redaction**: Verified that `get_status()` strips `api_key` and credentials.
- **Exception Redaction**: Verified that `AIProviderError` masks bearer tokens and URL query parameters.

---

## 9. Dependency Audit Results

- **Python Dependencies (`backend/requirements.txt`)**: 14 standard packages. **0 AI vendor SDKs**.
- **Node.js Dependencies (`frontend/package.json`)**: 8 standard React/Vite/Tailwind packages. **0 AI vendor SDKs**.
- **Provider Protocol Implementation**: Implemented exclusively with Python standard library `urllib.request` and standard JSON serialization.

---

## 10. Quality Gate Verification

| Test Suite | Command | Result |
| :--- | :--- | :--- |
| **Focused Provider Adapter** | `pytest backend/tests/test_ai_provider_adapter.py` | **30 passed in 2.46s (100% PASS)** |
| **Focused Tool Adapter** | `pytest backend/tests/test_ai_tool_adapter.py` | **25 passed in 0.45s (100% PASS)** |
| **Focused Grounded Conversation** | `pytest backend/tests/test_ai_grounded_conversation.py` | **16 passed in 0.65s (100% PASS)** |
| **All AI Backend Tests** | `pytest backend/tests/test_ai_*.py` | **71 passed in 3.54s (100% PASS)** |
| **Full Backend Pytest** | `pytest backend/tests` | **623 passed, 2 deselected in 25.06s (100% PASS)** |
| **Python Compilation** | `python -m compileall backend scripts` | **0 errors (Exit Code 0)** |
| **Focused Frontend Conversation** | `npm --prefix frontend test -- tests/ai_grounded_conversation.test.tsx` | **11 passed in 25ms (100% PASS)** |
| **Full Frontend Vitest** | `npm --prefix frontend test` | **334 passed, 5 skipped across 38 test files (100% PASS)** |
| **Frontend Production Build** | `npm --prefix frontend run build` | **0 errors in 8.37s** |
| **Git Diff Formatting** | `git diff --check` | **Clean (0 format errors)** |
