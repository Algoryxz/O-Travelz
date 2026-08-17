import math
import sys
from pathlib import Path

import pytest

SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from import_places import (  # noqa: E402
    ImportValidationError,
    import_categories,
    import_records,
    load_places,
    load_categories,
    main,
    validate_input,
)


class FakeCategory:
    _next_id = 1

    def __init__(self, **values):
        self.id = f"category-{FakeCategory._next_id}"
        FakeCategory._next_id += 1
        for field, value in values.items():
            setattr(self, field, value)


class FakePlace:
    def __init__(self, **values):
        self.id = f"place-{values['name']}"
        for field, value in values.items():
            setattr(self, field, value)


class FakeQuery:
    def __init__(self, records):
        self.records = records

    def filter_by(self, **filters):
        return FakeQuery(
            [
                record
                for record in self.records
                if all(getattr(record, field, object()) == value for field, value in filters.items())
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

    def close(self):
        return None


class FlushFailingSession(FakeSession):
    def flush(self):
        raise RuntimeError("flush failed")


@pytest.fixture
def category_records():
    return [{"name": "temple"}, {"name": "museum"}]


@pytest.fixture
def place_record():
    return {
        "name": "Test Place",
        "category": "temple",
        "lat": 20.2,
        "lon": 85.8,
        "description": "A sourced test record.",
        "opening_hours": {"monday": "09:00-17:00"},
        "avg_visit_minutes": 60,
        "price_tier": "free",
        "source": "https://example.test/places/test-place",
        "verified_at": "2026-08-01T10:00:00Z",
    }


def test_valid_category_import_is_sorted_and_idempotent(category_records):
    session = FakeSession()

    categories, created = import_categories(
        session, list(reversed(category_records)), category_model=FakeCategory
    )

    assert created == 2
    assert [record.name for record in session.records] == ["museum", "temple"]
    assert set(categories) == {"museum", "temple"}


def test_valid_place_import_resolves_category_and_preserves_provenance(
    category_records, place_record
):
    session = FakeSession()

    result = import_records(
        session,
        category_records,
        [place_record],
        location_builder=lambda record: {"opaque_location_for": record["name"]},
        category_model=FakeCategory,
        place_model=FakePlace,
    )

    place = next(record for record in session.records if isinstance(record, FakePlace))
    assert result.places_created == 1
    assert place.category_id.startswith("category-")
    assert place.location == {"opaque_location_for": "Test Place"}
    assert place.source == place_record["source"]
    assert place.verified_at.isoformat() == "2026-08-01T10:00:00+00:00"


def test_unknown_place_field_is_rejected_before_database_writes(category_records, place_record):
    session = FakeSession()
    place_record["unexpected"] = "not part of the contract"

    with pytest.raises(ImportValidationError, match="unsupported fields: unexpected"):
        import_records(
            session,
            category_records,
            [place_record],
            location_builder=lambda record: "opaque-location",
            category_model=FakeCategory,
            place_model=FakePlace,
        )

    assert session.records == []
    assert session.commit_count == 0


def test_category_display_metadata_is_preserved(place_record):
    session = FakeSession()

    import_records(
        session,
        [{"id": "temple", "name": "Temple", "description": "sourced category"}],
        [place_record],
        location_builder=lambda record: "opaque-location",
        category_model=FakeCategory,
        place_model=FakePlace,
    )

    category = next(record for record in session.records if isinstance(record, FakeCategory))
    assert category.name == "temple"
    assert category.display_name == "Temple"
    assert category.description == "sourced category"


@pytest.mark.parametrize(
    ("remove_name", "name"),
    [
        pytest.param(True, None, id="missing"),
        pytest.param(False, None, id="null"),
        pytest.param(False, "", id="blank"),
        pytest.param(False, "   ", id="whitespace"),
    ],
)
def test_missing_or_blank_place_name_is_rejected(
    category_records, place_record, remove_name, name
):
    session = FakeSession()
    if remove_name:
        del place_record["name"]
    else:
        place_record["name"] = name

    with pytest.raises(ImportValidationError, match="name"):
        import_records(
            session,
            category_records,
            [place_record],
            location_builder=lambda record: "opaque-location",
            category_model=FakeCategory,
            place_model=FakePlace,
        )

    assert session.records == []


@pytest.mark.parametrize(
    "source_value",
    [
        pytest.param(None, id="missing"),
        pytest.param("", id="blank"),
        pytest.param("   ", id="whitespace"),
    ],
)
def test_missing_or_blank_source_is_rejected(category_records, place_record, source_value):
    session = FakeSession()
    if source_value is None:
        del place_record["source"]
    else:
        place_record["source"] = source_value

    with pytest.raises(ImportValidationError, match="source"):
        import_records(
            session,
            category_records,
            [place_record],
            location_builder=lambda record: "opaque-location",
            category_model=FakeCategory,
            place_model=FakePlace,
        )

    assert session.records == []


@pytest.mark.parametrize("source", ["REQUIRED", "REQUIRED: URL or date"])
def test_placeholder_source_is_rejected(category_records, place_record, source):
    session = FakeSession()
    place_record["source"] = source

    with pytest.raises(ImportValidationError, match="real source"):
        import_records(
            session,
            category_records,
            [place_record],
            location_builder=lambda record: "opaque-location",
            category_model=FakeCategory,
            place_model=FakePlace,
        )

    assert session.records == []


@pytest.mark.parametrize("lat", [-90.1, 90.1, "20.2", True])
def test_invalid_latitude_is_rejected(category_records, place_record, lat):
    place_record["lat"] = lat

    with pytest.raises(ImportValidationError, match="lat"):
        validate_input(category_records, [place_record])


@pytest.mark.parametrize("lon", [-180.1, 180.1, "85.8", False])
def test_invalid_longitude_is_rejected(category_records, place_record, lon):
    place_record["lon"] = lon

    with pytest.raises(ImportValidationError, match="lon"):
        validate_input(category_records, [place_record])


@pytest.mark.parametrize("field", ["lat", "lon"])
def test_nan_coordinates_are_rejected(category_records, place_record, field):
    place_record[field] = math.nan

    with pytest.raises(ImportValidationError, match=field):
        validate_input(category_records, [place_record])


@pytest.mark.parametrize("field", ["lat", "lon"])
@pytest.mark.parametrize("value", [math.inf, -math.inf])
def test_infinite_coordinates_are_rejected(category_records, place_record, field, value):
    place_record[field] = value

    with pytest.raises(ImportValidationError, match=field):
        validate_input(category_records, [place_record])


@pytest.mark.parametrize(
    "verified_at",
    ["not-a-timestamp", "2026-13-99T00:00:00Z", 123],
)
def test_invalid_verification_timestamp_is_rejected(
    category_records, place_record, verified_at
):
    place_record["verified_at"] = verified_at

    with pytest.raises(ImportValidationError, match="verified_at"):
        validate_input(category_records, [place_record])


@pytest.mark.parametrize("avg_visit_minutes", [0, -1, 1.5, True, "60"])
def test_invalid_visit_duration_is_rejected(
    category_records, place_record, avg_visit_minutes
):
    place_record["avg_visit_minutes"] = avg_visit_minutes

    with pytest.raises(ImportValidationError, match="avg_visit_minutes"):
        validate_input(category_records, [place_record])


def test_invalid_opening_hours_json_is_rejected(category_records, place_record):
    place_record["opening_hours"] = object()

    with pytest.raises(ImportValidationError, match="JSON-serializable"):
        validate_input(category_records, [place_record])


def test_duplicate_place_identity_is_rejected(category_records, place_record):
    duplicate = dict(place_record)

    with pytest.raises(ImportValidationError, match="duplicates place identity"):
        validate_input(category_records, [place_record, duplicate])


def test_failed_location_construction_cannot_partially_persist(
    category_records, place_record
):
    session = FakeSession()
    second_record = dict(place_record)
    second_record["name"] = "Second Test Place"
    second_record["category"] = "museum"

    def build_location(record):
        if record["name"] == "Second Test Place":
            return None
        return "opaque-location"

    with pytest.raises(ImportValidationError, match="returned no location"):
        import_records(
            session,
            category_records,
            [place_record, second_record],
            location_builder=build_location,
            category_model=FakeCategory,
            place_model=FakePlace,
        )

    assert session.records == []
    assert session.commit_count == 0


def test_transaction_rollback_occurs_on_import_failure(category_records, place_record):
    session = FlushFailingSession()

    with pytest.raises(RuntimeError, match="flush failed"):
        import_records(
            session,
            category_records,
            [place_record],
            location_builder=lambda record: "opaque-location",
            category_model=FakeCategory,
            place_model=FakePlace,
        )

    assert session.rollback_count == 1
    assert session.commit_count == 0


def test_repeated_import_does_not_create_duplicate_records(category_records, place_record):
    session = FakeSession()
    kwargs = {
        "location_builder": lambda record: "opaque-location",
        "category_model": FakeCategory,
        "place_model": FakePlace,
    }

    first = import_records(session, category_records, [place_record], **kwargs)
    second = import_records(session, category_records, [place_record], **kwargs)

    assert first == type(first)(categories_created=2, places_created=1, places_updated=0)
    assert second == type(second)(categories_created=0, places_created=0, places_updated=1)
    assert len([record for record in session.records if isinstance(record, FakeCategory)]) == 2
    assert len([record for record in session.records if isinstance(record, FakePlace)]) == 1
    assert session.commit_count == 2


def test_unknown_category_is_rejected_before_database_writes(place_record):
    session = FakeSession()
    place_record["category"] = "unknown"

    with pytest.raises(ImportValidationError, match="not present in categories.json"):
        import_records(
            session,
            [{"name": "temple"}],
            [place_record],
            location_builder=lambda record: "opaque-location",
            category_model=FakeCategory,
            place_model=FakePlace,
        )

    assert session.records == []
    assert session.commit_count == 0


def test_malformed_record_is_rejected_before_database_writes(category_records, place_record):
    session = FakeSession()
    place_record["description"] = 123

    with pytest.raises(ImportValidationError, match="description"):
        import_records(
            session,
            category_records,
            [place_record],
            location_builder=lambda record: "opaque-location",
            category_model=FakeCategory,
            place_model=FakePlace,
        )

    assert session.records == []


def test_placeholder_is_rejected_and_not_imported():
    placeholder = [
        {
            "_comment": "Example record",
            "name": "Example Place — replace me",
            "category": "temple",
            "lat": 20.2,
            "lon": 85.8,
            "description": "Placeholder",
            "opening_hours": None,
            "avg_visit_minutes": None,
            "price_tier": None,
            "source": "REQUIRED: URL",
            "verified_at": None,
        }
    ]

    with pytest.raises(ImportValidationError, match="placeholder"):
        validate_input([{"name": "temple"}], placeholder)


def test_existing_placeholder_causes_cli_rejection_before_session_open(monkeypatch):
    monkeypatch.setattr(
        "import_places.load_categories", lambda: [{"name": "temple"}]
    )
    monkeypatch.setattr(
        "import_places.load_places",
        lambda: [
            {
                "_comment": "Example record",
                "name": "Example Place — replace me",
                "category": "temple",
                "lat": 20.2,
                "lon": 85.8,
                "description": "Placeholder",
                "opening_hours": None,
                "avg_visit_minutes": None,
                "price_tier": None,
                "source": "REQUIRED: URL",
                "verified_at": None,
            }
        ],
    )
    monkeypatch.setattr(
        "import_places._open_session",
        lambda: pytest.fail("the placeholder must be rejected before opening a session"),
    )

    assert main([]) == 1


def test_place_import_uses_approved_coordinate_mapping(category_records, place_record):
    pytest.importorskip("geoalchemy2")
    session = FakeSession()

    result = import_records(
        session,
        category_records,
        [place_record],
        category_model=FakeCategory,
        place_model=FakePlace,
    )

    place = next(record for record in session.records if isinstance(record, FakePlace))
    assert result.places_created == 1
    assert place.location.data == "POINT(85.8 20.2)"
    assert place.location.srid == 4326


def test_both_null_coordinates_persist_null_location(category_records, place_record):
    session = FakeSession()
    place_record["lat"] = None
    place_record["lon"] = None

    result = import_records(
        session,
        category_records,
        [place_record],
        category_model=FakeCategory,
        place_model=FakePlace,
    )

    place = next(record for record in session.records if isinstance(record, FakePlace))
    assert result.places_created == 1
    assert place.location is None


@pytest.mark.parametrize("null_field", ["lat", "lon"])
def test_partial_null_coordinates_are_rejected(category_records, place_record, null_field):
    place_record[null_field] = None

    with pytest.raises(ImportValidationError, match="requires both lat and lon"):
        validate_input(category_records, [place_record])


def test_v51_handoff_validates_and_preserves_research_metadata():
    repo_root = Path(__file__).resolve().parents[2]
    handoff = repo_root / "data" / "research" / "handoffs" / "places_v5.1" / "data" / "places"
    validated = validate_input(
        load_categories(handoff / "categories.json"),
        load_places(handoff / "places.json"),
    )

    assert len(validated.categories) == 9
    assert len(validated.places) == 32
    assert {record["category"] for record in validated.places} == {
        record["id"] for record in validated.categories
    }
    assert sum(record["lat"] is not None for record in validated.places) == 8
    assert sum(record["lat"] is None for record in validated.places) == 24
    assert all(record["id"].startswith("place_") for record in validated.places)
    assert all(record["verified_at"] == "2026-08-17" for record in validated.places)
    assert all(
        record["coordinate_audit_status"] == "high"
        for record in validated.places
        if record["lat"] is not None
    )


def test_v51_handoff_import_is_idempotent_and_preserves_audit_fields():
    repo_root = Path(__file__).resolve().parents[2]
    handoff = repo_root / "data" / "research" / "handoffs" / "places_v5.1" / "data" / "places"
    categories = load_categories(handoff / "categories.json")
    places = load_places(handoff / "places.json")
    session = FakeSession()
    kwargs = {
        "location_builder": lambda record: (
            None if record["lat"] is None else {"point": (record["lon"], record["lat"])}
        ),
        "category_model": FakeCategory,
        "place_model": FakePlace,
    }

    first = import_records(session, categories, places, **kwargs)
    second = import_records(session, categories, places, **kwargs)

    assert first.categories_created == 9
    assert first.places_created == 32
    assert second.categories_created == 0
    assert second.places_created == 0
    assert second.places_updated == 32
    imported = next(
        record
        for record in session.records
        if isinstance(record, FakePlace) and record.research_id == "place_022"
    )
    assert imported.source_provenance_note
    assert imported.coordinate_audit_status == "unknown"
    assert imported.location is None
