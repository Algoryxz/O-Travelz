package com.otravelz.android.auth

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.otravelz.android.data.network.ApiConfig
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel managing authentication state and deep link handling for Android.
 * Anti-vibe invariants:
 * 1. Deep link validation strictly verifies scheme ("otravelz"), host ("auth"), and path ("/callback").
 * 2. Arbitrary route injection is rejected.
 * 3. Tickets are single-use, never exposed in persistent logs or state bundles.
 */
class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    val authState: StateFlow<AuthState> = authRepository.authState

    init {
        viewModelScope.launch {
            authRepository.restoreSession()
        }
    }

    /**
     * Launch browser OAuth flow using system browser or Custom Tab.
     */
    fun initiateSignIn(context: Context) {
        val authStartUrl = "${ApiConfig.DEFAULT_BASE_URL}auth/google/start?redirect_uri=otravelz://auth/callback"
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(authStartUrl)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    /**
     * Validate and process OAuth callback deep link.
     * Expected format: otravelz://auth/callback?auth_ticket=... or ?auth_error=...
     */
    fun handleAuthCallback(uri: Uri?): Boolean {
        if (uri == null) return false

        // Security check: validate scheme, host, and path
        val scheme = uri.scheme?.lowercase()
        val host = uri.host?.lowercase()
        val path = uri.path ?: ""

        if (scheme != "otravelz" || host != "auth" || (path.isNotEmpty() && path != "/callback")) {
            return false
        }

        // Check for error param
        val error = uri.getQueryParameter("auth_error")
        if (!error.isNullOrBlank()) {
            // User cancelled or server error
            viewModelScope.launch {
                authRepository.logout()
            }
            return true
        }

        // Check for exchange ticket
        val ticket = uri.getQueryParameter("auth_ticket")
        if (!ticket.isNullOrBlank()) {
            viewModelScope.launch {
                authRepository.exchangeTicket(ticket)
            }
            return true
        }

        return false
    }

    /**
     * Sign out current user.
     * Local Room database remains strictly intact.
     */
    fun signOut() {
        viewModelScope.launch {
            authRepository.logout()
        }
    }

    /**
     * Development mock sign-in for testing.
     */
    fun devSignIn() {
        viewModelScope.launch {
            authRepository.devMockLogin()
        }
    }

    companion object {
        fun provideFactory(
            context: Context
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val sessionStore = AndroidAuthSessionStore(context.applicationContext)
                val repository = AuthRepository.getInstance(sessionStore)
                return AuthViewModel(repository) as T
            }
        }
    }
}
