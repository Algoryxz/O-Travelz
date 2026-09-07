# O-TRAVELZ Mobile V4 — Localization & Odia Language Model

> **Authoritative Localization Specification**  
> Supported Languages: **English & Odia (ଓଡ଼ିଆ)**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Dual-Language Strategy

O-TRAVELZ is built natively for Odisha. Both English and Odia (ଓଡ଼ିଆ) are treated as first-class languages:
1. **Strict Scope**: Languages are strictly **English** and **Odia**. Speculative machine pre-translation into Hindi, Bengali, or Telugu is deferred until verified human translations exist.
2. **Canonical Script Truth**: Every place, district, and major transit stop maintains dual canonical names:
   - English: `Mukteshwar Temple`
   - Odia: `ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିର`
   - District English: `Puri` | District Odia: `ପୁରୀ`
3. **No Machine-Hallucinated Odia Names**: All Odia transliterations derive from official government gazettes, ASI Odia signboards, or verified regional linguist dictionaries (`mobile/shared/.../i18n/LocalizedNames.kt`).

---

## 2. Mixed-Script Visual Hierarchy

- **Title Presentation**: Destination detail headers display the canonical English name followed immediately by the authentic Odia script rendering in a balanced optical scale:
  ```
  Mukteshwar Temple
  ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିର · Bhubaneswar, Khordha
  ```
- **System Fonts**:
  - Android uses native `Nirmala UI` or standard system Odia font fallback.
  - iOS uses Apple's native `Kalinga` / Odia Unicode glyph system.
  - Odia script line-height is given $1.2\times$ relaxation to prevent clipping of upper matras (e.g. ୈ, ୌ) and lower conjuncts (e.g. ୍କ, ୍ତ).

---

## 3. Bilingual Search Engine

Search queries entered in either English or Odia script execute unified fuzzy matching:
- Typing `କୋଣାର୍କ` matches `Konark Sun Temple`.
- Typing `Konark` matches `କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର`.
- Local search engine indexes both script tokens in local SQLite FTS / SwiftData memory tables.
