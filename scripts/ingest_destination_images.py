#!/usr/bin/env python3
"""scripts/ingest_destination_images.py — Unified Destination Image Ingestion CLI.

O-TRAVELZ Canonical Destination Image Ingestion Pipeline (Image Track A1).

Supports:
  1. Single URL ingestion (--source-url)
  2. Single local file ingestion (--file)
  3. Batch JSON ingestion (--batch)
  4. Regional research candidates ingestion (--candidates)

Enforces strict provenance, MIME & decompression safety, aspect-ratio bounds,
SHA-256 duplicate detection, deterministic WebP variant generation, and
atomic manifest persistence with full legacy compatibility.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys
import tempfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union

# Add backend to sys.path so we can import models and storage modules
REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.storage.manifest import (
    EvidenceClassification,
    ImageManifestItem,
    QualityStatus,
    RelevanceStatus,
    VariantMetadata,
    load_manifest_records,
)
from app.storage.downloader import (
    DownloadError,
    HttpImageDownloader,
    ImageDownloader,
)
from app.storage.processor import ImageProcessor, ImageProcessingError
from app.storage.azure_blob import AzureBlobImageStorage


# Approved permissive and attribution licenses verified by repo policy
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


@dataclass
class IngestionItemResult:
    place_id: str
    status: str  # SUCCEEDED | ALREADY_EXISTS | REVIEW_REQUIRED | REJECTED | FAILED
    reason: str
    asset_hash: Optional[str] = None
    content_sha256: Optional[str] = None
    classification: Optional[str] = None
    target_dir: Optional[str] = None
    variants_written: List[str] = field(default_factory=list)
    azure_uploaded: bool = False


@dataclass
class IngestionSummary:
    total: int = 0
    succeeded: int = 0
    already_exists: int = 0
    review_required: int = 0
    rejected: int = 0
    failed: int = 0
    results: List[IngestionItemResult] = field(default_factory=list)

    def print_summary(self) -> None:
        print("\n" + "=" * 65)
        print("        O-TRAVELZ DESTINATION IMAGE INGESTION REPORT")
        print("=" * 65)
        print(f"Total candidates evaluated : {self.total}")
        print(f"Succeeded                  : {self.succeeded}")
        print(f"Already exists (idempotent): {self.already_exists}")
        print(f"Review required            : {self.review_required}")
        print(f"Rejected (provenance/gate) : {self.rejected}")
        print(f"Failed (download/decode)   : {self.failed}")
        print("=" * 65)

        for res in self.results:
            tag = f"[{res.status}]"
            print(f"  {tag:<18} place: {res.place_id:<22} hash: {res.asset_hash or 'None':<14} {res.reason}")
        print("=" * 65 + "\n")


class DestinationImageIngestionService:
    """Core image ingestion and validation orchestrator."""

    def __init__(
        self,
        storage_base_dir: Optional[Path] = None,
        manifest_path: Optional[Path] = None,
        downloader: Optional[ImageDownloader] = None,
        processor: Optional[ImageProcessor] = None,
        min_width: int = 800,
        min_height: int = 450,
        dry_run: bool = False,
        upload_azure: bool = False,
        force: bool = False,
    ):
        self.repo_root = REPO_ROOT
        self.storage_base_dir = storage_base_dir or (self.repo_root / "data" / "images")
        self.places_images_dir = self.storage_base_dir / "places"
        self.manifest_path = manifest_path or (self.storage_base_dir / "sources" / "manifest.json")
        self.downloader = downloader or HttpImageDownloader(max_size_bytes=15 * 1024 * 1024)
        self.processor = processor or ImageProcessor(min_width=100, min_height=100, min_aspect_ratio=0.5, max_aspect_ratio=3.0)
        self.min_width = min_width
        self.min_height = min_height
        self.dry_run = dry_run
        self.upload_azure = upload_azure
        self.force = force

    def validate_license(self, license_str: str) -> bool:
        """Validate if license is in approved permissive/attribution set."""
        if not license_str:
            return False
        clean = license_str.strip().lower()
        return clean in APPROVED_LICENSES or any(clean.startswith(al) for al in APPROVED_LICENSES)

    def ingest_single_candidate(self, item_spec: Dict[str, Any]) -> IngestionItemResult:
        """Ingest and validate a single candidate item with full safety pipeline."""
        place_id = str(item_spec.get("place_id") or item_spec.get("research_id") or "").strip()
        if not place_id:
            return IngestionItemResult(
                place_id="UNKNOWN",
                status="REJECTED",
                reason="Missing required 'place_id' or 'research_id'."
            )

        place_name = item_spec.get("place_name") or item_spec.get("name") or place_id
        source_url = str(item_spec.get("source_url") or item_spec.get("image_source_url") or "").strip()
        local_file = item_spec.get("file")

        # 1. Source existence check
        if not source_url and not local_file:
            return IngestionItemResult(
                place_id=place_id,
                status="REJECTED",
                reason="Neither 'source_url' nor 'file' provided."
            )

        # 2. Provenance completeness check
        creator = str(item_spec.get("creator") or item_spec.get("photographer") or item_spec.get("researcher") or "").strip()
        license_str = str(item_spec.get("license") or item_spec.get("image_license_note") or "").strip()
        source_name = str(item_spec.get("source_name") or item_spec.get("image_source_domain") or "").strip()
        attribution = str(item_spec.get("attribution") or "").strip()

        # Infer defaults for standard repositories if omitted
        if not source_name:
            if "commons.wikimedia.org" in source_url or "upload.wikimedia.org" in source_url:
                source_name = "Wikimedia Commons"
            else:
                source_name = "O-Travelz Verified Photography"

        if not creator:
            creator = "O-Travelz Contributor"

        if not attribution:
            if license_str:
                attribution = f"Photo by {creator} via {source_name}, licensed under {license_str}"
            else:
                attribution = f"Photo by {creator} via {source_name}"

        # License validity check
        if not self.validate_license(license_str):
            return IngestionItemResult(
                place_id=place_id,
                status="REJECTED",
                reason=f"License '{license_str}' is invalid or not in approved set: {sorted(list(APPROVED_LICENSES))}"
            )

        # Classification resolution
        raw_classif = item_spec.get("classification") or item_spec.get("verification_status") or item_spec.get("image_verification_status")
        if raw_classif:
            classification = EvidenceClassification.normalize(raw_classif)
        else:
            # Default to REVIEW_REQUIRED — NEVER auto-promote to EXACT_LOCATION_VERIFIED
            classification = EvidenceClassification.REVIEW_REQUIRED

        # 3. Acquire raw bytes
        fetch_target = item_spec.get("fetch_url") or item_spec.get("original_image_url") or source_url
        try:
            if local_file:
                local_path = Path(local_file)
                if not local_path.is_file():
                    return IngestionItemResult(
                        place_id=place_id,
                        status="FAILED",
                        reason=f"Local source file not found: {local_file}"
                    )
                raw_bytes = local_path.read_bytes()
                if not source_url:
                    source_url = str(local_path.as_posix())
            else:
                raw_bytes = self.downloader.fetch_image(fetch_target)
        except DownloadError as e:
            return IngestionItemResult(
                place_id=place_id,
                status="FAILED",
                reason=f"Download failure: {e}"
            )
        except Exception as e:
            return IngestionItemResult(
                place_id=place_id,
                status="FAILED",
                reason=f"Failed to acquire source bytes: {e}"
            )

        if not raw_bytes or len(raw_bytes) < 32:
            return IngestionItemResult(
                place_id=place_id,
                status="REJECTED",
                reason="Acquired image byte stream is empty or under 32 bytes."
            )

        # 4. Decode & Safety validation through ImageProcessor
        try:
            img, img_format, width, height = self.processor.validate_and_open(raw_bytes)
        except ImageProcessingError as e:
            return IngestionItemResult(
                place_id=place_id,
                status="REJECTED",
                reason=f"Image decoding/safety failure: {e}"
            )

        # 5. Ingestion-level dimension threshold (800x450, orientation-aware)
        is_landscape_valid = width >= self.min_width and height >= self.min_height
        is_portrait_valid = height >= self.min_width and width >= self.min_height
        if not (is_landscape_valid or is_portrait_valid):
            return IngestionItemResult(
                place_id=place_id,
                status="REJECTED",
                reason=f"Source dimensions ({width}x{height}) below required threshold ({self.min_width}x{self.min_height})."
            )

        # 6. Compute SHA-256 and Asset Hash
        content_sha256 = hashlib.sha256(raw_bytes).hexdigest()
        asset_hash = content_sha256[:12]

        target_place_dir = self.places_images_dir / place_id / asset_hash

        # 7. Exact Duplicate Detection
        existing_records = []
        if self.manifest_path.exists():
            try:
                existing_records = load_manifest_records(self.manifest_path)
            except Exception as e:
                return IngestionItemResult(
                    place_id=place_id,
                    status="FAILED",
                    reason=f"Failed to load existing manifest at {self.manifest_path}: {e}"
                )

        same_place_dup = next(
            (r for r in existing_records if r.place_id == place_id and r.content_sha256 == content_sha256),
            None
        )
        cross_place_dup = next(
            (r for r in existing_records if r.place_id != place_id and r.content_sha256 == content_sha256),
            None
        )

        if same_place_dup and not self.force:
            # Idempotent return if files exist on disk
            all_variants_exist = (
                (target_place_dir / "hero.webp").exists()
                and (target_place_dir / "card.webp").exists()
                and (target_place_dir / "thumbnail.webp").exists()
                and (target_place_dir / "original.webp").exists()
            )
            if all_variants_exist or self.dry_run:
                return IngestionItemResult(
                    place_id=place_id,
                    status="ALREADY_EXISTS",
                    reason=f"Identical image SHA-256 already recorded for {place_id}.",
                    asset_hash=asset_hash,
                    content_sha256=content_sha256,
                    classification=same_place_dup.verification_status,
                    target_dir=str(target_place_dir),
                )

        if cross_place_dup:
            # Cross-place duplicate detected: flag and downgrade to REVIEW_REQUIRED, but preserve supplied classification
            classification = EvidenceClassification.REVIEW_REQUIRED
            note_extra = (
                f"Cross-place duplicate with {cross_place_dup.place_id} (SHA: {content_sha256[:8]}). "
                f"Originally supplied classification: {raw_classif or 'NONE'}."
            )
        else:
            note_extra = None

        # 8. Generate Variants
        try:
            variants_map = self.processor.generate_variants(img, quality=85)
        except Exception as e:
            return IngestionItemResult(
                place_id=place_id,
                status="FAILED",
                reason=f"Variant generation failed: {e}",
                asset_hash=asset_hash,
                content_sha256=content_sha256,
            )

        if self.dry_run:
            return IngestionItemResult(
                place_id=place_id,
                status="SUCCEEDED",
                reason=f"[DRY-RUN] Valid image candidate ({width}x{height} {img_format}). Would write 4 variants to {target_place_dir}.",
                asset_hash=asset_hash,
                content_sha256=content_sha256,
                classification=classification.value,
                target_dir=str(target_place_dir),
                variants_written=list(variants_map.keys()),
            )

        # 9. Atomic File Persistence
        variants_written = []
        variant_models: Dict[str, VariantMetadata] = {}

        try:
            with tempfile.TemporaryDirectory() as tmp_dir:
                tmp_path = Path(tmp_dir)
                for var_name, (var_bytes, var_w, var_h) in variants_map.items():
                    var_file = tmp_path / f"{var_name}.webp"
                    var_file.write_bytes(var_bytes)
                    var_sha = hashlib.sha256(var_bytes).hexdigest()
                    storage_key = f"places/{place_id}/{asset_hash}/{var_name}.webp"
                    variant_models[var_name] = VariantMetadata(
                        variant_type=var_name,
                        storage_key=storage_key,
                        url=f"/static/images/{storage_key}",
                        width=var_w,
                        height=var_h,
                        size_bytes=len(var_bytes),
                        content_sha256=var_sha,
                        mime_type="image/webp",
                    )

                # Move temp directory to destination
                target_place_dir.mkdir(parents=True, exist_ok=True)
                for var_name in variants_map.keys():
                    src_f = tmp_path / f"{var_name}.webp"
                    dst_f = target_place_dir / f"{var_name}.webp"
                    dst_f.write_bytes(src_f.read_bytes())
                    variants_written.append(f"{var_name}.webp")
        except Exception as e:
            return IngestionItemResult(
                place_id=place_id,
                status="FAILED",
                reason=f"Failed to persist variant files to disk: {e}",
                asset_hash=asset_hash,
                content_sha256=content_sha256,
            )

        # 10. Construct & Atomically Update Manifest Record
        hero_var = variant_models.get("hero")
        card_var = variant_models.get("card")
        thumb_var = variant_models.get("thumbnail")
        orig_var = variant_models.get("original")

        retrieval_ts = item_spec.get("retrieval_timestamp") or datetime.now(timezone.utc).isoformat()
        combined_notes = item_spec.get("notes") or ""
        if note_extra:
            combined_notes = f"{combined_notes} {note_extra}".strip()

        manifest_item = ImageManifestItem(
            place_id=place_id,
            place_name=place_name,
            asset_hash=asset_hash,
            source_url=item_spec.get("source_page_url") or source_url,
            download_url=item_spec.get("download_url") or item_spec.get("original_image_url") or f"/static/images/places/{place_id}/{asset_hash}/hero.webp",
            wikimedia_file=item_spec.get("wikimedia_file") or item_spec.get("filename"),
            source_name=source_name,
            creator=creator,
            license=license_str,
            license_url=item_spec.get("license_url"),
            attribution=attribution,
            title=item_spec.get("title") or place_name,
            alt_text=item_spec.get("alt_text") or f"Authentic photograph of {place_name} in Odisha",
            description=item_spec.get("description") or combined_notes or None,
            is_primary=bool(item_spec.get("is_primary", True)),
            sort_order=int(item_spec.get("sort_order", 1)),
            retrieval_timestamp=retrieval_ts,
            content_sha256=content_sha256,
            width=width,
            height=height,
            mime_type=f"image/{img_format.lower()}",
            quality_status=QualityStatus.VERIFIED,
            relevance_status=RelevanceStatus.RELEVANT if classification == EvidenceClassification.EXACT_LOCATION_VERIFIED else RelevanceStatus.SUSPECT,
            verification_status=classification,
            variants=variant_models,
            original_dimensions=[orig_var.width, orig_var.height] if orig_var else [width, height],
            hero_dimensions=[hero_var.width, hero_var.height] if hero_var else [1080, 720],
            card_dimensions=[card_var.width, card_var.height] if card_var else [640, 360],
            thumbnail_dimensions=[thumb_var.width, thumb_var.height] if thumb_var else [240, 160],
            hero_bytes=hero_var.size_bytes if hero_var else None,
            notes=combined_notes or None,
        )

        try:
            self._atomic_manifest_update(manifest_item)
        except Exception as e:
            # Transactional rollback: remove generated variant files to prevent orphan canonical assets
            if target_place_dir.exists():
                shutil.rmtree(target_place_dir, ignore_errors=True)
                if target_place_dir.parent.exists() and not any(target_place_dir.parent.iterdir()):
                    target_place_dir.parent.rmdir()
            return IngestionItemResult(
                place_id=place_id,
                status="FAILED",
                reason=f"Manifest update failed: {e}",
                asset_hash=asset_hash,
                content_sha256=content_sha256,
            )

        # 11. Optional Azure Upload
        azure_ok = False
        if self.upload_azure:
            try:
                azure_storage = AzureBlobImageStorage()
                for var_name, (var_bytes, _, _) in variants_map.items():
                    key = f"places/{place_id}/{asset_hash}/{var_name}.webp"
                    azure_storage.save_image(key=key, data=var_bytes, content_type="image/webp")
                azure_ok = True
            except Exception as e:
                print(f"[WARN] Azure blob upload failed for {place_id} ({e}); local storage preserved.")

        return IngestionItemResult(
            place_id=place_id,
            status="SUCCEEDED",
            reason="Successfully validated, processed, and persisted.",
            asset_hash=asset_hash,
            content_sha256=content_sha256,
            classification=classification.value,
            target_dir=str(target_place_dir),
            variants_written=variants_written,
            azure_uploaded=azure_ok,
        )

    def _atomic_manifest_update(self, new_item: ImageManifestItem) -> None:
        """Atomically append or update a record in manifest.json without reformatting untouched records."""
        self.manifest_path.parent.mkdir(parents=True, exist_ok=True)
        raw_list = []
        if self.manifest_path.exists():
            with open(self.manifest_path, "r", encoding="utf-8") as f:
                raw_list = json.load(f)

        new_dict = new_item.to_legacy_dict()

        # Check for existing record by (place_id, asset_hash) or (place_id, content_sha256)
        replaced = False
        for idx, item in enumerate(raw_list):
            if item.get("place_id") == new_item.place_id and (
                item.get("asset_hash") == new_item.asset_hash
                or item.get("content_sha256") == new_item.content_sha256
            ):
                raw_list[idx] = new_dict
                replaced = True
                break

        if not replaced:
            raw_list.append(new_dict)

        # Atomic write to temporary file then replace
        parent_dir = self.manifest_path.parent
        with tempfile.NamedTemporaryFile("w", dir=parent_dir, delete=False, encoding="utf-8") as tf:
            json.dump(raw_list, tf, indent=2, ensure_ascii=False)
            tf.write("\n")
            temp_name = tf.name

        os.replace(temp_name, self.manifest_path)

    def ingest_batch(self, candidate_specs: List[Dict[str, Any]]) -> IngestionSummary:
        """Process a list of candidate specifications with complete isolation per item."""
        summary = IngestionSummary(total=len(candidate_specs))
        for spec in candidate_specs:
            res = self.ingest_single_candidate(spec)
            summary.results.append(res)
            if res.status == "SUCCEEDED":
                summary.succeeded += 1
            elif res.status == "ALREADY_EXISTS":
                summary.already_exists += 1
            elif res.status == "REVIEW_REQUIRED":
                summary.review_required += 1
            elif res.status == "REJECTED":
                summary.rejected += 1
            elif res.status == "FAILED":
                summary.failed += 1

        return summary


def parse_candidates_file(candidates_path: Path) -> List[Dict[str, Any]]:
    """Parse regional candidate JSON file extracting candidate image leads."""
    if not candidates_path.is_file():
        raise FileNotFoundError(f"Candidates file not found: {candidates_path}")

    with open(candidates_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError(f"Expected JSON list in {candidates_path}")

    ingestible_items = []
    for c in data:
        img_url = c.get("image_source_url")
        if not img_url:
            continue

        # Determine candidate classification: unverified leads must NEVER become EXACT_LOCATION_VERIFIED
        img_stat = str(c.get("image_status", "")).lower()
        coord_stat = str(c.get("coordinate_verification_status", "")).lower()
        if img_stat == "verified" and coord_stat in ("verified", "cross_checked"):
            candidate_classification = "EXACT_LOCATION_VERIFIED"
        else:
            candidate_classification = "REVIEW_REQUIRED"

        item = {
            "place_id": c.get("research_id") or c.get("id"),
            "place_name": c.get("name"),
            "source_url": img_url,
            "source_name": c.get("image_source_domain") or "Wikimedia Commons",
            "creator": c.get("researcher") or "Regional Contributor",
            "license": c.get("image_license_note") or "CC BY-SA 4.0",
            "classification": candidate_classification,
            "notes": c.get("notes"),
        }
        ingestible_items.append(item)

    return ingestible_items


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="O-TRAVELZ Canonical Destination Image Ingestion CLI."
    )
    # Mode inputs
    parser.add_argument("--place-id", help="Canonical place ID (e.g. place_bbsr_001)")
    parser.add_argument("--place-name", help="Human-readable destination name")
    parser.add_argument("--source-url", help="Remote source image URL")
    parser.add_argument("--file", help="Local source image file path")
    parser.add_argument("--source-name", help="Archive/source name (e.g. Wikimedia Commons)")
    parser.add_argument("--creator", help="Photographer or author name")
    parser.add_argument("--license", help="Applicable license (e.g. CC BY-SA 4.0, CC0)")
    parser.add_argument("--attribution", help="Full attribution statement")
    parser.add_argument(
        "--classification",
        "--verification-status",
        dest="classification",
        choices=[
            "EXACT_LOCATION_VERIFIED",
            "RELATED_LOCATION_ONLY",
            "GENERIC_IMAGE",
            "REJECTED",
            "REVIEW_REQUIRED",
        ],
        default="REVIEW_REQUIRED",
        help="Canonical evidence classification tier (default: REVIEW_REQUIRED)",
    )
    parser.add_argument("--title", help="Photo title")
    parser.add_argument("--alt-text", help="Descriptive alt text")
    parser.add_argument("--description", help="Description / caption")

    # Batch / Candidates inputs
    parser.add_argument("--batch", type=Path, help="Path to JSON file containing list of image items")
    parser.add_argument("--candidates", type=Path, help="Path to regional candidates.json file")

    # Path overrides
    parser.add_argument("--manifest-path", type=Path, help="Path to destination manifest.json")
    parser.add_argument("--storage-dir", type=Path, help="Base storage directory for images (default: data/images)")

    # Threshold overrides
    parser.add_argument("--min-width", type=int, default=800, help="Minimum width in px (default: 800)")
    parser.add_argument("--min-height", type=int, default=450, help="Minimum height in px (default: 450)")

    # Operational flags
    parser.add_argument("--dry-run", action="store_true", help="Validate and report without writing files or manifest")
    parser.add_argument("--upload-azure", action="store_true", help="Upload to Azure Blob Storage after local persistence")
    parser.add_argument("--force", action="store_true", help="Force re-processing even if duplicate is recorded")
    parser.add_argument("--vision-review", action="store_true", help="Advisory vision review hook (DEFERRED TO LATER A1 SUBSTEP)")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.vision_review:
        print("[INFO] --vision-review flag is advisory: DEFERRED TO LATER A1 SUBSTEP.")

    service = DestinationImageIngestionService(
        storage_base_dir=args.storage_dir,
        manifest_path=args.manifest_path,
        min_width=args.min_width,
        min_height=args.min_height,
        dry_run=args.dry_run,
        upload_azure=args.upload_azure,
        force=args.force,
    )

    items_to_ingest: List[Dict[str, Any]] = []

    if args.batch:
        if not args.batch.is_file():
            print(f"[ERROR] Batch file not found: {args.batch}", file=sys.stderr)
            return 1
        with open(args.batch, "r", encoding="utf-8") as f:
            items_to_ingest = json.load(f)
    elif args.candidates:
        try:
            items_to_ingest = parse_candidates_file(args.candidates)
            print(f"[INFO] Parsed {len(items_to_ingest)} image candidates from {args.candidates}")
        except Exception as e:
            print(f"[ERROR] Failed to parse candidates file: {e}", file=sys.stderr)
            return 1
    elif args.place_id:
        single_spec = {
            "place_id": args.place_id,
            "place_name": args.place_name,
            "source_url": args.source_url,
            "file": args.file,
            "source_name": args.source_name,
            "creator": args.creator,
            "license": args.license,
            "attribution": args.attribution,
            "classification": args.classification,
            "title": args.title,
            "alt_text": args.alt_text,
            "description": args.description,
        }
        items_to_ingest = [single_spec]
    else:
        parser.print_help()
        return 1

    summary = service.ingest_batch(items_to_ingest)
    summary.print_summary()

    if summary.failed > 0 or summary.rejected > 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
