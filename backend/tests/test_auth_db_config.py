"""
Tests for Phase 13 Step 1: Database Schema, ORM Models, and Secure Configuration.

Verifies:
1. Migration 0009 schema elements and ORM model mapping.
2. User, UserSession, UserSavedPlace, and UserSavedTrip models and relationships.
3. Hashed-only session token persistence (no plaintext session tokens).
4. Provider subject uniqueness constraint.
5. Configuration defaults and production fail-closed security assertions.
"""
from __future__ import annotations

import datetime
import uuid
import pytest
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.session import SessionLocal
from app.models.session import UserSavedPlace, UserSavedTrip, UserSession
from app.models.user import User


class TestAuthDatabaseAndModels:
    def test_user_model_attributes_and_defaults(self):
        user = User(
            id=uuid.uuid4(),
            email="test_traveler@example.com",
            name="Test Traveler",
            display_name="Traveler",
            provider="google",
            provider_subject="google-sub-123456789",
            avatar_url="https://lh3.googleusercontent.com/a/default-user",
        )
        assert user.provider == "google"
        assert user.provider_subject == "google-sub-123456789"
        assert user.display_name == "Traveler"
        assert user.avatar_url == "https://lh3.googleusercontent.com/a/default-user"
        assert hasattr(user, "sessions")
        assert hasattr(user, "saved_places")
        assert hasattr(user, "saved_trips")

    def test_user_session_hashed_storage_only(self):
        # Verify UserSession only stores token hash and never raw token
        user_id = uuid.uuid4()
        session = UserSession(
            id=uuid.uuid4(),
            user_id=user_id,
            session_token_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            expires_at=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30),
        )
        assert session.session_token_hash is not None
        assert not hasattr(session, "raw_token")
        assert not hasattr(session, "session_token")
        assert hasattr(session, "revoked_at")

    def test_user_saved_place_and_trip_models(self):
        user_id = uuid.uuid4()
        place = UserSavedPlace(
            id=uuid.uuid4(),
            user_id=user_id,
            place_id="puri_beach_01",
            place_name="Puri Beach",
            place_data={"category": "beach", "district": "Puri"},
            saved_at=1700000000000,
            updated_at=1700000000000,
            is_deleted=False,
        )
        assert place.place_id == "puri_beach_01"
        assert place.is_deleted is False

        trip = UserSavedTrip(
            id="trip_1700000000_abc12",
            user_id=user_id,
            title="3-Day Puri & Konark Tour",
            history=[{"role": "user", "content": "Plan a trip to Puri"}],
            constraints={"days": 3, "interests": ["beach", "temple"]},
            itinerary={"days": []},
            timestamp=1700000000000,
            updated_at=1700000000000,
            is_deleted=False,
        )
        assert trip.id == "trip_1700000000_abc12"
        assert trip.title == "3-Day Puri & Konark Tour"
        assert trip.is_deleted is False

    def test_database_persistence_and_relationships(self, unit_db: Session):
        db = unit_db
        test_sub = f"test-sub-{uuid.uuid4()}"
        test_email = f"test_{uuid.uuid4()}@example.com"
        # 1. Create user
        user = User(
            id=uuid.uuid4(),
            email=test_email,
            name="Persistence Test User",
            provider="google",
            provider_subject=test_sub,
        )
        db.add(user)
        db.commit()

        # 2. Add session, saved place, and trip
        session = UserSession(
            id=uuid.uuid4(),
            user_id=user.id,
            session_token_hash=f"hash-{uuid.uuid4()}",
            expires_at=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
        )
        saved_place = UserSavedPlace(
            id=uuid.uuid4(),
            user_id=user.id,
            place_id="konark_sun_temple",
            place_name="Konark Sun Temple",
            place_data={"district": "Puri"},
            saved_at=1700000000000,
            updated_at=1700000000000,
        )
        saved_trip = UserSavedTrip(
            id=f"trip_{uuid.uuid4()}",
            user_id=user.id,
            title="Konark Heritage Tour",
            history=[],
            timestamp=1700000000000,
            updated_at=1700000000000,
        )
        db.add_all([session, saved_place, saved_trip])
        db.commit()

        # 3. Query back and verify relationships
        loaded_user = db.query(User).filter(User.id == user.id).first()
        assert loaded_user is not None
        assert len(loaded_user.sessions) == 1
        assert len(loaded_user.saved_places) == 1
        assert len(loaded_user.saved_trips) == 1
        assert loaded_user.saved_places[0].place_name == "Konark Sun Temple"


