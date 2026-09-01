# O-Travelz Phase 12 — Discovery, Multilingual Knowledge Base & AI Architecture Audit

**Author**: Systems, AI Grounding, Data Architecture & Multilingual Core Team (Smarak)  
**Date**: August 22, 2026  
**Status**: **DISCOVERY & ARCHITECTURE AUDIT COMPLETE — PHASE 12 ROADMAP BASELINE**  

---

## 1. Executive Summary & Phase 12 Scope

Phase 12 expands O-Travelz into a **multilingual, provider-neutral AI-orchestrated travel intelligence platform** for the entire state of Odisha. Building directly on the verified Phase 11 baseline (161 canonical places across all 30 districts, PostGIS geospatial foundation, deterministic 8-tier relevance search, and strict domain separation), Phase 12 delivers:

1. **Multilingual Odisha Knowledge Base**: Native Odia (**ଓଡ଼ିଆ** - `\u0B00-\u0B7F`) and Hindi (**हिन्दी** - `\u0900-\u097F`) support across administrative districts, physical categories, thematic interests, and verified cultural/historical aliases without violating the zero-fabrication invariant.
2. **Multilingual Search Normalization & Retrieval**: Extension of `SearchNormalizer` and `SearchRanker` to support Indic Unicode scripts, transliterated search queries, and script-aware tokenization while preserving deterministic ranking and domain separation (tourist attractions vs. medical facilities vs. transit hubs).
3. **Provider-Neutral AI Tool-Calling Architecture**: A decoupled, provider-agnostic adapter framework enabling pluggable LLM backends (rule-based, local, or cloud providers) that execute deterministic tools (`SearchPlacesTool`, `BuildItineraryTool`) strictly through the `GroundingBoundary` with zero hallucination.
4. **Comprehensive Multilingual & Grounding Test Suites**: End-to-end test coverage validating English, Odia, and Hindi queries, cross-lingual discovery, medical isolation, itinerary generation, grounding rejection of fabricated claims, and graceful degradation when upstream providers are unreachable.

---

## 2. Baseline Verification & Quality Gate Audit

Prior to any Phase 12 modifications, a full-system audit verified the existing codebase integrity:

| System Dimension | Diagnostic Command | Result | Verified Invariants |
| :--- | :--- | :---: | :--- |
| **Canonical Knowledge Base** | `python scripts/audit_data_quality.py --json` | **PASS (0 FAIL, 0 WARN)** | 161 places, 30/30 districts, 16 categories, 12 interests, 358 associations, $[17.5-22.8^\circ\text{N}, 81.2-87.6^\circ\text{E}]$ |
| **Backend Pytest Suite** | `pytest backend/tests` | **387 passed, 2 deselected** | Deterministic search, routing, itinerary sequencing, PostGIS projection, AI intent, medical isolation |
| **Frontend Vitest Suite** | `npm --prefix frontend test -- --run` | **295 passed, 5 skipped** | UI navigation, hash sync, Leaflet map, debounced search, privacy consent gate |
| **Frontend Production Build** | `npm --prefix frontend run build` | **Clean build in 9.96s** | Zero TypeScript errors, Rollup chunks optimized |
| **Python Syntax & Bytecode** | `python -m compileall backend scripts` | **0 errors** | Valid Python 3.12 syntax across all packages |
| **Git Diff Whitespace Check** | `git diff --check` | **Clean** | 0 whitespace or merge artifact issues |
| **System Health Doctor** | `powershell .\doctor.ps1` | **11/11 PASS (READY)** | PostGIS 3.4.3 on host 5433, Node v24, Python 3.12, .env present |

---

## 3. Subsystem Architecture & Extension Points Audit

### 3.1 Search & Normalization (`backend/app/services/search/`)

#### Current State & Gaps:
- `search_normalizer.py` currently contains:
  ```python
  cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
  ```
  **Critical Finding**: This regex strips all non-ASCII characters, completely wiping out native Odia (`[\u0B00-\u0B7F]`) and Devanagari/Hindi (`[\u0900-\u097F]`) text during normalization.
