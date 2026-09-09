package com.otravelz.android.auth

/**
 * Domain model for authenticated user identity.
 * Contains only properties returned from the authoritative backend.
 * Zero fabricated attributes.
 */
data class UserProfile(
    val id: String,
    val email: String,
    val name: String,
    val displayName: String,
    val avatarUrl: String?,
    val provider: String = "google"
)

/**
 * Explicit state model for O-TRAVELZ authentication.
 * Follows the 3-state product rule:
 * - SignedOut: Fully functional local app with Room SQLite persistence.
 * - Authenticating: Transient authentication or ticket exchange in progress.
 * - SignedIn: Account identity established; local storage remains primary.
 * - Error: Non-blocking transient error during sign-in or session refresh.
 * - Expired: Session expired; app continues working locally without wall.
 */
sealed interface AuthState {
    data object SignedOut : AuthState
    data object Authenticating : AuthState
    data class SignedIn(val user: UserProfile) : AuthState
    data class Error(val message: String) : AuthState
    data object Expired : AuthState
}
