# Phase 12 Step 4 — Provider-Neutral AI Tool-Calling Adapter Architecture

## 1. Title & Status
- **Title**: Phase 12 Step 4 — Provider-Neutral AI Tool-Calling Adapter Architecture
- **Status**: `COMPLETE — PASS`
- **Execution Date**: August 2026

---

## 2. Architecture Audit Findings
Prior to Phase 12 Step 4, O-Travelz possessed early rule-based AI orchestration (`backend/app/ai/orchestrator.py`) and discrete tools (`SearchPlacesTool`, `BuildItineraryTool`, `PlanTransportHopTool`, `GetProviderStatusTool`). However:
- Tool definitions lacked JSON Schema standardization for modern LLM tool-calling (OpenAI function calling, Anthropic tools, Gemini tool declarations).
- There was no formal `AIProviderAdapter` protocol decoupling model generation from domain logic.
- There was no central `ToolRegistry` enforcing allowlisting, duplicate detection, or structured tool discovery.
- `ToolCall` and `ToolResult` lacked unified identifier linkage (`tool_call_id`).

---

## 3. Existing AI & Provider Capabilities Discovered
- **Existing AI Orchesration**: `backend/app/ai/orchestrator.py` mediating intent extraction and grounded fact synthesis.
- **Existing Model Adapters**: `ModelAdapter`, `FakeModelAdapter`, and `RuleBasedModelAdapter` in `backend/app/ai/model.py`.
- **Existing Grounding Boundary**: `GroundingBoundary` and `GroundingContext` in `backend/app/ai/grounding.py`.
- **Existing Domain Services**:
  - `SearchService.retrieve_places()` for Whole-Odisha knowledge retrieval.
  - `ItineraryService.plan()` for deterministic multi-day schedule generation.
  - `TransportService.plan_transport_hop()` for multimodal route lookup.
  - `TransportService.get_provider_status()` for transit provider availability.

---

## 4. Provider-Neutral Contracts (`backend/app/ai/contracts.py`)
Established lightweight, standard Pydantic V2 contracts:
- `ToolDefinition`: Standardized JSON Schema definition with `name`, `description`, and `input_schema`.
- `ToolCall`: Canonical model tool invocation request with auto-generated `id`, `name`, and parsed `arguments: dict[str, Any]`.
- `ToolResult`: Canonical result payload with `tool_call_id`, `tool_name`, `status: ToolStatus`, structured `data`, `reason`, and `error`.
- `ChatMessage` & `ChatRole`: Provider-neutral conversation history with roles `system`, `user`, `assistant`, `tool`.
- `AdapterResponse` & `FinishReason`: Vendor-agnostic response envelope with `content`, `tool_calls: list[ToolCall]`, `finish_reason: FinishReason`, and `metadata`.

---

## 5. Tool Registry (`backend/app/ai/registry.py`)
- `BaseToolAdapter`: Abstract base class requiring `definition: ToolDefinition` and `execute(arguments, tool_call_id) -> ToolResult`.
- `FunctionalToolAdapter`: Lightweight adapter wrapping any callable with a `ToolDefinition`.
- `ToolRegistry`:
  - `register(tool | (definition, executor))`: Registers a tool; raises `DuplicateToolError` on collisions.
  - `get(name: str)` / `get_or_raise(name: str)`: Resolves a tool adapter or raises `UnknownToolError`.
  - `list_definitions()`: Formats all registered tools for model consumption.
  - `list_tool_names()`: Returns sorted list of registered tool identifiers.
  - `unregister(name: str)` and `clear()`: Lifecycle management for tests and runtime isolation.

---

## 6. Tool Execution Boundary (`backend/app/ai/boundary.py`)
`ToolExecutionBoundary` acts as an explicit trust boundary between untrusted model outputs and verified internal domain logic:
1. **Schema Validation**: Validates `ToolCall` payload structure.
2. **Allowlist Resolution**: Rejects unregistered or arbitrary callable invocations with `ToolStatus.UNKNOWN`.
3. **Argument Validation**: Catches malformed arguments and returns `ToolStatus.INVALID` without uncaught crashes.
4. **Defensive Execution**: Safely invokes registered tool adapters within exception guards, returning `ToolStatus.ERROR` on failure.
5. **No Reflection/Eval**: Prevents arbitrary Python evaluation or code injection from model outputs.

---

## 7. Provider Adapter Interface (`backend/app/ai/adapter.py`)
- `AIProviderAdapter(ABC)`: Standard protocol declaring `generate(messages: list[ChatMessage], tools: list[ToolDefinition] | None, **kwargs) -> AdapterResponse`.
- `MockProviderAdapter`: Deterministic offline provider for unit tests and local simulation supporting canned tool calls, keyword triggers, and custom handlers with zero external network requests.

---

