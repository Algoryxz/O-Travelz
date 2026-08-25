"""Authoritative Search, Knowledge Retrieval, and Geospatial Data-Access Service."""
from __future__ import annotations

import math
from typing import Any, List, Optional, Sequence, Tuple
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.core.regions import get_region_for_place
from app.data.multilingual_taxonomy import (
    resolve_category,
    resolve_district,
    resolve_interest,
)
from app.models.category import Category
from app.models.place import Place
from app.models.interest import Interest, PlaceInterest
from app.services.ranking.repository import NON_LEISURE_CATEGORIES
from app.services.search.search_models import (
    CompactKnowledgeRecord,
    ScoredPlaceCandidate,
    SearchQueryParams,
)
from app.services.search.search_normalizer import (
    extract_search_intent,
    get_alias_expansions,
    normalize_text,
)
from app.services.search.search_ranker import calculate_place_score, rank_candidates


def _haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two WGS84 coordinates in kilometers."""
    r = 6371.0  # Earth's radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def _extract_lat_lon(place: Any) -> Tuple[Optional[float], Optional[float]]:
    """Extract lat/lon coordinates from place model."""
    lat = getattr(place, "lat", None)
    lon = getattr(place, "lon", None)
    if lat is not None and lon is not None:
        return float(lat), float(lon)

    location = getattr(place, "location", None)
    if location is not None:
        try:
            from geoalchemy2.shape import to_shape
            point = to_shape(location)
            return float(point.y), float(point.x)
        except Exception:
            pass
        if hasattr(location, "y") and hasattr(location, "x"):
            return float(location.y), float(location.x)
    return None, None


def _extract_interests(place: Any) -> List[str]:
    """Extract list of interest names from place associations."""
    interests: List[str] = []
    for assoc in getattr(place, "interest_associations", []):
        interest_obj = getattr(assoc, "interest", None)
        if interest_obj and getattr(interest_obj, "name", None):
            interests.append(interest_obj.name)
    if not interests and hasattr(place, "interests") and isinstance(place.interests, list):
        return sorted(place.interests)
    return sorted(interests)


class SearchService:
    """Production search and structured retrieval service across whole-Odisha dataset."""

    @staticmethod
    def search_places(
        db: Session,
        params: SearchQueryParams,
    ) -> Tuple[List[ScoredPlaceCandidate], int]:
        """
        Execute deterministic search & retrieval with ranking, intent recognition,
        domain separation, and optional geospatial proximity.
        Returns (ranked_candidates_slice, total_matching_count).
        """
        # 1. Base Query with joinedload
        query = (
            db.query(Place, Category)
            .join(Category, Place.category_id == Category.id)
            .filter(
                or_(
                    Place.verified_at.isnot(None),
                    Place.verification_status.in_(["VERIFIED", "verified", "OFFICIAL", "COMMUNITY"]),
                    Place.coordinate_verification.isnot(None),
                    Place.location.isnot(None),
                )
            )
        )
        if hasattr(query, "options"):
            try:
                query = query.options(
                    joinedload(Place.interest_associations).joinedload(PlaceInterest.interest),
                    joinedload(Place.images),
                )
            except Exception:
                pass

        # 2. Pre-resolve localized filter parameters to canonical English
        resolved_param_district = (
            resolve_district(params.district.strip()) if params.district else None
        ) or (params.district.strip() if params.district else None)

        resolved_param_category = (
            resolve_category(params.category.strip()) if params.category else None
        ) or (params.category.strip() if params.category else None)

        resolved_param_interest = (
            resolve_interest(params.interest.strip()) if params.interest else None
        ) or (params.interest.strip() if params.interest else None)

        # Extract intent from search string
        raw_search = params.search.strip() if params.search else None
        cleaned_search, intent_dist, intent_cat, intent_int, intent_med, intent_transit = extract_search_intent(raw_search)

        effective_district = resolved_param_district if params.district else intent_dist
        effective_category = resolved_param_category if params.category else intent_cat
        effective_interest = resolved_param_interest if params.interest else intent_int

        # 3. Apply hard database filters if explicitly supplied
        if resolved_param_district:
            query = query.filter(Place.district.ilike(resolved_param_district))

        if resolved_param_category:
            query = query.filter(Category.name.ilike(resolved_param_category))

        if resolved_param_interest:
            interest_norm = resolved_param_interest.casefold()
            query = query.filter(
                Place.interest_associations.any(
                    PlaceInterest.interest.has(Interest.name.ilike(interest_norm))
                )
            )

        if params.verification_status:
            query = query.filter(Place.verification_status.ilike(params.verification_status.strip()))

        # 4. Fetch matching candidates from DB
        records = query.all()

        # 5. Domain separation and candidate scoring
        candidates: List[ScoredPlaceCandidate] = []
        alias_targets = get_alias_expansions(raw_search)

        for place, cat in records:
            cat_name = cat.name if cat else ""
            is_non_leisure = cat_name in NON_LEISURE_CATEGORIES
            is_med = cat_name in ("hospital", "emergency_facility")
            is_trans = cat_name == "transit_hub"

            # Domain separation rule:
            # If is_medical is explicitly True -> only medical
            if params.is_medical is True and not is_med:
                continue
            # If is_transit is explicitly True -> only transit
            if params.is_transit is True and not is_trans:
                continue

            # If no explicit non-leisure flag was given and this is a general query without medical/transit intent:
            if params.is_medical is None and params.is_transit is None and not params.category:
                if is_non_leisure:
                    # Only include non-leisure if search explicitly matched medical/transit intent or alias
                    if is_med and not intent_med:
                        continue
                    if is_trans and not intent_transit and not alias_targets:
                        continue

            # Region filter (if provided)
            place_region = get_region_for_place(place.district, place.research_id or str(place.id))
            if params.region and params.region.strip().casefold() != "all regions".casefold():
                if place_region.casefold() != params.region.strip().casefold():
                    continue

            # Calculate proximity distance if reference coords provided
            p_lat, p_lon = _extract_lat_lon(place)
            distance_km = None
            if params.near_lat is not None and params.near_lon is not None and p_lat is not None and p_lon is not None:
                distance_km = _haversine_distance_km(params.near_lat, params.near_lon, p_lat, p_lon)
                if params.radius_km is not None and distance_km > params.radius_km:
                    continue

            # Calculate relevance score
            score, reasons = calculate_place_score(
                place=place,
                category_name=cat_name,
                query_text=raw_search,
                filter_district=effective_district,
                filter_category=effective_category,
                filter_interest=effective_interest,
                alias_targets=alias_targets,
            )

            # Proximity score bonus (closer places get a boost when near coordinates are given)
            if distance_km is not None:
                proximity_boost = max(0.0, 30.0 - (distance_km * 0.3))
                score += proximity_boost
                reasons.append(f"proximity({distance_km:.1f}km)")

            # If user entered a search query, filter out items with zero match score
            if raw_search and score <= 0.0:
                continue

            candidates.append(
                ScoredPlaceCandidate(
                    place=place,
                    category_name=cat_name,
                    score=score,
                    distance_km=distance_km,
                    match_reasons=reasons,
                )
            )

        # 6. Rank candidates deterministically
        is_prox_search = (params.near_lat is not None and params.near_lon is not None and not raw_search)
        ranked = rank_candidates(candidates, is_proximity_search=is_prox_search)
        total_count = len(ranked)

        # 7. Apply pagination
        paginated = ranked[params.offset : params.offset + params.limit]
        return paginated, total_count

    # --------------------------------------------------------------------------
    # Structured AI Knowledge Retrieval Interface
    # --------------------------------------------------------------------------

    @classmethod
    def to_compact_record(cls, place: Any, cat_name: str, distance_km: Optional[float] = None) -> CompactKnowledgeRecord:
        """Convert a place database model to a compact AI-ready knowledge record."""
        p_lat, p_lon = _extract_lat_lon(place)
        is_med = cat_name in ("hospital", "emergency_facility")
        is_trans = cat_name == "transit_hub"
        region = get_region_for_place(place.district, place.research_id or str(place.id))

        return CompactKnowledgeRecord(
            id=str(place.id),
            name=place.name,
            district=place.district or "Unknown",
            region=region,
            category=cat_name,
            description=place.description,
            interests=_extract_interests(place),
            lat=p_lat,
            lon=p_lon,
            address=getattr(place, "address", None),
            verification_status=getattr(place, "verification_status", None),
            source=place.source,
            is_medical=is_med,
            is_transit=is_trans,
            contact_phone=getattr(place, "contact_phone", None),
            emergency_phone=getattr(place, "emergency_phone", None),
            distance_km=round(distance_km, 2) if distance_km is not None else None,
        )

    @classmethod
    def retrieve_places(
        cls,
        db: Session,
        query: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
        interest: Optional[str] = None,
        is_medical: Optional[bool] = None,
        is_transit: Optional[bool] = None,
        near_lat: Optional[float] = None,
        near_lon: Optional[float] = None,
        radius_km: Optional[float] = None,
        limit: int = 10,
    ) -> List[CompactKnowledgeRecord]:
        """AI Retrieval Abstraction: retrieve top matching places."""
        params = SearchQueryParams(
            search=query,
            district=district,
            category=category,
            interest=interest,
            is_medical=is_medical,
            is_transit=is_transit,
            near_lat=near_lat,
            near_lon=near_lon,
            radius_km=radius_km,
            limit=limit,
        )
        candidates, _ = cls.search_places(db, params)
        return [cls.to_compact_record(c.place, c.category_name, c.distance_km) for c in candidates]


    @classmethod
    def retrieve_by_district(
        cls,
        db: Session,
        district: str,
        limit: int = 20,
    ) -> List[CompactKnowledgeRecord]:
        """AI Retrieval Abstraction: retrieve places in a specific Odisha district."""
        params = SearchQueryParams(district=district, limit=limit)
        candidates, _ = cls.search_places(db, params)
        return [cls.to_compact_record(c.place, c.category_name, c.distance_km) for c in candidates]

    @classmethod
    def retrieve_by_category(
        cls,
        db: Session,
        category: str,
        district: Optional[str] = None,
        limit: int = 20,
    ) -> List[CompactKnowledgeRecord]:
        """AI Retrieval Abstraction: retrieve places in a category."""
        params = SearchQueryParams(category=category, district=district, limit=limit)
        candidates, _ = cls.search_places(db, params)
        return [cls.to_compact_record(c.place, c.category_name, c.distance_km) for c in candidates]

    @classmethod
    def retrieve_by_interest(
        cls,
        db: Session,
        interest: str,
        district: Optional[str] = None,
        limit: int = 20,
    ) -> List[CompactKnowledgeRecord]:
        """AI Retrieval Abstraction: retrieve places matching a traveler interest."""
        params = SearchQueryParams(interest=interest, district=district, limit=limit)
        candidates, _ = cls.search_places(db, params)
        return [cls.to_compact_record(c.place, c.category_name, c.distance_km) for c in candidates]

    @classmethod
    def retrieve_medical(
        cls,
        db: Session,
        district: Optional[str] = None,
        limit: int = 15,
    ) -> List[CompactKnowledgeRecord]:
        """AI Retrieval Abstraction: retrieve medical & emergency facilities."""
        params = SearchQueryParams(is_medical=True, district=district, limit=limit)
        candidates, _ = cls.search_places(db, params)
        return [cls.to_compact_record(c.place, c.category_name, c.distance_km) for c in candidates]

    @classmethod
    def retrieve_transit(
        cls,
        db: Session,
        district: Optional[str] = None,
        limit: int = 15,
    ) -> List[CompactKnowledgeRecord]:
        """AI Retrieval Abstraction: retrieve transit hubs (airports, stations, ISBTs)."""
        params = SearchQueryParams(is_transit=True, district=district, limit=limit)
        candidates, _ = cls.search_places(db, params)
        return [cls.to_compact_record(c.place, c.category_name, c.distance_km) for c in candidates]

    @classmethod
    def retrieve_near_location(
        cls,
        db: Session,
        lat: float,
        lon: float,
        radius_km: float = 25.0,
        limit: int = 10,
    ) -> List[CompactKnowledgeRecord]:
        """AI Retrieval Abstraction: retrieve places near a given coordinate."""
        params = SearchQueryParams(near_lat=lat, near_lon=lon, radius_km=radius_km, limit=limit)
        candidates, _ = cls.search_places(db, params)
        return [cls.to_compact_record(c.place, c.category_name, c.distance_km) for c in candidates]
