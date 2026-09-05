"""
Media Domain Validator.
Enforces content SHA-256 formatting, storage key validity, public publication guards,
vector vs photography semantic separation, and cross-entity reuse auditing.
"""
from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple
from app.validation import codes
from app.validation.models import ValidationReport, ValidationSeverity

SHA256_HEX_PATTERN = re.compile(r"^[0-9a-f]{64}$")


def validate_media_asset(
    asset: Dict[str, Any],
    report: ValidationReport,
) -> None:
    asset_id = str(asset.get("id") or asset.get("storage_key") or "unknown")
    sha = str(asset.get("content_sha256", "")).strip().lower()
    storage_key = str(asset.get("storage_key", "")).strip()
    status = str(asset.get("verification_status", "")).strip().upper()
    media_kind = str(asset.get("media_kind") or asset.get("media_type") or "image").lower()
    VALID_MEDIA_TYPES = {"IMAGE", "VIDEO", "AUDIO", "DOCUMENT_PDF"}
    VALID_CONTENT_KINDS = {"FIELD_PHOTOGRAPH", "TECHNICAL_VECTOR", "ARCHIVAL_SCAN", "RENDER_3D", "PHOTOGRAPH"}

    media_type_raw = str(asset.get("media_type") or "IMAGE").strip().upper()
    content_kind_raw = str(asset.get("content_kind") or asset.get("media_kind") or "FIELD_PHOTOGRAPH").strip().upper()

    if media_type_raw not in VALID_MEDIA_TYPES:
        report.add_issue(
            code=codes.MED_INVALID_STORAGE_KEY,
            severity=ValidationSeverity.ERROR,
            domain="media",
            entity_type="media_asset",
            entity_id=asset_id,
            field="media_type",
            message=f"Media asset '{asset_id}' has invalid media_type '{media_type_raw}'",
            evidence={"media_type": media_type_raw},
        )

    if content_kind_raw not in VALID_CONTENT_KINDS:
        report.add_issue(
            code=codes.MED_INVALID_STORAGE_KEY,
            severity=ValidationSeverity.ERROR,
            domain="media",
            entity_type="media_asset",
            entity_id=asset_id,
            field="content_kind",
            message=f"Media asset '{asset_id}' has invalid content_kind '{content_kind_raw}'",
            evidence={"content_kind": content_kind_raw},
        )

    # 1. SHA256 Format (Blocking ERROR)
    if not SHA256_HEX_PATTERN.match(sha):
        report.add_issue(
            code=codes.MED_INVALID_SHA256,
            severity=ValidationSeverity.ERROR,
            domain="media",
            entity_type="media_asset",
            entity_id=asset_id,
            field="content_sha256",
            message=f"Media asset '{asset_id}' content_sha256 '{sha}' is not a valid 64-character lowercase hex string",
            evidence={"sha": sha},
        )

    # 2. Storage Key Requirement
    if not storage_key or len(storage_key) < 3:
        report.add_issue(
            code=codes.MED_INVALID_STORAGE_KEY,
            severity=ValidationSeverity.ERROR,
            domain="media",
            entity_type="media_asset",
            entity_id=asset_id,
            field="storage_key",
            message=f"Media asset '{asset_id}' storage_key is missing or malformed",
            evidence={"storage_key": storage_key},
        )

    # 3. Technical Vector Media Rule (Correction #6)
    # Technical vector is permitted in UI (even as hero).
    # The violation is: representing a technical / vector asset to the user as authentic photography.
    claims_photo = bool(
        asset.get("is_photograph") is True
        or asset.get("claim_type") == "field_photograph"
        or "camera" in str(asset.get("attribution", "")).lower()
        or (status == "EXACT_LOCATION_VERIFIED" and (status == "TECHNICAL_VECTOR" or media_kind == "vector" or content_kind_raw == "TECHNICAL_VECTOR"))
        or (content_kind_raw == "TECHNICAL_VECTOR" and status == "EXACT_LOCATION_VERIFIED")
    )
    if (status == "TECHNICAL_VECTOR" or media_kind == "vector" or content_kind_raw == "TECHNICAL_VECTOR") and claims_photo:
        report.add_issue(
            code=codes.MED_TECHNICAL_AS_PHOTO,
            severity=ValidationSeverity.ERROR,
            domain="media",
            entity_type="media_asset",
            entity_id=asset_id,
            field="verification_status",
            message=f"Media asset '{asset_id}' is a TECHNICAL_VECTOR but is represented as authentic photography",
            evidence={"verification_status": status, "media_kind": media_kind, "content_kind": content_kind_raw},
        )


