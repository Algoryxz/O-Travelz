"""Multilingual language detection, numerals extraction, and grounded message generation.

Supports English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), and mixed-language conversational inputs
while ensuring all internal domain entities map to canonical English identifiers.
"""
from __future__ import annotations

import re
from typing import Any, List, Optional, Set, Tuple

from app.data.multilingual_taxonomy import (
    get_localized_category,
    get_localized_district,
    get_localized_interest,
    normalize_multilingual_text,
    resolve_alias,
    resolve_category,
    resolve_district,
    resolve_interest,
)
from app.services.search.search_normalizer import VERIFIED_ALIASES, extract_search_intent


# Indic numeral translation tables
ODIA_NUMERALS = {"୦": 0, "୧": 1, "୨": 2, "୩": 3, "୪": 4, "୫": 5, "୬": 6, "୭": 7, "୮": 8, "୯": 9}
HINDI_NUMERALS = {"०": 0, "१": 1, "२": 2, "३": 3, "४": 4, "५": 5, "६": 6, "७": 7, "८": 8, "९": 9}

NUMBER_WORDS = {
    # English
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
    # Odia
    "ଗୋଟିଏ": 1, "ଏକ": 1, "ଦୁଇ": 2, "ତିନି": 3, "ଚାରି": 4, "ପାଞ୍ଚ": 5, "ଛଅ": 6, "ସାତ": 7,
    # Hindi
    "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "छह": 6, "सात": 7,
}

# Refinement & modification intent keywords across languages
REFINEMENT_KEYWORDS = {
    # English
    "refine", "more", "add", "focused", "extend", "change", "switch", "reduce", "less", "only",
    # Odia
    "ଆହୁରି", "ଯୋଡ଼ନ୍ତୁ", "ଯୋଡ଼", "ବଦଳାନ୍ତୁ", "ପରିବର୍ତ୍ତନ", "କେବଳ", "ଅଧିକ", "କମ", "ସଂଶୋଧନ",
    # Hindi
    "और", "जोड़ो", "जोड़िए", "बदलो", "बदलें", "सिर्फ", "केवल", "ज्यादा", "अधिक", "कम", "संशोधन",
}


def detect_language(text: Optional[str]) -> str:
    """Detect language based on Unicode script ranges."""
    if not text:
        return "en"
    # Check for Odia script: U+0B00 to U+0B7F
    if re.search(r"[\u0B00-\u0B7F]", text):
        return "or"
    # Check for Devanagari script: U+0900 to U+097F
    if re.search(r"[\u0900-\u097F]", text):
        return "hi"
    return "en"


def parse_indic_digits(digit_str: str) -> Optional[int]:
    """Convert mixed ASCII / Odia / Devanagari digit strings to integer."""
    result = 0
    for char in digit_str:
        if char.isdigit():
            result = result * 10 + int(char)
        elif char in ODIA_NUMERALS:
            result = result * 10 + ODIA_NUMERALS[char]
        elif char in HINDI_NUMERALS:
            result = result * 10 + HINDI_NUMERALS[char]
        else:
            return None
    return result if result > 0 else None


def extract_multilingual_days(text: str) -> Optional[int]:
    """Extract day duration count from English, Odia, or Hindi text."""
    if not text:
        return None

    # 1. Digit + day marker patterns (English, Odia, Hindi)
    # Examples: "3 days", "3-day", "୩ ଦିନ", "୩ଦିନ", "३ दिन", "3दिन"
    pattern = r"([0-9୦-୯०-९]+)\s*[- ]?(?:day|days|ଦିନ|ଦିନର|दिन|दिनों)"
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        parsed = parse_indic_digits(match.group(1))
        if parsed and 1 <= parsed <= 14:
            return parsed

    # 2. Number word + day marker
    # Examples: "two days", "ତିନି ଦିନ", "तीन दिन"
    word_pattern = r"(one|two|three|four|five|six|seven|ଗୋଟିଏ|ଏକ|ଦୁଇ|ତିନି|ଚାରି|ପାଞ୍ଚ|ଛଅ|ସାତ|एक|दो|तीन|चार|पांच|पाँच|छह|सात)\s*[- ]?(?:day|days|ଦିନ|ଦିନର|दिन|दिनों)"
    word_match = re.search(word_pattern, text, re.IGNORECASE)
    if word_match:
        val = NUMBER_WORDS.get(word_match.group(1).lower())
        if val and 1 <= val <= 14:
            return val

    # 3. Standalone day pattern if query is short
    standalone = re.search(r"\b([0-9୦-୯०-९]+)\s*d\b", text, re.IGNORECASE)
    if standalone:
        parsed = parse_indic_digits(standalone.group(1))
        if parsed and 1 <= parsed <= 14:
            return parsed

    return None


