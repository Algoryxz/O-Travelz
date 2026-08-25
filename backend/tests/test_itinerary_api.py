from fastapi.testclient import TestClient

from app.ai.schemas import PlanTransportHopArgs
from app.db.session import get_db
from app.main import app
from app.schemas.transport import DataTier, TransportHopContract
from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
from app.transport.adapters.walking import Coordinate


class FakeTransport:
    def plan_transport_hop(self, args: PlanTransportHopArgs) -> TransportHopContract:
        return TransportHopContract(
            from_sequence=args.from_sequence,
            to_sequence=args.to_sequence,
            mode="walk",
            estimated_minutes=1,
            legs=[{"mode": "walk", "detail": "Verified walking fallback"}],
            data_tier=DataTier.STATIC,
        )


def _empty_db():
    yield object()


def _repository():
    return InMemoryPlaceRepository(
        [
            VerifiedPlace(
                database_id="place-1",
                category_id="temple",
                name="Temple One",
                coordinate=Coordinate(20, 85),
            ),
            VerifiedPlace(
                database_id="place-2",
                category_id="temple",
                name="Temple Two",
                coordinate=Coordinate(20, 85.001),
            ),
        ]
    )


def test_itinerary_api_returns_deterministic_facts_only_response(monkeypatch):
    repository = _repository()
    monkeypatch.setattr(
        "app.api.itinerary_routes.SQLAlchemyPlaceRepository",
        lambda db: repository,
    )
    monkeypatch.setattr(
        "app.api.itinerary_routes.TransportService",
        lambda resolver: FakeTransport(),
    )
    app.dependency_overrides[get_db] = _empty_db
    try:
        response = TestClient(app).post(
            "/itinerary/plan",
            json={"days": 1, "interests": ["temple"]},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["explanation"] == ""
    assert [stop["place"]["id"] for stop in body["days"][0]["stops"]] == [
        "place-1",
        "place-2",
    ]
    assert [(hop["from_sequence"], hop["to_sequence"]) for hop in body["days"][0]["hops"]] == [
        (1, 2)
    ]


def test_itinerary_api_returns_structured_complete_planning_failure(monkeypatch):
    null_repository = InMemoryPlaceRepository(
        [VerifiedPlace(database_id="null", category_id="temple", name="Unknown Point")]
    )
    monkeypatch.setattr(
        "app.api.itinerary_routes.SQLAlchemyPlaceRepository",
        lambda db: null_repository,
    )
    monkeypatch.setattr(
        "app.api.itinerary_routes.TransportService",
        lambda resolver: FakeTransport(),
    )
    app.dependency_overrides[get_db] = _empty_db
    try:
        response = TestClient(app).post(
            "/itinerary/plan",
            json={"days": 1, "interests": ["temple"]},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "no_feasible_candidates"
    assert response.json()["details"] == []


def test_itinerary_api_validation_errors_use_existing_structured_contract():
    app.dependency_overrides[get_db] = _empty_db
    try:
        response = TestClient(app).post(
            "/itinerary/plan",
            json={"days": 0, "invented": True},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert response.json()["details"]
