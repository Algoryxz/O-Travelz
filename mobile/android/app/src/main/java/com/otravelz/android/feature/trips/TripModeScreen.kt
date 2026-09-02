package com.otravelz.android.feature.trips

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.location.FirstMileEstimator
import com.otravelz.android.core.notifications.TripReminderScheduler
import com.otravelz.android.core.util.ShareHelper
import com.otravelz.android.data.model.ItineraryDayDto
import com.otravelz.android.data.model.ItineraryStopDto
import com.otravelz.android.data.model.SyncTripItemDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TripModeScreen(
    trip: SyncTripItemDto,
    onBackClick: () -> Unit,
    onPlaceClick: (String) -> Unit,
    onMapClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val days = trip.itinerary?.days.orEmpty()
    var selectedDayIndex by remember { mutableIntStateOf(0) }
    val currentDay: ItineraryDayDto? = days.getOrNull(selectedDayIndex)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Trip Mode • Today's Plan",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = trip.title,
                            style = MaterialTheme.typography.labelSmall,
                            color = OchrePrimary,
                            maxLines = 1
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimary
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { ShareHelper.shareTrip(context, trip) }) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share Itinerary",
                            tint = TextPrimary
                        )
                    }
                    IconButton(onClick = onMapClick) {
                        Icon(
                            imageVector = Icons.Default.Map,
                            contentDescription = "View on Map",
                            tint = OchrePrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkBackground
                )
            )
        },
        containerColor = DarkBackground,
        modifier = modifier
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = Spacing.md),
            verticalArrangement = Arrangement.spacedBy(Spacing.md)
        ) {
            // Truth Disclaimer Banner
            item {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = DarkSurfaceElevated,
                    border = androidx.compose.foundation.BorderStroke(1.dp, OchrePrimary.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(Spacing.sm),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = OchrePrimary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(Spacing.sm))
                        Text(
                            text = "Scheduled Timeline: Stop times and transit legs are derived from published timetables. No live GPS vehicle telemetry is claimed.",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                    }
                }
            }

            // Multi-Day Stepper Tabs (if > 1 day)
            if (days.size > 1) {
                item {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(days.indices.toList()) { index ->
                            val isSelected = index == selectedDayIndex
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (isSelected) OchrePrimary else DarkSurface,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSelected) OchrePrimary else DarkBorder
                                ),
                                modifier = Modifier.clickable { selectedDayIndex = index }
                            ) {
                                Text(
                                    text = "Day ${index + 1}",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = if (isSelected) DarkBackground else TextSecondary,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Current Active Sequence of Stops
            if (currentDay != null && currentDay.stops.isNotEmpty()) {
                item {
                    Text(
                        text = "Day ${currentDay.dayNumber} Stop Sequence (${currentDay.stops.size} Stops)",
                        style = MaterialTheme.typography.titleSmall,
                        color = TextPrimary,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                items(currentDay.stops.indices.toList()) { stopIndex ->
                    val stop = currentDay.stops[stopIndex]
                    val isFirst = stopIndex == 0
                    val isLast = stopIndex == currentDay.stops.size - 1
                    val hop = currentDay.hops.getOrNull(stopIndex)

                    TripModeStopCard(
                        stop = stop,
                        isFirst = isFirst,
                        isLast = isLast,
                        hop = hop,
                        onPlaceClick = { onPlaceClick(stop.place.id) },
                        onSetReminder = {
                            val triggerMs = System.currentTimeMillis() + 30 * 60 * 1000L // 30 min from now
                            TripReminderScheduler.scheduleTripReminder(
                                context = context,
                                tripId = trip.id,
                                tripTitle = trip.title,
                                nextStopName = stop.place.name,
                                triggerAtMillis = triggerMs
                            )
                            Toast.makeText(context, "Departure alert set for ${stop.place.name}", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            } else {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No stops recorded for this day",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextMuted
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(Spacing.xxl))
            }
        }
    }
}

@Composable
private fun TripModeStopCard(
    stop: ItineraryStopDto,
    isFirst: Boolean,
    isLast: Boolean,
    hop: com.otravelz.android.data.model.TransportHopDto?,
    onPlaceClick: () -> Unit,
    onSetReminder: () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = DarkSurface,
            border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(Spacing.md)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(OchrePrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${stop.sequence}",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = DarkBackground
                            )
                        }
                        Spacer(modifier = Modifier.width(Spacing.sm))
                        Column {
                            Text(
                                text = stop.place.name,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = stop.place.category.replaceFirstChar { it.uppercase() },
                                style = MaterialTheme.typography.labelSmall,
                                color = OchrePrimary
                            )
                        }
                    }

                    IconButton(
                        onClick = onSetReminder,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Alarm,
                            contentDescription = "Set Reminder",
                            tint = OchrePrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(Spacing.xs))

                // Arrival & Departure Time Pills
                Row(
                    horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (!stop.plannedArrival.isNullOrBlank()) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = DarkSurfaceElevated
                        ) {
                            Text(
                                text = "Arrive: ${stop.plannedArrival}",
                                style = MaterialTheme.typography.labelSmall,
                                color = TextSecondary,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    if (stop.durationMinutes != null) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = DarkSurfaceElevated
                        ) {
                            Text(
                                text = "${stop.durationMinutes} min visit",
                                style = MaterialTheme.typography.labelSmall,
                                color = TextMuted,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Text(
                        text = "View Details →",
                        style = MaterialTheme.typography.labelSmall,
                        color = OchrePrimary,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable(onClick = onPlaceClick)
                    )
                }
            }
        }

        // Inter-stop transit hop connector
        if (!isLast && hop != null) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md, vertical = Spacing.xs)
            ) {
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .height(28.dp)
                        .background(OchrePrimary.copy(alpha = 0.5f))
                )
                Spacer(modifier = Modifier.width(Spacing.md))
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = DarkSurfaceElevated,
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Icon(
                            imageVector = if (hop.mode.contains("bus", ignoreCase = true)) Icons.Default.DirectionsBus else Icons.Default.DirectionsWalk,
                            contentDescription = null,
                            tint = TerracottaAccent,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "${hop.mode.replaceFirstChar { it.uppercase() }} ${if (hop.estimatedMinutes != null) "• ${hop.estimatedMinutes}m" else ""}",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        val guidance = FirstMileEstimator.classifyFirstMileDistance(800.0)
                        Text(
                            text = "[Scheduled]",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextMuted
                        )
                    }
                }
            }
        }
    }
}
