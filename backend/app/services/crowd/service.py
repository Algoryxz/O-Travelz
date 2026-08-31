"""Deterministic crowd intelligence service for O-Travelz."""
from __future__ import annotations

import json
import logging
from datetime import datetime, time
from pathlib import Path
from typing import Any

from app.services.crowd.models import CrowdConfidence, CrowdEstimate, CrowdLevel, RecommendedWindow

logger = logging.getLogger(__name__)

# Category heuristic priors (start_time, end_time, weekday_level, weekend_level)
CATEGORY_PRIORS: dict[str, list[tuple[time, time, CrowdLevel, CrowdLevel]]] = {
    "temple": [
        (time(6, 0), time(9, 0), "low", "moderate"),
        (time(9, 0), time(14, 30), "moderate", "high"),
        (time(14, 30), time(16, 30), "low", "moderate"),
        (time(16, 30), time(20, 30), "moderate", "high"),
    ],
    "heritage": [
        (time(6, 0), time(9, 30), "low", "moderate"),
        (time(9, 30), time(14, 30), "moderate", "high"),
        (time(14, 30), time(17, 0), "moderate", "moderate"),
        (time(17, 0), time(19, 30), "low", "moderate"),
    ],
    "monument": [
        (time(6, 0), time(9, 30), "low", "moderate"),
        (time(9, 30), time(14, 30), "moderate", "high"),
        (time(14, 30), time(17, 30), "moderate", "moderate"),
    ],
    "beach": [
        (time(5, 30), time(8, 30), "moderate", "moderate"),
        (time(8, 30), time(15, 30), "low", "low"),  # Midday heat avoidance
        (time(15, 30), time(19, 30), "moderate", "high"),  # Sunset peak
    ],
    "museum": [
        (time(10, 0), time(12, 0), "low", "moderate"),
        (time(12, 0), time(15, 30), "moderate", "high"),
        (time(15, 30), time(17, 30), "low", "moderate"),
    ],
    "nature": [
        (time(6, 30), time(10, 30), "low", "moderate"),
        (time(10, 30), time(15, 0), "moderate", "high"),
        (time(15, 0), time(17, 30), "low", "moderate"),
    ],
    "waterfall": [
        (time(7, 0), time(11, 0), "low", "moderate"),
        (time(11, 0), time(15, 30), "moderate", "high"),
        (time(15, 30), time(17, 30), "low", "moderate"),
    ],
    "wildlife": [
        (time(6, 0), time(9, 30), "moderate", "high"),  # Safari morning prime
        (time(9, 30), time(14, 30), "low", "low"),
        (time(14, 30), time(17, 30), "moderate", "high"),
    ],
    "market": [
        (time(8, 0), time(12, 0), "moderate", "moderate"),
        (time(12, 0), time(16, 0), "low", "low"),
        (time(16, 0), time(21, 30), "high", "high"),
    ],
}

DEFAULT_CATEGORY_WINDOWS: dict[str, tuple[str, str]] = {
    "temple": ("06:30", "08:30"),
    "heritage": ("07:00", "09:00"),
    "monument": ("07:00", "09:00"),
    "beach": ("06:00", "08:00"),
    "museum": ("10:00", "11:30"),
    "nature": ("07:30", "10:00"),
    "waterfall": ("07:30", "10:00"),
    "wildlife": ("06:30", "08:30"),
    "market": ("09:00", "11:00"),
    "other": ("08:00", "10:00"),
}


