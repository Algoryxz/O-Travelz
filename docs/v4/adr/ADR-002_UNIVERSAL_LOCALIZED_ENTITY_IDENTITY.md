# ADR-002: Universal Localized Entity Identity Contract for O-TRAVELZ V4

* **Status**: Accepted
* **Date**: 2026-09-04
* **Decision Makers**: Algoryxz Core Architecture Team
* **Context**: Multi-lingual representation of cultural entities, transit stops, and geographic features across backend, web, iOS, and Android.

---

## 1. Context and Problem Statement

O-TRAVELZ V4 serves as a digital cultural atlas and intelligent travel companion for Odisha. Physical places, transit stops, artisan clusters, craft traditions, and culinary heritage entities require first-class representations in:
1. **English (`en`)**: Universal fallback and primary system identifier.
2. **Odia (`or`)**: Native language and primary cultural script of Odisha.
3. **Hindi (`hi`)**: Secondary national script for domestic travelers.

Previously, localized naming was fragmented: some models had no localization support, while others relied on ad-hoc columns or unstandardized JSON attributes. Without a unified contract, client platforms (Web, iOS, Android) implemented inconsistent fallback mechanisms, leading to mixed script rendering or silent missing labels.

---

## 2. Decision

The platform adopts a **Universal Localized Entity Identity Contract** implemented identically across all four platform layers:

1. **Contract Structure**:
   ```json
   {
     "en": "Konark Sun Temple",
     "or": "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
     "hi": "कोणार्क सूर्य मंदिर"
   }
   ```
   * `en` is mandatory and acts as the ultimate fallback.
   * `or` and `hi` are optional and represent native script strings.

2. **Backend / Data Layer**:
   * Pydantic Schema: `app.schemas.localization.LocalizedNames` supporting alias `"or"` and field `or_`.
   * Database Storage: Additive `localized_names` JSON column on `places` and `stops` (and all future entity tables).
   * Migration: Non-destructive, reversible Alembic migration `0014_v4_data_media_foundation`.

3. **Frontend / Web V4**:
   * TypeScript Interface: `export interface LocalizedNames { en: string; or?: string | null; hi?: string | null; }`.
   * Fallback Resolver: `resolveLocalizedName(localized, fallbackName, langCode)`.

4. **Mobile / KMP Shared Core**:
   * Kotlin Multiplatform Model: `com.otravelz.shared.i18n.LocalizedNames(val en: String, val orName: String? = null, val hi: String? = null)`.
   * Domain Models: `PlaceSummary` and `TransitStopSummary` expose optional `localizedNames: LocalizedNames?`.
   * Helper: `resolve(languageCode: String): String`.

5. **Resolution Semantics**:
   * If the requested locale is `"or"`, `"odi"`, or `"odia"` and an Odia translation exists, return it; otherwise return `en`.
   * If the requested locale is `"hi"`, `"hin"`, or `"hindi"` and a Hindi translation exists, return it; otherwise return `en`.
   * Any other locale or missing translation falls back deterministically to `en`.

---

## 3. Consequences

### Positive
* Single cross-platform contract eliminates script fragmentation across Web, iOS, and Android.
* Reusable across all domain entities: places, bus stops, railway stations, artisan clusters, craft items, and dishes.
* Additive and backwards-compatible: existing clients receive English strings unchanged if localization is omitted.
* Fully verified by automated tests in Python, TypeScript, and Kotlin Multiplatform.

### Negative / Trade-offs
* Odia and Hindi translations must be verified against authentic linguistic sources (e.g. Odia Bhasha Pratisthan, official government signage) to avoid automated translation hallucinations.