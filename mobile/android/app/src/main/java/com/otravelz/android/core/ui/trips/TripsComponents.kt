package com.otravelz.android.core.ui.trips

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Route
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import com.otravelz.android.data.model.SyncTripItemDto

@Composable
fun TripsHeader(
    tripCount: Int,
    onPlanNewTrip: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "My Trips",
                style = MaterialTheme.typography.headlineMedium,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = if (tripCount > 0) "$tripCount saved itineraries available offline" else "Deterministic itineraries saved on device",
                style = MaterialTheme.typography.bodySmall,
                color = SunTempleGold
            )
        }

        Button(
            onClick = onPlanNewTrip,
            colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground),
            shape = RoundedCornerShape(12.dp),
            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
        ) {
            Icon(Icons.Default.Route, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text("+ New Plan", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun SavedTripCardV3(
    trip: SyncTripItemDto,
    onClick: () -> Unit,
    onShare: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(Spacing.md)) {
            // Header Row: Title + Truth Badge
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .background(OchrePrimary.copy(alpha = 0.15f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Route,
                            contentDescription = null,
                            tint = OchrePrimary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(Spacing.sm))
                    Text(
                        text = trip.title.ifBlank { "Odisha Custom Itinerary" },
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                }

                TruthBadge(
                    label = "OFFLINE READY",
                    backgroundColor = DarkSurfaceVariant,
                    contentColor = SunTempleGold
                )
            }

            Spacer(modifier = Modifier.height(Spacing.sm))

            // Itinerary summary: Days & Stops
            val days = trip.itinerary?.days.orEmpty()
            val stopCount = days.sumOf { it.stops.size }
            val dayCount = days.size.coerceAtLeast(1)

            Row(
                horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
                modifier = Modifier.fillMaxWidth()
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = DarkSurfaceVariant
                ) {
                    Text(
                        text = "$dayCount ${if (dayCount == 1) "Day" else "Days"}",
                        style = MaterialTheme.typography.labelSmall,
                        color = OchreLight,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = DarkSurfaceVariant
                ) {
                    Text(
                        text = "$stopCount Verified Stops",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextSecondary,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            // Stops preview list
            if (days.isNotEmpty()) {
                val allStops = days.flatMap { it.stops }
                if (allStops.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(Spacing.sm))
                    Row(verticalAlignment = Alignment.Top) {
                        Icon(
                            imageVector = Icons.Default.Place,
                            contentDescription = null,
                            tint = TextMuted,
                            modifier = Modifier.size(16.dp).padding(top = 2.dp)
                        )
                        Spacer(modifier = Modifier.width(Spacing.xs))
                        Text(
                            text = allStops.take(4).joinToString(" ➔ ") { it.place.name } +
                                if (allStops.size > 4) " +${allStops.size - 4} more" else "",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary,
                            maxLines = 2
                        )
                    }
                }
            }

            // Scheduled Transit connectivity tag
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
                    text = "Mo Bus & Ama Bus connectivity scheduled",
                    style = MaterialTheme.typography.bodySmall,
                    color = TealLight
                )
            }

            Spacer(modifier = Modifier.height(Spacing.sm))
            HorizontalDivider(color = DarkBorderSubtle, thickness = 1.dp)
            Spacer(modifier = Modifier.height(Spacing.xs))

            // Footer Actions
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Tap to open in Planner",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted
                )

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(onClick = onShare, modifier = Modifier.size(32.dp)) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share Trip",
                            tint = TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                        Icon(
                            imageVector = Icons.Default.DeleteOutline,
                            contentDescription = "Delete Trip",
                            tint = StatusError,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun EmptyTripsStateV3(
    onPlanNewTrip: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
            .fillMaxWidth()
            .padding(Spacing.xl)
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .background(DarkSurfaceVariant, CircleShape)
                .border(1.dp, DarkBorderSubtle, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.BookmarkBorder,
                contentDescription = null,
                tint = SunTempleGold,
                modifier = Modifier.size(36.dp)
            )
        }

        Spacer(modifier = Modifier.height(Spacing.md))

        Text(
            text = "No Saved Trips Yet",
            style = MaterialTheme.typography.titleLarge,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        Text(
            text = "Generate optimized daily routes with scheduled Mo Bus transit in the Planner, then tap 'Save Trip' to store them offline.",
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )

        Spacer(modifier = Modifier.height(Spacing.lg))

        Button(
            onClick = onPlanNewTrip,
            colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground),
            shape = RoundedCornerShape(12.dp),
            contentPadding = PaddingValues(horizontal = 24.dp, vertical = 12.dp)
        ) {
            Icon(Icons.Default.Route, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Create Your First Itinerary", fontWeight = FontWeight.Bold)
        }
    }
}