- `STOP_WORDS` is English-only. Odia stop words (e.g., `ରେ`, `ର`, `ଏବଂ`, `ଓ`, `ଠାରେ`, `ପାଇଁ`, `ଭ୍ରମଣ`, `ସ୍ଥାନ`) and Hindi stop words (e.g., `में`, `का`, `की`, `के`, `और`, `पर`, `से`, `के लिए`, `स्थान`, `पर्यटन`) are missing.
- `ODISHA_DISTRICTS` matching is English-only. Native Odia (e.g. `ପୁରୀ`, `କଟକ`, `ଖୋର୍ଦ୍ଧା`, `ସମ୍ବଲପୁର`, `କୋରାପୁଟ`, `ମୟୂରଭଞ୍ଜ`, `ସୁନ୍ଦରଗଡ଼`) and Hindi (e.g. `पुरी`, `कटक`, `खोर्धा`, `संबलपुर`, `कोरापुट`, `मयूरभंज`, `सुंदरगढ़`) strings do not match district filters.
- `CATEGORY_KEYWORD_MAP` and `INTEREST_KEYWORD_MAP` lack Indic script terms (e.g., Odia `ମନ୍ଦିର` $\to$ `temple`, `ଜଳପ୍ରପାତ` $\to$ `waterfall`, `ସମୁଦ୍ର କୂଳ` / `ବେଳାଭୂମି` $\to$ `beach`, `ଡାକ୍ତରଖାନା` $\to$ `hospital`; Hindi `मंदिर` $\to$ `temple`, `झरना` $\to$ `waterfall`, `समुद्र तट` $\to$ `beach`, `अस्पताल` $\to$ `hospital`).
- `VERIFIED_ALIASES` contains English aliases (`Silver City`, `Temple City`, `Ekamra Kshetra`, `Jagannath Dham`, `Kashmir of Odisha`) but lacks native Odia (`ରୂପା ସହର`, `ମନ୍ଦିର ମାଳିନୀ ନଗରୀ`, `ଏକାମ୍ର କ୍ଷେତ୍ର`, `ଜଗନ୍ନାଥ ଧାମ`, `ଶ୍ରୀକ୍ଷେତ୍ର`, `ଓଡ଼ିଶାର କାଶ୍ମୀର`) and Hindi (`चांदी का शहर`, `मंदिरों का शहर`, `एकाम्र क्षेत्र`, `जगन्नाथ धाम`, `श्रीक्षेत्र`, `ओडिशा का कश्मीर`).

#### Extension Strategy:
- Update `normalize_text` to preserve Unicode letter ranges: ASCII (`a-z0-9`), Odia (`\u0B00-\u0B7F`), Devanagari (`\u0900-\u097F`), and standard Indic combining marks (virama, matras, anusvara, visarga).
- Build a dedicated multilingual taxonomy module: `backend/app/data/multilingual_taxonomy.py` defining verified script crosswalks for districts, categories, interests, and cultural aliases.
- Add multilingual tokenization and stop-word filtering without slowing down query execution.
- Maintain 100% backward compatibility with English queries and existing 8-tier ranking.

---

### 3.2 AI Orchestrator & Grounding Architecture (`backend/app/ai/`)

#### Current State & Extension Points:
- `RuleBasedModelAdapter` (`model.py`):
  - Implements `ModelAdapter` abstract base class with `parse_intent()` and `generate_response()`.
  - Currently handles English strings and simple keyword matches.
  - Generates responses with `ResponseFraming.GROUNDED_RESULT` and maps facts from `GroundingContext`.
- `AIOrchestrator` (`orchestrator.py`):
  - Manages execution of approved tools (`BuildItineraryTool`, `PlanTransportHopTool`, `GetProviderStatusTool`, `SearchPlacesTool`).
  - Enforces `GroundingContext` fact recording.
  - Invokes `GroundingBoundary.ground()`.
