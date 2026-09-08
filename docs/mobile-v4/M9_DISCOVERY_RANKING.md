# M9 — Discovery Search Semantics & Deterministic Ranking

> Authoritative specification for O-TRAVELZ Mobile V4 search matching and ranking.
> Operates across the 179-destination cultural atlas catalog.

---

## 1. Principles

1. **Deterministic & Explainable**: Results must never be ordered by opaque "AI confidence", fake popularity metrics, or arbitrary database insertion order.
2. **Bilingual Parity**: Searches in English (Latin script) or Odia (Odia Unicode block `U+0B00`–`U+0B7F`) match with equal precision.
3. **No Synthesized Content**: No machine translation, fuzzy hallucinated aliases, or vector embeddings for a 179-place curated atlas.

---

## 2. Normalization & Tokenization

1. **Whitespace Trimming**: Collapse consecutive whitespace characters into a single space; trim leading/trailing spaces.
2. **Case Normalization**: Casefold to lowercase for Latin characters.
3. **Unicode Preservation**: Odia script characters, vowel matras, and virama signs are strictly preserved.
4. **Tokenization**: Non-empty whitespace-separated substrings form the search query tokens.
5. **Conjunctive Matching (AND)**: If multiple tokens are entered (e.g. "puri temple"), every token must match at least one attribute of the destination.

---

## 3. Tiered Relevance Scoring

When a query is entered, eligible destinations that match are sorted into deterministic tiers:

| Tier | Matching Rule | Example | Score |
|---|---|---|---|
| **Tier 1** | **Exact Name Match** | Query `"Lingaraj Temple"` matches name exactly | `1000` |
| **Tier 2** | **Word Prefix on Primary Name** | Query `"Ling"` or `"Konark"` matches start of name or words in name | `800` |
| **Tier 3** | **Odia Script Exact or Prefix Match** | Query `"ଲିଙ୍ଗ"` matches Odia title `"ଲିଙ୍ଗରାଜ ମନ୍ଦିର"` | `600` |
| **Tier 4** | **District / Category Exact/Prefix Match** | Query `"Puri"` or `"Beach"` matches district or category | `400` |
| **Tier 5** | **Substring Match in Name or Description** | Query matches within description or secondary text | `200` |

### Tie-Breaking Policy
Within the same relevance tier (or when no search query is active), destinations are sorted alphabetically by canonical English `name`. When Spatial Proximity (Nearby) is active, proximity distance replaces alphabetical tie-breaking.

---

## 4. Default Catalog Ordering (Zero Search Active)

When no search query is typed and no category/district filter is applied:
1. **Verified Media Priority**: Places with verified authentic photography appear first, honoring the cultural atlas visual experience.
2. **Deterministic Alphabetical Ordering**: Within each group (verified vs pending), places are sorted alphabetically by canonical `name` (A to Z).
3. **Anti-Vibe Enforcement**: Database internal UUID insertion order is never exposed to the traveler.
