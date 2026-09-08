"""
Stage G1 — Section 2: District Geometry Optimization
Produces 4 geometry variants (full, low, medium, high simplification).
Selects smallest geometry that preserves product-level district browsing integrity.

Ponytail: shapely stdlib path, no topojson dependency.
canonical_mutations = 0. Writes only to data/staging/geospatial/.
"""

import json
import gzip
import hashlib
import os
import sys
from datetime import datetime, timezone

try:
    from shapely.geometry import shape, mapping
    from shapely import set_precision
except ImportError:
    print("ERROR: shapely not installed. Run: pip install shapely", file=sys.stderr)
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
SOURCE_FILE = os.path.join(REPO_ROOT, "data", "staging", "geospatial", "odisha_district_boundaries.geojson")
OUT_DIR = os.path.join(REPO_ROOT, "data", "staging", "geospatial")

# Simplification tolerances in decimal degrees (~100m per 0.001°)
VARIANTS = [
    ("full",   None,   "No simplification — raw 4.6 MB source"),
    ("low",    0.001,  "Low simplification ~0.001° (~111 m)"),
    ("medium", 0.005,  "Medium simplification ~0.005° (~555 m)"),
    ("high",   0.01,   "High simplification ~0.01° (~1.1 km)"),
]

# Product integrity threshold: require all 30 districts to remain non-degenerate
REQUIRED_DISTRICTS = 30


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def gzip_size(path: str) -> int:
    gz_path = path + ".gz"
    with open(path, "rb") as f_in, gzip.open(gz_path, "wb", compresslevel=9) as f_out:
        f_out.write(f_in.read())
    size = os.path.getsize(gz_path)
    os.remove(gz_path)
    return size


def simplify_geojson(geojson: dict, tolerance: float | None) -> dict:
    """Return a new GeoJSON dict with simplified geometries (Shapely Douglas-Peucker)."""
    features = []
    for feat in geojson["features"]:
        geom = shape(feat["geometry"])
        if tolerance is not None:
            geom = geom.simplify(tolerance, preserve_topology=True)
        simplified = dict(feat)
        simplified["geometry"] = mapping(geom)
        features.append(simplified)
    return {
        "type": "FeatureCollection",
        "features": features,
    }


def count_non_degenerate(geojson: dict) -> int:
    """Count features whose geometry is non-empty after simplification."""
    count = 0
    for feat in geojson["features"]:
        geom = shape(feat["geometry"])
        if not geom.is_empty and geom.area > 0:
            count += 1
    return count


def main() -> dict:
    print(f"[optimize_district_boundaries] Loading {SOURCE_FILE}")
    with open(SOURCE_FILE, "r", encoding="utf-8") as f:
        source = json.load(f)

    print(f"  Source features: {len(source['features'])}")

    results = []
    chosen = None

    for tag, tolerance, description in VARIANTS:
        out_file = os.path.join(OUT_DIR, f"odisha_district_boundaries_{tag}.geojson")
        print(f"\n  Variant: {tag}  tolerance={tolerance}")

        simplified = simplify_geojson(source, tolerance)
        non_degenerate = count_non_degenerate(simplified)

        out_str = json.dumps(simplified, separators=(",", ":"))
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(out_str)

        raw_bytes = os.path.getsize(out_file)
        gz_bytes = gzip_size(out_file)
        sha = sha256_file(out_file)
        ratio = round(raw_bytes / gz_bytes, 2) if gz_bytes else None
        integrity_pass = non_degenerate >= REQUIRED_DISTRICTS

        entry = {
            "variant": tag,
            "tolerance_degrees": tolerance,
            "description": description,
            "output_file": os.path.relpath(out_file, REPO_ROOT).replace("\\", "/"),
            "raw_bytes": raw_bytes,
            "gzip_bytes": gz_bytes,
            "compression_ratio": ratio,
            "non_degenerate_districts": non_degenerate,
            "integrity_pass": integrity_pass,
            "sha256": sha,
        }
        results.append(entry)
        print(f"    raw={raw_bytes:,}  gz={gz_bytes:,}  districts={non_degenerate}  integrity={'PASS' if integrity_pass else 'FAIL'}")

    # Selection: choose smallest geometry that passes integrity
    eligible = [r for r in results if r["integrity_pass"]]
    if not eligible:
        print("ERROR: No variants passed district integrity check", file=sys.stderr)
        sys.exit(1)

    chosen = min(eligible, key=lambda r: r["raw_bytes"])
    print(f"\n  SELECTED VARIANT: {chosen['variant']} ({chosen['raw_bytes']:,} bytes raw, {chosen['gzip_bytes']:,} gz)")

    report = {
        "script": "scripts/staging/optimize_district_boundaries.py",
        "stage": "STAGE_G1_DISTRICT_GEOMETRY_OPTIMIZATION",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_file": "data/staging/geospatial/odisha_district_boundaries.geojson",
        "source_raw_bytes": os.path.getsize(SOURCE_FILE),
        "required_districts": REQUIRED_DISTRICTS,
        "selection_rule": "SMALLEST_GEOMETRY_THAT_PRESERVES_DISTRICT_BROWSING_INTEGRITY",
        "variants": results,
        "selected_variant": chosen["variant"],
        "selected_file": chosen["output_file"],
        "selected_raw_bytes": chosen["raw_bytes"],
        "selected_gzip_bytes": chosen["gzip_bytes"],
        "selected_sha256": chosen["sha256"],
        "canonical_mutations": 0,
    }

    report_path = os.path.join(REPO_ROOT, "reports", "research", "stage_g1_district_geometry_variants.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"\n  Variant report: {report_path}")
    return report


if __name__ == "__main__":
    main()
    print("\n[optimize_district_boundaries] DONE")
