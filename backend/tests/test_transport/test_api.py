from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app


def _empty_db():
    class EmptySession:
        def get(self, model, place_id):
            return None

    yield EmptySession()


def test_transport_hop_returns_contract_valid_unavailable_response_for_missing_place():
    app.dependency_overrides[get_db] = _empty_db
    try:
        response = TestClient(app).post(
            "/transport/hop",
            json={
                "from_place": {"id": "missing-a", "name": "A", "category": "test"},
                "to_place": {"id": "missing-b", "name": "B", "category": "test"},
                "constraints": {"days": 1},
            },
        )
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["mode"] == "unavailable"
    assert response.json()["reason"]


def test_transport_provider_status_is_honest_and_unknown_provider_is_explicit():
    app.dependency_overrides[get_db] = _empty_db
    try:
        client = TestClient(app)
        known = client.get("/transport/providers/ama-bus")
        unknown = client.get("/transport/providers/odisha-yatri")
    finally:
        app.dependency_overrides.clear()
    assert known.status_code == 200
    assert known.json()["data_tier"] == "scheduled"
    assert "live" not in known.json()["notes"].lower()
    assert unknown.status_code == 404
    assert "unsupported" in unknown.json()["detail"]
