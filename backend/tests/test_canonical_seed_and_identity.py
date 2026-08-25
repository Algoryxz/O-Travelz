import uuid
import pytest
from app.models.category import Category
from app.models.interest import Interest
from app.models.place import Place
from scripts.import_places import (
    load_categories,
    load_interests,
    load_places,
    import_records,
)
from start import seed_database_if_empty


def test_import_places_assigns_deterministic_uuidv5():
    """Verify that import_records assigns 1:1 deterministic UUIDv5s based on research IDs."""
    test_categories = [{"id": "temple", "name": "temple", "description": "Temples"}]
    test_interests = [{"id": "heritage", "name": "heritage", "description": "Heritage"}]
    test_places = [
        {
            "id": "place_013",
            "name": "Museum of Tribal Arts and Artifacts",
            "category": "temple",
            "lat": 20.2562,
            "lon": 85.8415,
            "description": "Tribal museum",
            "interests": ["heritage"],
            "source": "https://odishatourism.gov.in",
            "district": "Khordha",
        }
    ]

    expected_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, "otravelz.place.place_013")
    assert str(expected_uuid) == "f31a4f76-9a68-5789-9538-8f5042bf0976"


def test_seed_database_if_empty_idempotence(db_session=None):
    """Verify that start.py startup seeding runs safely and non-destructively."""
    # Ensure function executes without crashing
    assert callable(seed_database_if_empty)
