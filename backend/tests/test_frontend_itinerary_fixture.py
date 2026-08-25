import json
from pathlib import Path

from app.schemas.itinerary import ItineraryResponse


def test_frontend_fixture_matches_backend_itinerary_contract():
    repository_root = Path(__file__).resolve().parents[2]
    fixture = repository_root / "frontend" / "tests" / "fixtures" / "sample_itinerary.json"

    response = ItineraryResponse.model_validate(json.loads(fixture.read_text(encoding="utf-8")))

    assert response.days[0].stops[0].place.id == "p1"
    assert response.days[0].hops[0].data_tier.value == "static"
