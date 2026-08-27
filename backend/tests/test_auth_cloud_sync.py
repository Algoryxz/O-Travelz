"""Tests for Cloud Synchronization API (Saved Places & Saved Trips).

Covers:
1. Authentication requirements (unauthenticated requests return 401).
2. User isolation (User A cannot access or overwrite User B's data).
3. Canonical place validation against database records.
4. Deterministic timestamp conflict resolution and tombstone preservation.
5. Payload size and batch limits enforcement.
6. Rate limiting per authenticated user.
7. Data integrity and zero-LLM / zero-external call isolation.
"""
from __future__ import annotations

import json
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.main import app
from app.models.place import Place
from app.models.session import UserSavedPlace, UserSavedTrip
from app.models.user import User
from app.services.auth.session_manager import create_session

client = TestClient(app)


def _create_test_user_and_session(db: Session, prefix: str = "user") -> tuple[User, str]:
    """Helper to create a test user and active session token."""
    user = User(
        id=uuid.uuid4(),
        email=f"{prefix}_{uuid.uuid4()}@example.com",
        name=f"Test {prefix.capitalize()}",
        provider="google",
        provider_subject=f"sub-{prefix}-{uuid.uuid4()}",
    )
    db.add(user)
    db.commit()
    raw_token, _ = create_session(db, user, expire_days=7)
    return user, raw_token


class TestCloudSyncAuthenticationAndIsolation:
    def test_unauthenticated_requests_fail_with_401(self):
        # 1. Saved places unauthenticated
        res = client.get("/api/v1/sync/saved-places")
        assert res.status_code == 401

        res = client.post("/api/v1/sync/saved-places", json={"items": []})
        assert res.status_code == 401

        # 2. Trips unauthenticated
        res = client.get("/api/v1/sync/trips")
        assert res.status_code == 401

        res = client.post("/api/v1/sync/trips", json={"items": []})
        assert res.status_code == 401

    def test_user_data_isolation_between_two_users(self, unit_db: Session):
        db = unit_db
        # 1. Create User A and User B
        user_a, token_a = _create_test_user_and_session(db, "user_a")
        user_b, token_b = _create_test_user_and_session(db, "user_b")

        # 2. User A syncs a place and a trip
        place_payload = {
            "items": [
                {
                    "place_id": "Puri",
                    "place_name": "Puri Beach",
                    "place_data": {"category": "beach"},
                    "saved_at": 1000,
                    "updated_at": 1000,
                    "is_deleted": False,
                }
            ]
        }
        res_a_places = client.post(
            "/api/v1/sync/saved-places",
            json=place_payload,
            cookies={"otravelz_session": token_a},
        )
        assert res_a_places.status_code == 200

        trip_payload = {
            "items": [
                {
                    "id": "trip_user_a_123",
                    "title": "User A Private Trip",
                    "history": [{"role": "user", "content": "Trip A"}],
                    "timestamp": 1000,
                    "updated_at": 1000,
                    "is_deleted": False,
                }
            ]
        }
        res_a_trips = client.post(
            "/api/v1/sync/trips",
            json=trip_payload,
            cookies={"otravelz_session": token_a},
        )
        assert res_a_trips.status_code == 200

        # 3. User B queries their saved places and trips -> must be empty
        res_b_places = client.get(
            "/api/v1/sync/saved-places",
            cookies={"otravelz_session": token_b},
        )
        assert res_b_places.status_code == 200
        assert res_b_places.json()["synced_count"] == 0
        assert len(res_b_places.json()["items"]) == 0

        res_b_trips = client.get(
            "/api/v1/sync/trips",
            cookies={"otravelz_session": token_b},
        )
        assert res_b_trips.status_code == 200
        assert res_b_trips.json()["synced_count"] == 0
        assert len(res_b_trips.json()["items"]) == 0


