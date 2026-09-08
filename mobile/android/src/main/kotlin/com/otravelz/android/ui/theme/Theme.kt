package com.otravelz.android.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = TerracottaAccentDark,
    onPrimary = BasaltCanvasDark,
    primaryContainer = BasaltElevatedDark,
    onPrimaryContainer = TextPrimaryDark,
    secondary = ChilikaBlueAccentDark,
    onSecondary = BasaltCanvasDark,
    tertiary = ForestGreenAccentDark,
    background = BasaltCanvasDark,
    onBackground = TextPrimaryDark,
    surface = BasaltCanvasDark,
    onSurface = TextPrimaryDark,
    surfaceContainer = BasaltCardDark,
    surfaceContainerHigh = BasaltElevatedDark,
    onSurfaceVariant = TextSecondaryDark,
    outlineVariant = OutlineVariantDark
)

private val LightColorScheme = lightColorScheme(
    primary = TerracottaAccent,
    onPrimary = SandstoneCanvasLight,
    primaryContainer = SandstoneCardLight,
    onPrimaryContainer = TextPrimaryLight,
    secondary = ChilikaBlueAccent,
    onSecondary = SandstoneCanvasLight,
    tertiary = ForestGreenAccent,
    background = SandstoneCanvasLight,
    onBackground = TextPrimaryLight,
    surface = SandstoneCanvasLight,
    onSurface = TextPrimaryLight,
    surfaceContainer = SandstoneCardLight,
    surfaceContainerHigh = SandstoneElevatedLight,
    onSurfaceVariant = TextSecondaryLight,
    outlineVariant = OutlineVariantLight
)

@Composable
fun OTravelzTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}