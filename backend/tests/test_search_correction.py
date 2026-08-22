"""Unit and API test suite for Phase 12 Step 10: Search Correction & Typo Suggestions.

Tests typo matching, canonical suggestions, domain isolation, and /places/suggestions endpoint.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.search.search_correction import SearchCorrectionService


class TestSearchCorrectionService:
    def test_poori_typo_resolves_to_puri(self):
        suggestions = SearchCorrectionService.generate_suggestions("poori", limit=3)
        assert len(suggestions) > 0
        top = suggestions[0]
        assert top.canonical_name == "Puri"
        assert top.confidence >= 0.70

    def test_bhuvneshwar_typo_resolves_to_bhubaneswar(self):
        suggestions = SearchCorrectionService.generate_suggestions("bhuvneshwar", limit=3)
        assert len(suggestions) > 0
        top = suggestions[0]
        assert top.canonical_name == "Bhubaneswar"
        assert top.confidence >= 0.70

    def test_konarkk_typo_resolves_to_konark(self):
        suggestions = SearchCorrectionService.generate_suggestions("konarkk", limit=3)
        assert len(suggestions) > 0
        top = suggestions[0]
        assert "Konark" in top.canonical_name

    def test_exact_match_returns_highest_confidence(self):
        suggestions = SearchCorrectionService.generate_suggestions("Cuttack", limit=3)
        assert len(suggestions) > 0
        top = suggestions[0]
        assert top.canonical_name == "Cuttack"
        assert top.confidence == 1.0
        assert top.match_type == "exact"

    def test_places_suggestions_api_endpoint(self):
        client = TestClient(app)
        resp = client.get("/places/suggestions?query=poori&limit=3")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["canonical_name"] == "Puri"
