package com.otravelz.android.feature.transit

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.location.LocationManager
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.model.NearbyStopDto
import com.otravelz.android.data.repository.TransitRepository
import kotlinx.coroutines.launch

@Composable
fun TransitScreen(
    transitRepository: TransitRepository = remember { TransitRepository() },
    modifier: Modifier = Modifier
) {
    var isLoading by remember { mutableStateOf(true) }
    var stops by remember { mutableStateOf<List<NearbyStopDto>>(emptyList()) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedRouteFilter by remember { mutableStateOf("All") }

    val coroutineScope = rememberCoroutineScope()

    fun loadStops() {
        coroutineScope.launch {
            isLoading = true
            when (val res = transitRepository.getNearbyStops(
                lat = LocationManager.DEFAULT_FALLBACK_LAT,
                lon = LocationManager.DEFAULT_FALLBACK_LON
            )) {
                is NetworkResult.Success -> {
                    isLoading = false
                    stops = res.data
                    errorMessage = null
                }
                is NetworkResult.Error -> {
                    isLoading = false
                    errorMessage = res.message
                }
                else -> {
                    isLoading = false
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        loadStops()
    }

    // Extract all unique route numbers from stops for quick filtering
    val availableRoutes = remember(stops) {
        listOf("All") + stops.flatMap { it.routes.map { r -> r.routeNumber } }.distinct().sorted()
    }

    val filteredStops = remember(stops, searchQuery, selectedRouteFilter) {
        stops.filter { stop ->
            val matchesQuery = searchQuery.isBlank() ||
                    stop.name.contains(searchQuery, ignoreCase = true) ||
                    (stop.publishedName?.contains(searchQuery, ignoreCase = true) == true) ||
                    stop.routes.any { it.routeNumber.contains(searchQuery, ignoreCase = true) }

            val matchesRoute = selectedRouteFilter == "All" ||
                    stop.routes.any { it.routeNumber == selectedRouteFilter }

            matchesQuery && matchesRoute
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(Spacing.md)
    ) {
        Text(
            text = "Mo Bus & Transit Network",
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary
        )
        Text(
            text = "154 Routes • 1,430 Scheduled Stops (Bhubaneswar, Cuttack, Puri)",
            style = MaterialTheme.typography.bodyMedium,
            color = OchreLight
        )

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Truthfulness Guardrail Notice
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = DarkSurfaceVariant.copy(alpha = 0.6f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(Spacing.sm),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = OchreLight,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(Spacing.sm))
                Text(
                    text = "Scheduled Timetable Notice: Stop departures and route frequencies are derived from published CRUT / Mo Bus timetables. Live GPS vehicle tracking is not available.",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search bus stops or route numbers...", color = TextMuted) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = OchrePrimary) },
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = DarkSurface,
                unfocusedContainerColor = DarkSurface,
                focusedBorderColor = OchrePrimary,
                unfocusedBorderColor = DarkBorder,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        // Route Filter Chips
        if (availableRoutes.size > 1) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(Spacing.xs)
            ) {
                availableRoutes.take(12).forEach { routeNum ->
                    ContextChip(
                        label = if (routeNum == "All") "All Routes" else "Route $routeNum",
                        isSelected = selectedRouteFilter == routeNum,
                        onClick = { selectedRouteFilter = routeNum }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(Spacing.sm))

        if (isLoading) {
            LoadingState(message = "Loading scheduled Mo Bus stops...")
            return
        }

        if (errorMessage != null && stops.isEmpty()) {
            ErrorState(
                message = errorMessage ?: "Unable to load transit stops",
                onRetry = { loadStops() }
            )
            return
        }

        Text(
            text = "Scheduled Stops Nearby (${filteredStops.size})",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        if (filteredStops.isEmpty()) {
            EmptyState(
                title = "No scheduled stops found",
                subtitle = "No Mo Bus stops match your search or filter criteria."
            )
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                items(filteredStops, key = { it.stopId }) { stop ->
                    OTCard {
                        Row(verticalAlignment = Alignment.Top) {
                            Box(
                                modifier = Modifier
                                    .padding(top = 2.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(DarkSurfaceVariant)
                                    .padding(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.DirectionsBus,
                                    contentDescription = null,
                                    tint = OchrePrimary
                                )
                            }
                            Spacer(modifier = Modifier.width(Spacing.sm))
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = stop.name,
                                        style = MaterialTheme.typography.titleMedium,
                                        color = TextPrimary,
                                        modifier = Modifier.weight(1f)
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(DarkSurfaceVariant)
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = "Scheduled",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = OchreLight,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }

                                if (!stop.publishedName.isNullOrBlank() && stop.publishedName != stop.name) {
                                    Text(
                                        text = "Official: ${stop.publishedName}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = TextMuted
                                    )
                                }

                                Spacer(modifier = Modifier.height(2.dp))

                                Text(
                                    text = "Straight-line proximity: ${stop.distanceMeters.toInt()}m from Master Canteen • Scheduled",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextSecondary
                                )

                                if (stop.routes.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(Spacing.xs))
                                    Row(
                                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        stop.routes.forEach { r ->
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(TealDark.copy(alpha = 0.4f))
                                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                                            ) {
                                                Text(
                                                    text = "Route ${r.routeNumber}",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = TealLight,
                                                    fontWeight = FontWeight.SemiBold
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
}