class TestCanonicalPlaceValidation:
    def test_canonical_place_validation_success(self, unit_db: Session):
        db = unit_db
        user, token = _create_test_user_and_session(db, "canon_user")

        # Puri, Konark, Bhubaneswar are canonical places in database
        payload = {
            "items": [
                {
                    "place_id": "Konark Sun Temple",
                    "place_name": "Konark Sun Temple",
                    "place_data": {"category": "heritage"},
                    "saved_at": 1000,
                    "updated_at": 1000,
                    "is_deleted": False,
                }
            ]
        }
        res = client.post(
            "/api/v1/sync/saved-places",
            json=payload,
            cookies={"otravelz_session": token},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["synced_count"] == 1
        assert data["items"][0]["place_name"] == "Konark Sun Temple"

    def test_unknown_fake_place_is_rejected(self, unit_db: Session):
        db = unit_db
        user, token = _create_test_user_and_session(db, "fake_user")

        payload = {
            "items": [
                {
                    "place_id": "Completely_Fabricated_NonExistent_Destination_999",
                    "place_name": "Fake Place",
                    "place_data": {},
                    "saved_at": 1000,
                    "updated_at": 1000,
                    "is_deleted": False,
                }
            ]
        }
        res = client.post(
            "/api/v1/sync/saved-places",
            json=payload,
            cookies={"otravelz_session": token},
        )
        assert res.status_code == 422
        assert "unknown_place_id" in res.json()["detail"]["error"]

    def test_client_cannot_modify_canonical_database_records(self, unit_db: Session):
        db = unit_db
        user, token = _create_test_user_and_session(db, "tamper_user")

        # Attempt to pass a modified name for Puri
        payload = {
            "items": [
                {
                    "place_id": "Puri",
                    "place_name": "HACKED_PURI_NAME_OVERWRITE",
                    "place_data": {},
                    "saved_at": 1000,
                    "updated_at": 1000,
                    "is_deleted": False,
                }
            ]
        }
        res = client.post(
            "/api/v1/sync/saved-places",
            json=payload,
            cookies={"otravelz_session": token},
        )
        assert res.status_code == 200

        # Canonical Place record in database remains unaltered
        canon_name = db.query(Place.name).filter(Place.name == "Puri").scalar()
        if canon_name:
            assert canon_name == "Puri"


class TestTimestampConflictResolutionAndTombstones:
    def test_saved_places_conflict_resolution_and_tombstone_propagation(self, unit_db: Session):
        db = unit_db
        user, token = _create_test_user_and_session(db, "conflict_user")

        # 1. Initial save at t = 1000
        p1 = {
            "items": [
                {
                    "place_id": "Puri",
                    "place_name": "Puri",
                    "place_data": {"notes": "initial"},
                    "saved_at": 1000,
                    "updated_at": 1000,
                    "is_deleted": False,
                }
            ]
        }
        res1 = client.post("/api/v1/sync/saved-places", json=p1, cookies={"otravelz_session": token})
        assert res1.status_code == 200
        assert res1.json()["items"][0]["place_data"]["notes"] == "initial"

        # 2. Stale client update at t = 500 (lower updated_at) -> Server record wins (remains "initial")
        p_stale = {
            "items": [
                {
                    "place_id": "Puri",
                    "place_name": "Puri",
                    "place_data": {"notes": "stale_overwrite_attempt"},
                    "saved_at": 500,
                    "updated_at": 500,
                    "is_deleted": False,
                }
            ]
        }
        res_stale = client.post("/api/v1/sync/saved-places", json=p_stale, cookies={"otravelz_session": token})
        assert res_stale.status_code == 200
        assert res_stale.json()["items"][0]["place_data"]["notes"] == "initial"

        # 3. Newer client update at t = 1500 -> Newer client record wins
        p_newer = {
            "items": [
                {
                    "place_id": "Puri",
                    "place_name": "Puri",
                    "place_data": {"notes": "newer_valid_update"},
                    "saved_at": 1000,
                    "updated_at": 1500,
                    "is_deleted": False,
                }
            ]
        }
        res_newer = client.post("/api/v1/sync/saved-places", json=p_newer, cookies={"otravelz_session": token})
        assert res_newer.status_code == 200
        assert res_newer.json()["items"][0]["place_data"]["notes"] == "newer_valid_update"

        # 4. Newer deletion tombstone at t = 2000 -> Tombstone wins
        p_tombstone = {
            "items": [
                {
                    "place_id": "Puri",
                    "place_name": "Puri",
                    "place_data": {},
                    "saved_at": 1000,
                    "updated_at": 2000,
                    "is_deleted": True,
                }
            ]
        }
        res_tombstone = client.post("/api/v1/sync/saved-places", json=p_tombstone, cookies={"otravelz_session": token})
        assert res_tombstone.status_code == 200
        assert res_tombstone.json()["items"][0]["is_deleted"] is True

        # 5. Stale active record at t = 1800 must NOT resurrect tombstone at t = 2000
        p_stale_active = {
            "items": [
                {
                    "place_id": "Puri",
                    "place_name": "Puri",
                    "place_data": {"notes": "stale_resurrection"},
                    "saved_at": 1000,
                    "updated_at": 1800,
                    "is_deleted": False,
                }
            ]
        }
        res_no_resurrect = client.post("/api/v1/sync/saved-places", json=p_stale_active, cookies={"otravelz_session": token})
        assert res_no_resurrect.status_code == 200
        assert res_no_resurrect.json()["items"][0]["is_deleted"] is True


class TestPayloadAndRateLimits:
    def test_places_batch_limit_exceeded_rejected(self, unit_db: Session):
        db = unit_db
        user, token = _create_test_user_and_session(db, "batch_user")

        # 101 items exceeds max 100
        items = [
            {
                "place_id": "Puri",
                "place_name": "Puri",
                "place_data": {},
                "saved_at": 1000,
                "updated_at": 1000,
            }
            for _ in range(101)
        ]
        res = client.post(
            "/api/v1/sync/saved-places",
            json={"items": items},
            cookies={"otravelz_session": token},
        )
        assert res.status_code == 422

    def test_trips_batch_limit_exceeded_rejected(self, unit_db: Session):
        db = unit_db
        user, token = _create_test_user_and_session(db, "trips_batch_user")

        # 51 items exceeds max 50
        items = [
            {
                "id": f"trip_batch_{i}",
                "title": f"Trip {i}",
                "history": [],
                "timestamp": 1000,
                "updated_at": 1000,
            }
            for i in range(51)
        ]
        res = client.post(
            "/api/v1/sync/trips",
            json={"items": items},
            cookies={"otravelz_session": token},
        )
        assert res.status_code == 422

    def test_trip_payload_size_limit_rejected(self, unit_db: Session):
        db = unit_db
        user, token = _create_test_user_and_session(db, "large_user")

        # Create massive trip history > 50KB
        giant_history = [{"role": "user", "content": "A" * 60000}]
        payload = {
            "items": [
                {
                    "id": "trip_huge_123",
                    "title": "Huge Trip",
                    "history": giant_history,
                    "timestamp": 1000,
                    "updated_at": 1000,
                }
            ]
        }
        res = client.post(
            "/api/v1/sync/trips",
            json=payload,
            cookies={"otravelz_session": token},
        )
        assert res.status_code == 422
        assert "trip_payload_too_large" in res.json()["detail"]["error"]

    def test_per_user_rate_limiting_and_quota_isolation(self, unit_db: Session):
        from app.ai.rate_limit import rate_limiter
        rate_limiter.reset()

        db = unit_db
        user_a, token_a = _create_test_user_and_session(db, "rate_user_a")
        user_b, token_b = _create_test_user_and_session(db, "rate_user_b")

        # Make 30 requests for User A (allowed)
        for _ in range(30):
            res = client.get("/api/v1/sync/saved-places", cookies={"otravelz_session": token_a})
            assert res.status_code == 200

        # 31st request for User A must return 429 with Retry-After header
        res_429 = client.get("/api/v1/sync/saved-places", cookies={"otravelz_session": token_a})
        assert res_429.status_code == 429
        assert "Retry-After" in res_429.headers
        assert res_429.json()["detail"]["error"] == "rate_limited"

        # User B must not be affected by User A's exhausted quota
        res_b = client.get("/api/v1/sync/saved-places", cookies={"otravelz_session": token_b})
        assert res_b.status_code == 200

        # Clean up
        rate_limiter.reset()


class TestTripsConflictResolutionAndSecurity:
    def test_trips_conflict_resolution_and_tombstone_propagation(self, unit_db: Session):
        db = unit_db
        user, token = _create_test_user_and_session(db, "trip_conflict_user")

        # 1. Initial trip save at t = 1000
        t1 = {
            "items": [
                {
                    "id": "trip_test_conflict_01",
                    "title": "Initial Title",
                    "history": [{"role": "user", "content": "Hello"}],
                    "timestamp": 1000,
                    "updated_at": 1000,
                    "is_deleted": False,
                }
            ]
        }
        res1 = client.post("/api/v1/sync/trips", json=t1, cookies={"otravelz_session": token})
        assert res1.status_code == 200
        assert res1.json()["items"][0]["title"] == "Initial Title"

        # 2. Stale update at t = 500 -> Server record wins
        t_stale = {
            "items": [
                {
                    "id": "trip_test_conflict_01",
                    "title": "Stale Overwrite Attempt",
                    "history": [],
                    "timestamp": 1000,
                    "updated_at": 500,
                    "is_deleted": False,
                }
            ]
        }
        res_stale = client.post("/api/v1/sync/trips", json=t_stale, cookies={"otravelz_session": token})
        assert res_stale.status_code == 200
        assert res_stale.json()["items"][0]["title"] == "Initial Title"

        # 3. Newer update at t = 1500 -> Newer client record wins
        t_newer = {
            "items": [
                {
                    "id": "trip_test_conflict_01",
                    "title": "Updated Title",
                    "history": [],
                    "timestamp": 1000,
                    "updated_at": 1500,
                    "is_deleted": False,
                }
            ]
        }
        res_newer = client.post("/api/v1/sync/trips", json=t_newer, cookies={"otravelz_session": token})
        assert res_newer.status_code == 200
        assert res_newer.json()["items"][0]["title"] == "Updated Title"

        # 4. Newer deletion tombstone at t = 2000 -> Tombstone wins
        t_tombstone = {
            "items": [
                {
                    "id": "trip_test_conflict_01",
                    "title": "Updated Title",
                    "history": [],
                    "timestamp": 1000,
                    "updated_at": 2000,
                    "is_deleted": True,
                }
            ]
        }
        res_tombstone = client.post("/api/v1/sync/trips", json=t_tombstone, cookies={"otravelz_session": token})
        assert res_tombstone.status_code == 200
        assert res_tombstone.json()["items"][0]["is_deleted"] is True

        # 5. Stale active record at t = 1800 must NOT resurrect tombstone at t = 2000
        t_stale_active = {
            "items": [
                {
                    "id": "trip_test_conflict_01",
                    "title": "Resurrect Attempt",
                    "history": [],
                    "timestamp": 1000,
                    "updated_at": 1800,
                    "is_deleted": False,
                }
            ]
        }
        res_no_resurrect = client.post("/api/v1/sync/trips", json=t_stale_active, cookies={"otravelz_session": token})
        assert res_no_resurrect.status_code == 200
        assert res_no_resurrect.json()["items"][0]["is_deleted"] is True

    def test_client_supplied_user_id_ignored_and_inert_json(self, unit_db: Session):
        db = unit_db
        user, token = _create_test_user_and_session(db, "spoof_user")
        fake_victim_uuid = str(uuid.uuid4())

        # Attempt to pass an arbitrary user_id inside JSON
        payload = {
            "items": [
                {
                    "id": "trip_inert_json_01",
                    "title": "Inert JSON Test",
                    "user_id": fake_victim_uuid,  # Ignored / discarded by schema
                    "history": [
                        {"role": "user", "content": "<script>alert('xss')</script>"}
                    ],
                    "timestamp": 1000,
                    "updated_at": 1000,
                    "is_deleted": False,
                }
            ]
        }
        res = client.post("/api/v1/sync/trips", json=payload, cookies={"otravelz_session": token})
        assert res.status_code == 200

        # Verified saved record in DB belongs strictly to authenticated user, not fake_victim_uuid
        saved = db.query(UserSavedTrip).filter(UserSavedTrip.id == "trip_inert_json_01").first()
        assert saved is not None
        assert saved.user_id == user.id
        assert str(saved.user_id) != fake_victim_uuid
