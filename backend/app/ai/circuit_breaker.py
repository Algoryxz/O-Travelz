import threading
import time
from enum import Enum
from typing import Dict, Optional

from app.core.config import Settings, settings as global_settings


class CircuitState(str, Enum):
    CLOSED = "CLOSED"      # Normal operation: provider healthy
    OPEN = "OPEN"          # Provider failing: skip calls and failover immediately
    HALF_OPEN = "HALF_OPEN"# Probing: test if provider has recovered


class ProviderCircuitBreaker:
    """Thread-safe circuit breaker tracking failures per provider."""

    def __init__(
        self,
        failure_threshold: int = 3,
        cooldown_seconds: float = 30.0,
    ) -> None:
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self._lock = threading.Lock()
        self._states: Dict[str, CircuitState] = {}
        self._failure_counts: Dict[str, int] = {}
        self._last_failure_times: Dict[str, float] = {}
        self._probing: Dict[str, bool] = {}

    def get_state(self, provider: str) -> CircuitState:
        """Get current circuit state for a provider."""
        with self._lock:
            state = self._states.get(provider, CircuitState.CLOSED)
            if state == CircuitState.OPEN:
                last_fail = self._last_failure_times.get(provider, 0.0)
                if (time.time() - last_fail) >= self.cooldown_seconds:
                    self._states[provider] = CircuitState.HALF_OPEN
                    return CircuitState.HALF_OPEN
            return state

    def is_allowed(self, provider: str) -> bool:
        """Check if request to provider is allowed, avoiding probe storms."""
        with self._lock:
            state = self._states.get(provider, CircuitState.CLOSED)
            if state == CircuitState.OPEN:
                last_fail = self._last_failure_times.get(provider, 0.0)
                if (time.time() - last_fail) >= self.cooldown_seconds:
                    state = CircuitState.HALF_OPEN
                    self._states[provider] = CircuitState.HALF_OPEN

            if state == CircuitState.CLOSED:
                return True
            if state == CircuitState.HALF_OPEN:
                # Prevent probe storms: allow only one concurrent probe
                if not self._probing.get(provider, False):
                    self._probing[provider] = True
                    return True
                return False
            return False

    def record_success(self, provider: str) -> None:
        """Record successful provider response and close circuit."""
        with self._lock:
            self._states[provider] = CircuitState.CLOSED
            self._failure_counts[provider] = 0
            self._probing[provider] = False

    def record_failure(self, provider: str) -> None:
        """Record provider failure and open circuit if threshold is reached."""
        with self._lock:
            count = self._failure_counts.get(provider, 0) + 1
            self._failure_counts[provider] = count
            self._last_failure_times[provider] = time.time()
            self._probing[provider] = False

            if count >= self.failure_threshold:
                self._states[provider] = CircuitState.OPEN

    def reset(self) -> None:
        """Reset all circuit breaker states (for testing)."""
        with self._lock:
            self._states.clear()
            self._failure_counts.clear()
            self._last_failure_times.clear()
            self._probing.clear()


# Global singleton instance
circuit_breaker = ProviderCircuitBreaker()

