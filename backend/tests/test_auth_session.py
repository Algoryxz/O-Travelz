"""Unit and integration tests for SessionManager and authenticated user lifecycle."""
from __future__ import annotations

import datetime
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models.session import UserSession
from app.models.user import User
from app.services.auth.google_oauth import GoogleProfile
from app.services.auth.session_manager import (
    create_session,
    hash_session_token,
    resolve_or_create_user,
    revoke_session,
    verify_session,
)


client = TestClient(app)


class TestSessionManagerLifecycle:
    def test_create_and_verify_active_session(self):
        db: Session = SessionLocal()
        try:
            user = User(
                id=uuid.uuid4(),
                email=f"traveler_{uuid.uuid4()}@example.com",
                name="Session Test User",
                provider="google",
                provider_subject=f"sub-{uuid.uuid4()}",
            )
            db.add(user)
            db.commit()

            raw_token, session_record = create_session(db, user, expire_days=7)
            assert raw_token is not None
            assert len(raw_token) >= 32
            # Hashed token is stored, not raw token
            assert session_record.session_token_hash == hash_session_token(raw_token)
            assert session_record.revoked_at is None

            # Verify session resolves active user
            resolved_user = verify_session(db, raw_token)
            assert resolved_user is not None
            assert resolved_user.id == user.id

            # Clean up
            db.delete(user)
            db.commit()
        finally:
            db.close()

    def test_expired_session_rejected(self):
        db: Session = SessionLocal()
        try:
            user = User(
                id=uuid.uuid4(),
                email=f"traveler_{uuid.uuid4()}@example.com",
                name="Expired Test User",
                provider="google",
                provider_subject=f"sub-{uuid.uuid4()}",
            )
            db.add(user)
            db.commit()

            raw_token, session_record = create_session(db, user, expire_days=-1)
            # Expired session must return None
            resolved_user = verify_session(db, raw_token)
            assert resolved_user is None

            # Clean up
            db.delete(user)
            db.commit()
        finally:
            db.close()

    def test_revoked_session_rejected(self):
        db: Session = SessionLocal()
        try:
            user = User(
                id=uuid.uuid4(),
                email=f"traveler_{uuid.uuid4()}@example.com",
                name="Revoke Test User",
                provider="google",
                provider_subject=f"sub-{uuid.uuid4()}",
            )
            db.add(user)
            db.commit()

            raw_token, session_record = create_session(db, user, expire_days=7)
            assert verify_session(db, raw_token) is not None

            # Revoke session
            assert revoke_session(db, raw_token) is True

            # Verify session now returns None
            assert verify_session(db, raw_token) is None

            # Clean up
            db.delete(user)
            db.commit()
        finally:
            db.close()

    def test_user_resolution_and_profile_upsert(self):
        db: Session = SessionLocal()
        test_sub = f"google-sub-{uuid.uuid4()}"
        try:
            # 1. First login creates user
            profile1 = GoogleProfile(
                sub=test_sub,
                email="first_login@example.com",
                name="First Name",
                display_name="First",
                avatar_url="https://lh3.googleusercontent.com/1.jpg",
            )
            u1 = resolve_or_create_user(db, profile1)
            assert u1.id is not None
            assert u1.email == "first_login@example.com"
            assert u1.display_name == "First"

            # 2. Second login with updated name updates existing record without duplicate
            profile2 = GoogleProfile(
                sub=test_sub,
                email="first_login@example.com",
                name="Updated Name",
                display_name="Updated",
                avatar_url="https://lh3.googleusercontent.com/2.jpg",
            )
            u2 = resolve_or_create_user(db, profile2)
            assert u2.id == u1.id
            assert u2.display_name == "Updated"
            assert u2.avatar_url == "https://lh3.googleusercontent.com/2.jpg"

            # Clean up
            db.delete(u1)
            db.commit()
        finally:
            db.close()


class TestAuthAPIEndpoints:
    def test_get_me_unauthenticated(self):
        res = client.get("/auth/me")
        assert res.status_code == 200
        data = res.json()
        assert data["authenticated"] is False
        assert data["user"] is None

    def test_get_me_authenticated_with_valid_cookie(self):
        db: Session = SessionLocal()
        try:
            user = User(
                id=uuid.uuid4(),
                email=f"authenticated_{uuid.uuid4()}@example.com",
                name="Authenticated Traveler",
                display_name="Traveler",
                provider="google",
                provider_subject=f"sub-{uuid.uuid4()}",
                avatar_url="https://lh3.googleusercontent.com/avatar.jpg",
            )
            db.add(user)
            db.commit()

            raw_token, _ = create_session(db, user, expire_days=7)

            res = client.get(
                "/auth/me",
                cookies={"otravelz_session": raw_token},
            )
            assert res.status_code == 200
            data = res.json()
            assert data["authenticated"] is True
            assert data["user"]["id"] == str(user.id)
            assert data["user"]["email"] == user.email
            assert data["user"]["display_name"] == "Traveler"
            assert data["user"]["provider"] == "google"

            # Clean up
            db.delete(user)
            db.commit()
        finally:
            db.close()

    def test_logout_endpoint_clears_cookie_and_revokes_session(self):
        db: Session = SessionLocal()
        try:
            user = User(
                id=uuid.uuid4(),
                email=f"logout_{uuid.uuid4()}@example.com",
                name="Logout User",
                provider="google",
                provider_subject=f"sub-{uuid.uuid4()}",
            )
            db.add(user)
            db.commit()

            raw_token, session_record = create_session(db, user, expire_days=7)

            res = client.post(
                "/auth/logout",
                cookies={"otravelz_session": raw_token},
            )
            assert res.status_code == 200
            assert res.json()["authenticated"] is False

            # Session is revoked in database
            assert verify_session(db, raw_token) is None

            # Clean up
            db.delete(user)
            db.commit()
        finally:
            db.close()
