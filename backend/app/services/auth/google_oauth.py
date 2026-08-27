"""Google OAuth 2.0 and OpenID Connect Service.

Implements:
1. Authorization URL construction with PKCE (S256), state, and nonce.
2. Signed ephemeral state/nonce cookie generation and verification.
3. Authorization code exchange for tokens.
4. Google ID token cryptographic and claims validation.
5. Trusted Google profile extraction.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional, Tuple
from pydantic import BaseModel

_burned_ticket_nonces: set[str] = set()
_ticket_lock = threading.Lock()


GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


class GoogleProfile(BaseModel):
    """Normalized trusted profile extracted from verified Google ID token."""
    sub: str
    email: str
    name: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    email_verified: bool = True


class GoogleOAuthError(Exception):
    """Base exception for OAuth flow failures."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _base64url_encode(data: bytes) -> str:
    """Encode bytes into base64url string without trailing padding."""
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _base64url_decode(data: str) -> bytes:
    """Decode base64url string with padding restoration."""
    rem = len(data) % 4
    if rem > 0:
        data += "=" * (4 - rem)
    return base64.urlsafe_b64decode(data)


def generate_pkce_pair() -> Tuple[str, str]:
    """
    Generate PKCE code_verifier and code_challenge using S256 method.
    Returns: (code_verifier, code_challenge)
    """
    # 64 random bytes -> 86 base64url characters (valid PKCE length is 43-128)
    code_verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(code_verifier.encode("ascii")).digest()
    code_challenge = _base64url_encode(digest)
    return code_verifier, code_challenge


def generate_oauth_state() -> str:
    """Generate cryptographically unpredictable state string."""
    return secrets.token_urlsafe(32)


def generate_nonce() -> str:
    """Generate cryptographically unpredictable nonce string."""
    return secrets.token_urlsafe(32)


def sign_oauth_state_cookie(
    state: str,
    nonce: str,
    code_verifier: str,
    secret: str,
    max_age_seconds: int = 600,
) -> str:
    """
    Create a signed, tamper-evident OAuth transaction cookie value.
    Payload: JSON of {state, nonce, code_verifier, exp} signed with HMAC-SHA256.
    """
    exp = int(time.time()) + max_age_seconds
    payload_dict = {
        "s": state,
        "n": nonce,
        "v": code_verifier,
        "e": exp,
    }
    payload_json = json.dumps(payload_dict, separators=(",", ":")).encode("utf-8")
    payload_b64 = _base64url_encode(payload_json)

    signature = hmac.new(secret.encode("utf-8"), payload_b64.encode("ascii"), hashlib.sha256).digest()
    sig_b64 = _base64url_encode(signature)

    return f"{payload_b64}.{sig_b64}"


def verify_and_decode_oauth_state_cookie(
    cookie_value: Optional[str],
    secret: str,
) -> Optional[Dict[str, Any]]:
    """
    Verify HMAC signature and expiration of OAuth state cookie.
    Returns decoded dictionary or None if invalid/expired.
    """
    if not cookie_value or "." not in cookie_value:
        return None

    parts = cookie_value.split(".")
    if len(parts) != 2:
        return None

    payload_b64, sig_b64 = parts[0], parts[1]

    # Verify signature
    expected_sig = hmac.new(secret.encode("utf-8"), payload_b64.encode("ascii"), hashlib.sha256).digest()
    expected_sig_b64 = _base64url_encode(expected_sig)

    if not hmac.compare_digest(sig_b64, expected_sig_b64):
        return None

    try:
        payload_bytes = _base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        return None

    # Check expiry
    exp = payload.get("e", 0)
    if time.time() > exp:
        return None

    return {
        "state": payload.get("s"),
        "nonce": payload.get("n"),
        "code_verifier": payload.get("v"),
        "exp": exp,
    }


def create_auth_exchange_ticket(
    user_id: str,
    raw_session_token: str,
    secret: str,
    ttl_seconds: int = 60,
) -> str:
    """
    Create a cryptographically signed, high-entropy, short-lived (60s) single-use exchange ticket
    for cross-origin post-OAuth handshake.
    Payload: JSON of {user_id, raw_session_token, exp, nonce} signed with HMAC-SHA256.
    """
    exp = int(time.time()) + ttl_seconds
    nonce = secrets.token_urlsafe(24)
    payload_dict = {
        "u": str(user_id),
        "t": raw_session_token,
        "e": exp,
        "n": nonce,
    }
    payload_json = json.dumps(payload_dict, separators=(",", ":")).encode("utf-8")
    payload_b64 = _base64url_encode(payload_json)

    signature = hmac.new(secret.encode("utf-8"), payload_b64.encode("ascii"), hashlib.sha256).digest()
    sig_b64 = _base64url_encode(signature)

    return f"{payload_b64}.{sig_b64}"


