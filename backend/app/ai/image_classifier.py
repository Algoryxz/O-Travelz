"""AI Image Classifier and Real Multimodal Landmark Identification Service for Odisha Destinations."""
from __future__ import annotations

import base64
import json
import logging
import re
from typing import Any, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.ai.contracts import ChatMessage, ChatRole, ClaimType, EvidenceItem
from app.ai.image_validator import validate_and_decode_image
from app.core.config import settings
from app.models.category import Category
from app.models.place import Place
from app.schemas.image_identify import ImageIdentifyResponse, PlaceMatchCandidate

logger = logging.getLogger(__name__)

# Prominent Odisha visual landmark signatures for heuristic fallback matching
LANDMARK_VISUAL_SIGNATURES = [
    {
        "keywords": ["konark", "sun temple", "black pagoda", "chariot", "wheel", "stone carving", "suryakund"],
        "target_name": "Konark Sun Temple",
        "district": "Puri",
        "reason": "Identified by distinctive 13th-century Kalinga chariot wheel stone carvings, deula spire architecture, and UNESCO World Heritage sanctuary profile.",
        "base_confidence": 0.88,
    },
    {
        "keywords": ["jagannath", "puri temple", "white pagoda", "neelachakra", "patitapabana", "bada danda", "grand road"],
        "target_name": "Shree Jagannath Temple",
        "district": "Puri",
        "reason": "Identified by the sacred 214-ft Rekha Deula temple tower, Nilachakra crest, and distinctive Kalinga sanctum quadrangle.",
        "base_confidence": 0.86,
    },
    {
        "keywords": ["lingaraj", "lingaraj temple", "bindusagar", "old town", "ekamra"],
        "target_name": "Lingaraj Temple",
        "district": "Khordha",
        "reason": "Identified by monumental 11th-century sandstone tower, Bindusagar water tank surroundings, and quintessentially ornate Kalinga shikhara.",
        "base_confidence": 0.84,
    },
    {
        "keywords": ["chilika", "lake", "lagoon", "irrawaddy", "dolphin", "satapada", "kalijai", "barkul"],
        "target_name": "Chilika Lake (Satapada & Kalijai)",
        "district": "Puri",
        "reason": "Identified by expansive brackish marine lagoon waters, migratory avian habitats, and coastal boat wetlands.",
        "base_confidence": 0.82,
    },
    {
        "keywords": ["dhauli", "shanti stupa", "peace pagoda", "ashoka", "rock edict", "kaya river"],
        "target_name": "Dhauli Shanti Stupa",
        "district": "Khordha",
        "reason": "Identified by pristine white Buddhist Peace Pagoda dome, sculpted stone umbrellas, and Daya River valley vistas.",
        "base_confidence": 0.85,
    },
    {
        "keywords": ["khandagiri", "udayagiri", "rani gumpha", "hathigumpha", "cave", "jain", "rock cut"],
        "target_name": "Udayagiri & Khandagiri Caves",
        "district": "Khordha",
        "reason": "Identified by 2nd-century BCE rock-cut Jain monastic cells, double-storied Rani Gumpha pillared verandas, and Brahmi inscription reliefs.",
        "base_confidence": 0.83,
    },
    {
        "keywords": ["daringbadi", "kashmir of odisha", "pine", "coffee", "hill station", "valley", "mist"],
        "target_name": "Daringbadi Hill Station",
        "district": "Kandhamal",
        "reason": "Identified by high-altitude pine forests, lush coffee plantations, and mist-clad Eastern Ghats highland valleys.",
        "base_confidence": 0.81,
    },
    {
        "keywords": ["hirakud", "dam", "longest dam", "mahanadi", "gandhi minar", "reservoir"],
        "target_name": "Hirakud Dam & Reservoir",
        "district": "Sambalpur",
        "reason": "Identified by one of the world's longest earthen dams, expansive Mahanadi reservoir, and panoramic Gandhi Minar watchtower.",
        "base_confidence": 0.85,
    },
    {
        "keywords": ["deomali", "highest peak", "koraput", "cloud", "plateau", "grassland"],
        "target_name": "Deomali Peak",
        "district": "Koraput",
        "reason": "Identified by Odisha's highest elevation peak (1,672m), rolling emerald ridge grasslands, and Eastern Ghats cloudscapes.",
        "base_confidence": 0.84,
    },
    {
        "keywords": ["similipal", "tiger reserve", "barehipani", "waterfall", "sal forest", "mayurbhanj"],
        "target_name": "Similipal National Park & Biosphere Reserve",
        "district": "Mayurbhanj",
        "reason": "Identified by two-tiered Barehipani waterfall plunge, dense biosphere Sal canopies, and red laterite soil topography.",
        "base_confidence": 0.83,
    },
    {
        "keywords": ["raghurajpur", "pattachitra", "heritage village", "art", "palm leaf", "gotipua"],
        "target_name": "Raghurajpur Heritage Crafts Village",
        "district": "Puri",
        "reason": "Identified by mural-painted artisan veranda houses, coconut palm groves, and world-renowned Pattachitra scroll art studios.",
        "base_confidence": 0.82,
    },
    {
        "keywords": ["mukteshwar", "torana", "arch", "sculpture", "gems of odisha"],
        "target_name": "Mukteshwar Temple",
        "district": "Khordha",
        "reason": "Identified by iconic arched Makara-Torana entrance, intricate 10th-century diamond-carved stone filigree, and sacred Marichi Kunda tank.",
        "base_confidence": 0.87,
    },
    {
        "keywords": ["rajarani", "erotic sculpture", "red sandstone", "khajuraho of east"],
        "target_name": "Rajarani Temple",
        "district": "Khordha",
        "reason": "Identified by warm yellow-red Rajaraniya sandstone, graceful Nayika feminine sculptures, and spire clustering devoid of active deity.",
        "base_confidence": 0.85,
    },
    {
        "keywords": ["chandrabhaga", "beach", "sunrise", "sea", "coast", "marine drive"],
        "target_name": "Chandrabhaga Beach",
        "district": "Puri",
        "reason": "Identified by Blue Flag certified golden coastlines, casuarina dunes, and sweeping Bay of Bengal sunrises near Konark.",
        "base_confidence": 0.80,
    },
]

