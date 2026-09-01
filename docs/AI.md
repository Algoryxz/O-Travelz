# AI Copilot & Grounding Architecture — O-TRAVELZ

## 1. Operating Philosophy & Rules

The O-TRAVELZ AI Copilot is an intent-parsing and itinerary explanation assistant. It is strictly grounded on deterministic travel data.

### Grounding Rules
* **What AI Owns**:
  - Intent understanding (planning queries, nearby search, culinary queries, general travel Q&A).
  - Multilingual translation and Odia script interpretation.
  - Conversational formatting and plan explanation.
* **What AI Does NOT Own**:
  - Coordinates, route numbers, timetables, bus fares, ticket prices, opening hours, or contact numbers.
  - These facts are owned 100% by deterministic database queries and backend services.

---

## 2. Request Lifecycle & Routing Pipeline

```
User Message ("Plan a 1 day trip in bbsr with temples and Mo Bus")
                          │
                          ▼
            RuleBasedModelAdapter.parse_intent
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
Planning / Itinerary Intent       Transit / Search / QA Intent
         │                                 │
         ▼                                 ▼
build_itinerary service           search_places / nearby_stops
(Deterministic geo-ranking,       (Deterministic DB queries)
 time slots: 09:00, 11:45, ...)            │
         │                                 │
         └────────────────┬────────────────┘
                          │
                          ▼
          generate_grounded_itinerary_message
                          │
                          ▼
           Structured AI Response (HTTP 200)
    (message + itinerary stops + structured times + warnings)
```

---

## 3. Supported Model Providers & Fallbacks

1. **Rule-Based Deterministic Adapter** (`RuleBasedModelAdapter`):
   - Fast, zero-cost, runs offline without external API keys.
   - Handles multi-day and single-day itinerary extraction, Odia script tokens, location aliases (e.g. `bbsr` $\rightarrow$ `Bhubaneswar`), and cuisine queries.
2. **Cloud LLM Adapters** (Azure OpenAI, Gemini, Groq):
   - Used when configured with valid credentials; automatically falls back to rule-based adapter on timeout or rate limiting.

---

## 4. Mandatory Test Scenarios

The AI engine is verified against 5 canonical smoke prompts:
1. `Plan a 1 day trip in bbsr` $\rightarrow$ 1-day Bhubaneswar itinerary with structured time slots.
2. `Plan a one day trip in Bhubaneswar` $\rightarrow$ Single-day grounded itinerary.
3. `I am in Bhubaneswar. Plan a day trip with temples, lunch and Mo Bus where practical.` $\rightarrow$ Spirituality + culinary focus without degrading into provider status.
4. `Where can I get Pahala Rasgulla?` $\rightarrow$ Verified sweet clusters.
5. `Are AI providers working?` $\rightarrow$ Health/status report.
