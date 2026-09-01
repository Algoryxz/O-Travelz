#!/usr/bin/env python3
"""scripts/audit_destination_images.py — Unified Destination Image Auditor & Shadow Publishability Engine.

O-TRAVELZ Image Track A1 (Step 3).

Audits destination image quality, photographic provenance, local variant coverage,
exact duplicate groups, and evaluates shadow publishability without mutating
production databases, places.json, or frontend visibility.

Generates:
  1. data/images/sources/authentic_image_audit.json (backward-compatible audit)
  2. data/images/sources/publishability_report.json (authoritative shadow report)
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import tempfile
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.storage.manifest import (
    EvidenceClassification,
    ImageManifestItem,
    load_manifest_records,
)

# 30 Official Odisha Districts
OFFICIAL_DISTRICTS: Set[str] = {
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
    "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam",
    "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal",
    "Kendrapara", "Keonjhar", "Khordha", "Koraput", "Malkangiri",
    "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri",
    "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh",
}

DISTRICT_ALIASES: Dict[str, str] = {
    "khurda": "Khordha",
    "bolangir": "Balangir",
    "balasore (baleswar)": "Balasore",
    "baleswar": "Balasore",
    "sonepur": "Subarnapur",
    "kandhamal (phulbani)": "Kandhamal",
    "phulbani": "Kandhamal",
    "angul": "Angul",
    "bhadrak": "Bhadrak",
    "cuttack": "Cuttack",
    "ganjam": "Ganjam",
    "gajapati": "Gajapati",
    "puri": "Puri",
    "sambalpur": "Sambalpur",
}

ODISHA_BOUNDS = {
    "min_lat": 17.8,
    "max_lat": 22.6,
    "min_lon": 81.4,
    "max_lon": 87.5,
}

REQUIRED_VARIANTS = ["original", "hero", "card", "thumbnail"]


def normalize_district(district: Optional[str]) -> Optional[str]:
    """Normalize district name using official names and known aliases."""
    if not district:
        return None
    d_clean = district.strip()
    if d_clean in OFFICIAL_DISTRICTS:
        return d_clean
    lower = d_clean.lower()
    if lower in DISTRICT_ALIASES:
        return DISTRICT_ALIASES[lower]
    for official in OFFICIAL_DISTRICTS:
        if official.lower() == lower:
            return official
    return d_clean


@dataclass
class ImageAuditEntry:
    place_id: str
    research_id: Optional[str]
    place_name: str
    district: Optional[str]
    category: Optional[str]
    status: str  # "AUTHENTIC_VERIFIED" | "NEEDS_MANUAL_SOURCE" | canonical classification
    classification: str
    final_image_url: Optional[str]
    source_type: Optional[str]
    verification_notes: str
    confidence: Optional[str]
    has_manifest_entry: bool = False
    has_local_asset_dir: bool = False
    variants_present: List[str] = field(default_factory=list)
    all_variants_present: bool = False
    has_exact_verified_image: bool = False
    audit_reasons: List[str] = field(default_factory=list)


@dataclass
class PublishabilityDecision:
    place_id: str
    name: str
    district: Optional[str]
    category: Optional[str]
    shadow_publishable: bool
    reason_codes: List[str]
    reason_details: List[str]
    classification: str
    has_exact_verified_image: bool
    all_variants_present: bool


class DestinationImageAuditor:
    """Comprehensive Destination Image Auditor and Shadow Publishability Engine."""

    def __init__(
        self,
        places_path: Optional[Path] = None,
        manifest_path: Optional[Path] = None,
        strict_registry_path: Optional[Path] = None,
        storage_dir: Optional[Path] = None,
        categories_path: Optional[Path] = None,
        candidates_dirs: Optional[List[Path]] = None,
        output_audit_path: Optional[Path] = None,
        output_publishability_path: Optional[Path] = None,
    ):
        self.repo_root = REPO_ROOT
        self.places_path = places_path or (self.repo_root / "data" / "places" / "places.json")
        self.manifest_path = manifest_path or (self.repo_root / "data" / "images" / "sources" / "manifest.json")
        self.strict_registry_path = strict_registry_path or (
            self.repo_root / "data" / "images" / "sources" / "strict_photo_evidence_registry.json"
        )
        self.storage_dir = storage_dir or (self.repo_root / "data" / "images")
        self.places_images_dir = self.storage_dir / "places"
        self.categories_path = categories_path or (self.repo_root / "data" / "places" / "categories.json")

        self.candidates_dirs = candidates_dirs or [
            self.repo_root / "data" / "research" / "round2" / "southern",
            self.repo_root / "data" / "research" / "round2" / "western",
            self.repo_root / "data" / "research" / "round2" / "eastern",
            self.repo_root / "data" / "research" / "round2" / "northern",
        ]

        self.output_audit_path = output_audit_path or (
            self.repo_root / "data" / "images" / "sources" / "authentic_image_audit.json"
        )
        self.output_publishability_path = output_publishability_path or (
            self.repo_root / "data" / "images" / "sources" / "publishability_report.json"
        )

        # Loaded In-Memory Datasets
        self.places: List[Dict[str, Any]] = []
        self.manifest_items: List[ImageManifestItem] = []
        self.strict_registry_map: Dict[str, Dict[str, Any]] = {}
        self.approved_categories: Set[str] = set()
        self.regional_candidates: Dict[str, List[Dict[str, Any]]] = {}

    def load_data(self) -> None:
        """Load all authoritative datasets in read-only mode."""
        # 1. Load places.json
        if self.places_path.exists():
            with open(self.places_path, "r", encoding="utf-8") as f:
                self.places = json.load(f)

        # 2. Load manifest.json
        if self.manifest_path.exists():
            self.manifest_items = load_manifest_records(self.manifest_path)

        # 3. Load strict evidence registry
        if self.strict_registry_path.exists():
            with open(self.strict_registry_path, "r", encoding="utf-8") as f:
                reg_list = json.load(f)
                for item in reg_list:
                    rid = item.get("research_id") or item.get("place_id")
                    if rid:
                        self.strict_registry_map[rid] = item

        # 4. Load approved categories
        if self.categories_path.exists():
            with open(self.categories_path, "r", encoding="utf-8") as f:
                cat_list = json.load(f)
                for c in cat_list:
                    self.approved_categories.add(c.get("id", "").lower())
                    self.approved_categories.add(c.get("name", "").lower())

        # Also add common category taxonomy items from candidate schema
        self.approved_categories.update({
            "temple", "monument", "museum", "market", "park", "lake", "beach",
            "nature", "waterfall", "wildlife", "planetarium", "sports_venue",
            "science_center", "hospital", "emergency_facility", "transit_hub",
            "heritage", "cultural", "tribal", "pilgrimage", "adventure", "food", "other"
        })

        # 5. Load regional research candidates
        for c_dir in self.candidates_dirs:
            c_file = c_dir / "candidates.json"
            region_name = c_dir.name
            if c_file.exists():
                try:
                    with open(c_file, "r", encoding="utf-8") as f:
                        self.regional_candidates[region_name] = json.load(f)
                except Exception:
                    self.regional_candidates[region_name] = []
            else:
                self.regional_candidates[region_name] = []

    def get_local_variants_for_place(self, place_id: str) -> Tuple[bool, List[str], Optional[str]]:
        """Inspect on-disk variants under data/images/places/<place_id>/<asset_hash>/."""
        place_dir = self.places_images_dir / place_id
        if not place_dir.exists() or not place_dir.is_dir():
            return False, [], None

        # Find first subfolder containing variants
        for sub in sorted(place_dir.iterdir()):
            if sub.is_dir():
                found_variants = []
                for v in REQUIRED_VARIANTS:
                    if (sub / f"{v}.webp").is_file():
                        found_variants.append(v)
                if found_variants:
                    return True, found_variants, sub.name

        return True, [], None

    def run_full_audit(self) -> Tuple[List[ImageAuditEntry], Dict[str, Any]]:
        """Execute comprehensive image audit and shadow publishability evaluation."""
        self.load_data()

        # Build Lookups
        manifest_by_place = {m.place_id: m for m in self.manifest_items}
        places_by_id = {p.get("id"): p for p in self.places}

        # SHA-256 group index for duplicate analysis
        sha_to_places: Dict[str, Set[str]] = defaultdict(set)
        for m in self.manifest_items:
            if m.content_sha256:
                sha_to_places[m.content_sha256].add(m.place_id)

        # Integrity findings
        orphan_dirs: List[str] = []
        if self.places_images_dir.exists():
            for p_dir in self.places_images_dir.iterdir():
                if p_dir.is_dir() and p_dir.name not in places_by_id and not p_dir.name.startswith("place_"):
                    orphan_dirs.append(p_dir.name)

        manifest_nonexistent_places: List[str] = []
        for m in self.manifest_items:
            if m.place_id not in places_by_id:
                manifest_nonexistent_places.append(m.place_id)

        duplicate_sha_groups = {
            sha: sorted(list(p_set)) for sha, p_set in sha_to_places.items() if len(p_set) > 1
        }
        cross_place_duplicates = duplicate_sha_groups

        audit_entries: List[ImageAuditEntry] = []
        publishability_decisions: List[PublishabilityDecision] = []

        # Metric Counters
        classification_counts = defaultdict(int)
        blocker_counts = defaultdict(int)
        district_metrics: Dict[str, Dict[str, int]] = defaultdict(lambda: {
            "total_places": 0,
            "publishable_places": 0,
            "exact_image_places": 0,
            "missing_image_places": 0,
        })

        # Process Every Production Place
        for place in sorted(self.places, key=lambda x: str(x.get("id", ""))):
            place_id = str(place.get("id", ""))
            place_name = str(place.get("name", "")).strip()
            district = normalize_district(place.get("district"))
            category = str(place.get("category", "")).strip().lower()
            lat = place.get("lat")
            lon = place.get("lon")
            description = str(place.get("description") or "").strip()
            source = place.get("source") or place.get("primary_source_url")

            # Local asset scan
            has_local_dir, found_variants, asset_hash = self.get_local_variants_for_place(place_id)
            all_variants_present = all(v in found_variants for v in REQUIRED_VARIANTS)

            # Manifest entry check
            manifest_entry = manifest_by_place.get(place_id)
            has_manifest = manifest_entry is not None

            # Strict evidence registry link
            strict_evidence = self.strict_registry_map.get(place_id)

            # Determine Effective Classification
            if strict_evidence:
                raw_classif = strict_evidence.get("classification") or strict_evidence.get("verification_status")
                effective_classification = EvidenceClassification.normalize(raw_classif).value
            elif manifest_entry:
                effective_classification = EvidenceClassification.normalize(manifest_entry.verification_status).value
            else:
                effective_classification = "NO_IMAGE"

            classification_counts[effective_classification] += 1

            has_exact_verified_image = (
                effective_classification == EvidenceClassification.EXACT_LOCATION_VERIFIED.value
            )

            # Audit reason codes / findings
            audit_reasons = []
            if not has_manifest:
                audit_reasons.append("NO_IMAGE_MANIFEST")
            if not has_local_dir:
                audit_reasons.append("NO_LOCAL_ASSETS")
            if not all_variants_present:
                for v in REQUIRED_VARIANTS:
                    if v not in found_variants:
                        audit_reasons.append(f"MISSING_{v.upper()}_VARIANT")
            if not has_exact_verified_image:
                audit_reasons.append(f"IMAGE_{effective_classification}")

            # Legacy compatibility status
            if has_exact_verified_image and all_variants_present and has_manifest:
                legacy_status = "AUTHENTIC_VERIFIED"
                final_image_url = manifest_entry.download_url or f"/static/images/places/{place_id}/{asset_hash}/hero.webp"
                source_type = manifest_entry.source_name
                notes = f"Verified authentic photography ({manifest_entry.license})."
                confidence = "high"
            else:
                legacy_status = "NEEDS_MANUAL_SOURCE"
                final_image_url = None
                source_type = None
                notes = f"Audit status: {effective_classification}. Missing criteria: {', '.join(audit_reasons) if audit_reasons else 'None'}."
                confidence = None

            audit_entry = ImageAuditEntry(
                place_id=place_id,
                research_id=place_id,
                place_name=place_name,
                district=district,
                category=category,
                status=legacy_status,
                classification=effective_classification,
                final_image_url=final_image_url,
                source_type=source_type,
                verification_notes=notes,
                confidence=confidence,
                has_manifest_entry=has_manifest,
                has_local_asset_dir=has_local_dir,
                variants_present=found_variants,
                all_variants_present=all_variants_present,
                has_exact_verified_image=has_exact_verified_image,
                audit_reasons=audit_reasons,
            )
            audit_entries.append(audit_entry)

            # -------------------------------------------------------------
            # Evaluate 8 Authoritative Publishability Gate Criteria
            # -------------------------------------------------------------
            reason_codes: List[str] = []
            reason_details: List[str] = []

            # 1. Canonical Name
            if not place_name:
                reason_codes.append("MISSING_CANONICAL_NAME")
                reason_details.append("Destination name is empty or missing.")

            # 2. Coordinates Present
            if lat is None or lon is None:
                reason_codes.append("MISSING_COORDINATES")
                reason_details.append("Coordinates (lat/lon) are null or missing.")
            else:
                # 3. Odisha Geographic Bounding Box
                try:
                    lat_f = float(lat)
                    lon_f = float(lon)
                    if not (ODISHA_BOUNDS["min_lat"] <= lat_f <= ODISHA_BOUNDS["max_lat"] and
                            ODISHA_BOUNDS["min_lon"] <= lon_f <= ODISHA_BOUNDS["max_lon"]):
                        reason_codes.append("OUTSIDE_ODISHA_BOUNDS")
                        reason_details.append(
                            f"Coordinates ({lat_f}, {lon_f}) are outside Odisha bounds "
                            f"[{ODISHA_BOUNDS['min_lat']}–{ODISHA_BOUNDS['max_lat']}°N, {ODISHA_BOUNDS['min_lon']}–{ODISHA_BOUNDS['max_lon']}°E]."
                        )
                except (ValueError, TypeError):
                    reason_codes.append("INVALID_COORDINATES")
                    reason_details.append(f"Coordinates ({lat}, {lon}) could not be parsed as valid floats.")

            # 4. District Validity
            if not district or district not in OFFICIAL_DISTRICTS:
                reason_codes.append("INVALID_DISTRICT")
                reason_details.append(f"District '{place.get('district')}' is not one of the 30 official Odisha districts.")

            # 5. Category Validity
            if not category or category not in self.approved_categories:
                reason_codes.append("INVALID_CATEGORY")
                reason_details.append(f"Category '{category}' is not in approved destination taxonomy.")

            # 6. Description Minimum Length (>= 50 chars)
            if len(description) < 50:
                reason_codes.append("DESCRIPTION_TOO_SHORT")
                reason_details.append(f"Description length ({len(description)} chars) is below required minimum of 50 characters.")

            # 7. Destination Provenance / Source
            if not source or not str(source).strip():
                reason_codes.append("MISSING_DESTINATION_PROVENANCE")
                reason_details.append("Destination provenance source URL or official document reference is missing.")

            # 8. Photographic Quality & Exact Evidence Gate
            if not has_manifest:
                reason_codes.append("NO_IMAGE_MANIFEST")
                reason_details.append("No entry exists in destination image manifest (data/images/sources/manifest.json).")
            else:
                if not has_exact_verified_image:
                    reason_codes.append("NO_EXACT_VERIFIED_IMAGE")
                    reason_details.append(
                        f"Image classification is '{effective_classification}', not 'EXACT_LOCATION_VERIFIED'."
                    )
                if not manifest_entry.license or not manifest_entry.attribution:
                    reason_codes.append("MISSING_IMAGE_PROVENANCE")
                    reason_details.append("Image license or attribution statement is incomplete.")

            if not has_local_dir:
                reason_codes.append("NO_LOCAL_ASSETS")
                reason_details.append(f"No local asset directory found under data/images/places/{place_id}/.")
            elif not all_variants_present:
                for v in REQUIRED_VARIANTS:
                    if v not in found_variants:
                        reason_codes.append(f"MISSING_{v.upper()}_VARIANT")
                        reason_details.append(f"Standardized variant '{v}.webp' is missing on disk.")

            # Duplicate review flag
            if manifest_entry and manifest_entry.content_sha256 in cross_place_duplicates:
                other_places = [p for p in sha_to_places[manifest_entry.content_sha256] if p != place_id]
                if other_places:
                    reason_codes.append("CROSS_PLACE_DUPLICATE_REVIEW")
                    reason_details.append(f"Exact image SHA-256 is shared with other destinations: {other_places}.")

            is_publishable = len(reason_codes) == 0
            if is_publishable:
                reason_codes.append("PUBLISHABLE")
                reason_details.append("All 8 publishability gate criteria satisfied.")

            # Track blocker counts
            for rc in reason_codes:
                if rc != "PUBLISHABLE":
                    blocker_counts[rc] += 1

            # Update District Metrics
            d_key = district or "Unspecified"
            district_metrics[d_key]["total_places"] += 1
            if is_publishable:
                district_metrics[d_key]["publishable_places"] += 1
            if has_exact_verified_image:
                district_metrics[d_key]["exact_image_places"] += 1
            else:
                district_metrics[d_key]["missing_image_places"] += 1

            decision = PublishabilityDecision(
                place_id=place_id,
                name=place_name,
                district=district,
                category=category,
                shadow_publishable=is_publishable,
                reason_codes=sorted(reason_codes),
                reason_details=reason_details,
                classification=effective_classification,
                has_exact_verified_image=has_exact_verified_image,
                all_variants_present=all_variants_present,
            )
            publishability_decisions.append(decision)

        # -------------------------------------------------------------
        # Regional Research Candidate Summary
        # -------------------------------------------------------------
        regional_candidate_summary: Dict[str, Any] = {}
        for reg_name, c_list in sorted(self.regional_candidates.items()):
            total_cand = len(c_list)
            with_img = sum(1 for c in c_list if c.get("image_source_url"))
            verified_leads = 0
            for c in c_list:
                cid = c.get("research_id") or c.get("id")
                strict_c = self.strict_registry_map.get(cid)
                if strict_c and strict_c.get("classification") == "exact_location_verified":
                    verified_leads += 1
                elif c.get("image_status") == "verified" and c.get("coordinate_verification_status") in ("verified", "cross_checked"):
                    verified_leads += 1
            review_leads = with_img - verified_leads
            regional_candidate_summary[reg_name] = {
                "total_candidates": total_cand,
                "candidates_with_images": with_img,
                "exact_verified_leads": verified_leads,
                "review_required_leads": review_leads,
            }

        # -------------------------------------------------------------
        # Compile Authoritative Shadow Publishability Report
        # -------------------------------------------------------------
        total_production = len(self.places)
        publishable_count = sum(1 for d in publishability_decisions if d.shadow_publishable)
        blocked_count = total_production - publishable_count
        manifest_cov = sum(1 for a in audit_entries if a.has_manifest_entry)
        local_cov = sum(1 for a in audit_entries if a.has_local_asset_dir)
        all_var_cov = sum(1 for a in audit_entries if a.all_variants_present)
        exact_img_cov = sum(1 for a in audit_entries if a.has_exact_verified_image)

        report_payload = {
            "generation_timestamp": datetime.now(timezone.utc).isoformat(),
            "shadow_mode": True,
            "policy": {
                "hard_rule": "NO VERIFIED IMAGE = NO PUBLIC DESTINATION",
                "min_description_length": 50,
                "lat_bounds": [ODISHA_BOUNDS["min_lat"], ODISHA_BOUNDS["max_lat"]],
                "lon_bounds": [ODISHA_BOUNDS["min_lon"], ODISHA_BOUNDS["max_lon"]],
                "required_variants": REQUIRED_VARIANTS,
                "allowed_districts_count": len(OFFICIAL_DISTRICTS),
            },
            "summary": {
                "total_production_destinations": total_production,
                "shadow_publishable_count": publishable_count,
                "shadow_blocked_count": blocked_count,
                "shadow_publishable_percentage": round((publishable_count / total_production * 100), 2) if total_production else 0.0,
                "manifest_coverage_count": manifest_cov,
                "local_asset_coverage_count": local_cov,
                "all_variants_coverage_count": all_var_cov,
                "exact_verified_image_count": exact_img_cov,
                "destinations_missing_exact_image": total_production - exact_img_cov,
                "blocker_counts": dict(sorted(blocker_counts.items(), key=lambda x: -x[1])),
            },
            "classification_summary": dict(sorted(classification_counts.items())),
            "district_summary": dict(sorted(district_metrics.items())),
            "regional_candidates_summary": regional_candidate_summary,
            "integrity_findings": {
                "orphan_image_directories": sorted(orphan_dirs),
                "manifest_nonexistent_places": sorted(manifest_nonexistent_places),
                "cross_place_duplicate_groups": cross_place_duplicates,
            },
            "decisions": [asdict(d) for d in publishability_decisions],
        }

        return audit_entries, report_payload

    def save_reports(self, audit_entries: List[ImageAuditEntry], report_payload: Dict[str, Any]) -> None:
        """Atomically persist both report outputs to disk."""
        # 1. authentic_image_audit.json
        legacy_list = []
        for e in audit_entries:
            legacy_list.append({
                "place_id": e.place_id,
                "research_id": e.research_id,
                "place_name": e.place_name,
                "district": e.district,
                "category": e.category,
                "status": e.status,
                "classification": e.classification,
                "final_image_url": e.final_image_url,
                "source_type": e.source_type,
                "verification_notes": e.verification_notes,
                "confidence": e.confidence,
                "all_variants_present": e.all_variants_present,
                "has_exact_verified_image": e.has_exact_verified_image,
                "audit_reasons": e.audit_reasons,
            })

        self.output_audit_path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile("w", dir=self.output_audit_path.parent, delete=False, encoding="utf-8") as tf:
            json.dump(legacy_list, tf, indent=2, ensure_ascii=False)
            tf.write("\n")
            temp_name = tf.name
        os.replace(temp_name, self.output_audit_path)

        # 2. publishability_report.json
        self.output_publishability_path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile("w", dir=self.output_publishability_path.parent, delete=False, encoding="utf-8") as tf:
            json.dump(report_payload, tf, indent=2, ensure_ascii=False)
            tf.write("\n")
            temp_name = tf.name
        os.replace(temp_name, self.output_publishability_path)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="O-TRAVELZ Destination Image Auditor & Shadow Publishability Engine."
    )
    parser.add_argument("--places-file", type=Path, help="Path to places.json")
    parser.add_argument("--manifest-file", type=Path, help="Path to manifest.json")
    parser.add_argument("--evidence-file", type=Path, help="Path to strict_photo_evidence_registry.json")
    parser.add_argument("--storage-dir", type=Path, help="Path to data/images")
    parser.add_argument("--output-audit", type=Path, help="Path to authentic_image_audit.json")
    parser.add_argument("--output-publishability", type=Path, help="Path to publishability_report.json")
    parser.add_argument("--check-only", action="store_true", help="Perform audit in-memory without writing report files")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    auditor = DestinationImageAuditor(
        places_path=args.places_file,
        manifest_path=args.manifest_file,
        strict_registry_path=args.evidence_file,
        storage_dir=args.storage_dir,
        output_audit_path=args.output_audit,
        output_publishability_path=args.output_publishability,
    )

    audit_entries, report_payload = auditor.run_full_audit()

    if not args.check_only:
        auditor.save_reports(audit_entries, report_payload)

    summary = report_payload["summary"]
    print("\n" + "=" * 65)
    print("      O-TRAVELZ DESTINATION IMAGE & PUBLISHABILITY AUDIT")
    print("=" * 65)
    print(f"Total Production Destinations : {summary['total_production_destinations']}")
    print(f"Shadow Publishable (Eligible) : {summary['shadow_publishable_count']} ({summary['shadow_publishable_percentage']}%)")
    print(f"Shadow Blocked (Ineligible)   : {summary['shadow_blocked_count']}")
    print(f"Manifest Coverage             : {summary['manifest_coverage_count']}")
    print(f"Local Asset Directory Coverage: {summary['local_asset_coverage_count']}")
    print(f"All 4 Variants Present        : {summary['all_variants_coverage_count']}")
    print(f"Exact Verified Images         : {summary['exact_verified_image_count']}")
    print(f"Missing Exact Verified Images : {summary['destinations_missing_exact_image']}")
    print("-" * 65)
    print("Top Publishability Blockers:")
    for code, count in list(summary["blocker_counts"].items())[:8]:
        print(f"  {code:<30} : {count} destinations")
    print("=" * 65 + "\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
