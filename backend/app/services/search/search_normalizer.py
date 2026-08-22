"""Query text normalization, intent extraction, and verified multilingual alias mapping."""
from __future__ import annotations

from typing import Dict, List, Optional, Set, Tuple

from app.core.regions import ODISHA_DISTRICTS
from app.data.multilingual_taxonomy import (
    CATEGORY_TAXONOMY,
    DISTRICT_TAXONOMY,
    INTEREST_TAXONOMY,
    MULTILINGUAL_ALIASES,
    normalize_multilingual_text,
    resolve_alias,
    resolve_category,
    resolve_district,
    resolve_interest,
)

# Stop words across English, Odia, and Hindi
STOP_WORDS: Set[str] = {
    # English stop words
    "a", "an", "the", "in", "at", "near", "around", "to", "of", "and", "or",
    "for", "with", "by", "on", "from", "places", "place", "things", "thing",
    "attractions", "attraction", "destinations", "destination", "odisha",
    "top", "best", "good", "visit", "see", "find", "show", "get", "me", "list",
    # Odia stop words (verified functional/inquiry particles)
    "ରେ", "ର", "ଏବଂ", "ଓ", "ଠାରେ", "ପାଇଁ", "ଭ୍ରମଣ", "ସ୍ଥାନ", "ସ୍ଥଳ", "ଦେଖିବା",
    "ଖୋଜିବା", "ଓଡ଼ିଶା", "ଓଡିଶା", "ମୁଖ୍ୟ", "ଶ୍ରେଷ୍ଠ", "ଭଲ", "କେଉଁଠି",
    # Hindi stop words (verified functional/inquiry particles)
    "में", "का", "की", "के", "और", "पर", "से", "के लिए", "स्थान", "पर्यटन",
    "घूमने", "देखने", "ओडिशा", "सर्वश्रेष्ठ", "प्रमुख", "अच्छे", "अच्छा", "कहाँ",
}

# Verified local aliases, transport acronyms, and historical regional titles (Multilingual)
VERIFIED_ALIASES: Dict[str, List[str]] = {
    key: list(val) for key, val in MULTILINGUAL_ALIASES.items()
}

# Add canonical single-word and multi-word keywords to category map
CATEGORY_KEYWORD_MAP: Dict[str, str] = {
    "temple": "temple",
    "temples": "temple",
    "mandir": "temple",
    "shrine": "temple",
    "monument": "monument",
    "monuments": "monument",
    "fort": "monument",
    "palace": "monument",
    "museum": "museum",
    "museums": "museum",
    "market": "market",
    "markets": "market",
    "bazaar": "market",
    "park": "park",
    "parks": "park",
    "garden": "park",
    "gardens": "park",
    "lake": "lake",
    "lakes": "lake",
    "lagoon": "lake",
    "wetland": "lake",
    "beach": "beach",
    "beaches": "beach",
    "sea": "beach",
    "coast": "beach",
    "coastal": "beach",
    "nature": "nature",
    "hill": "nature",
    "hills": "nature",
    "valley": "nature",
    "ghat": "nature",
    "waterfall": "waterfall",
    "waterfalls": "waterfall",
    "falls": "waterfall",
    "cascade": "waterfall",
    "wildlife": "wildlife",
    "sanctuary": "wildlife",
    "national park": "wildlife",
    "zoo": "wildlife",
    "tiger reserve": "wildlife",
    "biosphere": "wildlife",
    "planetarium": "planetarium",
    "sports": "sports_venue",
    "stadium": "sports_venue",
    "science": "science_center",
    "hospital": "hospital",
    "hospitals": "hospital",
    "medical": "hospital",
    "mch": "hospital",
    "dhh": "hospital",
    "emergency": "emergency_facility",
    "trauma": "emergency_facility",
    "transit": "transit_hub",
    "transport": "transit_hub",
    "airport": "transit_hub",
    "flight": "transit_hub",
    "airports": "transit_hub",
    "railway": "transit_hub",
    "railway station": "transit_hub",
    "station": "transit_hub",
    "train": "transit_hub",
    "bus": "transit_hub",
    "isbt": "transit_hub",
    "bus stand": "transit_hub",
}

# Thematic interest keywords
INTEREST_KEYWORD_MAP: Dict[str, str] = {
    "heritage": "heritage",
    "history": "heritage",
    "ancient": "heritage",
    "archaeology": "heritage",
    "spirituality": "spirituality",
    "spiritual": "spirituality",
    "holy": "spirituality",
    "sacred": "spirituality",
    "divine": "spirituality",
    "architecture": "architecture",
    "sculpture": "architecture",
    "art": "culture",
    "culture": "culture",
    "cultural": "culture",
    "craft": "culture",
    "handicraft": "culture",
    "food": "food",
    "cuisine": "food",
    "sweets": "food",
    "culinary": "food",
    "relaxation": "relaxation",
    "peace": "relaxation",
    "serene": "relaxation",
    "adventure": "adventure",
    "trekking": "adventure",
    "hiking": "adventure",
    "boating": "adventure",
    "shopping": "shopping",
    "handloom": "shopping",
    "souvenir": "shopping",
}


