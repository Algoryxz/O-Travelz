package com.otravelz.android

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.otravelz.android.auth.AuthViewModel
import com.otravelz.android.ui.theme.OTravelzTheme

import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

/**
 * Single Activity hosting the O-TRAVELZ root navigation shell.
 * Uses official Android edge-to-edge with Material 3 Expressive theming.
 * Handles OAuth callback and Transit route deep links.
 */
class MainActivity : ComponentActivity() {

    private val authViewModel: AuthViewModel by viewModels {
        AuthViewModel.provideFactory(this)
    }

    private var pendingRouteId by mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        intent?.data?.let { uri ->
            handleIncomingUri(uri)
        }

        setContent {
            OTravelzTheme {
                OTravelzApp(
                    authViewModel = authViewModel,
                    initialRouteId = pendingRouteId
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        intent.data?.let { uri ->
            handleIncomingUri(uri)
        }
    }

    private fun handleIncomingUri(uri: Uri) {
        when {
            uri.scheme == "otravelz" && uri.host == "auth" -> {
                authViewModel.handleAuthCallback(uri)
            }
            uri.scheme == "otravelz" && uri.host == "route" -> {
                val routeId = uri.path?.removePrefix("/")
                if (!routeId.isNullOrBlank()) {
                    pendingRouteId = routeId
                }
            }
        }
    }
}