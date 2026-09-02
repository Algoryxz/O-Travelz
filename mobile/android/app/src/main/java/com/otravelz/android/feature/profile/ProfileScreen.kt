package com.otravelz.android.feature.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.ui.profile.*

@Composable
fun ProfileScreen(
    onNavigateToSavedPlaces: () -> Unit,
    onNavigateToTrips: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedLanguage by remember { mutableStateOf("English") }
    var tripRemindersEnabled by remember { mutableStateOf(true) }
    var weatherAdvisoriesEnabled by remember { mutableStateOf(true) }
    var showCommunityDialog by remember { mutableStateOf(false) }
    var showLanguageDialog by remember { mutableStateOf(false) }
    var showPrivacyDialog by remember { mutableStateOf(false) }

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
            destinationCount = "80+ Verified",
            transitStatus = "Mo Bus Schedules",
            activeLanguage = selectedLanguage
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
            subtitle = selectedLanguage,
            onClick = { showLanguageDialog = true }
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsToggleTile(
            icon = Icons.Default.Notifications,
            title = "Trip Arrival Alerts",
            subtitle = "Contextual arrival alerts and departure windows",
            checked = tripRemindersEnabled,
            onCheckedChange = { tripRemindersEnabled = it }
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsToggleTile(
            icon = Icons.Default.CloudQueue,
            title = "Live Weather Advisories",
            subtitle = "Open-Meteo live updates along active routes",
            checked = weatherAdvisoriesEnabled,
            onCheckedChange = { weatherAdvisoriesEnabled = it }
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
            title = "Recommend an Unlisted Gem",
            subtitle = "Submit unlisted Odia heritage, food, or nature spots for research verification",
            onClick = { showCommunityDialog = true }
        )

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

    // Community Dialog
    if (showCommunityDialog) {
        AlertDialog(
            onDismissRequest = { showCommunityDialog = false },
            title = {
                Text("Recommend a Destination", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
            },
            text = {
                Text(
                    "Community destination submissions are staged in data/research/round2/ for verification by the research team before public indexing.\n\nStrict Rule: No verified image = no public index.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            },
            confirmButton = {
                TextButton(onClick = { showCommunityDialog = false }) {
                    Text("Understood", color = OchrePrimary, fontWeight = FontWeight.Bold)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    // Language Selector Dialog
    if (showLanguageDialog) {
        val languages = listOf("English", "ଓଡ଼ିଆ (Odia)", "हिन्दी (Hindi)")
        AlertDialog(
            onDismissRequest = { showLanguageDialog = false },
            title = {
                Text("Select Language", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
            },
            text = {
                Column {
                    languages.forEach { lang ->
                        Row(
                            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp)
                        ) {
                            RadioButton(
                                selected = selectedLanguage == lang,
                                onClick = {
                                    selectedLanguage = lang
                                    showLanguageDialog = false
                                },
                                colors = RadioButtonDefaults.colors(selectedColor = OchrePrimary)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = lang, style = MaterialTheme.typography.bodyLarge, color = TextPrimary)
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
                    "O-TRAVELZ Mobile is designed privacy-first:\n\n• Location coordinates are used ephemerally in-memory to compute Haversine distances to nearby destinations and stops.\n• Itineraries and saved trips are saved locally on your device (App-private Local Storage).\n• No background tracking or continuous telemetry.",
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