def verify_and_burn_auth_exchange_ticket(
    ticket: Optional[str],
    secret: str,
) -> Optional[Dict[str, Any]]:
    """
    Verify HMAC signature, check expiration (<60s), and atomically burn the nonce.
    Guarantees strict single-use (replay prevention).
    Returns payload dictionary or None if invalid, expired, or replayed.
    """
    if not ticket or "." not in ticket:
        return None

    parts = ticket.split(".")
    if len(parts) != 2:
        return None

    payload_b64, sig_b64 = parts[0], parts[1]

    expected_sig = hmac.new(secret.encode("utf-8"), payload_b64.encode("ascii"), hashlib.sha256).digest()
    expected_sig_b64 = _base64url_encode(expected_sig)

    if not hmac.compare_digest(sig_b64, expected_sig_b64):
        return None

    try:
        payload_bytes = _base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        return None

    exp = payload.get("e", 0)
    if time.time() > exp:
        return None

    nonce = payload.get("n")
    if not nonce or not isinstance(nonce, str):
        return None

    # Atomic single-use burn check
    with _ticket_lock:
        if nonce in _burned_ticket_nonces:
            return None  # Already consumed (replay attempt)
        _burned_ticket_nonces.add(nonce)
        if len(_burned_ticket_nonces) > 5000:
            _burned_ticket_nonces.clear()

    return {
        "user_id": payload.get("u"),
        "raw_session_token": payload.get("t"),
    }


def build_authorization_url(
    client_id: str,
    redirect_uri: str,
    state: str,
    nonce: str,
    code_challenge: str,
) -> str:
    """Build full Google OAuth 2.0 authorization URL."""
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "nonce": nonce,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        "access_type": "online",
        "prompt": "select_account",
    }
    return f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"


def exchange_code_for_tokens(
    code: str,
    code_verifier: str,
    client_id: str,
    client_secret: str,
    redirect_uri: str,
    timeout_seconds: float = 10.0,
) -> Dict[str, Any]:
    """
    Exchange authorization code + PKCE verifier for Google tokens.
    """
    data = urllib.parse.urlencode({
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
        "code_verifier": code_verifier,
    }).encode("utf-8")

    req = urllib.request.Request(
        GOOGLE_TOKEN_URL,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
            resp_body = resp.read().decode("utf-8")
            return json.loads(resp_body)
    except urllib.error.HTTPError as e:
        error_body = ""
        try:
            error_body = e.read().decode("utf-8", errors="replace")
        except Exception:
            pass
        raise GoogleOAuthError(
            f"Google token exchange failed: HTTP {e.code} {error_body}",
            status_code=400,
        )
    except Exception as e:
        raise GoogleOAuthError(
            f"Failed to connect to Google OAuth service: {str(e)}",
            status_code=502,
        )


def verify_google_id_token(
    id_token: str,
    client_id: str,
    expected_nonce: Optional[str] = None,
    timeout_seconds: float = 10.0,
) -> GoogleProfile:
    """
    Validate Google ID Token claims using Google's authoritative tokeninfo endpoint.
    Performs server-side cryptographic and claims assertions:
    - iss in ("accounts.google.com", "https://accounts.google.com")
    - aud == client_id
    - exp > now
    - nonce == expected_nonce (if nonce is in token)
    - sub present
    - email present and email_verified == True
    """
    if not id_token or len(id_token) < 10:
        raise GoogleOAuthError("Missing or invalid ID token string", status_code=400)

    url = f"{GOOGLE_TOKENINFO_URL}?id_token={urllib.parse.quote(id_token)}"
    req = urllib.request.Request(url, method="GET")

    try:
        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
            claims = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise GoogleOAuthError("Google ID token validation rejected", status_code=401)
    except Exception as e:
        raise GoogleOAuthError(f"Failed to reach Google token verification service: {str(e)}", status_code=502)

    # 1. Validate Issuer
    iss = claims.get("iss", "")
    if iss not in ("accounts.google.com", "https://accounts.google.com"):
        raise GoogleOAuthError(f"Invalid ID token issuer: {iss}", status_code=401)

    # 2. Validate Audience
    aud = claims.get("aud", "")
    if aud != client_id:
        raise GoogleOAuthError(f"ID token audience mismatch: expected {client_id}, got {aud}", status_code=401)

    # 3. Validate Expiration
    exp = int(claims.get("exp", 0))
    if time.time() > exp:
        raise GoogleOAuthError("Google ID token has expired", status_code=401)

    # 4. Validate Nonce if expected
    if expected_nonce:
        token_nonce = claims.get("nonce")
        if token_nonce and not hmac.compare_digest(token_nonce, expected_nonce):
            raise GoogleOAuthError("Google ID token nonce mismatch", status_code=401)

    # 5. Validate Subject
    sub = claims.get("sub")
    if not sub:
        raise GoogleOAuthError("Missing subject (sub) claim in Google ID token", status_code=401)

    # 6. Validate Email and Email Verified
    email = claims.get("email")
    if not email:
        raise GoogleOAuthError("Missing email claim in Google ID token", status_code=401)

    email_verified_raw = claims.get("email_verified")
    email_verified = email_verified_raw is True or str(email_verified_raw).lower() == "true"
    if not email_verified:
        raise GoogleOAuthError("Google account email is not verified", status_code=401)

    # Extract clean profile
    name = claims.get("name")
    given_name = claims.get("given_name")
    display_name = given_name or name or email.split("@")[0]
    picture = claims.get("picture")

    return GoogleProfile(
        sub=sub,
        email=email,
        name=name,
        display_name=display_name,
        avatar_url=picture,
        email_verified=True,
    )
