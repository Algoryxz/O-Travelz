package com.otravelz.android.ui.roots

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.otravelz.android.R
import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.NetworkResult
import com.otravelz.android.domain.model.DiscoverPlace
import com.otravelz.android.domain.model.DiscoverSearchEngine
import com.otravelz.android.domain.model.toDiscoverPlace
import com.otravelz.android.ui.components.PlaceCard
import com.otravelz.android.ui.theme.Spacing
import kotlinx.coroutines.launch

sealed interface DiscoverUiState {
    object Loading : DiscoverUiState
    data class Success(val places: List<DiscoverPlace>) : DiscoverUiState
    data class Error(val message: String) : DiscoverUiState
}

/**
 * Editorial Cultural Atlas Discover root screen for Android (Wave M9).
 * Implements:
 * - Deterministic tiered search ranking (Exact > Prefix > Odia > District/Category > Substring)
 * - Multi-dimensional filtering (Search + Category + District + Nearby)
 * - Contextual location permission boundary (zero launch prompts)
 * - Sourced Haversine distance proximity display (e.g. "2.4 km away")
 * - Actionable zero-result recovery with individual filter resets
 * - Clean 60fps in-memory catalog exploration (0ms latency, zero extra network roundtrips)
 */
@Composable
fun DiscoverRoot(
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var uiState by remember { mutableStateOf<DiscoverUiState>(DiscoverUiState.Loading) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf<String?>(null) }
    var selectedDistrict by remember { mutableStateOf<String?>(null) }
    var isNearbyEnabled by remember { mutableStateOf(false) }
    var userLat by remember { mutableStateOf<Double?>(null) }
    var userLon by remember { mutableStateOf<Double?>(null) }
    var locationNotice by remember { mutableStateOf<String?>(null) }

    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // Contextual Location Permission Launcher
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true

        if (fineGranted || coarseGranted) {
            val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
            val loc = try {
                locationManager?.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                    ?: locationManager?.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                    ?: locationManager?.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER)
            } catch (e: SecurityException) {
                null
            }

            if (loc != null) {
                userLat = loc.latitude
                userLon = loc.longitude
                isNearbyEnabled = true
                locationNotice = null
            } else {
                locationNotice = "Location currently unavailable. Exploring statewide atlas."
                isNearbyEnabled = false
            }
        } else {
            locationNotice = "Location permission denied. Exploring statewide atlas."
            isNearbyEnabled = false
        }
    }

    fun toggleNearby() {
        if (isNearbyEnabled) {
            isNearbyEnabled = false
            userLat = null
            userLon = null
            locationNotice = null
        } else {
            val fineCheck = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
            val coarseCheck = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)

            if (fineCheck == PackageManager.PERMISSION_GRANTED || coarseCheck == PackageManager.PERMISSION_GRANTED) {
                val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
                val loc = try {
                    locationManager?.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                        ?: locationManager?.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                        ?: locationManager?.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER)
                } catch (e: SecurityException) {
                    null
                }

                if (loc != null) {
                    userLat = loc.latitude
                    userLon = loc.longitude
                    isNearbyEnabled = true
                    locationNotice = null
                } else {
                    locationNotice = "Location currently unavailable. Exploring statewide atlas."
                    isNearbyEnabled = false
                }
            } else {
                locationPermissionLauncher.launch(
                    arrayOf(
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    )
                )
            }
        }
    }

    fun loadPlaces() {
        uiState = DiscoverUiState.Loading
        scope.launch {
            val api = ApiClient.createService()
            when (val result = ApiClient.safeApiCall { api.getPlaces(limit = 300) }) {
                is NetworkResult.Success -> {
                    val eligible = result.data
                        .map { it.toDiscoverPlace() }
                        .filter { it.isEligibleLeisure }
                    uiState = DiscoverUiState.Success(eligible)
                }
                is NetworkResult.Failure -> {
                    uiState = DiscoverUiState.Error(
                        result.error.message ?: "Failed to retrieve cultural atlas destinations."
                    )
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        loadPlaces()
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface)
    ) {
        when (val state = uiState) {
            is DiscoverUiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(Spacing.space4))
                        Text(
                            text = stringResource(R.string.state_loading),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            is DiscoverUiState.Error -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(Spacing.space7),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = stringResource(R.string.state_error_title),
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(Spacing.space3))
                        Text(
                            text = state.message,
                            style = MaterialTheme.typography.bodyMedium,
                            textAlign = TextAlign.Center,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(Spacing.space5))
                        Button(
                            onClick = { loadPlaces() },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Text(text = stringResource(R.string.action_retry))
                        }
                    }
                }
            }

            is DiscoverUiState.Success -> {
                val filteredAndRanked = remember(
                    state.places,
                    searchQuery,
                    selectedCategory,
                    selectedDistrict,
                    isNearbyEnabled,
                    userLat,
                    userLon
                ) {
                    DiscoverSearchEngine.filterAndRank(
                        catalog = state.places,
                        query = searchQuery,
                        category = selectedCategory,
                        district = selectedDistrict,
                        isNearbyEnabled = isNearbyEnabled,
                        userLat = userLat,
                        userLon = userLon
                    )
                }

                DiscoverContent(
                    allPlaces = state.places,
                    filteredPlaces = filteredAndRanked,
                    searchQuery = searchQuery,
                    onSearchQueryChange = { searchQuery = it },
                    selectedCategory = selectedCategory,
                    onCategorySelected = { cat ->
                        selectedCategory = if (selectedCategory == cat) null else cat
                    },
                    selectedDistrict = selectedDistrict,
                    onDistrictSelected = { dist ->
                        selectedDistrict = if (selectedDistrict == dist) null else dist
                    },
                    isNearbyEnabled = isNearbyEnabled,
                    onToggleNearby = { toggleNearby() },
                    userLat = userLat,
                    userLon = userLon,
                    locationNotice = locationNotice,
                    onClearSearch = { searchQuery = "" },
                    onClearCategory = { selectedCategory = null },
                    onClearDistrict = { selectedDistrict = null },
                    onClearAllFilters = {
                        searchQuery = ""
                        selectedCategory = null
                        selectedDistrict = null
                        isNearbyEnabled = false
                        userLat = null
                        userLon = null
                        locationNotice = null
                    },
                    onPlaceClick = onPlaceClick
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun DiscoverContent(
    allPlaces: List<DiscoverPlace>,
    filteredPlaces: List<DiscoverPlace>,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    selectedCategory: String?,
    onCategorySelected: (String) -> Unit,
    selectedDistrict: String?,
    onDistrictSelected: (String) -> Unit,
    isNearbyEnabled: Boolean,
    onToggleNearby: () -> Unit,
    userLat: Double?,
    userLon: Double?,
    locationNotice: String?,
    onClearSearch: () -> Unit,
    onClearCategory: () -> Unit,
    onClearDistrict: () -> Unit,
    onClearAllFilters: () -> Unit,
    onPlaceClick: (String) -> Unit
) {
    val categories = remember(allPlaces) {
        allPlaces.map { it.category }.distinct().sorted()
    }

    val districts = remember(allPlaces) {
        allPlaces.mapNotNull { it.normalizedDistrict }.distinct().sorted()
    }

    val hasActiveFilters = searchQuery.isNotBlank() || selectedCategory != null || selectedDistrict != null || isNearbyEnabled

    Column(modifier = Modifier.fillMaxSize()) {
        // Search Bar with clear button
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchQueryChange,
            placeholder = {
                Text(
                    text = stringResource(R.string.search_places_hint),
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = onClearSearch) {
                        Text(
                            text = "✕",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.space5, vertical = Spacing.space3),
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = MaterialTheme.colorScheme.surfaceContainer,
                unfocusedContainerColor = MaterialTheme.colorScheme.surfaceContainer,
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant
            )
        )

        // Row 1: Near Me + Category Filter Chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = Spacing.space5, vertical = Spacing.space1),
            horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
        ) {
            // Near Me Toggle Chip
            FilterChip(
                selected = isNearbyEnabled,
                onClick = onToggleNearby,
                label = {
                    Text(text = "📍 " + stringResource(R.string.filter_nearby))
                },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.tertiary,
                    selectedLabelColor = MaterialTheme.colorScheme.onTertiary
                )
            )

            // All Categories Chip
            FilterChip(
                selected = selectedCategory == null,
                onClick = onClearCategory,
                label = { Text(text = stringResource(R.string.filter_all_categories)) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primary,
                    selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                )
            )

            categories.forEach { cat ->
                val isSelected = selectedCategory.equals(cat, ignoreCase = true)
                FilterChip(
                    selected = isSelected,
                    onClick = { onCategorySelected(cat) },
                    label = {
                        Text(
                            text = cat.replace('_', ' ').replaceFirstChar { it.uppercase() }
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.primary,
                        selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                    )
                )
            }
        }

        // Row 2: District Filter Chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = Spacing.space5, vertical = Spacing.space1),
            horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
        ) {
            FilterChip(
                selected = selectedDistrict == null,
                onClick = onClearDistrict,
                label = { Text(text = stringResource(R.string.filter_all_districts)) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primary,
                    selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                )
            )

            districts.forEach { dist ->
                val isSelected = selectedDistrict.equals(dist, ignoreCase = true)
                FilterChip(
                    selected = isSelected,
                    onClick = { onDistrictSelected(dist) },
                    label = { Text(text = dist) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.primary,
                        selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                    )
                )
            }
        }

        // Location Notice if denied or unavailable
        if (locationNotice != null) {
            Text(
                text = locationNotice,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.secondary,
                modifier = Modifier.padding(horizontal = Spacing.space5, vertical = Spacing.space1)
            )
        }

        // Active Filter & Count Bar
        if (hasActiveFilters) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.space5, vertical = Spacing.space1),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isNearbyEnabled) {
                        stringResource(R.string.places_near_you, filteredPlaces.size)
                    } else {
                        stringResource(R.string.places_found_count, filteredPlaces.size)
                    },
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )

                TextButton(
                    onClick = onClearAllFilters,
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text(
                        text = stringResource(R.string.action_clear_filters),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        // Empty state vs Grid
        if (filteredPlaces.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(Spacing.space7),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = stringResource(R.string.state_empty_title),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(Spacing.space2))
                    Text(
                        text = stringResource(R.string.state_empty_desc),
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(Spacing.space4))

                    // Contextual Recovery Chips
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space2),
                        verticalArrangement = Arrangement.spacedBy(Spacing.space2),
                        modifier = Modifier.padding(horizontal = Spacing.space4)
                    ) {
                        if (searchQuery.isNotBlank()) {
                            Button(
                                onClick = onClearSearch,
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
                            ) {
                                Text(
                                    text = stringResource(R.string.action_clear_search),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }

                        if (selectedDistrict != null) {
                            Button(
                                onClick = onClearDistrict,
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
                            ) {
                                Text(
                                    text = stringResource(R.string.action_clear_district),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }

                        if (selectedCategory != null) {
                            Button(
                                onClick = onClearCategory,
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
                            ) {
                                Text(
                                    text = stringResource(R.string.action_clear_category),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }

                        if (isNearbyEnabled) {
                            Button(
                                onClick = onToggleNearby,
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
                            ) {
                                Text(
                                    text = stringResource(R.string.action_disable_nearby),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(Spacing.space3))
                    Button(
                        onClick = onClearAllFilters,
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Text(text = stringResource(R.string.action_clear_filters))
                    }
                }
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 320.dp),
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(
                    horizontal = Spacing.space5,
                    vertical = Spacing.space3
                ),
                verticalArrangement = Arrangement.spacedBy(Spacing.space4),
                horizontalArrangement = Arrangement.spacedBy(Spacing.space4)
            ) {
                items(filteredPlaces, key = { it.id }) { place ->
                    val distanceStr = if (isNearbyEnabled && userLat != null && userLon != null) {
                        place.formattedDistance(userLat, userLon)
                    } else {
                        null
                    }

                    PlaceCard(
                        place = place,
                        onClick = { onPlaceClick(place.id) },
                        distanceString = distanceStr
                    )
                }
            }
        }
    }
}
