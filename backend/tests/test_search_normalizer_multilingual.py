"""Focused unit tests for Multilingual SearchNormalizer (Phase 12 Step 2)."""
from __future__ import annotations

import pytest

from app.services.search.search_normalizer import (
    extract_search_intent,
    get_alias_expansions,
    normalize_text,
    tokenize,
)


class TestSearchNormalizerCompatibility:
    """Test backward compatibility of ASCII normalization and tokenization."""

    def test_ascii_normalization_compatibility(self):
        assert normalize_text("  Puri Beach,   Odisha! ") == "puri beach odisha"
        assert normalize_text("AIIMS-Bhubaneswar") == "aiims bhubaneswar"
        assert normalize_text("Barabati Fort & Palace") == "barabati fort palace"
        assert normalize_text(None) == ""
        assert normalize_text("") == ""

    def test_ascii_tokenization_removes_english_stop_words(self):
        tokens = tokenize("Best temples to visit in Puri and around Odisha")
        assert "puri" in tokens
        assert "temples" in tokens
        assert "in" not in tokens
        assert "to" not in tokens
        assert "and" not in tokens
        assert "best" not in tokens


class TestMultilingualTextNormalization:
    """Test Unicode-safe normalization preserving Odia and Devanagari/Hindi scripts."""

    def test_odia_text_survives_normalization(self):
        odia_text = "ପୁରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର, ଓଡ଼ିଶା!"
        normalized = normalize_text(odia_text)
        assert normalized == "ପୁରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର ଓଡ଼ିଶା"
        # Verify Odia characters are not stripped
        assert "ପୁରୀ" in normalized
        assert "ଜଗନ୍ନାଥ" in normalized
        assert "ମନ୍ଦିର" in normalized

    def test_hindi_text_survives_normalization(self):
        hindi_text = "पुरी जगन्नाथ मंदिर, ओडिशा!"
        normalized = normalize_text(hindi_text)
        assert normalized == "पुरी जगन्नाथ मंदिर ओडिशा"
        assert "पुरी" in normalized
        assert "जगन्नाथ" in normalized
        assert "मंदिर" in normalized

    def test_indic_combining_marks_and_conjuncts_preserved(self):
        # Odia conjuncts and matras: ଖୋର୍ଦ୍ଧା, ସୁନ୍ଦରଗଡ଼, ମୟୂରଭଞ୍ଜ
        assert normalize_text("ଖୋର୍ଦ୍ଧା") == "ଖୋର୍ଦ୍ଧା"
        assert normalize_text("ସୁନ୍ଦରଗଡ଼") == "ସୁନ୍ଦରଗଡ଼"
        assert normalize_text("ମୟୂରଭଞ୍ଜ") == "ମୟୂରଭଞ୍ଜ"
        # Hindi conjuncts and matras: खोर्धा, सुंदरगढ़, मयूरभंज
        assert normalize_text("खोर्धा") == "खोर्धा"
        assert normalize_text("सुंदरगढ़") == "सुंदरगढ़"
        assert normalize_text("मयूरभंज") == "मयूरभंज"

    def test_multilingual_tokenization_filters_stop_words(self):
        # Odia query with stop words
        odia_tokens = tokenize("ପୁରୀ ରେ ଶ୍ରେଷ୍ଠ ମନ୍ଦିର ଏବଂ ଦେଖିବା ସ୍ଥାନ")
        assert "ପୁରୀ" in odia_tokens
        assert "ମନ୍ଦିର" in odia_tokens
        assert "ରେ" not in odia_tokens
        assert "ଏବଂ" not in odia_tokens
        assert "ଦେଖିବା" not in odia_tokens
        assert "ସ୍ଥାନ" not in odia_tokens

        # Hindi query with stop words
        hindi_tokens = tokenize("पुरी में प्रमुख मंदिर और घूमने के स्थान")
        assert "पुरी" in hindi_tokens
        assert "मंदिर" in hindi_tokens
        assert "में" not in hindi_tokens
        assert "और" not in hindi_tokens
        assert "घूमने" not in hindi_tokens
        assert "के" not in hindi_tokens
        assert "स्थान" not in hindi_tokens


