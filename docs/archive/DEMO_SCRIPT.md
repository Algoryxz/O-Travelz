# O-TRAVELZ Demo Script

**Target Duration**: 5–10 Minutes
**Audience**: Evaluators, Technical Reviewers, Travelers, and Stakeholders
**Baseline**: Whole-Odisha Travel & Transit Platform (Post-Phase 7 Baseline)
**Host URLs**: Frontend `http://localhost:5173`, Backend `http://127.0.0.1:8000`

---

## 1. Opening — What Problem O-TRAVELZ Solves (~30 seconds)

> *"Travel planning in India—and specifically across Odisha's 30 diverse districts—is plagued by hallucinated AI travel guides, disconnected public transit schedules, and unverified destination metadata.*
>
> *O-Travelz solves this through a fundamental design principle: **AI orchestrates and refines, but it never invents factual travel information.** Every destination coordinate, physical category, travel time, and transit hop is verified and calculated deterministically using PostGIS and structured transport routing across the entire state."*

---

## 2. Discover Odisha (`/#discover`)

1. **Action**: Open `http://localhost:5173/#discover`.
2. **Narration**:
   - Point out the **Odisha Hero Showcase** featuring authentic, verified destination photography.
   - Highlight the **Live Weather Widget** powered by our backend Open-Meteo adapter, providing real-time conditions, temperatures, and contextual traveler advice.
   - Show the **Curated Thematic Hubs** (Heritage, Coastal, Wildlife, Hill Stations, and Odia Culinary Corridors).
   - Point out the quick action buttons: *"Start Planning"*, *"Explore Map"*, and *"Browse Destinations"*.

---

## 3. Destination Discovery (`/#destinations`)

1. **Action**: Click **Destinations** in the top navigation or navigate to `/#destinations`.
2. **Narration**:
   - Present the whole-Odisha catalog of **81 canonical destinations** covering all 30 districts.
   - Filter by Region (e.g. *Puri & Coastal*, *Sambalpur & Western*, *Koraput & Tribal Highlands*).
   - Filter by Category (e.g. *Temple*, *Waterfall*, *Wildlife*, *Beach*).
   - Type a search query into the search bar: e.g. `"Lingaraj"`, `"Puri"`, or `"Daringbadi"`.
   - Click **View Details** on a destination (e.g. *Konark Sun Temple*).
   - Show the **Place Details Modal**: verified coordinates, physical category, district, region, average visit duration, entry price tier, and official government/research source provenance.
   - Click the **Save Place** button (heart icon) to add it to the traveler's persistent Wishlist.

---

## 4. Interactive Map Canvas (`/#map`)

1. **Action**: Navigate to `/#map`.
2. **Narration**:
   - Notice the seamless, fast load: the Leaflet map bundle is code-split dynamically on demand (`leaflet-vendor` ~150 kB).
   - Show the dynamic bounding box automatically adapting to Odisha's geographic spread ($81.0^\circ\text{E}–87.5^\circ\text{E}$ and $17.5^\circ\text{N}–22.5^\circ\text{N}$).
   - Click on destination markers and clusters to show place popups with direct *"Plan Trip Here"* and *"View Details"* triggers.
   - Highlight that spatial coordinates are rendered directly from backend PostGIS projection (`POST /map/v1/projection`).

---

## 5. Itinerary Planning & Timeline (`/#plan`)

1. **Action**: Navigate to `/#plan`.
2. **Narration**:
   - Show the **Form Planner** interface:
     - Select Duration: `2 Days`.
     - Starting Location: `Bhubaneswar`.
     - Select Canonical Interests: `Heritage`, `Spirituality`, `Food`.
   - Click **"Generate Verified Itinerary"**.
   - Review the generated **Timeline Schedule**:
     - **Deterministic Sequencing**: Stops are distributed topologically with a strict invariant of maximum 3 stops per day.
     - **Minute-by-Minute Timeline**: Starting from a 09:00 baseline, every stop shows arrival time, departure time, and verified visit duration.
     - **Multimodal Transport Hops**: Inter-stop transfers show explicit data tiers (`static`, `scheduled`, `live`), walking durations ($\le 2000$m), or road transit times.
   - Switch to the **"Route & Hop Map"** tab to view the geographic route connecting the planned stops.

---

## 6. Grounded AI Copilot

1. **Action**: In the Planner workspace, switch to the **"AI Travel Assistant"** tab (or open the AI sidebar).
2. **Narration**:
   - Type a natural-language prompt:
     > *"Explore ancient temple architecture and authentic Odia food in Cuttack and Bhubaneswar."*
   - Submit the message.
   - Show the resulting response:
     - The `RuleBasedModelAdapter` extracts traveler intent and structured constraints (`interests=["architecture", "culture"]`, `start="Bhubaneswar"`).
     - It invokes deterministic tools without hallucinating fake eateries or non-existent temples.
     - The shared itinerary timeline updates automatically with verified heritage temples and authentic culinary destinations (Ananda Bazar, Cuttack Dahibara Aloodum, Salepur Rasagola).

---

## 7. Safety & Truthfulness Demonstration

1. **Action**: In the AI Travel Assistant, type a non-canonical request:
   > *"Plan a photography expedition across Odisha."*
2. **Narration**:
   - Point out the system's truthful safety behavior:
     - The AI detects that `"photography"` is not a verified physical category or canonical interest.
     - Instead of hallucinating fake photography tour operators or unverified destinations, the copilot safely clarifies and maps the intent to valid physical domains (`nature`, `wildlife`, `heritage`).
     - Zero unverified facts are introduced into the traveler's schedule.

---

## 8. Saved Places & Persistence (`/#saved`)

1. **Action**: Navigate to `/#saved`.
2. **Narration**:
   - Show the **Saved Places & Revisit Workspace**.
   - Point out the saved *Konark Sun Temple* destination added in Step 3.
   - Demonstrate that saved destinations and trip histories persist across page refreshes, tab switches, and browser sessions via client-side `localStorage`.
   - Show the **"Plan Trip with Saved Places"** button that seeds the planner with the traveler's saved wishlist.

---

## 9. Closing (~30 seconds)

> *"In summary, O-Travelz delivers a complete, verified, and transportation-aware travel platform for the entire state of Odisha.
>
> We deliberately do not claim real-time vehicle telemetry where data does not exist, nor do we let generative AI invent travel facts. Everything demonstrated today is reproducible, deterministic, and running on a clean full-stack architecture."*
