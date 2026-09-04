"""
Media Domain Validator.
Enforces content SHA-256 formatting, storage key validity, public publication guards,
vector vs photography semantic separation, and cross-entity reuse auditing.
"""
from __future__ import annotations

import re
from collections import defaultdict
from typing import Any, Dict, List, Optional, Set
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
        or status == "EXACT_LOCATION_VERIFIED" and (status == "TECHNICAL_VECTOR" or media_kind == "vector")
    )
    if (status == "TECHNICAL_VECTOR" or media_kind == "vector") and claims_photo:
        report.add_issue(
            code=codes.MED_TECHNICAL_AS_PHOTO,
            severity=ValidationSeverity.ERROR,
            domain="media",
            entity_type="media_asset",
            entity_id=asset_id,
            field="verification_status",
            message=f"Media asset '{asset_id}' is a TECHNICAL_VECTOR but is represented as authentic photography",
            evidence={"verification_status": status, "media_kind": media_kind},
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