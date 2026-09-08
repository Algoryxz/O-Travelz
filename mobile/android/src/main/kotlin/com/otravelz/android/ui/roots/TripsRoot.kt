package com.otravelz.android.ui.roots

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.otravelz.android.R
import com.otravelz.android.data.local.entity.SavedPlaceEntity
import com.otravelz.android.data.local.entity.TripProgressEntity
import com.otravelz.android.data.local.model.SavedTripWithStops
import com.otravelz.android.navigation.NavDestination
import com.otravelz.android.ui.screens.TripsViewModel
import com.otravelz.android.ui.theme.ChilikaBlueAccent
import com.otravelz.android.ui.theme.ForestGreenAccent
import com.otravelz.android.ui.theme.Spacing
import com.otravelz.android.ui.theme.TerracottaAccent

/**
 * Functional Trips root for Android (Wave M14).
 * Displays Active Trip execution, Saved Itineraries, and Saved Places backed by Room SQLite.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TripsRoot(
    modifier: Modifier = Modifier,
    onPlaceClick: (String) -> Unit = {},
    onNavigateToPlan: () -> Unit = {},
    onNavigateToDiscover: () -> Unit = {},
    viewModel: TripsViewModel = viewModel()
) {
    val activeTrip by viewModel.activeTripState.collectAsState()
    val savedTrips by viewModel.savedTripsState.collectAsState()
    val savedPlaces by viewModel.savedPlacesState.collectAsState()

    var tripToDelete by remember { mutableStateOf<String?>(null) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(NavDestination.TRIPS.titleRes),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { innerPadding ->
        val isAllEmpty = activeTrip == null && savedTrips.isEmpty() && savedPlaces.isEmpty()

        if (isAllEmpty) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier
                        .padding(Spacing.space6)
                        .widthIn(max = 500.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Bookmark,
                        contentDescription = null,
                        modifier = Modifier.size(56.dp),
                        tint = TerracottaAccent
                    )
                    Spacer(modifier = Modifier.height(Spacing.space4))
                    Text(
                        text = stringResource(R.string.trips_empty_saved_trips_title),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(Spacing.space2))
                    Text(
                        text = stringResource(R.string.trips_empty_saved_trips_desc),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(Spacing.space6))
                    Row(horizontalArrangement = Arrangement.spacedBy(Spacing.space3)) {
                        Button(
                            onClick = onNavigateToPlan,
                            colors = ButtonDefaults.buttonColors(containerColor = TerracottaAccent),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(stringResource(R.string.plan_screen_title), style = MaterialTheme.typography.labelMedium)
                        }
                        OutlinedButton(
                            onClick = onNavigateToDiscover,
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(stringResource(R.string.nav_discover), style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(horizontal = Spacing.space4),
                verticalArrangement = Arrangement.spacedBy(Spacing.space5)
            ) {
                // Section 1: Active Trip
                if (activeTrip != null) {
                    item(key = "section_active_trip") {
                        val (tripWithStops, progress) = activeTrip!!
                        ActiveTripCard(
                            tripWithStops = tripWithStops,
                            progress = progress,
                            onMarkVisited = { placeId -> viewModel.markStopVisited(tripWithStops.trip.tripId, placeId) },
                            onSkipStop = { placeId -> viewModel.skipStop(tripWithStops.trip.tripId, placeId) },
                            onEndTrip = { viewModel.endActiveTrip(tripWithStops.trip.tripId) },
                            onPlaceClick = onPlaceClick
                        )
                    }
                }

                // Section 2: Saved Trips
                if (savedTrips.isNotEmpty()) {
                    item(key = "header_saved_trips") {
                        Text(
                            text = "${stringResource(R.string.trips_section_saved_trips)} (${savedTrips.size})",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.padding(top = Spacing.space2)
                        )
                    }
                    items(savedTrips, key = { it.trip.tripId }) { tripWithStops ->
                        SavedTripRowCard(
                            tripWithStops = tripWithStops,
                            isActive = activeTrip?.first?.trip?.tripId == tripWithStops.trip.tripId,
                            onStartTrip = { viewModel.startTrip(tripWithStops.trip.tripId) },
                            onDeleteTrip = { tripToDelete = tripWithStops.trip.tripId },
                            onPlaceClick = onPlaceClick
                        )
                    }
                }

                // Section 3: Saved Places
                if (savedPlaces.isNotEmpty()) {
                    item(key = "header_saved_places") {
                        Text(
                            text = "${stringResource(R.string.trips_section_saved_places)} (${savedPlaces.size})",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.padding(top = Spacing.space2)
                        )
                    }
                    items(savedPlaces, key = { it.canonicalPlaceId }) { place ->
                        SavedPlaceRowCard(
                            place = place,
                            onClick = { onPlaceClick(place.canonicalPlaceId) },
                            onUnsave = { viewModel.unsavePlace(place.canonicalPlaceId) }
                        )
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(Spacing.space6))
                }
            }
        }
    }

    // Deletion confirmation dialog
    if (tripToDelete != null) {
        AlertDialog(
            onDismissRequest = { tripToDelete = null },
            title = { Text(stringResource(R.string.trips_confirm_delete_title)) },
            text = { Text(stringResource(R.string.trips_confirm_delete_msg)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        tripToDelete?.let { viewModel.deleteTrip(it) }
                        tripToDelete = null
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text(stringResource(R.string.trips_action_delete_trip))
                }
            },
            dismissButton = {
                TextButton(onClick = { tripToDelete = null }) {
                    Text(stringResource(R.string.transit_action_close))
                }
            }
        )
    }
}

@Composable
private fun ActiveTripCard(
    tripWithStops: SavedTripWithStops,
    progress: TripProgressEntity,
    onMarkVisited: (String) -> Unit,
    onSkipStop: (String) -> Unit,
    onEndTrip: () -> Unit,
    onPlaceClick: (String) -> Unit
) {
    val dayStops = tripWithStops.sortedStops.filter { it.dayNumber == progress.activeDay }
    val visitedIds = remember(progress.completedStopIdsJson) {
        progress.completedStopIdsJson.trim('[', ']').split(",").map { it.trim('\"', ' ') }.filter { it.isNotBlank() }
    }
    val currentStop = dayStops.firstOrNull { !visitedIds.contains(it.canonicalPlaceId) } ?: dayStops.lastOrNull()

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = TerracottaAccent.copy(alpha = 0.08f)),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, TerracottaAccent.copy(alpha = 0.3f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(Spacing.space4),
            verticalArrangement = Arrangement.spacedBy(Spacing.space3)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = stringResource(R.string.trips_section_active),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = TerracottaAccent
                    )
                    Text(
                        text = tripWithStops.trip.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = ForestGreenAccent.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = stringResource(R.string.trips_active_day_label, progress.activeDay, tripWithStops.trip.daysCount),
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = ForestGreenAccent,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            if (currentStop != null) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surface,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onPlaceClick(currentStop.canonicalPlaceId) }
                ) {
                    Column(
                        modifier = Modifier.padding(Spacing.space3),
                        verticalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        Text(
                            text = stringResource(R.string.trips_active_current_stop, currentStop.placeName),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(Spacing.space2),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = currentStop.category.replace("_", " ").replaceFirstChar { it.uppercase() },
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            if (currentStop.plannedArrival != null && currentStop.plannedDeparture != null) {
                                Text(
                                    text = "· ${currentStop.plannedArrival} – ${currentStop.plannedDeparture}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TerracottaAccent
                                )
                            }
                        }

                        // Operational Action Row: Mark Visited & Skip
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                        ) {
                            Button(
                                onClick = { onMarkVisited(currentStop.canonicalPlaceId) },
                                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenAccent),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(stringResource(R.string.trips_action_mark_visited), style = MaterialTheme.typography.labelMedium)
                            }
                            OutlinedButton(
                                onClick = { onSkipStop(currentStop.canonicalPlaceId) },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Close, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(stringResource(R.string.trips_action_skip_stop), style = MaterialTheme.typography.labelMedium)
                            }
                        }
                    }
                }
            }

            // End Trip Action
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onEndTrip) {
                    Text(stringResource(R.string.trips_action_end_trip), color = MaterialTheme.colorScheme.outline)
                }
            }
        }
    }
}

@Composable
private fun SavedTripRowCard(
    tripWithStops: SavedTripWithStops,
    isActive: Boolean,
    onStartTrip: () -> Unit,
    onDeleteTrip: () -> Unit,
    onPlaceClick: (String) -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(Spacing.space4),
            verticalArrangement = Arrangement.spacedBy(Spacing.space2)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = tripWithStops.trip.title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onDeleteTrip, modifier = Modifier.size(32.dp)) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = stringResource(R.string.trips_action_delete_trip),
                        tint = MaterialTheme.colorScheme.outline,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Text(
                text = "${tripWithStops.trip.daysCount} Days · ${tripWithStops.stops.size} Confirmed Stops",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Stops preview chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                tripWithStops.sortedStops.take(3).forEach { stop ->
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = MaterialTheme.colorScheme.surface,
                        modifier = Modifier.clickable { onPlaceClick(stop.canonicalPlaceId) }
                    ) {
                        Text(
                            text = stop.placeName,
                            style = MaterialTheme.typography.labelSmall,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(2.dp))

            if (!isActive) {
                Button(
                    onClick = onStartTrip,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(stringResource(R.string.trips_action_start_trip), style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
}

@Composable
private fun SavedPlaceRowCard(
    place: SavedPlaceEntity,
    onClick: () -> Unit,
    onUnsave: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier.padding(Spacing.space3),
            horizontalArrangement = Arrangement.spacedBy(Spacing.space3),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (place.imageUrl != null) {
                AsyncImage(
                    model = place.imageUrl,
                    contentDescription = place.placeName,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(54.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
            } else {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = TerracottaAccent.copy(alpha = 0.15f),
                    modifier = Modifier.size(54.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = place.placeName.take(1),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TerracottaAccent
                        )
                    }
                }
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = place.placeName,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "${place.category.replace("_", " ")}${place.district?.let { ", $it" } ?: ""}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            IconButton(onClick = onUnsave, modifier = Modifier.size(36.dp)) {
                Icon(
                    imageVector = Icons.Default.Bookmark,
                    contentDescription = stringResource(R.string.action_unsave_place),
                    tint = TerracottaAccent,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}