def validate_entity_media(
    entity_media_records: List[Dict[str, Any]],
    media_assets_by_id: Dict[str, Dict[str, Any]],
    report: ValidationReport,
    known_entity_ids: Optional[Set[str]] = None,
) -> None:
    # Track cross-entity reuse groups
    asset_to_entities: Dict[str, Set[str]] = defaultdict(set)

    for assoc in entity_media_records:
        assoc_id = str(assoc.get("id") or "assoc")
        ent_type = str(assoc.get("entity_type", "")).strip()
        ent_id = str(assoc.get("entity_id", "")).strip()
        asset_id = str(assoc.get("media_asset_id", "")).strip()
        assoc_type = str(assoc.get("association_type", "primary")).strip()
        display_role = str(assoc.get("display_role", "HERO")).strip().upper()

        VALID_DISPLAY_ROLES = {"HERO", "CARD", "THUMBNAIL", "GALLERY", "DIAGRAM", "BANNER"}
        if display_role not in VALID_DISPLAY_ROLES:
            report.add_issue(
                code=codes.MED_INVALID_STORAGE_KEY,
                severity=ValidationSeverity.ERROR,
                domain="media",
                entity_type="entity_media",
                entity_id=assoc_id,
                field="display_role",
                message=f"EntityMedia record '{assoc_id}' has invalid display_role '{display_role}'",
                evidence={"display_role": display_role},
            )

        # 1. Orphan Association Check
        if asset_id not in media_assets_by_id:
            report.add_issue(
                code=codes.MED_ORPHAN_ASSOCIATION,
                severity=ValidationSeverity.ERROR,
                domain="media",
                entity_type="entity_media",
                entity_id=assoc_id,
                field="media_asset_id",
                message=f"EntityMedia record '{assoc_id}' references non-existent media_asset '{asset_id}'",
                evidence={"entity_id": ent_id, "media_asset_id": asset_id},
            )
            continue

        if known_entity_ids is not None and ent_id not in known_entity_ids:
            report.add_issue(
                code=codes.MED_ORPHAN_ASSOCIATION,
                severity=ValidationSeverity.ERROR,
                domain="media",
                entity_type="entity_media",
                entity_id=assoc_id,
                field="entity_id",
                message=f"EntityMedia record '{assoc_id}' references non-existent entity '{ent_id}'",
                evidence={"entity_id": ent_id, "entity_type": ent_type},
            )

        asset = media_assets_by_id[asset_id]
        asset_status = str(asset.get("verification_status", "")).strip().upper()

        # 2. REJECTED Asset Cannot Be Public (Blocking ERROR)
        if asset_status == "REJECTED":
            report.add_issue(
                code=codes.MED_REJECTED_PUBLIC,
                severity=ValidationSeverity.ERROR,
                domain="media",
                entity_type="entity_media",
                entity_id=assoc_id,
                field="media_asset_id",
                message=f"EntityMedia links public entity '{ent_id}' to REJECTED media asset '{asset_id}'",
                evidence={"entity_id": ent_id, "asset_id": asset_id, "status": asset_status},
            )

        asset_to_entities[asset_id].add(ent_id)

    # 3. Audit Cross-Entity Image Reuse (WARNING)
    for asset_id, entities in asset_to_entities.items():
        if len(entities) > 1:
            report.add_issue(
                code=codes.MED_CROSS_ENTITY_REUSE,
                severity=ValidationSeverity.WARNING,
                domain="media",
                entity_type="media_asset",
                entity_id=asset_id,
                field="media_asset_id",
                message=f"Media asset '{asset_id}' is reused across {len(entities)} distinct entities",
                evidence={"asset_id": asset_id, "reused_by_entities": sorted(list(entities))},
            )


