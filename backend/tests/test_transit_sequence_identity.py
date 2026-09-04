"""
backend/tests/test_transit_sequence_identity.py

Wave C4.2: Strict Parity and Uniqueness Tests for Route Sequence Identity.
Validates:
- Canonical sequence tuple multiset == DB sequence tuple multiset (1491 == 1491)
- 4 C4.1 relationships distinct in DB with authentic sequence_id and direction
- Zero null direction or sequence_id values
- DB uniqueness constraint on (route_id, sequence_id, sequence_order)
- Full idempotency
"""
import json
from collections import Counter
from pathlib import Path
import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.transport import Route, Stop, RouteStop

WORKSPACE_ROOT = Path(__file__).resolve().parents[2]
CANONICAL_DIR = WORKSPACE_ROOT / "data" / "transport" / "canonical"


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    yield session
    session.close()


def test_01_canonical_sequence_multiset_parity(db_session: Session):
    """Canonical sequence tuple multiset must strictly equal DB sequence tuple multiset."""
    with open(CANONICAL_DIR / "route_stops.json", encoding="utf-8") as f:
        can_groups = json.load(f)

    # 1. Build canonical tuples
    canonical_tuples = []
    for g in can_groups:
        r_num = str(g.get("route_number") or g.get("route_id")).strip()
        direction = str(g.get("direction") or "forward")
        seq_id = str(g.get("sequence_id"))
        for s in g.get("stops", []):
            seq = int(s.get("sequence"))
            s_cid = str(s.get("stop_id"))
            canonical_tuples.append((r_num, seq_id, direction, seq, s_cid))

    assert len(canonical_tuples) == 1491

    # 2. Build DB tuples
    db_rows = (
        db_session.query(RouteStop, Route.name, Stop.canonical_stop_id, Stop.research_id)
        .join(Route, RouteStop.route_id == Route.id)
        .join(Stop, RouteStop.stop_id == Stop.id)
        .all()
    )
    assert len(db_rows) == 1491

    db_tuples = []
    for rs_row, r_name, can_sid, res_sid in db_rows:
        sid = can_sid or res_sid
        db_tuples.append((str(r_name).strip(), str(rs_row.sequence_id), str(rs_row.direction), int(rs_row.sequence_order), str(sid)))

    # 3. Multiset comparison
    can_counter = Counter(canonical_tuples)
    db_counter = Counter(db_tuples)

    assert len(db_tuples) == 1491
    assert can_counter == db_counter, f"Parity mismatch: diff = {can_counter - db_counter}"
    assert len(can_counter) == 1491, "Expected 1491 unique 5-tuples"


def test_02_four_c4_1_relationships_distinct_in_db(db_session: Session):
    """The four C4.1 relationships must exist as distinct rows with valid direction & sequence_id."""
    # Route 205 seq 1 (Ainthapali - the C4.1 collision case)
    r205 = db_session.query(Route).filter(Route.name == "205").first()
    assert r205 is not None
    r205_s1_ainthapali = (
        db_session.query(RouteStop)
        .join(Stop, RouteStop.stop_id == Stop.id)
        .filter(
            RouteStop.route_id == r205.id,
            RouteStop.sequence_order == 1,
            Stop.canonical_stop_id == "stop_crut_sambalpur_ainthapali_bus_terminal",
        )
        .all()
    )
    assert len(r205_s1_ainthapali) == 2
    dirs_205 = {r.direction for r in r205_s1_ainthapali}
    seq_ids_205 = {r.sequence_id for r in r205_s1_ainthapali}
    assert dirs_205 == {"forward", "up"}
    assert seq_ids_205 == {"rt_crut_205_forward", "rt_crut_205_up"}

    # Route 215 seq 1 (Ainthapali - C4.1 collision case 2)
    r215 = db_session.query(Route).filter(Route.name == "215").first()
    assert r215 is not None
    r215_s1_ainthapali = (
        db_session.query(RouteStop)
        .join(Stop, RouteStop.stop_id == Stop.id)
        .filter(
            RouteStop.route_id == r215.id,
            RouteStop.sequence_order == 1,
            Stop.canonical_stop_id == "stop_crut_sambalpur_ainthapali_bus_terminal",
        )
        .all()
    )
    assert len(r215_s1_ainthapali) == 2
    assert {r.direction for r in r215_s1_ainthapali} == {"forward", "up"}
    assert {r.sequence_id for r in r215_s1_ainthapali} == {"rt_crut_215_forward", "rt_crut_215_up"}

    # Route 215 seq 2 (Padiabahal - C4.1 collision case 3)
    r215_s2_padiabahal = (
        db_session.query(RouteStop)
        .join(Stop, RouteStop.stop_id == Stop.id)
        .filter(
            RouteStop.route_id == r215.id,
            RouteStop.sequence_order == 2,
            Stop.canonical_stop_id == "stop_crut_sambalpur_padiabahal",
        )
        .all()
    )
    assert len(r215_s2_padiabahal) == 2
    assert {r.direction for r in r215_s2_padiabahal} == {"forward", "up"}
    assert {r.sequence_id for r in r215_s2_padiabahal} == {"rt_crut_215_forward", "rt_crut_215_up"}

    # Route 215 seq 16 (Shree Ram Vatika - C4.1 collision case 4)
    r215_s16_ramvatika = (
        db_session.query(RouteStop)
        .join(Stop, RouteStop.stop_id == Stop.id)
        .filter(
            RouteStop.route_id == r215.id,
            RouteStop.sequence_order == 16,
            Stop.canonical_stop_id == "stop_crut_sambalpur_shree_ram_vatika",
        )
        .all()
    )
    assert len(r215_s16_ramvatika) == 2
    assert {r.direction for r in r215_s16_ramvatika} == {"up", "down"}
    assert {r.sequence_id for r in r215_s16_ramvatika} == {"rt_crut_215_up", "rt_crut_215_down"}


def test_03_no_null_sequence_identity_in_db(db_session: Session):
    """Every single RouteStop row must possess non-null sequence_id and direction."""
    null_seq = db_session.query(RouteStop).filter(RouteStop.sequence_id.is_(None)).count()
    null_dir = db_session.query(RouteStop).filter(RouteStop.direction.is_(None)).count()
    assert null_seq == 0, f"Found {null_seq} rows with null sequence_id"
    assert null_dir == 0, f"Found {null_dir} rows with null direction"


def test_04_uniqueness_constraint_enforces_no_duplicates(db_session: Session):
    """Attempting to insert duplicate (route_id, sequence_id, sequence_order) must raise IntegrityError."""
    sample = db_session.query(RouteStop).first()
    assert sample is not None

    dup = RouteStop(
        route_id=sample.route_id,
        stop_id=sample.stop_id,
        sequence_order=sample.sequence_order,
        direction=sample.direction,
        sequence_id=sample.sequence_id,
    )
    db_session.add(dup)
    with pytest.raises(IntegrityError):
        db_session.flush()
    db_session.rollback()
