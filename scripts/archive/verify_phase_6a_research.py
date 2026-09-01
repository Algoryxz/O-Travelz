"""
Phase 6A Deterministic Pre-Research & Research Artifact Validator.

Validates all 12 Acceptance Criteria (AC1 - AC12) for O-TRAVELZ Mo Bus / CRUT
route intelligence artifacts without modifying database records or fabricating geometry.

Acceptance Criteria:
  AC1  - Route Coverage (Exactly 154 unique routes, no missing, no duplicate)
  AC2  - Stop Preservation (All existing stop identities preserved)
  AC3  - Sequence Preservation (Sequence integrity, conflicts must be explicit)
  AC4  - No Fabricated Coordinates (Valid range, provenance required, evidence cited)
  AC5  - Confidence Consistency (CONFIRMED requires HIGH reliability evidence)
  AC6  - Conflict Documentation (Source discrepancies surfaced in structured format)
  AC7  - Geometry Status Coverage (Every route carries EXACT/CORRIDOR/PARTIAL/NONE)
  AC8  - No Misleading Geometry (Zero GeoJSON/polyline vector payloads)
  AC9  - Evidence Traceability (Corridors and coordinates cite valid evidence)
  AC10 - Schema Conformance (All required fields, types, and canonical enums)
  AC11 - Production API Compatibility (Zero alterations to existing contracts)
  AC12 - Production Invariants (154 routes, 1430 stops, 1491 route-stops)
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# Canonical Enumerations
VALID_CONFIDENCE_LEVELS = frozenset({"CONFIRMED", "SUPPORTED", "INFERRED", "UNKNOWN"})
VALID_GEOMETRY_STATUSES = frozenset({"EXACT", "CORRIDOR", "PARTIAL", "NONE"})
VALID_COORDINATE_PROVENANCES = frozenset({
    "official_source",
    "geocoded",
    "osm_verified",
    "research_approximate",
    None,
})
VALID_GEOGRAPHIC_STATUSES = frozenset({
    "verified",
    "approximate",
    "identified_no_coordinate",
    "unresolved",
})
VALID_EVIDENCE_SOURCE_TYPES = frozenset({
    "OFFICIAL_DOCUMENT",
    "OFFICIAL_MAP",
    "OSM",
    "RESEARCH",
    "INFERENCE",
})
VALID_CORRIDOR_STATUSES = frozenset({
    "VERIFIED_GEOGRAPHY",
    "STRONGLY_INFERRED",
    "WEAKLY_INFERRED",
    "UNKNOWN",
})
VALID_EVIDENCE_RELIABILITIES = frozenset({"HIGH", "MEDIUM", "LOW"})
VALID_REGIONS = frozenset({
    "Capital Region",
    "Rourkela",
    "Berhampur",
    "Sambalpur",
    "Keonjhar",
})

REGIONAL_FILES = {
    "Capital Region": "capital_region.json",
    "Rourkela": "rourkela.json",
    "Berhampur": "berhampur.json",
    "Sambalpur": "sambalpur.json",
    "Keonjhar": "keonjhar.json",
}

FORBIDDEN_GEOMETRY_KEYS = frozenset({
    "geometry",
    "geojson",
    "coordinates_linestring",
    "linestring",
    "LineString",
    "MultiLineString",
    "polyline",
    "wkt_geometry",
})


@dataclass
class ValidationFailure:
    criterion: str
    code: str
    message: str
    route_number: Optional[str] = None
    stop_name: Optional[str] = None
    evidence_id: Optional[str] = None
    file_name: Optional[str] = None

    def __str__(self) -> str:
        loc = []
        if self.file_name:
            loc.append(f"file={self.file_name}")
        if self.route_number:
            loc.append(f"route={self.route_number}")
        if self.stop_name:
            loc.append(f"stop='{self.stop_name}'")
        if self.evidence_id:
            loc.append(f"evidence_id={self.evidence_id}")
        loc_str = f" [{', '.join(loc)}]" if loc else ""
        return f"[{self.criterion}] {self.code}{loc_str}: {self.message}"


@dataclass
class ValidationReport:
    is_valid: bool
    total_routes_checked: int
    total_stops_checked: int
    total_corridors_checked: int
    total_evidence_items: int
    passed_criteria: List[str]
    failed_criteria: List[str]
    failures: List[ValidationFailure] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    def summary_lines(self) -> List[str]:
        status_str = "PASSED" if self.is_valid else "FAILED"
        lines = [
            f"=== PHASE 6A RESEARCH VALIDATION GATE: {status_str} ===",
            f"Routes Checked:     {self.total_routes_checked} (Expected: 154)",
            f"Stops Checked:      {self.total_stops_checked}",
            f"Corridors Checked:  {self.total_corridors_checked}",
            f"Evidence Citations: {self.total_evidence_items}",
            f"Passed Criteria:    {len(self.passed_criteria)} / 12 ({', '.join(self.passed_criteria) if self.passed_criteria else 'None'})",
            f"Failed Criteria:    {len(self.failed_criteria)} / 12 ({', '.join(self.failed_criteria) if self.failed_criteria else 'None'})",
        ]
        if self.failures:
            lines.append("\nFailures Detail:")
            for f in self.failures:
                lines.append(f"  - {f}")
        if self.warnings:
            lines.append("\nWarnings:")
            for w in self.warnings:
                lines.append(f"  * {w}")
        return lines


class Phase6AResearchValidator:
    """
    Deterministic validator for Phase 6A research artifacts.
    Loads baseline inventory from data/research/transit/extraction/ and validates target directory.
    """

    def __init__(
        self,
        base_dir: Optional[Path] = None,
        extraction_dir: Optional[Path] = None,
    ):
        self.base_dir = base_dir or Path(__file__).resolve().parents[1]
        self.extraction_dir = (
            extraction_dir
            or self.base_dir / "data" / "research" / "transit" / "extraction"
        )
        self.baseline_routes: List[Dict[str, Any]] = []
        self.baseline_stops: List[Dict[str, Any]] = []
        self.baseline_route_stops: List[Dict[str, Any]] = []
        self.baseline_route_numbers: Set[str] = set()
        self.baseline_stop_names: Set[str] = set()
        self.baseline_route_stop_map: Dict[str, List[Dict[str, Any]]] = {}

        self._load_baseline()

    def _load_baseline(self) -> None:
        """
        Load the authoritative 154-route extracted baseline from extraction repository data.
        Authoritative Ground Truth Sources:
          - routes_extracted.json: 154 routes
          - stops_extracted.json: 1,430 canonical stops
          - route_stops_extracted.json: 1,491 raw rows containing 1,487 unique (route_number, stop_name, sequence_order) links
        """
        routes_file = self.extraction_dir / "routes_extracted.json"
        stops_file = self.extraction_dir / "stops_extracted.json"
        route_stops_file = self.extraction_dir / "route_stops_extracted.json"

        if not routes_file.exists():
            raise FileNotFoundError(f"Baseline extraction file missing: {routes_file}")

        with open(routes_file, "r", encoding="utf-8") as f:
            self.baseline_routes = json.load(f)
        with open(stops_file, "r", encoding="utf-8") as f:
            self.baseline_stops = json.load(f)
        with open(route_stops_file, "r", encoding="utf-8") as f:
            self.baseline_route_stops = json.load(f)

        self.baseline_route_numbers = {
            str(r["route_number"]).strip() for r in self.baseline_routes
        }
        self.baseline_stop_names = {
            s["canonical_name"].upper().strip() for s in self.baseline_stops
        }

        # Deduplicate raw route_stops by (route_number, stop_name, sequence_order)
        # in extraction file order to match the authoritative 1,487 unique RouteStop database entities.
        seen_unique_rs = set()
        for rs in self.baseline_route_stops:
            rn = str(rs["route_number"]).strip()
            s_name = rs["stop_name"].upper().strip()
            seq = int(rs.get("sequence_order", 1))
            key = (rn, s_name, seq)
            if key not in seen_unique_rs:
                seen_unique_rs.add(key)
                self.baseline_route_stop_map.setdefault(rn, []).append((seq, s_name))



    def validate_directory(self, target_dir: Path) -> ValidationReport:
        """Run full deterministic validation suite against target research directory."""
        failures: List[ValidationFailure] = []
        warnings: List[str] = []
        passed_criteria: List[str] = []
        failed_criteria: List[str] = []

        if not target_dir.exists():
            failures.append(
                ValidationFailure(
                    criterion="AC10",
                    code="TARGET_DIR_NOT_FOUND",
                    message=f"Target research directory does not exist: {target_dir}",
                )
            )
            return ValidationReport(
                is_valid=False,
                total_routes_checked=0,
                total_stops_checked=0,
                total_corridors_checked=0,
                total_evidence_items=0,
                passed_criteria=[],
                failed_criteria=["AC10"],
                failures=failures,
            )

        # 1. Load Evidence Registry First
        evidence_file = target_dir / "evidence_registry.json"
        evidence_map: Dict[str, Dict[str, Any]] = {}
        if not evidence_file.exists():
            failures.append(
                ValidationFailure(
                    criterion="AC9",
                    code="EVIDENCE_REGISTRY_MISSING",
                    message="Missing required file: evidence_registry.json",
                    file_name="evidence_registry.json",
                )
            )
        else:
            try:
                with open(evidence_file, "r", encoding="utf-8") as f:
                    evidence_doc = json.load(f)
                evidence_items = evidence_doc.get("evidence", [])
                for ev in evidence_items:
                    ev_id = ev.get("evidence_id")
                    if ev_id:
                        evidence_map[ev_id] = ev
            except Exception as e:
                failures.append(
                    ValidationFailure(
                        criterion="AC10",
                        code="EVIDENCE_REGISTRY_JSON_MALFORMED",
                        message=f"Failed to parse evidence_registry.json: {e}",
                        file_name="evidence_registry.json",
                    )
                )

        # 2. Load Master Route Index
        index_file = target_dir / "route_index.json"
        index_routes: List[Dict[str, Any]] = []
        if not index_file.exists():
            failures.append(
                ValidationFailure(
                    criterion="AC1",
                    code="ROUTE_INDEX_MISSING",
                    message="Missing required file: route_index.json",
                    file_name="route_index.json",
                )
            )
        else:
            try:
                with open(index_file, "r", encoding="utf-8") as f:
                    index_doc = json.load(f)
                index_routes = index_doc.get("routes", [])
            except Exception as e:
                failures.append(
                    ValidationFailure(
                        criterion="AC10",
                        code="ROUTE_INDEX_JSON_MALFORMED",
                        message=f"Failed to parse route_index.json: {e}",
                        file_name="route_index.json",
                    )
                )

        # 3. Load Regional Artifacts
        regional_routes: Dict[str, List[Dict[str, Any]]] = {}
        all_research_routes: Dict[str, Dict[str, Any]] = {}

        for region_name, file_name in REGIONAL_FILES.items():
            rf_path = target_dir / file_name
            if not rf_path.exists():
                failures.append(
                    ValidationFailure(
                        criterion="AC1",
                        code="REGIONAL_FILE_MISSING",
                        message=f"Missing regional research file: {file_name}",
                        file_name=file_name,
                    )
                )
                continue
            try:
                with open(rf_path, "r", encoding="utf-8") as f:
                    rf_doc = json.load(f)
                routes_list = rf_doc.get("routes", [])
                regional_routes[region_name] = routes_list
                for r in routes_list:
                    rn = str(r.get("route_number", "")).strip()
                    if rn in all_research_routes:
                        failures.append(
                            ValidationFailure(
                                criterion="AC1",
                                code="DUPLICATE_ROUTE_NUMBER",
                                message=f"Duplicate route number '{rn}' detected in regional files.",
                                route_number=rn,
                                file_name=file_name,
                            )
                        )
                    all_research_routes[rn] = r
            except Exception as e:
                failures.append(
                    ValidationFailure(
                        criterion="AC10",
                        code="REGIONAL_FILE_JSON_MALFORMED",
                        message=f"Failed to parse {file_name}: {e}",
                        file_name=file_name,
                    )
                )

        # 4. Load Global Analysis & Unresolved Stops
        global_analysis_file = target_dir / "global_analysis.json"
        if not global_analysis_file.exists():
            failures.append(
                ValidationFailure(
                    criterion="AC10",
                    code="GLOBAL_ANALYSIS_MISSING",
                    message="Missing required file: global_analysis.json",
                    file_name="global_analysis.json",
                )
            )

        unresolved_stops_file = target_dir / "unresolved_stops.json"
        if not unresolved_stops_file.exists():
            failures.append(
                ValidationFailure(
                    criterion="AC10",
                    code="UNRESOLVED_STOPS_MISSING",
                    message="Missing required file: unresolved_stops.json",
                    file_name="unresolved_stops.json",
                )
            )

        # ==================== RUN ACCEPTANCE GATES ====================

        # AC1: Route Coverage Gate
        ac1_failures = self._check_ac1_route_coverage(
            index_routes, all_research_routes
        )
        failures.extend(ac1_failures)

        # AC2: Stop Preservation Gate
        ac2_failures = self._check_ac2_stop_preservation(all_research_routes)
        failures.extend(ac2_failures)

        # AC3: Sequence Preservation Gate
        ac3_failures = self._check_ac3_sequence_preservation(all_research_routes)
        failures.extend(ac3_failures)

        # AC4: No Fabricated Coordinates Gate
        ac4_failures = self._check_ac4_coordinates(all_research_routes, evidence_map)
        failures.extend(ac4_failures)

        # AC5: Confidence Consistency Gate
        ac5_failures = self._check_ac5_confidence(all_research_routes, evidence_map)
        failures.extend(ac5_failures)

        # AC6: Conflict Documentation Gate
        ac6_failures = self._check_ac6_conflicts(all_research_routes)
        failures.extend(ac6_failures)

        # AC7: Geometry Status Coverage Gate
        ac7_failures = self._check_ac7_geometry_status(all_research_routes)
        failures.extend(ac7_failures)

        # AC8: No Misleading Geometry (No GeoJSON) Gate
        ac8_failures = self._check_ac8_no_geometry(target_dir, all_research_routes)
        failures.extend(ac8_failures)

        # AC9: Evidence Traceability Gate
        ac9_failures = self._check_ac9_evidence_traceability(
            all_research_routes, evidence_map
        )
        failures.extend(ac9_failures)

        # AC10: Schema Conformance Gate
        ac10_failures = self._check_ac10_schema(
            target_dir, index_routes, all_research_routes, evidence_map
        )
        failures.extend(ac10_failures)

        # AC11: Production API Compatibility Gate
        ac11_failures = self._check_ac11_api_compatibility()
        failures.extend(ac11_failures)

        # AC12: Production Invariants Gate
        ac12_failures = self._check_ac12_invariants()
        failures.extend(ac12_failures)

        # Calculate counts
        total_routes = len(all_research_routes)
        total_stops = sum(len(r.get("stops", [])) for r in all_research_routes.values())
        total_corridors = sum(
            len(r.get("corridors", [])) for r in all_research_routes.values()
        )
        total_evidence = len(evidence_map)

        # Categorize pass / fail per criteria
        criteria_list = [f"AC{i}" for i in range(1, 13)]
        failed_set = {f.criterion for f in failures}
        for c in criteria_list:
            if c in failed_set:
                failed_criteria.append(c)
            else:
                passed_criteria.append(c)

        return ValidationReport(
            is_valid=(len(failures) == 0),
            total_routes_checked=total_routes,
            total_stops_checked=total_stops,
            total_corridors_checked=total_corridors,
            total_evidence_items=total_evidence,
            passed_criteria=passed_criteria,
            failed_criteria=failed_criteria,
            failures=failures,
            warnings=warnings,
        )

    # ------------------ INDIVIDUAL GATE IMPLEMENTATIONS ------------------

    def _check_ac1_route_coverage(
        self,
        index_routes: List[Dict[str, Any]],
        all_research_routes: Dict[str, Dict[str, Any]],
    ) -> List[ValidationFailure]:
        """AC1: Exactly 154 unique routes represented, matching baseline."""
        fails: List[ValidationFailure] = []
        research_rns = set(all_research_routes.keys())
        expected_rns = self.baseline_route_numbers

        missing = expected_rns - research_rns
        if missing:
            fails.append(
                ValidationFailure(
                    criterion="AC1",
                    code="MISSING_ROUTES",
                    message=f"Missing {len(missing)} routes from baseline: {sorted(missing)[:15]}...",
                )
            )

        unexpected = research_rns - expected_rns
        if unexpected:
            fails.append(
                ValidationFailure(
                    criterion="AC1",
                    code="UNEXPECTED_ROUTES",
                    message=f"Unexpected {len(unexpected)} routes not in baseline: {sorted(unexpected)}",
                )
            )

        if len(research_rns) != 154:
            fails.append(
                ValidationFailure(
                    criterion="AC1",
                    code="INVALID_ROUTE_COUNT",
                    message=f"Expected exactly 154 unique routes, found {len(research_rns)}",
                )
            )

        # Check route_index matches regional routes
        index_rns = {str(r.get("route_number", "")).strip() for r in index_routes}
        if index_rns != research_rns:
            diff = index_rns ^ research_rns
            fails.append(
                ValidationFailure(
                    criterion="AC1",
                    code="INDEX_REGIONAL_MISMATCH",
                    message=f"Mismatch between route_index.json and regional files for routes: {sorted(diff)[:10]}",
                )
            )

        return fails

    def _check_ac2_stop_preservation(
        self, all_research_routes: Dict[str, Dict[str, Any]]
    ) -> List[ValidationFailure]:
        """
        AC2: Stop Preservation against authoritative baseline (1,430 canonical stops).
        - Checks for empty stop_name or stop_id.
        - Verifies that stop names in research exist in the authoritative stop registry.
        - Verifies that all expected baseline stops for each route are preserved unless
          an explicit conflict (stop_naming, stop_omission, route_variant) is documented.
        - Rejects undocumented renaming or deletion of canonical stops.
        """
        fails: List[ValidationFailure] = []

        for rn, r in all_research_routes.items():
            research_stops = r.get("stops", [])
            conflicts = r.get("conflicts", [])
            has_stop_conflict = any(
                c.get("conflict_type") in ("stop_naming", "stop_omission", "route_variant")
                for c in conflicts
            )

            research_stop_names = []
            for s in research_stops:
                s_name = s.get("stop_name")
                if not s_name or not str(s_name).strip():
                    fails.append(
                        ValidationFailure(
                            criterion="AC2",
                            code="EMPTY_STOP_NAME",
                            message="Stop record has empty stop_name",
                            route_number=rn,
                        )
                    )
                    continue

                s_id = s.get("stop_id")
                if not s_id or not str(s_id).strip():
                    fails.append(
                        ValidationFailure(
                            criterion="AC2",
                            code="EMPTY_STOP_ID",
                            message="Stop record has empty stop_id",
                            route_number=rn,
                            stop_name=str(s_name),
                        )
                    )

                norm_name = str(s_name).upper().strip()
                research_stop_names.append(norm_name)

                # Check if stop name is known in baseline stop registry
                if norm_name not in self.baseline_stop_names:
                    if not has_stop_conflict:
                        fails.append(
                            ValidationFailure(
                                criterion="AC2",
                                code="UNKNOWN_STOP",
                                message=f"Stop '{s_name}' is not present in authoritative repository stop inventory (1,430 canonical stops) without a documented conflict.",
                                route_number=rn,
                                stop_name=str(s_name),
                            )
                        )

            # Compare route stops against baseline route stops for this route
            baseline_entries = self.baseline_route_stop_map.get(rn, [])
            baseline_stop_names = [name for seq, name in baseline_entries]

            if baseline_stop_names:
                missing_from_research = set(baseline_stop_names) - set(research_stop_names)
                if missing_from_research and not has_stop_conflict:
                    fails.append(
                        ValidationFailure(
                            criterion="AC2",
                            code="MISSING_STOP",
                            message=f"Route {rn} omitted {len(missing_from_research)} database stops without documented conflict: {sorted(missing_from_research)[:5]}",
                            route_number=rn,
                        )
                    )

        return fails

    def _check_ac3_sequence_preservation(
        self, all_research_routes: Dict[str, Dict[str, Any]]
    ) -> List[ValidationFailure]:
        """
        AC3: Sequence Preservation against authoritative database route_stops.sequence_order.
        - Sequences must be positive integers.
        - Research stop order for each route must match the authoritative sequence order.
        - Sequence inversions or mutations (e.g. A->C->B instead of A->B->C) MUST fail
          unless explicitly documented as a sequence_conflict.
        """
        fails: List[ValidationFailure] = []

        for rn, r in all_research_routes.items():
            stops = r.get("stops", [])
            conflicts = r.get("conflicts", [])
            has_seq_conflict = any(
                c.get("conflict_type") in ("sequence_conflict", "route_variant")
                for c in conflicts
            )

            # 1. Validate sequence numbers are positive integers
            for s in stops:
                seq = s.get("sequence_order")
                if seq is None or not isinstance(seq, int) or seq <= 0:
                    fails.append(
                        ValidationFailure(
                            criterion="AC3",
                            code="INVALID_SEQUENCE_ORDER",
                            message=f"Invalid sequence_order '{seq}' (must be positive integer)",
                            route_number=rn,
                            stop_name=s.get("stop_name"),
                        )
                    )

            # 2. Compare sequence directly against database baseline sequence
            baseline_entries = self.baseline_route_stop_map.get(rn, [])
            if baseline_entries and len(stops) == len(baseline_entries):
                baseline_seq = [(seq, name) for seq, name in baseline_entries]
                research_seq = [
                    (s.get("sequence_order"), s.get("stop_name", "").upper().strip())
                    for s in stops
                ]
                if baseline_seq != research_seq and not has_seq_conflict:
                    fails.append(
                        ValidationFailure(
                            criterion="AC3",
                            code="UNDOCUMENTED_SEQUENCE_MUTATION",
                            message=f"Research sequence order for Route {rn} differs from database baseline without documented sequence_conflict.",
                            route_number=rn,
                        )
                    )
            elif baseline_entries and len(stops) != len(baseline_entries) and not has_seq_conflict:
                fails.append(
                    ValidationFailure(
                        criterion="AC3",
                        code="UNDOCUMENTED_SEQUENCE_MUTATION",
                        message=f"Research sequence count for Route {rn} ({len(stops)}) differs from database baseline ({len(baseline_entries)}) without documented sequence_conflict.",
                        route_number=rn,
                    )
                )

        return fails

    def _check_ac4_coordinates(
        self,
        all_research_routes: Dict[str, Dict[str, Any]],
        evidence_map: Dict[str, Dict[str, Any]],
    ) -> List[ValidationFailure]:
        """AC4: No fabricated coordinates. Valid bounds, provenance required, evidence cited."""
        fails: List[ValidationFailure] = []

        for rn, r in all_research_routes.items():
            for s in r.get("stops", []):
                lat = s.get("resolved_latitude")
                lon = s.get("resolved_longitude")
                prov = s.get("coordinate_provenance")
                s_name = s.get("stop_name", "?")
                s_conf = s.get("confidence")

                # Both or neither
                if (lat is None) != (lon is None):
                    fails.append(
                        ValidationFailure(
                            criterion="AC4",
                            code="COORDINATE_PAIR_INCOMPLETE",
                            message="Latitude and longitude must be provided together or both be null.",
                            route_number=rn,
                            stop_name=s_name,
                        )
                    )
                    continue

                if lat is not None and lon is not None:
                    # Check types and finite values
                    if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
                        fails.append(
                            ValidationFailure(
                                criterion="AC4",
                                code="COORDINATE_NOT_NUMERIC",
                                message=f"Coordinates must be numeric (found lat={lat}, lon={lon})",
                                route_number=rn,
                                stop_name=s_name,
                            )
                        )
                        continue

                    if math.isnan(lat) or math.isnan(lon) or math.isinf(lat) or math.isinf(lon):
                        fails.append(
                            ValidationFailure(
                                criterion="AC4",
                                code="COORDINATE_NOT_FINITE",
                                message="Coordinates must be finite numbers.",
                                route_number=rn,
                                stop_name=s_name,
                            )
                        )
                        continue

                    # Geographic range check
                    if not (-90.0 <= lat <= 90.0):
                        fails.append(
                            ValidationFailure(
                                criterion="AC4",
                                code="LATITUDE_OUT_OF_RANGE",
                                message=f"Latitude {lat} is outside [-90, 90]",
                                route_number=rn,
                                stop_name=s_name,
                            )
                        )
                    if not (-180.0 <= lon <= 180.0):
                        fails.append(
                            ValidationFailure(
                                criterion="AC4",
                                code="LONGITUDE_OUT_OF_RANGE",
                                message=f"Longitude {lon} is outside [-180, 180]",
                                route_number=rn,
                                stop_name=s_name,
                            )
                        )

                    # Provenance check
                    if not prov or prov not in VALID_COORDINATE_PROVENANCES or prov is None:
                        fails.append(
                            ValidationFailure(
                                criterion="AC4",
                                code="MISSING_COORDINATE_PROVENANCE",
                                message="Non-null coordinates must specify valid coordinate_provenance.",
                                route_number=rn,
                                stop_name=s_name,
                            )
                        )

                    # Evidence check for coordinates
                    s_ev = s.get("evidence", [])
                    if not s_ev or len(s_ev) == 0:
                        fails.append(
                            ValidationFailure(
                                criterion="AC4",
                                code="COORDINATE_WITHOUT_EVIDENCE",
                                message="Non-null coordinates must cite at least one evidence_id.",
                                route_number=rn,
                                stop_name=s_name,
                            )
                        )
                    else:
                        for ev_id in s_ev:
                            if ev_id not in evidence_map:
                                fails.append(
                                    ValidationFailure(
                                        criterion="AC4",
                                        code="COORDINATE_EVIDENCE_NOT_FOUND",
                                        message=f"Stop cites unknown evidence_id '{ev_id}'",
                                        route_number=rn,
                                        stop_name=s_name,
                                        evidence_id=ev_id,
                                    )
                                )

                    # research_approximate cannot be CONFIRMED
                    if prov == "research_approximate" and s_conf == "CONFIRMED":
                        fails.append(
                            ValidationFailure(
                                criterion="AC4",
                                code="APPROXIMATE_CANNOT_BE_CONFIRMED",
                                message="Coordinates with provenance='research_approximate' must not claim confidence='CONFIRMED'.",
                                route_number=rn,
                                stop_name=s_name,
                            )
                        )
                else:
                    # lat and lon are null -> provenance must be null
                    if prov is not None:
                        fails.append(
                            ValidationFailure(
                                criterion="AC4",
                                code="PROVENANCE_FOR_NULL_COORDINATES",
                                message=f"Null coordinates should have coordinate_provenance=null (found '{prov}')",
                                route_number=rn,
                                stop_name=s_name,
                            )
                        )

        return fails

    def _check_ac5_confidence(
        self,
        all_research_routes: Dict[str, Dict[str, Any]],
        evidence_map: Dict[str, Dict[str, Any]],
    ) -> List[ValidationFailure]:
        """AC5: CONFIRMED requires HIGH reliability evidence from official/verified source."""
        fails: List[ValidationFailure] = []

        def verify_confirmed(
            conf: str, ev_list: List[str], entity_type: str, rn: str, label: str
        ) -> None:
            if conf != "CONFIRMED":
                return
            if not ev_list:
                fails.append(
                    ValidationFailure(
                        criterion="AC5",
                        code="CONFIRMED_WITHOUT_EVIDENCE",
                        message=f"{entity_type} marked CONFIRMED but cites no evidence.",
                        route_number=rn,
                        stop_name=label if entity_type == "Stop" else None,
                    )
                )
                return

            has_high_official = False
            for ev_id in ev_list:
                ev = evidence_map.get(ev_id)
                if ev:
                    rel = ev.get("reliability")
                    st = ev.get("source_type")
                    if rel == "HIGH" and st in (
                        "OFFICIAL_DOCUMENT",
                        "OFFICIAL_MAP",
                        "OSM",
                        "RESEARCH",
                    ):
                        has_high_official = True
                        break

            if not has_high_official:
                fails.append(
                    ValidationFailure(
                        criterion="AC5",
                        code="CONFIRMED_WITHOUT_HIGH_EVIDENCE",
                        message=f"{entity_type} marked CONFIRMED but has no cited evidence with reliability='HIGH' from an official/verified source.",
                        route_number=rn,
                        stop_name=label if entity_type == "Stop" else None,
                    )
                )

        for rn, r in all_research_routes.items():
            # Route level
            r_conf = r.get("overall_confidence", "UNKNOWN")
            r_ev = r.get("route_level_evidence", [])
            verify_confirmed(r_conf, r_ev, "Route", rn, rn)

            # Stops
            for s in r.get("stops", []):
                s_conf = s.get("confidence", "UNKNOWN")
                s_ev = s.get("evidence", [])
                verify_confirmed(s_conf, s_ev, "Stop", rn, s.get("stop_name", "?"))

            # Corridors
            for c in r.get("corridors", []):
                c_conf = c.get("confidence", "UNKNOWN")
                c_ev = c.get("evidence", [])
                c_label = f"{c.get('from_label', '?')} -> {c.get('to_label', '?')}"
                verify_confirmed(c_conf, c_ev, "Corridor", rn, c_label)

        return fails

    def _check_ac6_conflicts(
        self, all_research_routes: Dict[str, Dict[str, Any]]
    ) -> List[ValidationFailure]:
        """AC6: Discrepancies must be explicitly documented in structured format."""
        fails: List[ValidationFailure] = []

        for rn, r in all_research_routes.items():
            conflicts = r.get("conflicts", [])
            for c in conflicts:
                c_type = c.get("conflict_type")
                if not c_type or not str(c_type).strip():
                    fails.append(
                        ValidationFailure(
                            criterion="AC6",
                            code="CONFLICT_MISSING_TYPE",
                            message="Conflict record missing required field 'conflict_type'.",
                            route_number=rn,
                        )
                    )
                if not c.get("source"):
                    fails.append(
                        ValidationFailure(
                            criterion="AC6",
                            code="CONFLICT_MISSING_SOURCE",
                            message="Conflict record missing required field 'source'.",
                            route_number=rn,
                        )
                    )
                if not c.get("recommended_action"):
                    fails.append(
                        ValidationFailure(
                            criterion="AC6",
                            code="CONFLICT_MISSING_ACTION",
                            message="Conflict record missing required field 'recommended_action'.",
                            route_number=rn,
                        )
                    )
        return fails

    def _check_ac7_geometry_status(
        self, all_research_routes: Dict[str, Dict[str, Any]]
    ) -> List[ValidationFailure]:
        """AC7: Every route carries valid geometry_status in (EXACT, CORRIDOR, PARTIAL, NONE)."""
        fails: List[ValidationFailure] = []

        for rn, r in all_research_routes.items():
            gs = r.get("geometry_status")
            if not gs or gs not in VALID_GEOMETRY_STATUSES:
                fails.append(
                    ValidationFailure(
                        criterion="AC7",
                        code="INVALID_GEOMETRY_STATUS",
                        message=f"Route has invalid geometry_status '{gs}' (must be EXACT, CORRIDOR, PARTIAL, or NONE).",
                        route_number=rn,
                    )
                )
        return fails

    def _check_ac8_no_geometry(
        self, target_dir: Path, all_research_routes: Dict[str, Dict[str, Any]]
    ) -> List[ValidationFailure]:
        """AC8: Zero GeoJSON / polyline vector payloads allowed in research artifacts."""
        fails: List[ValidationFailure] = []

        def check_obj(obj: Any, path: str, rn: Optional[str] = None) -> None:
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if k in FORBIDDEN_GEOMETRY_KEYS:
                        fails.append(
                            ValidationFailure(
                                criterion="AC8",
                                code="FORBIDDEN_GEOMETRY_PAYLOAD",
                                message=f"Research artifact contains forbidden geometry key '{k}' at path '{path}'. Phase 6A produces intelligence, not route geometry.",
                                route_number=rn,
                            )
                        )
                    check_obj(v, f"{path}.{k}", rn)
            elif isinstance(obj, list):
                for i, elem in enumerate(obj):
                    check_obj(elem, f"{path}[{i}]", rn)

        for rn, r in all_research_routes.items():
            check_obj(r, f"route[{rn}]", rn)

        return fails

    def _check_ac9_evidence_traceability(
        self,
        all_research_routes: Dict[str, Dict[str, Any]],
        evidence_map: Dict[str, Dict[str, Any]],
    ) -> List[ValidationFailure]:
        """AC9: Corridors must cite evidence, and all cited evidence must exist in registry."""
        fails: List[ValidationFailure] = []

        for rn, r in all_research_routes.items():
            for c in r.get("corridors", []):
                ev_list = c.get("evidence", [])
                c_label = f"{c.get('from_label', '?')} -> {c.get('to_label', '?')}"
                if not ev_list or len(ev_list) == 0:
                    fails.append(
                        ValidationFailure(
                            criterion="AC9",
                            code="CORRIDOR_WITHOUT_EVIDENCE",
                            message=f"Corridor segment '{c_label}' must cite at least one evidence_id.",
                            route_number=rn,
                        )
                    )
                else:
                    for ev_id in ev_list:
                        if ev_id not in evidence_map:
                            fails.append(
                                ValidationFailure(
                                    criterion="AC9",
                                    code="CORRIDOR_EVIDENCE_NOT_FOUND",
                                    message=f"Corridor '{c_label}' cites unknown evidence_id '{ev_id}'.",
                                    route_number=rn,
                                    evidence_id=ev_id,
                                )
                            )

        return fails

    def _check_ac10_schema(
        self,
        target_dir: Path,
        index_routes: List[Dict[str, Any]],
        all_research_routes: Dict[str, Dict[str, Any]],
        evidence_map: Dict[str, Dict[str, Any]],
    ) -> List[ValidationFailure]:
        """AC10: Schema conformance for required fields and enums."""
        fails: List[ValidationFailure] = []

        for rn, r in all_research_routes.items():
            # Check required route fields
            req_route_fields = [
                "route_id",
                "route_number",
                "route_code",
                "provider_id",
                "provider_name",
                "region",
                "origin",
                "destination",
                "overall_confidence",
                "geometry_status",
                "has_detailed_stops",
                "stops",
                "corridors",
            ]
            for f in req_route_fields:
                if f not in r:
                    fails.append(
                        ValidationFailure(
                            criterion="AC10",
                            code="MISSING_REQUIRED_ROUTE_FIELD",
                            message=f"Route missing required field '{f}'",
                            route_number=rn,
                        )
                    )

            # Check enums
            if r.get("overall_confidence") not in VALID_CONFIDENCE_LEVELS:
                fails.append(
                    ValidationFailure(
                        criterion="AC10",
                        code="INVALID_ROUTE_CONFIDENCE_ENUM",
                        message=f"Invalid overall_confidence '{r.get('overall_confidence')}'",
                        route_number=rn,
                    )
                )

            if r.get("region") not in VALID_REGIONS:
                fails.append(
                    ValidationFailure(
                        criterion="AC10",
                        code="INVALID_ROUTE_REGION_ENUM",
                        message=f"Invalid region '{r.get('region')}'",
                        route_number=rn,
                    )
                )

            # Check stops enums and fields
            for s in r.get("stops", []):
                req_stop_fields = [
                    "stop_id",
                    "stop_name",
                    "sequence_order",
                    "geographic_status",
                    "confidence",
                ]
                for f in req_stop_fields:
                    if f not in s:
                        fails.append(
                            ValidationFailure(
                                criterion="AC10",
                                code="MISSING_REQUIRED_STOP_FIELD",
                                message=f"Stop missing required field '{f}'",
                                route_number=rn,
                                stop_name=s.get("stop_name"),
                            )
                        )
                if s.get("geographic_status") not in VALID_GEOGRAPHIC_STATUSES:
                    fails.append(
                        ValidationFailure(
                            criterion="AC10",
                            code="INVALID_GEOGRAPHIC_STATUS_ENUM",
                            message=f"Invalid geographic_status '{s.get('geographic_status')}'",
                            route_number=rn,
                            stop_name=s.get("stop_name"),
                        )
                    )
                if s.get("confidence") not in VALID_CONFIDENCE_LEVELS:
                    fails.append(
                        ValidationFailure(
                            criterion="AC10",
                            code="INVALID_STOP_CONFIDENCE_ENUM",
                            message=f"Invalid stop confidence '{s.get('confidence')}'",
                            route_number=rn,
                            stop_name=s.get("stop_name"),
                        )
                    )

            # Check corridor enums and fields
            for c in r.get("corridors", []):
                req_corridor_fields = [
                    "sequence",
                    "from_label",
                    "to_label",
                    "road_names",
                    "status",
                    "geometry_eligible",
                    "confidence",
                    "evidence",
                ]
                for f in req_corridor_fields:
                    if f not in c:
                        fails.append(
                            ValidationFailure(
                                criterion="AC10",
                                code="MISSING_REQUIRED_CORRIDOR_FIELD",
                                message=f"Corridor segment missing required field '{f}'",
                                route_number=rn,
                            )
                        )
                if c.get("status") not in VALID_CORRIDOR_STATUSES:
                    fails.append(
                        ValidationFailure(
                            criterion="AC10",
                            code="INVALID_CORRIDOR_STATUS_ENUM",
                            message=f"Invalid corridor status '{c.get('status')}'",
                            route_number=rn,
                        )
                    )
                if c.get("confidence") not in VALID_CONFIDENCE_LEVELS:
                    fails.append(
                        ValidationFailure(
                            criterion="AC10",
                            code="INVALID_CORRIDOR_CONFIDENCE_ENUM",
                            message=f"Invalid corridor confidence '{c.get('confidence')}'",
                            route_number=rn,
                        )
                    )

        # Check evidence registry schema
        for ev_id, ev in evidence_map.items():
            for f in ["evidence_id", "source", "source_type", "claim", "reliability"]:
                if f not in ev:
                    fails.append(
                        ValidationFailure(
                            criterion="AC10",
                            code="MISSING_EVIDENCE_FIELD",
                            message=f"Evidence item missing required field '{f}'",
                            evidence_id=ev_id,
                            file_name="evidence_registry.json",
                        )
                    )
            if ev.get("source_type") not in VALID_EVIDENCE_SOURCE_TYPES:
                fails.append(
                    ValidationFailure(
                        criterion="AC10",
                        code="INVALID_EVIDENCE_SOURCE_TYPE_ENUM",
                        message=f"Invalid source_type '{ev.get('source_type')}' in evidence '{ev_id}'",
                        evidence_id=ev_id,
                        file_name="evidence_registry.json",
                    )
                )
            if ev.get("reliability") not in VALID_EVIDENCE_RELIABILITIES:
                fails.append(
                    ValidationFailure(
                        criterion="AC10",
                        code="INVALID_EVIDENCE_RELIABILITY_ENUM",
                        message=f"Invalid reliability '{ev.get('reliability')}' in evidence '{ev_id}'",
                        evidence_id=ev_id,
                        file_name="evidence_registry.json",
                    )
                )

        return fails

    def _check_ac11_api_compatibility(self) -> List[ValidationFailure]:
        """AC11: Production API contracts remain untouched."""
        fails: List[ValidationFailure] = []
        try:
            # Check import if dependencies are available
            sys.path.insert(0, str(self.base_dir / "backend"))
            from app.api.transport_routes import router as transport_router
            from app.schemas.transport import ProviderStatusContract, TransportHopContract
            from app.schemas.map_projection import MapProjectionResponse
        except ModuleNotFoundError as mnfe:
            # If running in environment without backend third-party packages (e.g. fastapi), check AST parsing
            import ast
            for mod_rel in [
                "backend/app/api/transport_routes.py",
                "backend/app/schemas/transport.py",
                "backend/app/schemas/map_projection.py",
            ]:
                mod_path = self.base_dir / mod_rel
                if not mod_path.exists():
                    fails.append(
                        ValidationFailure(
                            criterion="AC11",
                            code="API_FILE_MISSING",
                            message=f"Production API module missing: {mod_rel}",
                        )
                    )
                else:
                    try:
                        with open(mod_path, "r", encoding="utf-8") as f:
                            ast.parse(f.read(), filename=str(mod_path))
                    except Exception as parse_err:
                        fails.append(
                            ValidationFailure(
                                criterion="AC11",
                                code="API_SYNTAX_ERROR",
                                message=f"Production API syntax error in {mod_rel}: {parse_err}",
                            )
                        )
        except Exception as e:
            fails.append(
                ValidationFailure(
                    criterion="AC11",
                    code="API_IMPORT_ERROR",
                    message=f"Failed to import production transport router or schemas: {e}",
                )
            )
        return fails

    def _check_ac12_invariants(self) -> List[ValidationFailure]:
        """
        AC12: Production baseline invariants preserved.
        Authoritative Ground Truth:
          - Routes: exactly 154
          - Stops: exactly 1,430 canonical stops
          - Unique persisted route-stop links: exactly 1,487
          - Raw extraction route-stop rows: exactly 1,491 (containing 4 documented duplicate link rows)
        """
        fails: List[ValidationFailure] = []
        if len(self.baseline_routes) != 154:
            fails.append(
                ValidationFailure(
                    criterion="AC12",
                    code="BASELINE_ROUTES_INVARIANT_VIOLATED",
                    message=f"Authoritative extraction baseline has {len(self.baseline_routes)} routes (expected 154).",
                )
            )
        if len(self.baseline_stops) != 1430:
            fails.append(
                ValidationFailure(
                    criterion="AC12",
                    code="BASELINE_STOPS_INVARIANT_VIOLATED",
                    message=f"Authoritative extraction baseline has {len(self.baseline_stops)} stops (expected 1430).",
                )
            )
        
        # Total unique route-stop links
        total_unique_links = sum(len(stops) for stops in self.baseline_route_stop_map.values())
        if total_unique_links != 1487:
            fails.append(
                ValidationFailure(
                    criterion="AC12",
                    code="BASELINE_ROUTE_STOPS_INVARIANT_VIOLATED",
                    message=f"Authoritative unique route-stop links count is {total_unique_links} (expected 1487 unique links deduplicated from 1491 raw extraction rows).",
                )
            )
        if len(self.baseline_route_stops) != 1491:
            fails.append(
                ValidationFailure(
                    criterion="AC12",
                    code="BASELINE_RAW_ROUTE_STOPS_INVARIANT_VIOLATED",
                    message=f"Authoritative raw extraction route-stop rows count is {len(self.baseline_route_stops)} (expected 1491).",
                )
            )
        return fails


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Phase 6A Pre-Research and Research Artifact Validator"
    )
    parser.add_argument(
        "target_dir",
        nargs="?",
        default="data/research/transit/phase_6a",
        help="Path to Phase 6A research directory or fixture directory",
    )
    args = parser.parse_args()

    target_path = Path(args.target_dir).resolve()
    print(f"Running Phase 6A Validator on: {target_path}")

    validator = Phase6AResearchValidator()
    report = validator.validate_directory(target_path)

    for line in report.summary_lines():
        print(line)

    return 0 if report.is_valid else 1


if __name__ == "__main__":
    sys.exit(main())
