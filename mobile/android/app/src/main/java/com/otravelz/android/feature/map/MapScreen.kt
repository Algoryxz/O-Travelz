package com.otravelz.android.feature.map

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.otravelz.android.core.design.*
import com.otravelz.android.core.i18n.LocalAppStrings
import com.otravelz.android.core.location.FirstMileEstimator
import com.otravelz.android.core.location.GeolocationState
import com.otravelz.android.core.location.LocationManager
import com.otravelz.android.core.network.ApiConfig
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
    val strings = LocalAppStrings.current
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
            locationManager.setDenied(strings.locationPermissionDeniedText)
        }
    }

    fun handleLocationRequest() {
        if (locationManager.hasLocationPermission()) {
            locationManager.requestLocation()
        } else {
            showPermissionRationale = true
        }
    }

    val currentLat = locationState.currentLat
    val currentLon = locationState.currentLon
    val isLiveGps = locationState is GeolocationState.LiveLocation || locationState is GeolocationState.LastKnownLocation || locationState is GeolocationState.Granted

    // Load transit stops around active center
    LaunchedEffect(currentLat, currentLon) {
        coroutineScope.launch {
            when (val res = transitRepository.getNearbyStops(currentLat, currentLon, radiusM = 15000, limit = 50)) {
                is NetworkResult.Success -> transitStops = res.data
                else -> {}
            }
        }
    }

    // Location Access Dialog
    if (showPermissionRationale) {
        AlertDialog(
            onDismissRequest = { showPermissionRationale = false },
            icon = { Icon(Icons.Default.Security, contentDescription = null, tint = OchrePrimary) },
            title = {
                Text(
                    text = "Live GPS Location",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary
                )
            },
            text = {
                Text(
                    text = "Allow location access to view your real-time position on the Odisha map and compute accurate first-mile transit recommendations. Location coordinates are strictly kept in-memory and never stored remotely.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showPermissionRationale = false
                        permissionLauncher.launch(
                            arrayOf(
                                Manifest.permission.ACCESS_FINE_LOCATION,
                                Manifest.permission.ACCESS_COARSE_LOCATION
                            )
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground)
                ) {
                    Text("Enable GPS")
                }
            },
            dismissButton = {
                TextButton(onClick = { showPermissionRationale = false }) {
                    Text(strings.closeAction, color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    val filteredPlaces = remember(places, selectedCategory) {
        if (selectedCategory.equals("All", ignoreCase = true)) {
            places
        } else {
            places.filter { it.category.equals(selectedCategory, ignoreCase = true) }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = Spacing.md, vertical = Spacing.xs)
    ) {
        // 1. Header Toolbar with Title & View Mode Toggle
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column {
                Text(
                    text = strings.tabMap,
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Spatial exploration • ${filteredPlaces.size} verified locations",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
            }

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = DarkSurfaceElevated,
                border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
            ) {
                Row(modifier = Modifier.padding(2.dp)) {
                    IconButton(
                        onClick = { viewMode = MapViewMode.MAP },
                        modifier = Modifier
                            .size(36.dp)
                            .background(
                                if (viewMode == MapViewMode.MAP) OchrePrimary else Color.Transparent,
                                RoundedCornerShape(10.dp)
                            )
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
                            .background(
                                if (viewMode == MapViewMode.LIST) OchrePrimary else Color.Transparent,
                                RoundedCornerShape(10.dp)
                            )
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
        }

        Spacer(modifier = Modifier.height(Spacing.xs))

        // 2. Geolocation Status Banner
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = DarkSurfaceElevated,
            border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.padding(horizontal = Spacing.md, vertical = 8.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = if (isLiveGps) Icons.Default.MyLocation else Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = if (isLiveGps) SimilipalEmerald else OchrePrimary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(Spacing.xs))
                    when (val state = locationState) {
                        is GeolocationState.LiveLocation -> {
                            Text(
                                text = "LIVE GPS: ${"%.4f".format(state.lat)}°N, ${"%.4f".format(state.lon)}°E (±${state.accuracyMeters.toInt()}m)",
                                style = MaterialTheme.typography.bodySmall,
                                color = SimilipalEmerald,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        is GeolocationState.LastKnownLocation -> {
                            Text(
                                text = "LAST GPS: ${"%.4f".format(state.lat)}°N, ${"%.4f".format(state.lon)}°E",
                                style = MaterialTheme.typography.bodySmall,
                                color = SimilipalEmerald,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        is GeolocationState.Granted -> {
                            Text(
                                text = "GPS: ${"%.4f".format(state.lat)}°N, ${"%.4f".format(state.lon)}°E",
                                style = MaterialTheme.typography.bodySmall,
                                color = SimilipalEmerald,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        is GeolocationState.Requesting -> {
                            Text(
                                text = "Acquiring live GPS fix...",
                                style = MaterialTheme.typography.bodySmall,
                                color = OchrePrimary
                            )
                        }
                        else -> {
                            Text(
                                text = strings.fromBhubaneswarReference,
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondary
                            )
                        }
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (isLiveGps) {
                        IconButton(onClick = { locationManager.clear() }, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear", tint = TextMuted, modifier = Modifier.size(16.dp))
                        }
                    }

                    IconButton(onClick = { handleLocationRequest() }, modifier = Modifier.size(36.dp)) {
                        Icon(
                            imageVector = if (isLiveGps) Icons.Default.MyLocation else Icons.Default.LocationSearching,
                            contentDescription = "Request Location",
                            tint = OchrePrimary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(Spacing.xs))

        // 3. Category Filter Chips & Transit Toggle
        val categories = listOf("All", "heritage", "temple", "nature", "wildlife", "beach", "museum")
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
            verticalAlignment = Alignment.CenterVertically
        ) {
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
                    label = if (cat == "All") strings.filterAll else cat.replaceFirstChar { it.uppercase() },
                    isSelected = selectedCategory.equals(cat, ignoreCase = true),
                    onClick = { selectedCategory = cat }
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.xs))

        if (viewMode == MapViewMode.MAP) {
            // Interactive Native Spatial Basemap View
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(DarkSurfaceElevated)
                    .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
            ) {
                InteractiveOdishaMapCanvas(
                    places = filteredPlaces,
                    transitStops = if (showTransitStops) transitStops else emptyList(),
                    currentLat = currentLat,
                    currentLon = currentLon,
                    isGpsGranted = isLiveGps,
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

                // Map Overlay Floating Controls
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

                // Bottom Selected Place Preview Card
                val place = selectedPlace
                if (place != null) {
                    val distKm = if (place.lat != null && place.lon != null) {
                        LocationManager.haversineDistanceKm(currentLat, currentLon, place.lat, place.lon)
                    } else null
                    val rawUrl = place.images.firstOrNull()?.url
                    val qualifiedUrl = ApiConfig.resolveImageUrl(rawUrl)

                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(Spacing.md)
                            .fillMaxWidth()
                    ) {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
                            border = androidx.compose.foundation.BorderStroke(1.dp, OchrePrimary.copy(alpha = 0.5f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(Spacing.md)) {
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
                                                .size(48.dp)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(DarkSurfaceVariant)
                                        ) {
                                            if (!qualifiedUrl.isNullOrBlank()) {
                                                AsyncImage(
                                                    model = qualifiedUrl,
                                                    contentDescription = place.name,
                                                    contentScale = ContentScale.Crop,
                                                    modifier = Modifier.fillMaxSize()
                                                )
                                            } else {
                                                CategoryThemedPlaceholder(
                                                    category = place.category,
                                                    modifier = Modifier.fillMaxSize()
                                                )
                                            }
                                        }
                                        Spacer(modifier = Modifier.width(Spacing.sm))
                                        Column {
                                            Text(
                                                text = place.name,
                                                style = MaterialTheme.typography.titleMedium,
                                                color = TextPrimary,
                                                fontWeight = FontWeight.Bold,
                                                maxLines = 1
                                            )
                                            Text(
                                                text = "${place.category.uppercase()} • ${place.district ?: ""}".trim(),
                                                style = MaterialTheme.typography.labelSmall,
                                                color = TextSecondary
                                            )
                                        }
                                    }

                                    IconButton(
                                        onClick = { selectedPlace = null },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted, modifier = Modifier.size(16.dp))
                                    }
                                }

                                if (distKm != null) {
                                    Spacer(modifier = Modifier.height(Spacing.xs))
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text(
                                            text = "${"%.1f".format(distKm)} km ${strings.straightLineDistance}",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = SunTempleGold,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        TruthBadge(
                                            label = strings.badgeVerified,
                                            backgroundColor = SimilipalEmerald.copy(alpha = 0.2f),
                                            contentColor = SimilipalEmerald
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(Spacing.sm))
                                Button(
                                    onClick = { onPlaceClick(place.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth().height(42.dp)
                                ) {
                                    Text(strings.viewDetailsAction, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // List View Mode
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(Spacing.sm),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredPlaces, key = { it.id }) { place ->
                    val distKm = if (place.lat != null && place.lon != null) {
                        LocationManager.haversineDistanceKm(currentLat, currentLon, place.lat, place.lon)
                    } else null

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = DarkSurfaceElevated,
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onPlaceClick(place.id) }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(Spacing.md)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(DarkSurfaceVariant)
                            ) {
                                val url = ApiConfig.resolveImageUrl(place.images.firstOrNull()?.url)
                                if (!url.isNullOrBlank()) {
                                    AsyncImage(model = url, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                                } else {
                                    CategoryThemedPlaceholder(category = place.category, modifier = Modifier.fillMaxSize())
                                }
                            }
                            Spacer(modifier = Modifier.width(Spacing.sm))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = place.name, style = MaterialTheme.typography.titleMedium, color = TextPrimary, fontWeight = FontWeight.Bold)
                                Text(text = "${place.category.uppercase()} • ${place.district ?: ""}".trim(), style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                            }
                            if (distKm != null) {
                                Text(text = "${"%.1f".format(distKm)} km", style = MaterialTheme.typography.labelSmall, color = SunTempleGold, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

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
    onTransform: (Float, Offset) -> Unit,
    onPlaceSelected: (PlaceDetailDto) -> Unit,
    onStopSelected: (NearbyStopDto) -> Unit,
    onBackgroundTapped: () -> Unit,
    modifier: Modifier = Modifier
) {
    var projectedPlacePins by remember { mutableStateOf<List<Pair<PlaceDetailDto, Offset>>>(emptyList()) }
    var projectedStopPins by remember { mutableStateOf<List<Pair<NearbyStopDto, Offset>>>(emptyList()) }

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTransformGestures { _, pan, gestureZoom, _ ->
                    onTransform(gestureZoom, pan)
                }
            }
            .pointerInput(projectedPlacePins, projectedStopPins) {
                detectTapGestures { tapOffset ->
                    val hitPlace = projectedPlacePins.firstOrNull { (_, offset) ->
                        (offset - tapOffset).getDistance() <= 32.dp.toPx()
                    }?.first

                    if (hitPlace != null) {
                        onPlaceSelected(hitPlace)
                        return@detectTapGestures
                    }

                    val hitStop = projectedStopPins.firstOrNull { (_, offset) ->
                        (offset - tapOffset).getDistance() <= 24.dp.toPx()
                    }?.first

                    if (hitStop != null) {
                        onStopSelected(hitStop)
                        return@detectTapGestures
                    }

                    onBackgroundTapped()
                }
            }
    ) {
        val width = size.width
        val height = size.height

        // Projection math
        fun projectLatLon(lat: Double, lon: Double): Offset {
            val normX = (lon - ODISHA_MIN_LON) / (ODISHA_MAX_LON - ODISHA_MIN_LON)
            val normY = 1.0 - ((lat - ODISHA_MIN_LAT) / (ODISHA_MAX_LAT - ODISHA_MIN_LAT))

            val cx = width / 2f
            val cy = height / 2f

            val rawX = normX.toFloat() * width
            val rawY = normY.toFloat() * height

            val scaledX = cx + (rawX - cx) * zoom + panOffsetX
            val scaledY = cy + (rawY - cy) * zoom + panOffsetY

            return Offset(scaledX, scaledY)
        }

        // Draw background grid lines
        drawGridLines(width, height)

        // Draw User Location Beacon
        val userLocationPos = projectLatLon(currentLat, currentLon)
        drawLocationMarker(userLocationPos, isGpsGranted)

        // Draw Places Pins
        val placePins = mutableListOf<Pair<PlaceDetailDto, Offset>>()
        places.forEach { place ->
            if (place.lat != null && place.lon != null) {
                val pos = projectLatLon(place.lat, place.lon)
                placePins.add(place to pos)
                val isSelected = place.id == selectedPlaceId
                drawPlacePin(pos, place.category, isSelected)
            }
        }
        projectedPlacePins = placePins

        // Draw Transit Stops
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
    val color = if (isGpsGranted) SimilipalEmerald else SunTempleGold
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