class TestMultilingualIntentExtraction:
    """Test semantic intent extraction across English, Odia, Hindi, and mixed queries."""

    def test_odia_district_resolution(self):
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ପୁରୀ ଭ୍ରମଣ")
        assert dist == "Puri"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("କଟକ ସହର")
        assert dist == "Cuttack"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ସମ୍ବଲପୁର ର ପର୍ଯ୍ୟଟନ")
        assert dist == "Sambalpur"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("କୋରାପୁଟ ପାହାଡ")
        assert dist == "Koraput"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ମୟୂରଭଞ୍ଜ ଅଭୟାରଣ୍ୟ")
        assert dist == "Mayurbhanj"

    def test_hindi_district_resolution(self):
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("पुरी पर्यटन")
        assert dist == "Puri"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("कटक शहर")
        assert dist == "Cuttack"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("संबलपुर के स्थान")
        assert dist == "Sambalpur"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("कोरापुट")
        assert dist == "Koraput"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("मयूरभंज")
        assert dist == "Mayurbhanj"

    def test_odia_category_resolution(self):
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ମନ୍ଦିର")
        assert cat == "temple"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ଜଳପ୍ରପାତ")
        assert cat == "waterfall"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ସମୁଦ୍ର କୂଳ")
        assert cat == "beach"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ସଂଗ୍ରହାଳୟ")
        assert cat == "museum"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ବନ୍ୟଜନ୍ତୁ ଅଭୟାରଣ୍ୟ")
        assert cat == "wildlife"

    def test_hindi_category_resolution(self):
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("मंदिर")
        assert cat == "temple"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("झरना")
        assert cat == "waterfall"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("समुद्र तट")
        assert cat == "beach"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("संग्रहालय")
        assert cat == "museum"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("वन्यजीव अभयारण्य")
        assert cat == "wildlife"

    def test_odia_interest_resolution(self):
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ଐତିହ୍ୟ")
        assert interest == "heritage"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ଆଧ୍ୟାତ୍ମିକତା")
        assert interest == "spirituality"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ଓଡ଼ିଆ ଖାଦ୍ୟ")
        assert interest == "food"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ଦୁଃସାହସିକ ଯାତ୍ରା")
        assert interest == "adventure"

    def test_hindi_interest_resolution(self):
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("विरासत")
        assert interest == "heritage"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("आध्यात्मिकता")
        assert interest == "spirituality"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("खानपान")
        assert interest == "food"

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("साहसिक यात्रा")
        assert interest == "adventure"

    def test_mixed_language_intent_extraction(self):
        # English + Odia
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("Temples in ପୁରୀ")
        assert dist == "Puri"
        assert cat == "temple"

        # Odia + English
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("କଟକ temples")
        assert dist == "Cuttack"
        assert cat == "temple"

        # English + Hindi
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("Waterfalls in मयूरभंज")
        assert dist == "Mayurbhanj"
        assert cat == "waterfall"

        # Hindi + English
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("पुरी beaches")
        assert dist == "Puri"
        assert cat == "beach"

    def test_medical_intent_detection_in_odia_and_hindi(self):
        # Odia medical terms
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("କଟକ ଡାକ୍ତରଖାନା")
        assert dist == "Cuttack"
        assert is_med is True

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ଭୁବନେଶ୍ୱର ଚିକିତ୍ସାଳୟ")
        assert is_med is True

        # Hindi medical terms
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("कटक अस्पताल")
        assert dist == "Cuttack"
        assert is_med is True

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("भुवनेश्वर चिकित्सालय")
        assert is_med is True

    def test_transit_intent_detection_in_odia_and_hindi(self):
        # Odia transit terms
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ଭୁବନେଶ୍ୱର ବିମାନବନ୍ଦର")
        assert is_trans is True

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("ପୁରୀ ରେଳ ଷ୍ଟେସନ")
        assert dist == "Puri"
        assert is_trans is True

        # Hindi transit terms
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("भुवनेश्वर हवाई अड्डा")
        assert is_trans is True

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("पूरी रेलवे स्टेशन")
        assert dist == "Puri"
        assert is_trans is True

    def test_unknown_multilingual_text_does_not_fabricate_entity(self):
        """Unknown Odia and Hindi terms must return None for district, category, interest."""
        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("କୌଣସି ଅଜ୍ଞାତ ଶବ୍ଦ")
        assert dist is None
        assert cat is None
        assert interest is None
        assert is_med is None
        assert is_trans is None

        norm, dist, cat, interest, is_med, is_trans = extract_search_intent("कोई अज्ञात स्थान शब्द")
        assert dist is None
        assert cat is None
        assert interest is None
        assert is_med is None
        assert is_trans is None


