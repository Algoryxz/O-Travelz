package com.otravelz.android.feature.discover

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.material.icons.automirrored.filled.DirectionsWalk
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.otravelz.android.core.design.*
import com.otravelz.android.core.location.FirstMileEstimator
import com.otravelz.android.core.location.GeolocationState
import com.otravelz.android.core.location.LocationManager
import com.otravelz.android.core.network.ApiConfig
import com.otravelz.android.data.model.PlaceDetailDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiscoverScreen(
    viewModel: DiscoverViewModel,
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val locationManager = remember { LocationManager(context) }
    val locationState by locationManager.state.collectAsState()

    val state by viewModel.uiState.collectAsState()
    var showFilterSheet by remember { mutableStateOf(false) }

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

    val currentLat = when (val locState = locationState) {
        is GeolocationState.Granted -> locState.lat
        is GeolocationState.ReferenceOrigin -> locState.lat
        else -> LocationManager.DEFAULT_FALLBACK_LAT
    }
    val currentLon = when (val locState = locationState) {
        is GeolocationState.Granted -> locState.lon
        is GeolocationState.ReferenceOrigin -> locState.lon
        else -> LocationManager.DEFAULT_FALLBACK_LON
    }

    val categories = listOf(
        null to "All",
        "temple" to "Temples",
        "heritage" to "Heritage",
        "nature" to "Nature & Hills",
        "beach" to "Beaches",
        "waterfall" to "Waterfalls",
        "food" to "Odia Cuisine"
    )

    val districts = listOf(
        "Khordha",
        "Puri",
        "Cuttack",
        "Sambalpur",
        "Mayurbhanj",
        "Koraput",
        "Sundargarh",
        "Ganjam",
        "Kalahandi",
        "Balasore"
    )

    val rawPlaces = if (state.showSavedOnly) state.savedPlaces else state.places
    val filteredPlaces = rawPlaces.filter { place ->
        val matchesQuery = state.searchQuery.isBlank() ||
            place.name.contains(state.searchQuery, ignoreCase = true) ||
            (place.district?.contains(state.searchQuery, ignoreCase = true) == true) ||
            place.category.contains(state.searchQuery, ignoreCase = true)
        val matchesCat = state.selectedCategory == null || place.category.equals(state.selectedCategory, ignoreCase = true)
        val matchesDist = state.selectedDistrict == null || place.district?.equals(state.selectedDistrict, ignoreCase = true) == true
        matchesQuery && matchesCat && matchesDist
    }

    val displayedPlaces = remember(filteredPlaces, state.isNearbyMode, currentLat, currentLon) {
        if (state.isNearbyMode) {
            filteredPlaces.sortedBy { place ->
                if (place.lat != null && place.lon != null) {
                    LocationManager.haversineDistanceKm(currentLat, currentLon, place.lat, place.lon)
                } else {
                    Double.MAX_VALUE
                }
            }
        } else {
            filteredPlaces
        }
    }

    Scaffold(
        containerColor = DarkBackground,
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // 1. Persistent Search Bar & Data Provenance Badge
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md, vertical = Spacing.xs)
            ) {
                OutlinedTextField(
                    value = state.searchQuery,
                    onValueChange = { viewModel.updateSearchQuery(it) },
                    placeholder = {
                        Text(
                            text = "Search temples, waterfalls, heritage...",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextMuted
                        )
                    },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = OchrePrimary
                        )
                    },
                    trailingIcon = {
                        if (state.searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.updateSearchQuery("") }) {
                                Icon(
                                    imageVector = Icons.Default.Clear,
                                    contentDescription = "Clear Search",
                                    tint = TextMuted
                                )
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = DarkSurfaceElevated,
                        unfocusedContainerColor = DarkSurfaceElevated,
                        focusedBorderColor = OchrePrimary,
                        unfocusedBorderColor = DarkBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // 2. Primary Category Strip & Nearby Toggle Chip
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = Spacing.md, vertical = Spacing.xs),
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Nearby Proximity Mode Chip
                item {
                    FilterChip(
                        selected = state.isNearbyMode,
                        onClick = {
                            val targetState = !state.isNearbyMode
                            viewModel.toggleNearbyMode(targetState)
                            if (targetState && !locationManager.hasLocationPermission()) {
                                permissionLauncher.launch(
                                    arrayOf(
                                        Manifest.permission.ACCESS_FINE_LOCATION,
                                        Manifest.permission.ACCESS_COARSE_LOCATION
                                    )
                                )
                            } else if (targetState) {
                                locationManager.requestLocation()
                            }
                        },
                        label = { Text("Nearby Mode", style = MaterialTheme.typography.labelSmall) },
                        leadingIcon = {
                            Icon(
                                imageVector = if (state.isNearbyMode) Icons.Default.NearMe else Icons.Default.NearMeDisabled,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = if (state.isNearbyMode) SunTempleGold else TextMuted
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = SunTempleGold.copy(alpha = 0.2f),
                            selectedLabelColor = SunTempleGold,
                            containerColor = DarkSurfaceElevated,
                            labelColor = TextMuted
                        )
                    )
                }

                items(categories) { (catKey, catLabel) ->
                    val isSelected = if (state.showSavedOnly) {
                        catKey == "saved"
                    } else {
                        (state.selectedCategory == null && catKey == null) ||
                            (state.selectedCategory.equals(catKey, ignoreCase = true))
                    }
                    ContextChip(
                        label = catLabel,
                        isSelected = isSelected,
                        onClick = {
                            if (catKey == "saved") {
                                viewModel.toggleSavedOnly(true)
                            } else {
                                viewModel.toggleSavedOnly(false)
                                viewModel.selectCategory(catKey)
                            }
                        }
                    )
                }
            }

            // Nearby Mode Truth Banner
            if (state.isNearbyMode) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.md, vertical = 2.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(DarkSurfaceVariant)
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = null,
                                tint = OchreLight,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (locationState is GeolocationState.Granted) {
                                    "Sorted by straight-line distance from your verified location"
                                } else {
                                    "Sorted by straight-line distance from Bhubaneswar reference point"
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondary,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }

            // 3. Results Summary, Provenance Badge & Filter Sheet Action
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md, vertical = Spacing.xs)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "${displayedPlaces.size} verified destinations",
                        style = MaterialTheme.typography.labelMedium,
                        color = TextSecondary,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    // Provenance badge
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = state.dataProvenance.getBadgeColor().copy(alpha = 0.2f)
                    ) {
                        Text(
                            text = state.dataProvenance.badgeText,
                            style = MaterialTheme.typography.labelSmall,
                            color = state.dataProvenance.getBadgeColor(),
                            fontWeight = FontWeight.Bold,
                            fontSize = 9.sp,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                        )
                    }
                }

                // District Filter Pill Button
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (state.selectedDistrict != null) OchrePrimary.copy(alpha = 0.2f) else DarkSurfaceElevated,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (state.selectedDistrict != null) OchrePrimary else DarkBorderSubtle
                    ),
                    modifier = Modifier.clickable { showFilterSheet = true }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.FilterList,
                            contentDescription = "Filter",
                            tint = if (state.selectedDistrict != null) OchrePrimary else TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = state.selectedDistrict ?: "District",
                            style = MaterialTheme.typography.labelSmall,
                            color = if (state.selectedDistrict != null) OchrePrimary else TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // 4. Destination Feed or Semantic State
            if (state.isLoading && displayedPlaces.isEmpty()) {
                LoadingState(modifier = Modifier.fillMaxSize(), message = "Loading verified destinations...")
            } else if (displayedPlaces.isEmpty()) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(Spacing.lg)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.Landscape,
                            contentDescription = null,
                            tint = TextMuted,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(Spacing.sm))
                        Text(
                            text = if (state.searchQuery.isNotBlank()) "No destinations match \"${state.searchQuery}\"" else "No destinations match these filters",
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(Spacing.xs))
                        Text(
                            text = "Try clearing search or changing district filter.",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(Spacing.md))
                        Button(
                            onClick = {
                                viewModel.updateSearchQuery("")
                                viewModel.selectCategory(null)
                                viewModel.selectDistrict(null)
                                viewModel.toggleSavedOnly(false)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = DarkSurfaceElevated, contentColor = SunTempleGold),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Reset All Filters")
                        }
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = Spacing.md, vertical = Spacing.sm),
                    verticalArrangement = Arrangement.spacedBy(Spacing.md),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(displayedPlaces, key = { it.id }) { place ->
                        val isSaved = state.savedPlaceIds.contains(place.id)
                        val distKm = if (place.lat != null && place.lon != null) {
                            LocationManager.haversineDistanceKm(currentLat, currentLon, place.lat, place.lon)
                        } else null

                        DiscoverPlaceCard(
                            place = place,
                            isSaved = isSaved,
                            distanceKm = distKm,
                            showDistance = state.isNearbyMode,
                            onSaveClick = { viewModel.toggleBookmark(place) },
                            onClick = { onPlaceClick(place.id) }
                        )
                    }
                }
            }
        }
    }

    // Bottom Sheet for District Filtering
    if (showFilterSheet) {
        ModalBottomSheet(
            onDismissRequest = { showFilterSheet = false },
            containerColor = DarkSurfaceElevated,
            contentColor = TextPrimary,
            dragHandle = { BottomSheetDefaults.DragHandle(color = TextMuted) }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.lg, vertical = Spacing.sm)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Filter by District",
                        style = MaterialTheme.typography.titleLarge,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    if (state.selectedDistrict != null) {
                        TextButton(onClick = { viewModel.selectDistrict(null) }) {
                            Text("Clear", color = OchrePrimary)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(Spacing.sm))

                // District Chips Grid
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(vertical = Spacing.xs),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(districts) { dist ->
                        val isSelected = state.selectedDistrict.equals(dist, ignoreCase = true)
                        FilterChip(
                            selected = isSelected,
                            onClick = {
                                viewModel.selectDistrict(if (isSelected) null else dist)
                                showFilterSheet = false
                            },
                            label = { Text(dist) },
                            leadingIcon = if (isSelected) {
                                { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                            } else null,
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = OchrePrimary,
                                selectedLabelColor = DarkBackground,
                                containerColor = DarkSurface,
                                labelColor = TextPrimary
                            )
                        )
                    }
                }
                Spacer(modifier = Modifier.height(Spacing.xl))
            }
        }
    }
}

