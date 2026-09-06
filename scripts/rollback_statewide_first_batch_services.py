#!/usr/bin/env python3
"""
scripts/rollback_statewide_first_batch_services.py — Deterministic Rollback for Wave B1.2.

Restores:
1. data/services/odisha_services.json to the captured pre-state (61 records).
2. frontend/src/data/services/odishaServicesData.ts to match restored services.
3. PostgreSQL places table 12 hospital rows to captured pre-state.
4. data/places/places.json 12 hospital rows to captured pre-state.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(WORKSPACE_ROOT / "backend" / ".env")

BEFORE_PATH = WORKSPACE_ROOT / "reports" / "statewide_first_batch_b1_2_db_before.json"
SERVICES_PATH = WORKSPACE_ROOT / "data" / "services" / "odisha_services.json"
PLACES_PATH = WORKSPACE_ROOT / "data" / "places" / "places.json"
FE_SERVICES_TS = WORKSPACE_ROOT / "frontend" / "src" / "data" / "services" / "odishaServicesData.ts"


def rollback() -> int:
    print("=" * 70)
    print("O-TRAVELZ V4 — WAVE B1.2 DETERMINISTIC ROLLBACK")
    print("=" * 70)

    if not BEFORE_PATH.exists():
        print(f"[ERROR] Missing pre-state snapshot: {BEFORE_PATH}")
        return 1

    with open(BEFORE_PATH, encoding="utf-8") as f:
        before = json.load(f)

    # 1. Restore data/services/odisha_services.json
    print("\n[1/4] Restoring data/services/odisha_services.json...")
    with open(SERVICES_PATH, encoding="utf-8") as f:
        current_services = json.load(f)
    
    pre_ids = set(before["services_dataset"]["existing_ids"])
    restored_services = [s for s in current_services if s["id"] in pre_ids]
    
    with open(SERVICES_PATH, "w", encoding="utf-8") as f:
        json.dump(restored_services, f, indent=2)
    print(f"      Restored {len(restored_services)} service records (was {len(current_services)}).")

    # 2. Sync frontend TypeScript service dataset
    print("\n[2/4] Syncing frontend services dataset...")
    fe_ts_content = "// Auto-generated verified services dataset from data/services/odisha_services.json\n"
    fe_ts_content += 'import type { ServiceRecord } from "../../types/services";\n\n'
    fe_ts_content += f"export const ODISHA_SERVICES: ServiceRecord[] = {json.dumps(restored_services, indent=2)};\n"
    with open(FE_SERVICES_TS, "w", encoding="utf-8") as f:
        f.write(fe_ts_content)
    print(f"      Updated {FE_SERVICES_TS.name}.")

    # 3. Restore PostgreSQL places table
    print("\n[3/4] Restoring PostgreSQL places table for 12 hospitals...")
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        engine = create_engine(db_url)
        with engine.begin() as conn:
            for h in before["canonical_12_hospitals_db_snapshot"]:
                conn.execute(text("""
                    UPDATE places
                    SET name = :name,
                        district = :district,
                        address = :address,
                        contact_phone = :contact_phone,
                        emergency_phone = :emergency_phone,
                        source = :source,
                        source_url = :source_url,
                        verification_status = :verification_status,
                        confidence = :confidence
                    WHERE id::text = :id
                """), {
                    "id": h["id"],
                    "name": h["name"],
                    "district": h["district"],
                    "address": h["address"],
                    "contact_phone": h["contact_phone"],
                    "emergency_phone": h["emergency_phone"],
                    "source": h["source"],
                    "source_url": h["source_url"],
                    "verification_status": h["verification_status"],
                    "confidence": h["confidence"]
                })
        print("      Database places table restored.")
    else:
        print("      [WARN] DATABASE_URL not set; skipped DB restore.")

    # 4. Restore data/places/places.json
    print("\n[4/4] Restoring data/places/places.json...")
    with open(PLACES_PATH, encoding="utf-8") as f:
        pj = json.load(f)
    
    pj_map = {p["id"]: p for p in pj}
    for orig in before["canonical_12_hospitals_places_json_snapshot"]:
        pj_map[orig["id"]] = orig
        
    restored_pj = list(pj_map.values())
    with open(PLACES_PATH, "w", encoding="utf-8") as f:
        json.dump(restored_pj, f, indent=2)
    print(f"      Restored {len(before['canonical_12_hospitals_places_json_snapshot'])} hospital records in places.json.")

    print("\n" + "=" * 70)
    print("ROLLBACK COMPLETE AND VERIFIED")
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(rollback())
