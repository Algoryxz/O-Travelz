package com.otravelz.android.auth

import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.OTravelzApiService
import com.otravelz.android.data.network.dto.AuthTicketExchangeRequestDto
import com.otravelz.android.data.network.dto.DevLoginRequestDto
import com.otravelz.android.data.network.dto.UserProfileDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.IOException

/**
 * Repository coordinating authentication lifecycle, session restoration,
 * exchange ticket burning, and secure sign-out.
 *
 * Anti-vibe invariants:
 * 1. Signing out NEVER erases Room database entities (SavedPlace, SavedTrip, TripProgress).
 * 2. Backend failure during session restore does not crash the app or block local use.
 * 3. Session tokens are stored strictly in secure storage, never logged.
 */
class AuthRepository(
    private val sessionStore: AuthSessionStore,
    private val apiService: OTravelzApiService = ApiClient.createService()
) {

    private val _authState = MutableStateFlow<AuthState>(AuthState.SignedOut)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private var cachedUserProfile: UserProfile? = null

    /**
     * Restore session asynchronously at app launch.
     * Never blocks app startup. If offline, the app continues normally.
     */
    suspend fun restoreSession() {
        val token = sessionStore.getSessionToken()
        if (token.isNullOrBlank()) {
            _authState.value = AuthState.SignedOut
            return
        }

        _authState.value = AuthState.Authenticating
        try {
            val response = apiService.getMe(authorization = "Bearer $token")
            if (response.authenticated && response.user != null) {
                val profile = response.user.toDomain()
                cachedUserProfile = profile
                _authState.value = AuthState.SignedIn(profile)
            } else {
                sessionStore.clearSessionToken()
                _authState.value = AuthState.Expired
            }
        } catch (e: IOException) {
            // Offline or network unreachable: fail open to keep app fully usable.
            // If we previously had a cached profile, keep cached identity or fall back to SignedOut gracefully.
            if (cachedUserProfile != null) {
                _authState.value = AuthState.SignedIn(cachedUserProfile!!)
            } else {
                _authState.value = AuthState.SignedOut
            }
        } catch (e: Exception) {
            sessionStore.clearSessionToken()
            _authState.value = AuthState.Expired
        }
    }

    /**
     * Exchanges a short-lived (60s) single-use auth ticket for an active session.
     */
    suspend fun exchangeTicket(ticket: String): Result<UserProfile> {
        if (ticket.isBlank()) {
            _authState.value = AuthState.Error("Invalid or missing auth ticket")
            return Result.failure(IllegalArgumentException("Ticket cannot be blank"))
        }

        _authState.value = AuthState.Authenticating
        return try {
            val response = apiService.exchangeAuthTicket(AuthTicketExchangeRequestDto(ticket.trim()))
            val userDto = response.user
            val token = response.sessionToken

            if (response.authenticated && userDto != null && !token.isNullOrBlank()) {
                sessionStore.saveSessionToken(token)
                val profile = userDto.toDomain()
                cachedUserProfile = profile
                _authState.value = AuthState.SignedIn(profile)
                Result.success(profile)
            } else {
                val errMsg = "Failed to verify session exchange ticket"
                _authState.value = AuthState.Error(errMsg)
                Result.failure(IllegalStateException(errMsg))
            }
        } catch (e: Exception) {
            val errMsg = e.localizedMessage ?: "Ticket exchange network error"
            _authState.value = AuthState.Error(errMsg)
            Result.failure(e)
        }
    }

    /**
     * Development mock login for testing and deterministic CI runs.
     */
    suspend fun devMockLogin(
        email: String = "traveler@odisha.in",
        name: String = "Odisha Traveler"
    ): Result<UserProfile> {
        _authState.value = AuthState.Authenticating
        return try {
            val response = apiService.devMockLogin(DevLoginRequestDto(email, name))
            val userDto = response.user
            val token = response.sessionToken

            if (response.authenticated && userDto != null && !token.isNullOrBlank()) {
                sessionStore.saveSessionToken(token)
                val profile = userDto.toDomain()
                cachedUserProfile = profile
                _authState.value = AuthState.SignedIn(profile)
                Result.success(profile)
            } else {
                _authState.value = AuthState.Error("Dev login failed")
                Result.failure(IllegalStateException("Dev login failed"))
            }
        } catch (e: Exception) {
            _authState.value = AuthState.Error(e.localizedMessage ?: "Dev login error")
            Result.failure(e)
        }
    }

    /**
     * Revokes active session on backend, clears local secure credentials,
     * and sets state to SignedOut.
     *
     * Local Room persistence is strictly preserved.
     */
    suspend fun logout() {
        val token = sessionStore.getSessionToken()
        if (!token.isNullOrBlank()) {
            try {
                apiService.logout(authorization = "Bearer $token")
            } catch (_: Exception) {
                // Ignore network errors during logout; local credential clearing takes precedence
            }
        }
        sessionStore.clearSessionToken()
        cachedUserProfile = null
        _authState.value = AuthState.SignedOut
    }

    private fun UserProfileDto.toDomain(): UserProfile {
        return UserProfile(
            id = id,
            email = email,
            name = name,
            displayName = displayName ?: name,
            avatarUrl = avatarUrl,
            provider = provider
        )
    }

    companion object {
        @Volatile
        private var instance: AuthRepository? = null

        fun getInstance(sessionStore: AuthSessionStore, apiService: OTravelzApiService? = null): AuthRepository {
            return instance ?: synchronized(this) {
                instance ?: AuthRepository(
                    sessionStore = sessionStore,
                    apiService = apiService ?: ApiClient.createService()
                ).also { instance = it }
            }
        }

        fun resetForTesting(repo: AuthRepository?) {
            instance = repo
        }
    }
}
