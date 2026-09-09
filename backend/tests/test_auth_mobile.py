"""Unit tests for Mobile V4 authentication contracts, Bearer token handling, and deep-link exchanges."""
from __future__ import annotations

import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.user import User
from app.services.auth.session_manager import (
    create_session,
    verify_session,
)


client = TestClient(app)


class TestMobileAuthContracts:
    def test_bearer_token_logout_revokes_session(self, unit_db: Session):
        db = unit_db
        user = User(
            id=uuid.uuid4(),
            email=f"mobile_user_{uuid.uuid4()}@example.com",
            name="Mobile Traveler",
            provider="google",
            provider_subject=f"sub-{uuid.uuid4()}",
        )
        db.add(user)
        db.commit()

        raw_token, session_record = create_session(db, user, expire_days=7)
        assert verify_session(db, raw_token) is not None

        # Verify /auth/me works with Bearer token
        me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {raw_token}"})
        assert me_res.status_code == 200
        assert me_res.json()["authenticated"] is True
        assert me_res.json()["user"]["email"] == user.email

        # Call /auth/logout with Bearer token
        logout_res = client.post("/auth/logout", headers={"Authorization": f"Bearer {raw_token}"})
        assert logout_res.status_code == 200
        assert logout_res.json()["authenticated"] is False

        # Verify session is revoked in database
        assert verify_session(db, raw_token) is None

        # Verify subsequent /auth/me is unauthenticated
        me_after = client.get("/auth/me", headers={"Authorization": f"Bearer {raw_token}"})
        assert me_after.status_code == 200
        assert me_after.json()["authenticated"] is False

    def test_mobile_redirect_uri_validation_rejects_unauthorized_scheme(self):
        res = client.get("/auth/google/start?redirect_uri=https://evil-phishing.com/callback")
        assert res.status_code == 400
        data = res.json()
        assert data["detail"]["error"] == "invalid_redirect_uri"

    def test_mobile_redirect_uri_accepted_in_dev_mode(self):
        # In non-production testing environment with oauth disabled, redirects to mobile URI with auth_ticket
        res = client.get(
            "/auth/google/start?redirect_uri=otravelz://auth/callback",
            follow_redirects=False,
        )
        assert res.status_code == 302
        redirect_location = res.headers.get("location", "")
        assert redirect_location.startswith("otravelz://auth/callback?auth_ticket=")
        assert "auth_ticket=" in redirect_location

    def test_dev_mock_login_and_ticket_exchange(self, unit_db: Session):
        # 1. Generate test session and exchange ticket
        login_res = client.post(
            "/auth/dev/mock-login",
            json={"email": "odisha_explorer@example.com", "name": "Odisha Explorer"},
        )
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert login_data["authenticated"] is True
        assert login_data["user"]["email"] == "odisha_explorer@example.com"
        ticket = login_data["exchange_ticket"]
        assert len(ticket) > 20

        # 2. Native mobile app exchanges ticket
        exchange_res = client.post("/auth/session/exchange", json={"ticket": ticket})
        assert exchange_res.status_code == 200
        exchange_data = exchange_res.json()
        assert exchange_data["authenticated"] is True
        assert exchange_data["user"]["email"] == "odisha_explorer@example.com"
        session_token = exchange_data["session_token"]
        assert len(session_token) >= 32

        # 3. Replay of burned ticket must fail
        replay_res = client.post("/auth/session/exchange", json={"ticket": ticket})
        assert replay_res.status_code == 400
        assert replay_res.json()["detail"]["error"] == "invalid_ticket"

        # 4. Exchanged session token works on /auth/me
        me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {session_token}"})
        assert me_res.status_code == 200
        assert me_res.json()["authenticated"] is True
        assert me_res.json()["user"]["name"] == "Odisha Explorer"
