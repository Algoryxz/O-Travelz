import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MANUAL_DIR = REPO_ROOT / "data" / "images" / "manual"
CHECKLIST_FILE = REPO_ROOT / "data" / "images" / "sources" / "MANUAL_IMAGE_COLLECTION.md"
PRIORITY_FILE = REPO_ROOT / "data" / "images" / "sources" / "PRIORITY_A_IMAGE_PACK.md"
REQ_FILE = REPO_ROOT / "data" / "images" / "sources" / "manual_image_request.json"
PLACES_FILE = REPO_ROOT / "data" / "places" / "places.json"
FOOD_FILE = REPO_ROOT / "data" / "research" / "food" / "odisha_food_research.json"
AUDIT_FILE = REPO_ROOT / "data" / "images" / "sources" / "authentic_image_audit.json"

def main():
    checklist_text = CHECKLIST_FILE.read_text(encoding="utf-8") if CHECKLIST_FILE.exists() else ""
    priority_text = PRIORITY_FILE.read_text(encoding="utf-8") if PRIORITY_FILE.exists() else ""
    reqs = json.loads(REQ_FILE.read_text(encoding="utf-8")) if REQ_FILE.exists() else []
    places = json.loads(PLACES_FILE.read_text(encoding="utf-8")) if PLACES_FILE.exists() else []
    food_data = json.loads(FOOD_FILE.read_text(encoding="utf-8")) if FOOD_FILE.exists() else {}
    foods = food_data.get("records", []) if isinstance(food_data, dict) else food_data
    audits = json.loads(AUDIT_FILE.read_text(encoding="utf-8")) if AUDIT_FILE.exists() else []

    problem_files = [
        'food_balasore_002.webp',
        'food_boudh_002.webp',
        'food_dhenkanal_002.webp',
        'food_gajapati_002.webp',
        'food_jagatsinghpur_002.webp',
        'food_nayagarh_002.webp',
        'place_boudh_003.webp',
        'place_cuttack_005.webp',
        'place_ganjam_004.webp',
        'place_jajpur_004.webp',
        'place_nuapada_003.webp',
        'place_rayagada_003.webp',
        'place_gajapati_002.webp'
    ]

    print("=== DEEP RECONCILIATION FOR 13 AMBIGUOUS / UNMATCHED FILES ===")
    for pf in problem_files:
        stem = Path(pf).stem
        print(f"\n==================== {pf} ====================")
        
        # Check if mentioned in checklist markdown
        in_checklist = stem in checklist_text
        in_priority = stem in priority_text
        print(f"Mentioned in MANUAL_IMAGE_COLLECTION.md: {in_checklist}")
        print(f"Mentioned in PRIORITY_A_IMAGE_PACK.md: {in_priority}")
        
        if in_checklist:
            for line in checklist_text.splitlines():
                if stem in line:
                    print(f"  Checklist line: {line.strip()}")

if __name__ == "__main__":
    main()
