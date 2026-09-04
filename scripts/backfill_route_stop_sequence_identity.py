"""
scripts/backfill_route_stop_sequence_identity.py

Wave C4.2 Application-owned backfill:
Deterministically populates route_stops.direction and route_stops.sequence_id
from data/transport/canonical/route_stops.json on live database.
Proves 1,491-row multiset parity.
"""
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = WORKSPACE_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))

from app.db.session import SessionLocal
from app.models.transport import Route, Stop, RouteStop


def backfill_route_stop_sequences() -> bool:
    print("=" * 70)
    print("O-TRAVELZ WAVE C4.2: ROUTE-STOP SEQUENCE IDENTITY DETERMINISTIC BACKFILL")
    print("=" * 70)

    can_rs_file = WORKSPACE_ROOT / "data" / "transport" / "canonical" / "route_stops.json"
    if not can_rs_file.exists():
        print(f"[FAIL] Canonical route_stops.json not found at {can_rs_file}")
        return False

    with open(can_rs_file, encoding="utf-8") as f:
        can_groups = json.load(f)

    session = SessionLocal()
    try:
        # 1. Build Route & Stop lookup tables
        routes = session.query(Route).all()
        route_to_id = {}
        id_to_route_num = {}
        for r in routes:
            r_num = str(r.name).strip()
            route_to_id[r_num] = r.id
            id_to_route_num[r.id] = r_num
            if r.route_code:
                route_to_id[str(r.route_code).strip()] = r.id

        stops = session.query(Stop).all()
        stop_to_id = {}
        id_to_stop_canonical = {}
        for s in stops:
            if s.canonical_stop_id:
                stop_to_id[s.canonical_stop_id] = s.id
                id_to_stop_canonical[s.id] = s.canonical_stop_id
            if s.research_id:
                stop_to_id[s.research_id] = s.id
                if s.id not in id_to_stop_canonical:
                    id_to_stop_canonical[s.id] = s.research_id
            if s.name:
                s_name_clean = s.name.upper().strip()
                stop_to_id[s_name_clean] = s.id
                if s.id not in id_to_stop_canonical:
                    id_to_stop_canonical[s.id] = s.name

        # 2. Canonical tuples multiset
        canonical_tuples = []
        canonical_links_by_key = defaultdict(list)
        total_can_links = 0
        for g in can_groups:
            r_num = str(g.get("route_number") or g.get("route_id")).strip()
            r_id = route_to_id.get(r_num)
            direction = str(g.get("direction") or "forward")
            seq_id = str(g.get("sequence_id"))
            for s in g.get("stops", []):
                total_can_links += 1
                seq = int(s.get("sequence"))
                s_cid = s.get("stop_id")
                s_id = stop_to_id.get(s_cid) or stop_to_id.get((s.get("raw_stop_name") or "").upper().strip())
                canonical_tuples.append((r_num, seq_id, direction, seq, s_cid))
                canonical_links_by_key[(r_id, s_id, seq)].append((direction, seq_id))

        print(f"Canonical route_stops: {len(can_groups)} groups, {total_can_links} links")

        # 3. Fetch DB RouteStops
        db_rows = session.query(RouteStop).all()
        print(f"Current DB route_stops rows: {len(db_rows)}")
        assert len(db_rows) == total_can_links, f"Expected {total_can_links} DB rows, found {len(db_rows)}"

        # 4. Deterministic Backfill
        # Group DB rows by (route_id, stop_id, sequence_order)
        db_by_key = defaultdict(list)
        for row in db_rows:
            db_by_key[(row.route_id, row.stop_id, row.sequence_order)].append(row)

        updated_count = 0
        for k, rows in db_by_key.items():
            can_items = canonical_links_by_key.get(k)
            if not can_items or len(rows) != len(can_items):
                raise ValueError(f"Mismatch for key {k}: DB has {len(rows)}, Canonical has {len(can_items) if can_items else 0}")
            # If 1-to-1, assign directly. If multiple (the 4 C4.1 cases), pair deterministically
            for idx, r_item in enumerate(rows):
                direction, seq_id = can_items[idx]
                r_item.direction = direction
                r_item.sequence_id = seq_id
                updated_count += 1

        session.commit()
        print(f"[OK] Deterministically backfilled {updated_count} route_stop rows with direction & sequence_id.")

        # 5. Validate zero nulls
        null_direction = session.query(RouteStop).filter(RouteStop.direction.is_(None)).count()
        null_seq_id = session.query(RouteStop).filter(RouteStop.sequence_id.is_(None)).count()
        assert null_direction == 0, f"Found {null_direction} rows with direction IS NULL"
        assert null_seq_id == 0, f"Found {null_seq_id} rows with sequence_id IS NULL"
        print("[OK] Verified 0 rows with direction IS NULL or sequence_id IS NULL.")

        # 6. Prove Multiset Parity
        reloaded_db = session.query(RouteStop).all()
        db_tuples = []
        for r in reloaded_db:
            r_num = id_to_route_num.get(r.route_id, str(r.route_id))
            s_cid = id_to_stop_canonical.get(r.stop_id, str(r.stop_id))
            db_tuples.append((r_num, r.sequence_id, r.direction, r.sequence_order, s_cid))

        can_counter = Counter(canonical_tuples)
        db_counter = Counter(db_tuples)

        assert len(can_tuples := canonical_tuples) == len(db_tuples) == 1491, "Count mismatch"
        assert can_counter == db_counter, f"Multiset mismatch! Diff: {can_counter - db_counter}"
        print(f"[SUCCESS] MULTISET PARITY VERIFIED! Canonical (1491) == DB (1491)")
        print(f"Unique sequence tuples: {len(can_counter)} (exact match across 5 dimensions)")
        return True

    except Exception as e:
        session.rollback()
        print(f"[ERROR] Backfill failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        session.close()


if __name__ == "__main__":
    success = backfill_route_stop_sequences()
    sys.exit(0 if success else 1)
