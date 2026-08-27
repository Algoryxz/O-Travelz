"""Comprehensive test suite for Phase 14 Step 2: Shareable Itinerary Deep-Linking & Public Read-Only Trip Snapshot API.
"""
from __future__ import annotations

import datetime
import json
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.ai.rate_limit import rate_limiter
from app.core.config import settings
from app.db.session import SessionLocal
from app.main import app
from app.models.session import SharedTripSnapshot, UserSession
from app.models.user import User
from app.services.auth.session_manager import create_session, hash_session_token


@pytest.fixture(autouse=True)
def reset_rate_limiters():
    rate_limiter.reset()
    yield
    rate_limiter.reset()


@pytest.fixture
def db_session(unit_db: Session):
    yield unit_db


@pytest.fixture
def test_user_and_session(db_session: Session):
    # Create test user
    user = User(
        id=uuid.uuid4(),
        email=f"traveler_{uuid.uuid4().hex[:8]}@example.com",
        name="Odisha Explorer",
        display_name="Explorer",
        provider="google",
        provider_subject=f"sub_{uuid.uuid4().hex}",
    )
    db_session.add(user)
    db_session.commit()

    # Create active session
    raw_token, session = create_session(db_session, user)

    yield {
        "user": user,
        "raw_token": raw_token,
        "session": session,
    }

    # Cleanup
    db_session.query(SharedTripSnapshot).filter(SharedTripSnapshot.user_id == user.id).delete()
    db_session.query(UserSession).filter(UserSession.user_id == user.id).delete()
    db_session.query(User).filter(User.id == user.id).delete()
    db_session.commit()


@pytest.fixture
def test_user_2_and_session(db_session: Session):
    user = User(
        id=uuid.uuid4(),
        email=f"traveler2_{uuid.uuid4().hex[:8]}@example.com",
        name="Second Explorer",
        display_name="Explorer 2",
        provider="google",
        provider_subject=f"sub_{uuid.uuid4().hex}",
    )
    db_session.add(user)
    db_session.commit()

    raw_token, session = create_session(db_session, user)


    yield {
        "user": user,
        "raw_token": raw_token,
        "session": session,
    }

    db_session.query(SharedTripSnapshot).filter(SharedTripSnapshot.user_id == user.id).delete()
    db_session.query(UserSession).filter(UserSession.user_id == user.id).delete()
    db_session.query(User).filter(User.id == user.id).delete()
    db_session.commit()