def extract_multilingual_interests(text: str) -> List[str]:
    """Extract canonical English interest identifiers from multilingual text."""
    if not text:
        return []

    found: List[str] = []
    norm = normalize_multilingual_text(text)
    tokens = norm.split()

    # 1. Direct taxonomy resolution
    for token in tokens:
        interest = resolve_interest(token)
        if interest and interest not in found:
            found.append(interest)

        # Also check if token resolves to a category that maps cleanly to traveler themes
        cat = resolve_category(token)
        if cat:
            cat_interest_map = {
                "temple": "spirituality",
                "beach": "beach",
                "waterfall": "waterfall",
                "wildlife": "wildlife",
                "park": "nature",
                "lake": "nature",
                "monument": "heritage",
                "museum": "culture",
                "market": "shopping",
            }
            mapped_theme = cat_interest_map.get(cat)
            if mapped_theme and mapped_theme not in found:
                found.append(mapped_theme)

    # 2. Multi-word phrase check (2-grams, 3-grams)
    for n in (3, 2):
        for i in range(len(tokens) - n + 1):
            phrase = " ".join(tokens[i : i + n])
            interest = resolve_interest(phrase)
            if interest and interest not in found:
                found.append(interest)

    return found


MULTILINGUAL_CITY_MAP: dict[str, str] = {
    "ଭୁବନେଶ୍ୱର": "Bhubaneswar", "भुवनेश्वर": "Bhubaneswar", "bhubaneswar": "Bhubaneswar",
    "bhubneswar": "Bhubaneswar", "bhuvneshwar": "Bhubaneswar", "bbsr": "Bhubaneswar",
    "ପୁରୀ": "Puri", "पुरी": "Puri", "puri": "Puri", "poori": "Puri", "purii": "Puri",
    "କୋଣାର୍କ": "Konark", "कोणार्क": "Konark", "konark": "Konark", "konarkk": "Konark",
    "କଟକ": "Cuttack", "कटक": "Cuttack", "cuttack": "Cuttack",
    "ଦାରିଙ୍ଗବାଡ଼ି": "Daringbadi", "दारिंगबाड़ी": "Daringbadi", "daringbadi": "Daringbadi",
    "ସମ୍ବଲପୁର": "Sambalpur", "संबलपुर": "Sambalpur", "sambalpur": "Sambalpur",
    "କୋରାପୁଟ": "Koraput", "कोरापुट": "Koraput", "koraput": "Koraput",
}



def resolve_multilingual_location(text: str) -> Optional[str]:
    """Resolve starting location or district from multilingual text to canonical English name."""
    if not text:
        return None

    norm = normalize_multilingual_text(text)
    tokens = norm.split()

    # 1. Check known primary city hubs and typo aliases
    for token in tokens:
        if token in MULTILINGUAL_CITY_MAP:
            return MULTILINGUAL_CITY_MAP[token]

    # 2. Check alias resolution (e.g. "ରୂପା ସହର" -> Cuttack, "चांदी का शहर" -> Cuttack)
    for n in (3, 2, 1):
        for i in range(len(tokens) - n + 1):
            phrase = " ".join(tokens[i : i + n])
            district = resolve_district(phrase)
            if district:
                return district
            alias_exp = resolve_alias(phrase)
            if alias_exp:
                return alias_exp[0]

    # 3. Typo-tolerant correction fallback
    try:
        from app.services.search.search_correction import SearchCorrectionService
        for token in tokens:
            if len(token) >= 4:
                corrected = SearchCorrectionService.resolve_corrected_query(token)
                if corrected:
                    return corrected
    except Exception:
        pass

    # 4. Fallback intent extractor
    cleaned, detected_district, detected_cat, detected_int, is_med, is_trans = extract_search_intent(text)
    if detected_district:
        return detected_district

    return None




def is_refinement_query(text: str) -> bool:
    """Check if the user message indicates conversational refinement."""
    norm = normalize_multilingual_text(text)
    tokens = set(norm.split())
    return bool(tokens & REFINEMENT_KEYWORDS)