## 8. Domain-Tool Mapping (`backend/app/ai/tools/adapters.py`)
Wrapped verified O-Travelz services as `BaseToolAdapter` implementations:
1. `SearchPlacesToolAdapter`: Whole-Odisha search & retrieval by query, district, category, interest, coordinates, and emergency flags.
2. `BuildItineraryToolAdapter`: Multi-day itinerary generator across verified places with duration and pacing constraints.
3. `PlanTransportHopToolAdapter`: Multimodal transport hop router between verified coordinates.
4. `GetProviderStatusToolAdapter`: Operational status check for verified transit providers (`ama-bus`, `mo-e-ride`).
5. `create_default_tool_registry(db, itinerary_service, transport_service)`: Factory populating all canonical tools.

---

## 9. Security & Trust Boundaries
- **Strict Allowlisting**: Only explicitly registered tools can execute; attempts to call system builtins (`eval`, `exec`, `os.system`) or unregistered names return `ToolStatus.UNKNOWN`.
- **Untrusted Model Output**: Model tool calls are treated as untrusted input; arguments are strictly validated against Pydantic models before domain invocation.
- **Data Isolation**: Non-leisure domain categories (`hospital`, `emergency_facility`, `transit_hub`) are strictly isolated and only retrieved when explicitly requested.
- **Zero Fabrication**: Unknown queries return truthful empty results; no synthetic places or coordinates are generated.

---

## 10. Exact Files Created
- [`backend/app/ai/contracts.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/contracts.py)
- [`backend/app/ai/registry.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/registry.py)
- [`backend/app/ai/boundary.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/boundary.py)
- [`backend/app/ai/adapter.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/adapter.py)
- [`backend/app/ai/tools/adapters.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/tools/adapters.py)
- [`backend/tests/test_ai_tool_adapter.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/tests/test_ai_tool_adapter.py)
- [`docs/PHASE12_STEP4_AI_TOOL_ADAPTER.md`](file:///c:/Users/smara/Desktop/o-travelz/docs/PHASE12_STEP4_AI_TOOL_ADAPTER.md)

---

## 11. Exact Files Modified
- [`backend/app/ai/__init__.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/__init__.py): Exported provider-neutral adapter and registry symbols.
- [`backend/app/ai/tools/__init__.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/tools/__init__.py): Exported domain tool adapters and registry factory.
- [`backend/app/ai/tools/common.py`](file:///c:/Users/smara/Desktop/o-travelz/backend/app/ai/tools/common.py): Added `tool_call_id` to `ToolResult`.

---

## 12. Dependencies Added
- **External dependencies added**: **0** (Pure Python 3.12 standard library + existing Pydantic V2 and SQLAlchemy).

---

## 13. Tests Added & Verification Results
- **New Unit & Integration Tests**: **25 tests** in `backend/tests/test_ai_tool_adapter.py` covering contracts, registry duplicate/unknown handling, execution boundary validation, mock provider simulation, domain tool execution, and security boundaries.

---

## 14. Quality Gate Results

| Quality Gate | Command | Result |
| :--- | :--- | :--- |
| **Focused Step 4 Tests** | `pytest backend/tests/test_ai_tool_adapter.py` | **25 passed in 1.27s (100% PASS)** |
| **Full Backend Suite** | `pytest backend/tests` | **577 passed, 2 deselected in 22.04s (100% PASS)** |
| **Python Compilation** | `python -m compileall backend scripts` | **0 errors (Exit Code 0)** |
| **Full Frontend Suite** | `npm --prefix frontend test` | **323 passed, 5 skipped across 37 test files (100% PASS)** |
| **Frontend Production Build** | `npm --prefix frontend run build` | **0 errors, built in 13.53s** |
| **Git Diff Check** | `git diff --check` | **Clean (0 format errors)** |

---

## 15. Invariants Verified
- Backend search ranking formulas, weights, and tie-breakers: **100% UNTOUCHED**
- SearchNormalizer, SearchService, and SearchRanker: **100% UNTOUCHED**
- Database models, migrations, and canonical place records: **100% UNTOUCHED**
- Non-leisure domain isolation: **100% PRESERVED**
- Zero-fabrication guarantee: **100% PRESERVED**
- Frontend multilingual search and discovery: **100% PRESERVED**
- Navigation, URL hash routing, and tab synchronization: **100% PRESERVED**

---

## 16. Explicit Statement of What Was NOT Implemented
- No real external AI vendor SDKs (OpenAI, Anthropic, Google Gemini SDK) were installed or coupled to the domain layer.
- No API keys or external network calls were added.
- No agent or heavy orchestration frameworks were introduced.
- Phase 12 Step 5 (Multilingual Grounded AI Conversations & Itinerary Integration) was **NOT** started.

---

## 17. Next-Step Recommendation
- Proceed to **Phase 12 Step 5: Multilingual Grounded AI Conversations & Itinerary Integration** upon explicit user instruction.
