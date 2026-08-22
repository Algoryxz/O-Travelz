"""Unit tests for the Multilingual Knowledge & Taxonomy Model."""
from __future__ import annotations

import pytest

from app.core.regions import ODISHA_DISTRICTS
from app.data.multilingual_taxonomy import (
    CATEGORY_TAXONOMY,
    DISTRICT_TAXONOMY,
    INTEREST_TAXONOMY,
    MULTILINGUAL_ALIASES,
    get_all_categories,
    get_all_districts,
    get_all_interests,
    get_localized_category,
    get_localized_district,
    get_localized_interest,
    normalize_multilingual_text,
    resolve_alias,
    resolve_category,
    resolve_district,
    resolve_interest,
)


class TestMultilingualTaxonomyIntegrity:
    """Validate completeness and schema integrity of the multilingual knowledge base."""

    def test_all_30_districts_represented(self):
        """All 30 canonical administrative districts of Odisha must exist with 1:1 parity."""
        assert len(DISTRICT_TAXONOMY) == 30
        canonical_ids = {r.canonical_id for r in DISTRICT_TAXONOMY}
        assert canonical_ids == set(ODISHA_DISTRICTS)

    def test_district_records_have_valid_localized_names(self):
        """Every district record must have non-empty English, Odia, and Hindi names."""
        for record in DISTRICT_TAXONOMY:
            assert record.name_en, f"Missing English name for district {record.canonical_id}"
            assert record.name_or, f"Missing Odia name for district {record.canonical_id}"
            assert record.name_hi, f"Missing Hindi name for district {record.canonical_id}"
            # Check for non-ASCII Indic characters in Odia and Hindi names
            assert any("\u0B00" <= char <= "\u0B7F" for char in record.name_or), (
                f"District {record.canonical_id} Odia name '{record.name_or}' missing Odia unicode block"
            )
            assert any("\u0900" <= char <= "\u097F" for char in record.name_hi), (
                f"District {record.canonical_id} Hindi name '{record.name_hi}' missing Devanagari unicode block"
            )

    def test_all_16_categories_represented(self):
        """All 16 physical categories must have localized records."""
        assert len(CATEGORY_TAXONOMY) == 16
        canonical_ids = {r.canonical_id for r in CATEGORY_TAXONOMY}
        expected_categories = {
            "temple",
            "monument",
            "museum",
            "market",
            "park",
            "lake",
            "beach",
            "nature",
            "waterfall",
            "wildlife",
            "planetarium",
            "sports_venue",
            "science_center",
            "hospital",
            "emergency_facility",
            "transit_hub",
        }
        assert canonical_ids == expected_categories

    def test_all_12_interests_represented(self):
        """All 12 canonical traveler interests must have localized records."""
        assert len(INTEREST_TAXONOMY) == 12
        canonical_ids = {r.canonical_id for r in INTEREST_TAXONOMY}
        expected_interests = {
            "heritage",
            "spirituality",
            "architecture",
            "food",
            "culture",
            "nature",
            "beach",
            "wildlife",
            "waterfall",
            "relaxation",
            "adventure",
            "shopping",
        }
        assert canonical_ids == expected_interests


class TestMultilingualNormalization:
    """Validate Unicode-aware normalization preserving Odia and Devanagari scripts."""

    def test_preserves_odia_script(self):
        text = "ପୁରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର"
        normalized = normalize_multilingual_text(text)
        assert normalized == "ପୁରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର"

    def test_preserves_devanagari_script(self):
        text = "पुरी जगन्नाथ मंदिर"
        normalized = normalize_multilingual_text(text)
        assert normalized == "पुरी जगन्नाथ मंदिर"

    def test_strips_punctuation_from_indic_text(self):
        text = "ପୁରୀ, (ଓଡ଼ିଶା) - ଜଗନ୍ନାଥ ଧାମ!"
        normalized = normalize_multilingual_text(text)
        assert normalized == "ପୁରୀ ଓଡ଼ିଶା ଜଗନ୍ନାଥ ଧାମ"

    def test_lowercases_english_and_collapses_whitespace(self):
        text = "   Bhubaneswar   TEMPLE   City   "
        normalized = normalize_multilingual_text(text)
        assert normalized == "bhubaneswar temple city"

    def test_handles_empty_and_none(self):
        assert normalize_multilingual_text(None) == ""
        assert normalize_multilingual_text("") == ""
        assert normalize_multilingual_text("   ") == ""


