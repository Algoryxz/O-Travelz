#!/usr/bin/env python3
"""O-Travelz Canonical Image Ingestion and Processing Pipeline CLI.

Ingests verified destination photography, performs Pillow decode & validation,
generates standardized WebP variants (hero, card, thumbnail), calculates SHA-256
content identities, and stores assets via the provider-neutral ImageStorage abstraction.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple
from uuid import UUID, uuid4

# Add backend to path so we can import models, schemas, and storage
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from app.core.config import Settings, settings
from app.db.base import Base, Place, PlaceImage
from app.db.session import SessionLocal

from app.storage.base import ImageStorage
from app.storage.downloader import (
    DownloadError,
    HttpImageDownloader,
    ImageDownloader,
)
from app.storage.factory import get_image_storage
from app.storage.processor import ImageProcessor, ImageProcessingError


# Explicitly supported permissive / attribution licenses
ALLOWED_LICENSES: Set[str] = {
    "cc0",
    "public domain",
    "cc by",
    "cc by 4.0",
    "cc by 3.0",
    "cc by 2.0",
    "cc by-sa",
    "cc by-sa 4.0",
    "cc by-sa 3.0",
    "cc by-sa 2.0",
    "unsplash free license",
}


class ManifestEntry(BaseModel):
    place_id: str = Field(..., description="Canonical place research_id or name")
    source_url: str = Field(..., description="Original upstream source image link")
    source_name: str = Field(..., description="Name of provider or archive (e.g. Wikimedia Commons)")
    creator: str = Field(..., description="Photographer or author name")
    license: str = Field(..., description="Applicable license (e.g. CC BY-SA 4.0, Public Domain)")
    attribution: str = Field(..., description="Complete required legal attribution statement")
    title: Optional[str] = None
    alt_text: Optional[str] = None
    is_primary: bool = False
    sort_order: int = 0
    retrieval_timestamp: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("license")
    @classmethod
    def validate_license(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in ALLOWED_LICENSES:
            raise ValueError(
                f"License '{v}' is not in the approved license set: {sorted(list(ALLOWED_LICENSES))}"
            )
        return v.strip()

    @field_validator("creator", "attribution", "source_name", "source_url")
    @classmethod
    def validate_non_empty(cls, v: str, info) -> str:
        if not v or not v.strip():
            raise ValueError(f"Field '{info.field_name}' must not be empty.")
        return v.strip()


@dataclass
class IngestionReport:
    total_entries: int = 0
    processed: int = 0
    uploaded: int = 0
    skipped: int = 0
    rejected: int = 0
    failed: int = 0
    rejections: List[Tuple[str, str, str]] = field(default_factory=list)
    failures: List[Tuple[str, str, str]] = field(default_factory=list)

    def print_summary(self) -> None:
        print("\n" + "=" * 60)
        print("          O-TRAVELZ IMAGE INGESTION REPORT")
        print("=" * 60)
        print(f"Total manifest entries : {self.total_entries}")
        print(f"Processed              : {self.processed}")
        print(f"Uploaded / Created     : {self.uploaded}")
        print(f"Skipped (duplicates)   : {self.skipped}")
        print(f"Rejected (provenance)  : {self.rejected}")
        print(f"Failed (download/eval) : {self.failed}")
        print("=" * 60)

        if self.rejections:
            print("\n[PROVENANCE REJECTIONS]")
            for place_id, src, reason in self.rejections:
                print(f"  - [{place_id}] {src}\n    Reason: {reason}")

        if self.failures:
            print("\n[PROCESSING FAILURES]")
            for place_id, src, reason in self.failures:
                print(f"  - [{place_id}] {src}\n    Reason: {reason}")
        print("=" * 60 + "\n")


class ImageIngestionPipeline:
    """Core image ingestion service."""

    def __init__(
        self,
        db_session: Session,
        storage: ImageStorage,
        downloader: Optional[ImageDownloader] = None,
        processor: Optional[ImageProcessor] = None,
        dry_run: bool = False,
        force: bool = False,
    ):
        self.db = db_session
        self.storage = storage
        self.downloader = downloader or HttpImageDownloader()
        self.processor = processor or ImageProcessor()
        self.dry_run = dry_run
        self.force = force

    def resolve_place(self, place_key: str) -> Optional[Place]:
        """Resolve a place by research_id, UUID, or exact name from DB or canonical dataset."""
        try:
            place = self.db.query(Place).filter(Place.research_id == place_key).first()
            if place:
                return place

            try:
                val_uuid = UUID(place_key)
                place = self.db.query(Place).filter(Place.id == val_uuid).first()
                if place:
                    return place
            except (ValueError, TypeError):
                pass

            place = self.db.query(Place).filter(Place.name.ilike(place_key.strip())).first()
            if place:
                return place
        except Exception:
            pass

        # Fallback to checking data/places/places.json
        places_json_path = Path(__file__).resolve().parent.parent / "data" / "places" / "places.json"
        if places_json_path.is_file():
            try:
                with open(places_json_path, "r", encoding="utf-8") as f:
                    places_data = json.load(f)
                for p in places_data:
                    if p.get("id") == place_key or p.get("name", "").lower() == place_key.strip().lower():
                        return Place(
                            id=uuid4(),
                            research_id=p.get("id"),
                            name=p.get("name"),
                            category_id=uuid4(),
                            source=p.get("source", "Canonical Sourced Place"),
                        )
            except Exception:
                pass

        return None


    def ingest_entry(self, raw_entry: Dict[str, Any], report: IngestionReport) -> bool:
        """Ingest a single manifest item."""
        place_id_str = str(raw_entry.get("place_id") or "UNKNOWN")
        source_url_str = str(raw_entry.get("source_url") or "UNKNOWN")

        # 1. Validate manifest schema & provenance
        try:
            entry = ManifestEntry.model_validate(raw_entry)
        except Exception as e:
            report.rejected += 1
            report.rejections.append((place_id_str, source_url_str, f"Invalid manifest schema/provenance: {e}"))
            return False

        # 2. Resolve place in database
        place = self.resolve_place(entry.place_id)
        if not place:
            report.rejected += 1
            report.rejections.append((entry.place_id, entry.source_url, f"Place '{entry.place_id}' not found in database."))
            return False

        # 3. Download source image
        try:
            image_data = self.downloader.fetch_image(entry.source_url)
        except DownloadError as e:
            report.failed += 1
            report.failures.append((entry.place_id, entry.source_url, f"Download error: {e}"))
            return False

        # 4. Validate image content & dimensions with Pillow
        try:
            img, fmt, orig_w, orig_h = self.processor.validate_and_open(image_data)
        except ImageProcessingError as e:
            report.failed += 1
            report.failures.append((entry.place_id, entry.source_url, f"Image decode/validation error: {e}"))
            return False

        # 5. Calculate content SHA-256
        content_sha256 = hashlib.sha256(image_data).hexdigest()

        # 6. Check duplicate / idempotency
        existing = (
            self.db.query(PlaceImage)
            .filter(PlaceImage.place_id == place.id, PlaceImage.content_sha256 == content_sha256)
            .first()
        )
        if existing and not self.force:
            report.skipped += 1
            report.processed += 1
            return True

        # 7. Generate standardized WebP variants
        try:
            variants = self.processor.generate_variants(img)
        except Exception as e:
            report.failed += 1
            report.failures.append((entry.place_id, entry.source_url, f"Variant generation error: {e}"))
            return False

        if self.dry_run:
            print(f"[DRY-RUN] Validated {entry.place_id} from {entry.source_name} (SHA: {content_sha256[:8]}..., {orig_w}x{orig_h})")
            report.uploaded += 1
            report.processed += 1
            return True

        # 8. Upload variants via ImageStorage
        prefix = place.research_id or str(place.id)
        hash_slug = content_sha256[:12]
        variant_urls: Dict[str, str] = {}
        variant_keys: Dict[str, str] = {}

        for variant_name, (variant_bytes, vw, vh) in variants.items():
            key = f"places/{prefix}/{hash_slug}/{variant_name}.webp"
            stored = self.storage.save_image(
                key=key,
                data=variant_bytes,
                content_type="image/webp",
                metadata={"place_id": str(place.id), "source": entry.source_name},
            )
            variant_urls[variant_name] = stored.url
            variant_keys[variant_name] = stored.key

        # 9. Persist PlaceImage record
        hero_w, hero_h = variants.get("hero", (None, orig_w, orig_h))[1:]
        aspect_ratio = round(hero_w / hero_h, 4) if hero_h else 1.0

        if existing:
            # Update existing record
            existing.url = variant_urls.get("hero", variant_urls.get("original", ""))
            existing.thumbnail_url = variant_urls.get("thumbnail")
            existing.card_url = variant_urls.get("card")
            existing.storage_key = variant_keys.get("hero")
            existing.width = hero_w
            existing.height = hero_h
            existing.aspect_ratio = aspect_ratio
            existing.source_url = entry.source_url
            existing.source_name = entry.source_name
            existing.creator = entry.creator
            existing.license = entry.license
            existing.attribution = entry.attribution
            existing.alt_text = entry.alt_text or f"Photograph of {place.name}"
            existing.title = entry.title or place.name
            existing.is_primary = entry.is_primary
            existing.sort_order = entry.sort_order
            existing.retrieval_timestamp = entry.retrieval_timestamp or datetime.now(timezone.utc)
            existing.status = "verified"
        else:
            new_img = PlaceImage(
                id=uuid4(),
                place_id=place.id,
                storage_key=variant_keys.get("hero"),
                url=variant_urls.get("hero", variant_urls.get("original", "")),
                thumbnail_url=variant_urls.get("thumbnail"),
                card_url=variant_urls.get("card"),
                alt_text=entry.alt_text or f"Photograph of {place.name}",
                title=entry.title or place.name,
                source_url=entry.source_url,
                source_name=entry.source_name,
                creator=entry.creator,
                license=entry.license,
                attribution=entry.attribution,
                retrieval_timestamp=entry.retrieval_timestamp or datetime.now(timezone.utc),
                width=hero_w,
                height=hero_h,
                aspect_ratio=aspect_ratio,
                content_sha256=content_sha256,
                content_type="image/webp",
                size_bytes=len(variants.get("hero", (b"", 0, 0))[0]),
                status="verified",
                sort_order=entry.sort_order,
                is_primary=entry.is_primary,
            )
            self.db.add(new_img)

        self.db.commit()
        report.uploaded += 1
        report.processed += 1
        return True


def run_ingestion(
    manifest_path: str,
    dry_run: bool = False,
    place_filter: Optional[str] = None,
    provider_filter: Optional[str] = None,
    force: bool = False,
    storage_backend: Optional[str] = None,
) -> IngestionReport:
    """Execute ingestion run from manifest file."""
    path = Path(manifest_path).resolve()
    if not path.is_file():
        raise FileNotFoundError(f"Manifest file not found: {manifest_path}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Manifest JSON root must be an array of image source entries.")

    custom_settings = Settings()
    if storage_backend:
        custom_settings.storage_backend = storage_backend

    storage = get_image_storage(custom_settings)
    report = IngestionReport(total_entries=len(data))

    session = SessionLocal()
    try:
        pipeline = ImageIngestionPipeline(
            db_session=session,
            storage=storage,
            dry_run=dry_run,
            force=force,
        )

        for entry in data:
            # Apply filters if provided
            if place_filter and place_filter.lower() not in str(entry.get("place_id", "")).lower():
                continue
            if provider_filter and provider_filter.lower() not in str(entry.get("source_name", "")).lower():
                continue

            pipeline.ingest_entry(entry, report)

    finally:
        session.close()

    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="O-Travelz Canonical Image Ingestion CLI")
    parser.add_argument(
        "--manifest",
        default="data/images/sources/manifest.json",
        help="Path to manifest.json file",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and generate variants without saving to disk or database",
    )
    parser.add_argument(
        "--place",
        help="Filter ingestion to specific place_id or name",
    )
    parser.add_argument(
        "--provider",
        help="Filter ingestion to specific source_name / provider",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-ingestion even if SHA-256 matches existing record",
    )
    parser.add_argument(
        "--storage-backend",
        choices=["local", "azure"],
        help="Override storage backend (local or azure)",
    )

    args = parser.parse_args()

    print(f"Starting O-Travelz image ingestion from: {args.manifest}")
    if args.dry_run:
        print("[MODE: DRY-RUN ENABLED]")

    try:
        report = run_ingestion(
            manifest_path=args.manifest,
            dry_run=args.dry_run,
            place_filter=args.place,
            provider_filter=args.provider,
            force=args.force,
            storage_backend=args.storage_backend,
        )
        report.print_summary()

        if report.rejected > 0 or report.failed > 0:
            return 1
        return 0
    except Exception as e:
        print(f"FATAL: Ingestion aborted with error: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
