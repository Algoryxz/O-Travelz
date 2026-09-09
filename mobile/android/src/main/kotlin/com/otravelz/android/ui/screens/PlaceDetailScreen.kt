package com.otravelz.android.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.lifecycle.viewmodel.compose.viewModel
import com.otravelz.android.data.repository.PersistenceRepository
import com.otravelz.android.ui.components.EssentialsSheet
import com.otravelz.android.ui.screens.EssentialsViewModel
import com.otravelz.android.ui.theme.TerracottaAccent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.otravelz.android.R
import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.NetworkResult
import com.otravelz.android.data.network.adapter.WeatherState
import com.otravelz.android.data.network.adapter.toDomain
import com.otravelz.android.domain.model.PlaceDetail
import com.otravelz.android.domain.model.PlacePhoto
import com.otravelz.android.domain.model.toPlaceDetail
import com.otravelz.android.ui.theme.Spacing
import kotlinx.coroutines.launch

sealed interface PlaceDetailUiState {
    object Loading : PlaceDetailUiState
    data class Success(val place: PlaceDetail, val weather: WeatherState) : PlaceDetailUiState
    data class Error(val message: String) : PlaceDetailUiState
}

/**
 * Production Place Detail screen.
 * Follows ANDROID_A_ATLAS_MATERIAL specifications:
 * - Immediate destination name visibility (never buried)
 * - Verified photography hero (no fake carousels if only 1 photo)
 * - Grounded cultural narrative
 * - Sourced practical facts (null fields cleanly omitted)
 * - Truthful live weather (or calm unavailable card)
 * - Strict capability gating: zero fake video, zero fake 3D
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlaceDetailScreen(
    placeId: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var uiState by remember { mutableStateOf<PlaceDetailUiState>(PlaceDetailUiState.Loading) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val persistenceRepo = remember { PersistenceRepository.getInstance(context) }
    val isSaved by persistenceRepo.isPlaceSaved(placeId).collectAsState(initial = false)

    fun loadData() {
        uiState = PlaceDetailUiState.Loading
        scope.launch {
            val api = ApiClient.createService()
            when (val placeResult = ApiClient.safeApiCall { api.getPlaceDetail(placeId) }) {
                is NetworkResult.Success -> {
                    val placeDetail = placeResult.data.toPlaceDetail()

                    var weatherState: WeatherState = WeatherState.Unavailable("No coordinates for weather")
                    if (placeDetail.hasCoordinates) {
                        val weatherResult = ApiClient.safeApiCall {
                            api.getWeatherCurrent(lat = placeDetail.lat!!, lon = placeDetail.lon!!)
                        }
                        if (weatherResult is NetworkResult.Success) {
                            weatherState = weatherResult.data.toDomain()
                        }
                    }

                    uiState = PlaceDetailUiState.Success(place = placeDetail, weather = weatherState)
                }
                is NetworkResult.Failure -> {
                    uiState = PlaceDetailUiState.Error(placeResult.error.message ?: "Failed to load place details")
                }
            }
        }
    }

    LaunchedEffect(placeId) {
        loadData()
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = (uiState as? PlaceDetailUiState.Success)?.place?.name ?: "",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                },
                navigationIcon = {
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Text(
                            text = "←",
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                },
                actions = {
                    val successState = uiState as? PlaceDetailUiState.Success
                    if (successState != null) {
                        val place = successState.place
                        IconButton(
                            onClick = {
                                scope.launch {
                                    if (isSaved) {
                                        persistenceRepo.unsavePlace(place.id)
                                    } else {
                                        persistenceRepo.savePlace(
                                            canonicalPlaceId = place.id,
                                            placeName = place.name,
                                            category = place.category,
                                            district = place.district,
                                            imageUrl = place.primaryPhoto?.resolvedHeroUrl,
                                            rating = null
                                        )
                                    }
                                }
                            },
                            modifier = Modifier.size(48.dp)
                        ) {
                            Icon(
                                imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                contentDescription = if (isSaved) stringResource(R.string.action_unsave_place) else stringResource(R.string.action_save_place),
                                tint = if (isSaved) TerracottaAccent else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        IconButton(
                            onClick = {
                                val shareText = "${place.name}${place.district?.let { ", $it" } ?: ""} — Odisha Cultural Atlas"
                                val sendIntent = Intent().apply {
                                    action = Intent.ACTION_SEND
                                    putExtra(Intent.EXTRA_TEXT, shareText)
                                    type = "text/plain"
                                }
                                val shareIntent = Intent.createChooser(sendIntent, null)
                                context.startActivity(shareIntent)
                            },
                            modifier = Modifier.size(48.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = context.getString(R.string.action_share),
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.surface)
        ) {
            when (val state = uiState) {
                is PlaceDetailUiState.Loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                    }
                }
                is PlaceDetailUiState.Error -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(Spacing.space7)
                        ) {
                            Text(
                                text = stringResource(R.string.state_error_title),
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold
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
                                onClick = { loadData() },
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                            ) {
                                Text(text = stringResource(R.string.action_retry))
                            }
                        }
                    }
                }
                is PlaceDetailUiState.Success -> {
                    PlaceDetailContent(
                        place = state.place,
                        weather = state.weather
                    )
                }
            }
        }
    }
}

@Composable
private fun PlaceDetailContent(
    place: PlaceDetail,
    weather: WeatherState
) {
    val scrollState = rememberScrollState()
    val context = LocalContext.current
    val essentialsViewModel: EssentialsViewModel = viewModel()
    val essentialsState by essentialsViewModel.uiState.collectAsState()
    var showEssentialsSheet by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(bottom = Spacing.space10),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .widthIn(max = 680.dp)
                .padding(horizontal = Spacing.space6)
        ) {
            Spacer(modifier = Modifier.height(Spacing.space4))

            // 1. Immediate Destination Identity (Always at top, never buried)
            Text(
                text = place.category.replace('_', ' ').uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(Spacing.space2))

            Text(
                text = place.name,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.semantics { heading() }
            )

            if (!place.odiaName.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(Spacing.space1))
                Text(
                    text = place.odiaName,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Medium
                )
            }

            val locationTag = listOfNotNull(place.district, place.region).joinToString(" • ")
            if (locationTag.isNotBlank()) {
                Spacer(modifier = Modifier.height(Spacing.space2))
                Text(
                    text = locationTag,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(Spacing.space5))

            // 2. Verified Hero Media or Cultural Typography Card
            val primary = place.primaryPhoto
            if (primary != null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Column {
                        AsyncImage(
                            model = primary.resolvedHeroUrl,
                            contentDescription = primary.altText ?: place.name,
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(16f / 10f),
                            contentScale = ContentScale.Crop
                        )
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = Spacing.space4, vertical = Spacing.space3),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            val attributionText = listOfNotNull(primary.sourceName, primary.attribution).joinToString(" - ")
                            Text(
                                text = if (attributionText.isNotBlank()) attributionText else stringResource(R.string.badge_verified),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.weight(1f, fill = false)
                            )
                            Spacer(modifier = Modifier.width(Spacing.space2))
                            Text(
                                text = stringResource(R.string.badge_verified),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            } else {
                // Truthful cultural sandstone card when photographic verification is pending
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(Spacing.space6),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        if (!place.odiaName.isNullOrBlank()) {
                            Text(
                                text = place.odiaName,
                                style = MaterialTheme.typography.headlineSmall,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(Spacing.space3))
                        }
                        Text(
                            text = stringResource(R.string.badge_photo_pending),
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(Spacing.space2))
                        Text(
                            text = stringResource(R.string.photo_pending_desc),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(Spacing.space5))

            // 3. Location Action: External Map Navigation Handoff & Nearby Civic Help
            if (place.hasCoordinates) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                ) {
                    OutlinedButton(
                        onClick = {
                            val lat = place.lat!!
                            val lon = place.lon!!
                            val uri = Uri.parse("geo:$lat,$lon?q=$lat,$lon(${Uri.encode(place.name)})")
                            val mapIntent = Intent(Intent.ACTION_VIEW, uri)
                            try {
                                context.startActivity(mapIntent)
                            } catch (e: Exception) {
                                val webUri = Uri.parse("https://www.google.com/maps/search/?api=1&query=$lat,$lon")
                                context.startActivity(Intent(Intent.ACTION_VIEW, webUri))
                            }
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                    ) {
                        Text(
                            text = "📍 " + stringResource(R.string.action_open_in_maps),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 1
                        )
                    }

                    OutlinedButton(
                        onClick = {
                            place.lat?.let { lat ->
                                place.lon?.let { lon ->
                                    essentialsViewModel.loadServicesForCoordinates(lat, lon)
                                    showEssentialsSheet = true
                                }
                            }
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                    ) {
                        Text(
                            text = "🛡️ " + stringResource(R.string.place_action_nearby_essentials),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 1
                        )
                    }
                }
                Spacer(modifier = Modifier.height(Spacing.space6))
            }

            // 4. Cultural Significance / Narrative
            if (!place.description.isNullOrBlank()) {
                Text(
                    text = stringResource(R.string.section_about),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.semantics { heading() }
                )
                Spacer(modifier = Modifier.height(Spacing.space3))
                Text(
                    text = place.description,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = MaterialTheme.typography.bodyLarge.lineHeight
                )
                Spacer(modifier = Modifier.height(Spacing.space6))
            }

            // 5. Live Local Weather (Phase 21-24)
            Text(
                text = stringResource(R.string.section_weather),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.semantics { heading() }
            )
            Spacer(modifier = Modifier.height(Spacing.space3))
            when (weather) {
                is WeatherState.Available -> {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                    ) {
                        Column(modifier = Modifier.padding(Spacing.space5)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "${weather.temperatureC}°C",
                                    style = MaterialTheme.typography.headlineMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Text(
                                    text = weather.condition,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                            if (!weather.advice.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(Spacing.space2))
                                Text(
                                    text = weather.advice,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
                is WeatherState.Unavailable -> {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                    ) {
                        Text(
                            text = stringResource(R.string.weather_unavailable),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(Spacing.space4)
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(Spacing.space6))

            // 6. Photo Gallery (Rendered only when distinct verified photos > 1) (Phase 11)
            if (place.hasMultiplePhotos) {
                Text(
                    text = "${stringResource(R.string.section_gallery)} (${place.distinctPhotoCount})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.semantics { heading() }
                )
                Spacer(modifier = Modifier.height(Spacing.space3))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(Spacing.space4),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    itemsIndexed(place.photos) { index, photo ->
                        GalleryPhotoCard(
                            photo = photo,
                            placeName = place.name,
                            index = index + 1,
                            total = place.photos.size
                        )
                    }
                }
                Spacer(modifier = Modifier.height(Spacing.space6))
            }

            // 7. Sourced Practical Facts (Null fields strictly omitted) (Phase 16-20)
            val hasPractical = !place.address.isNullOrBlank() ||
                place.hasCoordinates ||
                place.avgVisitMinutes != null ||
                !place.priceTier.isNullOrBlank() ||
                !place.contactPhone.isNullOrBlank() ||
                !place.emergencyPhone.isNullOrBlank()

            if (hasPractical) {
                Text(
                    text = stringResource(R.string.section_practical),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.semantics { heading() }
                )
                Spacer(modifier = Modifier.height(Spacing.space3))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Column(modifier = Modifier.padding(Spacing.space5)) {
                        place.address?.let {
                            PracticalRow(label = stringResource(R.string.label_address), value = it)
                        }
                        if (place.hasCoordinates) {
                            PracticalRow(
                                label = stringResource(R.string.label_coordinates),
                                value = "${String.format(java.util.Locale.US, "%.4f", place.lat)}, ${String.format(java.util.Locale.US, "%.4f", place.lon)}"
                            )
                        }
                        place.avgVisitMinutes?.let {
                            PracticalRow(label = stringResource(R.string.label_visit_duration), value = "$it minutes")
                        }
                        place.priceTier?.let {
                            PracticalRow(label = stringResource(R.string.label_price_tier), value = it)
                        }
                        place.contactPhone?.let {
                            PracticalRow(label = stringResource(R.string.label_contact), value = it)
                        }
                        place.emergencyPhone?.let {
                            PracticalRow(label = stringResource(R.string.label_emergency), value = it)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(Spacing.space6))
            }

            // 8. Catalog & Data Provenance (Phase 25)
            Text(
                text = stringResource(R.string.section_provenance),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.semantics { heading() }
            )
            Spacer(modifier = Modifier.height(Spacing.space3))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
            ) {
                Column(modifier = Modifier.padding(Spacing.space5)) {
                    place.source?.let {
                        PracticalRow(label = stringResource(R.string.label_source), value = it)
                    }
                    place.verifiedAt?.let {
                        PracticalRow(label = stringResource(R.string.label_verified_at), value = it)
                    }
                    place.verificationStatus?.let {
                        PracticalRow(label = "Status", value = it.uppercase())
                    }
                }
            }
        }
    }

    if (showEssentialsSheet) {
        EssentialsSheet(
            onDismissRequest = { showEssentialsSheet = false },
            helplines = essentialsState.helplines,
            services = essentialsState.nearbyServices,
            selectedCategory = essentialsState.selectedCategory,
            onCategorySelected = { cat -> essentialsViewModel.selectCategory(cat) },
            isLoading = essentialsState.isLoadingServices
        )
    }
}

@Composable
private fun GalleryPhotoCard(
    photo: PlacePhoto,
    placeName: String,
    index: Int,
    total: Int
) {
    Card(
        modifier = Modifier
            .width(220.dp)
            .semantics {
                contentDescription = "Photograph $index of $total: ${photo.altText ?: placeName}"
            },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
    ) {
        Column {
            AsyncImage(
                model = photo.resolvedCardUrl,
                contentDescription = photo.altText ?: placeName,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(4f / 3f),
                contentScale = ContentScale.Crop
            )
            val attributionText = listOfNotNull(photo.sourceName, photo.attribution).joinToString(" - ")
            if (attributionText.isNotBlank()) {
                Text(
                    text = attributionText,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    modifier = Modifier.padding(Spacing.space3)
                )
            }
        }
    }
}

@Composable
private fun PracticalRow(label: String, value: String) {
    Column(modifier = Modifier.padding(vertical = Spacing.space2)) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}
