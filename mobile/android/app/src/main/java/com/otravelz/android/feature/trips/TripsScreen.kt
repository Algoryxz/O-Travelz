package com.otravelz.android.feature.trips

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Route
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.otravelz.android.core.design.*
import com.otravelz.android.core.network.ApiConfig
import com.otravelz.android.core.ui.trips.EmptyTripsStateV3
import com.otravelz.android.core.ui.trips.SavedTripCardV3
import com.otravelz.android.core.ui.trips.TripsHeader
import com.otravelz.android.core.util.ShareHelper
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.SyncTripItemDto
import com.otravelz.android.data.repository.SavedPlacesRepository
import com.otravelz.android.data.repository.SavedTripsRepository

enum class TripsTab {
    ITINERARIES,
    SAVED_PLACES
}

@Composable
fun TripsScreen(
    onPlanNewTrip: () -> Unit,
    onTripClick: (String) -> Unit,
    onPlaceClick: ((String) -> Unit)? = null,
    onStartTripMode: ((String) -> Unit)? = null,
    onReplanTrip: ((SyncTripItemDto) -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val tripsRepository = remember {
        try {
            SavedTripsRepository(context)
        } catch (_: Exception) {
            null
        }
    }

    val placesRepository = remember {
        try {
            SavedPlacesRepository(context)
        } catch (_: Exception) {
            null
        }
    }

    val savedTrips by tripsRepository?.savedTrips?.collectAsState() ?: remember { mutableStateOf(emptyList()) }
    val savedPlaces by placesRepository?.savedPlaces?.collectAsState() ?: remember { mutableStateOf(emptyList()) }

    var activeTab by remember { mutableStateOf(TripsTab.ITINERARIES) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(Spacing.md)
    ) {
        TripsHeader(
            tripCount = savedTrips.size,
            onPlanNewTrip = onPlanNewTrip
        )

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Dual Segmented Tabs (Itineraries vs Saved Places)
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = DarkSurface,
            border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(4.dp)
            ) {
                // Itineraries Tab
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (activeTab == TripsTab.ITINERARIES) OchrePrimary else DarkSurface,
                    modifier = Modifier
                        .weight(1f)
                        .clickable { activeTab = TripsTab.ITINERARIES }
                ) {
                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(vertical = 8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Route,
                            contentDescription = null,
                            tint = if (activeTab == TripsTab.ITINERARIES) DarkBackground else TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Itineraries (${savedTrips.size})",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (activeTab == TripsTab.ITINERARIES) DarkBackground else TextSecondary
                        )
                    }
                }

                // Saved Places Tab
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (activeTab == TripsTab.SAVED_PLACES) OchrePrimary else DarkSurface,
                    modifier = Modifier
                        .weight(1f)
                        .clickable { activeTab = TripsTab.SAVED_PLACES }
                ) {
                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(vertical = 8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Bookmark,
                            contentDescription = null,
                            tint = if (activeTab == TripsTab.SAVED_PLACES) DarkBackground else TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Saved Places (${savedPlaces.size})",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (activeTab == TripsTab.SAVED_PLACES) DarkBackground else TextSecondary
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(Spacing.md))

        when (activeTab) {
            TripsTab.ITINERARIES -> {
                if (savedTrips.isEmpty()) {
                    EmptyTripsStateV3(
                        onPlanNewTrip = onPlanNewTrip,
                        modifier = Modifier.weight(1f)
                    )
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(Spacing.md),
                        modifier = Modifier.weight(1f)
                    ) {
                        items(savedTrips, key = { it.id }) { trip ->
                            SavedTripCardV3(
                                trip = trip,
                                onClick = { onTripClick(trip.id) },
                                onStartTripMode = {
                                    if (onStartTripMode != null) {
                                        onStartTripMode(trip.id)
                                    } else {
                                        onTripClick(trip.id)
                                    }
                                },
                                onDuplicate = {
                                    val cloned = tripsRepository?.duplicateTrip(trip.id)
                                    if (cloned != null) {
                                        Toast.makeText(context, "Duplicated '${trip.title}'", Toast.LENGTH_SHORT).show()
                                    }
                                },
                                onReplan = {
                                    if (onReplanTrip != null) {
                                        onReplanTrip(trip)
                                    } else {
                                        onPlanNewTrip()
                                    }
                                },
                                onShare = {
                                    ShareHelper.shareTrip(context, trip)
                                },
                                onDelete = {
                                    tripsRepository?.deleteTrip(trip.id)
                                    Toast.makeText(context, "Deleted itinerary", Toast.LENGTH_SHORT).show()
                                }
                            )
                        }
                    }
                }
            }

            TripsTab.SAVED_PLACES -> {
                if (savedPlaces.isEmpty()) {
                    OTBrandedEmptyState(
                        title = "No saved places yet",
                        message = "Bookmark heritage sites and nature spots across Odisha from Discover or Place Details.",
                        modifier = Modifier.weight(1f)
                    )
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
                        modifier = Modifier.weight(1f)
                    ) {
                        items(savedPlaces, key = { it.id }) { place ->
                            SavedPlaceRow(
                                place = place,
                                onClick = { onPlaceClick?.invoke(place.id) },
                                onRemove = {
                                    placesRepository?.removePlace(place.id)
                                    Toast.makeText(context, "Removed from saved places", Toast.LENGTH_SHORT).show()
                                },
                                onShare = {
                                    ShareHelper.sharePlace(context, place)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SavedPlaceRow(
    place: PlaceDetailDto,
    onClick: () -> Unit,
    onRemove: () -> Unit,
    onShare: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = DarkSurface,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(Spacing.sm)
        ) {
            val imageUrl = place.images.firstOrNull()?.url?.let { ApiConfig.resolveImageUrl(it) }
            if (imageUrl != null) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = place.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(10.dp))
                )
            } else {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(DarkSurfaceElevated),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = OchrePrimary,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(Spacing.sm))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = place.name,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    maxLines = 1
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = place.category.replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.labelSmall,
                        color = OchrePrimary
                    )
                    if (!place.district.isNullOrBlank()) {
                        Text(
                            text = "• ${place.district}",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextMuted
                        )
                    }
                }
            }

            IconButton(onClick = onShare, modifier = Modifier.size(32.dp)) {
                Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.Share,
                    contentDescription = "Share",
                    tint = TextSecondary,
                    modifier = Modifier.size(16.dp)
                )
            }

            IconButton(onClick = onRemove, modifier = Modifier.size(32.dp)) {
                Icon(
                    imageVector = Icons.Default.DeleteOutline,
                    contentDescription = "Remove Bookmark",
                    tint = StatusError,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}