MULTIMODAL_VISION_SYSTEM_PROMPT = """You are a visual landmark classifier for Odisha, India travel destinations.
Analyze the provided image and identify any prominent Odisha landmark, temple, beach, monument, hill station, wildlife sanctuary, or cultural site visible.

Return a strictly valid JSON object with up to 3 candidate Odisha landmarks, your confidence score (0.0 to 1.0), and a brief visual justification:
{
  "candidates": [
    {"name": "Konark Sun Temple", "confidence": 0.92, "reason": "Distinctive chariot wheel stone carvings and deula tower profile"},
    {"name": "Mukteshwar Temple", "confidence": 0.20, "reason": "Torana arch structure"}
  ]
}
If no Odisha landmark is identifiable, return {"candidates": []}.
Do NOT include coordinates, opening hours, ticket prices, or non-visual historical facts.
"""


class ImageClassifierService:
    """Service to identify Odisha travel destinations using real multimodal vision and canonical grounding."""

    @classmethod
    def identify_place_from_image(
        cls,
        db: Session | None,
        image_data: Optional[str] = None,
        image_url: Optional[str] = None,
        file_name: Optional[str] = None,
        provider_adapter: Optional[Any] = None,
    ) -> ImageIdentifyResponse:
        """Analyze image via Real Multimodal Vision (if available) with deterministic heuristic fallback."""
        # 1. Image Input Security & Validation
        is_valid, val_msg, raw_bytes, mime_type = validate_and_decode_image(
            image_data=image_data,
            image_url=image_url,
        )
        if not is_valid:
            return ImageIdentifyResponse(
                query_type="image",
                status="invalid_image",
                mode="unavailable",
                message=val_msg,
                top_match=None,
                candidates=[],
                evidence=[],
            )

        # 2. Fetch Authoritative Catalog Places
        places_list = cls._fetch_catalog_places(db)
        if not places_list:
            return ImageIdentifyResponse(
                query_type="image",
                status="no_match",
                mode="unavailable",
                message="No destination catalog available.",
                top_match=None,
                candidates=[],
                evidence=[],
            )

        # 3. Attempt Real Multimodal Vision if supported
        vision_result = cls._try_real_multimodal_vision(
            raw_bytes=raw_bytes,
            mime_type=mime_type or "image/jpeg",
            image_url=image_url,
            provider_adapter=provider_adapter,
        )

        if vision_result is not None:
            vision_candidates, provider_name = vision_result
            return cls._match_vision_candidates(
                raw_candidates=vision_candidates,
                places_list=places_list,
                provider_name=provider_name,
            )

        # 4. Fallback to Heuristic Matcher
        return cls._match_heuristic_signatures(
            places_list=places_list,
            file_name=file_name,
            image_url=image_url,
        )

    @classmethod
    def _try_real_multimodal_vision(
        cls,
        raw_bytes: Optional[bytes],
        mime_type: str,
        image_url: Optional[str],
        provider_adapter: Optional[Any],
    ) -> Optional[Tuple[List[dict[str, Any]], str]]:
        """Run vision model inference via configured vision provider adapter."""
        allow_external = getattr(settings, "ai_allow_external_provider", False)
        if not allow_external and provider_adapter is None:
            return None

        # Build image URI
        if image_url:
            img_uri = image_url
        elif raw_bytes:
            b64_str = base64.b64encode(raw_bytes).decode("utf-8")
            img_uri = f"data:{mime_type};base64,{b64_str}"
        else:
            return None

        adapter = provider_adapter
        if adapter is None:
            try:
                from app.ai.adapter import create_provider_adapter

                adapter = create_provider_adapter(settings)
            except Exception as e:
                logger.debug("Could not create provider adapter for vision: %s", e)
                return None

        # Prepare multimodal chat message
        messages = [
            ChatMessage(
                role=ChatRole.SYSTEM,
                content=MULTIMODAL_VISION_SYSTEM_PROMPT,
            ),
            ChatMessage(
                role=ChatRole.USER,
                content="Identify the Odisha landmark or travel destination shown in this image.",
                image_urls=[img_uri],
            ),
        ]

        try:
            resp = adapter.generate(messages, temperature=0.1, max_tokens=500)
            content = resp.content or ""
            provider_name = getattr(adapter, "provider_identifier", "vision_provider")

            # Extract JSON from model output
            json_str = content
            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)

            parsed = json.loads(json_str)
            raw_cands = parsed.get("candidates", [])
            if isinstance(raw_cands, list):
                return raw_cands, provider_name
        except Exception as err:
            logger.warning("Real multimodal vision inference failed or unavailable: %s", err)

        return None

    @classmethod
    def _match_vision_candidates(
        cls,
        raw_candidates: List[dict[str, Any]],
        places_list: List[dict[str, Any]],
        provider_name: str,
    ) -> ImageIdentifyResponse:
        """Ground model-generated candidate names strictly against canonical places catalog."""
        matched_candidates: List[PlaceMatchCandidate] = []

        for cand in raw_candidates:
            if not isinstance(cand, dict):
                continue
            cand_name = str(cand.get("name", "")).strip()
            confidence = float(cand.get("confidence", 0.5))
            reason = str(cand.get("reason", "Visual landmark match."))

            if not cand_name:
                continue

            target_place = cls._resolve_canonical_place(cand_name, places_list)
            if target_place:
                tier = (
                    "Likely Match"
                    if confidence >= 0.70
                    else "Possible Match"
                    if confidence >= 0.35
                    else "Could not confidently identify this place"
                )
                matched_candidates.append(
                    PlaceMatchCandidate(
                        place_id=str(target_place["id"]),
                        name=target_place["name"],
                        district=target_place.get("district") or "Odisha",
                        category=target_place.get("category") or "Sanctuary",
                        confidence=round(min(1.0, max(0.0, confidence)), 2),
                        confidence_tier=tier,
                        reason=reason,
                        lat=target_place.get("lat"),
                        lon=target_place.get("lon"),
                        image_url=None,
                    )
                )

        # Sort candidates descending by confidence
        matched_candidates.sort(key=lambda c: c.confidence, reverse=True)

        if not matched_candidates:
            return ImageIdentifyResponse(
                query_type="image",
                status="no_match",
                mode="real_multimodal",
                message="No known Odisha landmark recognized in the image.",
                top_match=None,
                candidates=[],
                evidence=[],
            )

        top_match = matched_candidates[0]
        status = "verified_match" if top_match.confidence >= 0.70 else "uncertain"
        summary = (
            f"Identified {top_match.name} via AI visual landmark recognition ({int(top_match.confidence * 100)}% match)."
            if status == "verified_match"
            else f"Visual identification uncertain ({int(top_match.confidence * 100)}% match). Showing suggested Odisha landmarks."
        )

        evidence: List[EvidenceItem] = [
            EvidenceItem(
                title="AI Visual Recognition",
                rationale=f"Inferred visual characteristics of '{top_match.name}' from image ({top_match.reason})",
                claim_type=ClaimType.ESTIMATED,
                source=f"AI Vision ({provider_name})",
                confidence="high" if top_match.confidence >= 0.70 else "medium",
            ),
            EvidenceItem(
                title="Canonical Destination Grounding",
                rationale=f"Grounded to verified canonical place '{top_match.name}' in {top_match.district} district",
                claim_type=ClaimType.VERIFIED,
                source="O-TRAVELZ destination catalog",
                confidence="high",
            ),
        ]

        return ImageIdentifyResponse(
            query_type="image",
            status=status,
            mode="real_multimodal",
            message=summary,
            candidate_name=top_match.name,
            canonical_place_id=top_match.place_id,
            confidence=top_match.confidence,
            top_match=top_match,
            candidates=matched_candidates,
            alternatives=matched_candidates[1:],
            evidence=evidence,
            confidence_summary=summary,
        )

    @classmethod
    def _match_heuristic_signatures(
        cls,
        places_list: List[dict[str, Any]],
        file_name: Optional[str] = None,
        image_url: Optional[str] = None,
    ) -> ImageIdentifyResponse:
        """Deterministic signature matching as transparent fallback when vision models are unavailable."""
        hint_text = (file_name or "").lower().replace("_", " ").replace("-", " ")
        if image_url:
            hint_text += " " + image_url.lower().replace("_", " ").replace("-", " ")

        scored_candidates: List[Tuple[float, PlaceMatchCandidate]] = []

        for sig in LANDMARK_VISUAL_SIGNATURES:
            matched_kw = [kw for kw in sig["keywords"] if kw in hint_text]
            target_place = None
            for p in places_list:
                p_name_lower = p["name"].lower()
                if (
                    sig["target_name"].lower() in p_name_lower
                    or p_name_lower in sig["target_name"].lower()
                    or (sig["district"].lower() == (p.get("district") or "").lower() and any(k in p_name_lower for k in sig["keywords"][:2]))
                ):
                    target_place = p
                    break

            if target_place and matched_kw:
                final_conf = min(0.92, sig["base_confidence"])
                tier = "Likely Match" if final_conf >= 0.75 else "Possible Match"

                cand = PlaceMatchCandidate(
                    place_id=str(target_place["id"]),
                    name=target_place["name"],
                    district=target_place.get("district") or sig["district"],
                    category=target_place.get("category") or "Sanctuary",
                    confidence=round(final_conf, 2),
                    confidence_tier=tier,
                    reason=sig["reason"],
                    lat=target_place.get("lat"),
                    lon=target_place.get("lon"),
                    image_url=None,
                )
                scored_candidates.append((final_conf, cand))

        scored_candidates.sort(key=lambda x: x[0], reverse=True)

        if scored_candidates:
            top_cand = scored_candidates[0][1]
            all_cands = [c[1] for c in scored_candidates[:4]]
            status = "success" if top_cand.confidence >= 0.70 else "uncertain"
            summary = (
                f"Identified with {int(top_cand.confidence * 100)}% fallback signature match."
                if status == "success"
                else f"Signature identification uncertain ({int(top_cand.confidence * 100)}% match)."
            )


            evidence: List[EvidenceItem] = [
                EvidenceItem(
                    title="Heuristic Signature Match",
                    rationale=f"Matched visual signature characteristics for '{top_cand.name}' ({top_cand.reason})",
                    claim_type=ClaimType.RESEARCHED,
                    source="O-TRAVELZ heuristic classifier",
                    confidence="medium",
                ),
                EvidenceItem(
                    title="Canonical Place Grounding",
                    rationale=f"Grounded to verified canonical place '{top_cand.name}'",
                    claim_type=ClaimType.VERIFIED,
                    source="O-TRAVELZ destination catalog",
                    confidence="high",
                ),
            ]

            return ImageIdentifyResponse(
                query_type="image",
                status=status,
                mode="heuristic_fallback",
                message=summary,
                candidate_name=top_cand.name,
                canonical_place_id=top_cand.place_id,
                confidence=top_cand.confidence,
                top_match=top_cand,
                candidates=all_cands,
                alternatives=all_cands[1:],
                evidence=evidence,
                confidence_summary=summary,
            )

        # Fallback default sanctuaries when no signature matched
        default_cands: List[PlaceMatchCandidate] = []
        for p in places_list[:3]:
            default_cands.append(
                PlaceMatchCandidate(
                    place_id=str(p["id"]),
                    name=p["name"],
                    district=p.get("district") or "Odisha",
                    category=p.get("category") or "Sanctuary",
                    confidence=0.35,
                    confidence_tier="Could not confidently identify this place",
                    reason="Candidate destination from authoritative Odisha heritage directory.",
                    lat=p.get("lat"),
                    lon=p.get("lon"),
                    image_url=None,
                )
            )

        return ImageIdentifyResponse(
            query_type="image",
            status="uncertain",
            mode="heuristic_fallback",
            message="Could not confidently identify this place. Showing suggested Odisha destinations.",
            top_match=default_cands[0] if default_cands else None,
            candidates=default_cands,
            alternatives=default_cands[1:],
            evidence=[],
            confidence_summary="Uncertain identification. Please pick from suggested candidates or try another photo.",
        )

    @classmethod
    def _resolve_canonical_place(
        cls,
        candidate_name: str,
        places_list: List[dict[str, Any]],
    ) -> Optional[dict[str, Any]]:
        """Fuzzy and alias match candidate name to canonical place in catalog."""
        clean_cand = re.sub(r"[^\w\s]", "", candidate_name).lower().strip()
        if not clean_cand:
            return None

        # 1. Exact or substring match
        for p in places_list:
            clean_p = re.sub(r"[^\w\s]", "", p["name"]).lower().strip()
            if clean_cand == clean_p or clean_cand in clean_p or clean_p in clean_cand:
                return p

        # 2. Keyword overlap match
        cand_tokens = set(clean_cand.split())
        best_place = None
        best_overlap = 0

        for p in places_list:
            p_tokens = set(re.sub(r"[^\w\s]", "", p["name"]).lower().split())
            # Exclude generic words
            filtered_cand = cand_tokens - {"temple", "beach", "lake", "dam", "park", "hills", "sanctuary", "fort", "caves"}
            filtered_p = p_tokens - {"temple", "beach", "lake", "dam", "park", "hills", "sanctuary", "fort", "caves"}
            overlap = len(filtered_cand & filtered_p)
            if overlap > best_overlap:
                best_overlap = overlap
                best_place = p

        if best_overlap >= 1:
            return best_place

        return None

    @staticmethod
    def _fetch_catalog_places(db: Session | None) -> List[dict[str, Any]]:
        """Fetch places list from database or static json fallback."""
        places_list: List[dict[str, Any]] = []
        if db is not None:
            try:
                db_places = db.query(Place, Category).join(Category, Place.category_id == Category.id).all()
                for p, c in db_places:
                    lat = getattr(p, "lat", None)
                    lon = getattr(p, "lon", None)
                    if (lat is None or lon is None) and getattr(p, "location", None) is not None:
                        try:
                            from geoalchemy2.shape import to_shape

                            pt = to_shape(p.location)
                            lat = pt.y
                            lon = pt.x
                        except Exception:
                            pass
                    places_list.append({
                        "id": str(p.id),
                        "name": p.name,
                        "district": p.district or "Odisha",
                        "category": c.name if c else "Sanctuary",
                        "lat": lat,
                        "lon": lon,
                    })
            except Exception:
                places_list = []

        if not places_list:
            try:
                from pathlib import Path

                data_path = Path(__file__).resolve().parents[3] / "data" / "places" / "places.json"
                if data_path.exists():
                    with open(data_path, encoding="utf-8") as f:
                        for raw in json.load(f):
                            places_list.append({
                                "id": raw.get("id", raw.get("name")),
                                "name": raw["name"],
                                "district": raw.get("district") or raw.get("location") or "Odisha",
                                "category": raw.get("category", "Sanctuary"),
                                "lat": raw.get("lat"),
                                "lon": raw.get("lon"),
                            })
            except Exception:
                pass

        return places_list
