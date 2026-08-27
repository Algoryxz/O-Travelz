"""Google OAuth and Authentication Endpoints."""
from __future__ import annotations

import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.ai.rate_limit import rate_limiter
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.services.auth.google_oauth import (
    GoogleOAuthError,
    build_authorization_url,
    exchange_code_for_tokens,
    generate_nonce,
    generate_oauth_state,
    generate_pkce_pair,
    sign_oauth_state_cookie,
    verify_and_decode_oauth_state_cookie,
    verify_google_id_token,
)
from app.services.auth.session_manager import (
    create_session,
    resolve_or_create_user,
    revoke_session,
    verify_session,
)


logger = logging.getLogger(__name__)

router = APIRouter()


def _get_client_ip(request: Request) -> str:
    """Extract client IP for rate limiting."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    FastAPI dependency yielding authenticated User or None.
    Extracts session from HttpOnly session cookie or Authorization Bearer header.
    Does not raise HTTP exceptions for anonymous visitors.
    """
    session_token = request.cookies.get(settings.auth_session_cookie_name)
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:].strip()

    if not session_token:
        return None
    return verify_session(db, session_token)


def get_required_user(
    current_user: Optional[User] = Depends(get_current_user),
) -> User:
    """
    FastAPI dependency requiring an authenticated user. Raises 401 if unauthenticated.
    """
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail={"error": "unauthorized", "message": "Authentication required for this resource."},
        )
    return current_user


def _delete_cookie_safe(resp: Response, key: str) -> None:
    """Consistently delete an auth cookie using matching path, samesite, secure, and httponly attributes."""
    resp.delete_cookie(
        key=key,
        path="/",
        samesite=settings.auth_cookie_samesite,
        secure=settings.auth_cookie_secure,
        httponly=True,
    )


@router.get("/google/start")
def google_auth_start(
    request: Request,
    response: Response,
) -> Any:
    """
    Initiate Google OAuth 2.0 PKCE flow.
    Redirects user to Google's consent screen with signed state cookie.
    """
    client_ip = _get_client_ip(request)
    # Auth rate limit: max 20 requests per minute
    allowed, retry_after = rate_limiter.check_and_record(f"auth_start_{client_ip}")
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={"error": "rate_limited", "message": "Too many login attempts. Please wait.", "retry_after_seconds": retry_after},
            headers={"Retry-After": str(retry_after)},
        )

    if not settings.google_oauth_enabled or not settings.google_oauth_client_id:
        return JSONResponse(
            status_code=400,
            content={
                "error": "oauth_disabled",
                "message": "Google OAuth is not configured or enabled on this server.",
            },
        )

    # 1. Generate PKCE pair, state, and nonce
    code_verifier, code_challenge = generate_pkce_pair()
    state = generate_oauth_state()
    nonce = generate_nonce()

    # 2. Build authorization URL
    auth_url = build_authorization_url(
        client_id=settings.google_oauth_client_id,
        redirect_uri=settings.google_oauth_redirect_uri,
        state=state,
        nonce=nonce,
        code_challenge=code_challenge,
    )

    # 3. Create signed state cookie
    state_cookie_val = sign_oauth_state_cookie(
        state=state,
        nonce=nonce,
        code_verifier=code_verifier,
        secret=settings.auth_session_secret,
        max_age_seconds=settings.auth_oauth_state_expire_seconds,
    )

    redirect_resp = RedirectResponse(url=auth_url, status_code=302)
    redirect_resp.set_cookie(
        key=settings.auth_oauth_state_cookie_name,
        value=state_cookie_val,
        max_age=settings.auth_oauth_state_expire_seconds,
        httponly=True,
        samesite=settings.auth_cookie_samesite,
        secure=settings.auth_cookie_secure,
        path="/",
    )
    return redirect_resp


