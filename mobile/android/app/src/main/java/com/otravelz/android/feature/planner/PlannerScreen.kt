package com.otravelz.android.feature.planner

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.notifications.NotificationHelper
import com.otravelz.android.data.model.ItineraryStopDto
import com.otravelz.android.data.model.SyncTripItemDto
import com.otravelz.android.data.model.TransportHopDto

@Composable
fun PlannerScreen(
    viewModel: PlannerViewModel,
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val state by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    val originCities = listOf(
        Triple("Bhubaneswar", 20.2961, 85.8245),
        Triple("Puri", 19.8049, 85.8179),
        Triple("Cuttack", 20.4625, 85.8828),
        Triple("Sambalpur", 21.4669, 83.9812)
    )

    val durations = listOf(1, 2, 3, 5)

    val interestCategories = listOf(
        "temple" to "Temples",
        "monument" to "Heritage",
        "nature" to "Nature & Wildlife",
        "beach" to "Beaches",
        "market" to "Handicrafts"
    )

    // Trip Share Dialog
    if (state.sharedTripUrl != null) {
        val shareUrl = state.sharedTripUrl!!
        AlertDialog(
            onDismissRequest = { viewModel.clearShareUrl() },
            containerColor = DarkSurface,
            titleContentColor = TextPrimary,
            textContentColor = TextSecondary,
            icon = {
                Icon(Icons.Default.Share, contentDescription = null, tint = OchrePrimary)
            },
            title = {
                Text("Public Trip Snapshot Created", style = MaterialTheme.typography.titleLarge)
            },
            text = {
                Column {
                    Text("Your read-only trip snapshot link is ready to share:", style = MaterialTheme.typography.bodyMedium)
                    Spacer(modifier = Modifier.height(Spacing.sm))
                    Text(text = shareUrl, style = MaterialTheme.typography.labelSmall, color = OchreLight)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val sendIntent: Intent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(Intent.EXTRA_TEXT, "Check out my O-Travelz trip itinerary: $shareUrl")
                            type = "text/plain"
                        }
                        val shareIntent = Intent.createChooser(sendIntent, "Share Trip Itinerary")
                        context.startActivity(shareIntent)
                        viewModel.clearShareUrl()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground)
                ) {
                    Text("Share Link")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    clipboardManager.setText(AnnotatedString(shareUrl))
                    viewModel.clearShareUrl()
                }) {
                    Text("Copy URL", color = TextMuted)
                }
            }
        )
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = DarkBackground
    ) { padding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .background(DarkBackground)
                .padding(Spacing.md)
        ) {
            Text(
                text = "AI Trip & Transit Planner",
                style = MaterialTheme.typography.headlineMedium,
                color = TextPrimary
            )
            Text(
                text = "Grounded Itinerary with Mo Bus & Ama Bus Routing",
                style = MaterialTheme.typography.bodyMedium,
                color = OchreLight
            )

            Spacer(modifier = Modifier.height(Spacing.sm))

            // Tab Bar: Create Plan vs Saved Trips
            Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                ContextChip(
                    label = "Create Plan",
                    isSelected = state.activeTab == PlannerTab.CREATE_PLAN,
                    onClick = { viewModel.setActiveTab(PlannerTab.CREATE_PLAN) }
                )
                ContextChip(
                    label = "Saved Trips (${state.savedTrips.size})",
                    isSelected = state.activeTab == PlannerTab.SAVED_TRIPS,
                    onClick = { viewModel.setActiveTab(PlannerTab.SAVED_TRIPS) }
                )
            }

            Spacer(modifier = Modifier.height(Spacing.md))

            if (state.activeTab == PlannerTab.SAVED_TRIPS) {
                // Saved Trips Tab View
                if (state.savedTrips.isEmpty()) {
                    EmptyState(
                        title = "No Saved Trips Yet",
                        subtitle = "Generate a customized travel itinerary and tap 'Save Plan' to access it anytime offline."
                    )
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                        items(state.savedTrips) { trip ->
                            SavedTripCard(
                                trip = trip,
                                onLoad = { viewModel.loadSavedPlan(trip) },
                                onDelete = { viewModel.deleteSavedPlan(trip.id) }
                            )
                        }
                    }
                }
            } else {
                // Create Plan Tab View
                LazyColumn(verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
                    item {
                        // Prompt Input Box
                        OutlinedTextField(
                            value = state.prompt,
                            onValueChange = { viewModel.updatePrompt(it) },
                            label = { Text("Trip Goal & Focus", color = TextMuted) },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = OchrePrimary,
                                unfocusedBorderColor = DarkBorder,
                                focusedContainerColor = DarkSurface,
                                unfocusedContainerColor = DarkSurface,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    item {
                        // Origin City Selection
                        Text(text = "Starting Hub / Origin City", style = MaterialTheme.typography.titleSmall, color = TextPrimary)
                        Spacer(modifier = Modifier.height(Spacing.xs))
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                            items(originCities) { (cityName, lat, lon) ->
                                ContextChip(
                                    label = cityName,
                                    isSelected = state.selectedOriginName == cityName,
                                    onClick = { viewModel.setOrigin(cityName, lat, lon) }
                                )
                            }
                        }
                    }

                    item {
                        // Duration Selection
                        Text(text = "Trip Duration", style = MaterialTheme.typography.titleSmall, color = TextPrimary)
                        Spacer(modifier = Modifier.height(Spacing.xs))
                        Row(horizontalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                            durations.forEach { days ->
                                ContextChip(
                                    label = if (days == 1) "1 Day" else "$days Days",
                                    isSelected = state.durationDays == days,
                                    onClick = { viewModel.setDurationDays(days) }
                                )
                            }
                        }
                    }

                    item {
                        // Interest Category Filters
                        Text(text = "Experience Interests", style = MaterialTheme.typography.titleSmall, color = TextPrimary)
                        Spacer(modifier = Modifier.height(Spacing.xs))
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                            items(interestCategories) { (catId, catLabel) ->
                                ContextChip(
                                    label = catLabel,
                                    isSelected = state.selectedCategories.contains(catId),
                                    onClick = { viewModel.toggleCategory(catId) }
                                )
                            }
                        }
                    }

                    item {
                        // Primary Compute Button
                        OTButton(
                            text = if (state.isLoading) "Computing Optimal Itinerary..." else "Generate ${state.durationDays}-Day Itinerary",
                            onClick = { viewModel.generatePlan() },
                            enabled = !state.isLoading,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    if (state.savedConfirmation != null) {
                        item {
                            Text(
                                text = state.savedConfirmation!!,
                                style = MaterialTheme.typography.labelSmall,
                                color = StatusSuccess,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    if (state.isLoading) {
                        item {
                            LoadingState(message = "Computing deterministic itinerary with verified stops & scheduled transit...")
                        }
                    }

                    if (state.errorMessage != null && state.itinerary == null) {
                        item {
                            ErrorState(
                                message = state.errorMessage ?: "Planning failed",
                                onRetry = { viewModel.generatePlan() }
                            )
                        }
                    }

                    val itinerary = state.itinerary
                    if (itinerary != null) {
                        item {
                            OTCard {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "Grounded Plan Overview",
                                            style = MaterialTheme.typography.titleMedium,
                                            color = OchrePrimary
                                        )
                                        Text(
                                            text = itinerary.explanation,
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = TextSecondary
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(Spacing.sm))

                                // Save & Share Actions
                                Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                                    Button(
                                        onClick = { viewModel.saveCurrentPlan() },
                                        colors = ButtonDefaults.buttonColors(containerColor = DarkSurfaceVariant, contentColor = TextPrimary),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Icon(Icons.Default.Bookmark, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Save Plan")
                                    }

                                    Button(
                                        onClick = { viewModel.shareCurrentPlan() },
                                        enabled = !state.isSharing,
                                        colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(if (state.isSharing) "Sharing..." else "Share Trip")
                                    }
                                }
                            }
                        }

                        itinerary.days.forEach { day ->
                            item {
                                Text(
                                    text = "Day ${day.dayNumber}: ${day.theme ?: "Heritage & City Discovery"}",
                                    style = MaterialTheme.typography.titleLarge,
                                    color = TextPrimary,
                                    modifier = Modifier.padding(top = Spacing.sm)
                                )
                            }

                            items(day.stops) { stop ->
                                ItineraryStopCard(
                                    stop = stop,
                                    onPlaceClick = onPlaceClick,
                                    onReminderClick = {
                                        NotificationHelper.showTripReminder(context, stop.place.id, stop.place.name)
                                    }
                                )
                            }

                            items(day.hops) { hop ->
                                TransportHopCard(
                                    hop = hop,
                                    onTransitAlertClick = {
                                        NotificationHelper.showTransitGuidance(
                                            context = context,
                                            stopName = "Mo Bus Transit Hop ${hop.fromSequence} to ${hop.toSequence}",
                                            routeName = hop.mode.uppercase(),
                                            advice = "Scheduled transit connection ~${hop.estimatedMinutes ?: 15} mins"
                                        )
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ItineraryStopCard(
    stop: ItineraryStopDto,
    onPlaceClick: (String) -> Unit,
    onReminderClick: () -> Unit
) {
    OTCard(onClick = { onPlaceClick(stop.place.id) }) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Place, contentDescription = null, tint = OchrePrimary)
            Spacer(modifier = Modifier.width(Spacing.sm))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "${stop.sequence}. ${stop.place.name}",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary
                )
                Text(
                    text = "Planned: ${stop.plannedArrival ?: "09:00"} – ${stop.plannedDeparture ?: "10:30"} • ~${stop.durationMinutes ?: 60}m visit",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            }

            IconButton(onClick = onReminderClick) {
                Icon(
                    imageVector = Icons.Default.NotificationsActive,
                    contentDescription = "Set Stop Reminder",
                    tint = OchreLight
                )
            }
        }
    }
}

@Composable
fun TransportHopCard(
    hop: TransportHopDto,
    onTransitAlertClick: (() -> Unit)? = null
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceVariant),
        modifier = Modifier.fillMaxWidth().padding(horizontal = Spacing.xs)
    ) {
        Row(
            modifier = Modifier.padding(Spacing.sm),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val icon = if (hop.mode.contains("bus", ignoreCase = true)) Icons.Default.DirectionsBus else Icons.Default.DirectionsWalk
            Icon(icon, contentDescription = null, tint = TealLight, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(Spacing.sm))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Hop ${hop.fromSequence} ➔ ${hop.toSequence}: ${hop.mode.uppercase()} (~${hop.estimatedMinutes ?: 15} mins)",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TealLight,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "Label: ${hop.dataTier.uppercase()} • First-Mile: Walking/Auto",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted
                )
            }

            if (onTransitAlertClick != null) {
                IconButton(onClick = onTransitAlertClick) {
                    Icon(
                        imageVector = Icons.Default.NotificationsActive,
                        contentDescription = "Transit Guidance Alert",
                        tint = TealLight,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun SavedTripCard(
    trip: SyncTripItemDto,
    onLoad: () -> Unit,
    onDelete: () -> Unit
) {
    OTCard(onClick = onLoad) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = trip.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary
                )
                val stopCount = trip.itinerary?.days?.sumOf { it.stops.size } ?: 0
                val dayCount = trip.itinerary?.days?.size ?: 1
                Text(
                    text = "$dayCount Days • $stopCount Verified Stops • Tap to Open",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OchreLight
                )
            }

            IconButton(onClick = onDelete) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Delete Saved Trip",
                    tint = TextMuted
                )
            }
        }
    }
}