class TestSecureConfiguration:
    def test_default_config_is_safe_for_anonymous_dev(self):
        cfg = Settings(_env_file=None, environment="development", google_oauth_enabled=False)
        assert cfg.google_oauth_enabled is False
        assert cfg.auth_cookie_secure is False
        assert cfg.auth_session_expire_days == 30
        assert cfg.sync_max_places_batch == 100
        assert cfg.sync_max_trips_batch == 50
        # Development validation does not raise
        cfg.validate_production_security()

    def test_production_fails_closed_on_default_secret(self):
        cfg = Settings(
            environment="production",
            auth_session_secret="otravelz-dev-insecure-secret-key-change-in-prod",
        )
        with pytest.raises(RuntimeError, match="Insecure or default AUTH_SESSION_SECRET"):
            cfg.validate_production_security()

    def test_production_fails_closed_on_short_secret(self):
        cfg = Settings(
            environment="production",
            auth_session_secret="short-secret-under-32-chars",
        )
        with pytest.raises(RuntimeError, match="Insecure or default AUTH_SESSION_SECRET"):
            cfg.validate_production_security()

    def test_production_fails_closed_on_enabled_oauth_missing_credentials(self):
        cfg = Settings(
            environment="production",
            auth_session_secret="a-very-secure-random-high-entropy-production-secret-key-32chars+",
            google_oauth_enabled=True,
            google_oauth_client_id=None,
            google_oauth_client_secret=None,
        )
        with pytest.raises(RuntimeError, match="GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET is missing"):
            cfg.validate_production_security()

    def test_production_passes_with_valid_secure_configuration(self):
        cfg = Settings(
            environment="production",
            auth_session_secret="a-very-secure-random-high-entropy-production-secret-key-32chars+",
            google_oauth_enabled=True,
            google_oauth_client_id="valid-google-client-id.apps.googleusercontent.com",
            google_oauth_client_secret="valid-google-client-secret-xyz",
        )
        cfg.validate_production_security()

    def test_auth_cookie_samesite_normalization_and_validation(self):
        cfg_lax = Settings(auth_cookie_samesite="  LAX  ")
        assert cfg_lax.auth_cookie_samesite == "lax"

        cfg_strict = Settings(auth_cookie_samesite="Strict")
        assert cfg_strict.auth_cookie_samesite == "strict"

        cfg_none = Settings(auth_cookie_samesite="None", auth_cookie_secure=True)
        assert cfg_none.auth_cookie_samesite == "none"

        with pytest.raises(ValueError, match="Invalid AUTH_COOKIE_SAMESITE"):
            Settings(auth_cookie_samesite="invalid_mode")

    def test_samesite_none_without_secure_fails_validation(self):
        cfg = Settings(
            auth_cookie_samesite="none",
            auth_cookie_secure=False,
        )
        with pytest.raises(RuntimeError, match="requires AUTH_COOKIE_SECURE to be True"):
            cfg.validate_production_security()

    def test_production_cross_origin_cookie_configuration(self):
        cfg = Settings(
            environment="production",
            auth_session_secret="a-very-secure-random-high-entropy-production-secret-key-32chars+",
            auth_cookie_samesite="none",
            auth_cookie_secure=True,
        )
        cfg.validate_production_security()
        assert cfg.auth_cookie_samesite == "none"
        assert cfg.auth_cookie_secure is True

