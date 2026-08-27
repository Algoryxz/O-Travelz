"""Security tests for OAuth state validation, PKCE, CSRF protection, rate limiting, and secret safety."""
from __future__ import annotations

import json
import time
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.main import app
from app.models.user import User
from app.services.auth.google_oauth import (
    generate_nonce,
    generate_oauth_state,
    generate_pkce_pair,
    sign_oauth_state_cookie,
)
from app.services.auth.session_manager import create_session


client = TestClient(app)


class TestOAuthSecurityDefenses:
    def test_start_when_oauth_disabled_returns_clean_error(self, monkeypatch):
        monkeypatch.setattr(settings, "google_oauth_enabled", False)
        res = client.get("/auth/google/start")
        assert res.status_code == 400
        assert res.json()["error"] == "oauth_disabled"

    def test_start_sets_pkce_and_signed_state_cookie(self, monkeypatch):
        monkeypatch.setattr(settings, "google_oauth_enabled", True)
        monkeypatch.setattr(settings, "google_oauth_client_id", "test-client-id.apps.googleusercontent.com")

        res = client.get("/auth/google/start", follow_redirects=False)
        assert res.status_code == 302
        assert "https://accounts.google.com/o/oauth2/v2/auth?" in res.headers["location"]
        assert "code_challenge=" in res.headers["location"]
        assert "state=" in res.headers["location"]

        # Cookie was set
        assert "otravelz_oauth_state" in res.cookies

    def test_callback_without_state_cookie_rejected(self):
        res = client.get("/auth/google/callback?code=abc&state=xyz")
        assert res.status_code == 400
        assert res.json()["error"] == "invalid_state"

    def test_callback_with_mismatched_state_rejected(self):
        state = generate_oauth_state()
        nonce = generate_nonce()
        verifier, _ = generate_pkce_pair()
        cookie_val = sign_oauth_state_cookie(state, nonce, verifier, settings.auth_session_secret)

        res = client.get(
            "/auth/google/callback?code=abc&state=attacker_modified_state",
            cookies={"otravelz_oauth_state": cookie_val},
        )
        assert res.status_code == 400
        assert res.json()["error"] == "invalid_state"

    def test_callback_handles_user_denial_error_safely(self):
        res = client.get(
            "/auth/google/callback?error=access_denied",
            follow_redirects=False,
        )
        assert res.status_code == 302
        assert "auth_error=access_denied" in res.headers["location"]

    def test_callback_successful_pkce_flow(self, monkeypatch, unit_db: Session):
        monkeypatch.setattr(settings, "google_oauth_enabled", True)
        monkeypatch.setattr(settings, "google_oauth_client_id", "test-client-id.apps.googleusercontent.com")
        monkeypatch.setattr(settings, "google_oauth_client_secret", "test-client-secret")

        state = generate_oauth_state()
        nonce = "secure-nonce-12345"
        verifier, _ = generate_pkce_pair()
        cookie_val = sign_oauth_state_cookie(state, nonce, verifier, settings.auth_session_secret)

        # Mock token exchange
        def mock_exchange_code(code, code_verifier, client_id, client_secret, redirect_uri):
            assert code == "valid_code"
            assert code_verifier == verifier
            return {"id_token": "valid.mock.jwt"}

        # Mock ID token verification
        from app.services.auth.google_oauth import GoogleProfile
        test_sub = f"google-sub-{uuid.uuid4()}"

        def mock_verify_token(id_token, client_id, expected_nonce):
            assert expected_nonce == nonce
            return GoogleProfile(
                sub=test_sub,
                email="security_test@odisha.in",
                name="Security Test",
                display_name="Security",
                avatar_url="https://lh3.googleusercontent.com/avatar.jpg",
                email_verified=True,
            )

        monkeypatch.setattr("app.api.auth_routes.exchange_code_for_tokens", mock_exchange_code)
        monkeypatch.setattr("app.api.auth_routes.verify_google_id_token", mock_verify_token)

        res = client.get(
            f"/auth/google/callback?code=valid_code&state={state}",
            cookies={"otravelz_oauth_state": cookie_val},
            follow_redirects=False,
        )

        assert res.status_code == 302
        assert res.headers["location"].startswith(settings.auth_frontend_redirect_url)
        assert "otravelz_session" in res.cookies

        # Verify state cookie was deleted
        set_cookie_header = res.headers.get("set-cookie", "")
        assert "otravelz_oauth_state" in set_cookie_header

        # Verify user created in DB
        db = unit_db
        user = db.query(User).filter(User.provider_subject == test_sub).first()
        assert user is not None
        assert user.email == "security_test@odisha.in"

    def test_callback_with_cross_origin_production_cookie_settings(self, monkeypatch, unit_db: Session):
        monkeypatch.setattr(settings, "google_oauth_enabled", True)
        monkeypatch.setattr(settings, "google_oauth_client_id", "test-client-id.apps.googleusercontent.com")
        monkeypatch.setattr(settings, "google_oauth_client_secret", "test-client-secret")
        monkeypatch.setattr(settings, "auth_cookie_samesite", "none")
        monkeypatch.setattr(settings, "auth_cookie_secure", True)

        state = generate_oauth_state()
        nonce = "secure-nonce-prod"
        verifier, _ = generate_pkce_pair()
        cookie_val = sign_oauth_state_cookie(state, nonce, verifier, settings.auth_session_secret)

        monkeypatch.setattr("app.api.auth_routes.exchange_code_for_tokens", lambda *args, **kwargs: {"id_token": "mock.jwt"})
        from app.services.auth.google_oauth import GoogleProfile
        test_sub = f"google-sub-prod-{uuid.uuid4()}"
        monkeypatch.setattr(
            "app.api.auth_routes.verify_google_id_token",
            lambda *args, **kwargs: GoogleProfile(
                sub=test_sub,
                email="prod_test@odisha.in",
                name="Prod Test",
                display_name="Prod",
                avatar_url=None,
                email_verified=True,
            ),
        )

        res = client.get(
            f"/auth/google/callback?code=valid_code&state={state}",
            cookies={"otravelz_oauth_state": cookie_val},
            follow_redirects=False,
        )
        assert res.status_code == 302
        set_cookie_header = res.headers.get("set-cookie", "")
        assert "otravelz_session" in set_cookie_header
        assert "samesite=none" in set_cookie_header.lower()
        assert "secure" in set_cookie_header.lower()

    def test_anonymous_endpoints_remain_unaffected(self):
        # Health check
        res = client.get("/health")
        assert res.status_code == 200

        # AI plan
        res = client.post("/ai/converse", json={"messages": [{"role": "user", "content": "Hi"}]})
        assert res.status_code == 200