- `GroundingBoundary` (`grounding.py`):
  - Enforces that no factual claim can appear in the model response unless its `fact_id` and exact `value` exist in the current-turn `GroundingContext`.
  - Zero tolerance for hallucination or unverified claims.

#### Provider-Neutral Architecture Requirements:
- Formalize a `ProviderNeutralAIAdapter` interface that cleanly separates:
  1. Intent parsing / prompt engineering
  2. Standard tool call definitions (JSON Schema format for `search_places`, `build_itinerary`)
  3. LLM provider client adapters (supporting mock/rule-based, OpenAI-compatible, Google Gemini-compatible, Anthropic-compatible tool-calling formats)
  4. Response extraction & grounding verification
  5. Fallback handler when an external provider times out or fails (graceful degradation to deterministic `RuleBasedModelAdapter` or structured error without crashing)
- Ensure **NO LLM provider can bypass the `GroundingBoundary`**. All factual answers must come from tool execution outputs against the verified database/SearchService.
- Zero API keys or secrets hardcoded in the repository; strictly configurable via environment variables (`AI_PROVIDER`, `AI_MODEL_NAME`, etc.).

---

### 3.3 Data Layer & Multilingual Knowledge Representation

#### Current State & Invariants:
- Database table `places` (161 records) has English canonical fields (`name`, `description`, `address`, `district`, `category_id`).
- Requirement: **Preserve the existing zero-fabrication invariant.** Do NOT invent unverified translated descriptions, synthetic names, or speculative phone numbers.
- Strategy:
  - English remains the canonical base language in the database.
  - Multilingual aliases, district names, categories, interests, and cultural titles will be mapped deterministically through verified translation registries (`multilingual_taxonomy.py`) and verified place aliases.
  - SearchService and AI tool adapters resolve Odia, Hindi, and transliterated queries to canonical place records and return structured metadata with localized framing where verified.

---

### 3.4 Frontend Search & Discovery (`frontend/src/`)

#### Current State & Gaps:
- Frontend uses `usePlaces` and `usePlaceSearch` calling `ApiClient.listPlaces({ search, district, category, interest, region })`.
- Search input handles standard UTF-8 characters; however, placeholder text and quick filters are English-only.
- `useAIConversation` sends prompt strings to `POST /ai/plan`.
- Strategy:
  - Ensure frontend search components smoothly support typing in Odia and Devanagari keyboards as well as romanized transliterations.
  - Provide multilingual search suggestions and verify UI rendering of Odia (`ଓଡ଼ିଆ`) and Hindi (`हिन्दी`) typography.

---

## 4. Risks, Invariants & Mitigations

| Risk / Invariant | Potential Failure Mode | Mitigation & Architectural Guarantee |
| :--- | :--- | :--- |
| **Zero Fabrication Invariant** | LLM or translator invents fake Odia/Hindi names, unverified opening hours, or synthetic phone numbers. | All multilingual mapping is restricted to verified official government portals, district names, and approved cultural lexicons. Unverified facts remain `null`. |
| **Grounding Bypass Risk** | External LLM provider returns ungrounded factual statements directly in chat. | `GroundingBoundary` intercepts all model responses. Any claim not matching a current-turn tool execution fact is stripped. |
| **Search Regression Risk** | Indic Unicode regex changes break English search, alias scoring, or proximity ranking. | Comprehensive regression test suite running all 387 existing backend tests alongside new Odia/Hindi query tests. |
| **Domain Separation Leak** | Odia or Hindi search for "places to visit" returns SCB Medical College or railway stations. | `SearchService` and `SearchNormalizer` enforce `NON_LEISURE_CATEGORIES` domain separation across all languages. |
| **Provider Coupling Risk** | Backend becomes dependent on proprietary LLM SDKs or hardcoded vendor endpoints. | Provider-neutral adapter abstraction using standard JSON Schema tool-calling specifications and local deterministic fallback. |

---

