"""
Deterministic Stop Coordinate Resolution and Review Pipeline for Phase 6A.

Evaluates research stop coordinates against spatial boundaries, evidence citations,
and strict provenance tiers to classify them into deterministic action states:
- ACCEPT: Verified coordinates (official/geocoded/OSM) within Odisha bounding box.
- REVIEW: Approximate or partial coordinates requiring manual/field verification.
- REJECT: Out-of-bounds, invalid, or unsubstantiated coordinate claims.
- UNRESOLVED: Legitimate transit stops with null coordinates (no fabrication).
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# Authoritative Odisha Bounding Box
ODISHA_BBOX = {
    "min_lat": 17.5,
    "max_lat": 22.8,
    "min_lon": 81.2,
    "max_lon": 87.6,
}


class CoordinateResolutionAction(str, Enum):
    ACCEPT = "ACCEPT"
    REVIEW = "REVIEW"
    REJECT = "REJECT"
    UNRESOLVED = "UNRESOLVED"


@dataclass
class StopResolutionItem:
    stop_id: str
    stop_name: str
    city: Optional[str]
    district: Optional[str]
    current_db_lat: Optional[float]
    current_db_lon: Optional[float]
    research_lat: Optional[float]
    research_lon: Optional[float]
    coordinate_provenance: Optional[str]
    confidence: str
    evidence_ids: List[str]
    recommended_action: CoordinateResolutionAction
    resolution_rationale: str


@dataclass
class CoordinateResolutionSummary:
    total_canonical_stops: int
    accepted_count: int
    review_count: int
    rejected_count: int
    unresolved_count: int
    items: List[StopResolutionItem]


class StopCoordinateResolver:
    """Deterministic evaluation engine for stop coordinate provenance and validation."""

    def __init__(self, research_dir: Optional[Path] = None):
        if research_dir is None:
            self.research_dir = (
                Path(__file__).resolve().parents[3]
                / "data"
                / "research"
                / "transit"
                / "phase_6a"
            )
        else:
            self.research_dir = research_dir

    def evaluate_all(self) -> CoordinateResolutionSummary:
        """Evaluate all canonical stops and produce deterministic resolution actions."""
        # 1. Load canonical stops from extraction
        ext_dir = self.research_dir.parent / "extraction"
        stops_ext_file = ext_dir / "stops_extracted.json"
        with open(stops_ext_file, "r", encoding="utf-8") as f:
            canonical_stops = json.load(f)

        # 2. Load regional research files to collect all research stop intelligence
        regional_files = [
            "capital_region.json",
            "rourkela.json",
            "berhampur.json",
            "sambalpur.json",
            "keonjhar.json",
        ]

        research_stops_by_name: Dict[str, Dict[str, Any]] = {}
        for rf in regional_files:
            rf_path = self.research_dir / rf
            if not rf_path.exists():
                continue
            with open(rf_path, "r", encoding="utf-8") as f:
                doc = json.load(f)
            for r in doc.get("routes", []):
                for s in r.get("stops", []):
                    s_name = s.get("stop_name", "").upper().strip()
                    if s_name and s_name not in research_stops_by_name:
                        research_stops_by_name[s_name] = s

        items: List[StopResolutionItem] = []
        counts = {
            CoordinateResolutionAction.ACCEPT: 0,
            CoordinateResolutionAction.REVIEW: 0,
            CoordinateResolutionAction.REJECT: 0,
            CoordinateResolutionAction.UNRESOLVED: 0,
        }

        for cs in canonical_stops:
            s_name = cs["canonical_name"].upper().strip()
            s_id = cs.get("id") or f"stop-{s_name.lower().replace(' ', '-')}"
            db_lat = cs.get("latitude")
            db_lon = cs.get("longitude")

            r_meta = research_stops_by_name.get(s_name, {})
            r_lat = r_meta.get("resolved_latitude")
            r_lon = r_meta.get("resolved_longitude")
            prov = r_meta.get("coordinate_provenance")
            conf = r_meta.get("confidence", "UNKNOWN")
            evidence = r_meta.get("evidence", [])

            action, rationale = self._classify_stop(db_lat, db_lon, r_lat, r_lon, prov, conf, evidence)
            counts[action] += 1

            items.append(
                StopResolutionItem(
                    stop_id=s_id,
                    stop_name=s_name,
                    city=cs.get("city"),
                    district=cs.get("district"),
                    current_db_lat=db_lat,
                    current_db_lon=db_lon,
                    research_lat=r_lat,
                    research_lon=r_lon,
                    coordinate_provenance=prov,
                    confidence=conf,
                    evidence_ids=evidence,
                    recommended_action=action,
                    resolution_rationale=rationale,
                )
            )

        return CoordinateResolutionSummary(
            total_canonical_stops=len(canonical_stops),
            accepted_count=counts[CoordinateResolutionAction.ACCEPT],
            review_count=counts[CoordinateResolutionAction.REVIEW],
            rejected_count=counts[CoordinateResolutionAction.REJECT],
            unresolved_count=counts[CoordinateResolutionAction.UNRESOLVED],
            items=items,
        )

    def _classify_stop(
        self,
        db_lat: Optional[float],
        db_lon: Optional[float],
        r_lat: Optional[float],
        r_lon: Optional[float],
        provenance: Optional[str],
        confidence: str,
        evidence: List[str],
    ) -> Tuple[CoordinateResolutionAction, str]:
        lat = r_lat if r_lat is not None else db_lat
        lon = r_lon if r_lon is not None else db_lon

        if lat is None or lon is None:
            return (
                CoordinateResolutionAction.UNRESOLVED,
                "Stop has verified physical entity identity in official transit documents but lacks verified physical coordinates.",
            )

        # Check coordinate bounding box
        if not (ODISHA_BBOX["min_lat"] <= lat <= ODISHA_BBOX["max_lat"] and ODISHA_BBOX["min_lon"] <= lon <= ODISHA_BBOX["max_lon"]):
            return (
                CoordinateResolutionAction.REJECT,
                f"Coordinates ({lat}, {lon}) lie outside authoritative Odisha bounding box.",
            )

        # Check provenance
        if provenance == "research_approximate":
            return (
                CoordinateResolutionAction.REVIEW,
                "Coordinates are research approximations and require on-ground or official stoppage verification before production promotion.",
            )

        if provenance in ("official_source", "geocoded", "osm_verified"):
            if len(evidence) > 0 and confidence in ("CONFIRMED", "SUPPORTED"):
                return (
                    CoordinateResolutionAction.ACCEPT,
                    f"Coordinates verified via {provenance} with {confidence} confidence and explicit evidence citations.",
                )
            return (
                CoordinateResolutionAction.REVIEW,
                f"Coordinates from {provenance} have insufficient corroborating evidence citations.",
            )

        return (
            CoordinateResolutionAction.REVIEW,
            f"Coordinate provenance '{provenance}' requires engineering review.",
        )


def generate_coordinate_resolution_reports(output_dir: Optional[Path] = None):
    """Generate both JSON and Markdown coordinate resolution reports."""
    resolver = StopCoordinateResolver(output_dir)
    summary = resolver.evaluate_all()

    target_dir = output_dir or (
        Path(__file__).resolve().parents[3]
        / "data"
        / "research"
        / "transit"
        / "phase_6a"
    )

    # 1. JSON Report
    json_path = target_dir / "coordinate_resolution_report.json"
    data = {
        "project": "O-TRAVELZ",
        "phase": "6A.6",
        "total_canonical_stops": summary.total_canonical_stops,
        "summary": {
            "ACCEPT": summary.accepted_count,
            "REVIEW": summary.review_count,
            "REJECT": summary.rejected_count,
            "UNRESOLVED": summary.unresolved_count,
        },
        "stops": [
            {
                "stop_id": item.stop_id,
                "stop_name": item.stop_name,
                "city": item.city,
                "district": item.district,
                "current_db_coordinates": [item.current_db_lat, item.current_db_lon] if item.current_db_lat else None,
                "research_coordinates": [item.research_lat, item.research_lon] if item.research_lat else None,
                "provenance": item.coordinate_provenance,
                "confidence": item.confidence,
                "evidence_ids": item.evidence_ids,
                "recommended_action": item.recommended_action.value,
                "rationale": item.resolution_rationale,
            }
            for item in summary.items
        ],
    }

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Generated: {json_path}")

    # 2. Markdown Report
    md_path = target_dir / "COORDINATE_RESOLUTION_REPORT.md"
    md_content = f"""# O-TRAVELZ — Phase 6A.6 Stop Coordinate Resolution Report

