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
import com.otravelz.android.core.design.*
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
            text = "You & Settings",
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Account, preferences, and data truth manifest",
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
            text = "Preferences",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsTile(
            icon = Icons.Default.Language,
            title = "Display Language",
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
            text = "Community & Staging",
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

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Section: Data Management
        Text(
            text = "Data Management",
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

        // Section: Diagnostics & Architecture Truth
        Text(
            text = "System Diagnostics & Source Truth",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(Spacing.xs))

        Surface(
            shape = RoundedCornerShape(14.dp),
            color = DarkSurfaceElevated,
            border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(Spacing.md), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text("Destinations Catalog", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                    Text("160+ Verified [Curated]", style = MaterialTheme.typography.labelSmall, color = SimilipalEmerald, fontWeight = FontWeight.Bold)
                }
                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text("Transit Schedules", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                    Text("Mo Bus / Ama Bus [Scheduled]", style = MaterialTheme.typography.labelSmall, color = SunTempleGold, fontWeight = FontWeight.Bold)
                }
                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text("Weather API", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                    Text("Open-Meteo [Live]", style = MaterialTheme.typography.labelSmall, color = OchrePrimary, fontWeight = FontWeight.Bold)
                }
                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text("Local Persistence", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                    Text("Room SQLite v2 [Local]", style = MaterialTheme.typography.labelSmall, color = TextPrimary, fontWeight = FontWeight.Bold)
                }
                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text("Distance Engine", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                    Text("WGS-84 Haversine [Estimated]", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                }
            }
        }

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Section: Privacy & Compliance
        Text(
            text = "Privacy & Platform",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsTile(
            icon = Icons.Default.Security,
            title = "Location & Data Policy",
            subtitle = "Privacy-first: Location coordinates are processed ephemerally on-device for spatial sorting.",
            onClick = { showPrivacyDialog = true }
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsTile(
            icon = Icons.Default.Info,
            title = "About O-TRAVELZ Mobile v3.0",
            subtitle = "Autonomous native Odisha cultural mobility companion",
            onClick = {}
        )

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
                Text("Select Language", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
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
                    Text("Close", color = TextSecondary)
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
                Text("Privacy & Data Guarantee", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
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
                    Text("Got It", color = OchrePrimary, fontWeight = FontWeight.Bold)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }
}