class TestMultilingualAliasExpansions:
    """Test alias expansions across English, Odia, Hindi, and station acronyms."""

    def test_english_acronyms_and_aliases_preserved(self):
        bbi = get_alias_expansions("BBI")
        assert any("Biju Patnaik International Airport" in t for t in bbi)

        bbs = get_alias_expansions("BBS")
        assert any("Bhubaneswar Railway Station" in t for t in bbs)

        jrg = get_alias_expansions("JRG")
        assert any("Veer Surendra Sai Airport" in t for t in jrg)

        rrk = get_alias_expansions("RRK")
        assert any("Rourkela Airport" in t for t in rrk)

        rou = get_alias_expansions("ROU")
        assert any("Rourkela Junction" in t for t in rou)

        ctc = get_alias_expansions("CTC")
        assert any("Cuttack Junction" in t for t in ctc)

        puri = get_alias_expansions("PURI")
        assert any("Jagannath Temple" in t for t in puri)

        bam = get_alias_expansions("BAM")
        assert any("Brahmapur" in t or "Berhampur" in t for t in bam)

        sbp = get_alias_expansions("SBP")
        assert any("Sambalpur Junction" in t for t in sbp)

        bls = get_alias_expansions("BLS")
        assert any("Balasore Railway Station" in t for t in bls)

        silver_city = get_alias_expansions("Silver City")
        assert "Cuttack" in silver_city

        temple_city = get_alias_expansions("Temple City")
        assert "Bhubaneswar" in temple_city

        kashmir = get_alias_expansions("Kashmir of Odisha")
        assert "Daringbadi Hill Station" in kashmir

    def test_odia_cultural_aliases_resolve(self):
        silver_or = get_alias_expansions("ରୂପା ସହର")
        assert "Cuttack" in silver_or

        temple_or = get_alias_expansions("ମନ୍ଦିର ମାଳିନୀ ନଗରୀ")
        assert "Bhubaneswar" in temple_or

        kashmir_or = get_alias_expansions("ଓଡ଼ିଶାର କାଶ୍ମୀର")
        assert "Daringbadi Hill Station" in kashmir_or

        jagannath_or = get_alias_expansions("ଜଗନ୍ନାଥ ଧାମ")
        assert "Jagannath Temple, Puri" in jagannath_or

        srikhetra_or = get_alias_expansions("ଶ୍ରୀକ୍ଷେତ୍ର")
        assert "Jagannath Temple, Puri" in srikhetra_or

    def test_hindi_cultural_aliases_resolve(self):
        silver_hi = get_alias_expansions("चांदी का शहर")
        assert "Cuttack" in silver_hi

        temple_hi = get_alias_expansions("मंदिरों का शहर")
        assert "Bhubaneswar" in temple_hi

        kashmir_hi = get_alias_expansions("ओडिशा का कश्मीर")
        assert "Daringbadi Hill Station" in kashmir_hi

        jagannath_hi = get_alias_expansions("जगन्नाथ धाम")
        assert "Jagannath Temple, Puri" in jagannath_hi

        srikhetra_hi = get_alias_expansions("श्रीक्षेत्र")
        assert "Jagannath Temple, Puri" in srikhetra_hi
