package com.otravelz.android.ui.roots

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.otravelz.android.ui.screens.MapScreen

/**
 * Structural container for Map root.
 * Hosts the production MapScreen spatial experience with full-bleed canvas priority.
 * Avoids burying the map under an unnecessary opaque top app bar.
 */
@Composable
fun MapRoot(
    onPlaceClick: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        MapScreen(
            onPlaceClick = onPlaceClick,
            modifier = Modifier.fillMaxSize()
        )
    }
}
