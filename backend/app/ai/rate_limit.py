"""In-process sliding-window rate limiter for AI endpoints.

Enforces separate request limits for overall AI interactions and external provider requests
without requiring external infrastructure dependencies (e.g. Redis).
"""
from __future__ import annotations

import threading
import time
from collections import defaultdict
from typing import Dict, List, Optional, Tuple
from fastapi import HTTPException

from app.core.config import Settings, settings as global_settings


class RateLimitExceeded(HTTPException):
    def __init__(self, retry_after_seconds: int, is_external: bool = False):
        detail = {
            "error": "Rate limit exceeded",
            "message": (
                "External AI provider rate limit exceeded. Please wait before retrying."
                if is_external
                else "Too many AI requests. Please wait before retrying."
            ),
            "retry_after_seconds": max(1, retry_after_seconds),
            "is_external": is_external,
        }
        super().__init__(
            status_code=429,
            detail=detail,
            headers={"Retry-After": str(max(1, retry_after_seconds))},
        )


class SlidingWindowRateLimiter:
    """Thread-safe in-process sliding window rate limiter."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        # Map: client_id -> list of float timestamps
        self._request_history: Dict[str, List[float]] = defaultdict(list)
        self._external_request_history: Dict[str, List[float]] = defaultdict(list)

    def check_and_record(
        self,
        client_id: str,
        is_external_request: bool = False,
        settings: Optional[Settings] = None,
    ) -> Tuple[bool, int]:
        """
        Check if request is within limits and record timestamp if allowed.
        Returns: (is_allowed: bool, retry_after_seconds: int)
        """
        cfg = settings or global_settings
        now = time.time()

        with self._lock:
            # 1. Check general limit
            general_limit = getattr(cfg, "ai_rate_limit_requests", 30)
            general_window = getattr(cfg, "ai_rate_limit_window_seconds", 60)

            # Clean old timestamps
            history = self._request_history[client_id]
            cutoff = now - general_window
            self._request_history[client_id] = [t for t in history if t > cutoff]
            history = self._request_history[client_id]

            if len(history) >= general_limit:
                oldest = history[0]
                retry_after = int(general_window - (now - oldest)) + 1
                return False, max(1, retry_after)

            # 2. Check external limit if applicable
            if is_external_request:
                ext_limit = getattr(cfg, "ai_external_rate_limit_requests", 10)
                ext_window = getattr(cfg, "ai_external_rate_limit_window_seconds", 60)

                ext_history = self._external_request_history[client_id]
                ext_cutoff = now - ext_window
                self._external_request_history[client_id] = [t for t in ext_history if t > ext_cutoff]
                ext_history = self._external_request_history[client_id]

                if len(ext_history) >= ext_limit:
                    oldest_ext = ext_history[0]
                    retry_after = int(ext_window - (now - oldest_ext)) + 1
                    return False, max(1, retry_after)

                # Record external call
                self._external_request_history[client_id].append(now)

            # Record general call
            self._request_history[client_id].append(now)
            return True, 0

    def check_custom_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> Tuple[bool, int]:
        """
        Generic sliding window rate limiter check for custom key, capacity, and window.
        Returns: (is_allowed: bool, retry_after_seconds: int)
        """
        now = time.time()
        with self._lock:
            history = self._request_history[key]
            cutoff = now - window_seconds
            self._request_history[key] = [t for t in history if t > cutoff]
            history = self._request_history[key]

            if len(history) >= max_requests:
                oldest = history[0]
                retry_after = int(window_seconds - (now - oldest)) + 1
                return False, max(1, retry_after)

            self._request_history[key].append(now)
            return True, 0


    def enforce_rate_limit(
        self,
        client_id: str,
        is_external_request: bool = False,
        settings: Optional[Settings] = None,
    ) -> None:
        """Enforce rate limits, raising RateLimitExceeded (HTTP 429) if violated."""
        allowed, retry_after = self.check_and_record(
            client_id,
            is_external_request=is_external_request,
            settings=settings,
        )
        if not allowed:
            raise RateLimitExceeded(retry_after_seconds=retry_after, is_external=is_external_request)

    def reset(self) -> None:
        """Reset all rate limit tracking (useful for unit tests)."""
        with self._lock:
            self._request_history.clear()
            self._external_request_history.clear()


# Global in-process rate limiter singleton
rate_limiter = SlidingWindowRateLimiter()