@router.get("/google/callback")
def google_auth_callback(
    request: Request,
    response: Response,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> Any:
    """
    OAuth 2.0 callback handler.
    Validates state cookie, exchanges code with PKCE verifier, validates ID token,
    creates local user & session, sets HttpOnly session cookie, and redirects to frontend.
    """
    client_ip = _get_client_ip(request)
    allowed, retry_after = rate_limiter.check_and_record(f"auth_callback_{client_ip}")
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={"error": "rate_limited", "message": "Too many callback attempts.", "retry_after_seconds": retry_after},
            headers={"Retry-After": str(retry_after)},
        )

    # Handle user denial / OAuth error
    if error:
        logger.warning("Google OAuth returned error: %s", error)
        fail_redirect = RedirectResponse(
            url=f"{settings.auth_frontend_redirect_url}?auth_error={error}",
            status_code=302,
        )
        _delete_cookie_safe(fail_redirect, settings.auth_oauth_state_cookie_name)
        return fail_redirect

    if not code or not state:
        return JSONResponse(
            status_code=400,
            content={"error": "invalid_request", "message": "Missing code or state parameter."},
        )

    # 1. Retrieve and verify state cookie
    state_cookie = request.cookies.get(settings.auth_oauth_state_cookie_name)
    cookie_data = verify_and_decode_oauth_state_cookie(state_cookie, settings.auth_session_secret)

    if not cookie_data or cookie_data.get("state") != state:
        fail_resp = JSONResponse(
            status_code=400,
            content={"error": "invalid_state", "message": "Invalid or expired OAuth state."},
        )
        _delete_cookie_safe(fail_resp, settings.auth_oauth_state_cookie_name)
        return fail_resp

    code_verifier = cookie_data["code_verifier"]
    expected_nonce = cookie_data.get("nonce")

    try:
        # 2. Exchange authorization code for tokens
        token_data = exchange_code_for_tokens(
            code=code,
            code_verifier=code_verifier,
            client_id=settings.google_oauth_client_id or "",
            client_secret=settings.google_oauth_client_secret or "",
            redirect_uri=settings.google_oauth_redirect_uri,
        )

        id_token = token_data.get("id_token")
        if not id_token:
            raise GoogleOAuthError("No id_token in Google token response")

        # 3. Verify ID token claims and nonce
        profile = verify_google_id_token(
            id_token=id_token,
            client_id=settings.google_oauth_client_id or "",
            expected_nonce=expected_nonce,
        )

        # 4. Resolve / upsert local user
        user = resolve_or_create_user(db, profile)

        # 5. Create secure session
        raw_token, session_record = create_session(
            db=db,
            user=user,
            expire_days=settings.auth_session_expire_days,
        )

        # 6. Set session cookie and clear state cookie
        success_redirect = RedirectResponse(
            url=settings.auth_frontend_redirect_url,
            status_code=302,
        )
        success_redirect.set_cookie(
            key=settings.auth_session_cookie_name,
            value=raw_token,
            max_age=settings.auth_session_expire_days * 86400,
            httponly=True,
            samesite=settings.auth_cookie_samesite,
            secure=settings.auth_cookie_secure,
            path="/",
        )
        _delete_cookie_safe(success_redirect, settings.auth_oauth_state_cookie_name)
        return success_redirect

    except GoogleOAuthError as e:
        logger.error("OAuth authentication error: %s", e.message)
        fail_redirect = RedirectResponse(
            url=f"{settings.auth_frontend_redirect_url}?auth_error=authentication_failed",
            status_code=302,
        )
        _delete_cookie_safe(fail_redirect, settings.auth_oauth_state_cookie_name)
        return fail_redirect
    except Exception as e:
        logger.exception("Unexpected error during Google OAuth callback: %s", str(e))
        fail_redirect = RedirectResponse(
            url=f"{settings.auth_frontend_redirect_url}?auth_error=server_error",
            status_code=302,
        )
        _delete_cookie_safe(fail_redirect, settings.auth_oauth_state_cookie_name)
        return fail_redirect


@router.get("/me")
def get_me(
    current_user: Optional[User] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Resolve current authenticated user.
    Returns safe user metadata or unauthenticated state.
    """
    if not current_user:
        return {
            "authenticated": False,
            "user": None,
        }

    return {
        "authenticated": True,
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "name": current_user.name,
            "display_name": current_user.display_name or current_user.name,
            "avatar_url": current_user.avatar_url,
            "provider": current_user.provider,
        },
    }


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Revoke active session and clear session cookie. Idempotent.
    """
    session_token = request.cookies.get(settings.auth_session_cookie_name)
    if session_token:
        revoke_session(db, session_token)

    _delete_cookie_safe(response, settings.auth_session_cookie_name)
    return {
        "authenticated": False,
        "message": "Logged out successfully.",
    }
