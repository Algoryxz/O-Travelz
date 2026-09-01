package com.otravelz.android.feature.transit

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
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
    val coroutineScope = rememberCoroutineScope()

    fun loadStops() {
        coroutineScope.launch {
            isLoading = true
            when (val res = transitRepository.getNearbyStops(lat = 20.2961, lon = 85.8245)) {
                is NetworkResult.Success -> {
                    isLoading = false
                    stops = res.data
                    errorMessage = null
                }
                is NetworkResult.Error -> {
                    isLoading = false
                    errorMessage = res.message
                }
                else -> {}
            }
        }
    }

    LaunchedEffect(Unit) {
        loadStops()
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

        Spacer(modifier = Modifier.height(Spacing.md))

        if (isLoading) {
            LoadingState(message = "Loading scheduled bus stops...")
            return
        }

        if (errorMessage != null && stops.isEmpty()) {
            ErrorState(
                message = errorMessage ?: "Unable to load transit stops",
                onRetry = { loadStops() }
            )
            return
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            items(stops) { stop ->
                OTCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.DirectionsBus, contentDescription = null, tint = OchrePrimary)
                        Spacer(modifier = Modifier.width(Spacing.sm))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = stop.name, style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                            Text(
                                text = "Walking: ~${stop.walkingEstimateMins} mins (${stop.distanceMeters.toInt()}m) • Scheduled",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                            if (stop.routes.isNotEmpty()) {
                                Text(
                                    text = "Routes: " + stop.routes.joinToString(", ") { "Route ${it.routeNumber}" },
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
