package com.otravelz.android.ui.components

import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Platform Window Size Class representation for adaptive layout branching.
 * Follows docs/mobile-v4/ADAPTIVE_LAYOUT_CONTRACT.md:
 * - Compact (<600dp): Portrait smartphones
 * - Medium (600-839dp): Foldables unfolded, small tablets, landscape smartphones
 * - Expanded (>=840dp): Full tablets, desktop/Chromebook windows
 */
enum class WindowSizeClassCategory {
    COMPACT,
    MEDIUM,
    EXPANDED;

    companion object {
        fun fromWidth(width: Dp): WindowSizeClassCategory = when {
            width < 600.dp -> COMPACT
            width < 840.dp -> MEDIUM
            else -> EXPANDED
        }
    }
}

/**
 * Adaptive container that measures available width and yields the appropriate WindowSizeClassCategory.
 */
@Composable
fun AdaptiveBox(
    content: @Composable (WindowSizeClassCategory) -> Unit
) {
    BoxWithConstraints {
        val windowSizeClass = WindowSizeClassCategory.fromWidth(maxWidth)
        content(windowSizeClass)
    }
}
