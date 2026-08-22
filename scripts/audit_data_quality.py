"""Reusable dataset quality, provenance, and geographic validation auditor.

Audits canonical place, category, and interest data against O-Travelz data contracts.
Executable from repository root:

    python scripts/audit_data_quality.py
    python scripts/audit_data_quality.py --json
    python scripts/audit_data_quality.py --data-dir data/places

Exit Codes:
    0: Zero FAIL findings (WARNINGS may be present).
    1: One or more FAIL findings encountered.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from collections import defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

# Resolve backend imports
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from app.core.regions import ODISHA_DISTRICTS, validate_district
except ImportError:
    ODISHA_DISTRICTS = frozenset({
        "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
        "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur",
        "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar",
        "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
        "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
    })

    def validate_district(d: str | None) -> bool:
        return bool(d and d.strip().title() in ODISHA_DISTRICTS)

# Geographic validation envelope for Odisha
ODISHA_LAT_MIN = 17.5
ODISHA_LAT_MAX = 22.8
ODISHA_LON_MIN = 81.2
ODISHA_LON_MAX = 87.6

SUSPICIOUS_PHONE_PATTERNS = re.compile(
    r"^(0{4,}|1{4,}|9{8,}|1234567890|n/?a|none|null|tbd)$", re.IGNORECASE
)


@dataclass(frozen=True)
class Finding:
    level: str  # "FAIL", "WARNING", "PASS"
    section: str  # "IDENTITY", "COORDINATES", "DISTRICTS", "CATEGORIES", "INTERESTS", "PROVENANCE", "RATINGS", "HOURS", "MEDICAL", "TRANSIT"
    message: str
    item_id: str | None = None


@dataclass
class AuditReport:
    timestamp: str
    data_dir: str
    total_places: int
    total_categories: int
    total_interests: int
    districts_represented_count: int
    total_districts_count: int
    represented_districts: list[str]
    missing_districts: list[str]
    places_per_district: dict[str, int]
    pass_count: int
    warning_count: int
    fail_count: int
    findings: list[Finding]

    @property
    def is_clean(self) -> bool:
        return self.fail_count == 0


class DataQualityAuditor:
    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir
        self.findings: list[Finding] = []
        self.places: list[dict[str, Any]] = []
        self.categories: list[dict[str, Any]] = []
        self.interests: list[dict[str, Any]] = []
        self.category_ids: set[str] = set()
        self.interest_ids: set[str] = set()
        self.places_per_district: dict[str, int] = defaultdict(int)

    def _add_finding(self, level: str, section: str, message: str, item_id: str | None = None) -> None:
        self.findings.append(Finding(level=level, section=section, message=message, item_id=item_id))

    def load_files(self) -> bool:
        """Load JSON files from data directory. Returns False on fatal file loading errors."""
        cat_file = self.data_dir / "categories.json"
        int_file = self.data_dir / "interests.json"
        plc_file = self.data_dir / "places.json"

        for f in (cat_file, int_file, plc_file):
            if not f.exists():
                self._add_finding("FAIL", "IDENTITY", f"Required data file missing: {f.name}")
                return False

        try:
            self.categories = json.loads(cat_file.read_text(encoding="utf-8"))
            if not isinstance(self.categories, list):
                self._add_finding("FAIL", "CATEGORIES", "categories.json must contain a JSON list")
                return False
            self.category_ids = {c.get("id") for c in self.categories if isinstance(c, dict) and c.get("id")}
        except Exception as e:
            self._add_finding("FAIL", "CATEGORIES", f"Failed to parse categories.json: {e}")
            return False

        try:
            self.interests = json.loads(int_file.read_text(encoding="utf-8"))
            if not isinstance(self.interests, list):
                self._add_finding("FAIL", "INTERESTS", "interests.json must contain a JSON list")
                return False
            self.interest_ids = {i.get("id") for i in self.interests if isinstance(i, dict) and i.get("id")}
        except Exception as e:
            self._add_finding("FAIL", "INTERESTS", f"Failed to parse interests.json: {e}")
            return False

        try:
            self.places = json.loads(plc_file.read_text(encoding="utf-8"))
            if not isinstance(self.places, list):
                self._add_finding("FAIL", "IDENTITY", "places.json must contain a JSON list")
                return False
        except Exception as e:
            self._add_finding("FAIL", "IDENTITY", f"Failed to parse places.json: {e}")
            return False

        return True

    def audit_categories_and_interests(self) -> None:
        """Audit category and interest definitions."""
        # Category uniqueness
        seen_cat_ids: set[str] = set()
        for c in self.categories:
            cat_id = c.get("id")
            if not cat_id:
                self._add_finding("FAIL", "CATEGORIES", "Category definition missing 'id'")
                continue
            if cat_id in seen_cat_ids:
                self._add_finding("FAIL", "CATEGORIES", f"Duplicate category id: {cat_id}")
            seen_cat_ids.add(cat_id)

        # Interest uniqueness
        seen_int_ids: set[str] = set()
        for i in self.interests:
            int_id = i.get("id")
            if not int_id:
                self._add_finding("FAIL", "INTERESTS", "Interest definition missing 'id'")
                continue
            if int_id in seen_int_ids:
                self._add_finding("FAIL", "INTERESTS", f"Duplicate interest id: {int_id}")
            seen_int_ids.add(int_id)

    def audit_places(self) -> None:
        """Run comprehensive audit on all place records."""
        seen_place_ids: set[str] = set()
        seen_names_by_district: dict[str, set[str]] = defaultdict(set)
        seen_canonical_identities: set[tuple[str, str, str]] = set()
        seen_coordinates: dict[tuple[float, float], list[str]] = defaultdict(list)

        for idx, place in enumerate(self.places):
            item_id = place.get("id") or f"index_{idx}"
            name = place.get("name")
            category = place.get("category")
            district = place.get("district")
            source = place.get("source")
            lat = place.get("lat")
            lon = place.get("lon")

            # ----------------------------------------------------
            # A. Identity & Uniqueness
            # ----------------------------------------------------
            if not item_id:
                self._add_finding("FAIL", "IDENTITY", f"Place at index {idx} is missing 'id'", item_id)
            elif item_id in seen_place_ids:
                self._add_finding("FAIL", "IDENTITY", f"Duplicate place id: {item_id}", item_id)
            else:
                seen_place_ids.add(item_id)

            if not name or not isinstance(name, str) or not name.strip():
                self._add_finding("FAIL", "IDENTITY", "Place is missing a non-empty name", item_id)
                name = "UNKNOWN_NAME"
            elif "replace me" in name.lower():
                self._add_finding("FAIL", "IDENTITY", f"Placeholder name detected: {name!r}", item_id)

            desc = place.get("description")
            if desc is None or not isinstance(desc, str) or not desc.strip():
                self._add_finding("WARNING", "IDENTITY", f"Place {name!r} has empty description", item_id)

            # ----------------------------------------------------
            # B. District Validation
            # ----------------------------------------------------
            if not district:
                self._add_finding("FAIL", "DISTRICTS", f"Place {name!r} is missing district", item_id)
            elif not validate_district(district):
                self._add_finding(
                    "FAIL",
                    "DISTRICTS",
                    f"Place {name!r} has invalid district: {district!r}",
                    item_id,
                )
            else:
                norm_district = district.strip().title()
                self.places_per_district[norm_district] += 1

                # Duplicate name within same district check
                norm_name = name.strip().casefold()
                if norm_name in seen_names_by_district[norm_district]:
                    self._add_finding(
                        "FAIL",
                        "IDENTITY",
                        f"Duplicate place name {name!r} within district {norm_district}",
                        item_id,
                    )
                seen_names_by_district[norm_district].add(norm_name)

            # Canonical identity check: (name, category, source)
            if name and category and source:
                ident = (name.strip().casefold(), category.strip().casefold(), source.strip())
                if ident in seen_canonical_identities:
                    self._add_finding(
                        "FAIL",
                        "IDENTITY",
                        f"Duplicate canonical identity (name, category, source): {name!r}",
                        item_id,
                    )
                seen_canonical_identities.add(ident)

            # ----------------------------------------------------
            # C. Category Validation
            # ----------------------------------------------------
            if not category:
                self._add_finding("FAIL", "CATEGORIES", f"Place {name!r} is missing category", item_id)
            elif category not in self.category_ids:
                self._add_finding(
                    "FAIL",
                    "CATEGORIES",
                    f"Place {name!r} has unknown category: {category!r}",
                    item_id,
                )

            # ----------------------------------------------------
            # D. Interests Validation
            # ----------------------------------------------------
            interests = place.get("interests", [])
            if interests is not None:
                if not isinstance(interests, list):
                    self._add_finding("FAIL", "INTERESTS", f"Place {name!r} interests must be a list", item_id)
                else:
                    seen_place_interests: set[str] = set()
                    for interest_item in interests:
                        if not isinstance(interest_item, str) or not interest_item.strip():
                            self._add_finding("FAIL", "INTERESTS", f"Place {name!r} has invalid empty interest", item_id)
                            continue
                        norm_interest = interest_item.strip()
                        if norm_interest in seen_place_interests:
                            self._add_finding(
                                "FAIL",
                                "INTERESTS",
                                f"Place {name!r} has duplicate interest: {norm_interest!r}",
                                item_id,
                            )
                        seen_place_interests.add(norm_interest)
                        if norm_interest not in self.interest_ids:
                            self._add_finding(
                                "FAIL",
                                "INTERESTS",
                                f"Place {name!r} references unknown interest: {norm_interest!r}",
                                item_id,
                            )

            # ----------------------------------------------------
            # E. Coordinates & Geographic Envelope
            # ----------------------------------------------------
            if (lat is None) != (lon is None):
                self._add_finding("FAIL", "COORDINATES", f"Place {name!r} must have both lat and lon or neither", item_id)
            elif lat is not None and lon is not None:
                if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
                    self._add_finding("FAIL", "COORDINATES", f"Place {name!r} has non-numeric coordinates", item_id)
                elif not math.isfinite(float(lat)) or not math.isfinite(float(lon)):
                    self._add_finding("FAIL", "COORDINATES", f"Place {name!r} has non-finite coordinates", item_id)
                else:
                    f_lat = float(lat)
                    f_lon = float(lon)

                    # Swapped coordinate detection: lat in lon range and lon in lat range
                    if (80.0 <= f_lat <= 90.0) and (16.0 <= f_lon <= 25.0):
                        self._add_finding(
                            "FAIL",
                            "COORDINATES",
                            f"Place {name!r} has obviously swapped lat/lon ({f_lat}, {f_lon})",
                            item_id,
                        )
                    # Envelope validation
                    elif not (ODISHA_LAT_MIN <= f_lat <= ODISHA_LAT_MAX and ODISHA_LON_MIN <= f_lon <= ODISHA_LON_MAX):
                        self._add_finding(
                            "FAIL",
                            "COORDINATES",
                            f"Place {name!r} coordinates ({f_lat}, {f_lon}) outside Odisha envelope "
                            f"[{ODISHA_LAT_MIN}-{ODISHA_LAT_MAX}, {ODISHA_LON_MIN}-{ODISHA_LON_MAX}]",
                            item_id,
                        )

                    coord_key = (round(f_lat, 4), round(f_lon, 4))
                    seen_coordinates[coord_key].append(name)

            # ----------------------------------------------------
            # F. Provenance & Verification
            # ----------------------------------------------------
            if not source or not isinstance(source, str) or not source.strip():
                self._add_finding("FAIL", "PROVENANCE", f"Place {name!r} is missing source provenance", item_id)
            elif source.upper() == "REQUIRED" or source.upper().startswith("REQUIRED:"):
                self._add_finding("FAIL", "PROVENANCE", f"Place {name!r} has placeholder source: {source!r}", item_id)

            status = place.get("verification_status")
            if status is not None:
                if status not in ("VERIFIED", "UNVERIFIED", "UNAVAILABLE"):
                    self._add_finding(
                        "FAIL",
                        "PROVENANCE",
                        f"Place {name!r} has invalid verification_status: {status!r}",
                        item_id,
                    )

            verified_at = place.get("verified_at")
            if verified_at is not None:
                if not isinstance(verified_at, str):
                    self._add_finding("FAIL", "PROVENANCE", f"Place {name!r} verified_at must be an ISO string", item_id)
                else:
                    try:
                        datetime.fromisoformat(verified_at.replace("Z", "+00:00"))
                    except ValueError:
                        self._add_finding("FAIL", "PROVENANCE", f"Place {name!r} has invalid verified_at ISO date", item_id)
            else:
                self._add_finding("WARNING", "PROVENANCE", f"Place {name!r} has unpopulated verified_at date", item_id)

            source_url = place.get("source_url")
            if source_url is not None:
                if not isinstance(source_url, str) or not (source_url.startswith("http://") or source_url.startswith("https://")):
                    self._add_finding("FAIL", "PROVENANCE", f"Place {name!r} has malformed source_url: {source_url!r}", item_id)

            # ----------------------------------------------------
            # G. Ratings Validation
            # ----------------------------------------------------
            rating = place.get("rating")
            rating_source = place.get("rating_source")
            rating_count = place.get("rating_count")

            if rating is not None:
                if isinstance(rating, bool) or not isinstance(rating, (int, float)) or not math.isfinite(float(rating)) or float(rating) < 0.0 or float(rating) > 5.0:
                    self._add_finding("FAIL", "RATINGS", f"Place {name!r} has invalid rating (must be 0.0-5.0): {rating!r}", item_id)
                elif not rating_source:
                    self._add_finding("WARNING", "RATINGS", f"Place {name!r} has rating {rating} without rating_source", item_id)

            if rating_count is not None:
                if isinstance(rating_count, bool) or not isinstance(rating_count, int) or rating_count < 0:
                    self._add_finding("FAIL", "RATINGS", f"Place {name!r} has invalid rating_count: {rating_count!r}", item_id)

            # ----------------------------------------------------
            # H. Opening Hours Validation
            # ----------------------------------------------------
            opening_hours = place.get("opening_hours")
            hours_source = place.get("opening_hours_source")

            if opening_hours is not None:
                if not isinstance(opening_hours, (dict, list, str)):
                    self._add_finding("FAIL", "HOURS", f"Place {name!r} has malformed opening_hours JSON", item_id)
                elif not hours_source:
                    self._add_finding("WARNING", "HOURS", f"Place {name!r} has opening_hours without opening_hours_source", item_id)

            # ----------------------------------------------------
            # I. Medical Facility Strict Validation
            # ----------------------------------------------------
            if category in ("hospital", "emergency_facility"):
                if lat is None or lon is None:
                    self._add_finding("FAIL", "MEDICAL", f"Medical facility {name!r} must have valid coordinates", item_id)
                if not place.get("address"):
                    self._add_finding("WARNING", "MEDICAL", f"Medical facility {name!r} is missing street address", item_id)

                emer_phone = place.get("emergency_phone")
                if emer_phone is not None:
                    if not isinstance(emer_phone, str) or SUSPICIOUS_PHONE_PATTERNS.match(emer_phone.strip()):
                        self._add_finding("FAIL", "MEDICAL", f"Medical facility {name!r} has suspicious/synthetic emergency phone: {emer_phone!r}", item_id)

            # ----------------------------------------------------
            # J. Transit Hub Strict Validation
            # ----------------------------------------------------
            if category == "transit_hub":
                if lat is None or lon is None:
                    self._add_finding("FAIL", "TRANSIT", f"Transit hub {name!r} must have valid coordinates", item_id)
                if not district:
                    self._add_finding("FAIL", "TRANSIT", f"Transit hub {name!r} must specify an administrative district", item_id)

        # Coordinate overlap warnings
        for coord, place_names in seen_coordinates.items():
            if len(place_names) > 1:
                self._add_finding(
                    "WARNING",
                    "COORDINATES",
                    f"Shared coordinates {coord} between: {', '.join(place_names[:3])}",
                )

    def run(self) -> AuditReport:
        """Execute the full audit suite and return structured AuditReport."""
        loaded = self.load_files()
        if loaded:
            self.audit_categories_and_interests()
            self.audit_places()

        represented_districts = sorted(self.places_per_district.keys())
        missing_districts = sorted(list(ODISHA_DISTRICTS - set(represented_districts)))

        pass_count = sum(1 for f in self.findings if f.level == "PASS")
        warning_count = sum(1 for f in self.findings if f.level == "WARNING")
        fail_count = sum(1 for f in self.findings if f.level == "FAIL")

        return AuditReport(
            timestamp=datetime.now().isoformat(),
            data_dir=str(self.data_dir),
            total_places=len(self.places),
            total_categories=len(self.categories),
            total_interests=len(self.interests),
            districts_represented_count=len(represented_districts),
            total_districts_count=len(ODISHA_DISTRICTS),
            represented_districts=represented_districts,
            missing_districts=missing_districts,
            places_per_district=dict(self.places_per_district),
            pass_count=pass_count,
            warning_count=warning_count,
            fail_count=fail_count,
            findings=self.findings,
        )


def print_human_report(report: AuditReport) -> None:
    """Print clean human-readable CLI report."""
    print("=" * 64)
    print("           O-TRAVELZ DATA QUALITY & PROVENANCE AUDIT")
    print("=" * 64)
    print(f"Timestamp : {report.timestamp}")
    print(f"Data Dir  : {report.data_dir}")
    print("-" * 64)
    print("SUMMARY")
    print(f"  FAIL    : {report.fail_count}")
    print(f"  WARNING : {report.warning_count}")
    print(f"  STATUS  : {'PASS (Ready for Ingestion)' if report.is_clean else 'FAIL (Issues Detected)'}")
    print("-" * 64)
    print("DATASET BASELINE")
    print(f"  Total Canonical Places : {report.total_places}")
    print(f"  Physical Categories    : {report.total_categories}")
    print(f"  Thematic Interests     : {report.total_interests}")
    print(
        f"  Districts Represented  : {report.districts_represented_count} / {report.total_districts_count}"
    )
    if report.missing_districts:
        print(f"  Missing Districts (17) : {', '.join(report.missing_districts)}")
    print("-" * 64)
    print("DISTRICT BREAKDOWN")
    for dist, count in sorted(report.places_per_district.items(), key=lambda x: -x[1]):
        print(f"  - {dist:<16} : {count:>2} places")

    if report.fail_count > 0:
        print("-" * 64)
        print(f"FAILURES ({report.fail_count})")
        fail_num = 1
        for f in report.findings:
            if f.level == "FAIL":
                item_prefix = f" [{f.item_id}]" if f.item_id else ""
                print(f"  {fail_num}. [{f.section}]{item_prefix} {f.message}")
                fail_num += 1

    if report.warning_count > 0:
        print("-" * 64)
        print(f"WARNINGS ({report.warning_count})")
        warn_num = 1
        for f in report.findings:
            if f.level == "WARNING":
                item_prefix = f" [{f.item_id}]" if f.item_id else ""
                print(f"  {warn_num}. [{f.section}]{item_prefix} {f.message}")
                warn_num += 1

    print("=" * 64)


def main() -> int:
    parser = argparse.ArgumentParser(description="O-Travelz Dataset Quality & Provenance Auditor")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=ROOT_DIR / "data" / "places",
        help="Path to directory containing places.json, categories.json, interests.json",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output machine-readable JSON format",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat warnings as failures",
    )
    args = parser.parse_args()

    auditor = DataQualityAuditor(args.data_dir)
    report = auditor.run()

    if args.json:
        # Convert findings dataclasses to dict
        report_dict = asdict(report)
        print(json.dumps(report_dict, indent=2))
    else:
        print_human_report(report)

    if args.strict and report.warning_count > 0:
        return 1

    return 0 if report.is_clean else 1


if __name__ == "__main__":
    sys.exit(main())