class TestShareTripsAPI:
    """Test suite for /api/v1/trips/share and /api/v1/trips/shared/{share_id}."""

    SAMPLE_ITINERARY = {
        "itinerary_id": "itin_test_123",
        "days": [
            {
                "day_number": 1,
                "stops": [
                    {
                        "place_id": "puri_jagannath_temple",
                        "place_name": "Jagannath Temple",
                        "duration_minutes": 120,
                        "category": "temple",
                    },
                    {
                        "place_id": "golden_beach_puri",
                        "place_name": "Golden Beach Puri",
                        "duration_minutes": 90,
                        "category": "beach",
                    },
                ],
            }
        ],
        "constraints": {
            "days": 1,
            "interests": ["temple", "beach"],
            "start": "Puri",
        },
    }

    def test_authenticated_share_creation_success(
        self,
        test_user_and_session: dict,
        db_session: Session,
    ):
        raw_token = test_user_and_session["raw_token"]
        user = test_user_and_session["user"]

        client = TestClient(app, cookies={settings.auth_session_cookie_name: raw_token})

        payload = {
            "title": "1-Day Puri Heritage & Beach Tour",
            "itinerary": self.SAMPLE_ITINERARY,
            "constraints": {"days": 1, "interests": ["temple", "beach"]},
        }

        response = client.post("/api/v1/trips/share", json=payload)
        assert response.status_code == 200, response.text
        data = response.json()

        assert "share_id" in data
        assert "share_url" in data
        assert "created_at" in data
        assert len(data["share_id"]) >= 20
        assert data["share_url"] == f"/#trip/shared/{data['share_id']}"

        # Verify database record
        snapshot = (
            db_session.query(SharedTripSnapshot)
            .filter(SharedTripSnapshot.share_id == data["share_id"])
            .first()
        )
        assert snapshot is not None
        assert snapshot.user_id == user.id
        assert snapshot.title == "1-Day Puri Heritage & Beach Tour"
        assert snapshot.snapshot_data["itinerary"]["itinerary_id"] == "itin_test_123"

    def test_anonymous_share_creation_fails_401(self):
        client = TestClient(app)
        payload = {
            "title": "Unauthorized Share Attempt",
            "itinerary": self.SAMPLE_ITINERARY,
        }
        response = client.post("/api/v1/trips/share", json=payload)
        assert response.status_code == 401

    def test_client_supplied_user_id_ignored(
        self,
        test_user_and_session: dict,
        db_session: Session,
    ):
        raw_token = test_user_and_session["raw_token"]
        actual_user = test_user_and_session["user"]
        fake_user_id = str(uuid.uuid4())

        client = TestClient(app, cookies={settings.auth_session_cookie_name: raw_token})

        payload = {
            "title": "Spoofed Ownership Test",
            "user_id": fake_user_id,
            "itinerary": self.SAMPLE_ITINERARY,
        }

        response = client.post("/api/v1/trips/share", json=payload)
        assert response.status_code == 200
        data = response.json()

        snapshot = (
            db_session.query(SharedTripSnapshot)
            .filter(SharedTripSnapshot.share_id == data["share_id"])
            .first()
        )
        assert snapshot is not None
        # Must be bound to actual authenticated user ID, not the fake one
        assert snapshot.user_id == actual_user.id
        assert snapshot.user_id != uuid.UUID(fake_user_id)

    def test_share_id_uniqueness(
        self,
        test_user_and_session: dict,
    ):
        raw_token = test_user_and_session["raw_token"]
        client = TestClient(app, cookies={settings.auth_session_cookie_name: raw_token})

        share_ids = set()
        for i in range(5):
            res = client.post(
                "/api/v1/trips/share",
                json={
                    "title": f"Trip Variation {i}",
                    "itinerary": self.SAMPLE_ITINERARY,
                },
            )
            assert res.status_code == 200
            share_ids.add(res.json()["share_id"])

        assert len(share_ids) == 5

    def test_public_shared_trip_retrieval_and_privacy(
        self,
        test_user_and_session: dict,
    ):
        raw_token = test_user_and_session["raw_token"]
        auth_client = TestClient(app, cookies={settings.auth_session_cookie_name: raw_token})

        # 1. Create share
        create_res = auth_client.post(
            "/api/v1/trips/share",
            json={
                "title": "Public Read-Only Trip",
                "itinerary": self.SAMPLE_ITINERARY,
                "constraints": {"days": 1},
            },
        )
        assert create_res.status_code == 200
        share_id = create_res.json()["share_id"]

        # 2. Fetch via unauthenticated public client
        public_client = TestClient(app)
        get_res = public_client.get(f"/api/v1/trips/shared/{share_id}")
        assert get_res.status_code == 200
        data = get_res.json()

        assert data["share_id"] == share_id
        assert data["title"] == "Public Read-Only Trip"
        assert data["itinerary"]["itinerary_id"] == "itin_test_123"
        assert data["constraints"] == {"days": 1}
        assert "created_at" in data

        # Security check: Zero private metadata exposed
        assert "user_id" not in data
        assert "owner" not in data
        assert "email" not in data
        assert "session" not in data
        assert "token" not in data
        assert "id" not in data or data["id"] == share_id

    def test_public_retrieval_does_not_mutate_snapshot(
        self,
        test_user_and_session: dict,
        db_session: Session,
    ):
        raw_token = test_user_and_session["raw_token"]
        auth_client = TestClient(app, cookies={settings.auth_session_cookie_name: raw_token})

        create_res = auth_client.post(
            "/api/v1/trips/share",
            json={
                "title": "Immutable Snapshot Test",
                "itinerary": self.SAMPLE_ITINERARY,
            },
        )
        share_id = create_res.json()["share_id"]

        public_client = TestClient(app)
        res1 = public_client.get(f"/api/v1/trips/shared/{share_id}")
        res2 = public_client.get(f"/api/v1/trips/shared/{share_id}")

        assert res1.json() == res2.json()

    def test_unknown_share_id_returns_404(self):
        client = TestClient(app)
        response = client.get("/api/v1/trips/shared/nonexistent_share_token_12345")
        assert response.status_code == 404
        assert response.json()["detail"]["error"] == "not_found"

    def test_expired_share_id_returns_404(
        self,
        test_user_and_session: dict,
        db_session: Session,
    ):
        user = test_user_and_session["user"]
        expired_snapshot = SharedTripSnapshot(
            share_id="expired_share_token_99999",
            user_id=user.id,
            title="Expired Trip",
            snapshot_data={"title": "Expired Trip", "itinerary": self.SAMPLE_ITINERARY},
            created_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=60),
            expires_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1),
        )
        db_session.add(expired_snapshot)
        db_session.commit()

        client = TestClient(app)
        response = client.get("/api/v1/trips/shared/expired_share_token_99999")
        assert response.status_code == 404
        assert response.json()["detail"]["error"] == "expired"

    def test_oversized_payload_rejected_422(
        self,
        test_user_and_session: dict,
    ):
        raw_token = test_user_and_session["raw_token"]
        client = TestClient(app, cookies={settings.auth_session_cookie_name: raw_token})

        # Huge itinerary payload exceeding 50KB
        huge_stops = [
            {
                "place_id": f"place_{i}",
                "place_name": f"Huge Destination Place Name Number {i} with extensive descriptions",
                "notes": "A" * 1000,
            }
            for i in range(100)
        ]
        oversized_payload = {
            "title": "Oversized Trip",
            "itinerary": {"days": [{"day_number": 1, "stops": huge_stops}]},
        }

        response = client.post("/api/v1/trips/share", json=oversized_payload)
        assert response.status_code == 422
        assert response.json()["detail"]["error"] == "payload_too_large"

    def test_share_creation_rate_limiting_429(
        self,
        test_user_and_session: dict,
        test_user_2_and_session: dict,
    ):
        raw_token = test_user_and_session["raw_token"]
        client = TestClient(app, cookies={settings.auth_session_cookie_name: raw_token})

        payload = {
            "title": "Rate Limit Test Trip",
            "itinerary": self.SAMPLE_ITINERARY,
        }

        # Exhaust 20 requests
        for i in range(settings.share_rate_limit_requests):
            res = client.post("/api/v1/trips/share", json=payload)
            assert res.status_code == 200

        # 21st request must trigger 429
        rate_limited_res = client.post("/api/v1/trips/share", json=payload)
        assert rate_limited_res.status_code == 429
        assert "Retry-After" in rate_limited_res.headers
        assert rate_limited_res.json()["detail"]["error"] == "rate_limited"

        # Quota isolation: Second user should still succeed
        client2 = TestClient(
            app,
            cookies={settings.auth_session_cookie_name: test_user_2_and_session["raw_token"]},
        )
        user2_res = client2.post("/api/v1/trips/share", json=payload)
        assert user2_res.status_code == 200

    def test_inert_json_safety(
        self,
        test_user_and_session: dict,
    ):
        raw_token = test_user_and_session["raw_token"]
        client = TestClient(app, cookies={settings.auth_session_cookie_name: raw_token})

        malicious_string = "<script>alert('xss')</script>; DROP TABLE users; --"
        payload = {
            "title": malicious_string,
            "itinerary": {
                "days": [
                    {
                        "day_number": 1,
                        "stops": [{"place_id": "puri_01", "place_name": malicious_string}],
                    }
                ]
            },
        }

        create_res = client.post("/api/v1/trips/share", json=payload)
        assert create_res.status_code == 200
        share_id = create_res.json()["share_id"]

        public_client = TestClient(app)
        get_res = public_client.get(f"/api/v1/trips/shared/{share_id}")
        assert get_res.status_code == 200
        data = get_res.json()
        assert data["title"] == malicious_string
        assert data["itinerary"]["days"][0]["stops"][0]["place_name"] == malicious_string
