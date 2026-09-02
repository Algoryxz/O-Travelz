package com.otravelz.android.feature.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.i18n.LocalAppStrings
import com.otravelz.android.core.ui.profile.*
import com.otravelz.android.data.local.UserPreferencesDataStore
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(
    onNavigateToSavedPlaces: () -> Unit,
    onNavigateToTrips: () -> Unit,
    onNavigateToCommunityStaging: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val strings = LocalAppStrings.current
    val coroutineScope = rememberCoroutineScope()
    val preferencesDataStore = remember { UserPreferencesDataStore.getInstance(context) }
    val userPreferences by preferencesDataStore.userPreferencesFlow.collectAsState(
        initial = com.otravelz.android.data.local.UserPreferences()
    )

    var showLanguageDialog by remember { mutableStateOf(false) }
    var showPrivacyDialog by remember { mutableStateOf(false) }

    val displayLanguageName = when (userPreferences.preferredLanguage) {
        "or" -> "ଓଡ଼ିଆ (Odia)"
        "hi" -> "हिन्दी (Hindi)"
        else -> "English"
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(Spacing.md)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = strings.youTitle,
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = strings.youSubtitle,
            style = MaterialTheme.typography.bodySmall,
            color = SunTempleGold
        )

        Spacer(modifier = Modifier.height(Spacing.md))

        // Profile Hero
        ProfileUserHero()

        Spacer(modifier = Modifier.height(Spacing.md))

        // Stats Row
        ProfileStatsRow(
            destinationCount = "160+ Verified",
            transitStatus = "Mo Bus Schedules",
            activeLanguage = displayLanguageName
        )

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Section: Data Truth Manifest
        TruthManifestCard()

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Section: Preferences
        Text(
            text = strings.languageSettingTitle,
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsTile(
            icon = Icons.Default.Language,
            title = strings.languageSettingTitle,
            subtitle = displayLanguageName,
            onClick = { showLanguageDialog = true }
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsToggleTile(
            icon = Icons.Default.Notifications,
            title = "Trip Arrival Alerts",
            subtitle = "Contextual arrival alerts and departure windows",
            checked = userPreferences.tripAlertsEnabled,
            onCheckedChange = { enabled ->
                coroutineScope.launch {
                    preferencesDataStore.setTripAlertsEnabled(enabled)
                }
            }
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsToggleTile(
            icon = Icons.Default.CloudQueue,
            title = "Live Weather Advisories",
            subtitle = "Open-Meteo live updates along active routes",
            checked = userPreferences.weatherAlertsEnabled,
            onCheckedChange = { enabled ->
                coroutineScope.launch {
                    preferencesDataStore.setWeatherAlertsEnabled(enabled)
                }
            }
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsToggleTile(
            icon = Icons.Default.DirectionsWalk,
            title = "First-Mile Transit Guidance",
            subtitle = "Walking and short-auto recommendations for Mo Bus stops",
            checked = userPreferences.transitGuidanceEnabled,
            onCheckedChange = { enabled ->
                coroutineScope.launch {
                    preferencesDataStore.setTransitGuidanceEnabled(enabled)
                }
            }
        )

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Section: Community & Staging
        Text(
            text = strings.communityStagingTitle,
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsTile(
            icon = Icons.Default.AddLocationAlt,
            title = "Hometown Cultural Staging",
            subtitle = "Draft and stage unlisted Odia shrines, crafts, or nature gems locally on device",
            onClick = onNavigateToCommunityStaging
        )

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Section: Data Management
        Text(
            text = strings.privacyTitle,
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(Spacing.xs))

        val recentlyViewedRepo = remember { com.otravelz.android.data.repository.RecentlyViewedRepository.getInstance(context) }
        val recentSearchRepo = remember { com.otravelz.android.data.repository.RecentSearchesRepository.getInstance(context) }

        SettingsTile(
            icon = Icons.Default.History,
            title = "Clear Search History",
            subtitle = "Remove saved recent search terms from on-device storage",
            onClick = {
                coroutineScope.launch {
                    recentSearchRepo.clearAll()
                    android.widget.Toast.makeText(context, "Search history cleared", android.widget.Toast.LENGTH_SHORT).show()
                }
            }
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsTile(
            icon = Icons.Default.DeleteSweep,
            title = "Clear Recently Viewed",
            subtitle = "Clear your destination browsing history",
            onClick = {
                coroutineScope.launch {
                    recentlyViewedRepo.clearHistory()
                    android.widget.Toast.makeText(context, "Recently viewed history cleared", android.widget.Toast.LENGTH_SHORT).show()
                }
            }
        )

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Section: Privacy & About
        SettingsTile(
            icon = Icons.Default.Security,
            title = strings.privacyTitle,
            subtitle = strings.privacySubtitle,
            onClick = { showPrivacyDialog = true }
        )

        Spacer(modifier = Modifier.height(Spacing.md))

        // Section: About O-TRAVELZ
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = DarkSurfaceElevated,
            border = androidx.compose.foundation.BorderStroke(1.dp, SunTempleGold.copy(alpha = 0.35f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(Spacing.lg),
                horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
            ) {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = DarkSurface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, SunTempleGold.copy(alpha = 0.5f)),
                    modifier = Modifier.size(56.dp)
                ) {
                    Box(contentAlignment = androidx.compose.ui.Alignment.Center) {
                        Icon(
                            painter = androidx.compose.ui.res.painterResource(id = com.otravelz.android.R.drawable.ic_otravelz_logo),
                            contentDescription = "O-TRAVELZ Logo Mark",
                            tint = androidx.compose.ui.graphics.Color.Unspecified,
                            modifier = Modifier.size(40.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(Spacing.sm))
                Text(
                    text = "O-TRAVELZ",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.2.sp
                )
                Text(
                    text = "Odisha Travel Intelligence",
                    style = MaterialTheme.typography.bodyMedium,
                    color = SunTempleGold,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "Built by Algoryxz",
                    style = MaterialTheme.typography.labelMedium,
                    color = TextSecondary,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "v3.0.0 • SOA IDEATHON 2026",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(Spacing.md))
                HorizontalDivider(color = DarkBorderSubtle)
                Spacer(modifier = Modifier.height(Spacing.md))

                // Truthfulness & Data Grounding Summary
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(Spacing.xs)
                ) {
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = OchrePrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "160+ WGS-84 Verified Destinations (30 Districts)",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.DirectionsBus,
                            contentDescription = null,
                            tint = OchrePrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "1,430 Scheduled Mo Bus Stops (CRUT Timetables)",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.WbSunny,
                            contentDescription = null,
                            tint = OchrePrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Live Weather Advisories (Open-Meteo API)",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = null,
                            tint = OchrePrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "DPDP Act 2023 Aligned • Zero Continuous Telemetry",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(Spacing.md))

                // GitHub Action Button
                val uriHandler = androidx.compose.ui.platform.LocalUriHandler.current
                OutlinedButton(
                    onClick = {
                        try {
                            uriHandler.openUri("https://github.com/Algoryxz/O-Travelz")
                        } catch (e: Exception) {
                            // Ignored
                        }
                    },
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, OchrePrimary.copy(alpha = 0.6f)),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = OchrePrimary),
                    modifier = Modifier.fillMaxWidth().height(42.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.OpenInNew,
                        contentDescription = "Open GitHub",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "View on GitHub (Algoryxz/O-Travelz)",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(Spacing.sm))
                Text(
                    text = "Crafted by Algoryxz",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.xl))
    }

    // Language Selector Dialog
    if (showLanguageDialog) {
        val languages = listOf(
            "en" to "English",
            "or" to "ଓଡ଼ିଆ (Odia)",
            "hi" to "हिन्दी (Hindi)"
        )
        AlertDialog(
            onDismissRequest = { showLanguageDialog = false },
            title = {
                Text(strings.languageSettingTitle, style = MaterialTheme.typography.titleMedium, color = TextPrimary)
            },
            text = {
                Column {
                    languages.forEach { (code, name) ->
                        Row(
                            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp)
                        ) {
                            RadioButton(
                                selected = userPreferences.preferredLanguage == code,
                                onClick = {
                                    coroutineScope.launch {
                                        preferencesDataStore.setPreferredLanguage(code)
                                    }
                                    showLanguageDialog = false
                                },
                                colors = RadioButtonDefaults.colors(selectedColor = OchrePrimary)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = name, style = MaterialTheme.typography.bodyLarge, color = TextPrimary)
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showLanguageDialog = false }) {
                    Text(strings.closeAction, color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    // Privacy Dialog
    if (showPrivacyDialog) {
        AlertDialog(
            onDismissRequest = { showPrivacyDialog = false },
            title = {
                Text(strings.privacyTitle, style = MaterialTheme.typography.titleMedium, color = TextPrimary)
            },
            text = {
                Text(
                    "O-TRAVELZ Mobile is designed privacy-first:\n\n• Location coordinates are used ephemerally in-memory to compute Haversine distances to nearby destinations and stops.\n• Itineraries and saved trips are saved locally in Room database on your device (App-private Local Storage).\n• No background tracking or continuous telemetry.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            },
            confirmButton = {
                TextButton(onClick = { showPrivacyDialog = false }) {
                    Text(strings.gotItAction, color = OchrePrimary, fontWeight = FontWeight.Bold)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }
}