def generate_grounded_itinerary_message(
    language: str,
    days: int,
    stop_count: int,
    start_place: Optional[str] = None,
    interests: Optional[List[str]] = None,
) -> str:
    """Generate truthful, grounded conversational message for a planned itinerary."""
    lang = language.strip().lower()

    if lang in ("or", "odia", "ଓଡ଼ିଆ"):
        interests_or = [get_localized_interest(i, "or") or i for i in (interests or [])]
        theme_str = f" ({', '.join(interests_or)})" if interests_or else ""
        start_str = f" {start_place} ରୁ ଆରମ୍ଭ ହୋଇ" if start_place else ""
        return (
            f"ମୁଁ{start_str} {days}-ଦିନର ଏକ ଯାଞ୍ଚିତ ଯାତ୍ରା ଯୋଜନା{theme_str} ପ୍ରସ୍ତୁତ କରିଛି, "
            f"ଯେଉଁଥିରେ ସମୁଦାୟ {stop_count} ଟି ନିର୍ଦ୍ଧାରିତ ସ୍ଥଳ ସାମିଲ ଅଛି।"
        )
    elif lang in ("hi", "hindi", "हिन्दी", "हिंदी"):
        interests_hi = [get_localized_interest(i, "hi") or i for i in (interests or [])]
        theme_str = f" ({', '.join(interests_hi)})" if interests_hi else ""
        start_str = f" {start_place} से शुरू होने वाला" if start_place else ""
        return (
            f"मैंने{start_str} {days} दिनों का एक सत्यापित यात्रा कार्यक्रम{theme_str} तैयार किया है, "
            f"जिसमें कुल {stop_count} दर्शनीय स्थल शामिल हैं।"
        )
    else:
        theme_str = f" focused on {', '.join(interests)}" if interests else ""
        start_str = f" starting from {start_place}" if start_place else ""
        return (
            f"I have built a verified {days}-day itinerary{start_str}{theme_str} "
            f"with {stop_count} planned stops across Odisha."
        )


def generate_grounded_search_message(
    language: str,
    place_count: int,
    query_topic: Optional[str] = None,
) -> str:
    """Generate truthful, grounded conversational message for search results."""
    lang = language.strip().lower()

    if place_count == 0:
        if lang in ("or", "odia", "ଓଡ଼ିଆ"):
            return "ଆପଣଙ୍କ ଅନୁରୋଧ ଅନୁଯାୟୀ କୌଣସି ଯାଞ୍ଚିତ ସ୍ଥାନ ମିଳିଲା ନାହିଁ। ଦୟାକରି ଅନ୍ୟ ଏକ ସ୍ଥାନ ବା ଥିମ୍ ଚେଷ୍ଟା କରନ୍ତୁ।"
        elif lang in ("hi", "hindi", "हिन्दी", "हिंदी"):
            return "आपके अनुरोध से मेल खाता कोई सत्यापित स्थान नहीं मिला। कृपया कोई अन्य स्थान या थीम आज़माएं।"
        else:
            return "No verified places found matching your request. Please try another destination or theme."

    if lang in ("or", "odia", "ଓଡ଼ିଆ"):
        return f"ଆପଣଙ୍କ ଅନୁରୋଧ ଅନୁଯାୟୀ {place_count} ଟି ଯାଞ୍ଚିତ ସ୍ଥାନ ମିଳିଲା।"
    elif lang in ("hi", "hindi", "हिन्दी", "हिंदी"):
        return f"आपके अनुरोध के अनुसार {place_count} सत्यापित स्थान मिले।"
    else:
        return f"Found {place_count} verified place(s) matching your request."


def generate_conversational_fallback_message(language: str) -> str:
    """Generate truthful, safe conversational fallback message in target language."""
    lang = language.strip().lower()
    if lang in ("or", "odia", "ଓଡ଼ିଆ"):
        return "ମୁଁ ଆପଣଙ୍କୁ ଓଡ଼ିଶା ଭ୍ରମଣ ଯୋଜନା, ସ୍ଥାନ ସନ୍ଧାନ ଏବଂ ପରିବହନ ସୂଚନାରେ ସାହାଯ୍ୟ କରିପାରିବି। ଦୟାକରି ଆପଣଙ୍କ ପସନ୍ଦର ସ୍ଥାନ, ଦିନ ସଂଖ୍ୟା କିମ୍ବା ଆଗ୍ରହ ଜଣାନ୍ତୁ।"
    elif lang in ("hi", "hindi", "हिन्दी", "हिंदी"):
        return "मैं ओडिशा यात्रा योजना, दर्शनीय स्थलों की खोज और परिवहन जानकारी में आपकी सहायता कर सकता हूँ। कृपया अपने पसंदीदा गंतव्य, दिनों की संख्या या रुचि बताएं।"
    else:
        return "I can help you plan a verified trip across Odisha, discover destinations, and check transit options. Please mention your preferred destinations, number of days, or interests."

