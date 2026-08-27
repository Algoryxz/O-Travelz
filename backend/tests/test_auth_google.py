"""Unit and integration tests for Google OAuth PKCE and ID Token validation."""
from __future__ import annotations

import json
import time
import urllib.error
import pytest

from app.services.auth.google_oauth import (
    GoogleOAuthError,
    _base64url_decode,
    _base64url_encode,
    build_authorization_url,
    create_auth_exchange_ticket,
    exchange_code_for_tokens,
    generate_nonce,
    generate_oauth_state,
    generate_pkce_pair,
    sign_oauth_state_cookie,
    verify_and_burn_auth_exchange_ticket,
    verify_and_decode_oauth_state_cookie,
    verify_google_id_token,
)


class TestGoogleOAuthCore:
    def test_pkce_generation_and_challenge_derivation(self):
        verifier, challenge = generate_pkce_pair()
        assert len(verifier) >= 43
        assert len(challenge) >= 43
        assert verifier != challenge
        # Verifier must be url-safe ascii
        assert verifier.isalnum() or "-" in verifier or "_" in verifier

    def test_build_authorization_url(self):
        url = build_authorization_url(
            client_id="test-client-id.apps.googleusercontent.com",
            redirect_uri="http://localhost:8000/auth/google/callback",
            state="state123",
            nonce="nonce456",
            code_challenge="challenge789",
        )
        assert "https://accounts.google.com/o/oauth2/v2/auth?" in url
        assert "client_id=test-client-id.apps.googleusercontent.com" in url
        assert "response_type=code" in url
        assert "code_challenge=challenge789" in url
        assert "code_challenge_method=S256" in url
        assert "state=state123" in url
        assert "nonce=nonce456" in url

    def test_signed_oauth_state_cookie_lifecycle(self):
        secret = "super-secret-key-32-chars-long-secure!!"
        state = generate_oauth_state()
        nonce = generate_nonce()
        verifier, _ = generate_pkce_pair()

        cookie_val = sign_oauth_state_cookie(state, nonce, verifier, secret, max_age_seconds=60)
        assert "." in cookie_val

        decoded = verify_and_decode_oauth_state_cookie(cookie_val, secret)
        assert decoded is not None
        assert decoded["state"] == state
        assert decoded["nonce"] == nonce
        assert decoded["code_verifier"] == verifier

    def test_tampered_state_cookie_rejected(self):
        secret = "super-secret-key-32-chars-long-secure!!"
        cookie_val = sign_oauth_state_cookie("state1", "nonce1", "verifier1", secret)
        payload_b64, sig_b64 = cookie_val.split(".")

        # Tamper payload
        tampered_val = f"{payload_b64}x.{sig_b64}"
        assert verify_and_decode_oauth_state_cookie(tampered_val, secret) is None

        # Wrong secret
        assert verify_and_decode_oauth_state_cookie(cookie_val, "wrong-secret-key-32-chars-long!!") is None

    def test_expired_state_cookie_rejected(self):
        secret = "super-secret-key-32-chars-long-secure!!"
        # Create cookie expired in past
        cookie_val = sign_oauth_state_cookie("state1", "nonce1", "verifier1", secret, max_age_seconds=-10)
        assert verify_and_decode_oauth_state_cookie(cookie_val, secret) is None

    def test_auth_exchange_ticket_lifecycle_and_single_use_burn(self):
        secret = "super-secret-key-32-chars-long-secure!!"
        user_id = "00000000-0000-0000-0000-000000000001"
        raw_token = "mock_raw_session_token_1234567890abcdef"

        ticket = create_auth_exchange_ticket(user_id, raw_token, secret, ttl_seconds=60)
        assert "." in ticket

        # First verification succeeds
        data = verify_and_burn_auth_exchange_ticket(ticket, secret)
        assert data is not None
        assert data["user_id"] == user_id
        assert data["raw_session_token"] == raw_token

        # Second verification (replay) MUST FAIL due to atomic nonce burn
        replayed = verify_and_burn_auth_exchange_ticket(ticket, secret)
        assert replayed is None

        # Tampered ticket must fail
        tampered_ticket = ticket[:-4] + "wxyz"
        assert verify_and_burn_auth_exchange_ticket(tampered_ticket, secret) is None

        # Expired ticket must fail
        expired_ticket = create_auth_exchange_ticket(user_id, raw_token, secret, ttl_seconds=-10)
        assert verify_and_burn_auth_exchange_ticket(expired_ticket, secret) is None


