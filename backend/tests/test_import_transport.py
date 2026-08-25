import json
import sys
from pathlib import Path

import pytest

SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from import_transport import (  # noqa: E402
    EstimateMetadataDecisionRequired,
    LocationMappingDecisionRequired,
    ProviderDataTierConflict,
    TransportImportError,
    TransportImportResult,
    TransportModels,
    TransportSourceBundle,
    import_transport_sources,
    load_transport_sources,
    normalize_transport_sources,
)


class FakeProvider:
    _next_id = 1

    def __init__(self, **values):
        self.id = f"provider-{FakeProvider._next_id}"
        FakeProvider._next_id += 1
        for field, value in values.items():
            setattr(self, field, value)


class FakeStop:
    _next_id = 1

    def __init__(self, **values):
        self.id = f"stop-{FakeStop._next_id}"
        FakeStop._next_id += 1
        for field, value in values.items():
            setattr(self, field, value)


class FakeRoute:
    _next_id = 1

    def __init__(self, **values):
        self.id = f"route-{FakeRoute._next_id}"
        FakeRoute._next_id += 1
        for field, value in values.items():
            setattr(self, field, value)


class FakeRouteStop:
    _next_id = 1

    def __init__(self, **values):
        self.id = f"route-stop-{FakeRouteStop._next_id}"
        FakeRouteStop._next_id += 1
        for field, value in values.items():
            setattr(self, field, value)


class FakeScheduledTrip:
    _next_id = 1

    def __init__(self, **values):
        self.id = f"trip-{FakeScheduledTrip._next_id}"
        FakeScheduledTrip._next_id += 1
        for field, value in values.items():
            setattr(self, field, value)


class FakeFareRule:
    _next_id = 1

    def __init__(self, **values):
        self.id = f"fare-{FakeFareRule._next_id}"
        FakeFareRule._next_id += 1
        for field, value in values.items():
            setattr(self, field, value)


FAKE_MODELS = TransportModels(
    FakeProvider,
    FakeStop,
    FakeRoute,
    FakeRouteStop,
    FakeScheduledTrip,
    FakeFareRule,
)


class FakeQuery:
    def __init__(self, records):
        self.records = records

    def filter_by(self, **filters):
        missing = object()
        return FakeQuery(
            [
                record
                for record in self.records
                if all(getattr(record, field, missing) == value for field, value in filters.items())
            ]
        )

    def one_or_none(self):
        if len(self.records) > 1:
            raise AssertionError("fake database contains an unexpected duplicate")
        return self.records[0] if self.records else None


class FakeSession:
    def __init__(self):
        self.records = []
        self.commit_count = 0
        self.rollback_count = 0

    def query(self, model):
        return FakeQuery([record for record in self.records if isinstance(record, model)])

    def add(self, record):
        self.records.append(record)

    def flush(self):
        return None

    def commit(self):
        self.commit_count += 1

    def rollback(self):
        self.rollback_count += 1


def static_record(provider="Demo Bus", tier="static", *, coordinates=True):
    if coordinates:
        stops = [
            {"name": "A", "lat": 20.20, "lon": 85.80, "external_ref": "a"},
            {"name": "B", "lat": 20.21, "lon": 85.81, "external_ref": "b"},
        ]
    else:
        stops = [
            {"name": "A", "lat": None, "lon": None, "coordinate_status": "unresolved"},
            {"name": "B", "lat": None, "lon": None, "coordinate_status": "unresolved"},
        ]
    return {
        "provider": provider,
        "mode": "bus",
        "data_tier": tier,
        "stops": stops,
        "routes": [{"name": "R1", "stop_sequence": ["A", "B"]}],
        "source": f"https://example.test/{provider.replace(' ', '-').lower()}",
        "verified_on": "2026-08-17",
    }