def validate_media_filesystem_reconciliation(
    manifest_records: List[Dict[str, Any]],
    places_img_dir: Path,
    known_place_ids: Set[str],
    report: ValidationReport,
    required_variants: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Reconciles manifest items against filesystem on disk:
    1. Checks if all required variants (hero, card, thumbnail, original) exist on disk (MED_MISSING_FILE -> ERROR).
    2. Checks if directories on disk map to known places (MED_ORPHAN_STORAGE_ASSET -> WARNING).
    3. Checks if nested asset directories are referenced in manifest (MED_ORPHAN_STORAGE_ASSET -> WARNING).
    """
    if required_variants is None:
        required_variants = ["original", "hero", "card", "thumbnail"]

    manifest_pairs: Set[Tuple[str, str]] = set()
    for m in manifest_records:
        pid = str(m.get("place_id", ""))
        ahash = str(m.get("asset_hash", ""))
        manifest_pairs.add((pid, ahash))

        # Check files on disk
        asset_dir = places_img_dir / pid / ahash
        if not asset_dir.exists() or not asset_dir.is_dir():
            report.add_issue(
                code=codes.MED_MISSING_FILE,
                severity=ValidationSeverity.ERROR,
                domain="media",
                entity_type="media_asset",
                entity_id=f"{pid}/{ahash}",
                field="storage_key",
                message=f"Media asset directory '{asset_dir}' does not exist on disk",
                evidence={"place_id": pid, "asset_hash": ahash, "expected_path": str(asset_dir)},
            )
            continue

        for var_name in required_variants:
            var_file = asset_dir / f"{var_name}.webp"
            if not var_file.exists() or not var_file.is_file():
                report.add_issue(
                    code=codes.MED_MISSING_FILE,
                    severity=ValidationSeverity.ERROR,
                    domain="media",
                    entity_type="media_asset",
                    entity_id=f"{pid}/{ahash}",
                    field=var_name,
                    message=f"Required media variant '{var_name}.webp' is missing from disk: {var_file}",
                    evidence={"place_id": pid, "asset_hash": ahash, "variant": var_name},
                )
            elif var_file.stat().st_size == 0:
                report.add_issue(
                    code=codes.MED_MISSING_FILE,
                    severity=ValidationSeverity.ERROR,
                    domain="media",
                    entity_type="media_asset",
                    entity_id=f"{pid}/{ahash}",
                    field=var_name,
                    message=f"Media variant '{var_name}.webp' on disk is 0 bytes: {var_file}",
                    evidence={"place_id": pid, "asset_hash": ahash, "variant": var_name},
                )

    # Check disk for orphans
    orphan_destination_dirs: List[str] = []
    orphan_asset_dirs: List[str] = []
    if places_img_dir.exists():
        for p_dir in sorted(places_img_dir.iterdir()):
            if not p_dir.is_dir():
                continue
            pid = p_dir.name
            if known_place_ids and pid not in known_place_ids:
                orphan_destination_dirs.append(pid)
                report.add_issue(
                    code=codes.MED_ORPHAN_STORAGE_ASSET,
                    severity=ValidationSeverity.WARNING,
                    domain="media",
                    entity_type="media_asset",
                    entity_id=pid,
                    field="storage_directory",
                    message=f"Directory '{p_dir}' does not map to any place in places.json",
                    evidence={"path": str(p_dir)},
                )
                continue
            for sub in p_dir.iterdir():
                if sub.is_dir():
                    ahash = sub.name
                    if (pid, ahash) not in manifest_pairs:
                        orphan_asset_dirs.append(f"{pid}/{ahash}")
                        report.add_issue(
                            code=codes.MED_ORPHAN_STORAGE_ASSET,
                            severity=ValidationSeverity.WARNING,
                            domain="media",
                            entity_type="media_asset",
                            entity_id=f"{pid}/{ahash}",
                            field="storage_directory",
                            message=f"Nested asset directory '{sub}' is not referenced by manifest.json",
                            evidence={"path": str(sub)},
                        )

    return {
        "total_manifest_pairs": len(manifest_pairs),
        "orphan_destination_dirs": orphan_destination_dirs,
        "orphan_asset_dirs": orphan_asset_dirs,
    }


def validate_strict_photo_evidence_registry(
    strict_items: List[Dict[str, Any]],
    manifest_by_place_id: Dict[str, Dict[str, Any]],
    report: ValidationReport,
) -> None:
    """
    Validates strict_photo_evidence_registry.json items and checks reconciliation with manifest.
    """
    for item in strict_items:
        rid = str(item.get("research_id") or item.get("place_id") or "strict_item")
        classification = str(item.get("classification", "")).strip().lower()
        source_url = item.get("source_url") or item.get("image_source_url")

        if not source_url:
            report.add_issue(
                code=codes.PRV_MISSING_SOURCE,
                severity=ValidationSeverity.ERROR,
                domain="provenance",
                entity_type="strict_evidence_item",
                entity_id=rid,
                field="source_url",
                message=f"Strict evidence item '{rid}' missing source_url",
            )

        # Check conflict with manifest if present
        if rid in manifest_by_place_id:
            m_rec = manifest_by_place_id[rid]
            m_status = str(m_rec.get("verification_status", "")).strip().upper()
            if classification in ("related_location_only", "generic_image") and m_status == "EXACT_LOCATION_VERIFIED":
                report.add_issue(
                    code=codes.MED_REGISTRY_DESYNC,
                    severity=ValidationSeverity.WARNING,
                    domain="media",
                    entity_type="media_asset",
                    entity_id=rid,
                    field="classification",
                    message=f"Classification conflict: Strict registry is '{classification}' while manifest status is '{m_status}'",
                    evidence={"strict_classification": classification, "manifest_status": m_status},
                )