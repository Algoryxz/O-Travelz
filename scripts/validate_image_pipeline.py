#!/usr/bin/env python3
"""scripts/validate_image_pipeline.py — Canonical Image Pipeline Integrity Validator.

O-TRAVELZ Image Track A1 (Step 4).

Independently validates structural, cryptographic, dimensional, and metadata integrity
of the canonical destination image system without modifying production records or images.

Distinguishes between:
  - ERROR: Fatal corruption, missing required variants of manifest assets, SHA mismatches,
           nonexistent place IDs, duplicate conflicting records. (Fails CI)
  - WARNING: Known legacy debt / unmanifested production asset directories. (Informational)
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.storage.manifest import (
    EvidenceClassification,
    ImageManifestItem,
    VariantMetadata,
    load_manifest_records,
)
from app.storage.processor import ImageProcessor, ImageProcessingError

# Verified permissive & attribution licenses (from Step 2 policy)
APPROVED_LICENSES: Set[str] = {
    "cc0",
    "public domain",
    "cc by",
    "cc by 2.0",
    "cc by 2.5",
    "cc by 3.0",
    "cc by 4.0",
    "cc by-sa",
    "cc by-sa 2.0",
    "cc by-sa 2.5",
    "cc by-sa 3.0",
    "cc by-sa 4.0",
    "unsplash free license",
}

REQUIRED_VARIANTS = ["original", "hero", "card", "thumbnail"]
SHA256_HEX_PATTERN = re.compile(r"^[0-9a-f]{64}$")


@dataclass
class ValidationIssue:
    level: str  # "ERROR" | "WARNING" | "INFO"
    category: str
    place_id: Optional[str]
    asset_hash: Optional[str]
    message: str


@dataclass
class ValidationReport:
    timestamp: str
    is_valid: bool
    error_count: int
    warning_count: int
    info_count: int
    manifest_summary: Dict[str, Any] = field(default_factory=dict)
    filesystem_summary: Dict[str, Any] = field(default_factory=dict)
    strict_evidence_summary: Dict[str, Any] = field(default_factory=dict)
    issues: List[ValidationIssue] = field(default_factory=list)

    def print_summary(self) -> None:
        print("\n" + "=" * 70)
        print("        O-TRAVELZ CANONICAL IMAGE PIPELINE INTEGRITY REPORT")
        print("=" * 70)
        status_str = "PASSED (0 Integrity Errors)" if self.is_valid else f"FAILED ({self.error_count} Integrity Errors)"
        print(f"Status           : {status_str}")
        print(f"Timestamp        : {self.timestamp}")
        print(f"Total Issues     : {self.error_count} Errors, {self.warning_count} Warnings, {self.info_count} Info")
        print("-" * 70)
        print("Manifest Coverage:")
        for k, v in self.manifest_summary.items():
            print(f"  {k:<32} : {v}")
        print("-" * 70)
        print("Filesystem Reconciliation:")
        for k, v in self.filesystem_summary.items():
            print(f"  {k:<32} : {v}")
        print("-" * 70)
        print("Strict Evidence Registry Reconciliation:")
        for k, v in self.strict_evidence_summary.items():
            print(f"  {k:<32} : {v}")
        print("=" * 70)

        if self.issues:
            print("\nDetailed Issues:")
            for issue in sorted(self.issues, key=lambda x: (0 if x.level == "ERROR" else 1, x.category, x.place_id or "")):
                tag = f"[{issue.level}]"
                target = f"{issue.place_id or 'GLOBAL'}"
                if issue.asset_hash:
                    target += f":{issue.asset_hash}"
                print(f"  {tag:<10} {issue.category:<25} {target:<30} {issue.message}")
            print("\n" + "=" * 70 + "\n")


class ImagePipelineValidator:
    """Independent Structural, Cryptographic, and Storage Pipeline Validator."""

    def __init__(
        self,
        manifest_path: Optional[Path] = None,
        places_path: Optional[Path] = None,
        storage_dir: Optional[Path] = None,
        strict_registry_path: Optional[Path] = None,
        output_report_path: Optional[Path] = None,
    ):
        self.repo_root = REPO_ROOT
        self.manifest_path = manifest_path or (self.repo_root / "data" / "images" / "sources" / "manifest.json")
        self.places_path = places_path or (self.repo_root / "data" / "places" / "places.json")
        self.storage_dir = storage_dir or (self.repo_root / "data" / "images")
        self.places_img_dir = self.storage_dir / "places"
        self.strict_registry_path = strict_registry_path or (
            self.repo_root / "data" / "images" / "sources" / "strict_photo_evidence_registry.json"
        )
        self.output_report_path = output_report_path
        self.processor = ImageProcessor(min_width=100, min_height=100, min_aspect_ratio=0.5, max_aspect_ratio=3.0)

        self.issues: List[ValidationIssue] = []

    def _add_issue(self, level: str, category: str, message: str, place_id: Optional[str] = None, asset_hash: Optional[str] = None) -> None:
        self.issues.append(ValidationIssue(level=level, category=category, place_id=place_id, asset_hash=asset_hash, message=message))

    def run_all_validations(self) -> ValidationReport:
        """Run all structural, storage, cryptographic, and reconciliation checks."""
        self.issues.clear()

        # 1. Load Places
        places_map: Dict[str, Dict[str, Any]] = {}
        if self.places_path.exists():
            try:
                with open(self.places_path, "r", encoding="utf-8") as f:
                    places_list = json.load(f)
                    places_map = {p.get("id"): p for p in places_list if isinstance(p, dict) and "id" in p}
            except Exception as e:
                self._add_issue("ERROR", "PLACES_JSON", f"Failed to parse places.json: {e}")
        else:
            self._add_issue("ERROR", "PLACES_JSON", f"Places file not found: {self.places_path}")

        # 2. Load Manifest Records
        manifest_records: List[ImageManifestItem] = []
        raw_manifest_list: List[Dict[str, Any]] = []
        if self.manifest_path.exists():
            try:
                with open(self.manifest_path, "r", encoding="utf-8") as f:
                    raw_manifest_list = json.load(f)
            except Exception as e:
                self._add_issue("ERROR", "MANIFEST_JSON", f"Failed to parse manifest JSON syntax: {e}")

            if isinstance(raw_manifest_list, list):
                for idx, raw_item in enumerate(raw_manifest_list):
                    try:
                        record = ImageManifestItem.model_validate(raw_item)
                        manifest_records.append(record)
                    except Exception as e:
                        pid = raw_item.get("place_id", f"INDEX_{idx}")
                        self._add_issue("ERROR", "MANIFEST_SCHEMA", f"Record failed ImageManifestItem validation: {e}", place_id=pid)
        else:
            self._add_issue("ERROR", "MANIFEST_JSON", f"Manifest file not found: {self.manifest_path}")

        # 3. Load Strict Evidence Registry
        strict_evidence_map: Dict[str, Dict[str, Any]] = {}
        if self.strict_registry_path.exists():
            try:
                with open(self.strict_registry_path, "r", encoding="utf-8") as f:
                    strict_list = json.load(f)
                    for item in strict_list:
                        rid = item.get("research_id") or item.get("place_id")
                        if rid:
                            strict_evidence_map[rid] = item
            except Exception as e:
                self._add_issue("ERROR", "STRICT_REGISTRY", f"Failed to parse strict evidence registry: {e}")

        # --- Check A: Manifest Structural & Field Integrity ---
        seen_place_hashes: Set[Tuple[str, str]] = set()
        seen_place_shas: Set[Tuple[str, str]] = set()
        primary_count_by_place: Dict[str, int] = defaultdict(int)

        for record in manifest_records:
            pid = record.place_id
            ahash = record.asset_hash or "MISSING_HASH"

            # Check place_id exists in places.json
            if pid not in places_map:
                self._add_issue("ERROR", "MANIFEST_ORPHAN", f"Referenced place_id '{pid}' does not exist in places.json", place_id=pid, asset_hash=ahash)

            # Check asset_hash
            if not record.asset_hash or len(record.asset_hash) < 6:
                self._add_issue("ERROR", "MANIFEST_HASH", f"Invalid or missing asset_hash '{record.asset_hash}'", place_id=pid, asset_hash=ahash)

            # Check content_sha256 format
            if not record.content_sha256 or not SHA256_HEX_PATTERN.match(record.content_sha256.lower()):
                self._add_issue("ERROR", "MANIFEST_SHA", f"Invalid SHA-256 format '{record.content_sha256}'", place_id=pid, asset_hash=ahash)

            # Check required provenance fields
            if not record.source_url:
                self._add_issue("ERROR", "MANIFEST_PROVENANCE", "Missing required source_url", place_id=pid, asset_hash=ahash)
            if not record.source_name:
                self._add_issue("ERROR", "MANIFEST_PROVENANCE", "Missing required source_name", place_id=pid, asset_hash=ahash)
            if not record.creator:
                self._add_issue("ERROR", "MANIFEST_PROVENANCE", "Missing required creator attribution", place_id=pid, asset_hash=ahash)
            if not record.attribution:
                self._add_issue("ERROR", "MANIFEST_PROVENANCE", "Missing required attribution text", place_id=pid, asset_hash=ahash)

            # Check license against verified allowlist
            clean_lic = (record.license or "").strip().lower()
            if not clean_lic:
                self._add_issue("ERROR", "MANIFEST_LICENSE", "Missing required license", place_id=pid, asset_hash=ahash)
            elif clean_lic not in APPROVED_LICENSES and not any(clean_lic.startswith(al) for al in APPROVED_LICENSES):
                self._add_issue("ERROR", "MANIFEST_LICENSE", f"Unapproved license '{record.license}' outside verified allowlist", place_id=pid, asset_hash=ahash)

            # Check duplicates
            key_hash = (pid, str(record.asset_hash))
            if key_hash in seen_place_hashes:
                self._add_issue("ERROR", "MANIFEST_DUPLICATE", f"Duplicate (place_id, asset_hash) record found for '{key_hash}'", place_id=pid, asset_hash=ahash)
            seen_place_hashes.add(key_hash)

            if record.content_sha256:
                key_sha = (pid, record.content_sha256.lower())
                if key_sha in seen_place_shas:
                    self._add_issue("ERROR", "MANIFEST_DUPLICATE", f"Duplicate (place_id, content_sha256) record found", place_id=pid, asset_hash=ahash)
                seen_place_shas.add(key_sha)

            if record.is_primary:
                primary_count_by_place[pid] += 1

        # Check primary image consistency
        for pid, count in primary_count_by_place.items():
            if count > 1:
                self._add_issue("ERROR", "PRIMARY_CONFLICT", f"Place has {count} primary image records (maximum 1 allowed)", place_id=pid)

        # --- Check B: Filesystem & Variant Verification for Manifest Assets ---
        manifest_place_hashes: Set[Tuple[str, str]] = set()

        for record in manifest_records:
            pid = record.place_id
            ahash = record.asset_hash or ""
            manifest_place_hashes.add((pid, ahash))

            asset_dir = self.places_img_dir / pid / ahash
            if not asset_dir.exists() or not asset_dir.is_dir():
                self._add_issue("ERROR", "ASSET_STORAGE", f"Expected asset directory does not exist: {asset_dir}", place_id=pid, asset_hash=ahash)
                continue

            # Verify all 4 required variants
            for v_name in REQUIRED_VARIANTS:
                v_file = asset_dir / f"{v_name}.webp"
                if not v_file.is_file():
                    self._add_issue("ERROR", "VARIANT_MISSING", f"Required variant '{v_name}.webp' is missing from {asset_dir}", place_id=pid, asset_hash=ahash)
                    continue

                v_size = v_file.stat().st_size
                if v_size == 0:
                    self._add_issue("ERROR", "VARIANT_CORRUPT", f"Variant '{v_name}.webp' is 0 bytes", place_id=pid, asset_hash=ahash)
                    continue

                # Read and decode via Pillow
                try:
                    v_bytes = v_file.read_bytes()
                    img, img_format, w, h = self.processor.validate_and_open(v_bytes)
                    if img_format != "WEBP":
                        self._add_issue("ERROR", "VARIANT_FORMAT", f"Variant '{v_name}.webp' is format '{img_format}', expected WEBP", place_id=pid, asset_hash=ahash)

                    # Check aspect ratio
                    ratio = w / h if h > 0 else 0
                    if not (0.5 <= ratio <= 3.0):
                        self._add_issue("ERROR", "VARIANT_ASPECT_RATIO", f"Variant '{v_name}.webp' aspect ratio {ratio:.2f} outside [0.5, 3.0]", place_id=pid, asset_hash=ahash)

                    # Dimensional matching with metadata
                    if record.variants and v_name in record.variants:
                        var_meta = record.variants[v_name]
                        if var_meta.width != w or var_meta.height != h:
                            self._add_issue("ERROR", "METADATA_MISMATCH", f"Variant '{v_name}.webp' dimensions ({w}x{h}) mismatch metadata ({var_meta.width}x{var_meta.height})", place_id=pid, asset_hash=ahash)
                        if var_meta.size_bytes is not None and var_meta.size_bytes != v_size:
                            self._add_issue("ERROR", "METADATA_MISMATCH", f"Variant '{v_name}.webp' size ({v_size} bytes) mismatch metadata ({var_meta.size_bytes} bytes)", place_id=pid, asset_hash=ahash)

                        # Variant Cryptographic SHA Verification
                        if var_meta.content_sha256:
                            actual_sha = hashlib.sha256(v_bytes).hexdigest().lower()
                            if actual_sha != var_meta.content_sha256.lower():
                                self._add_issue("ERROR", "SHA_MISMATCH", f"Variant '{v_name}.webp' SHA mismatch: expected {var_meta.content_sha256}, got {actual_sha}", place_id=pid, asset_hash=ahash)
                    else:
                        # Legacy record check (flat dimensions)
                        flat_dim = getattr(record, f"{v_name}_dimensions", None)
                        if flat_dim and len(flat_dim) >= 2:
                            # Note: legacy hero_dimensions was target bounding box (1080x720) or actual (w,h)
                            pass

                except ImageProcessingError as e:
                    self._add_issue("ERROR", "VARIANT_DECODE", f"Pillow failed to decode '{v_name}.webp': {e}", place_id=pid, asset_hash=ahash)
                except Exception as e:
                    self._add_issue("ERROR", "VARIANT_DECODE", f"Unexpected error reading '{v_name}.webp': {e}", place_id=pid, asset_hash=ahash)

            # Legacy Variant SHA status (informational/warning)
            if not record.variants:
                self._add_issue("INFO", "LEGACY_RECORD", f"Legacy manifest record lacks per-variant SHA metadata (diagnostic hashing available)", place_id=pid, asset_hash=ahash)

        # --- Check C: Storage-to-Manifest Reconciliation ---
        canonical_referenced_dirs = 0
        unmanifested_production_dirs: List[str] = []
        orphan_destination_dirs: List[str] = []
        orphan_asset_dirs: List[str] = []

        if self.places_img_dir.exists():
            for p_dir in sorted(self.places_img_dir.iterdir()):
                if not p_dir.is_dir():
                    continue

                pid = p_dir.name
                if pid not in places_map:
                    orphan_destination_dirs.append(pid)
                    self._add_issue("WARNING", "ORPHAN_DESTINATION_DIR", f"Directory under data/images/places/{pid} does not map to any place in places.json", place_id=pid)
                    continue

                # Check nested asset-hash subfolders
                has_manifest_match = False
                for sub in p_dir.iterdir():
                    if sub.is_dir():
                        ahash = sub.name
                        if (pid, ahash) in manifest_place_hashes:
                            canonical_referenced_dirs += 1
                            has_manifest_match = True
                        else:
                            orphan_asset_dirs.append(f"{pid}/{ahash}")
                            self._add_issue("WARNING", "ORPHAN_ASSET_DIR", f"Nested asset directory {pid}/{ahash} is not referenced by manifest.json", place_id=pid, asset_hash=ahash)

                if not has_manifest_match:
                    unmanifested_production_dirs.append(pid)
                    self._add_issue("WARNING", "UNMANIFESTED_PRODUCTION_ASSET", f"Production destination {pid} has image assets on disk but no manifest entry", place_id=pid)

        # --- Check D: Strict Evidence Registry Reconciliation ---
        manifest_pids = {m.place_id for m in manifest_records}
        strict_pids = set(strict_evidence_map.keys())

        matched_evidence = 0
        manifest_missing_strict = 0
        classification_conflicts = 0

        for record in manifest_records:
            pid = record.place_id
            strict_item = strict_evidence_map.get(pid)
            if not strict_item:
                manifest_missing_strict += 1
                self._add_issue("WARNING", "STRICT_SYNC_GAP", f"Manifest destination '{pid}' has no entry in strict_photo_evidence_registry.json", place_id=pid)
            else:
                matched_evidence += 1
                strict_classif = EvidenceClassification.normalize(strict_item.get("classification")).value
                manifest_classif = EvidenceClassification.normalize(record.verification_status).value

                # Conflict detection: strict says related/generic while manifest claims exact
                if strict_classif in ("RELATED_LOCATION_ONLY", "GENERIC_IMAGE") and manifest_classif == "EXACT_LOCATION_VERIFIED":
                    classification_conflicts += 1
                    self._add_issue("WARNING", "CLASSIFICATION_CONFLICT", f"Conflict: Strict registry classified as '{strict_classif}' while manifest status is '{manifest_classif}'", place_id=pid)

        # Summaries
        error_count = sum(1 for i in self.issues if i.level == "ERROR")
        warning_count = sum(1 for i in self.issues if i.level == "WARNING")
        info_count = sum(1 for i in self.issues if i.level == "INFO")

        report = ValidationReport(
            timestamp=datetime.now(timezone.utc).isoformat(),
            is_valid=(error_count == 0),
            error_count=error_count,
            warning_count=warning_count,
            info_count=info_count,
            manifest_summary={
                "total_manifest_records": len(manifest_records),
                "unique_destinations": len(manifest_pids),
            },
            filesystem_summary={
                "total_place_dirs_on_disk": len(list(self.places_img_dir.iterdir())) if self.places_img_dir.exists() else 0,
                "canonical_referenced_assets": canonical_referenced_dirs,
                "unmanifested_production_assets": len(unmanifested_production_dirs),
                "orphan_destination_dirs": len(orphan_destination_dirs),
                "orphan_asset_dirs": len(orphan_asset_dirs),
            },
            strict_evidence_summary={
                "manifest_destinations_matched": matched_evidence,
                "manifest_missing_in_strict": manifest_missing_strict,
                "classification_conflicts": classification_conflicts,
            },
            issues=self.issues,
        )

        if self.output_report_path:
            self.output_report_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.output_report_path, "w", encoding="utf-8") as f:
                json.dump(asdict(report), f, indent=2, ensure_ascii=False)
                f.write("\n")

        return report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="O-TRAVELZ Canonical Image Pipeline Integrity Validator."
    )
    parser.add_argument("--manifest-file", type=Path, help="Path to manifest.json")
    parser.add_argument("--places-file", type=Path, help="Path to places.json")
    parser.add_argument("--storage-dir", type=Path, help="Base directory for image storage (default: data/images)")
    parser.add_argument("--evidence-file", type=Path, help="Path to strict_photo_evidence_registry.json")
    parser.add_argument("--output", type=Path, help="Optional output path for validation JSON report")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    validator = ImagePipelineValidator(
        manifest_path=args.manifest_file,
        places_path=args.places_file,
        storage_dir=args.storage_dir,
        strict_registry_path=args.evidence_file,
        output_report_path=args.output,
    )

    report = validator.run_all_validations()
    report.print_summary()

    # Exit code: 0 if valid (0 errors), 1 if integrity errors detected
    return 0 if report.is_valid else 1


if __name__ == "__main__":
    sys.exit(main())
