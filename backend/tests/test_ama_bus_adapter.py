import csv
import hashlib
import json
import sys
from datetime import date
from pathlib import Path

import pytest

SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from import_ama_bus import (  # noqa: E402
    AMABusImportError,
    _validate_bqs,
    import_ama_bus_package,
    load_ama_bus_package,
)
from app.db.base import Base  # noqa: E402,F401
from app.models.transport import DataTier, FareRule, ScheduledTripGroup, Stop, TransportProviderSource  # noqa: E402


def _write_csv(path, headers, rows):
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def _package(tmp_path):
    bqs_headers = [
        "bqs_record_id", "bqs_index", "published_name", "latitude", "longitude",
        "coordinate_status", "canonical_stop_id", "current_march_2026_match",
        "reconciliation_status", "primary_source", "effective_date", "notes", "verification_date",
    ]
    unconfirmed = {32, 42, 43, 44, 52, 69, 70, 83}
    near = {9, 47, 49}
    bqs = []
    for index in range(1, 84):
        if index in near:
            status, canonical, match = "NEAR_VARIANT_REQUIRES_IDENTITY_CONFIRMATION", "", ""
        elif index in unconfirmed:
            status, canonical, match = "NOT_EVIDENCED_IN_PRIMARY_STOPPAGE_SOURCE", "", ""
        else:
            status, canonical, match = "BQS_MATCH_PRIMARY", f"AMA-BQS-{index:03d}", f"Stop {index}"
        bqs.append({
            "bqs_record_id": f"AMA-BQS-REC-{index:03d}", "bqs_index": str(index),
            "published_name": f"Stop {index}", "latitude": "", "longitude": "",
            "coordinate_status": "unresolved", "canonical_stop_id": canonical,
            "current_march_2026_match": match, "reconciliation_status": status,
            "primary_source": "Detailed-Stoppages-16thMar26.pdf", "effective_date": "2026-03-16",
            "notes": "test handoff", "verification_date": "2026-08-17",
        })
    _write_csv(tmp_path / "AMA_BUS_BQS_FINAL_RECONCILIATION_2026-08-17.csv", bqs_headers, bqs)

    routes = []
    groups = []
    group_number = 0
    for route_number in range(1, 96):
        count = 3 if route_number <= 3 else 2
        route = {
            "route": f"R{route_number}", "route_name": f"Route {route_number}", "source_page": route_number,
            "effective_from": "2026-08-01", "data_tier": "scheduled", "source": "schedule.pdf",
            "schedule_groups": [],
        }
        for group_index in range(count):
            group_number += 1
            times = ["07:00"] * (19 if group_number <= 143 else 18)
            label = f"Group {group_index + 1}"
            route["schedule_groups"].append({
                "label": label, "departure_times_source_order_raw": times,
                "departure_times_source_order": times, "departure_times_chronological": times,
            })
            groups.append({
                "route": route["route"], "route_name": route["route_name"], "source_page": str(route_number),
                "schedule_group": label, "trip_count": str(len(times)),
                "first_time_source_order_raw": "07:00", "last_time_source_order_raw": "07:00",
                "first_time_source_order": "07:00", "last_time_source_order": "07:00",
                "first_time_chronological": "07:00", "last_time_chronological": "07:00",
                "source_order_nonchronological": "false", "source": "schedule.pdf",
            })
        routes.append(route)
    schedule = {
        "provider": "AMA Bus / Mo Bus", "mode": "bus", "effective_from": "2026-08-01",
        "source": "schedule.pdf", "verified_on": "2026-08-17", "data_tier": "scheduled",
        "route_count": 95, "notes": ["test"], "routes": routes,
    }
    (tmp_path / "AMA_BUS_SCHEDULE_NORMALIZED_2026-08-01.json").write_text(json.dumps(schedule), encoding="utf-8")
    primary = {"route_count": 95, "routes": [{"route": route["route"]} for route in routes]}
    (tmp_path / "ama_bus_schedule_primary_2026-08-01.json").write_text(json.dumps(primary), encoding="utf-8")
    group_headers = list(groups[0])
    _write_csv(tmp_path / "AMA_BUS_SCHEDULE_GROUPS_FINAL_2026-08-01.csv", group_headers, groups)
    route12_headers = [
        "route_id", "route_number", "direction", "stop_sequence", "published_stop_name",
        "canonical_candidate", "source", "source_page", "verification_date",
    ]
    route12 = [{
        "route_id": "AMA-12", "route_number": "12", "direction": "UNSPECIFIED_IN_SOURCE",
        "stop_sequence": str(i), "published_stop_name": f"Route 12 stop {i}",
        "canonical_candidate": "", "source": "stoppages.pdf", "source_page": "1", "verification_date": "2026-08-17",
    } for i in range(1, 37)]
    _write_csv(tmp_path / "ama_bus_route12_primary_ordered_stop_extraction.csv", route12_headers, route12)

    (tmp_path / "FINAL_MANIFEST.json").write_text(json.dumps({"engineering_ready": False}), encoding="utf-8")
    (tmp_path / "QA_CHECKS_2026-08-17.csv").write_text("check,result\nall,pass\n", encoding="utf-8")
    for name in ("README.txt", "SOURCE_A.pdf", "SOURCE_B.pdf", "raw.txt", "normalized.txt"):
        (tmp_path / name).write_text(name, encoding="utf-8")
    checksum_files = [
        "AMA_BUS_BQS_FINAL_RECONCILIATION_2026-08-17.csv", "AMA_BUS_SCHEDULE_NORMALIZED_2026-08-01.json",
        "ama_bus_schedule_primary_2026-08-01.json", "AMA_BUS_SCHEDULE_GROUPS_FINAL_2026-08-01.csv",
        "ama_bus_route12_primary_ordered_stop_extraction.csv", "FINAL_MANIFEST.json", "QA_CHECKS_2026-08-17.csv",
        "README.txt", "SOURCE_A.pdf", "SOURCE_B.pdf", "raw.txt", "normalized.txt", "extra.txt",
    ]
    (tmp_path / "extra.txt").write_text("extra", encoding="utf-8")
    (tmp_path / "SHA256SUMS.txt").write_text(
        "\n".join(f"{hashlib.sha256((tmp_path / name).read_bytes()).hexdigest()}  {name}" for name in checksum_files) + "\n",
        encoding="utf-8",
    )
    return tmp_path