class CrowdService:
    """Deterministic domain service computing auditable crowd heuristics."""

    def __init__(self, peak_windows_path: Path | str | None = None) -> None:
        self.peak_windows = self._load_peak_windows(peak_windows_path)

    def _load_peak_windows(self, path: Path | str | None) -> dict[str, list[dict[str, Any]]]:
        target_path = Path(path) if path else Path(__file__).parents[4] / "data" / "crowd" / "peak_windows.json"
        if not target_path.exists():
            return {}
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {p["place_id"]: p.get("peak_windows", []) for p in data.get("places", [])}
        except Exception as exc:
            logger.warning(f"Could not load peak crowd windows: {exc}")
            return {}

    def estimate_crowd(
        self,
        place: Any,
        arrival_datetime: datetime | str | None = None,
        avoid_crowds: bool = False,
        weather_context: dict[str, Any] | None = None,
    ) -> CrowdEstimate:
        """Estimate crowd level deterministically based on category priors, operating hours, day, and time."""
        if place is None:
            return CrowdEstimate(
                level="unknown",
                confidence="low",
                recommended_window=None,
                factors=["Place information is missing or unresolved."],
            )

        # Extract place attributes
        place_id = getattr(place, "id", None) or (place.get("id") if isinstance(place, dict) else str(place))
        category = getattr(place, "category_id", None) or getattr(place, "category", None) or (place.get("category") if isinstance(place, dict) else "heritage")
        category_clean = str(category).lower().strip() if category else "other"
        place_name = getattr(place, "name", None) or (place.get("name") if isinstance(place, dict) else str(place))

        # Check if place is known in catalog/mock DB
        if not place_id and not category:
            return CrowdEstimate(
                level="unknown",
                confidence="low",
                recommended_window=None,
                factors=["Unverified or unknown place reference."],
            )

        # Parse arrival datetime
        dt: datetime
        if isinstance(arrival_datetime, datetime):
            dt = arrival_datetime
        elif isinstance(arrival_datetime, str):
            try:
                # Try ISO format or parse time
                if "T" in arrival_datetime or "-" in arrival_datetime:
                    dt = datetime.fromisoformat(arrival_datetime.replace("Z", "+00:00"))
                else:
                    parts = arrival_datetime.strip().split(":")
                    dt = datetime.now().replace(hour=int(parts[0]), minute=int(parts[1]) if len(parts) > 1 else 0)
            except Exception:
                dt = datetime.now().replace(hour=12, minute=0)
        else:
            # Default to midday
            dt = datetime.now().replace(hour=12, minute=0)

        is_weekend = dt.weekday() in (5, 6)  # Saturday or Sunday
        arr_time = dt.time()
        factors: list[str] = []

        # 1. Operating Hours Gate
        opening_hours = getattr(place, "opening_hours", None) or (place.get("opening_hours") if isinstance(place, dict) else None)
        open_time = time(6, 0)
        close_time = time(20, 0)
        if isinstance(opening_hours, dict):
            try:
                if "open" in opening_hours:
                    o_parts = opening_hours["open"].split(":")
                    open_time = time(int(o_parts[0]), int(o_parts[1]))
                if "close" in opening_hours:
                    c_parts = opening_hours["close"].split(":")
                    close_time = time(int(c_parts[0]), int(c_parts[1]))
            except Exception:
                pass
        elif category_clean == "museum":
            open_time = time(10, 0)
            close_time = time(17, 30)

        is_open = open_time <= arr_time <= close_time
        if not is_open:
            factors.append(
                f"Attraction is closed at arrival time ({arr_time.strftime('%H:%M')}). Operating hours: {open_time.strftime('%H:%M')} - {close_time.strftime('%H:%M')}."
            )
            # Ensure recommended window is strictly inside open hours
            rec_start = max(open_time, time(7, 0)).strftime("%H:%M")
            rec_end = min(close_time, time(10, 0)).strftime("%H:%M")
            return CrowdEstimate(
                level="unknown",
                confidence="medium",
                recommended_window=RecommendedWindow(start=rec_start, end=rec_end),
                factors=factors,
            )

        factors.append(f"Day: {'Weekend' if is_weekend else 'Weekday'}, Planned arrival: {arr_time.strftime('%H:%M')}")
        factors.append(f"Destination category: {category_clean.capitalize()}")

        # 2. Check place-specific curated peak windows
        place_peaks = self.peak_windows.get(place_id, [])
        place_match_level: CrowdLevel | None = None
        day_name = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][dt.weekday()]

        for pw in place_peaks:
            if day_name in [d.lower() for d in pw.get("days", [])]:
                try:
                    s_parts = pw["start"].split(":")
                    e_parts = pw["end"].split(":")
                    pw_s = time(int(s_parts[0]), int(s_parts[1]))
                    pw_e = time(int(e_parts[0]), int(e_parts[1]))
                    if pw_s <= arr_time <= pw_e:
                        place_match_level = pw.get("severity", "high")  # type: ignore
                        factors.append(f"Curated peak window active ({pw['start']}-{pw['end']}) based on {pw.get('source', 'research')}")
                        break
                except Exception:
                    continue

        # 3. Category Prior Heuristics
        level: CrowdLevel = place_match_level or "moderate"
        confidence: CrowdConfidence = "high" if place_match_level else "medium"

        if not place_match_level:
            priors = CATEGORY_PRIORS.get(category_clean, CATEGORY_PRIORS.get("heritage", []))
            matched_prior = False
            for w_start, w_end, wkday_lvl, wkend_lvl in priors:
                if w_start <= arr_time <= w_end:
                    level = wkend_lvl if is_weekend else wkday_lvl
                    matched_prior = True
                    break
            if not matched_prior:
                level = "low" if arr_time < time(9, 0) else "moderate"

        # 4. Avoid Crowds preference adjustment
        rec_window_tuple = DEFAULT_CATEGORY_WINDOWS.get(category_clean, DEFAULT_CATEGORY_WINDOWS["other"])
        rec_start_t = max(open_time, time.fromisoformat(rec_window_tuple[0]))
        rec_end_t = min(close_time, time.fromisoformat(rec_window_tuple[1]))
        recommended_window = RecommendedWindow(
            start=rec_start_t.strftime("%H:%M"),
            end=rec_end_t.strftime("%H:%M"),
        )

        if avoid_crowds:
            factors.append("Traveler requested crowd avoidance; prioritised off-peak visiting recommendation.")
            if level in ("high", "moderate"):
                factors.append(f"Peak level '{level}' detected; consider shifting to morning window ({recommended_window.start} - {recommended_window.end}).")

        # 5. Weather Context influences
        if weather_context:
            precip = weather_context.get("precipitation_probability_pct") or weather_context.get("precipitation_probability") or 0
            temp_c = weather_context.get("temperature_c")
            condition = str(weather_context.get("condition", "")).lower()

            if precip >= 60 or "rain" in condition or "thunder" in condition:
                factors.append(f"High precipitation forecast ({precip}%) may reduce visitor volume for outdoor spots.")
                if category_clean in ("beach", "waterfall", "nature"):
                    factors.append("Adverse outdoor weather advice: check local safety warnings before water/trail activities.")
            elif temp_c and temp_c >= 36:
                factors.append(f"High temperature forecast ({temp_c}°C); recommend early morning or late afternoon visit.")

        return CrowdEstimate(
            level=level,
            confidence=confidence,
            recommended_window=recommended_window,
            factors=factors,
            claim_type="estimated",
            source="O-TRAVELZ crowd heuristic",
        )