def normalize_text(text: Optional[str]) -> str:
    """
    Lowercase, strip punctuation, and normalize whitespace while preserving
    English, native Odia (U+0B00-U+0B7F), and Devanagari (U+0900-U+097F) scripts.
    """
    return normalize_multilingual_text(text)


def tokenize(text: Optional[str]) -> List[str]:
    """Tokenize normalized text into meaningful word tokens across supported languages."""
    normalized = normalize_text(text)
    if not normalized:
        return []
    return [token for token in normalized.split() if token and token not in STOP_WORDS]


def extract_search_intent(
    query_str: Optional[str],
) -> Tuple[str, Optional[str], Optional[str], Optional[str], Optional[bool], Optional[bool]]:
    """
    Parse a free-text search string and extract semantic components across English, Odia, and Hindi:
    Returns (cleaned_query, detected_district, detected_category, detected_interest, is_medical_intent, is_transit_intent)
    """
    if not query_str:
        return "", None, None, None, None, None

    normalized = normalize_text(query_str)
    if not normalized:
        return "", None, None, None, None, None

    tokens = normalized.split()

    detected_district = None
    detected_category = None
    detected_interest = None
    is_medical_intent = None
    is_transit_intent = None

    # 1. District extraction: check whole query, n-grams, and single tokens
    # A. Check whole normalized query
    detected_district = resolve_district(normalized)

    # B. Check multi-word sliding windows (3-gram, 2-gram, 1-gram)
    if not detected_district:
        for n in range(min(3, len(tokens)), 0, -1):
            for i in range(len(tokens) - n + 1):
                window = " ".join(tokens[i : i + n])
                resolved = resolve_district(window)
                if resolved:
                    detected_district = resolved
                    break
            if detected_district:
                break

    # C. Fallback: check canonical district substrings
    if not detected_district:
        for dist in ODISHA_DISTRICTS:
            if dist.lower() in normalized:
                detected_district = dist
                break

    # 2. Category extraction: check whole query, n-grams, and single tokens
    detected_category = resolve_category(normalized)
    if not detected_category:
        for n in range(min(3, len(tokens)), 0, -1):
            for i in range(len(tokens) - n + 1):
                window = " ".join(tokens[i : i + n])
                resolved = resolve_category(window)
                if resolved:
                    detected_category = resolved
                    break
            if detected_category:
                break

    # Check fallback CATEGORY_KEYWORD_MAP keywords
    if not detected_category:
        for kw, cat in CATEGORY_KEYWORD_MAP.items():
            if kw in normalized:
                detected_category = cat
                break

    if detected_category in ("hospital", "emergency_facility"):
        is_medical_intent = True
    elif detected_category == "transit_hub":
        is_transit_intent = True

    # 3. Interest extraction: check whole query, n-grams, and single tokens
    detected_interest = resolve_interest(normalized)
    if not detected_interest:
        for n in range(min(3, len(tokens)), 0, -1):
            for i in range(len(tokens) - n + 1):
                window = " ".join(tokens[i : i + n])
                resolved = resolve_interest(window)
                if resolved:
                    detected_interest = resolved
                    break
            if detected_interest:
                break

    # Check fallback INTEREST_KEYWORD_MAP keywords
    if not detected_interest:
        for kw, interest in INTEREST_KEYWORD_MAP.items():
            if kw in normalized:
                detected_interest = interest
                break

    # 4. Check for medical or transit indicators across English, Odia, and Hindi
    medical_indicators = (
        "hospital", "hospitals", "medical", "doctor", "health", "casualty", "clinic",
        "dhh", "mch", "emergency", "trauma",
        "ଡାକ୍ତରଖାନା", "ଚିକିତ୍ସାଳୟ", "ହସପିଟାଲ", "ଡାକ୍ତର", "ସ୍ୱାସ୍ଥ୍ୟ", "ଜରୁରୀକାଳୀନ", "ଆପାତକାଳୀନ", "ଜରୁରୀ",
        "अस्पताल", "चिकित्सालय", "हॉस्पिटल", "डॉक्टर", "स्वास्थ्य", "आपातकालीन",
    )
    transit_indicators = (
        "airport", "airports", "railway", "railway station", "station", "train", "flight",
        "bus", "isbt", "bus stand", "transit", "transport",
        "ବିମାନବନ୍ଦର", "ରେଳ", "ରେଳବାଇ", "ଷ୍ଟେସନ", "ବସ", "ପରିବହନ", "ଗମନାଗମନ",
        "हवाई अड्डा", "रेलवे", "ट्रेन", "स्टेशन", "बस", "परिवहन", "ट्रांजिट",
    )

    if not is_medical_intent and any(k in normalized for k in medical_indicators):
        is_medical_intent = True
    if not is_transit_intent and any(k in normalized for k in transit_indicators):
        is_transit_intent = True

    return normalized, detected_district, detected_category, detected_interest, is_medical_intent, is_transit_intent


def get_alias_expansions(query_str: Optional[str]) -> List[str]:
    """Return canonical place titles or locations mapped from verified abbreviations/aliases across languages."""
    if not query_str:
        return []
    # 1. Use authoritative multilingual taxonomy alias resolver
    targets = resolve_alias(query_str)
    if targets:
        return targets

    # 2. Fallback check on normalized text
    norm = normalize_text(query_str)
    return VERIFIED_ALIASES.get(norm, [])
