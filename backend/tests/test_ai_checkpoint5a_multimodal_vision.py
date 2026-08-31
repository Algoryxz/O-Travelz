"""Tests for AI Checkpoint 5A: Real Multimodal Landmark Recognition and Grounding."""
import base64
import io
import json
import os
import pytest
from PIL import Image

from app.ai.contracts import AdapterResponse, ChatMessage, ChatRole, ClaimType, FinishReason
from app.ai.image_classifier import ImageClassifierService
from app.ai.image_validator import validate_and_decode_image
from app.schemas.image_identify import ImageIdentifyResponse


def create_sample_png_bytes(width: int = 100, height: int = 100, color: str = "red") -> bytes:
    """Helper to generate valid in-memory PNG bytes."""
    buf = io.BytesIO()
    img = Image.new("RGB", (width, height), color=color)
    img.save(buf, format="PNG")
    return buf.getvalue()


def create_sample_b64_uri(width: int = 100, height: int = 100) -> str:
    """Helper to generate valid data URI."""
    raw = create_sample_png_bytes(width, height)
    return f"data:image/png;base64,{base64.b64encode(raw).decode('utf-8')}"


class MockVisionProvider:
    """Mock vision provider returning canned multimodal output."""

    def __init__(self, candidates: list[dict] | None = None, should_fail: bool = False):
        self.candidates = candidates or []
        self.should_fail = should_fail
        self.provider_identifier = "mock_vision"

    def generate(self, messages: list[ChatMessage], **kwargs) -> AdapterResponse:
        if self.should_fail:
            raise RuntimeError("Vision provider connection timeout")
        content = json.dumps({"candidates": self.candidates})
        return AdapterResponse(
            content=content,
            finish_reason=FinishReason.STOP,
        )


# ==============================================================================
# 1. Image Input Security & Validation Tests
# ==============================================================================

class TestImageInputSecurity:
    def test_1_valid_image_accepted(self):
        uri = create_sample_b64_uri(150, 150)
        valid, msg, raw, mime = validate_and_decode_image(image_data=uri)
        assert valid is True
        assert raw is not None
        assert mime == "image/png"

    def test_2_invalid_mime_rejected(self):
        fake_b64 = base64.b64encode(b"Not an image content").decode("utf-8")
        uri = f"data:text/plain;base64,{fake_b64}"
        valid, msg, raw, mime = validate_and_decode_image(image_data=uri)
        assert valid is False
        assert "Invalid image data URI format" in msg or "Unsupported MIME type" in msg

    def test_3_oversized_image_rejected(self):
        # 11MB fake bytes
        huge_bytes = b"0" * (11 * 1024 * 1024)
        huge_b64 = f"data:image/png;base64,{base64.b64encode(huge_bytes).decode('utf-8')}"
        valid, msg, raw, mime = validate_and_decode_image(image_data=huge_b64)
        assert valid is False
        assert "exceeds maximum allowed size" in msg or "limit" in msg

    def test_4_malformed_image_rejected(self):
        corrupted_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII_corrupted_data_not_valid"
        valid, msg, raw, mime = validate_and_decode_image(image_data=corrupted_b64)
        assert valid is False
        assert "Malformed" in msg or "corrupted" in msg or "Malformed base64" in msg


# ==============================================================================
# 2. Multimodal Landmark Recognition & Canonical Grounding Tests
# ==============================================================================

