import json
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
REQ_FILE = REPO_ROOT / "data" / "images" / "sources" / "manual_image_request.json"
PLACES_FILE = REPO_ROOT / "data" / "places" / "places.json"
FOOD_FILE = REPO_ROOT / "data" / "research" / "food" / "odisha_food_research.json"
AUDIT_FILE = REPO_ROOT / "data" / "images" / "sources" / "authentic_image_audit.json"

def main():
    reqs = json.loads(REQ_FILE.read_text(encoding="utf-8")) if REQ_FILE.exists() else []
    places = json.loads(PLACES_FILE.read_text(encoding="utf-8")) if PLACES_FILE.exists() else []
    food_data = json.loads(FOOD_FILE.read_text(encoding="utf-8")) if FOOD_FILE.exists() else {}
    foods = food_data.get("records", []) if isinstance(food_data, dict) else food_data
    audits = json.loads(AUDIT_FILE.read_text(encoding="utf-8")) if AUDIT_FILE.exists() else []

    unmatched = [
        'food_balasore_002', 'food_boudh_002', 'food_dhenkanal_002', 'food_gajapati_002',
        'food_jagatsinghpur_002', 'food_nayagarh_002', 'food_rourkela_001',
        'place_bolangir_001', 'place_bolangir_002', 'place_boudh_003', 'place_cuttack_005',
        'place_ganjam_004', 'place_jajpur_004', 'place_nuapada_003', 'place_rayagada_003'
    ]

    print("=== DISTRICT & CANDIDATE SEARCH FOR UNMATCHED FILES ===")
    for u in unmatched:
        parts = u.split('_')
        prefix = parts[0]
        district_hint = parts[1]
        
        print(f"\n--- {u} (District: {district_hint}) ---")
        
        # Check food research
        matching_foods = [
            f for f in foods
            if district_hint.lower() in f.get("district", "").lower() or district_hint.lower() in f.get("research_id", "").lower()
        ]
        if matching_foods:
            print("  Matching in food research:")
            for mf in matching_foods:
                fid = mf.get("research_id") or mf.get("id")
                fname = mf.get("name")
                fdist = mf.get("district")
                print(f"    {fid}: {fname} ({fdist})")
        
        # Check places
        matching_places = [
            p for p in places
            if district_hint.lower() in p.get("district", "").lower() or district_hint.lower() in str(p.get("id", "")).lower()
        ]
        if matching_places:
            print("  Matching in places.json:")
            for mp in matching_places:
                pid = mp.get("id")
                pname = mp.get("name")
                pdist = mp.get("district")
                pcat = mp.get("category")
                print(f"    {pid}: {pname} ({pdist}) - {pcat}")

        # Check audits
        matching_audits = [
            a for a in audits
            if district_hint.lower() in a.get("district", "").lower() or district_hint.lower() in a.get("research_id", "").lower()
        ]
        if matching_audits:
            print("  Matching in authentic_image_audit.json:")
            for ma in matching_audits:
                arid = ma.get("research_id")
                aname = ma.get("place_name")
                adist = ma.get("district")
                astat = ma.get("status")
                print(f"    {arid}: {aname} ({adist}) - status: {astat}")

if __name__ == "__main__":
    main()
