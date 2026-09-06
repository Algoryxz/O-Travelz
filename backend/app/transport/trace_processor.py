"""
Wave C5.4 Deterministic Rider Trace Cleaner, Map Matcher, and Stop Association Engine.

Strictly deterministic, pure-Python logic enforcing O-TRAVELZ truth and privacy boundaries.
No LLMs, no external daemons.
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from app.transport.geometry_engine import (
    REGION_BOUNDS,
    DEFAULT_ODISHA_BOUNDS,
    is_coordinate_in_region,
)

# Constants for trace gating
MAX_PERMISSIBLE_SPEED_MPS = 33.3  # 120 km/h
MAX_PASSIVE_STOP_SPEED_MPS = 1.5   # 5.4 km/h (walking/stationary)
MIN_STOP_DURATION_SECONDS = 20.0   # minimum stationary duration to qualify as pause
MAX_ACCEPTABLE_ACCURACY_M = 40.0   # filter out degraded GPS
ROUTE_TOLERANCE_DISTANCE_M = 150.0 # distance to route line to consider 'on-route'
STOP_MATCH_RADIUS_M = 120.0        # radius to associate observation with canonical stop


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance in meters between two points."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def min_distance_to_polyline_m(pt: Tuple[float, float], polyline: List[Tuple[float, float]]) -> Tuple[float, int]:
    """Find distance in meters to the closest segment vertex on a polyline, and its index."""
    if not polyline:
        return float("inf"), -1
    min_d = float("inf")
    closest_idx = -1
    for idx, vertex in enumerate(polyline):
        d = haversine_m(pt[0], pt[1], vertex[0], vertex[1])
        if d < min_d:
            min_d = d
            closest_idx = idx
    return min_d, closest_idx


class DeterministicTraceCleaner:
    """Cleans and validates high-frequency rider GPS samples."""

    @staticmethod
    def clean_samples(
        samples: List[Dict[str, Any]],
        region: Optional[str] = None,
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Takes raw GPS samples and performs:
        1. Chronological sorting
        2. Duplicate timestamp removal
        3. Accuracy filtering (accuracy > 40m filtered)
        4. Regional bounds verification
        5. Impossible-jump rejection (speed > 120 km/h)

        Returns (clean_samples, filtered_samples).
        """
        if not samples:
            return [], []

        # 1. Sort chronologically
        sorted_samples = sorted(
            samples,
            key=lambda s: s["timestamp"] if isinstance(s["timestamp"], datetime) else datetime.fromisoformat(str(s["timestamp"])),
        )

        clean: List[Dict[str, Any]] = []
        filtered: List[Dict[str, Any]] = []
        seen_timestamps = set()

        for s in sorted_samples:
            ts = s["timestamp"]
            ts_key = ts.isoformat() if isinstance(ts, datetime) else str(ts)

            # 2. Duplicate timestamp
            if ts_key in seen_timestamps:
                s_copy = dict(s)
                s_copy["is_filtered"] = True
                s_copy["filter_reason"] = "DUPLICATE_TIMESTAMP"
                filtered.append(s_copy)
                continue
            seen_timestamps.add(ts_key)

            lat = float(s["latitude"])
            lon = float(s["longitude"])
            acc = float(s.get("accuracy_m", 10.0))

            # 3. Accuracy filtering
            if acc > MAX_ACCEPTABLE_ACCURACY_M:
                s_copy = dict(s)
                s_copy["is_filtered"] = True
                s_copy["filter_reason"] = "POOR_ACCURACY"
                filtered.append(s_copy)
                continue

            # 4. Regional bounding box check
            if not is_coordinate_in_region(lat, lon, region):
                s_copy = dict(s)
                s_copy["is_filtered"] = True
                s_copy["filter_reason"] = "OUT_OF_REGION_BOUNDS"
                filtered.append(s_copy)
                continue

            # 5. Impossible jump check against last clean point
            if clean:
                last = clean[-1]
                last_ts = last["timestamp"] if isinstance(last["timestamp"], datetime) else datetime.fromisoformat(str(last["timestamp"]))
                curr_ts = ts if isinstance(ts, datetime) else datetime.fromisoformat(str(ts))
                dt = (curr_ts - last_ts).total_seconds()
                if dt > 0:
                    dist = haversine_m(last["latitude"], last["longitude"], lat, lon)
                    calculated_speed = dist / dt
                    if calculated_speed > MAX_PERMISSIBLE_SPEED_MPS:
                        s_copy = dict(s)
                        s_copy["is_filtered"] = True
                        s_copy["filter_reason"] = f"IMPOSSIBLE_JUMP_{int(calculated_speed*3.6)}KMH"
                        filtered.append(s_copy)
                        continue

            s_copy = dict(s)
            s_copy["is_filtered"] = False
            s_copy["filter_reason"] = None
            clean.append(s_copy)

        return clean, filtered


