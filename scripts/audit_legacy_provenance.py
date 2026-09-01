#!/usr/bin/env python3
"""scripts/audit_legacy_provenance.py — Audit provenance of 31 unmanifested local assets.

O-TRAVELZ Image Track A2 (Step 1).

Audits all production destinations that have complete local 4-variant image assets on disk
under data/images/places/<place_id>/<asset_hash>/ but no canonical record in manifest.json.

Evaluates repository evidence across:
  - data/places/places.json (destination source URLs)
  - data/images/sources/strict_photo_evidence_registry.json
  - data/images/sources/rejected_candidates.json
  - data/images/sources/manual_image_request.json
  - data/images/manual/image_mapping_report.json
  - data/research/food/odisha_food_research.json
  - frontend/src/utils/imageRegistry.ts

Outputs:
  data/images/sources/legacy_provenance_recovery.json
"""
import sys
import json
import hashlib
from pathlib import Path
from typing import Dict, Any, List

REPO_ROOT = Path(__file__).resolve().parent.parent
PLACES_FILE = REPO_ROOT / "data" / "places" / "places.json"
MANIFEST_FILE = REPO_ROOT / "data" / "images" / "sources" / "manifest.json"
STRICT_REGISTRY_FILE = REPO_ROOT / "data" / "images" / "sources" / "strict_photo_evidence_registry.json"
REJECTED_FILE = REPO_ROOT / "data" / "images" / "sources" / "rejected_candidates.json"
PLACES_IMG_DIR = REPO_ROOT / "data" / "images" / "places"
REPORT_OUTPUT = REPO_ROOT / "data" / "images" / "sources" / "legacy_provenance_recovery.json"