def scheduled_record(provider="Demo Bus", *, explicit=True, basis=None):
    route = {"route": "R1", "source": "https://example.test/schedule"}
    if explicit:
        route["explicit_departure_times"] = ["06:00", "06:30"]
    else:
        route.update({"headway_minutes_min": 15, "headway_minutes_max": 20})
    if basis is not None:
        route["basis"] = basis
    return {
        "provider": provider,
        "source": "https://example.test/schedule-file",
        "verified_on": "2026-08-17",
        "data_tier": "scheduled",
        "routes": [route],
    }


def fare_record(provider="Demo Bus", amount=10):
    return {
        "provider": provider,
        "fare_type": "flat",
        "amount_inr": amount,
        "currency": "INR",
        "source": "https://example.test/fare",
        "verified_on": "2026-08-17",
    }


def bundle(*, tier="scheduled", schedule=True, fare=True, coordinates=True):
    return TransportSourceBundle(
        static_records=(static_record(tier=tier, coordinates=coordinates),),
        schedule_records=(scheduled_record(),) if schedule else (),
        fare_records=(fare_record(),) if fare else (),
    )


def location_builder(stop):
    return {"opaque_location_for": (stop["provider"], stop["name"])}


def test_loader_reads_static_schedule_and_fare_files(tmp_path):
    static_dir = tmp_path / "static"
    fares_dir = tmp_path / "fares"
    static_dir.mkdir()
    fares_dir.mkdir()
    (static_dir / "demo.json").write_text(json.dumps(static_record()), encoding="utf-8")
    (static_dir / "demo_schedule.json").write_text(
        json.dumps(scheduled_record()), encoding="utf-8"
    )
    (fares_dir / "demo.json").write_text(json.dumps(fare_record()), encoding="utf-8")

    loaded = load_transport_sources(static_dir, fares_dir)

    assert len(loaded.static_records) == 1
    assert len(loaded.schedule_records) == 1
    assert len(loaded.fare_records) == 1


def test_valid_provider_import_preserves_data_tier_and_provenance():
    normalized = normalize_transport_sources(
        TransportSourceBundle((static_record(tier="static"),), (), ())
    )
    session = FakeSession()

    result = import_transport_sources(
        session,
        TransportSourceBundle((static_record(tier="static"),), (), ()),
        location_builder=location_builder,
        models=FAKE_MODELS,
    )

    provider = session.records[0]
    notes = json.loads(provider.notes_on_verification)
    assert normalized.providers[0].data_tier == "static"
    assert provider.data_tier == "static"
    assert notes[0]["source"].startswith("https://example.test/")
    assert result == TransportImportResult(providers_created=1, stops_created=2, routes_created=1, route_stops_created=2)


def test_full_dependency_order_imports_stops_routes_route_stops_schedule_and_fare():
    session = FakeSession()

    import_transport_sources(
        session,
        bundle(),
        location_builder=location_builder,
        models=FAKE_MODELS,
    )

    assert [type(record) for record in session.records] == [
        FakeProvider,
        FakeStop,
        FakeStop,
        FakeRoute,
        FakeRouteStop,
        FakeRouteStop,
        FakeScheduledTrip,
        FakeFareRule,
    ]
    trip = next(record for record in session.records if isinstance(record, FakeScheduledTrip))
    fare = next(record for record in session.records if isinstance(record, FakeFareRule))
    assert trip.explicit_departure_times == "06:00,06:30"
    assert fare.amount == 10.0
    assert fare.source == "https://example.test/fare"


def test_repeated_import_is_idempotent_and_prevents_duplicates():
    session = FakeSession()
    source = bundle()

    first = import_transport_sources(session, source, location_builder=location_builder, models=FAKE_MODELS)
    second = import_transport_sources(session, source, location_builder=location_builder, models=FAKE_MODELS)

    assert first == TransportImportResult(1, 2, 1, 2, 1, 1)
    assert second == TransportImportResult()
    assert len(session.records) == 8
    assert session.commit_count == 2