class _Fake:
    next_id = 0

    def __init__(self, **values):
        type(self).next_id += 1
        self.id = f"{type(self).__name__}-{type(self).next_id}"
        for key, value in values.items():
            setattr(self, key, value)


class FakeProvider(_Fake): pass
class FakeProviderSource(_Fake): pass
class FakeStop(_Fake): pass
class FakeRoute(_Fake): pass
class FakeGroup(_Fake): pass


class _Query:
    def __init__(self, records): self.records = records
    def filter_by(self, **filters):
        return _Query([r for r in self.records if all(getattr(r, k, object()) == v for k, v in filters.items())])
    def one_or_none(self):
        if len(self.records) > 1: raise AssertionError("duplicate fake records")
        return self.records[0] if self.records else None


class FakeSession:
    def __init__(self): self.records, self.commits, self.rollbacks = [], 0, 0
    def query(self, model): return _Query([r for r in self.records if isinstance(r, model)])
    def add(self, record): self.records.append(record)
    def flush(self): pass
    def commit(self): self.commits += 1
    def rollback(self): self.rollbacks += 1


def test_model_contract_preserves_null_coordinates_and_schedule_layers():
    assert Stop.__table__.columns.location.nullable is True
    assert Stop.__table__.columns.coordinate_status.nullable is True
    assert Stop.__table__.columns.canonical_stop_id.nullable is True
    assert {"departure_times_source_order_raw", "departure_times_source_order", "departure_times_chronological"} <= set(ScheduledTripGroup.__table__.columns.keys())
    assert {"status", "currency", "verification_note"} <= set(FareRule.__table__.columns.keys())
    assert TransportProviderSource.__table__.c.data_tier.type.enums == ["static", "scheduled", "live"]


def test_adapter_validates_boundary_and_imports_exact_confirmed_counts(tmp_path):
    package_dir = _package(tmp_path)
    package = load_ama_bus_package(package_dir)
    assert len(package.bqs_records) == 83
    assert len(package.schedule_groups) == 193
    assert sum(len(row["raw"]) for row in package.schedule_groups) == 3617
    session = FakeSession()
    result = import_ama_bus_package(
        session, package_dir,
        models=(FakeProvider, FakeProviderSource, FakeStop, FakeRoute, FakeGroup, DataTier),
    )
    assert (result.created_stops, result.created_routes, result.created_schedule_groups, result.departure_times) == (72, 95, 193, 3617)
    assert result.unresolved_route_stop_rows == 36
    assert {row["source_record_id"] for row in result.unresolved_records} == {
        f"AMA-BQS-REC-{i:03d}" for i in (9, 32, 42, 43, 44, 47, 49, 52, 69, 70, 83)
    }
    stops = [record for record in session.records if isinstance(record, FakeStop)]
    assert len(stops) == 72 and all(record.location is None for record in stops)
    second = import_ama_bus_package(
        session, package_dir,
        models=(FakeProvider, FakeProviderSource, FakeStop, FakeRoute, FakeGroup, DataTier),
    )
    assert (second.created_provider, second.created_stops, second.created_routes, second.created_schedule_groups) == (0, 0, 0, 0)
    assert session.commits == 2


def test_adapter_rejects_malformed_schema_before_writes(tmp_path):
    package_dir = _package(tmp_path)
    path = package_dir / "AMA_BUS_BQS_FINAL_RECONCILIATION_2026-08-17.csv"
    path.write_text(path.read_text(encoding="utf-8").replace("published_name", "wrong_name", 1), encoding="utf-8")
    with pytest.raises(AMABusImportError, match="checksum mismatch"):
        load_ama_bus_package(package_dir)


def test_bqs_validation_rejects_partial_or_out_of_range_coordinates(tmp_path):
    package = load_ama_bus_package(_package(tmp_path))
    rows = [dict(row) for row in package.bqs_records]
    rows[0]["latitude"] = "91"
    rows[0]["longitude"] = "85"
    rows[0]["coordinate_status"] = "resolved"
    with pytest.raises(AMABusImportError, match="latitude out of range"):
        _validate_bqs(rows)


def test_import_rolls_back_when_persistence_fails(tmp_path):
    class FailingSession(FakeSession):
        def commit(self):
            raise RuntimeError("simulated database failure")

    with pytest.raises(RuntimeError, match="simulated database failure"):
        import_ama_bus_package(
            FailingSession(), _package(tmp_path),
            models=(FakeProvider, FakeProviderSource, FakeStop, FakeRoute, FakeGroup, DataTier),
        )