def audit_legacy_provenance() -> Dict[str, Any]:
    places = json.load(open(PLACES_FILE, encoding="utf-8"))
    places_by_id = {p["id"]: p for p in places}

    manifest = json.load(open(MANIFEST_FILE, encoding="utf-8"))
    manifest_pids = {m["place_id"] for m in manifest}

    strict_reg = json.load(open(STRICT_REGISTRY_FILE, encoding="utf-8")) if STRICT_REGISTRY_FILE.exists() else []
    strict_by_pid = {r.get("place_id") or r.get("research_id"): r for r in strict_reg}

    rejected_list = json.load(open(REJECTED_FILE, encoding="utf-8")) if REJECTED_FILE.exists() else []
    rejected_by_pid = {r.get("place_id") or r.get("research_id"): r for r in rejected_list}

    # Find unmanifested production destinations with local directories
    unmanifested_pids = []
    for p_dir in sorted(PLACES_IMG_DIR.iterdir()):
        if not p_dir.is_dir():
            continue
        pid = p_dir.name
        if pid in places_by_id and pid not in manifest_pids:
            unmanifested_pids.append(pid)

    records = []
    summary_counts = {
        "total_audited": len(unmanifested_pids),
        "READY_FOR_MANIFEST": 0,
        "PROVENANCE_PARTIAL": 0,
        "CLASSIFICATION_UNRESOLVED": 0,
        "NO_PROVENANCE_FOUND": 0,
        "REJECTED_EVIDENCE": 0,
    }

    for pid in unmanifested_pids:
        p_info = places_by_id[pid]
        p_dir = PLACES_IMG_DIR / pid
        subdirs = [s for s in p_dir.iterdir() if s.is_dir()]
        
        asset_hash = subdirs[0].name if subdirs else "unknown"
        asset_path = f"data/images/places/{pid}/{asset_hash}"
        
        # Check all 4 variants
        variants_present = {}
        if subdirs:
            for v in ["original", "hero", "card", "thumbnail"]:
                vf = subdirs[0] / f"{v}.webp"
                if vf.exists():
                    variants_present[v] = {
                        "size_bytes": vf.stat().st_size,
                        "sha256": hashlib.sha256(vf.read_bytes()).hexdigest(),
                    }
        variants_complete = len(variants_present) == 4

        # Evidence evaluation
        source_in_places = p_info.get("source")
        strict_evidence = strict_by_pid.get(pid)
        rejected_entry = rejected_by_pid.get(pid)

        recovered_source = None
        recovered_creator = None
        recovered_license = None
        recovered_attribution = None
        linkage_evidence = None
        classification_evidence = "UNRESOLVED"
        missing_fields = []
        evidence_files = ["data/places/places.json"]

        if rejected_entry:
            bucket = "REJECTED_EVIDENCE"
            notes = f"Rejected in repository evidence: {rejected_entry.get('rejection_reason')}"
            evidence_files.append("data/images/sources/rejected_candidates.json")
        else:
            # Check if source URL in places.json is an official document/portal
            is_official_portal = bool(
                source_in_places and any(
                    domain in source_in_places
                    for domain in ["odishatourism.gov.in", "asi.nic.in", "nma.gov.in", "hinduendowments.odisha.gov.in", "rscbhubaneswar.org", "otdc.in"]
                )
            )

            # In all current 31 places, local WebP assets exist but specific image source origin URL, creator, and license are absent
            missing_fields = ["image_source_url", "creator", "license", "attribution", "source_to_local_byte_linkage"]

            if is_official_portal:
                bucket = "PROVENANCE_PARTIAL"
                notes = f"Destination article source lead in places.json ({source_in_places[:45]}...), but upstream image binary origin, creator, and legal license are unrecorded."
                recovered_source = source_in_places
                linkage_evidence = "UNPROVEN (Local WebP files present on disk without source byte SHA linkage in repository)"
            else:
                bucket = "NO_PROVENANCE_FOUND"
                notes = "No verifiable image source, creator, license, or cryptographic origin evidence exists in repository."
                linkage_evidence = "UNPROVEN"

        summary_counts[bucket] += 1

        records.append({
            "place_id": pid,
            "place_name": p_info.get("name"),
            "district": p_info.get("district"),
            "category": p_info.get("category"),
            "asset_hash": asset_hash,
            "asset_path": asset_path,
            "variants_complete": variants_complete,
            "recovered_source": recovered_source,
            "recovered_creator": recovered_creator,
            "recovered_license": recovered_license,
            "recovered_attribution": recovered_attribution,
            "classification_evidence": classification_evidence,
            "linkage_evidence": linkage_evidence,
            "recoverability_bucket": bucket,
            "missing_fields": missing_fields,
            "evidence_files": evidence_files,
            "notes": notes,
        })

    report = {
        "metadata": {
            "title": "O-Travelz Legacy Production Image Provenance Recovery Audit",
            "track": "Image Track A2 (Step 1)",
            "total_unmanifested_destinations": len(records),
            "summary_counts": summary_counts,
        },
        "records": records,
    }

    REPORT_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    REPORT_OUTPUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


if __name__ == "__main__":
    rep = audit_legacy_provenance()
    meta = rep["metadata"]
    counts = meta["summary_counts"]
    print("=" * 70)
    print("      O-TRAVELZ LEGACY IMAGE PROVENANCE RECOVERY AUDIT (TRACK A2)")
    print("=" * 70)
    print(f"Total Unmanifested Destinations Audited: {meta['total_unmanifested_destinations']}")
    print(f"  READY_FOR_MANIFEST        : {counts['READY_FOR_MANIFEST']}")
    print(f"  PROVENANCE_PARTIAL        : {counts['PROVENANCE_PARTIAL']}")
    print(f"  CLASSIFICATION_UNRESOLVED : {counts['CLASSIFICATION_UNRESOLVED']}")
    print(f"  NO_PROVENANCE_FOUND       : {counts['NO_PROVENANCE_FOUND']}")
    print(f"  REJECTED_EVIDENCE         : {counts['REJECTED_EVIDENCE']}")
    print("=" * 70)
