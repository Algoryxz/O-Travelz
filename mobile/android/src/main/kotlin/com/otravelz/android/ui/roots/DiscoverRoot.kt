package com.otravelz.android.ui.roots

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.FilterAlt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.otravelz.android.R
import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.NetworkResult
import com.otravelz.android.domain.model.DiscoverPlace
import com.otravelz.android.domain.model.DiscoverSearchEngine
import com.otravelz.android.domain.model.toDiscoverPlace
import com.otravelz.android.ui.components.PlaceCard
import com.otravelz.android.ui.theme.*
import kotlinx.coroutines.launch

sealed interface DiscoverUiState {
    object Loading : DiscoverUiState
    data class Success(val places: List<DiscoverPlace>) : DiscoverUiState
    data class Error(val message: String) : DiscoverUiState
}

private data class OdiaDistrict(val english: String, val odia: String)

private val ODISHA_30_DISTRICTS = listOf(
    OdiaDistrict("Angul", "ଅନୁଗୋଳ"),
    OdiaDistrict("Balangir", "ବଲାଙ୍ଗୀର"),
    OdiaDistrict("Balasore", "ବାଲେଶ୍ୱର"),
    OdiaDistrict("Bargarh", "ବରଗଡ଼"),
    OdiaDistrict("Bhadrak", "ଭଦ୍ରକ"),
    OdiaDistrict("Boudh", "ବୌଦ୍ଧ"),
    OdiaDistrict("Cuttack", "କଟକ"),
    OdiaDistrict("Deogarh", "ଦେବଗଡ଼"),
    OdiaDistrict("Dhenkanal", "ଢେଙ୍କାନାଳ"),
    OdiaDistrict("Gajapati", "ଗଜପତି"),
    OdiaDistrict("Ganjam", "ଗଞ୍ଜାମ"),
    OdiaDistrict("Jagatsinghpur", "ଜଗତସିଂହପୁର"),
    OdiaDistrict("Jajpur", "ଯାଜପୁର"),
    OdiaDistrict("Jharsuguda", "ଝାରସୁଗୁଡ଼ା"),
    OdiaDistrict("Kalahandi", "କଳାହାଣ୍ଡି"),
    OdiaDistrict("Kandhamal", "କନ୍ଧମାଳ"),
    OdiaDistrict("Kendrapara", "କେନ୍ଦ୍ରାପଡ଼ା"),
    OdiaDistrict("Kendujhar", "କେନ୍ଦୁଝର"),
    OdiaDistrict("Khordha", "ଖୋର୍ଦ୍ଧା"),
    OdiaDistrict("Koraput", "କୋରାପୁଟ"),
    OdiaDistrict("Malkangiri", "ମାଲକାନଗିରି"),
    OdiaDistrict("Mayurbhanj", "ମୟୂରଭଞ୍ଜ"),
    OdiaDistrict("Nabarangpur", "ନବରଙ୍ଗପୁର"),
    OdiaDistrict("Nayagarh", "ନୟାଗଡ଼"),
    OdiaDistrict("Nuapada", "ନୂଆପଡ଼ା"),
    OdiaDistrict("Puri", "ପୁରୀ"),
    OdiaDistrict("Rayagada", "ରାୟଗଡ଼ା"),
    OdiaDistrict("Sambalpur", "ସମ୍ବଲପୁର"),
    OdiaDistrict("Subarnapur", "ସୁବର୍ଣ୍ଣପୁର"),
    OdiaDistrict("Sundargarh", "ସୁନ୍ଦରଗଡ଼")
)

