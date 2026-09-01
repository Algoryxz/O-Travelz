package com.otravelz.android.feature.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddLocationAlt
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PrivacyTip
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*

@Composable
fun ProfileScreen(
    onNavigateToSavedPlaces: () -> Unit,
    onNavigateToTrips: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isOdiaSelected by remember { mutableStateOf(false) }
    var tripRemindersEnabled by remember { mutableStateOf(true) }
    var weatherAlertsEnabled by remember { mutableStateOf(true) }
    var showCommunityDialog by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(Spacing.md)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = "Profile & Settings",
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Account, preferences, and privacy controls",
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(Spacing.md))

        // Guest User Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
            border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(Spacing.md),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .background(DarkSurfaceVariant, CircleShape)
                        .border(2.dp, SunTempleGold, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Guest User",
                        tint = SunTempleGold,
                        modifier = Modifier.size(28.dp)
                    )
                }

                Spacer(modifier = Modifier.width(Spacing.md))

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Odisha Explorer",
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(Spacing.xs))
                        TruthBadge(label = "GUEST", backgroundColor = DarkSurfaceVariant, contentColor = TextSecondary)
                    }
                    Text(
                        text = "Local device storage active",
                        style = MaterialTheme.typography.bodySmall,
                        color = OchreLight
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Section: Community & Contribution
        Text(
            text = "Community Contribution",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsRow(
            icon = Icons.Default.AddLocationAlt,
            title = "Recommend Your Hometown",
            subtitle = "Submit unlisted Odia heritage, food, or natural gems for verification",
            onClick = { showCommunityDialog = true }
        )

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Section: Preferences
        Text(
            text = "Preferences",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsToggleRow(
            icon = Icons.Default.Language,
            title = "Language",
            subtitle = if (isOdiaSelected) "ଓଡ଼ିଆ (Odia)" else "English",
            checked = isOdiaSelected,
            onCheckedChange = { isOdiaSelected = it }
        )

        SettingsToggleRow(
            icon = Icons.Default.Notifications,
            title = "Trip Reminders",
            subtitle = "Contextual destination alerts & departure windows",
            checked = tripRemindersEnabled,
            onCheckedChange = { tripRemindersEnabled = it }
        )

        SettingsToggleRow(
            icon = Icons.Default.Notifications,
            title = "Weather Advisories",
            subtitle = "Open-Meteo live weather updates for active routes",
            checked = weatherAlertsEnabled,
            onCheckedChange = { weatherAlertsEnabled = it }
        )

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Section: Privacy & Compliance
        Text(
            text = "Data & Privacy",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(Spacing.xs))

        SettingsRow(
            icon = Icons.Default.Security,
            title = "DPDP Act 2023 Compliance",
            subtitle = "Location data is processed locally and never sold or persisted on remote servers.",
            onClick = {}
        )

        SettingsRow(
            icon = Icons.Default.Info,
            title = "About O-TRAVELZ v2.0",
            subtitle = "Curated & Verified Odisha Cultural Mobility Platform",
            onClick = {}
        )

        Spacer(modifier = Modifier.height(Spacing.xl))
    }

    if (showCommunityDialog) {
        AlertDialog(
            onDismissRequest = { showCommunityDialog = false },
            title = {
                Text("Recommend a Destination", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
            },
            text = {
                Text(
                    "Community destination submissions are staged for manual verification by the O-TRAVELZ research team before public indexing.\n\nStaging endpoint integration is scheduled for P2.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            },
            confirmButton = {
                TextButton(onClick = { showCommunityDialog = false }) {
                    Text("Understood", color = OchrePrimary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }
}

@Composable
private fun SettingsRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.padding(Spacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = SunTempleGold, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(Spacing.md))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(2.dp))
                Text(text = subtitle, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
            }
            Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted)
        }
    }
}

@Composable
private fun SettingsToggleRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(Spacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = SunTempleGold, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(Spacing.md))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(2.dp))
                Text(text = subtitle, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
            }
            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                colors = SwitchDefaults.colors(
                    checkedThumbColor = DarkBackground,
                    checkedTrackColor = OchrePrimary,
                    uncheckedThumbColor = TextMuted,
                    uncheckedTrackColor = DarkSurfaceVariant
                )
            )
        }
    }
}