class TestMultimodalVisionGrounding:
    def test_5_provider_returns_clear_candidate_leads_to_verified_match(self):
        valid_uri = create_sample_b64_uri()
        provider = MockVisionProvider(
            candidates=[
                {
                    "name": "Konark Sun Temple",
                    "confidence": 0.94,
                    "reason": "Visible 13th-century chariot wheels and sandstone deula structure",
                }
            ]
        )
        res = ImageClassifierService.identify_place_from_image(
            db=None,
            image_data=valid_uri,
            provider_adapter=provider,
        )
        assert res.status == "verified_match"
        assert res.mode == "real_multimodal"
        assert res.top_match is not None
        assert res.top_match.name == "Konark Sun Temple"
        assert res.top_match.confidence == 0.94
        assert len(res.evidence) == 2
        assert res.evidence[0].claim_type == ClaimType.ESTIMATED
        assert res.evidence[1].claim_type == ClaimType.VERIFIED

    def test_6_provider_returns_ambiguous_candidates_leads_to_uncertain(self):
        valid_uri = create_sample_b64_uri()
        provider = MockVisionProvider(
            candidates=[
                {
                    "name": "Lingaraj Temple",
                    "confidence": 0.52,
                    "reason": "Sandstone spire silhouette partially visible",
                },
                {
                    "name": "Rajarani Temple",
                    "confidence": 0.48,
                    "reason": "Arched torana and sandstone carvings",
                },
            ]
        )
        res = ImageClassifierService.identify_place_from_image(
            db=None,
            image_data=valid_uri,
            provider_adapter=provider,
        )
        assert res.status == "uncertain"
        assert res.mode == "real_multimodal"
        assert res.top_match is not None
        assert len(res.candidates) >= 2

    def test_7_provider_returns_unsupported_place_leads_to_no_match(self):
        valid_uri = create_sample_b64_uri()
        provider = MockVisionProvider(
            candidates=[
                {
                    "name": "Eiffel Tower Paris",
                    "confidence": 0.99,
                    "reason": "Iron lattice tower in France",
                }
            ]
        )
        res = ImageClassifierService.identify_place_from_image(
            db=None,
            image_data=valid_uri,
            provider_adapter=provider,
        )
        assert res.status == "no_match"
        assert res.mode == "real_multimodal"
        assert res.top_match is None

    def test_8_provider_unavailable_falls_back_to_heuristic(self):
        valid_uri = create_sample_b64_uri()
        failing_provider = MockVisionProvider(should_fail=True)
        res = ImageClassifierService.identify_place_from_image(
            db=None,
            image_data=valid_uri,
            file_name="puri_jagannath_temple_photo.jpg",
            provider_adapter=failing_provider,
        )
        assert res.mode == "heuristic_fallback"
        assert res.top_match is not None
        assert "Jagannath" in res.top_match.name

    def test_9_heuristic_fallback_no_match_returns_safe_uncertain(self):
        valid_uri = create_sample_b64_uri()
        failing_provider = MockVisionProvider(should_fail=True)
        res = ImageClassifierService.identify_place_from_image(
            db=None,
            image_data=valid_uri,
            file_name="unknown_random_trip.jpg",
            provider_adapter=failing_provider,
        )
        assert res.mode == "heuristic_fallback"
        assert res.status in ("uncertain", "no_match")

    def test_10_provider_output_cannot_inject_unverified_coordinates(self):
        valid_uri = create_sample_b64_uri()
        # Attempt to inject fabricated coordinates from provider JSON
        provider = MockVisionProvider(
            candidates=[
                {
                    "name": "Konark Sun Temple",
                    "confidence": 0.90,
                    "lat": 0.0,
                    "lon": 0.0,
                }
            ]
        )
        res = ImageClassifierService.identify_place_from_image(
            db=None,
            image_data=valid_uri,
            provider_adapter=provider,
        )
        assert res.top_match is not None
        # Coordinates must come from canonical place, not the 0.0 injection!
        if res.top_match.lat is not None:
            assert res.top_match.lat > 18.0

    def test_11_canonical_result_owns_factual_details(self):
        valid_uri = create_sample_b64_uri()
        provider = MockVisionProvider(
            candidates=[
                {
                    "name": "Dhauli Shanti Stupa",
                    "confidence": 0.91,
                }
            ]
        )
        res = ImageClassifierService.identify_place_from_image(
            db=None,
            image_data=valid_uri,
            provider_adapter=provider,
        )
        assert res.status == "verified_match"
        assert res.top_match.district == "Khordha" or res.top_match.district == "Odisha"

    def test_12_no_provider_secrets_logged(self, caplog):
        valid_uri = create_sample_b64_uri()
        provider = MockVisionProvider(
            candidates=[{"name": "Konark Sun Temple", "confidence": 0.90}]
        )
        ImageClassifierService.identify_place_from_image(
            db=None,
            image_data=valid_uri,
            provider_adapter=provider,
        )
        for record in caplog.records:
            assert "api_key" not in record.message.lower()
            assert "secret" not in record.message.lower()

    @pytest.mark.skipif(
        os.getenv("RUN_LIVE_VISION_TESTS") != "true",
        reason="Live provider vision test disabled in deterministic CI",
    )
    def test_13_live_provider_smoke_test(self):
        """Optional live smoke test behind RUN_LIVE_VISION_TESTS=true."""
        from app.core.config import settings

        if not settings.ai_gemini_api_key and not settings.ai_api_key:
            pytest.skip("No live vision provider keys configured")
        valid_uri = create_sample_b64_uri(100, 100)
        res = ImageClassifierService.identify_place_from_image(
            db=None,
            image_data=valid_uri,
        )
        assert res.status in ("verified_match", "uncertain", "no_match")