class TestMultilingualDistrictResolution:
    """Validate cross-lingual lookup of Odisha districts."""

    @pytest.mark.parametrize(
        "query,expected_canonical",
        [
            # English canonical & variants
            ("Puri", "Puri"),
            ("puri", "Puri"),
            ("Khordha", "Khordha"),
            ("khurda", "Khordha"),
            ("Cuttack", "Cuttack"),
            ("Mayurbhanj", "Mayurbhanj"),
            ("Sundargarh", "Sundargarh"),
            ("sundergarh", "Sundargarh"),
            ("Koraput", "Koraput"),
            ("Subarnapur", "Subarnapur"),
            ("sonepur", "Subarnapur"),
            # Odia native
            ("ପୁରୀ", "Puri"),
            ("ଖୋର୍ଦ୍ଧା", "Khordha"),
            ("କଟକ", "Cuttack"),
            ("ସମ୍ବଲପୁର", "Sambalpur"),
            ("ମୟୂରଭଞ୍ଜ", "Mayurbhanj"),
            ("କୋରାପୁଟ", "Koraput"),
            ("ସୁନ୍ଦରଗଡ଼", "Sundargarh"),
            ("ଗଞ୍ଜାମ", "Ganjam"),
            ("କନ୍ଧମାଳ", "Kandhamal"),
            ("ବଲାଙ୍ଗୀର", "Balangir"),
            ("ଅନୁଗୋଳ", "Angul"),
            ("ସୁବର୍ଣ୍ଣପୁର", "Subarnapur"),
            # Hindi native
            ("पुरी", "Puri"),
            ("खोर्धा", "Khordha"),
            ("खुरदा", "Khordha"),
            ("कटक", "Cuttack"),
            ("संबलपुर", "Sambalpur"),
            ("मयूरभंज", "Mayurbhanj"),
            ("कोरापुट", "Koraput"),
            ("सुंदरगढ़", "Sundargarh"),
            ("गंजाम", "Ganjam"),
            ("कंधमाल", "Kandhamal"),
            ("बलांगीर", "Balangir"),
            ("अनुगुल", "Angul"),
            ("सुवर्णपुर", "Subarnapur"),
            ("सोनपुर", "Subarnapur"),
        ],
    )
    def test_resolve_district(self, query: str, expected_canonical: str):
        assert resolve_district(query) == expected_canonical

    def test_resolve_district_unknown_returns_none(self):
        """Unknown places/terms must return None; zero fabrication."""
        assert resolve_district("California") is None
        assert resolve_district("London") is None
        assert resolve_district("ଦିଲ୍ଲୀ") is None
        assert resolve_district("मुंबई") is None
        assert resolve_district("") is None
        assert resolve_district(None) is None


class TestMultilingualCategoryResolution:
    """Validate cross-lingual lookup of physical categories."""

    @pytest.mark.parametrize(
        "query,expected_category",
        [
            # English
            ("temple", "temple"),
            ("monument", "monument"),
            ("museum", "museum"),
            ("waterfall", "waterfall"),
            ("beach", "beach"),
            ("hospital", "hospital"),
            ("emergency_facility", "emergency_facility"),
            ("transit_hub", "transit_hub"),
            # Odia
            ("ମନ୍ଦିର", "temple"),
            ("ସ୍ମାରକୀ", "monument"),
            ("ସଂଗ୍ରହାଳୟ", "museum"),
            ("ଜଳପ୍ରପାତ", "waterfall"),
            ("ସମୁଦ୍ର କୂଳ", "beach"),
            ("ବେଳାଭୂମି", "beach"),
            ("ଡାକ୍ତରଖାନା", "hospital"),
            ("ଚିକିତ୍ସାଳୟ", "hospital"),
            ("ପରିବହନ କେନ୍ଦ୍ର", "transit_hub"),
            ("ବିମାନବନ୍ଦର", "transit_hub"),
            ("ରେଳ ଷ୍ଟେସନ", "transit_hub"),
            # Hindi
            ("मंदिर", "temple"),
            ("स्मारक", "monument"),
            ("संग्रहालय", "museum"),
            ("जलप्रपात", "waterfall"),
            ("झरना", "waterfall"),
            ("समुद्र तट", "beach"),
            ("अस्पताल", "hospital"),
            ("चिकित्सालय", "hospital"),
            ("परिवहन केंद्र", "transit_hub"),
            ("हवाई अड्डा", "transit_hub"),
            ("रेलवे स्टेशन", "transit_hub"),
        ],
    )
    def test_resolve_category(self, query: str, expected_category: str):
        assert resolve_category(query) == expected_category

    def test_resolve_category_unknown_returns_none(self):
        assert resolve_category("hotel") is None
        assert resolve_category("restaurant") is None
        assert resolve_category("ସପିଂ ମଲ") is None
        assert resolve_category("") is None
        assert resolve_category(None) is None


