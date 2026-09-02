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
import com.otravelz.android.core.i18n.LocalAppStrings
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
    onMapClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val strings = LocalAppStrings.current
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

    val currentLat = locationState.currentLat
    val currentLon = locationState.currentLon

    val categories = listOf(
        null to strings.filterAll,
        "temple" to strings.catTemple,
        "heritage" to strings.catHeritage,
        "nature" to strings.catNature,
        "beach" to strings.catBeach,
        "museum" to strings.catMuseum,
        "food" to strings.catFood,
        "park" to strings.catPark
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
            // 1. Search Bar & District Filter Action
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md, vertical = Spacing.xs),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(Spacing.xs)
            ) {
                OutlinedTextField(
                    value = state.searchQuery,
                    onValueChange = { viewModel.updateSearchQuery(it) },
                    placeholder = {
                        Text(
                            text = strings.searchDestinationsPlaceholder,
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextMuted
                        )
                    },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = OchrePrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    trailingIcon = {
                        if (state.searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.updateSearchQuery("") }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear", tint = TextMuted)
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(14.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = DarkSurfaceElevated,
                        unfocusedContainerColor = DarkSurfaceElevated,
                        focusedBorderColor = OchrePrimary,
                        unfocusedBorderColor = DarkBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    modifier = Modifier.weight(1f).height(52.dp)
                )

                // District Filter Button (48dp min touch target)
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = if (state.selectedDistrict != null) OchrePrimary else DarkSurfaceElevated,
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (state.selectedDistrict != null) OchrePrimary else DarkBorder),
                    modifier = Modifier
                        .size(52.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .clickable { showFilterSheet = true }
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.FilterList,
                            contentDescription = strings.filterByDistrict,
                            tint = if (state.selectedDistrict != null) DarkBackground else OchrePrimary,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }
            }

            // 2. Horizontal Filter Chips (Categories, Nearby, Saved)
            LazyRow(
                contentPadding = PaddingValues(horizontal = Spacing.md, vertical = Spacing.xs),
                horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
                modifier = Modifier.fillMaxWidth()
            ) {
                // Nearby Geolocation Chip
                item {
                    val isNearby = state.isNearbyMode
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isNearby) SunTempleGold else DarkSurfaceElevated,
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isNearby) SunTempleGold else DarkBorder),
                        modifier = Modifier
                            .height(36.dp)
                            .clip(RoundedCornerShape(20.dp))
                            .clickable {
                                if (!locationManager.hasLocationPermission()) {
                                    permissionLauncher.launch(
                                        arrayOf(
                                            Manifest.permission.ACCESS_FINE_LOCATION,
                                            Manifest.permission.ACCESS_COARSE_LOCATION
                                        )
                                    )
                                } else {
                                    locationManager.requestLocation()
                                    viewModel.toggleNearbyMode(!isNearby)
                                }
                            }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.NearMe,
                                contentDescription = null,
                                tint = if (isNearby) DarkBackground else OchrePrimary,
                                modifier = Modifier.size(15.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = strings.filterNearby,
                                style = MaterialTheme.typography.labelMedium,
                                color = if (isNearby) DarkBackground else TextPrimary,
                                fontWeight = if (isNearby) FontWeight.Bold else FontWeight.Medium
                            )
                        }
                    }
                }

                // Category Chips
                items(categories) { (catKey, catLabel) ->
                    val isSelected = state.selectedCategory.equals(catKey, ignoreCase = true) || (catKey == null && state.selectedCategory == null)
                    ContextChip(
                        label = catLabel,
                        isSelected = isSelected,
                        onClick = { viewModel.selectCategory(catKey) }
                    )
                }

                // Saved Only Chip
                item {
                    ContextChip(
                        label = strings.filterSaved,
                        isSelected = state.showSavedOnly,
                        icon = Icons.Default.Bookmark,
                        count = state.savedPlaces.size,
                        onClick = { viewModel.toggleSavedOnly(!state.showSavedOnly) }
                    )
                }
            }

            // 3. Results Header with Count & Active District Chip
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md, vertical = Spacing.xs)
            ) {
                Text(
                    text = "${displayedPlaces.size} destinations",
                    style = MaterialTheme.typography.labelMedium,
                    color = TextSecondary,
                    fontWeight = FontWeight.Medium
                )

                if (state.selectedDistrict != null) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = DarkSurfaceElevated,
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
                        modifier = Modifier.clickable { viewModel.selectDistrict(null) }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "${state.selectedDistrict} ✕",
                                style = MaterialTheme.typography.labelSmall,
                                color = OchreLight,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }

            // 4. Main Place List Feed
            if (state.isLoading && displayedPlaces.isEmpty()) {
                LoadingState(modifier = Modifier.fillMaxSize(), message = strings.loadingText)
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
                            text = if (state.searchQuery.isNotBlank()) "${strings.noDestinationsFound} \"${state.searchQuery}\"" else strings.noDestinationsFound,
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(Spacing.xs))
                        Text(
                            text = strings.noDestinationsSubtitle,
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
                            Text(strings.resetFiltersAction)
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
                        text = strings.filterByDistrict,
                        style = MaterialTheme.typography.titleLarge,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    if (state.selectedDistrict != null) {
                        TextButton(onClick = { viewModel.selectDistrict(null) }) {
                            Text(strings.clearAction, color = OchrePrimary)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(Spacing.sm))

                // All Districts Option
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (state.selectedDistrict == null) DarkSurfaceVariant else Color.Transparent,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            viewModel.selectDistrict(null)
                            showFilterSheet = false
                        }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = Spacing.md, vertical = 12.dp)
                    ) {
                        Icon(
                            imageVector = if (state.selectedDistrict == null) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                            contentDescription = null,
                            tint = if (state.selectedDistrict == null) OchrePrimary else TextMuted,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(Spacing.sm))
                        Text(
                            text = strings.allDistricts,
                            style = MaterialTheme.typography.bodyLarge,
                            color = if (state.selectedDistrict == null) OchreLight else TextPrimary,
                            fontWeight = if (state.selectedDistrict == null) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }

                Divider(color = DarkBorderSubtle, modifier = Modifier.padding(vertical = Spacing.xs))

                // List of Districts
                districts.forEach { district ->
                    val isSelected = state.selectedDistrict.equals(district, ignoreCase = true)
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isSelected) DarkSurfaceVariant else Color.Transparent,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                viewModel.selectDistrict(district)
                                showFilterSheet = false
                            }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = Spacing.md, vertical = 12.dp)
                        ) {
                            Icon(
                                imageVector = if (isSelected) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                                contentDescription = null,
                                tint = if (isSelected) OchrePrimary else TextMuted,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(Spacing.sm))
                            Text(
                                text = district,
                                style = MaterialTheme.typography.bodyLarge,
                                color = if (isSelected) OchreLight else TextPrimary,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
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
    distanceKm: Double?,
    showDistance: Boolean,
    onSaveClick: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val strings = LocalAppStrings.current
    val rawUrl = place.images.firstOrNull()?.url
    val qualifiedUrl = ApiConfig.resolveImageUrl(rawUrl)

    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .clickable { onClick() }
    ) {
        Column {
            // Photo Hero Container (16:9)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
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

                // Gradient scrim
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, DarkSurfaceElevated.copy(alpha = 0.95f)),
                                startY = 90f
                            )
                        )
                )

                // Category & District Badges
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
                        contentDescription = "Save",
                        tint = if (isSaved) SunTempleGold else TextPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            // Place Details & Meta Content
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md, vertical = Spacing.sm)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
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

                    if (place.rating != null) {
                        Spacer(modifier = Modifier.width(Spacing.xs))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = SunTempleGold,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(2.dp))
                            Text(
                                text = "%.1f".format(place.rating),
                                style = MaterialTheme.typography.labelMedium,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                if (!place.description.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = place.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // Footer with Distance / First-Mile info
                if (distanceKm != null && showDistance) {
                    Spacer(modifier = Modifier.height(Spacing.xs))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.DirectionsWalk,
                                contentDescription = null,
                                tint = SunTempleGold,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${"%.1f".format(distanceKm)} km (${strings.straightLineDistance})",
                                style = MaterialTheme.typography.labelSmall,
                                color = SunTempleGold,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        val distanceMeters = distanceKm * 1000.0
                        val recLabel = when (FirstMileEstimator.getModeCategory(distanceMeters)) {
                            "WALK" -> "WALK"
                            "WALK_AUTO" -> "WALK / AUTO"
                            else -> "AUTO / CAB"
                        }
                        TruthBadge(
                            label = recLabel,
                            backgroundColor = DarkSurfaceVariant,
                            contentColor = OchreLight
                        )
                    }
                }
            }
        }
    }
}
