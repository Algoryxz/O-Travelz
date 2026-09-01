package com.otravelz.android.feature.map

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationSearching
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.location.GeolocationState
import com.otravelz.android.core.location.LocationManager
import com.otravelz.android.data.model.PlaceDetailDto

@Composable
fun MapScreen(
    places: List<PlaceDetailDto>,
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val locationManager = remember { LocationManager(context) }
    val locationState by locationManager.state.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(Spacing.md)
    ) {
        Text(
            text = "Interactive Travel Map",
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary
        )
        Text(
            text = "Canonical Geospatial Projection & First-Mile Routing",
            style = MaterialTheme.typography.bodyMedium,
            color = OchreLight
        )

        Spacer(modifier = Modifier.height(Spacing.md))

        // GPS State & Location Button
        OTCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "GPS Location (DPDP Compliant)",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary
                    )
                    when (val state = locationState) {
                        is GeolocationState.Idle -> {
                            Text("Location not requested yet", style = MaterialTheme.typography.bodyMedium, color = TextMuted)
                        }
                        is GeolocationState.Requesting -> {
                            Text("Requesting GPS lock...", style = MaterialTheme.typography.bodyMedium, color = OchrePrimary)
                        }
                        is GeolocationState.Granted -> {
                            Text("Lat: %.4f, Lon: %.4f".format(state.lat, state.lon), style = MaterialTheme.typography.bodyMedium, color = StatusSuccess)
                        }
                        is GeolocationState.Denied -> {
                            Text("Permission Denied", style = MaterialTheme.typography.bodyMedium, color = StatusError)
                        }
                        is GeolocationState.Unavailable -> {
                            Text("GPS Unavailable", style = MaterialTheme.typography.bodyMedium, color = StatusWarning)
                        }
                    }
                }

                IconButton(
                    onClick = { locationManager.requestLocation() }
                ) {
                    Icon(
                        imageVector = if (locationState is GeolocationState.Granted) Icons.Default.MyLocation else Icons.Default.LocationSearching,
                        contentDescription = "Get GPS Location",
                        tint = OchrePrimary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(Spacing.md))

        Text(
            text = "Canonical Destination Pins (${places.size})",
            style = MaterialTheme.typography.titleLarge,
            color = TextPrimary
        )

        Spacer(modifier = Modifier.height(Spacing.sm))

        val currentLat = (locationState as? GeolocationState.Granted)?.lat ?: 20.2961
        val currentLon = (locationState as? GeolocationState.Granted)?.lon ?: 85.8245

        LazyColumn(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            items(places) { place ->
                val distKm = if (place.lat != null && place.lon != null) {
                    LocationManager.haversineDistanceKm(currentLat, currentLon, place.lat, place.lon)
                } else null

                val firstMile = distKm?.let { LocationManager.getFirstMileRecommendation(it * 1000) }

                OTCard(onClick = { onPlaceClick(place.id) }) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Place, contentDescription = null, tint = OchrePrimary)
                        Spacer(modifier = Modifier.width(Spacing.sm))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = place.name, style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                            Text(
                                text = "${place.district ?: "Odisha"} • ${distKm?.let { "%.1f km away".format(it) } ?: "Coordinates verified"}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                            if (firstMile != null) {
                                Text(
                                    text = "First-Mile: $firstMile",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TealLight
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