## 5. Phase 12 Step-by-Step Implementation Breakdown

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 12: MULTILINGUAL ODISHA KNOWLEDGE BASE, SEARCH & PROVIDER-NEUTRAL GROUNDED AI            │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Step 1: Multilingual Architecture & Odia/Hindi Knowledge Model                                  │
│         - Create backend/app/data/multilingual_taxonomy.py (Odia, Hindi & transliterated       │
│           districts, categories, interests, and cultural aliases)                             │
│         - Data quality & linguistic verification audit                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Step 2: Multilingual SearchNormalizer, SearchService & Ranking                                  │
│         - Upgrade search_normalizer.py to support Indic scripts (Odia/Devanagari)              │
│         - Add multilingual stop words, intent extraction, and verified alias expansions        │
│         - Extend search_ranker.py and search_service.py for cross-lingual relevance            │
│         - Comprehensive unit tests in test_multilingual_search.py                              │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Step 3: Multilingual Frontend Discovery & Search UI Integration                                │
│         - Update frontend ApiClient, search hooks, and UI components for multilingual inputs   │
│         - Verify Odia, Hindi, and transliterated queries in UI search & map filters            │
│         - Frontend Vitest tests in multilingual_search.test.tsx                                │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Step 4: Provider-Neutral AI Tool-Calling Adapter Architecture                                  │
│         - Design abstract AIModelProvider & ProviderNeutralAIAdapter in backend/app/ai/        │
│         - Define standard tool definitions (search_places, build_itinerary)                    │
│         - Implement provider interface with deterministic rule-based and pluggable LLM bridges │
│         - Add fallback & timeout handling ensuring uninterrupted grounding enforcement         │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Step 5: Multilingual Grounded AI Conversations & Itinerary Integration                         │
│         - Wire multilingual intent resolution and tool invocation in AI orchestrator           │
│         - Support English, Odia, and Hindi conversational planning & discovery queries         │
│         - Comprehensive test suite in test_multilingual_ai_conversations.py                    │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Step 6: Full-System QA, Performance, Provenance Audit & Phase 12 Closeout                      │
│         - End-to-end multi-language validation across all 30 districts                          │
│         - Full test runs (pytest, vitest, build, audit_data_quality, compileall, doctor)       │
│         - Update docs/MEMORY.md, docs/PHASES.md, docs/REPOSITORY_MAP.md                        │
│         - Final closeout report docs/PHASE12_FINAL_CLOSEOUT.md                                 │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Files Matrix for Phase 12

### To Create:
- `docs/PHASE12_DISCOVERY_AUDIT.md` (This document)
- `backend/app/data/multilingual_taxonomy.py`
- `backend/app/ai/provider_adapter.py`
- `backend/tests/test_multilingual_search.py`
- `backend/tests/test_multilingual_ai_conversations.py`
- `frontend/tests/multilingual_search.test.tsx`
- `docs/PHASE12_STEP1_MULTILINGUAL_MODEL.md`
- `docs/PHASE12_STEP2_MULTILINGUAL_SEARCH.md`
- `docs/PHASE12_STEP3_MULTILINGUAL_FRONTEND.md`
- `docs/PHASE12_STEP4_PROVIDER_NEUTRAL_AI.md`
- `docs/PHASE12_STEP5_GROUNDED_CONVERSATIONS.md`
- `docs/PHASE12_FINAL_CLOSEOUT.md`

### To Modify:
- `backend/app/services/search/search_normalizer.py`
- `backend/app/services/search/search_ranker.py`
- `backend/app/services/search/search_service.py`
- `backend/app/ai/model.py`
- `backend/app/ai/orchestrator.py`
- `backend/app/ai/schemas.py`
- `backend/app/ai/grounding.py`
- `backend/app/api/ai_routes.py`
- `docs/MEMORY.md`
- `docs/PHASES.md`
- `docs/REPOSITORY_MAP.md`

---

## 7. Next Action

Proceed to **Phase 12 Step 1**: Multilingual architecture & Odia/Hindi knowledge model foundation (`backend/app/data/multilingual_taxonomy.py`), verifying all 30 districts, 16 physical categories, 12 traveler interests, and verified cultural aliases in Odia (ଓଡ଼ିଆ) and Hindi (हिन्दी).
