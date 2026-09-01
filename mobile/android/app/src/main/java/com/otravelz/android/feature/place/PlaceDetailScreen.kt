package com.otravelz.android.feature.place

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.otravelz.android.core.design.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlaceDetailScreen(
    placeId: String,
    viewModel: PlaceDetailViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(placeId) {
        viewModel.loadPlace(placeId)
    }

    if (state.isLoading) {
        LoadingState(modifier = modifier.fillMaxSize())
        return
    }

    if (state.errorMessage != null || state.place == null) {
        ErrorState(
            message = state.errorMessage ?: "Place details unavailable",
            onRetry = { viewModel.loadPlace(placeId) },
            modifier = modifier.fillMaxSize()
        )
        return
    }

    val place = state.place!!
    val primaryImage = place.images.firstOrNull()?.url

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = place.name, maxLines = 1) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkSurface,
                    titleContentColor = TextPrimary
                )
            )
        },
        containerColor = DarkBackground
    ) { padding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // Hero Photo
            if (!primaryImage.isNullOrBlank()) {
                AsyncImage(
                    model = primaryImage,
                    contentDescription = place.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp)
                )
            }

            Column(modifier = Modifier.padding(Spacing.md)) {
                // Verified Badge
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CheckCircle, contentDescription = "Verified", tint = StatusSuccess, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(Spacing.xs))
                    Text(
                        text = "Verified Canonical Destination",
                        style = MaterialTheme.typography.labelSmall,
                        color = StatusSuccess,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(Spacing.xs))
                Text(text = place.name, style = MaterialTheme.typography.headlineLarge, color = TextPrimary)
                Text(text = "${place.district ?: "Odisha"} • ${place.category.replace("_", " ").capitalize()}", style = MaterialTheme.typography.titleMedium, color = OchreLight)

                Spacer(modifier = Modifier.height(Spacing.md))

                // Location & Coordinates Box
                OTCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LocationOn, contentDescription = "Location", tint = OchrePrimary)
                        Spacer(modifier = Modifier.width(Spacing.sm))
                        Column {
                            Text(text = "Coordinates", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                            val lat = place.lat?.let { "%.4f".format(it) } ?: "N/A"
                            val lon = place.lon?.let { "%.4f".format(it) } ?: "N/A"
                            Text(
                                text = "Lat: $lat, Lon: $lon (Label: Verified)",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(Spacing.md))

                // Description
                if (!place.description.isNullOrBlank()) {
                    Text(text = "About this Destination", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                    Spacer(modifier = Modifier.height(Spacing.xs))
                    Text(text = place.description, style = MaterialTheme.typography.bodyLarge, color = TextSecondary)
                    Spacer(modifier = Modifier.height(Spacing.md))
                }

                // First-Mile & Transit Guidance
                OTCard {
                    Text(text = "First-Mile Transit Access", style = MaterialTheme.typography.titleMedium, color = OchreLight)
                    Spacer(modifier = Modifier.height(Spacing.xs))
                    Text(
                        text = "Connecting via CRUT Mo Bus & Ama Bus Network. Scheduled timetables available in transit hub view.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }
            }
        }
    }
}