@Composable
fun DiscoverPlaceCard(
    place: PlaceDetailDto,
    isSaved: Boolean,
    distanceKm: Double? = null,
    showDistance: Boolean = false,
    onSaveClick: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val imageUrl = place.images.firstOrNull()?.url
    val qualifiedUrl = ApiConfig.resolveImageUrl(imageUrl)
    val distanceMeters = distanceKm?.times(1000)
    val firstMile = distanceMeters?.let { FirstMileEstimator.getRecommendation(it) }

    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .clickable { onClick() }
    ) {
        Column {
            // Photo Hero Container (16:9)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .background(DarkSurfaceVariant)
            ) {
                if (qualifiedUrl != null) {
                    AsyncImage(
                        model = qualifiedUrl,
                        contentDescription = place.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        Icon(
                            imageVector = Icons.Default.Landscape,
                            contentDescription = null,
                            tint = TextMuted,
                            modifier = Modifier.size(40.dp)
                        )
                    }
                }

                // Gradient scrim
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, DarkSurfaceElevated.copy(alpha = 0.95f)),
                                startY = 100f
                            )
                        )
                )

                // Category & District Badges (Bottom Left over image)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(Spacing.sm)
                ) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = OchrePrimary.copy(alpha = 0.9f)
                    ) {
                        Text(
                            text = place.category.uppercase(),
                            style = MaterialTheme.typography.labelSmall,
                            color = DarkBackground,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    if (!place.district.isNullOrBlank()) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = DarkBackground.copy(alpha = 0.8f)
                        ) {
                            Text(
                                text = place.district ?: "",
                                style = MaterialTheme.typography.labelSmall,
                                color = TextPrimary,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                // Bookmark Icon Button (Top Right)
                IconButton(
                    onClick = onSaveClick,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .size(36.dp)
                        .background(DarkBackground.copy(alpha = 0.7f), CircleShape)
                ) {
                    Icon(
                        imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = if (isSaved) "Saved" else "Save",
                        tint = if (isSaved) SunTempleGold else TextPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            // Card Body (Title & Cultural Info & Distance / First-Mile)
            Column(modifier = Modifier.padding(horizontal = Spacing.md, vertical = Spacing.sm)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = place.name,
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    if (distanceKm != null && showDistance) {
                        Text(
                            text = "%.1f km · straight-line".format(distanceKm),
                            style = MaterialTheme.typography.labelSmall,
                            color = OchreLight,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                if (!place.description.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = place.description ?: "",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                if (firstMile != null && showDistance) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.DirectionsWalk,
                            contentDescription = null,
                            tint = TealLight,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "First-Mile: $firstMile",
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
