package com.otravelz.android.core.design

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = OchrePrimary,
    onPrimary = DarkBackground,
    primaryContainer = OchreDark,
    onPrimaryContainer = OchreLight,
    secondary = TealSecondary,
    onSecondary = DarkBackground,
    secondaryContainer = TealDark,
    onSecondaryContainer = TealLight,
    tertiary = OliveForest,
    background = DarkBackground,
    onBackground = TextPrimary,
    surface = DarkSurface,
    onSurface = TextPrimary,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = TextSecondary,
    outline = DarkBorder,
    error = StatusError
)

private val LightColorScheme = lightColorScheme(
    primary = OchrePrimary,
    onPrimary = TextPrimary,
    secondary = TealSecondary,
    background = Color(0xFFF8FAFC),
    surface = Color(0xFFFFFFFF),
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A),
    outline = Color(0xFFE2E8F0),
    error = StatusError
)

@Composable
fun OTravelzTheme(
    darkTheme: Boolean = true, // Default to rich dark travel surface
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}
