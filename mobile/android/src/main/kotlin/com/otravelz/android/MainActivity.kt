package com.otravelz.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.otravelz.android.ui.theme.OTravelzTheme

/**
 * Single Activity hosting the O-TRAVELZ root navigation shell.
 * Uses official Android edge-to-edge with Material 3 Expressive theming.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            OTravelzTheme {
                OTravelzApp()
            }
        }
    }
}