/**
 * Editorial Cultural Atlas Discover root screen for Android (UX Refinement Pass).
 *
 * Major Improvements:
 * - Brand-first top bar featuring authentic O-TRAVELZ illustration logo & Algoryxz attribution.
 * - Progressive Disclosure: 30-district horizontal chip row replaced with a compact [All Odisha ▾] selector.
 * - Category filter row collapsed into an accessible Material 3 modal selector.
 * - Dedicated entry portals for Living Heritage & Public Transit.
 * - Generous breathing room, letting authentic photography lead.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiscoverRoot(
    onPlaceClick: (String) -> Unit,
    onTransitClick: () -> Unit = {},
    onLivingHeritageClick: () -> Unit = {},
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

    var showDistrictSheet by remember { mutableStateOf(false) }
    var showCategorySheet by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val scope = rememberCoroutineScope()

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
                        CircularProgressIndicator(color = TerracottaAccent)
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
                            colors = ButtonDefaults.buttonColors(containerColor = TerracottaAccent)
                        ) {
                            Text(text = stringResource(R.string.action_retry))
                        }
                    }
                }
            }

            is DiscoverUiState.Success -> {
                val filteredPlaces = remember(
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

                val categories = remember(state.places) {
                    state.places.map { it.category }.distinct().sorted()
                }

                Column(modifier = Modifier.fillMaxSize()) {
                    // 1. Editorial Brand Header
                    DiscoverHeader()

                    // 2. Compact Search Input
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = {
                            Text(
                                text = stringResource(R.string.search_places_hint),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Search,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(20.dp)
                            )
                        },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(
                                        Icons.Default.Close,
                                        contentDescription = stringResource(R.string.action_clear_search),
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = Spacing.space4, vertical = Spacing.space1),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = MaterialTheme.colorScheme.surfaceContainer,
                            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceContainer,
                            focusedBorderColor = TerracottaAccent,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant
                        )
                    )

                    // 3. Compact Filter Bar (Near Me + Category Selector + District Selector)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = Spacing.space4, vertical = Spacing.space2),
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space2),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Near Me Contextual Toggle
                        FilterChip(
                            selected = isNearbyEnabled,
                            onClick = { toggleNearby() },
                            label = { Text("📍 " + stringResource(R.string.filter_nearby), style = MaterialTheme.typography.labelMedium) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ForestGreenAccent,
                                selectedLabelColor = Color.White
                            )
                        )

                        // Compact Category Selector Button
                        FilterChip(
                            selected = selectedCategory != null,
                            onClick = { showCategorySheet = true },
                            label = {
                                Text(
                                    text = if (selectedCategory == null) "Category ▾" else "${selectedCategory!!.replace('_', ' ').replaceFirstChar { it.uppercase() }} ▾",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = if (selectedCategory != null) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            leadingIcon = {
                                Icon(
                                    Icons.Default.Category,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp),
                                    tint = if (selectedCategory != null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = TerracottaAccent,
                                selectedLabelColor = Color.White
                            )
                        )

                        // Compact District Selector Button (Replaces 30 horizontal chips!)
                        FilterChip(
                            selected = selectedDistrict != null,
                            onClick = { showDistrictSheet = true },
                            label = {
                                Text(
                                    text = if (selectedDistrict == null) "District ▾" else "$selectedDistrict ▾",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = if (selectedDistrict != null) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            leadingIcon = {
                                Icon(
                                    Icons.Default.Place,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp),
                                    tint = if (selectedDistrict != null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ChilikaBlueAccent,
                                selectedLabelColor = Color.White
                            )
                        )

                        // Quick Clear if active filters
                        if (searchQuery.isNotBlank() || selectedCategory != null || selectedDistrict != null || isNearbyEnabled) {
                            TextButton(
                                onClick = {
                                    searchQuery = ""
                                    selectedCategory = null
                                    selectedDistrict = null
                                    isNearbyEnabled = false
                                    userLat = null
                                    userLon = null
                                    locationNotice = null
                                },
                                contentPadding = PaddingValues(horizontal = 6.dp)
                            ) {
                                Text(
                                    text = "Reset",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TerracottaAccent,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // Location notice banner if denied/unavailable
                    if (locationNotice != null) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.surfaceContainerHigh,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = Spacing.space4, vertical = 2.dp)
                        ) {
                            Text(
                                text = locationNotice!!,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }

                    // 4. Portal Cards Section (Living Heritage & Transit Directory)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = Spacing.space4, vertical = Spacing.space2),
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        // Living Heritage Portal Banner
                        Card(
                            onClick = onLivingHeritageClick,
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceContainer
                            ),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                            modifier = Modifier.weight(1f)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 10.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = TerracottaAccent.copy(alpha = 0.15f),
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text("🎨", style = MaterialTheme.typography.bodySmall)
                                    }
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Living Heritage",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = "GI Craft Traditions",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                                Icon(
                                    Icons.Default.ChevronRight,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }

                        // Transit Portal Banner
                        Card(
                            onClick = onTransitClick,
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceContainer
                            ),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                            modifier = Modifier.weight(1f)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 10.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = ChilikaBlueAccent.copy(alpha = 0.15f),
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text("🚌", style = MaterialTheme.typography.bodySmall)
                                    }
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Public Transit",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = "154 Mo Bus Routes",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                                Icon(
                                    Icons.Default.ChevronRight,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    // 5. Active Result Count
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = Spacing.space4, vertical = 2.dp),
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

                        if (selectedDistrict != null || selectedCategory != null) {
                            val activeDesc = listOfNotNull(
                                selectedCategory?.replace('_', ' ')?.replaceFirstChar { it.uppercase() },
                                selectedDistrict
                            ).joinToString(" in ")
                            Text(
                                text = activeDesc,
                                style = MaterialTheme.typography.labelSmall,
                                color = TerracottaAccent,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    // 6. Destination Feed (Letting authentic photography lead)
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
                                Button(
                                    onClick = {
                                        searchQuery = ""
                                        selectedCategory = null
                                        selectedDistrict = null
                                        isNearbyEnabled = false
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = TerracottaAccent)
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
                                horizontal = Spacing.space4,
                                vertical = Spacing.space2
                            ),
                            verticalArrangement = Arrangement.spacedBy(Spacing.space4),
                            horizontalArrangement = Arrangement.spacedBy(Spacing.space4)
                        ) {
                            items(filteredPlaces, key = { it.id }) { place ->
                                val lat = userLat
                                val lon = userLon
                                val distanceStr = if (isNearbyEnabled && lat != null && lon != null) {
                                    place.formattedDistance(lat, lon)
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

                // Modal Bottom Sheet: Searchable 30 Districts (Bilingual English & Odia)
                if (showDistrictSheet) {
                    DistrictSelectorBottomSheet(
                        districts = ODISHA_30_DISTRICTS,
                        places = state.places,
                        selectedDistrict = selectedDistrict,
                        onSelectDistrict = { dist ->
                            selectedDistrict = dist
                            showDistrictSheet = false
                        },
                        onDismiss = { showDistrictSheet = false }
                    )
                }

                // Modal Bottom Sheet: Canonical Categories
                if (showCategorySheet) {
                    CategorySelectorBottomSheet(
                        categories = categories,
                        places = state.places,
                        selectedCategory = selectedCategory,
                        onSelectCategory = { cat ->
                            selectedCategory = cat
                            showCategorySheet = false
                        },
                        onDismiss = { showCategorySheet = false }
                    )
                }
            }
        }
    }
}

/**
 * Editorial top bar featuring official O-TRAVELZ illustration logo & Algoryxz brand attribution.
 */
