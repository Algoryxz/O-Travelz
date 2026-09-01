package com.otravelz.android.feature.place

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.otravelz.android.core.design.*
import com.otravelz.android.core.notifications.NotificationHelper
import com.otravelz.android.core.notifications.NotificationPreferencesDialog

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlaceDetailScreen(
    placeId: String,
    viewModel: PlaceDetailViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    onRequestNotificationPermission: (((onGranted: (() -> Unit)?) -> Unit))? = null
) {
    val context = LocalContext.current
    val state by viewModel.uiState.collectAsState()
    var isReminderSet by remember { mutableStateOf(false) }
    var showPreferencesDialog by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(placeId) {
        viewModel.loadPlace(placeId)
    }

    if (showPreferencesDialog) {
        NotificationPreferencesDialog(
            onDismiss = { showPreferencesDialog = false }
        )
    }

    if (state.isLoading) {
        LoadingState(modifier = modifier.fillMaxSize())
        return
    }

    if (state.errorMessage != null || state.place == null) {
        ErrorState(
            message = state.errorMessage ?: "Place details unavailable",
            onRetry = { viewModel.loadPlace(placeId) },
            modifier = modifier.fillMaxSize()
        )
        return
    }

    val place = state.place!!
    val primaryImage = place.images.firstOrNull()?.url

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = place.name, maxLines = 1) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                actions = {
                    IconButton(onClick = { showPreferencesDialog = true }) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Notification Settings",
                            tint = OchreLight
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkSurface,
                    titleContentColor = TextPrimary
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = DarkBackground
    ) { padding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // Hero Photo
            if (!primaryImage.isNullOrBlank()) {
                AsyncImage(
                    model = primaryImage,
                    contentDescription = place.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp)
                )
            }

            Column(modifier = Modifier.padding(Spacing.md)) {
                // Verified Badge
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CheckCircle, contentDescription = "Verified", tint = StatusSuccess, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(Spacing.xs))
                    Text(
                        text = "Verified Canonical Destination",
                        style = MaterialTheme.typography.labelSmall,
                        color = StatusSuccess,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(Spacing.xs))
                Text(text = place.name, style = MaterialTheme.typography.headlineLarge, color = TextPrimary)
                Text(text = "${place.district ?: "Odisha"} • ${place.category.replace("_", " ").capitalize()}", style = MaterialTheme.typography.titleMedium, color = OchreLight)

                Spacer(modifier = Modifier.height(Spacing.md))

                // Location & Coordinates Box
                OTCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LocationOn, contentDescription = "Location", tint = OchrePrimary)
                        Spacer(modifier = Modifier.width(Spacing.sm))
                        Column {
                            Text(text = "Coordinates", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                            val lat = place.lat?.let { "%.4f".format(it) } ?: "N/A"
                            val lon = place.lon?.let { "%.4f".format(it) } ?: "N/A"
                            Text(
                                text = "Lat: $lat, Lon: $lon (Label: Verified)",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(Spacing.md))

                // Travel Reminder & Alert Trigger Box
                OTCard {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier.weight(1f),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = if (isReminderSet) Icons.Default.NotificationsActive else Icons.Default.Notifications,
                                contentDescription = "Reminder",
                                tint = if (isReminderSet) StatusSuccess else OchrePrimary,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(Spacing.sm))
                            Column {
                                Text(
                                    text = if (isReminderSet) "Travel Alert Active" else "Set Trip Reminder",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = TextPrimary
                                )
                                Text(
                                    text = if (isReminderSet) "Deep link ready in notification tray" else "Receive trip alert with instant place access",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = TextSecondary
                                )
                            }
                        }

                        Button(
                            onClick = {
                                val triggerAlert = {
                                    val posted = NotificationHelper.showTripReminder(context, place.id, place.name)
                                    if (posted) {
                                        isReminderSet = true
                                    }
                                }

                                if (onRequestNotificationPermission != null) {
                                    onRequestNotificationPermission(triggerAlert)
                                } else {
                                    triggerAlert()
                                }
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isReminderSet) DarkSurfaceVariant else OchrePrimary,
                                contentColor = if (isReminderSet) TextPrimary else DarkBackground
                            ),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = if (isReminderSet) "Alert Sent" else "Remind Me",
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(Spacing.md))

                // Description
                if (!place.description.isNullOrBlank()) {
                    Text(text = "About this Destination", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                    Spacer(modifier = Modifier.height(Spacing.xs))
                    Text(text = place.description, style = MaterialTheme.typography.bodyLarge, color = TextSecondary)
                    Spacer(modifier = Modifier.height(Spacing.md))
                }

                // First-Mile & Transit Guidance
                OTCard {
                    Text(text = "First-Mile Transit Access", style = MaterialTheme.typography.titleMedium, color = OchreLight)
                    Spacer(modifier = Modifier.height(Spacing.xs))
                    Text(
                        text = "Connecting via CRUT Mo Bus & Ama Bus Network. Scheduled timetables available in transit hub view.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }
            }
        }
    }
}
