"""Authoritative Multilingual Taxonomy for Odisha Knowledge Base.

Provides deterministic, zero-fabrication crosswalks for:
  - 30 Administrative Districts of Odisha
  - 16 Canonical Physical Categories
  - 12 Canonical Traveler Interests
  - Verified Cultural, Historical, and Place Aliases

Supports:
  - English (Canonical / Base)
  - Odia (ଓଡ଼ିଆ - Unicode range U+0B00 to U+0B7F)
  - Hindi (हिन्दी - Unicode range U+0900 to U+097F)
  - Standard Romanized Transliterations
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Sequence, Set, Tuple

from app.core.regions import ODISHA_DISTRICTS


class SupportedLanguage(str, Enum):
    ENGLISH = "en"
    ODIA = "or"
    HINDI = "hi"


# Regex preserving ASCII alphanumeric, Odia (U+0B00-U+0B7F), and Devanagari (U+0900-U+097F)
_MULTILINGUAL_CLEAN_REGEX = re.compile(r"[^\w\u0B00-\u0B7F\u0900-\u097F\s]", re.UNICODE)


def normalize_multilingual_text(text: Optional[str]) -> str:
    """
    Normalize text across English, Odia, and Hindi without stripping Indic characters.
    - Strips punctuation and symbols
    - Normalizes whitespace
    - Lowercases ASCII characters
    - Preserves Odia and Devanagari script integrity
    """
    if not text:
        return ""
    # Replace non-alphanumeric/non-Indic characters with space
    cleaned = _MULTILINGUAL_CLEAN_REGEX.sub(" ", text)
    # Lowercase ASCII characters while preserving Indic Unicode
    return " ".join(cleaned.lower().split())


@dataclass(frozen=True)
class LocalizedTaxonomyRecord:
    canonical_id: str
    name_en: str
    name_or: str
    name_hi: str
    aliases: Tuple[str, ...] = field(default_factory=tuple)


# ==============================================================================
# 1. 30 ADMINISTRATIVE DISTRICTS TAXONOMY
# Sourced from Government of Odisha (ଓଡ଼ିଶା ସରକାର) official district portals & Gazette
# ==============================================================================

DISTRICT_TAXONOMY: Tuple[LocalizedTaxonomyRecord, ...] = (
    LocalizedTaxonomyRecord(
        canonical_id="Angul",
        name_en="Angul",
        name_or="ଅନୁଗୋଳ",
        name_hi="अनुगुल",
        aliases=("anugul", "angul", "ଅନୁଗୁଳ", "अंगुल"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Balangir",
        name_en="Balangir",
        name_or="ବଲାଙ୍ଗୀର",
        name_hi="बलांगीर",
        aliases=("bolangir", "balangir", "ବଲାଙ୍ଗିର", "बलंगीर"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Balasore",
        name_en="Balasore",
        name_or="ବାଲେଶ୍ୱର",
        name_hi="बालेश्वर",
        aliases=("baleswar", "balasore", "ବାଲେଶ୍ବର", "बालासोर"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Bargarh",
        name_en="Bargarh",
        name_or="ବରଗଡ଼",
        name_hi="बरगढ़",
        aliases=("baragarh", "bargarh", "ବରଗଡ"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Bhadrak",
        name_en="Bhadrak",
        name_or="ଭଦ୍ରକ",
        name_hi="भद्रक",
        aliases=("bhadrakh", "bhadrak"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Boudh",
        name_en="Boudh",
        name_or="ବୌଦ୍ଧ",
        name_hi="बौद्ध",
        aliases=("baudh", "boudh", "ବୌଦ", "बौध"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Cuttack",
        name_en="Cuttack",
        name_or="କଟକ",
        name_hi="कटक",
        aliases=("kataka", "cuttack", "କଟକ ସହର"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Deogarh",
        name_en="Deogarh",
        name_or="ଦେବଗଡ଼",
        name_hi="देवगढ़",
        aliases=("debagarh", "deogarh", "ଦେବଗଡ"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Dhenkanal",
        name_en="Dhenkanal",
        name_or="ଢେଙ୍କାନାଳ",
        name_hi="ढेंकानाल",
        aliases=("dhenkanal", "ଢେଙ୍କାନାଲ"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Gajapati",
        name_en="Gajapati",
        name_or="ଗଜପତି",
        name_hi="गजपति",
        aliases=("gajapati", "paralakhemundi", "ପାରଳାଖେମୁଣ୍ଡି"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Ganjam",
        name_en="Ganjam",
        name_or="ଗଞ୍ଜାମ",
        name_hi="गंजाम",
        aliases=("ganjam", "berhampur", "brahmapur", "ବ୍ରହ୍ମପୁର", "बरहमपुर"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Jagatsinghpur",
        name_en="Jagatsinghpur",
        name_or="ଜଗତସିଂହପୁର",
        name_hi="जगतसिंहपुर",
        aliases=("jagatsinghapur", "jagatsinghpur"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Jajpur",
        name_en="Jajpur",
        name_or="ଯାଜପୁର",
        name_hi="जाजपुर",
        aliases=("jajapur", "jajpur"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Jharsuguda",
        name_en="Jharsuguda",
        name_or="ଝାରସୁଗୁଡ଼ା",
        name_hi="झारसुगुड़ा",
        aliases=("jharsuguda", "ଝାରସୁଗୁଡା"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Kalahandi",
        name_en="Kalahandi",
        name_or="କଳାହାଣ୍ଡି",
        name_hi="कालाहांडी",
        aliases=("kalahandi", "bhawanipatna", "ଭବାନୀପାଟଣା"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Kandhamal",
        name_en="Kandhamal",
        name_or="କନ୍ଧମାଳ",
        name_hi="कंधमाल",
        aliases=("kandhamal", "phulbani", "ଫୁଲବାଣୀ", "फुलबानी"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Kendrapara",
        name_en="Kendrapara",
        name_or="କେନ୍ଦ୍ରାପଡ଼ା",
        name_hi="केंद्रापड़ा",
        aliases=("kendrapara", "କେନ୍ଦ୍ରାପଡା", "केन्द्रपड़ा"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Keonjhar",
        name_en="Keonjhar",
        name_or="କେନ୍ଦୁଝର",
        name_hi="केन्दुझर",
        aliases=("kendujhar", "keonjhar", "କେନ୍ଦୁଝର", "क्यौंझर"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Khordha",
        name_en="Khordha",
        name_or="ଖୋର୍ଦ୍ଧା",
        name_hi="खोर्धा",
        aliases=("khurda", "khordha", "ଖୋର୍ଦା", "खुरदा", "bhubaneswar", "ଭୁବନେଶ୍ୱର", "भुवनेश्वर"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Koraput",
        name_en="Koraput",
        name_or="କୋରାପୁଟ",
        name_hi="कोरापुट",
        aliases=("koraput", "jeypore", "ଜୟପୁର"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Malkangiri",
        name_en="Malkangiri",
        name_or="ମାଲକାନଗିରି",
        name_hi="मलकानगिरि",
        aliases=("malkangiri", "ମାଲକାନଗିରୀ", "मलकानगिरी"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Mayurbhanj",
        name_en="Mayurbhanj",
        name_or="ମୟୂରଭଞ୍ଜ",
        name_hi="मयूरभंज",
        aliases=("mayurbhanj", "baripada", "ବାରିପଦା", "बारीपदा"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Nabarangpur",
        name_en="Nabarangpur",
        name_or="ନବରଙ୍ଗପୁର",
        name_hi="नबरंगपुर",
        aliases=("nowrangpur", "nabarangpur", "ନବରଙ୍ଗପୁର", "नवरंगपुर"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Nayagarh",
        name_en="Nayagarh",
        name_or="ନୟାଗଡ଼",
        name_hi="नयागढ़",
        aliases=("nayagarh", "ନୟାଗଡ"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Nuapada",
        name_en="Nuapada",
        name_or="ନୂଆପଡ଼ା",
        name_hi="नुआपड़ा",
        aliases=("nuapada", "ନୂଆପଡା"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Puri",
        name_en="Puri",
        name_or="ପୁରୀ",
        name_hi="पुरी",
        aliases=("puri", "jagannath puri", "ପୁରୀ ସହର", "जगन्नाथ पुरी", "पूरी"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Rayagada",
        name_en="Rayagada",
        name_or="ରାୟଗଡ଼ା",
        name_hi="रायगड़ा",
        aliases=("rayagada", "ରାୟଗଡ"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Sambalpur",
        name_en="Sambalpur",
        name_or="ସମ୍ବଲପୁର",
        name_hi="संबलपुर",
        aliases=("sambalpur", "ସମ୍ବଲପୁର ସହର"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Subarnapur",
        name_en="Subarnapur",
        name_or="ସୁବର୍ଣ୍ଣପୁର",
        name_hi="सुवर्णपुर",
        aliases=("sonepur", "subarnapur", "ସୋନପୁର", "ସୁବର୍ଣ୍ଣପୁର", "सोनपुर"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="Sundargarh",
        name_en="Sundargarh",
        name_or="ସୁନ୍ଦରଗଡ଼",
        name_hi="सुंदरगढ़",
        aliases=("sundergarh", "sundargarh", "ସୁନ୍ଦରଗଡ", "rourkela", "ରାଉରକେଲା", "राउरकेला"),
    ),
)

# Build fast lookup indexes for districts
_DISTRICT_BY_CANONICAL: Dict[str, LocalizedTaxonomyRecord] = {
    record.canonical_id: record for record in DISTRICT_TAXONOMY
}

_DISTRICT_LOOKUP_MAP: Dict[str, str] = {}
for record in DISTRICT_TAXONOMY:
    # Canonical English
    _DISTRICT_LOOKUP_MAP[normalize_multilingual_text(record.canonical_id)] = record.canonical_id
    _DISTRICT_LOOKUP_MAP[normalize_multilingual_text(record.name_en)] = record.canonical_id
    # Odia
    _DISTRICT_LOOKUP_MAP[normalize_multilingual_text(record.name_or)] = record.canonical_id
    # Hindi
    _DISTRICT_LOOKUP_MAP[normalize_multilingual_text(record.name_hi)] = record.canonical_id
    # Aliases
    for alias in record.aliases:
        _DISTRICT_LOOKUP_MAP[normalize_multilingual_text(alias)] = record.canonical_id


# ==============================================================================
# 2. 16 CANONICAL PHYSICAL CATEGORIES TAXONOMY
# Sourced from data/places/categories.json & official tourism classifications
# ==============================================================================

CATEGORY_TAXONOMY: Tuple[LocalizedTaxonomyRecord, ...] = (
    LocalizedTaxonomyRecord(
        canonical_id="temple",
        name_en="temple",
        name_or="ମନ୍ଦିର",
        name_hi="मंदिर",
        aliases=("temples", "mandir", "shrine", "shrines", "ମନ୍ଦିର", "ଦେବାଳୟ", "मंदिर", "देवालय"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="monument",
        name_en="monument",
        name_or="ସ୍ମାରକୀ",
        name_hi="स्मारक",
        aliases=("monuments", "fort", "palace", "ସ୍ମାରକ", "କିଲ୍ଲା", "ପ୍ରାସାଦ", "किला", "दुर्ग", "महल"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="museum",
        name_en="museum",
        name_or="ସଂଗ୍ରହାଳୟ",
        name_hi="संग्रहालय",
        aliases=("museums", "gallery", "galleries", "ଅଜାୟବଘର", "ମ୍ୟୁଜିୟମ", "म्यूजियम"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="market",
        name_en="market",
        name_or="ବଜାର",
        name_hi="बाजार",
        aliases=("markets", "bazaar", "haat", "ହାଟ", "ମାର୍କେଟ", "हाट", "मार्केट"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="park",
        name_en="park",
        name_or="ଉଦ୍ୟାନ",
        name_hi="उद्यान",
        aliases=("parks", "garden", "gardens", "ପାର୍କ", "ବଗିଚା", "पार्क", "बगीचा"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="lake",
        name_en="lake",
        name_or="ହ୍ରଦ",
        name_hi="झील",
        aliases=("lakes", "lagoon", "wetland", "reservoir", "ଝିଲ", "ସରୋବର", "झील", "सरोवर"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="beach",
        name_en="beach",
        name_or="ସମୁଦ୍ର କୂଳ",
        name_hi="समुद्र तट",
        aliases=("beaches", "sea beach", "coast", "coastal", "ବେଳାଭୂମି", "ସମୁଦ୍ର ତଟ", "बीच", "समुद्र किनारा"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="nature",
        name_en="nature",
        name_or="ପ୍ରକୃତି",
        name_hi="प्रकृति",
        aliases=("natural", "hills", "hill station", "valley", "ghat", "ପ୍ରାକୃତିକ ସ୍ଥଳ", "घाटी", "हिल स्टेशन"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="waterfall",
        name_en="waterfall",
        name_or="ଜଳପ୍ରପାତ",
        name_hi="जलप्रपात",
        aliases=("waterfalls", "falls", "cascade", "ପ୍ରପାତ", "ଝରଣା", "झरना", "प्रपात"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="wildlife",
        name_en="wildlife",
        name_or="ବନ୍ୟଜନ୍ତୁ ଅଭୟାରଣ୍ୟ",
        name_hi="वन्यजीव अभयारण्य",
        aliases=("sanctuary", "national park", "zoo", "tiger reserve", "biosphere", "ବନ୍ୟପ୍ରାଣୀ", "ଅଭୟାରଣ୍ୟ", "चिड़ियाघर", "वन्यजीव"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="planetarium",
        name_en="planetarium",
        name_or="ତାରାମଣ୍ଡଳ",
        name_hi="तारामंडल",
        aliases=("space theater", "ତାରାଘର", "ତାରାମଣ୍ଡଳ", "नक्षत्रशाला", "तारामंडल"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="sports_venue",
        name_en="sports_venue",
        name_or="କ୍ରୀଡ଼ା ପ୍ରାଙ୍ଗଣ",
        name_hi="खेल परिसर",
        aliases=("sports", "stadium", "sports complex", "ଷ୍ଟାଡିୟମ", "ଖେଳ ପଡ଼ିଆ", "स्टेडियम", "खेल मैदान"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="science_center",
        name_en="science_center",
        name_or="ବିଜ୍ଞାନ କେନ୍ଦ୍ର",
        name_hi="विज्ञान केंद्र",
        aliases=("science", "science park", "science museum", "ବିଜ୍ଞାନ ପାର୍କ", "विज्ञान पार्क"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="hospital",
        name_en="hospital",
        name_or="ଡାକ୍ତରଖାନା",
        name_hi="अस्पताल",
        aliases=("hospitals", "medical", "mch", "dhh", "clinic", "healthcare", "ଚିକିତ୍ସାଳୟ", "ହସପିଟାଲ", "चिकित्सालय", "हॉस्पिटल"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="emergency_facility",
        name_en="emergency_facility",
        name_or="ଜରୁରୀକାଳୀନ ସେବା",
        name_hi="आपातकालीन सुविधा",
        aliases=("emergency", "trauma", "trauma center", "ଜରୁରୀ ଚିକିତ୍ସା", "ଆପାତକାଳୀନ", "आपातकालीन चिकित्सा", "इमरजेंसी"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="transit_hub",
        name_en="transit_hub",
        name_or="ପରିବହନ କେନ୍ଦ୍ର",
        name_hi="परिवहन केंद्र",
        aliases=("transit", "transport", "airport", "railway", "station", "bus", "isbt", "ବିମାନବନ୍ଦର", "ରେଳ ଷ୍ଟେସନ", "ବସ ଷ୍ଟାଣ୍ଡ", "हवाई अड्डा", "रेलवे स्टेशन", "बस स्टैंड", "ट्रांजिट हब"),
    ),
)

_CATEGORY_BY_CANONICAL: Dict[str, LocalizedTaxonomyRecord] = {
    record.canonical_id: record for record in CATEGORY_TAXONOMY
}

_CATEGORY_LOOKUP_MAP: Dict[str, str] = {}
for record in CATEGORY_TAXONOMY:
    _CATEGORY_LOOKUP_MAP[normalize_multilingual_text(record.canonical_id)] = record.canonical_id
    _CATEGORY_LOOKUP_MAP[normalize_multilingual_text(record.name_en)] = record.canonical_id
    _CATEGORY_LOOKUP_MAP[normalize_multilingual_text(record.name_or)] = record.canonical_id
    _CATEGORY_LOOKUP_MAP[normalize_multilingual_text(record.name_hi)] = record.canonical_id
    for alias in record.aliases:
        _CATEGORY_LOOKUP_MAP[normalize_multilingual_text(alias)] = record.canonical_id


# ==============================================================================
# 3. 12 CANONICAL TRAVELER INTERESTS TAXONOMY
# Sourced from data/places/interests.json & canonical traveler theme schemas
# ==============================================================================

INTEREST_TAXONOMY: Tuple[LocalizedTaxonomyRecord, ...] = (
    LocalizedTaxonomyRecord(
        canonical_id="heritage",
        name_en="heritage",
        name_or="ଐତିହ୍ୟ",
        name_hi="विरासत",
        aliases=("history", "historic", "ancient", "archaeology", "ଇତିହାସ", "ପୁରାତନ", "धरोहर", "इतिहास", "प्राचीन"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="spirituality",
        name_en="spirituality",
        name_or="ଆଧ୍ୟାତ୍ମିକତା",
        name_hi="आध्यात्मिकता",
        aliases=("spiritual", "holy", "sacred", "divine", "pilgrimage", "ଭକ୍ତି", "ତୀର୍ଥ", "ଧାର୍ମିକ", "तीर्थ", "धार्मिक", "भक्ति"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="architecture",
        name_en="architecture",
        name_or="ସ୍ଥାପତ୍ୟ",
        name_hi="वास्तुकला",
        aliases=("architectural", "sculpture", "stone art", "ଭାସ୍କର୍ଯ୍ୟ", "ଶିଳ୍ପକଳା", "शिल्पकला", "स्थापत्य"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="food",
        name_en="food",
        name_or="ଖାଦ୍ୟ",
        name_hi="खानपान",
        aliases=("cuisine", "culinary", "sweets", "mahaprasad", "ଓଡ଼ିଆ ଖାଦ୍ୟ", "ମହାପ୍ରସାଦ", "ଆହାର", "व्यंजन", "महाप्रसाद", "भोजन"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="culture",
        name_en="culture",
        name_or="ସଂସ୍କୃତି",
        name_hi="संस्कृति",
        aliases=("cultural", "craft", "handicraft", "tradition", "art", "କଳା", "ହସ୍ତଶିଳ୍ପ", "ପରମ୍ପରା", "कला", "हस्तशिल्प", "परंपरा"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="nature",
        name_en="nature",
        name_or="ପ୍ରକୃତି",
        name_hi="प्रकृति",
        aliases=("natural", "hills", "greenery", "forest", "ପ୍ରାକୃତିକ", "ଜଙ୍ଗଲ", "पर्यावरण", "हरियाली"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="beach",
        name_en="beach",
        name_or="ବେଳାଭୂମି",
        name_hi="समुद्र तट",
        aliases=("coastal", "marine", "seashore", "sand", "ସମୁଦ୍ର", "ସମୁଦ୍ର କୂଳ", "समुद्र", "बीच"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="wildlife",
        name_en="wildlife",
        name_or="ବନ୍ୟଜୀବନ",
        name_hi="वन्यजीव",
        aliases=("animals", "safari", "birds", "sanctuary", "ଜୀବଜନ୍ତୁ", "ପଶୁପକ୍ଷୀ", "पशु-पक्षी", "सफारी"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="waterfall",
        name_en="waterfall",
        name_or="ଜଳପ୍ରପାତ",
        name_hi="जलप्रपात",
        aliases=("waterfalls", "falls", "cascade", "ଝରଣା", "झरना"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="relaxation",
        name_en="relaxation",
        name_or="ବିଶ୍ରାମ",
        name_hi="विश्राम",
        aliases=("relaxing", "relax", "peace", "serene", "peaceful", "leisure", "ଶାନ୍ତି", "ଆରାମ", "शांति", "सुकून"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="adventure",
        name_en="adventure",
        name_or="ଦୁଃସାହସିକ ଯାତ୍ରା",
        name_hi="साहसिक यात्रा",
        aliases=("trekking", "hiking", "boating", "expedition", "ଅଭିଯାନ", "ରୋମାଞ୍ଚ", "रोमांच", "ट्रेकिंग"),
    ),
    LocalizedTaxonomyRecord(
        canonical_id="shopping",
        name_en="shopping",
        name_or="କିଣାକିଣି",
        name_hi="खरीदारी",
        aliases=("handloom", "souvenir", "bazaar", "buying", "ହସ୍ତତନ୍ତ", "ଦୋକାନ", "ବଜାର", "शॉपिंग", "हथकरघा"),
    ),
)

_INTEREST_BY_CANONICAL: Dict[str, LocalizedTaxonomyRecord] = {
    record.canonical_id: record for record in INTEREST_TAXONOMY
}

_INTEREST_LOOKUP_MAP: Dict[str, str] = {}
for record in INTEREST_TAXONOMY:
    _INTEREST_LOOKUP_MAP[normalize_multilingual_text(record.canonical_id)] = record.canonical_id
    _INTEREST_LOOKUP_MAP[normalize_multilingual_text(record.name_en)] = record.canonical_id
    _INTEREST_LOOKUP_MAP[normalize_multilingual_text(record.name_or)] = record.canonical_id
    _INTEREST_LOOKUP_MAP[normalize_multilingual_text(record.name_hi)] = record.canonical_id
    for alias in record.aliases:
        _INTEREST_LOOKUP_MAP[normalize_multilingual_text(alias)] = record.canonical_id


# ==============================================================================
# 4. VERIFIED CULTURAL & PLACE ALIASES
# Authoritative regional titles, transport acronyms, and historical designations
# ==============================================================================

MULTILINGUAL_ALIASES: Dict[str, Tuple[str, ...]] = {
    # Transport hubs / Station codes
    "bbs": ("Bhubaneswar Railway Station", "Bhubaneswar"),
    "bbi": ("Biju Patnaik International Airport", "Bhubaneswar"),
    "jrg": ("Veer Surendra Sai Airport, Jharsuguda", "Jharsuguda"),
    "rrk": ("Rourkela Airport", "Rourkela"),
    "rou": ("Rourkela Junction Railway Station", "Rourkela"),
    "ctc": ("Cuttack Junction Railway Station", "Cuttack"),
    "puri": ("Puri", "Jagannath Temple, Puri", "Puri Railway Station"),
    "bam": ("Brahmapur Railway Station", "Berhampur Railway Station", "Ganjam"),
    "sbp": ("Sambalpur Junction Railway Station", "Sambalpur"),
    "bls": ("Balasore Railway Station", "Balasore"),

    # Cuttack — Silver City
    "silver city": ("Cuttack", "Barabati Fort", "Netaji Birthplace Museum"),
    "ରୂପା ସହର": ("Cuttack", "Barabati Fort", "Netaji Birthplace Museum"),
    "चांदी का शहर": ("Cuttack", "Barabati Fort", "Netaji Birthplace Museum"),
    "silver city of odisha": ("Cuttack", "Barabati Fort"),
    "rupa sahara": ("Cuttack", "Barabati Fort"),

    # Bhubaneswar — Temple City / Ekamra Kshetra
    "temple city": ("Bhubaneswar", "Lingaraj Temple", "Mukteswar Temple"),
    "temple city of india": ("Bhubaneswar", "Lingaraj Temple", "Mukteswar Temple"),
    "ମନ୍ଦିର ମାଳିନୀ ନଗରୀ": ("Bhubaneswar", "Lingaraj Temple", "Mukteswar Temple"),
    "ମନ୍ଦିର ନଗରୀ": ("Bhubaneswar", "Lingaraj Temple", "Mukteswar Temple"),
    "मंदिरों का शहर": ("Bhubaneswar", "Lingaraj Temple", "Mukteswar Temple"),
    "mandira malini nagari": ("Bhubaneswar", "Lingaraj Temple"),
    "ekamra kshetra": ("Bhubaneswar", "Lingaraj Temple", "Old Town Bhubaneswar"),
    "ଏକାମ୍ର କ୍ଷେତ୍ର": ("Bhubaneswar", "Lingaraj Temple", "Old Town Bhubaneswar"),
    "एकाम्र क्षेत्र": ("Bhubaneswar", "Lingaraj Temple", "Old Town Bhubaneswar"),

    # Puri — Jagannath Dham / Srikhetra / Purusottama Kshetra
    "jagannath dham": ("Jagannath Temple, Puri", "Puri", "Grand Road (Bada Danda), Puri"),
    "ଜଗନ୍ନାଥ ଧାମ": ("Jagannath Temple, Puri", "Puri", "Grand Road (Bada Danda), Puri"),
    "जगन्नाथ धाम": ("Jagannath Temple, Puri", "Puri", "Grand Road (Bada Danda), Puri"),
    "srikhetra": ("Jagannath Temple, Puri", "Puri"),
    "ଶ୍ରୀକ୍ଷେତ୍ର": ("Jagannath Temple, Puri", "Puri"),
    "श्रीक्षेत्र": ("Jagannath Temple, Puri", "Puri"),
    "purusottama kshetra": ("Jagannath Temple, Puri", "Puri"),
    "ପୁରୁଷୋତ୍ତମ କ୍ଷେତ୍ର": ("Jagannath Temple, Puri", "Puri"),
    "पुरुषोत्तम क्षेत्र": ("Jagannath Temple, Puri", "Puri"),
    "bada danda": ("Grand Road (Bada Danda), Puri", "Puri"),
    "ବଡ଼ଦାଣ୍ଡ": ("Grand Road (Bada Danda), Puri", "Puri"),
    "बड़ा दांड": ("Grand Road (Bada Danda), Puri", "Puri"),

    # Daringbadi — Kashmir of Odisha
    "kashmir of odisha": ("Daringbadi Hill Station", "Kandhamal"),
    "ଓଡ଼ିଶାର କାଶ୍ମୀର": ("Daringbadi Hill Station", "Kandhamal"),
    "ओडिशा का कश्मीर": ("Daringbadi Hill Station", "Kandhamal"),
    "odishara kashmir": ("Daringbadi Hill Station", "Kandhamal"),

    # Berhampur — Silk City
    "silk city": ("Berhampur", "Ganjam"),
    "ରେଶମ ସହର": ("Berhampur", "Ganjam"),
    "ପାଟ ସହର": ("Berhampur", "Ganjam"),
    "रेशम शहर": ("Berhampur", "Ganjam"),

    # Rourkela — Steel City
    "steel city": ("Rourkela", "Sundargarh", "Ispat General Hospital (IGH), Rourkela"),
    "ଇସ୍ପାତ ସହର": ("Rourkela", "Sundargarh", "Ispat General Hospital (IGH), Rourkela"),
    "इस्पात शहर": ("Rourkela", "Sundargarh", "Ispat General Hospital (IGH), Rourkela"),

    # Sambalpur — Diamond City
    "diamond city": ("Sambalpur", "Hirakud Dam"),
    "ହୀରା ସହର": ("Sambalpur", "Hirakud Dam"),
    "हीरा शहर": ("Sambalpur", "Hirakud Dam"),
}

# Build fast lookup map for aliases
_ALIAS_LOOKUP_MAP: Dict[str, Tuple[str, ...]] = {}
for alias_key, targets in MULTILINGUAL_ALIASES.items():
    _ALIAS_LOOKUP_MAP[normalize_multilingual_text(alias_key)] = targets


# ==============================================================================
# 5. DETERMINISTIC RESOLUTION & LOCALIZATION HELPERS
# ==============================================================================

def resolve_district(query: Optional[str]) -> Optional[str]:
    """
    Resolve a query string (in English, Odia, Hindi, or transliteration) to its
    canonical English district name. Returns None if unknown; zero fabrication.
    """
    if not query:
        return None
    normalized = normalize_multilingual_text(query)
    return _DISTRICT_LOOKUP_MAP.get(normalized)


def resolve_category(query: Optional[str]) -> Optional[str]:
    """
    Resolve a query string (in English, Odia, Hindi, or transliteration) to its
    canonical English category identifier. Returns None if unknown; zero fabrication.
    """
    if not query:
        return None
    normalized = normalize_multilingual_text(query)
    return _CATEGORY_LOOKUP_MAP.get(normalized)


def resolve_interest(query: Optional[str]) -> Optional[str]:
    """
    Resolve a query string (in English, Odia, Hindi, or transliteration) to its
    canonical English traveler interest identifier. Returns None if unknown; zero fabrication.
    """
    if not query:
        return None
    normalized = normalize_multilingual_text(query)
    return _INTEREST_LOOKUP_MAP.get(normalized)


def resolve_alias(query: Optional[str]) -> List[str]:
    """
    Resolve a query string (in English, Odia, Hindi, or transliteration) to its
    canonical place titles or district targets. Returns [] if unknown.
    """
    if not query:
        return []
    normalized = normalize_multilingual_text(query)
    return list(_ALIAS_LOOKUP_MAP.get(normalized, ()))


def get_localized_district(canonical_district: str, language: str = "en") -> Optional[str]:
    """Return localized district title for a canonical district in 'en', 'or', or 'hi'."""
    record = _DISTRICT_BY_CANONICAL.get(canonical_district)
    if not record:
        return None
    lang_clean = language.strip().lower()
    if lang_clean in ("or", "odia", "ଓଡ଼ିଆ"):
        return record.name_or
    elif lang_clean in ("hi", "hindi", "हिन्दी", "हिंदी"):
        return record.name_hi
    return record.name_en


def get_localized_category(canonical_category: str, language: str = "en") -> Optional[str]:
    """Return localized category title for a canonical category in 'en', 'or', or 'hi'."""
    record = _CATEGORY_BY_CANONICAL.get(canonical_category)
    if not record:
        return None
    lang_clean = language.strip().lower()
    if lang_clean in ("or", "odia", "ଓଡ଼ିଆ"):
        return record.name_or
    elif lang_clean in ("hi", "hindi", "हिन्दी", "हिंदी"):
        return record.name_hi
    return record.name_en


def get_localized_interest(canonical_interest: str, language: str = "en") -> Optional[str]:
    """Return localized interest title for a canonical interest in 'en', 'or', or 'hi'."""
    record = _INTEREST_BY_CANONICAL.get(canonical_interest)
    if not record:
        return None
    lang_clean = language.strip().lower()
    if lang_clean in ("or", "odia", "ଓଡ଼ିଆ"):
        return record.name_or
    elif lang_clean in ("hi", "hindi", "हिन्दी", "हिंदी"):
        return record.name_hi
    return record.name_en


def get_all_districts(language: str = "en") -> List[str]:
    """Return all 30 districts localized in the requested language."""
    lang_clean = language.strip().lower()
    if lang_clean in ("or", "odia", "ଓଡ଼ିଆ"):
        return [r.name_or for r in DISTRICT_TAXONOMY]
    elif lang_clean in ("hi", "hindi", "हिन्दी", "हिंदी"):
        return [r.name_hi for r in DISTRICT_TAXONOMY]
    return [r.name_en for r in DISTRICT_TAXONOMY]


def get_all_categories(language: str = "en") -> List[str]:
    """Return all 16 categories localized in the requested language."""
    lang_clean = language.strip().lower()
    if lang_clean in ("or", "odia", "ଓଡ଼ିଆ"):
        return [r.name_or for r in CATEGORY_TAXONOMY]
    elif lang_clean in ("hi", "hindi", "हिन्दी", "हिंदी"):
        return [r.name_hi for r in CATEGORY_TAXONOMY]
    return [r.name_en for r in CATEGORY_TAXONOMY]


def get_all_interests(language: str = "en") -> List[str]:
    """Return all 12 interests localized in the requested language."""
    lang_clean = language.strip().lower()
    if lang_clean in ("or", "odia", "ଓଡ଼ିଆ"):
        return [r.name_or for r in INTEREST_TAXONOMY]
    elif lang_clean in ("hi", "hindi", "हिन्दी", "हिंदी"):
        return [r.name_hi for r in INTEREST_TAXONOMY]
    return [r.name_en for r in INTEREST_TAXONOMY]