class MapMatchingEngine:
    """Matches cleaned ride traces against canonical / C5.3 route geometries."""

    @staticmethod
    def match_trace_to_route(
        clean_samples: List[Dict[str, Any]],
        route_coordinates: List[Tuple[float, float]],
        route_number: str,
    ) -> Dict[str, Any]:
        """
        Evaluates adherence of a ride trace to the route geometry.
        Returns match metrics and determines whether the trace is valid or QUARANTINED.
        """
        if not clean_samples or not route_coordinates:
            return {
                "is_matched": False,
                "status": "QUARANTINED",
                "quarantine_reason": "Insufficient samples or missing route geometry",
                "sample_count": len(clean_samples),
                "alignment_rate_pct": 0.0,
                "median_distance_m": float("inf"),
            }

        distances: List[float] = []
        projected_indices: List[int] = []

        for s in clean_samples:
            d, idx = min_distance_to_polyline_m((s["latitude"], s["longitude"]), route_coordinates)
            distances.append(d)
            projected_indices.append(idx)

        within_tolerance = sum(1 for d in distances if d <= ROUTE_TOLERANCE_DISTANCE_M)
        alignment_rate = round(within_tolerance / len(distances) * 100.0, 1)
        sorted_d = sorted(distances)
        median_d = round(sorted_d[len(sorted_d) // 2], 1)
        max_d = round(max(sorted_d), 1)

        # Monotonic sequence progression check (detect excessive backtracking / reverse travel)
        monotonic_violations = 0
        for i in range(len(projected_indices) - 1):
            # Jumping backwards by more than 10 vertices
            if projected_indices[i + 1] < projected_indices[i] - 10:
                monotonic_violations += 1

        backtracking_rate = round(monotonic_violations / max(1, len(projected_indices) - 1) * 100.0, 1)

        # Gating rules for quarantine:
        # Trace must have at least 50% samples within 150m of route line, or median distance < 200m
        is_quarantined = False
        quarantine_reason = None

        if alignment_rate < 50.0 and median_d > 200.0:
            is_quarantined = True
            quarantine_reason = f"Trace diverged from route {route_number}: only {alignment_rate}% samples within {ROUTE_TOLERANCE_DISTANCE_M}m (median dist {median_d}m)."
        elif backtracking_rate > 40.0:
            is_quarantined = True
            quarantine_reason = f"Trace exhibits extreme backtracking ({backtracking_rate}% reversal violations)."

        return {
            "is_matched": not is_quarantined,
            "status": "QUARANTINED" if is_quarantined else "COMPLETED",
            "quarantine_reason": quarantine_reason,
            "sample_count": len(clean_samples),
            "alignment_rate_pct": alignment_rate,
            "median_distance_m": median_d,
            "max_distance_m": max_d,
            "backtracking_rate_pct": backtracking_rate,
        }


class StopEventDetector:
    """Detects bus stop events from passive GPS clusters and explicit rider taps."""

    @staticmethod
    def detect_passive_pauses(clean_samples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identifies sustained stationary pauses (bus stopped at a station/signal)."""
        if len(clean_samples) < 5:
            return []

        pause_clusters: List[Dict[str, Any]] = []
        current_cluster: List[Dict[str, Any]] = []

        for s in clean_samples:
            speed = s.get("speed_mps")
            # If speed is not reported, estimate from displacement if cluster has points
            is_stationary = False
            if speed is not None:
                is_stationary = speed <= MAX_PASSIVE_STOP_SPEED_MPS
            elif current_cluster:
                last_pt = current_cluster[-1]
                dist = haversine_m(last_pt["latitude"], last_pt["longitude"], s["latitude"], s["longitude"])
                is_stationary = dist <= 10.0
            else:
                is_stationary = True

            if is_stationary:
                current_cluster.append(s)
            else:
                if len(current_cluster) >= 3:
                    t_start = current_cluster[0]["timestamp"] if isinstance(current_cluster[0]["timestamp"], datetime) else datetime.fromisoformat(str(current_cluster[0]["timestamp"]))
                    t_end = current_cluster[-1]["timestamp"] if isinstance(current_cluster[-1]["timestamp"], datetime) else datetime.fromisoformat(str(current_cluster[-1]["timestamp"]))
                    dur = (t_end - t_start).total_seconds()
                    if dur >= MIN_STOP_DURATION_SECONDS:
                        c_lat = sum(p["latitude"] for p in current_cluster) / len(current_cluster)
                        c_lon = sum(p["longitude"] for p in current_cluster) / len(current_cluster)
                        pause_clusters.append({
                            "observation_type": "BUS_STOPPED",
                            "latitude": round(c_lat, 6),
                            "longitude": round(c_lon, 6),
                            "accuracy_m": round(sum(p.get("accuracy_m", 10.0) for p in current_cluster) / len(current_cluster), 1),
                            "observed_at": t_start,
                            "duration_seconds": round(dur, 1),
                            "sample_count": len(current_cluster),
                        })
                current_cluster = [s] if is_stationary else []

        # Check tail cluster
        if len(current_cluster) >= 3:
            t_start = current_cluster[0]["timestamp"] if isinstance(current_cluster[0]["timestamp"], datetime) else datetime.fromisoformat(str(current_cluster[0]["timestamp"]))
            t_end = current_cluster[-1]["timestamp"] if isinstance(current_cluster[-1]["timestamp"], datetime) else datetime.fromisoformat(str(current_cluster[-1]["timestamp"]))
            dur = (t_end - t_start).total_seconds()
            if dur >= MIN_STOP_DURATION_SECONDS:
                c_lat = sum(p["latitude"] for p in current_cluster) / len(current_cluster)
                c_lon = sum(p["longitude"] for p in current_cluster) / len(current_cluster)
                pause_clusters.append({
                    "observation_type": "BUS_STOPPED",
                    "latitude": round(c_lat, 6),
                    "longitude": round(c_lon, 6),
                    "accuracy_m": round(sum(p.get("accuracy_m", 10.0) for p in current_cluster) / len(current_cluster), 1),
                    "observed_at": t_start,
                    "duration_seconds": round(dur, 1),
                    "sample_count": len(current_cluster),
                })

        return pause_clusters


class StopAssociationEngine:
    """Associates field observations with canonical stops and candidate locations."""

    @staticmethod
    def associate_observation(
        obs_lat: float,
        obs_lon: float,
        route_stops: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Matches a point observation against the route's stop list.
        Determines:
        - canonical_stop_id
        - stop_association_status
        """
        closest_stop = None
        min_dist = float("inf")

        for s in route_stops:
            s_lat = s.get("latitude")
            s_lon = s.get("longitude")
            if s_lat is not None and s_lon is not None:
                d = haversine_m(obs_lat, obs_lon, float(s_lat), float(s_lon))
                if d < min_dist:
                    min_dist = d
                    closest_stop = s

        if not closest_stop or min_dist > STOP_MATCH_RADIUS_M:
            return {
                "canonical_stop_id": None,
                "distance_to_matched_m": round(min_dist, 1) if closest_stop else None,
                "association_status": "NEW_LOCATION_HYPOTHESIS",
            }

        stop_res = closest_stop.get("stop_resolution_status", "")
        if "VERIFIED" in stop_res and min_dist <= 50.0:
            status = "CONFIRMS_EXISTING_EXACT"
        elif "CANDIDATE" in stop_res:
            status = "SUPPORTS_CANDIDATE"
        elif min_dist <= 80.0:
            status = "SUPPORTS_CANDIDATE"
        else:
            status = "AMBIGUOUS_STOP_ASSOCIATION"

        return {
            "canonical_stop_id": closest_stop.get("canonical_stop_id") or closest_stop.get("stop_id"),
            "stop_name": closest_stop.get("name"),
            "distance_to_matched_m": round(min_dist, 1),
            "association_status": status,
        }


class ConsensusEngine:
    """Aggregates stop observations across independent sessions and evaluates promotion readiness."""

    @staticmethod
    def evaluate_stop_observations(
        observations: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Evaluates a cluster of observations for a stop.
        Enforces:
        - Multi-session independence: multiple points from 1 session count as ONE vote.
        - Distinct contributor check.
        - Spatial dispersion (radius around centroid <= 50m).
        - Test fixture exclusion: if any observation is marked test fixture, it NEVER enters promotion.
        """
        if not observations:
            return {
                "consensus_status": "UNOBSERVED",
                "independent_session_count": 0,
                "contributor_count": 0,
                "dispersion_radius_m": 0.0,
                "is_review_ready": False,
            }

        # Filter out test fixtures if evaluating real production status
        has_test_fixtures = any(o.get("is_test_fixture", False) for o in observations)

        # Count unique sessions and contributors
        unique_sessions = set(o["session_id"] for o in observations if o.get("session_id"))
        unique_contributors = set(o["contributor_hash"] for o in observations if o.get("contributor_hash"))

        # Calculate centroid of coordinates
        coords = [(o["latitude"], o["longitude"]) for o in observations if o.get("latitude") is not None and o.get("longitude") is not None]
        if not coords:
            return {
                "consensus_status": "OBSERVED_ONCE",
                "independent_session_count": len(unique_sessions),
                "contributor_count": len(unique_contributors),
                "dispersion_radius_m": 0.0,
                "is_review_ready": False,
            }

        c_lat = sum(c[0] for c in coords) / len(coords)
        c_lon = sum(c[1] for c in coords) / len(coords)

        # Max dispersion from centroid
        dispersion_m = max(haversine_m(c_lat, c_lon, c[0], c[1]) for c in coords)

        # Consensus ladder
        # >= 3 independent sessions AND >= 2 contributors AND dispersion <= 50m
        is_review_ready = (
            len(unique_sessions) >= 3
            and len(unique_contributors) >= 2
            and dispersion_m <= 50.0
            and not has_test_fixtures
        )

        if is_review_ready:
            consensus_status = "PROMOTION_REVIEW_READY"
        elif len(unique_sessions) >= 2 or len(observations) >= 2:
            consensus_status = "COMMUNITY_SUPPORTED"
        else:
            consensus_status = "OBSERVED_ONCE"

        return {
            "consensus_status": consensus_status,
            "centroid_latitude": round(c_lat, 6),
            "centroid_longitude": round(c_lon, 6),
            "independent_session_count": len(unique_sessions),
            "contributor_count": len(unique_contributors),
            "total_observations_count": len(observations),
            "dispersion_radius_m": round(dispersion_m, 1),
            "is_review_ready": is_review_ready,
            "has_test_fixtures": has_test_fixtures,
        }
