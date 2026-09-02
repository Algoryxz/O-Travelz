package com.otravelz.android.feature.map

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.DirectionsWalk
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.location.FirstMileEstimator
import com.otravelz.android.core.location.GeolocationState
import com.otravelz.android.core.location.LocationManager
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.model.NearbyStopDto
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.repository.TransitRepository
import kotlinx.coroutines.launch

enum class MapViewMode {
    MAP, LIST
}

// Bounding box for Odisha geographic coordinate projection
private const val ODISHA_MIN_LAT = 17.8
private const val ODISHA_MAX_LAT = 22.8
private const val ODISHA_MIN_LON = 81.3
private const val ODISHA_MAX_LON = 87.5

@Composable
fun MapScreen(
    places: List<PlaceDetailDto>,
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier,
    transitRepository: TransitRepository = remember { TransitRepository() }
) {
    val context = LocalContext.current
    val locationManager = remember { LocationManager(context) }
    val locationState by locationManager.state.collectAsState()
    val coroutineScope = rememberCoroutineScope()

    var viewMode by remember { mutableStateOf(MapViewMode.MAP) }
    var selectedCategory by remember { mutableStateOf("All") }
    var showTransitStops by remember { mutableStateOf(true) }
    var showPermissionRationale by remember { mutableStateOf(false) }

    // Interactive Map State
    var zoom by remember { mutableFloatStateOf(1.0f) }
    var panOffsetX by remember { mutableFloatStateOf(0f) }
    var panOffsetY by remember { mutableFloatStateOf(0f) }

    var selectedPlace by remember { mutableStateOf<PlaceDetailDto?>(null) }
    var selectedStop by remember { mutableStateOf<NearbyStopDto?>(null) }

    // Transit stops state
    var transitStops by remember { mutableStateOf<List<NearbyStopDto>>(emptyList()) }

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

    // Load transit stops around active center
    LaunchedEffect(currentLat, currentLon) {
        coroutineScope.launch {
            when (val res = transitRepository.getNearbyStops(currentLat, currentLon, radiusM = 15000, limit = 50)) {
                is NetworkResult.Success -> transitStops = res.data
                else -> {}
            }
        }
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
                        text = "Location is used in-memory for this session and is not persisted to disk.",
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

    val filteredPlaces = remember(places, selectedCategory) {
        if (selectedCategory == "All") {
            places
        } else {
            places.filter { it.category.equals(selectedCategory, ignoreCase = true) }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = Spacing.md, vertical = Spacing.sm)
    ) {
        // Header & View Mode Switcher
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Interactive Travel Map",
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary
                )
                Text(
                    text = "Odisha Geospatial Canvas • First-Mile Routing",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OchreLight
                )
            }

            // Map / List Toggle
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(DarkSurfaceVariant)
                    .padding(2.dp)
            ) {
                IconButton(
                    onClick = { viewMode = MapViewMode.MAP },
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(18.dp))
                        .background(if (viewMode == MapViewMode.MAP) OchrePrimary else Color.Transparent)
                ) {
                    Icon(
                        imageVector = Icons.Default.Map,
                        contentDescription = "Map View",
                        tint = if (viewMode == MapViewMode.MAP) DarkBackground else TextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
                IconButton(
                    onClick = { viewMode = MapViewMode.LIST },
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(18.dp))
                        .background(if (viewMode == MapViewMode.LIST) OchrePrimary else Color.Transparent)
                ) {
                    Icon(
                        imageVector = Icons.Default.List,
                        contentDescription = "List View",
                        tint = if (viewMode == MapViewMode.LIST) DarkBackground else TextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(Spacing.xs))

        // GPS State & Location Control Card (Truth Banner)
        OTCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Location State (In-Memory)",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary
                    )
                    when (val state = locationState) {
                        is GeolocationState.Idle -> {
                            Text(
                                text = "Bhubaneswar reference point (20.2961°N, 85.8245°E)",
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
                                text = "Your location: %.4f°N, %.4f°E (±%.0fm)".format(
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
                                text = "Bhubaneswar reference point (GPS unavailable)",
                                style = MaterialTheme.typography.bodySmall,
                                color = OchreLight
                            )
                        }
                        is GeolocationState.Denied -> {
                            Text(
                                text = "Bhubaneswar reference point (Permission Denied)",
                                style = MaterialTheme.typography.bodySmall,
                                color = StatusWarning
                            )
                        }
                        is GeolocationState.Unavailable -> {
                            Text(
                                text = "Bhubaneswar reference point (GPS Offline)",
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

        Spacer(modifier = Modifier.height(Spacing.xs))

        // Filter Chips & Transit Overlay Toggle
        val categories = listOf("All", "heritage", "temple", "nature", "wildlife", "craft", "beach")
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Transit toggle chip
            FilterChip(
                selected = showTransitStops,
                onClick = { showTransitStops = !showTransitStops },
                label = { Text("Mo Bus Stops", style = MaterialTheme.typography.labelSmall) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.DirectionsBus,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = if (showTransitStops) TealLight else TextMuted
                    )
                },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = TealDark.copy(alpha = 0.5f),
                    selectedLabelColor = TealLight,
                    containerColor = DarkSurfaceVariant,
                    labelColor = TextMuted
                )
            )

            categories.forEach { cat ->
                ContextChip(
                    label = if (cat == "All") "All Places" else cat.replaceFirstChar { it.uppercase() },
                    isSelected = selectedCategory == cat,
                    onClick = { selectedCategory = cat }
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.xs))

        if (viewMode == MapViewMode.MAP) {
            // Interactive Native Spatial Map View
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(DarkSurfaceElevated)
                    .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
            ) {
                // Coordinate Projection Canvas
                InteractiveOdishaMapCanvas(
                    places = filteredPlaces,
                    transitStops = if (showTransitStops) transitStops else emptyList(),
                    currentLat = currentLat,
                    currentLon = currentLon,
                    isGpsGranted = locationState is GeolocationState.Granted,
                    zoom = zoom,
                    panOffsetX = panOffsetX,
                    panOffsetY = panOffsetY,
                    selectedPlaceId = selectedPlace?.id,
                    selectedStopId = selectedStop?.stopId,
                    onTransform = { dZoom, dPan ->
                        zoom = (zoom * dZoom).coerceIn(0.6f, 6.0f)
                        panOffsetX += dPan.x
                        panOffsetY += dPan.y
                    },
                    onPlaceSelected = { place ->
                        selectedPlace = place
                        selectedStop = null
                    },
                    onStopSelected = { stop ->
                        selectedStop = stop
                        selectedPlace = null
                    },
                    onBackgroundTapped = {
                        selectedPlace = null
                        selectedStop = null
                    }
                )

                // Map Overlay Floating Controls (Zoom in, Zoom out, Reset Center)
                Column(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(Spacing.sm),
                    verticalArrangement = Arrangement.spacedBy(Spacing.xs)
                ) {
                    SmallFloatingActionButton(
                        onClick = { zoom = (zoom * 1.3f).coerceAtMost(6.0f) },
                        containerColor = DarkSurface.copy(alpha = 0.9f),
                        contentColor = TextPrimary,
                        shape = CircleShape
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Zoom In", modifier = Modifier.size(18.dp))
                    }
                    SmallFloatingActionButton(
                        onClick = { zoom = (zoom / 1.3f).coerceAtLeast(0.6f) },
                        containerColor = DarkSurface.copy(alpha = 0.9f),
                        contentColor = TextPrimary,
                        shape = CircleShape
                    ) {
                        Icon(Icons.Default.Remove, contentDescription = "Zoom Out", modifier = Modifier.size(18.dp))
                    }
                    SmallFloatingActionButton(
                        onClick = {
                            zoom = 1.0f
                            panOffsetX = 0f
                            panOffsetY = 0f
                        },
                        containerColor = DarkSurface.copy(alpha = 0.9f),
                        contentColor = OchrePrimary,
                        shape = CircleShape
                    ) {
                        Icon(Icons.Default.CenterFocusStrong, contentDescription = "Reset Center", modifier = Modifier.size(18.dp))
                    }
                }

                // Legend / Provenance Indicator Overlay
                Box(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(Spacing.sm)
                        .clip(RoundedCornerShape(8.dp))
                        .background(DarkSurface.copy(alpha = 0.85f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Odisha Projection (${filteredPlaces.size} places)",
                        style = MaterialTheme.typography.labelSmall,
                        color = OchreLight,
                        fontWeight = FontWeight.Medium
                    )
                }

                // Selected Pin Bottom Card
                if (selectedPlace != null || selectedStop != null) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .fillMaxWidth()
                            .padding(Spacing.sm)
                    ) {
                        if (selectedPlace != null) {
                            val place = selectedPlace!!
                            val distKm = if (place.lat != null && place.lon != null) {
                                LocationManager.haversineDistanceKm(currentLat, currentLon, place.lat, place.lon)
                            } else null
                            val distanceMeters = distKm?.times(1000)
                            val firstMile = distanceMeters?.let { FirstMileEstimator.getRecommendation(it) }

                            OTCard(onClick = { onPlaceClick(place.id) }) {
                                Column {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = place.name,
                                                style = MaterialTheme.typography.titleMedium,
                                                color = TextPrimary
                                            )
                                            Text(
                                                text = "${place.district ?: "Odisha"} • ${place.category.uppercase()}",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = TextSecondary
                                            )
                                        }
                                        IconButton(onClick = { selectedPlace = null }, modifier = Modifier.size(24.dp)) {
                                            Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                                        }
                                    }

                                    if (distKm != null) {
                                        Spacer(modifier = Modifier.height(Spacing.xs))
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = "%.1f km · straight-line".format(distKm),
                                                style = MaterialTheme.typography.labelSmall,
                                                color = OchreLight,
                                                fontWeight = FontWeight.Bold
                                            )
                                            if (firstMile != null) {
                                                Text(
                                                    text = firstMile,
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = TealLight
                                                )
                                            }
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(Spacing.xs))
                                    Button(
                                        onClick = { onPlaceClick(place.id) },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground)
                                    ) {
                                        Text("View Place Details", fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        } else if (selectedStop != null) {
                            val stop = selectedStop!!
                            OTCard {
                                Column {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.DirectionsBus, contentDescription = null, tint = TealLight)
                                            Spacer(modifier = Modifier.width(Spacing.xs))
                                            Column {
                                                Text(
                                                    text = stop.name,
                                                    style = MaterialTheme.typography.titleMedium,
                                                    color = TextPrimary
                                                )
                                                if (!stop.publishedName.isNullOrBlank() && stop.publishedName != stop.name) {
                                                    Text(
                                                        text = "Official: ${stop.publishedName}",
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = TextMuted
                                                    )
                                                }
                                            }
                                        }
                                        IconButton(onClick = { selectedStop = null }, modifier = Modifier.size(24.dp)) {
                                            Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(Spacing.xs))
                                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        stop.routes.forEach { r ->
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(4.dp))
                                                    .background(TealDark.copy(alpha = 0.5f))
                                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                                            ) {
                                                Text("Route ${r.routeNumber}", style = MaterialTheme.typography.labelSmall, color = TealLight)
                                            }
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(Spacing.xs))
                                    Text(
                                        text = "Scheduled data • Route geometry unavailable",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = TextMuted
                                    )
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // List View Mode
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
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(Spacing.sm)
                ) {
                    items(filteredPlaces, key = { it.id }) { place ->
                        val distKm = if (place.lat != null && place.lon != null) {
                            LocationManager.haversineDistanceKm(currentLat, currentLon, place.lat, place.lon)
                        } else null

                        val distanceMeters = distKm?.times(1000)
                        val firstMileGuidance = distanceMeters?.let { FirstMileEstimator.getRecommendation(it) }

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
}

/**
 * 2D Interactive Canvas projecting geographic coordinates into screen coordinates.
 */
@Composable
private fun InteractiveOdishaMapCanvas(
    places: List<PlaceDetailDto>,
    transitStops: List<NearbyStopDto>,
    currentLat: Double,
    currentLon: Double,
    isGpsGranted: Boolean,
    zoom: Float,
    panOffsetX: Float,
    panOffsetY: Float,
    selectedPlaceId: String?,
    selectedStopId: String?,
    onTransform: (zoomChange: Float, panChange: Offset) -> Unit,
    onPlaceSelected: (PlaceDetailDto) -> Unit,
    onStopSelected: (NearbyStopDto) -> Unit,
    onBackgroundTapped: () -> Unit
) {
    // Spatial pin projection cache for hit testing
    var projectedPlacePins by remember { mutableStateOf<List<Pair<PlaceDetailDto, Offset>>>(emptyList()) }
    var projectedStopPins by remember { mutableStateOf<List<Pair<NearbyStopDto, Offset>>>(emptyList()) }

    Canvas(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTransformGestures { _, pan, gestureZoom, _ ->
                    onTransform(gestureZoom, pan)
                }
            }
            .pointerInput(projectedPlacePins, projectedStopPins) {
                detectTapGestures { tapOffset ->
                    val touchRadiusPx = 36.dp.toPx()

                    // Check place pin hit
                    val hitPlace = projectedPlacePins.firstOrNull { (_, pos) ->
                        (pos - tapOffset).getDistance() <= touchRadiusPx
                    }
                    if (hitPlace != null) {
                        onPlaceSelected(hitPlace.first)
                        return@detectTapGestures
                    }

                    // Check transit stop pin hit
                    val hitStop = projectedStopPins.firstOrNull { (_, pos) ->
                        (pos - tapOffset).getDistance() <= touchRadiusPx
                    }
                    if (hitStop != null) {
                        onStopSelected(hitStop.first)
                        return@detectTapGestures
                    }

                    onBackgroundTapped()
                }
            }
    ) {
        val width = size.width
        val height = size.height

        fun projectLatLon(lat: Double, lon: Double): Offset {
            val normX = ((lon - ODISHA_MIN_LON) / (ODISHA_MAX_LON - ODISHA_MIN_LON)).toFloat()
            val normY = (1.0f - ((lat - ODISHA_MIN_LAT) / (ODISHA_MAX_LAT - ODISHA_MIN_LAT)).toFloat())

            val cx = width / 2f
            val cy = height / 2f

            val basePx = normX * width
            val basePy = normY * height

            val transformedX = (basePx - cx) * zoom + cx + panOffsetX
            val transformedY = (basePy - cy) * zoom + cy + panOffsetY

            return Offset(transformedX, transformedY)
        }

        // Draw grid lines
        drawGridLines(width, height)

        // Draw Location Origin (User GPS or Bhubaneswar Reference Origin)
        val locationPos = projectLatLon(currentLat, currentLon)
        drawLocationMarker(locationPos, isGpsGranted)

        // Draw Canonical Places
        val placePins = mutableListOf<Pair<PlaceDetailDto, Offset>>()
        places.forEach { place ->
            if (place.lat != null && place.lon != null) {
                val pos = projectLatLon(place.lat, place.lon)
                if (pos.x in -50f..(width + 50f) && pos.y in -50f..(height + 50f)) {
                    placePins.add(place to pos)
                    val isSelected = place.id == selectedPlaceId
                    drawPlacePin(pos, place.category, isSelected)
                }
            }
        }
        projectedPlacePins = placePins

        // Draw Transit Stops (Gated to max 30 in viewport for high performance)
        val stopPins = mutableListOf<Pair<NearbyStopDto, Offset>>()
        val visibleStops = transitStops
            .map { it to projectLatLon(it.latitude, it.longitude) }
            .filter { (_, pos) -> pos.x in -30f..(width + 30f) && pos.y in -30f..(height + 30f) }
            .take(30)

        visibleStops.forEach { (stop, pos) ->
            stopPins.add(stop to pos)
            val isSelected = stop.stopId == selectedStopId
            drawTransitPin(pos, isSelected)
        }
        projectedStopPins = stopPins
    }
}

private fun DrawScope.drawGridLines(width: Float, height: Float) {
    val step = 60.dp.toPx()
    var x = 0f
    while (x < width) {
        drawLine(
            color = DarkBorder.copy(alpha = 0.3f),
            start = Offset(x, 0f),
            end = Offset(x, height),
            strokeWidth = 1f
        )
        x += step
    }
    var y = 0f
    while (y < height) {
        drawLine(
            color = DarkBorder.copy(alpha = 0.3f),
            start = Offset(0f, y),
            end = Offset(width, y),
            strokeWidth = 1f
        )
        y += step
    }
}

private fun DrawScope.drawLocationMarker(pos: Offset, isGpsGranted: Boolean) {
    val color = if (isGpsGranted) StatusSuccess else SunTempleGold
    // Outer ripple
    drawCircle(
        color = color.copy(alpha = 0.25f),
        radius = 16.dp.toPx(),
        center = pos
    )
    // Core dot
    drawCircle(
        color = color,
        radius = 7.dp.toPx(),
        center = pos
    )
    drawCircle(
        color = Color.White,
        radius = 3.dp.toPx(),
        center = pos
    )
}

private fun DrawScope.drawPlacePin(pos: Offset, category: String, isSelected: Boolean) {
    val pinColor = when (category.lowercase()) {
        "heritage" -> SunTempleGold
        "temple" -> OchrePrimary
        "nature", "wildlife" -> Color(0xFF2E7D32)
        "craft" -> Color(0xFFFF8F00)
        "beach" -> Color(0xFF0288D1)
        else -> OchreLight
    }

    val radius = if (isSelected) 10.dp.toPx() else 6.dp.toPx()

    if (isSelected) {
        drawCircle(
            color = Color.White,
            radius = radius + 4.dp.toPx(),
            center = pos
        )
    }

    drawCircle(
        color = pinColor,
        radius = radius,
        center = pos
    )
    drawCircle(
        color = DarkBackground,
        radius = radius * 0.4f,
        center = pos
    )
}

private fun DrawScope.drawTransitPin(pos: Offset, isSelected: Boolean) {
    val radius = if (isSelected) 8.dp.toPx() else 4.5.dp.toPx()
    val color = TealLight

    if (isSelected) {
        drawCircle(
            color = Color.White,
            radius = radius + 3.dp.toPx(),
            center = pos
        )
    }

    drawCircle(
        color = color,
        radius = radius,
        center = pos
    )
    drawCircle(
        color = DarkBackground,
        radius = radius * 0.4f,
        center = pos
    )
}