class TestGoogleIDTokenValidation:
    def test_verify_google_id_token_success(self, monkeypatch):
        mock_claims = {
            "iss": "https://accounts.google.com",
            "aud": "test-client-id.apps.googleusercontent.com",
            "exp": time.time() + 3600,
            "sub": "google-user-98765",
            "email": "traveler@odisha.in",
            "email_verified": "true",
            "name": "Jagannath Das",
            "picture": "https://lh3.googleusercontent.com/photo.jpg",
            "nonce": "expected-nonce-123",
        }

        class MockResponse:
            def __enter__(self):
                return self
            def __exit__(self, *args):
                pass
            def read(self):
                return json.dumps(mock_claims).encode("utf-8")

        def mock_urlopen(req, timeout=None):
            return MockResponse()

        monkeypatch.setattr("urllib.request.urlopen", mock_urlopen)

        profile = verify_google_id_token(
            id_token="valid.dummy.id_token",
            client_id="test-client-id.apps.googleusercontent.com",
            expected_nonce="expected-nonce-123",
        )

        assert profile.sub == "google-user-98765"
        assert profile.email == "traveler@odisha.in"
        assert profile.name == "Jagannath Das"
        assert profile.email_verified is True

    def test_verify_id_token_rejects_wrong_issuer(self, monkeypatch):
        mock_claims = {
            "iss": "https://evil-issuer.com",
            "aud": "test-client-id.apps.googleusercontent.com",
            "exp": time.time() + 3600,
            "sub": "google-user-98765",
            "email": "traveler@odisha.in",
            "email_verified": True,
        }

        class MockResponse:
            def __enter__(self):
                return self
            def __exit__(self, *args):
                pass
            def read(self):
                return json.dumps(mock_claims).encode("utf-8")

        monkeypatch.setattr("urllib.request.urlopen", lambda req, timeout=None: MockResponse())

        with pytest.raises(GoogleOAuthError, match="Invalid ID token issuer"):
            verify_google_id_token("dummy.token", "test-client-id.apps.googleusercontent.com")

    def test_verify_id_token_rejects_wrong_audience(self, monkeypatch):
        mock_claims = {
            "iss": "https://accounts.google.com",
            "aud": "wrong-client-id",
            "exp": time.time() + 3600,
            "sub": "google-user-98765",
            "email": "traveler@odisha.in",
            "email_verified": True,
        }

        class MockResponse:
            def __enter__(self):
                return self
            def __exit__(self, *args):
                pass
            def read(self):
                return json.dumps(mock_claims).encode("utf-8")

        monkeypatch.setattr("urllib.request.urlopen", lambda req, timeout=None: MockResponse())

        with pytest.raises(GoogleOAuthError, match="ID token audience mismatch"):
            verify_google_id_token("dummy.token", "expected-client-id")

    def test_verify_id_token_rejects_expired_token(self, monkeypatch):
        mock_claims = {
            "iss": "https://accounts.google.com",
            "aud": "test-client-id",
            "exp": time.time() - 60,
            "sub": "google-user-98765",
            "email": "traveler@odisha.in",
            "email_verified": True,
        }

        class MockResponse:
            def __enter__(self):
                return self
            def __exit__(self, *args):
                pass
            def read(self):
                return json.dumps(mock_claims).encode("utf-8")

        monkeypatch.setattr("urllib.request.urlopen", lambda req, timeout=None: MockResponse())

        with pytest.raises(GoogleOAuthError, match="Google ID token has expired"):
            verify_google_id_token("dummy.token", "test-client-id")

    def test_verify_id_token_rejects_unverified_email(self, monkeypatch):
        mock_claims = {
            "iss": "https://accounts.google.com",
            "aud": "test-client-id",
            "exp": time.time() + 3600,
            "sub": "google-user-98765",
            "email": "unverified@odisha.in",
            "email_verified": False,
        }

        class MockResponse:
            def __enter__(self):
                return self
            def __exit__(self, *args):
                pass
            def read(self):
                return json.dumps(mock_claims).encode("utf-8")

        monkeypatch.setattr("urllib.request.urlopen", lambda req, timeout=None: MockResponse())

        with pytest.raises(GoogleOAuthError, match="Google account email is not verified"):
            verify_google_id_token("dummy.token", "test-client-id")
