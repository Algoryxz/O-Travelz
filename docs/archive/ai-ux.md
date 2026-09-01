# O-Travelz AI UX Principles & Boundaries

`STATUS: VERIFIED`

## 1. Core Principle: AI is Infrastructure, Not the Brand

In O-Travelz, **AI is an underlying capability, never the visual identity**.

* The user should think: *"This is an exceptionally curated, trustworthy travel platform."*
* The user should NOT think: *"This is an AI chatbot wrapped in travel templates."*

---

## 2. Where AI is Employed
1. **Natural Language Journey Understanding**: Synthesizing unstructured traveler preferences (*"A quiet weekend with coastal walks, temple photography, and no rushed schedules"*) into structured itinerary parameters.
2. **Contextual Enrichment**: Providing insightful historical and cultural commentary for verified destinations.
3. **Conversational Trip Copilot**: Available as a dedicated assistive sidebar (`AISidebar`), never intruding on primary discovery flows.

---

## 3. Authoritative Non-AI Boundaries (Zero Hallucination Rule)
AI is strictly forbidden from hallucinating or modifying the following deterministic ground truths:
* **Coordinates & Map Projections**: Must come directly from verified geographic database records.
* **Travel Times & Distances**: Must be calculated via authoritative road network matrices.
* **Operating Hours & Entry Fees**: Must be sourced from verified monument and park records.
* **Live Weather**: Must be pulled dynamically from verified meteorological endpoints.
