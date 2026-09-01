# O-Travelz Design Decisions Log

`STATUS: VERIFIED`

This document records the architectural and aesthetic decisions made during the frontend overhaul, their rationale, and the alternatives considered.

---

## Decision 1: Single Geometric Primary Sans (`Plus Jakarta Sans`)
* **Context**: The earlier codebase had fragmented across 6 fonts (`Manrope`, `Inter`, `Plus Jakarta Sans`, `DM Serif Display`, `DM Mono`, `Noto Sans Oriya`).
* **Decision**: Consolidate primary display, headings, UI buttons, and body copy on `Plus Jakarta Sans`.
* **Rationale**: Offers modern geometric precision with friendly human warmth, excellent legibility down to 10px, and eliminates 120 KB of redundant webfont payload.

---

## Decision 2: Solid Architectural Surfaces Over Glassmorphism
* **Context**: Many AI and modern SaaS applications rely on frosted glass (`backdrop-blur`) and translucent cards.
* **Decision**: Replace transparent/blurred cards with solid obsidian surfaces (`#111827`, `#172235`) and sharp hairline borders (`#263244`).
* **Rationale**: Solid surfaces feel grounded, tactile, and editorial. They improve readability in high-ambient-light conditions and perform significantly faster on mobile GPUs without repaint penalties.

---

## Decision 3: Deterministic Travel Intelligence Over Chatbot UI
* **Context**: Initial designs experimented with a floating AI chat bubble on the homepage.
* **Decision**: Embed travel intelligence directly into the search console, itinerary timelines, and destination cards (e.g. `284 km`, `3h 45m transit`, verified operating hours).
* **Rationale**: Travelers want trustworthy, structured journeys. Chat transcripts create cognitive friction, whereas deterministic itineraries provide immediate clarity.

---

## Decision 4: Dual Light/Dark Canvas Harmony
* **Context**: Standard dark mode had dark blue tones that drifted into developer/crypto dashboard territory.
* **Decision**: Establish warm stone/sandstone (`#FAF8F5`) for light mode and deep obsidian (`#0B1220`) with terracotta (`#E06D44`) and coastal teal (`#14B8A6`) accents for dark mode.
* **Rationale**: Keeps the brand warm and natural in both lighting conditions, reinforcing its connection to Odisha's coast and heritage architecture.
