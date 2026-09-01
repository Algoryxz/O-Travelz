package com.otravelz.android.core.notifications

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*

/**
 * Rationale dialog explaining why O-Travelz requests notification permissions.
 */
@Composable
fun NotificationRationaleDialog(
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DarkSurface,
        titleContentColor = TextPrimary,
        textContentColor = TextSecondary,
        icon = {
            Icon(
                imageVector = Icons.Default.NotificationsActive,
                contentDescription = "Notification Permissions",
                tint = OchrePrimary,
                modifier = Modifier.size(32.dp)
            )
        },
        title = {
            Text(
                text = "Enable Travel Reminders",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column {
                Text(
                    text = "O-Travelz uses notifications to deliver:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(Spacing.xs))
                Text(
                    text = "• Saved destination reminders with instant deep links.\n• Scheduled Mo Bus & Ama Bus timetable advice.\n• Live Open-Meteo weather updates.",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(Spacing.sm))
                Text(
                    text = "You can customize or mute alert categories at any time in settings.",
                    style = MaterialTheme.typography.labelSmall,
                    color = OchreLight
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(
                    containerColor = OchrePrimary,
                    contentColor = DarkBackground
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Allow Notifications", fontWeight = FontWeight.SemiBold)
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                colors = ButtonDefaults.textButtonColors(contentColor = TextMuted)
            ) {
                Text("Not Now")
            }
        }
    )
}

/**
 * Dialog allowing users to configure notification preferences.
 */
@Composable
fun NotificationPreferencesDialog(
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var prefs by remember { mutableStateOf(NotificationPreferences.getPreferences(context)) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DarkSurface,
        titleContentColor = TextPrimary,
        textContentColor = TextSecondary,
        icon = {
            Icon(
                imageVector = Icons.Default.Notifications,
                contentDescription = "Notification Preferences",
                tint = OchrePrimary,
                modifier = Modifier.size(28.dp)
            )
        },
        title = {
            Text(
                text = "Notification Settings",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                PreferenceToggleRow(
                    title = "Trip Reminders",
                    subtitle = "Destination alerts and saved itineraries",
                    checked = prefs.tripAlertsEnabled,
                    onCheckedChange = { enabled ->
                        NotificationPreferences.setTripAlertsEnabled(context, enabled)
                        prefs = prefs.copy(tripAlertsEnabled = enabled)
                    }
                )

                Spacer(modifier = Modifier.height(Spacing.sm))

                PreferenceToggleRow(
                    title = "Transit Guidance",
                    subtitle = "Scheduled timetable and walking prompts",
                    checked = prefs.transitGuidanceEnabled,
                    onCheckedChange = { enabled ->
                        NotificationPreferences.setTransitGuidanceEnabled(context, enabled)
                        prefs = prefs.copy(transitGuidanceEnabled = enabled)
                    }
                )

                Spacer(modifier = Modifier.height(Spacing.sm))

                PreferenceToggleRow(
                    title = "Live Weather Alerts",
                    subtitle = "Open-Meteo regional weather context",
                    checked = prefs.weatherAlertsEnabled,
                    onCheckedChange = { enabled ->
                        NotificationPreferences.setWeatherAlertsEnabled(context, enabled)
                        prefs = prefs.copy(weatherAlertsEnabled = enabled)
                    }
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(
                    containerColor = OchrePrimary,
                    contentColor = DarkBackground
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Done", fontWeight = FontWeight.SemiBold)
            }
        }
    )
}

@Composable
private fun PreferenceToggleRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
            Text(text = title, style = MaterialTheme.typography.titleSmall, color = TextPrimary)
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
