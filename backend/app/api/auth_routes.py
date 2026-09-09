"""Google OAuth and Authentication Endpoints."""
from __future__ import annotations

import hashlib
import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.rate_limit import rate_limiter
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.services.auth.google_oauth import (
    GoogleOAuthError,
    GoogleProfile,
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

    logger.warning(
        "[AUTH_TRACE] cookie_present=%s cookie_len=%s authorization_present=%s",
        bool(session_token),
        len(session_token) if session_token else 0,
        bool(request.headers.get("Authorization")),
    )

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


ALLOWED_MOBILE_REDIRECT_URIS = {
    "otravelz://auth/callback",
    "otravelz://auth",
}


@router.get("/google/start")
def google_auth_start(
    request: Request,
    response: Response,
    redirect_uri: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> Any:
    """
    Initiate Google OAuth 2.0 PKCE flow.
    Redirects user to Google's consent screen with signed state cookie.
    Supports optional whitelisted mobile redirect_uri (e.g. otravelz://auth/callback).
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

    if redirect_uri:
        allowed_targets = ALLOWED_MOBILE_REDIRECT_URIS | {settings.auth_frontend_redirect_url}
        if redirect_uri not in allowed_targets:
            raise HTTPException(
                status_code=400,
                detail={"error": "invalid_redirect_uri", "message": f"Redirect URI '{redirect_uri}' is not authorized."},
            )

    if not settings.google_oauth_enabled or not settings.google_oauth_client_id:
        if settings.environment.lower() != "production" and redirect_uri in ALLOWED_MOBILE_REDIRECT_URIS:
            mock_profile = GoogleProfile(
                sub="dev-mock-mobile-user",
                email="traveler@odisha.in",
                name="Odisha Traveler",
                display_name="Traveler",
                avatar_url="https://lh3.googleusercontent.com/a/default-user=s96-c",
            )
            user = resolve_or_create_user(db, mock_profile)
            raw_token, _ = create_session(
                db=db,
                user=user,
                expire_days=settings.auth_session_expire_days,
            )
            exchange_ticket = create_auth_exchange_ticket(
                user_id=str(user.id),
                raw_session_token=raw_token,
                secret=settings.auth_session_secret,
                ttl_seconds=60,
            )
            return RedirectResponse(
                url=f"{redirect_uri}?auth_ticket={exchange_ticket}",
                status_code=302,
            )

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
        app_redirect=redirect_uri if redirect_uri in ALLOWED_MOBILE_REDIRECT_URIS else None,
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
    creates local user & session, sets HttpOnly session cookie, and redirects to frontend or mobile app.
    """
    client_ip = _get_client_ip(request)
    allowed, retry_after = rate_limiter.check_and_record(f"auth_callback_{client_ip}")
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={"error": "rate_limited", "message": "Too many callback attempts.", "retry_after_seconds": retry_after},
            headers={"Retry-After": str(retry_after)},
        )

    # 1. Retrieve and verify state cookie first so app_redirect is known
    state_cookie = request.cookies.get(settings.auth_oauth_state_cookie_name)
    cookie_data = verify_and_decode_oauth_state_cookie(state_cookie, settings.auth_session_secret)
    app_redirect = cookie_data.get("app_redirect") if cookie_data else None

    # Handle user denial / OAuth error
    if error:
        logger.warning("Google OAuth returned error: %s", error)
        target_url = f"{app_redirect}?auth_error={error}" if (app_redirect and app_redirect in ALLOWED_MOBILE_REDIRECT_URIS) else f"{settings.auth_frontend_redirect_url}?auth_error={error}"
        fail_redirect = RedirectResponse(
            url=target_url,
            status_code=302,
        )
        _delete_cookie_safe(fail_redirect, settings.auth_oauth_state_cookie_name)
        return fail_redirect

    if not code or not state:
        return JSONResponse(
            status_code=400,
            content={"error": "invalid_request", "message": "Missing code or state parameter."},
        )

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

        # 6. Create short-lived single-use exchange ticket for cross-origin handshake
        exchange_ticket = create_auth_exchange_ticket(
            user_id=str(user.id),
            raw_session_token=raw_token,
            secret=settings.auth_session_secret,
            ttl_seconds=60,
        )

        # Build redirect URL with auth_ticket
        if app_redirect and app_redirect in ALLOWED_MOBILE_REDIRECT_URIS:
            redirect_url = f"{app_redirect}?auth_ticket={exchange_ticket}"
        else:
            base_redirect = settings.auth_frontend_redirect_url.rstrip("/")
            if "#" in base_redirect:
                redirect_url = f"{base_redirect}&auth_ticket={exchange_ticket}"
            else:
                redirect_url = f"{base_redirect}#auth_ticket={exchange_ticket}"

        # 7. Set session cookie and clear state cookie
        success_redirect = RedirectResponse(
            url=redirect_url,
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
        err_url = f"{app_redirect}?auth_error=authentication_failed" if (app_redirect and app_redirect in ALLOWED_MOBILE_REDIRECT_URIS) else f"{settings.auth_frontend_redirect_url}?auth_error=authentication_failed"
        fail_redirect = RedirectResponse(
            url=err_url,
            status_code=302,
        )
        _delete_cookie_safe(fail_redirect, settings.auth_oauth_state_cookie_name)
        return fail_redirect
    except Exception as e:
        logger.exception("Unexpected error during Google OAuth callback: %s", str(e))
        err_url = f"{app_redirect}?auth_error=server_error" if (app_redirect and app_redirect in ALLOWED_MOBILE_REDIRECT_URIS) else f"{settings.auth_frontend_redirect_url}?auth_error=server_error"
        fail_redirect = RedirectResponse(
            url=err_url,
            status_code=302,
        )
        _delete_cookie_safe(fail_redirect, settings.auth_oauth_state_cookie_name)
        return fail_redirect


class ExchangeTicketRequest(BaseModel):
    ticket: str


@router.post("/session/exchange")
def exchange_auth_ticket(
    payload: ExchangeTicketRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Exchange a single-use, 60-second cross-site auth ticket for an active session.
    Burns the ticket immediately and returns user profile and in-memory session token.
    """
    data = verify_and_burn_auth_exchange_ticket(
        ticket=payload.ticket,
        secret=settings.auth_session_secret,
    )
    if not data:
        raise HTTPException(
            status_code=400,
            detail={"error": "invalid_ticket", "message": "Invalid, expired, or already used auth ticket."},
        )

    raw_session_token = data.get("raw_session_token")
    user = verify_session(db, raw_session_token)
    if not user:
        raise HTTPException(
            status_code=401,
            detail={"error": "session_not_found", "message": "Session could not be verified."},
        )

    # Also set HttpOnly cookie on response for browsers that support it in subresource POST
    response.set_cookie(
        key=settings.auth_session_cookie_name,
        value=raw_session_token,
        max_age=settings.auth_session_expire_days * 86400,
        httponly=True,
        samesite=settings.auth_cookie_samesite,
        secure=settings.auth_cookie_secure,
        path="/",
    )

    return {
        "authenticated": True,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "display_name": user.display_name or user.name,
            "avatar_url": user.avatar_url,
            "provider": user.provider,
        },
        "session_token": raw_session_token,
    }


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
    Supports both HttpOnly session cookie and Authorization: Bearer <session_token> header.
    """
    session_token = request.cookies.get(settings.auth_session_cookie_name)
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:].strip()

    if session_token:
        revoke_session(db, session_token)

    _delete_cookie_safe(response, settings.auth_session_cookie_name)
    return {
        "authenticated": False,
        "message": "Logged out successfully.",
    }


class DevLoginRequest(BaseModel):
    email: Optional[str] = "traveler@odisha.in"
    name: Optional[str] = "Odisha Traveler"


@router.post("/dev/mock-login")
def dev_mock_login(
    payload: DevLoginRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Development/testing mock login endpoint.
    Only available when environment != 'production'.
    Generates a valid test user, session token, and exchange ticket.
    """
    if settings.environment.lower() == "production":
        raise HTTPException(status_code=404, detail="Not found")

    sub_hash = hashlib.sha256((payload.email or "traveler@odisha.in").encode()).hexdigest()[:16]
    mock_profile = GoogleProfile(
        sub=f"dev-mock-{sub_hash}",
        email=payload.email or "traveler@odisha.in",
        name=payload.name or "Odisha Traveler",
        display_name=(payload.name or "Odisha Traveler").split()[0],
        avatar_url="https://lh3.googleusercontent.com/a/default-user=s96-c",
    )
    user = resolve_or_create_user(db, mock_profile)
    raw_token, _ = create_session(
        db=db,
        user=user,
        expire_days=settings.auth_session_expire_days,
    )
    exchange_ticket = create_auth_exchange_ticket(
        user_id=str(user.id),
        raw_session_token=raw_token,
        secret=settings.auth_session_secret,
        ttl_seconds=60,
    )
    return {
        "authenticated": True,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "display_name": user.display_name or user.name,
            "avatar_url": user.avatar_url,
            "provider": user.provider,
        },
        "session_token": raw_token,
        "exchange_ticket": exchange_ticket,
    }
