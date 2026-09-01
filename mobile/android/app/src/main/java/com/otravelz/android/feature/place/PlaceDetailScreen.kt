package com.otravelz.android.feature.place

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
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
import com.otravelz.android.data.repository.SavedPlacesRepository
import kotlinx.coroutines.launch

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
    val coroutineScope = rememberCoroutineScope()
    val savedPlacesRepository = remember { SavedPlacesRepository(context) }
    val savedPlaceIds by savedPlacesRepository.savedPlaceIds.collectAsState()

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
    val isSaved = savedPlaceIds.contains(place.id)
    val primaryImage = com.otravelz.android.core.network.ApiConfig.resolveImageUrl(place.images.firstOrNull()?.url)

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
                    // Bookmark / Save Action
                    IconButton(onClick = {
                        val savedNow = savedPlacesRepository.toggleSave(place)
                        coroutineScope.launch {
                            savedPlacesRepository.syncWithServer()
                            snackbarHostState.showSnackbar(
                                if (savedNow) "Saved to your bookmarks" else "Removed from bookmarks"
                            )
                        }
                    }) {
                        Icon(
                            imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                            contentDescription = if (isSaved) "Remove Bookmark" else "Save Place",
                            tint = if (isSaved) OchrePrimary else TextPrimary
                        )
                    }

                    // Notification Settings Action
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
                // Verified Badge & Rating Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
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

                    if (place.rating != null) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Star, contentDescription = "Rating", tint = OchrePrimary, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(2.dp))
                            Text(
                                text = "%.1f".format(place.rating),
                                style = MaterialTheme.typography.labelSmall,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )
                            if (place.ratingCount != null) {
                                Text(
                                    text = " (${place.ratingCount})",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextMuted
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(Spacing.xs))
                Text(text = place.name, style = MaterialTheme.typography.headlineLarge, color = TextPrimary)
                Text(text = "${place.district ?: "Odisha"} • ${place.category.replace("_", " ").capitalize()}", style = MaterialTheme.typography.titleMedium, color = OchreLight)

                Spacer(modifier = Modifier.height(Spacing.sm))

                // Visit Metadata Chips
                Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                    if (place.avgVisitMinutes != null) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(DarkSurfaceVariant)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Icon(Icons.Default.Schedule, contentDescription = null, tint = TextMuted, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "~${place.avgVisitMinutes} mins visit",
                                style = MaterialTheme.typography.labelSmall,
                                color = TextSecondary
                            )
                        }
                    }

                    if (!place.priceTier.isNullOrBlank()) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(DarkSurfaceVariant)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = place.priceTier.uppercase(),
                                style = MaterialTheme.typography.labelSmall,
                                color = TealLight,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

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
                            if (!place.address.isNullOrBlank()) {
                                Text(
                                    text = place.address,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = TextMuted
                                )
                            }
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

                // Safety & Contact Hotline if available
                if (!place.emergencyPhone.isNullOrBlank() || !place.contactPhone.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(Spacing.md))
                    OTCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Call, contentDescription = "Safety", tint = StatusWarning)
                            Spacer(modifier = Modifier.width(Spacing.sm))
                            Column {
                                Text(text = "Safety & Emergency Hotlines", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                                if (!place.emergencyPhone.isNullOrBlank()) {
                                    Text(text = "Emergency / Tourist Police: ${place.emergencyPhone}", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                                }
                                if (!place.contactPhone.isNullOrBlank()) {
                                    Text(text = "Destination Contact: ${place.contactPhone}", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
