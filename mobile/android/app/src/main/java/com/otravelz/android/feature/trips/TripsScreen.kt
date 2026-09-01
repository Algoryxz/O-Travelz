package com.otravelz.android.feature.trips

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Route
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import com.otravelz.android.data.model.ItineraryPlanResponseDto

@Composable
fun TripsScreen(
    onPlanNewTrip: () -> Unit,
    onTripClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // Punam Lane: Trips & Offline Itinerary Management
    val dummySavedTrips = remember {
        mutableStateListOf(
            SavedTripItem(
                id = "trip-golden-triangle",
                title = "Odisha Golden Triangle",
                duration = "2 Days • 6 Destinations",
                origin = "Bhubaneswar (Master Canteen)",
                stops = listOf("Lingaraj Temple", "Konark Sun Temple", "Puri Jagannath Temple"),
                transport = "Mo Bus & Intercity Bus (Scheduled)",
                createdDate = "September 2026"
            ),
            SavedTripItem(
                id = "trip-ekamra-heritage",
                title = "Ekamra Kshetra Cultural Day",
                duration = "1 Day • 4 Destinations",
                origin = "Bhubaneswar",
                stops = listOf("Ananta Vasudeva", "Mukteswar Temple", "Bindu Sagar", "Khandagiri Caves"),
                transport = "Mo Bus Route 10 (Scheduled)",
                createdDate = "September 2026"
            )
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(Spacing.md)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column {
                Text(
                    text = "My Trips",
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${dummySavedTrips.size} Saved itineraries available offline",
                    style = MaterialTheme.typography.bodySmall,
                    color = OchreLight
                )
            }

            OTButton(
                text = "+ Plan",
                onClick = onPlanNewTrip,
                variant = ButtonVariant.Primary,
                modifier = Modifier.height(40.dp)
            )
        }

        Spacer(modifier = Modifier.height(Spacing.md))

        if (dummySavedTrips.isEmpty()) {
            EmptyState(
                title = "No saved trips yet",
                subtitle = "Use the O-TRAVELZ Planner to generate an optimized itinerary with scheduled transit hops.",
                actionText = "Plan a Trip",
                onAction = onPlanNewTrip,
                modifier = Modifier.weight(1f)
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(Spacing.md),
                modifier = Modifier.weight(1f)
            ) {
                items(dummySavedTrips, key = { it.id }) { trip ->
                    SavedTripCard(
                        trip = trip,
                        onClick = { onTripClick(trip.id) },
                        onDelete = { dummySavedTrips.remove(trip) }
                    )
                }
            }
        }
    }
}

data class SavedTripItem(
    val id: String,
    val title: String,
    val duration: String,
    val origin: String,
    val stops: List<String>,
    val transport: String,
    val createdDate: String
)

@Composable
private fun SavedTripCard(
    trip: SavedTripItem,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(Spacing.md)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Route,
                        contentDescription = null,
                        tint = SunTempleGold,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(Spacing.xs))
                    Text(
                        text = trip.title,
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }

                TruthBadge(label = "OFFLINE READY", backgroundColor = DarkSurfaceVariant, contentColor = TextSecondary)
            }

            Spacer(modifier = Modifier.height(Spacing.xs))

            Text(
                text = trip.duration,
                style = MaterialTheme.typography.labelMedium,
                color = OchreLight
            )

            Spacer(modifier = Modifier.height(Spacing.xs))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Place,
                    contentDescription = null,
                    tint = TextMuted,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(Spacing.xs))
                Text(
                    text = trip.stops.joinToString(" → "),
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    maxLines = 1
                )
            }

            Spacer(modifier = Modifier.height(Spacing.xs))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.DirectionsBus,
                    contentDescription = null,
                    tint = TealLight,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(Spacing.xs))
                Text(
                    text = trip.transport,
                    style = MaterialTheme.typography.bodySmall,
                    color = TealLight
                )
            }

            Spacer(modifier = Modifier.height(Spacing.sm))

            HorizontalDivider(color = DarkBorder, thickness = 1.dp)

            Spacer(modifier = Modifier.height(Spacing.xs))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Saved ${trip.createdDate}",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted
                )

                IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                    Icon(
                        imageVector = Icons.Default.DeleteOutline,
                        contentDescription = "Delete Trip",
                        tint = StatusError,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}