def test_unknown_provider_schedule_reference_is_rejected_before_writes():
    source = TransportSourceBundle(
        (static_record(provider="Known Bus", tier="scheduled"),),
        (scheduled_record(provider="Unknown Bus"),),
        (),
    )
    session = FakeSession()

    with pytest.raises(TransportImportError, match="no static provider record"):
        import_transport_sources(
            session, source, location_builder=location_builder, models=FAKE_MODELS
        )
    assert session.records == []


def test_unknown_stop_reference_is_rejected_before_writes():
    record = static_record()
    record["routes"][0]["stop_sequence"].append("Missing")

    with pytest.raises(TransportImportError, match="unknown stop"):
        normalize_transport_sources(TransportSourceBundle((record,), (), ()))


def test_unknown_route_reference_is_rejected_before_writes():
    source = TransportSourceBundle(
        (static_record(tier="scheduled"),),
        (scheduled_record(),),
        (),
    )
    source.schedule_records[0]["routes"][0]["route"] = "Missing Route"

    with pytest.raises(TransportImportError, match="does not reference a known route"):
        normalize_transport_sources(source)


def test_malformed_schedule_without_timing_is_rejected():
    record = scheduled_record()
    del record["routes"][0]["explicit_departure_times"]

    with pytest.raises(TransportImportError, match="exactly one"):
        normalize_transport_sources(
            TransportSourceBundle((static_record(tier="scheduled"),), (record,), ())
        )


def test_estimate_only_schedule_is_not_silently_stored_as_a_fact():
    with pytest.raises(EstimateMetadataDecisionRequired, match="estimate-only"):
        normalize_transport_sources(
            TransportSourceBundle(
                (static_record(tier="scheduled"),),
                (scheduled_record(explicit=False, basis="estimate-only"),),
                (),
            )
        )


def test_provider_tier_conflict_is_rejected():
    with pytest.raises(ProviderDataTierConflict, match="stores only one tier"):
        normalize_transport_sources(bundle(tier="static"))


def test_static_scheduled_and_live_tiers_are_preserved_for_distinct_inputs():
    records = tuple(
        static_record(provider=name, tier=tier)
        for name, tier in (("Static", "static"), ("Scheduled", "scheduled"), ("Live", "live"))
    )
    normalized = normalize_transport_sources(TransportSourceBundle(records, (), ()))

    assert {provider.name: provider.data_tier for provider in normalized.providers} == {
        "Static": "static",
        "Scheduled": "scheduled",
        "Live": "live",
    }


def test_unknown_fare_state_preserves_null_amount_and_fare_provenance():
    fare = fare_record(amount=None)
    fare["status"] = "unknown_for_static_seed"
    source = TransportSourceBundle(
        (static_record(tier="static"),),
        (),
        (fare,),
    )
    session = FakeSession()

    import_transport_sources(session, source, location_builder=location_builder, models=FAKE_MODELS)

    row = next(record for record in session.records if isinstance(record, FakeFareRule))
    assert row.amount is None
    assert row.source == fare["source"]
    assert row.verified_at.isoformat() == "2026-08-17T00:00:00"


def test_coordinate_mapping_is_required_before_any_write():
    session = FakeSession()

    with pytest.raises(LocationMappingDecisionRequired, match="OPEN DECISION"):
        import_transport_sources(session, bundle(), models=FAKE_MODELS)

    assert session.records == []


def test_unresolved_stop_coordinates_are_rejected_even_with_builder():
    with pytest.raises(TransportImportError, match="unresolved coordinates"):
        import_transport_sources(
            FakeSession(),
            bundle(coordinates=False),
            location_builder=location_builder,
            models=FAKE_MODELS,
        )


def test_duplicate_stop_names_are_rejected_as_ambiguous():
    record = static_record()
    record["stops"].append({"name": "A", "lat": 20.22, "lon": 85.82})

    with pytest.raises(TransportImportError, match="duplicates stop name"):
        normalize_transport_sources(TransportSourceBundle((record,), (), ()))
