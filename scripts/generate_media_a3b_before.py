import json
import os
import sys
from pathlib import Path

# Add backend to sys.path
sys.path.insert(0, os.path.abspath("backend"))

from app.db.session import SessionLocal
from app.models.media_asset import MediaAsset, EntityMedia
from app.models.place_image import PlaceImage
from app.models.place import Place

def generate_before_report():
    db = SessionLocal()
    ma_cnt = db.query(MediaAsset).count()
    em_cnt = db.query(EntityMedia).count()
    pi_cnt = db.query(PlaceImage).count()
    pl_cnt = db.query(Place).count()
    db.close()

    places_dir = Path("data/images/places")
    total_dirs = 0
    total_files = 0
    files_by_dir = {}
    for root, dirs, files in os.walk(places_dir):
        rel = os.path.relpath(root, places_dir)
        if rel == ".":
            total_dirs = len(dirs)
        elif len(files) > 0 or len(dirs) == 0:
            total_files += len(files)
            files_by_dir[rel] = len(files)

    with open("data/images/sources/manifest.json", "r", encoding="utf-8") as f:
        manifest = json.load(f)

    with open("reports/media_orphan_reconciliation_inventory.json", "r", encoding="utf-8") as f:
        orphan_inv = json.load(f)

    legacy_valid_count = sum(1 for x in orphan_inv if x["classification"] == "LEGACY_VALID_UNREGISTERED")
    legacy_valid_files = sum(x["files_count"] for x in orphan_inv if x["classification"] == "LEGACY_VALID_UNREGISTERED")
    archival_count = sum(1 for x in orphan_inv if x["classification"] == "ARCHIVE")
    archival_files = sum(x["files_count"] for x in orphan_inv if x["classification"] == "ARCHIVE")
    manifest_files = len(manifest) * 4

    before_report = {
        "wave": "A3b",
        "timestamp": "2026-09-05T12:35:00Z",
        "git_head": "6d1166e7907bcdbdb90bb546b19b66ee5e49c571",
        "alembic_head": "0017_enforce_route_stops_direction_not_null",
        "database_baseline": {
            "media_assets_count": ma_cnt,
            "entity_media_count": em_cnt,
            "place_images_count": pi_cnt,
            "places_count": pl_cnt
        },
        "filesystem_baseline": {
            "places_image_root": "data/images/places",
            "top_level_place_directories": total_dirs,
            "total_physical_files": total_files,
            "manifest_tracked_assets": len(manifest),
            "manifest_tracked_files": manifest_files,
            "orphan_entries_count": len(orphan_inv),
            "orphan_breakdown": {
                "legacy_valid_unregistered_assets": legacy_valid_count,
                "legacy_valid_unregistered_files": legacy_valid_files,
                "archival_derivative_entries": archival_count,
                "archival_derivative_files": archival_files
            }
        },
        "accounting_equation": {
            "total_physical_files": total_files,
            "manifest_tracked_files": manifest_files,
            "legacy_valid_unregistered_files": legacy_valid_files,
            "archival_derivative_files": archival_files,
            "unaccounted_files": total_files - (manifest_files + legacy_valid_files + archival_files)
        },
        "taxonomy_status": {
            "schema_orthogonal_dimensions": False,
            "missing_columns": [
                "media_assets.content_kind",
                "entity_media.display_role"
            ],
            "cross_entity_reuse_groups_resolved_in_db": False
        }
    }

    report_path = Path("reports/media_a3b_before.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(before_report, f, indent=2)

    print(f"Generated {report_path} successfully.")
    print(f"Unaccounted files: {before_report['accounting_equation']['unaccounted_files']}")

if __name__ == "__main__":
    generate_before_report()
