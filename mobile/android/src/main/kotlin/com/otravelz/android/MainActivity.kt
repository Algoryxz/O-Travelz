package com.otravelz.android

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.otravelz.android.auth.AuthViewModel
import com.otravelz.android.ui.theme.OTravelzTheme

/**
 * Single Activity hosting the O-TRAVELZ root navigation shell.
 * Uses official Android edge-to-edge with Material 3 Expressive theming.
 * Handles OAuth callback deep links via AuthViewModel.
 */
class MainActivity : ComponentActivity() {

    private val authViewModel: AuthViewModel by viewModels {
        AuthViewModel.provideFactory(this)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        intent?.data?.let { uri ->
            authViewModel.handleAuthCallback(uri)
        }

        setContent {
            OTravelzTheme {
                OTravelzApp(authViewModel = authViewModel)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        intent.data?.let { uri ->
            authViewModel.handleAuthCallback(uri)
        }
    }
}