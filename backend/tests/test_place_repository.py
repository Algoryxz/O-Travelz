from types import SimpleNamespace

from app.services.ranking import SQLAlchemyPlaceRepository


class Query:
    def __init__(self, rows):
        self.rows = rows

    def join(self, *args):
        return self

    def filter(self, *args):
        # Mirror the repository boundary under test: only verified rows are
        # eligible for the Phase 4 candidate source.
        self.rows = [row for row in self.rows if row[0].verified_at is not None]
        return self

    def all(self):
        return self.rows


class Session:
    def __init__(self, rows):
        self.rows = rows

    def query(self, *args):
        return Query(self.rows)


def test_sqlalchemy_repository_projects_canonical_category_and_provenance_identity():
    place = SimpleNamespace(
        id="db-1",
        name="Verified Temple",
        research_id="place_001",
        location=None,
        opening_hours=None,
        avg_visit_minutes=None,
        price_tier=None,
        verified_at="2026-08-17",
    )
    category = SimpleNamespace(name="temple")
    repository = SQLAlchemyPlaceRepository(Session([(place, category)]))

    records = repository.list_verified_places()

    assert records[0].database_id == "db-1"
    assert records[0].research_id == "place_001"
    assert records[0].category_id == "temple"
    assert records[0].coordinate is None
    assert repository.resolve_origin("Verified Temple").database_id == "db-1"


def test_sqlalchemy_repository_excludes_unverified_place_rows():
    verified = SimpleNamespace(
        id="db-1",
        name="Verified Temple",
        research_id="place_001",
        location=None,
        opening_hours=None,
        avg_visit_minutes=None,
        price_tier=None,
        verified_at="2026-08-17",
    )
    unverified = SimpleNamespace(
        id="db-2",
        name="Unverified Temple",
        research_id="place_002",
        location=None,
        opening_hours=None,
        avg_visit_minutes=None,
        price_tier=None,
        verified_at=None,
    )
    category = SimpleNamespace(name="temple")
    repository = SQLAlchemyPlaceRepository(Session([(verified, category), (unverified, category)]))

    records = repository.list_verified_places()

    assert [record.database_id for record in records] == ["db-1"]