## Summary Overview
- **Total Canonical Stops Audited**: {summary.total_canonical_stops}
- **ACCEPTED (Verified Coordinates)**: {summary.accepted_count}
- **REVIEW (Approximations / Need Verification)**: {summary.review_count}
- **REJECTED (Out of Bounds / Invalid)**: {summary.rejected_count}
- **UNRESOLVED (Legit Stops Without Coordinates)**: {summary.unresolved_count}

## Resolution Policies
1. **ACCEPT**: Verified coordinates from `official_source`, `geocoded` (OSM Nominatim within Odisha bounding box), or `osm_verified` with explicit evidence.
2. **REVIEW**: Approximate landmarks or uncorroborated coordinates.
3. **REJECT**: Coordinates outside the Odisha bounding box (17.5–22.8° N, 81.2–87.6° E).
4. **UNRESOLVED**: Physical stops from official timetables that remain unresolved without fabrication.

## Sample Resolved Stops
"""
    # Add top 15 accepted stops
    md_content += "\n### Verified & Accepted Sample Stops\n| Stop Name | City | Coordinates | Provenance | Action |\n|---|---|---|---|---|\n"
    for s in [item for item in summary.items if item.recommended_action == CoordinateResolutionAction.ACCEPT][:15]:
        md_content += f"| `{s.stop_name}` | {s.city or 'N/A'} | `{s.research_lat:.5f}, {s.research_lon:.5f}` | `{s.coordinate_provenance}` | **{s.recommended_action.value}** |\n"

    # Add sample unresolved stops
    md_content += "\n### Unresolved Sample Stops\n| Stop Name | City | Serving Context | Action |\n|---|---|---|---|\n"
    for s in [item for item in summary.items if item.recommended_action == CoordinateResolutionAction.UNRESOLVED][:15]:
        md_content += f"| `{s.stop_name}` | {s.city or 'N/A'} | `{s.district or 'Odisha'}` | **{s.recommended_action.value}** |\n"

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Generated: {md_path}")


if __name__ == "__main__":
    generate_coordinate_resolution_reports()
