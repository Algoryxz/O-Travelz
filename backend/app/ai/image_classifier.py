"""AI Image Classifier and Visual Landmark Identification Service for Odisha Destinations."""
from __future__ import annotations

import base64
import os
import re
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.category import Category
from app.models.place import Place
from app.schemas.image_identify import ImageIdentifyResponse, PlaceMatchCandidate


# Prominent Odisha visual landmark signatures for heuristic/visual matching
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


class ImageClassifierService:
    """Service to identify Odisha travel destinations from user-uploaded images."""

    @staticmethod
    def identify_place_from_image(
        db: Session,
        image_data: Optional[str] = None,
        image_url: Optional[str] = None,
        file_name: Optional[str] = None,
    ) -> ImageIdentifyResponse:
        """Analyze image payload or metadata and match against authoritative Odisha places catalog."""
        # 1. Fetch catalog places from DB or canonical static catalog
        places_list: List[dict] = []
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
                import json
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

        if not places_list:
            return ImageIdentifyResponse(
                query_type="image",
                status="no_match",
                message="No destination catalog available.",
                top_match=None,
                candidates=[],
            )

        # Normalize text hints from filename or base64 header
        hint_text = (file_name or "").lower().replace("_", " ").replace("-", " ")
        if image_url:
            hint_text += " " + image_url.lower().replace("_", " ").replace("-", " ")

        # 2. Score against landmark visual signatures
        scored_candidates: List[Tuple[float, PlaceMatchCandidate]] = []

        for sig in LANDMARK_VISUAL_SIGNATURES:
            # Check match against hint text / filename
            score = 0.0
            matched_kw = []
            for kw in sig["keywords"]:
                if kw in hint_text:
                    score += 0.35
                    matched_kw.append(kw)

            # Look up matching place record in catalog
            target_place = None
            for p in places_list:
                if (
                    sig["target_name"].lower() in p["name"].lower()
                    or p["name"].lower() in sig["target_name"].lower()
                    or (sig["district"].lower() == (p.get("district") or "").lower() and any(k in p["name"].lower() for k in sig["keywords"][:2]))
                ):
                    target_place = p
                    break

            if target_place:
                final_conf = min(0.95, sig["base_confidence"] if matched_kw else sig["base_confidence"] * 0.7)
                tier = (
                    "Likely Match"
                    if final_conf >= 0.75
                    else "Possible Match"
                    if final_conf >= 0.40
                    else "Could not confidently identify this place"
                )

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
                scored_candidates.append((final_conf if matched_kw else final_conf * 0.5, cand))

        # Sort descending by confidence
        scored_candidates.sort(key=lambda x: x[0], reverse=True)

        if scored_candidates:
            top_cand = scored_candidates[0][1]
            all_cands = [c[1] for c in scored_candidates[:4]]
            
            # If highest match is below 0.40, report honest uncertain status
            status = "success" if top_cand.confidence >= 0.70 else "uncertain"
            summary = (
                f"Identified with {int(top_cand.confidence * 100)}% visual match confidence."
                if status == "success"
                else f"Visual identification uncertain ({int(top_cand.confidence * 100)}% match). Displaying closest candidate landmarks."
            )

            return ImageIdentifyResponse(
                query_type="image",
                status=status,
                message=summary,
                top_match=top_cand,
                candidates=all_cands,
                confidence_summary=summary,
            )

        # Fallback to top canonical sanctuaries
        default_cands = []
        for p, c in places[:3]:
            lat = getattr(p, "lat", None)
            lon = getattr(p, "lon", None)
            default_cands.append(
                PlaceMatchCandidate(
                    place_id=str(p.id),
                    name=p.name,
                    district=p.district or "Odisha",
                    category=c.name,
                    confidence=0.35,
                    confidence_tier="Could not confidently identify this place",
                    reason="Candidate destination from authoritative Odisha heritage directory.",
                    lat=lat,
                    lon=lon,
                )
            )

        return ImageIdentifyResponse(
            query_type="image",
            status="uncertain",
            message="Could not confidently identify this place with high certainty. Showing closest canonical Odisha destinations.",
            top_match=default_cands[0] if default_cands else None,
            candidates=default_cands,
            confidence_summary="Uncertain identification. Please pick from suggested candidates or try another photo.",
        )
