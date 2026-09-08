package com.otravelz.android.ui.screens

import android.Manifest
import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*
import com.otravelz.android.R
import com.otravelz.android.domain.model.*
import com.otravelz.android.ui.theme.TerracottaAccent
import com.otravelz.android.ui.theme.Spacing

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MapViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            viewModel.requestUserLocation(context)
        } else {
            viewModel.onLocationPermissionDenied()
        }
    }

    Box(modifier = modifier.fillMaxSize()) {
        when (uiState.productState) {
            is MapProductState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = TerracottaAccent)
                }
            }
            is MapProductState.ProviderUnavailable -> {
                // Calm truthful degradation when Google Maps API key is unconfigured
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = Spacing.space4, vertical = Spacing.space2)
                ) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = Spacing.space3)
                    ) {
                        Column(modifier = Modifier.padding(Spacing.space4)) {
                            Text(
                                text = stringResource(R.string.map_provider_unavailable_title),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(Spacing.space2))
                            Text(
                                text = stringResource(R.string.map_provider_unavailable_desc),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Linear destination alternative
                    Text(
                        text = stringResource(R.string.map_places_in_area) + " (${uiState.visibleDestinations.size})",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(vertical = Spacing.space2)
                    )

                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        items(uiState.visibleDestinations, key = { it.id }) { place ->
                            MapPlaceListItem(
                                place = place,
                                onPlaceClick = onPlaceClick
                            )
                        }
                    }
                }
            }
            is MapProductState.DataUnavailable -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = stringResource(R.string.state_error_title),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(Spacing.space2))
                        Button(
                            onClick = { viewModel.loadDestinations() },
                            colors = ButtonDefaults.buttonColors(containerColor = TerracottaAccent)
                        ) {
                            Text(stringResource(R.string.action_retry))
                        }
                    }
                }
            }
            is MapProductState.Ready -> {
                // Interactive Google Map View
                val cameraPositionState = rememberCameraPositionState {
                    position = CameraPosition.fromLatLngZoom(
                        LatLng(uiState.cameraTarget.lat, uiState.cameraTarget.lon),
                        uiState.cameraZoom
                    )
                }

                LaunchedEffect(uiState.cameraTarget, uiState.cameraZoom) {
                    cameraPositionState.animate(
                        CameraUpdateFactory.newLatLngZoom(
                            LatLng(uiState.cameraTarget.lat, uiState.cameraTarget.lon),
                            uiState.cameraZoom
                        )
                    )
                }

                GoogleMap(
                    modifier = Modifier.fillMaxSize(),
                    cameraPositionState = cameraPositionState,
                    properties = MapProperties(
                        isMyLocationEnabled = uiState.layers.showUserLocation && uiState.locationStatus is LocationStatus.Live
                    ),
                    uiSettings = MapUiSettings(
                        zoomControlsEnabled = false,
                        myLocationButtonEnabled = false,
                        compassEnabled = true
                    ),
                    onMapClick = { viewModel.clearSelection() }
                ) {
                    // 1. Cultural Leisure Destination Markers
                    if (uiState.layers.showDestinations) {
                        uiState.visibleDestinations.forEach { place ->
                            if (place.lat != null && place.lon != null) {
                                Marker(
                                    state = MarkerState(position = LatLng(place.lat, place.lon)),
                                    title = place.name,
                                    snippet = place.category,
                                    onClick = {
                                        viewModel.selectEntity(SelectedMapEntity.Destination(place))
                                        true
                                    }
                                )
                            }
                        }
                    }

                    // 2. Transit Stop Markers
                    uiState.visibleStops.forEach { stop ->
                        if (stop.coordinate != null) {
                            Marker(
                                state = MarkerState(position = LatLng(stop.coordinate.lat, stop.coordinate.lon)),
                                title = stop.name,
                                snippet = if (stop.tier.isVerifiedPhysicalPole) "CRUT Stop" else "Candidate Stop",
                                onClick = {
                                    viewModel.selectEntity(SelectedMapEntity.TransitStop(stop))
                                    true
                                }
                            )
                        }
                    }

                    // 3. Civic Essentials Markers
                    if (uiState.layers.showEssentials) {
                        uiState.visibleServices.forEach { service ->
                            Marker(
                                state = MarkerState(position = LatLng(service.coordinate.lat, service.coordinate.lon)),
                                title = service.name,
                                snippet = service.category.name,
                                onClick = {
                                    viewModel.selectEntity(SelectedMapEntity.CivicService(service))
                                    true
                                }
                            )
                        }
                    }

                    // 4. Transit Route Surveyed Road Polylines (0 Straight-Line Fallbacks)
                    if (uiState.selectedRoute?.isRenderable == true) {
                        Polyline(
                            points = uiState.selectedRoute!!.coordinates.map { LatLng(it.lat, it.lon) },
                            color = TerracottaAccent,
                            width = 10f
                        )
                    }
                }
            }
        }

        // Top Layer Bar & Search Overlay
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .padding(horizontal = Spacing.space4, vertical = Spacing.space2)
        ) {
            // Search Input
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.onSearchQueryChanged(it) },
                placeholder = {
                    Text(
                        stringResource(R.string.search_places_hint),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = null, tint = TerracottaAccent)
                },
                trailingIcon = {
                    if (uiState.searchQuery.isNotBlank()) {
                        IconButton(onClick = { viewModel.onSearchQueryChanged("") }) {
                            Icon(Icons.Default.Close, contentDescription = stringResource(R.string.action_clear_search))
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(24.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                    focusedBorderColor = TerracottaAccent
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(Spacing.space2))

            // Filter Chips Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
            ) {
                FilterChip(
                    selected = uiState.layers.showDestinations,
                    onClick = { viewModel.toggleDestinationsLayer() },
                    label = { Text(stringResource(R.string.map_layer_destinations)) }
                )
                FilterChip(
                    selected = uiState.layers.showEssentials,
                    onClick = { viewModel.toggleEssentialsLayer() },
                    label = { Text(stringResource(R.string.map_layer_essentials)) }
                )
                FilterChip(
                    selected = uiState.layers.showVerifiedStops,
                    onClick = { viewModel.toggleVerifiedStopsLayer() },
                    label = { Text(stringResource(R.string.map_layer_stops)) }
                )
                FilterChip(
                    selected = uiState.layers.showCandidateStops,
                    onClick = { viewModel.toggleCandidateStopsLayer() },
                    label = { Text(stringResource(R.string.map_layer_candidates)) }
                )
                FilterChip(
                    selected = uiState.isListAlternativeVisible,
                    onClick = { viewModel.toggleListAlternative() },
                    label = { Text(stringResource(R.string.map_action_list_view)) }
                )
            }
        }

        // Floating Action Buttons (My Location)
        FloatingActionButton(
            onClick = {
                locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
            },
            shape = CircleShape,
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = TerracottaAccent,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = Spacing.space4, bottom = if (uiState.selectedEntity != SelectedMapEntity.None) 220.dp else Spacing.space4)
        ) {
            Text(
                text = "📍",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.semantics {
                    contentDescription = "My Location"
                }
            )
        }

        // Selected Entity Bottom Sheet
        if (uiState.selectedEntity != SelectedMapEntity.None) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(Spacing.space3)
            ) {
                SelectedEntityCard(
                    entity = uiState.selectedEntity,
                    onPlaceClick = onPlaceClick,
                    onDismiss = { viewModel.clearSelection() }
                )
            }
        }

        // Linear Accessible List Alternative Sheet
        if (uiState.isListAlternativeVisible) {
            ModalBottomSheet(
                onDismissRequest = { viewModel.toggleListAlternative() }
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.space4)
                ) {
                    Text(
                        text = stringResource(R.string.map_places_in_area) + " (${uiState.visibleDestinations.size})",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(bottom = Spacing.space3)
                    )

                    LazyColumn(
                        modifier = Modifier.fillMaxHeight(0.7f),
                        verticalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        items(uiState.visibleDestinations, key = { it.id }) { place ->
                            MapPlaceListItem(
                                place = place,
                                onPlaceClick = {
                                    viewModel.toggleListAlternative()
                                    onPlaceClick(it)
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
private fun MapPlaceListItem(
    place: DiscoverPlace,
    onPlaceClick: (String) -> Unit
) {
    val context = LocalContext.current
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onPlaceClick(place.id) }
            .semantics(mergeDescendants = true) {
                contentDescription = "${place.name}, ${place.category} in ${place.district ?: ""}"
            },
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(Spacing.space3),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                if (place.primaryPhoto != null) {
                    AsyncImage(
                        model = place.primaryPhoto.resolvedThumbnailUrl,
                        contentDescription = place.primaryPhoto.altText ?: place.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Text(
                        text = "🏛️",
                        style = MaterialTheme.typography.titleMedium
                    )
                }
            }

            Spacer(modifier = Modifier.width(Spacing.space3))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = place.name,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                if (!place.odiaName.isNullOrBlank()) {
                    Text(
                        text = place.odiaName,
                        style = MaterialTheme.typography.bodySmall,
                        color = TerracottaAccent
                    )
                }
                Text(
                    text = "${place.category} · ${place.district ?: ""}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            IconButton(
                onClick = {
                    if (place.lat != null && place.lon != null) {
                        val uri = Uri.parse("geo:0,0?q=${place.lat},${place.lon}(${Uri.encode(place.name)})")
                        val intent = Intent(Intent.ACTION_VIEW, uri)
                        context.startActivity(intent)
                    }
                }
            ) {
                Text("🧭")
            }
        }
    }
}

@Composable
private fun SelectedEntityCard(
    entity: SelectedMapEntity,
    onPlaceClick: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(Spacing.space4)) {
            when (entity) {
                is SelectedMapEntity.Destination -> {
                    val place = entity.place
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = place.name,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            if (!place.odiaName.isNullOrBlank()) {
                                Text(
                                    text = place.odiaName,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TerracottaAccent
                                )
                            }
                            Text(
                                text = "${place.category} · ${place.district ?: ""}",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.Close, contentDescription = "Close preview")
                        }
                    }

                    Spacer(modifier = Modifier.height(Spacing.space3))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space3)
                    ) {
                        Button(
                            onClick = { onPlaceClick(place.id) },
                            colors = ButtonDefaults.buttonColors(containerColor = TerracottaAccent),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(stringResource(R.string.map_action_open_details))
                        }

                        if (place.lat != null && place.lon != null) {
                            OutlinedButton(
                                onClick = {
                                    val uri = Uri.parse("geo:0,0?q=${place.lat},${place.lon}(${Uri.encode(place.name)})")
                                    context.startActivity(Intent(Intent.ACTION_VIEW, uri))
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(stringResource(R.string.map_action_navigate))
                            }
                        }
                    }
                }
                is SelectedMapEntity.TransitStop -> {
                    val stop = entity.stop
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = stop.name,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            val badge = if (stop.tier.isVerifiedPhysicalPole) {
                                stringResource(R.string.map_verified_stop_badge)
                            } else {
                                stringResource(R.string.map_candidate_stop_badge)
                            }
                            Text(
                                text = "[$badge] ${stop.city ?: ""} ${stop.district ?: ""}",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (stop.tier.isVerifiedPhysicalPole) TerracottaAccent else Color(0xFFD97706)
                            )
                        }
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.Close, contentDescription = "Close preview")
                        }
                    }

                    if (stop.tier.isCandidate) {
                        Spacer(modifier = Modifier.height(Spacing.space2))
                        Text(
                            text = stringResource(R.string.map_candidate_stop_disclaimer),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error
                        )
                    }

                    if (stop.coordinate != null && stop.tier.allowsExternalNavigation) {
                        Spacer(modifier = Modifier.height(Spacing.space3))
                        Button(
                            onClick = {
                                val uri = Uri.parse("geo:0,0?q=${stop.coordinate.lat},${stop.coordinate.lon}(${Uri.encode(stop.name)})")
                                context.startActivity(Intent(Intent.ACTION_VIEW, uri))
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = TerracottaAccent),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(stringResource(R.string.map_action_navigate))
                        }
                    }
                }
                is SelectedMapEntity.CivicService -> {
                    val service = entity.service
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = service.name,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = service.category.name + (service.address?.let { " · $it" } ?: ""),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            if (service.phone != null) {
                                Text(
                                    text = "📞 ${service.phone}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.Close, contentDescription = "Close preview")
                        }
                    }

                    Spacer(modifier = Modifier.height(Spacing.space3))
                    Button(
                        onClick = {
                            val uri = Uri.parse("geo:0,0?q=${service.coordinate.lat},${service.coordinate.lon}(${Uri.encode(service.name)})")
                            context.startActivity(Intent(Intent.ACTION_VIEW, uri))
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = TerracottaAccent),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(stringResource(R.string.map_action_navigate))
                    }
                }
                else -> {}
            }
        }
    }
}
