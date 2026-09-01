package com.otravelz.android.feature.map

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.DirectionsWalk
import androidx.compose.material.icons.filled.*
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

    var selectedCategory by remember { mutableStateOf("All") }
    var showPermissionRationale by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                      permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            locationManager.requestLocation()
        } else {
            locationManager.setDenied("Location permission denied. Utilizing default Bhubaneswar reference.")
        }
    }

    fun handleLocationRequest() {
        if (locationManager.hasLocationPermission()) {
            locationManager.requestLocation()
        } else {
            showPermissionRationale = true
        }
    }

    val currentLat = when (val state = locationState) {
        is GeolocationState.Granted -> state.lat
        is GeolocationState.ReferenceOrigin -> state.lat
        else -> LocationManager.DEFAULT_FALLBACK_LAT
    }
    val currentLon = when (val state = locationState) {
        is GeolocationState.Granted -> state.lon
        is GeolocationState.ReferenceOrigin -> state.lon
        else -> LocationManager.DEFAULT_FALLBACK_LON
    }

    // In-memory Location Access Dialog
    if (showPermissionRationale) {
        AlertDialog(
            onDismissRequest = { showPermissionRationale = false },
            icon = { Icon(Icons.Default.Security, contentDescription = null, tint = OchrePrimary) },
            title = {
                Text(
                    text = "In-Memory Location Access",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                    Text(
                        text = "O-TRAVELZ uses your GPS location solely in-memory for this session to calculate straight-line distances to cultural destinations and nearby Mo Bus transit stops.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                    Text(
                        text = "Location is used in-memory for this session and is not persisted by this feature.",
                        style = MaterialTheme.typography.bodySmall,
                        color = OchreLight,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showPermissionRationale = false
                        permissionLauncher.launch(
                            arrayOf(
                                Manifest.permission.ACCESS_FINE_LOCATION,
                                Manifest.permission.ACCESS_COARSE_LOCATION
                            )
                        )
                    }
                ) {
                    Text("Grant Permission", color = OchrePrimary, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showPermissionRationale = false
                        locationManager.setDenied()
                    }
                ) {
                    Text("Use Default Origin", color = TextMuted)
                }
            },
            containerColor = DarkSurface,
            shape = MaterialTheme.shapes.large
        )
    }

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

        // GPS State & Location Control Card
        OTCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "GPS Location (In-Memory State)",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary
                    )
                    when (val state = locationState) {
                        is GeolocationState.Idle -> {
                            Text(
                                text = "Using Bhubaneswar Reference (20.2961°N, 85.8245°E)",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextMuted
                            )
                        }
                        is GeolocationState.Requesting -> {
                            Text(
                                text = "Acquiring GPS lock...",
                                style = MaterialTheme.typography.bodySmall,
                                color = OchrePrimary
                            )
                        }
                        is GeolocationState.Granted -> {
                            Text(
                                text = "Active Lock: %.4f°N, %.4f°E (±%.0fm)".format(
                                    state.lat,
                                    state.lon,
                                    state.accuracyMeters ?: 0f
                                ),
                                style = MaterialTheme.typography.bodySmall,
                                color = StatusSuccess,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        is GeolocationState.ReferenceOrigin -> {
                            Text(
                                text = "Using Bhubaneswar Reference Origin (GPS offline)",
                                style = MaterialTheme.typography.bodySmall,
                                color = OchreLight
                            )
                        }
                        is GeolocationState.Denied -> {
                            Text(
                                text = "Permission Denied • Default Origin Active",
                                style = MaterialTheme.typography.bodySmall,
                                color = StatusError
                            )
                        }
                        is GeolocationState.Unavailable -> {
                            Text(
                                text = "GPS Hardware Offline • Fallback Origin Active",
                                style = MaterialTheme.typography.bodySmall,
                                color = StatusWarning
                            )
                        }
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (locationState is GeolocationState.Granted) {
                        IconButton(onClick = { locationManager.clear() }) {
                            Icon(
                                imageVector = Icons.Default.Clear,
                                contentDescription = "Clear in-memory location",
                                tint = TextMuted
                            )
                        }
                    }

                    IconButton(onClick = { handleLocationRequest() }) {
                        Icon(
                            imageVector = if (locationState is GeolocationState.Granted) Icons.Default.MyLocation else Icons.Default.LocationSearching,
                            contentDescription = "Request GPS Location",
                            tint = OchrePrimary
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Category Filter Chips
        val categories = listOf("All", "heritage", "temple", "nature", "wildlife", "craft", "beach")
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs)
        ) {
            categories.forEach { cat ->
                ContextChip(
                    label = if (cat == "All") "All Places" else cat.replaceFirstChar { it.uppercase() },
                    isSelected = selectedCategory == cat,
                    onClick = { selectedCategory = cat }
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.md))

        val filteredPlaces = remember(places, selectedCategory) {
            if (selectedCategory == "All") {
                places
            } else {
                places.filter { it.category.equals(selectedCategory, ignoreCase = true) }
            }
        }

        Text(
            text = "Destination Pins & First-Mile Guidance (${filteredPlaces.size})",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        if (filteredPlaces.isEmpty()) {
            EmptyState(
                title = "No destinations found",
                subtitle = "No verified places match the selected category filter."
            )
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                items(filteredPlaces, key = { it.id }) { place ->
                    val distKm = if (place.lat != null && place.lon != null) {
                        LocationManager.haversineDistanceKm(currentLat, currentLon, place.lat, place.lon)
                    } else null

                    val distanceMeters = distKm?.times(1000)
                    val firstMileGuidance = distanceMeters?.let { LocationManager.getFirstMileRecommendation(it) }

                    OTCard(onClick = { onPlaceClick(place.id) }) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Place, contentDescription = null, tint = OchrePrimary)
                            Spacer(modifier = Modifier.width(Spacing.sm))
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = place.name,
                                        style = MaterialTheme.typography.titleMedium,
                                        color = TextPrimary,
                                        modifier = Modifier.weight(1f)
                                    )
                                    if (distKm != null) {
                                        Text(
                                            text = "%.1f km · straight-line".format(distKm),
                                            style = MaterialTheme.typography.labelSmall,
                                            color = OchreLight,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }

                                Text(
                                    text = "${place.district ?: "Odisha"} • ${place.category.replace("_", " ").uppercase()}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = TextSecondary
                                )

                                if (firstMileGuidance != null) {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.AutoMirrored.Filled.DirectionsWalk,
                                            contentDescription = null,
                                            tint = TealLight,
                                            modifier = Modifier.size(14.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "First-Mile: $firstMileGuidance",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = TealLight,
                                            fontWeight = FontWeight.Medium
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