@Composable
private fun DiscoverHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.space4, vertical = Spacing.space2),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.space3)
    ) {
        Surface(
            shape = RoundedCornerShape(10.dp),
            border = BorderStroke(1.dp, TerracottaAccent.copy(alpha = 0.3f)),
            modifier = Modifier.size(42.dp),
            color = MaterialTheme.colorScheme.surfaceContainer
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_otravelz_logo),
                contentDescription = "O-TRAVELZ Logo",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        }

        Column(modifier = Modifier.weight(1f)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "O-TRAVELZ",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = ForestGreenAccent.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = "V4",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = ForestGreenAccent,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                    )
                }
            }

            Text(
                text = "Odisha Cultural Atlas • Built by Algoryxz",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

/**
 * Searchable 30-district modal bottom sheet with bilingual English & Odia names and destination counts.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DistrictSelectorBottomSheet(
    districts: List<OdiaDistrict>,
    places: List<DiscoverPlace>,
    selectedDistrict: String?,
    onSelectDistrict: (String?) -> Unit,
    onDismiss: () -> Unit
) {
    var districtSearch by remember { mutableStateOf("") }

    val filtered = remember(districtSearch) {
        if (districtSearch.isBlank()) districts
        else {
            val q = districtSearch.trim().lowercase()
            districts.filter {
                it.english.lowercase().contains(q) || it.odia.contains(q)
            }
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.space4)
                .padding(bottom = Spacing.space6)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Select District (30 Districts)",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close")
                }
            }

            Spacer(modifier = Modifier.height(Spacing.space2))

            OutlinedTextField(
                value = districtSearch,
                onValueChange = { districtSearch = it },
                placeholder = { Text("Search district or ଜିଲ୍ଲା...", style = MaterialTheme.typography.bodySmall) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(18.dp)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(10.dp)
            )

            Spacer(modifier = Modifier.height(Spacing.space3))

            LazyColumn(
                modifier = Modifier.fillMaxHeight(0.6f),
                verticalArrangement = Arrangement.spacedBy(Spacing.space1)
            ) {
                // Option: All Odisha
                item(key = "district_all_odisha") {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (selectedDistrict == null) TerracottaAccent.copy(alpha = 0.15f) else Color.Transparent,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectDistrict(null) }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "All Odisha (ସମଗ୍ର ଓଡ଼ିଶା)",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = if (selectedDistrict == null) FontWeight.Bold else FontWeight.Normal,
                                    color = if (selectedDistrict == null) TerracottaAccent else MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Explore destinations across all 30 districts",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Text(
                                text = "${places.size} places",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                // Individual 30 Districts
                items(filtered, key = { it.english }) { dist ->
                    val isSelected = selectedDistrict.equals(dist.english, ignoreCase = true)
                    val count = places.count { it.normalizedDistrict.equals(dist.english, ignoreCase = true) }

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isSelected) TerracottaAccent.copy(alpha = 0.15f) else Color.Transparent,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectDistrict(dist.english) }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = dist.english,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) TerracottaAccent else MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = dist.odia,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (isSelected) TerracottaAccent else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Text(
                                text = "$count places",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Category selector modal bottom sheet for Discover.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CategorySelectorBottomSheet(
    categories: List<String>,
    places: List<DiscoverPlace>,
    selectedCategory: String?,
    onSelectCategory: (String?) -> Unit,
    onDismiss: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.space4)
                .padding(bottom = Spacing.space6)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Select Category",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close")
                }
            }

            Spacer(modifier = Modifier.height(Spacing.space2))

            LazyColumn(
                modifier = Modifier.fillMaxHeight(0.5f),
                verticalArrangement = Arrangement.spacedBy(Spacing.space1)
            ) {
                item(key = "cat_all") {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (selectedCategory == null) TerracottaAccent.copy(alpha = 0.15f) else Color.Transparent,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectCategory(null) }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "All Categories",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = if (selectedCategory == null) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedCategory == null) TerracottaAccent else MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "${places.size} places",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                items(categories, key = { it }) { cat ->
                    val isSelected = selectedCategory.equals(cat, ignoreCase = true)
                    val count = places.count { it.category.equals(cat, ignoreCase = true) }
                    val displayCat = cat.replace('_', ' ').replaceFirstChar { it.uppercase() }

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isSelected) TerracottaAccent.copy(alpha = 0.15f) else Color.Transparent,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectCategory(cat) }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = displayCat,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) TerracottaAccent else MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "$count places",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}
