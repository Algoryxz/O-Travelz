# O-TRAVELZ Mobile V4 — AI Assistant Product Model & Grounding Architecture

> **Authoritative AI Behavioral Specification**  
> Philosophy: **Deterministic Facts Lead; AI Interprets Intent and Explains Outcomes**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Grounding Axiom: The Epistemic Boundary

O-TRAVELZ Mobile rejects the unconstrained "chatbot in a box" paradigm. AI is not a source of canonical truth; it is an **intelligent natural language interface to deterministic backend engines**.

```
┌────────────────────────────────────────────────────────┐
│ Traveler Query (Natural Language in English / Odia)    │
│ "Can we visit an authentic handloom village near Puri?"│
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ AI Layer 1: Intent & Constraint Extraction             │
│ (Category: Handloom, Near: Puri District, Hours: Open) │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Deterministic Engine Execution (PostGIS + Transit)     │
│ Query: ST_DWithin(Raghurajpur, Puri, 15km)             │
│ Result: Raghurajpur Heritage Village (11.4 km)        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ AI Layer 2: Formatted Grounded Explanation             │
│ "Raghurajpur is 11.4 km north of Puri on NH-316..."    │
│ [Attributed Claim: FACTUAL_VERIFIED]                   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Strict Division of Ownership

| What the AI OWNS | What the AI NEVER OWNS (Strictly Deterministic) |
|---|---|
| Natural language intent parsing | Geographic coordinates (Lat / Lon) |
| Multilingual Odia transliteration interpretation | Bus route numbers and stopping sequences |
| Conversational constraint clarification | Scheduled departure times (IST) |
| Explaining why an itinerary connection works or fails | Monument opening days and hours |
| Formatting cultural history essays into concise summaries | Ticket prices and bus fares |
| Tone, warmth, and respectful Odishan hospitality | Real-time weather and heat index observations |
| Summarizing user trip preferences | Physical media authenticity |

---

## 3. Conversational Coexistence with Structured UI

The AI Assistant does **not** replace structured UI controls (date pickers, category chips, transit lists). It **coexists as a contextual refinement sheet**:
1. Traveler fills in standard structured constraints on the `Plan` tab (Days, Origin, Travel Style).
2. Deterministic solver outputs the baseline itinerary cards.
3. Traveler taps **"Refine with AI"** to open a bottom sheet:
   - Floating suggestion chips: *"Add Odia lunch stop"*, *"Reduce walking"*, *"Focus on temple architecture"*.
   - Free-form text input with Odia keyboard support.
   - Quick action responses modify the structured itinerary cards in real time.

---

## 4. Provider Fallback Chain & Offline State

To ensure zero-cost resilience and high availability:
1. **Primary Cloud LLM**: Google Gemini 1.5 Flash (zero-cost API tier via Google AI Studio).
2. **Secondary Cloud Fallback**: Groq Llama 3.3 70B (high-speed fallback).
3. **Tertiary Cloud Fallback**: NVIDIA NIM Llama 3.1 8B.
4. **Deterministic Offline Fallback**: `RuleBasedAdapter`.
   - When network is disconnected, the AI Chat sheet gracefully displays an offline banner:
     *"AI Assistant requires internet connection. Displaying curated golden circuits for your selected region."*
   - Zero crashes; zero hallucinations.
