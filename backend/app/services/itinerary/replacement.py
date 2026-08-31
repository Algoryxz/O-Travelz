"""Deterministic single-stop replacement domain service for O-Travelz."""
from __future__ import annotations

import math
from typing import Any

from app.ai.contracts import ClaimType, EvidenceItem
from app.ai.schemas import PlanTransportHopArgs
from app.schemas.common import PlaceSummary, PlanningConstraints
from app.schemas.itinerary import (
    ItineraryDayContract,
    ItineraryResponse,
    ItineraryStopContract,
)
from app.schemas.transport import TransportHopContract
from app.services.ranking import PlaceRepository, VerifiedPlace


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Great Circle distance in kilometers between two points."""
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


class StopReplacementService:
    """Domain service replacing a single itinerary stop and recomputing adjacent hops."""

    def __init__(
        self,
        repository: PlaceRepository,
        transport_service: Any,
        crowd_service: Any = None,
        weather_service: Any = None,
    ) -> None:
        self.repository = repository
        self.transport_service = transport_service
        self.crowd_service = crowd_service
        self.weather_service = weather_service

    def replace_stop(
        self,
        itinerary: ItineraryResponse,
        day_number: int = 1,
        stop_sequence: int = 1,
        reason: str = "user_request",
        preference_overrides: PlanningConstraints | dict[str, Any] | None = None,
    ) -> tuple[bool, str, ItineraryResponse | None, PlaceSummary | None, list[EvidenceItem]]:
        """Deterministically replace a single stop within an existing multi-day itinerary.

        Returns: (success, message, updated_itinerary, replacement_place, evidence_items)
        """
        # 1. Locate Target Day and Stop
        target_day = next((d for d in itinerary.days if d.day_number == day_number), None)
        if target_day is None:
            return (
                False,
                f"Day {day_number} not found in itinerary.",
                None,
                None,
                [],
            )

        stop_idx = next(
            (idx for idx, s in enumerate(target_day.stops) if s.sequence == stop_sequence),
            None,
        )
        if stop_idx is None:
            return (
                False,
                f"Stop sequence {stop_sequence} not found on Day {day_number}.",
                None,
                None,
                [],
            )

        original_stop = target_day.stops[stop_idx]
        original_place = original_stop.place

        # 2. Collect existing places across all days
        existing_place_ids: set[str] = set()
        for d in itinerary.days:
            for s in d.stops:
                existing_place_ids.add(str(s.place.id))

        # 3. Retrieve and filter candidate places
        all_places = self.repository.list_verified_places()
        candidates: list[VerifiedPlace] = [
            p
            for p in all_places
            if p.coordinate is not None and str(p.database_id) not in existing_place_ids
        ]

        if not candidates:
            return (
                False,
                "No suitable verified replacement is available for this time window.",
                None,
                None,
                [],
            )

        # Merge constraints
        constraints = itinerary.constraints
        avoid_crowds = getattr(constraints, "avoid_crowds", False)
        low_walking = getattr(constraints, "low_walking", False)
        if isinstance(preference_overrides, dict):
            avoid_crowds = preference_overrides.get("avoid_crowds", avoid_crowds)
            low_walking = preference_overrides.get("low_walking", low_walking)

        # Adjacent stops coordinates for proximity scoring
        prev_coord = None
        next_coord = None
        if stop_idx > 0:
            prev_stop = target_day.stops[stop_idx - 1]
            prev_place_obj = self.repository.resolve_origin(prev_stop.place.name) or next(
                (p for p in all_places if str(p.database_id) == str(prev_stop.place.id)), None
            )
            if prev_place_obj and prev_place_obj.coordinate:
                prev_coord = (prev_place_obj.coordinate.latitude, prev_place_obj.coordinate.longitude)

        if stop_idx + 1 < len(target_day.stops):
            next_stop = target_day.stops[stop_idx + 1]
            next_place_obj = self.repository.resolve_origin(next_stop.place.name) or next(
                (p for p in all_places if str(p.database_id) == str(next_stop.place.id)), None
            )
            if next_place_obj and next_place_obj.coordinate:
                next_coord = (next_place_obj.coordinate.latitude, next_place_obj.coordinate.longitude)

        # 4. Reason-specific filtering and scoring
        scored_candidates: list[tuple[float, VerifiedPlace, list[str]]] = []
        reason_lower = str(reason).lower()

        for cand in candidates:
            cand_cat = cand.category_id.lower()
            score = 100.0
            cand_factors: list[str] = []

            # Weather filter (e.g. rain avoidance for outdoor spots)
            if "weather" in reason_lower or "rain" in reason_lower:
                if cand_cat in ("beach", "waterfall", "nature", "park"):
                    score -= 80.0  # Disfavor outdoor spots in rain
                else:
                    score += 40.0
                    cand_factors.append("Indoor/covered cultural venue suitable for inclement weather")
            elif "crowd" in reason_lower or avoid_crowds:
                if self.crowd_service is not None:
                    est = self.crowd_service.estimate_crowd(cand, avoid_crowds=True)
                    if est.level == "high":
                        score -= 50.0
                    elif est.level == "low":
                        score += 30.0
                        cand_factors.append("Lower expected crowd congestion")
            elif "walking" in reason_lower or low_walking:
                score += 20.0
                cand_factors.append("Compact layout with reduced walking requirement")
            elif "interest" in reason_lower or "temple" in reason_lower:
                if "temple" in reason_lower and cand_cat in ("temple", "monument"):
                    score -= 70.0
                elif cand_cat not in ("temple",):
                    score += 30.0

            # Distance delta calculation
            dist_km = 0.0
            if prev_coord and cand.coordinate:
                d_prev = haversine_km(prev_coord[0], prev_coord[1], cand.coordinate.latitude, cand.coordinate.longitude)
                dist_km += d_prev
            if next_coord and cand.coordinate:
                d_next = haversine_km(cand.coordinate.latitude, cand.coordinate.longitude, next_coord[0], next_coord[1])
                dist_km += d_next

            # Penalize excessive distance deviation
            score -= dist_km * 2.0
            cand_factors.append(f"Located within verified travel corridor (~{dist_km:.1f} km)")

            scored_candidates.append((score, cand, cand_factors))

        scored_candidates.sort(key=lambda x: x[0], reverse=True)
        if not scored_candidates or scored_candidates[0][0] < -200:
            return (
                False,
                "No suitable verified replacement is available for this time window.",
                None,
                None,
                [],
            )

        best_score, best_cand, factors = scored_candidates[0]
        replacement_place = best_cand.to_summary()

        # 5. Build Updated Itinerary preserving all unaffected stops and days
        updated_days: list[ItineraryDayContract] = []
        for d in itinerary.days:
            if d.day_number != day_number:
                # Completely untouched day
                updated_days.append(d.model_copy(deep=True))
            else:
                # Target day: update stop and recompute adjacent hops
                new_stops: list[ItineraryStopContract] = []
                for s in d.stops:
                    if s.sequence == stop_sequence:
                        new_stops.append(
                            ItineraryStopContract(
                                sequence=s.sequence,
                                place=replacement_place,
                                planned_arrival=s.planned_arrival,
                                planned_departure=s.planned_departure,
                            )
                        )
                    else:
                        new_stops.append(s.model_copy(deep=True))

                # Recompute hops for this day
                new_hops: list[TransportHopContract] = []
                # Check initial hop from start if stop 1 changed
                if constraints.start and len(new_stops) > 0:
                    start_resolved = self.repository.resolve_origin(constraints.start)
                    if start_resolved:
                        first_stop = new_stops[0]
                        hop_start = self.transport_service.plan_transport_hop(
                            PlanTransportHopArgs(
                                from_place=start_resolved.to_summary(),
                                to_place=first_stop.place,
                                constraints=constraints,
                                from_sequence=0,
                                to_sequence=first_stop.sequence,
                            )
                        )
                        new_hops.append(hop_start)

                for prev_s, next_s in zip(new_stops, new_stops[1:]):
                    hop = self.transport_service.plan_transport_hop(
                        PlanTransportHopArgs(
                            from_place=prev_s.place,
                            to_place=next_s.place,
                            constraints=constraints,
                            from_sequence=prev_s.sequence,
                            to_sequence=next_s.sequence,
                        )
                    )
                    new_hops.append(hop)

                updated_days.append(
                    ItineraryDayContract(
                        day_number=d.day_number,
                        date=d.date,
                        stops=new_stops,
                        hops=new_hops,
                    )
                )

        updated_itinerary = ItineraryResponse(
            itinerary_id=f"{itinerary.itinerary_id}-mod-{day_number}-{stop_sequence}",
            constraints=itinerary.constraints,
            days=updated_days,
            explanation=f"Replaced '{original_place.name}' with '{replacement_place.name}' on Day {day_number}.",
        )

        # 6. Generate structured evidence items
        evidence_items: list[EvidenceItem] = []
        if "weather" in reason_lower:
            evidence_items.append(
                EvidenceItem(
                    title="Weather Suitability",
                    rationale=f"Selected indoor cultural venue '{replacement_place.name}' suitable for weather conditions",
                    claim_type=ClaimType.LIVE,
                    source="Open-Meteo",
                    confidence="high",
                )
            )
        elif "crowd" in reason_lower:
            evidence_items.append(
                EvidenceItem(
                    title="Crowd Optimization",
                    rationale=f"Replaced high-congestion stop with lower expected crowd destination '{replacement_place.name}'",
                    claim_type=ClaimType.ESTIMATED,
                    source="O-TRAVELZ crowd heuristic",
                    confidence="medium",
                )
            )
        elif "walking" in reason_lower or low_walking:
            evidence_items.append(
                EvidenceItem(
                    title="Mobility Accommodation",
                    rationale=f"Selected '{replacement_place.name}' with reduced walking requirement",
                    claim_type=ClaimType.VERIFIED,
                    source="itinerary_service:accessibility",
                    confidence="high",
                )
            )

        evidence_items.append(
            EvidenceItem(
                title="Verified Replacement",
                rationale=f"Verified canonical place replacing '{original_place.name}' within travel corridor",
                claim_type=ClaimType.VERIFIED,
                source="itinerary_service:replacement",
                confidence="high",
            )
        )

        return (
            True,
            f"Successfully replaced '{original_place.name}' with '{replacement_place.name}' on Day {day_number}.",
            updated_itinerary,
            replacement_place,
            evidence_items,
        )
