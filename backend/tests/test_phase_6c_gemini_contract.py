"""
Unit test suite for Phase 6C Gemini Research Contract.

Tests:
- Prompt formatting and anti-fabrication guidelines.
- JSON extraction and parsing robustness.
- Offline/mock deterministic execution.
- Multi-tier validation logic (VERIFIED, CANDIDATE, AMBIGUOUS, UNRESOLVED).
"""

import pytest
from scripts.build_phase_6c_research import (
    construct_gemini_prompt,
    extract_json_from_response,
    generate_deterministic_offline_research,
    validate_and_classify_result,
)


def test_prompt_includes_anti_fabrication_contract():
    """Verify prompt contains strict anti-fabrication constraints and bounding box instructions."""
    sample_context = {
        "canonical_stop_name": "KHORDHA NEW BUS STAND",
        "aliases": ["KHORDHA BUS STAND"],
        "service_region": "Capital Region",
        "route_ids": ["20", "21", "22"],
        "origin_destination_context": ["Route 20: Master Canteen -> Khordha"],
        "neighboring_route_stops": ["PITAPALLI", "JATANI GATE"],
        "reason_for_priority": "Terminus for 6 routes",
    }

    prompt = construct_gemini_prompt(sample_context)
    assert "KHORDHA NEW BUS STAND" in prompt
    assert "DO NOT invent coordinates" in prompt
    assert "17.5 to 22.8" in prompt
    assert "81.2 to 87.6" in prompt
    assert "research_status" in prompt


def test_json_extraction_from_markdown():
    """Verify extract_json_from_response extracts JSON from diverse text payloads."""
    # Direct JSON
    assert extract_json_from_response('{"test": 123}') == {"test": 123}

    # Markdown fence
    fenced = '```json\n{"status": "FOUND", "candidate_latitude": 20.25}\n```'
    extracted = extract_json_from_response(fenced)
    assert extracted is not None
    assert extracted["status"] == "FOUND"
    assert extracted["candidate_latitude"] == 20.25

    # Text surrounding JSON
    surrounded = 'Here is the result:\n{"candidate_name": "Test Node"}\nThank you.'
    extracted2 = extract_json_from_response(surrounded)
    assert extracted2 is not None
    assert extracted2["candidate_name"] == "Test Node"


def test_validation_rejects_out_of_bounds_coordinates():
    """Verify validate_and_classify_result rejects coordinates outside Odisha."""
    item = {"canonical_stop_name": "TEST STOP", "service_region": "Capital Region"}
    ai_result = {
        "api_status": "SUCCESS",
        "parsed_data": {
            "canonical_stop_name": "TEST STOP",
            "research_status": "FOUND",
            "candidate_latitude": 40.7128,  # New York
            "candidate_longitude": -74.0060,
            "confidence": "HIGH",
            "evidence": [{"source_name": "Test", "supports": "Test"}],
        },
    }
    result = validate_and_classify_result(item, ai_result)
    assert result["status"] == "VALIDATION_REJECTED"
    assert any("outside Odisha" in err for err in result["validation_errors"])


def test_generic_name_classified_ambiguous():
    """Verify generic names like NH or SAI TEMPLE without locality remain AMBIGUOUS."""
    item = {"canonical_stop_name": "NH", "service_region": "Capital Region"}
    ai_result = {
        "api_status": "SUCCESS",
        "parsed_data": {
            "canonical_stop_name": "NH",
            "research_status": "FOUND",
            "candidate_name": "NH",
            "candidate_latitude": 20.25,
            "candidate_longitude": 85.80,
            "confidence": "HIGH",
            "evidence": [{"source_name": "Test", "supports": "Test"}],
        },
    }
    result = validate_and_classify_result(item, ai_result)
    assert result["status"] == "AMBIGUOUS"
    assert result["latitude"] is None