class TestMultilingualInterestResolution:
    """Validate cross-lingual lookup of traveler themes."""

    @pytest.mark.parametrize(
        "query,expected_interest",
        [
            # English
            ("heritage", "heritage"),
            ("spirituality", "spirituality"),
            ("architecture", "architecture"),
            ("food", "food"),
            ("wildlife", "wildlife"),
            ("adventure", "adventure"),
            ("shopping", "shopping"),
            # Odia
            ("ଐତିହ୍ୟ", "heritage"),
            ("ଆଧ୍ୟାତ୍ମିକତା", "spirituality"),
            ("ସ୍ଥାପତ୍ୟ", "architecture"),
            ("ଖାଦ୍ୟ", "food"),
            ("ଓଡ଼ିଆ ଖାଦ୍ୟ", "food"),
            ("ବନ୍ୟଜୀବନ", "wildlife"),
            ("ଦୁଃସାହସିକ ଯାତ୍ରା", "adventure"),
            ("କିଣାକିଣି", "shopping"),
            # Hindi
            ("विरासत", "heritage"),
            ("धरोहर", "heritage"),
            ("आध्यात्मिकता", "spirituality"),
            ("वास्तुकला", "architecture"),
            ("खानपान", "food"),
            ("वन्यजीव", "wildlife"),
            ("साहसिक यात्रा", "adventure"),
            ("खरीदारी", "shopping"),
        ],
    )
    def test_resolve_interest(self, query: str, expected_interest: str):
        assert resolve_interest(query) == expected_interest

    def test_resolve_interest_unknown_returns_none(self):
        assert resolve_interest("nightlife") is None
        assert resolve_interest("gambling") is None
        assert resolve_interest("ଜୁଆଖେଳ") is None
        assert resolve_interest("") is None
        assert resolve_interest(None) is None


class TestMultilingualAliasResolution:
    """Validate cross-lingual lookup of cultural and historical aliases."""

    def test_silver_city_aliases(self):
        targets_en = resolve_alias("silver city")
        targets_or = resolve_alias("ରୂପା ସହର")
        targets_hi = resolve_alias("चांदी का शहर")
        assert "Cuttack" in targets_en
        assert "Cuttack" in targets_or
        assert "Cuttack" in targets_hi

    def test_temple_city_aliases(self):
        targets_en = resolve_alias("temple city")
        targets_or = resolve_alias("ମନ୍ଦିର ମାଳିନୀ ନଗରୀ")
        targets_hi = resolve_alias("मंदिरों का शहर")
        assert "Bhubaneswar" in targets_en
        assert "Bhubaneswar" in targets_or
        assert "Bhubaneswar" in targets_hi

    def test_kashmir_of_odisha_aliases(self):
        targets_en = resolve_alias("kashmir of odisha")
        targets_or = resolve_alias("ଓଡ଼ିଶାର କାଶ୍ମୀର")
        targets_hi = resolve_alias("ओडिशा का कश्मीर")
        assert "Daringbadi Hill Station" in targets_en
        assert "Daringbadi Hill Station" in targets_or
        assert "Daringbadi Hill Station" in targets_hi

    def test_jagannath_dham_and_srikhetra(self):
        targets_jd_or = resolve_alias("ଜଗନ୍ନାଥ ଧାମ")
        targets_jd_hi = resolve_alias("जगन्नाथ धाम")
        targets_sk_or = resolve_alias("ଶ୍ରୀକ୍ଷେତ୍ର")
        targets_sk_hi = resolve_alias("श्रीक्षेत्र")
        assert "Jagannath Temple, Puri" in targets_jd_or
        assert "Jagannath Temple, Puri" in targets_jd_hi
        assert "Jagannath Temple, Puri" in targets_sk_or
        assert "Jagannath Temple, Puri" in targets_sk_hi

    def test_unknown_alias_returns_empty_list(self):
        assert resolve_alias("nonexistent alias") == []
        assert resolve_alias("କୌଣସି ଅଜ୍ଞାତ ସ୍ଥାନ") == []
        assert resolve_alias("") == []
        assert resolve_alias(None) == []


class TestLocalizationHelpers:
    """Validate localized output generation for canonical records."""

    def test_get_localized_district(self):
        assert get_localized_district("Puri", "en") == "Puri"
        assert get_localized_district("Puri", "or") == "ପୁରୀ"
        assert get_localized_district("Puri", "hi") == "पुरी"
        assert get_localized_district("NonexistentDistrict", "or") is None

    def test_get_localized_category(self):
        assert get_localized_category("temple", "en") == "temple"
        assert get_localized_category("temple", "or") == "ମନ୍ଦିର"
        assert get_localized_category("temple", "hi") == "मंदिर"
        assert get_localized_category("nonexistent_category", "or") is None

    def test_get_localized_interest(self):
        assert get_localized_interest("heritage", "en") == "heritage"
        assert get_localized_interest("heritage", "or") == "ଐତିହ୍ୟ"
        assert get_localized_interest("heritage", "hi") == "विरासत"
        assert get_localized_interest("nonexistent_interest", "hi") is None

    def test_get_all_districts(self):
        districts_en = get_all_districts("en")
        districts_or = get_all_districts("or")
        districts_hi = get_all_districts("hi")
        assert len(districts_en) == 30
        assert len(districts_or) == 30
        assert len(districts_hi) == 30
        assert "Puri" in districts_en
        assert "ପୁରୀ" in districts_or
        assert "पुरी" in districts_hi
