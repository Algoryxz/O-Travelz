import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
REQ_FILE = REPO_ROOT / "data" / "images" / "sources" / "manual_image_request.json"
MANIFEST_FILE = REPO_ROOT / "data" / "images" / "manual" / "manifest.json"
METADATA_FILE = REPO_ROOT / "data" / "images" / "manual" / "metadata.json"

def main():
    reqs = json.loads(REQ_FILE.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
    metadata = json.loads(METADATA_FILE.read_text(encoding="utf-8"))

    req_rids = [r["research_id"] for r in reqs]
    req_set = set(req_rids)

    manifest_rids = [img["research_id"] for img in manifest["images"]]
    manifest_set = set(manifest_rids)

    covered_requested = req_set.intersection(manifest_set)
    unresolved_requested = req_set.difference(manifest_set)
    bonus_covered = manifest_set.difference(req_set)

    print("=" * 65)
    print("STRICT IMAGE COVERAGE ACCOUNTING AUDIT")
    print("=" * 65)
    print(f"Total requested targets (R):                  {len(req_set)}")
    print(f"Covered requested targets (R intersect M):    {len(covered_requested)}")
    print(f"Unresolved requested targets (R minus M):     {len(unresolved_requested)}")
    print(f"Bonus canonical catalog overrides (M minus R):{len(bonus_covered)}")
    print(f"Total registered manifest overrides (M):      {len(manifest_set)}")
    print("-" * 65)
    print(f"Invariant check: {len(covered_requested)} + {len(unresolved_requested)} == {len(req_set)} -> {len(covered_requested) + len(unresolved_requested) == len(req_set)}")
    print(f"Requested Target Coverage: {len(covered_requested)} / {len(req_set)} = {len(covered_requested)/len(req_set)*100:.2f}%")
    print("=" * 65)

    print(f"\n[BONUS CANONICAL CATALOG OVERRIDES] ({len(bonus_covered)} targets outside original 90-request file):")
    for rid in sorted(bonus_covered):
        img_item = next((img for img in manifest["images"] if img["research_id"] == rid), None)
        pname = img_item.get("place_name", "") if img_item else ""
        dist = img_item.get("district", "") if img_item else ""
        print(f"  + {rid}: {pname} ({dist})")

    print(f"\n[EXACT UNRESOLVED REQUESTED TARGETS QUEUE] ({len(unresolved_requested)} remaining):")
    for i, rid in enumerate(sorted(unresolved_requested), 1):
        req_item = next((r for r in reqs if r.get("research_id") == rid), None)
        pname = req_item.get("place_name", "") if req_item else ""
        dist = req_item.get("district", "") if req_item else ""
        cat = req_item.get("category", "") if req_item else ""
        print(f"  {i:02d}. {rid}: {pname} ({dist}) [{cat}]")

if __name__ == "__main__":
    main()
