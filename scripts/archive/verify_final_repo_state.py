#!/usr/bin/env python3
import json
import re

def verify():
    # 1. Candidates
    with open('data/research/round2/eastern/candidates.json', 'r', encoding='utf-8') as f:
        candidates = json.load(f)
    assert len(candidates) == 21, f"Expected 21 candidates, found {len(candidates)}"
    rids = [c['research_id'] for c in candidates]
    expected_rids = [f"round2_east_{i:03d}" for i in range(1, 22)]
    assert rids == expected_rids, "Research ID list does not match expected 1-21"
    needs_image = [c['research_id'] for c in candidates if c['image_status'] == 'needs_image']
    assert needs_image == ['round2_east_013', 'round2_east_014'], f"Unexpected needs_image list: {needs_image}"
    print("[OK] Candidates: 21/21 present, 19 verified, 2 needs_image.")

    # 2. Sources
    with open('data/research/round2/eastern/sources.json', 'r', encoding='utf-8') as f:
        sources = json.load(f)
    assert len(sources) >= 21
    source_rids = set(s['research_id'] for s in sources)
    for erid in expected_rids:
        assert erid in source_rids, f"Missing source for {erid}"
    print(f"[OK] Sources: {len(sources)} provenance records across all 21 research IDs.")

    # 3. Catalog
    with open('data/research/round2/eastern/eastern_image_catalog.json', 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    assert catalog['total_destinations'] == 21
    assert catalog['verified_destinations_count'] == 19
    assert catalog['needs_image_count'] == 2
    print("[OK] Catalog: 21 destinations, 19 verified, 2 needs_image.")

    # 4. Audit JSON
    with open('data/research/round2/eastern/eastern_image_audit.json', 'r', encoding='utf-8') as f:
        audit = json.load(f)
    assert audit['total_destinations_audited'] == 21
    print("[OK] Audit record: 21 destinations audited and documented.")

    # 5. Frontend Image Registry
    with open('frontend/src/utils/imageRegistry.ts', 'r', encoding='utf-8') as f:
        reg = f.read()
    
    # 6. Frontend Image Service
    with open('frontend/src/utils/imageService.ts', 'r', encoding='utf-8') as f:
        srv = f.read()

    # Verify no rejected images or false mappings exist
    forbidden_terms = [
        'Bhadrakali_Mandir.JPG',
        'Bhadrakali Mandir.JPG',
        'KrutamachandiTemple_TripathySahi',
        'Srikrishna_Academy',
        'Srikrishna Academy',
        '"round2_east_013"',
        '"round2_east_014"',
        '"Garh Kujanga"',
        '"Alaka Ashram"'
    ]
    for term in forbidden_terms:
        assert term not in reg, f"Forbidden term {term} found in imageRegistry.ts"
        assert term not in srv, f"Forbidden term {term} found in imageService.ts"
    print("[OK] Frontend: All obsolete and unverified images/mappings are strictly absent.")

    # Verify all 19 verified destinations exist in both files
    verified_rids = [f"round2_east_{i:03d}" for i in range(1, 22) if i not in [13, 14]]
    for rid in verified_rids:
        assert f'"{rid}"' in reg, f"Missing {rid} in imageRegistry.ts"
        assert f'"{rid}"' in srv, f"Missing {rid} in imageService.ts"
    print(f"[OK] Frontend: All {len(verified_rids)} verified destinations registered in imageRegistry.ts and imageService.ts.")

    # Specific subject hierarchy verifications
    assert 'BhadraKali_Temple_Gate.jpg' in reg and 'BhadraKali_Temple_Gate.jpg' in srv, "Bhadrakali gate missing"
    assert 'Dhabaleswar_Temple.JPG' in reg, "Dhabaleswar Temple not set as hero in imageRegistry"
    assert 'Handloom_1.jpg' in reg, "Nuapatna loom not set as hero in imageRegistry"
    print("[OK] Key image hierarchies (Bhadrakali, Dhabaleswar, Nuapatna) verified.")
    print("\nALL REPOSITORY INTEGRITY CHECKS PASSED!")

if __name__ == '__main__':
    verify()
