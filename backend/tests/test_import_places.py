import sys
from pathlib import Path

import pytest

SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from import_places import (  # noqa: E402
    ImportValidationError,
    LocationMappingDecisionRequired,
    import_categories,
    import_records,
    load_places,
    main,
    validate_input,
)


class FakeCategory:
    _next_id = 1

    def __init__(self, name):
        self.id = f"category-{FakeCategory._next_id}"
        FakeCategory._next_id += 1
        self.name = name


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
    del place_record["source"]

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


def test_placeholder_is_rejected_and_not_imported():
    placeholder = load_places()

    with pytest.raises(ImportValidationError, match="placeholder"):
        validate_input([{"name": "temple"}], placeholder)


def test_existing_placeholder_causes_cli_rejection_before_session_open(monkeypatch):
    monkeypatch.setattr(
        "import_places._open_session",
        lambda: pytest.fail("the placeholder must be rejected before opening a session"),
    )

    assert main([]) == 1


def test_place_import_requires_the_unresolved_coordinate_mapping(category_records, place_record):
    session = FakeSession()

    with pytest.raises(LocationMappingDecisionRequired, match="OPEN DECISION"):
        import_records(
            session,
            category_records,
            [place_record],
            category_model=FakeCategory,
            place_model=FakePlace,
        )

    assert session.records == []
