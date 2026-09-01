package com.otravelz.android.feature.discover

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.otravelz.android.core.design.*
import com.otravelz.android.data.model.PlaceDetailDto

@Composable
fun DiscoverScreen(
    viewModel: DiscoverViewModel,
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    val categories = listOf(
        "temple" to "Temples",
        "nature" to "Nature & Hills",
        "beach" to "Beaches",
        "waterfall" to "Waterfalls",
        "monument" to "Heritage"
    )

    val districts = listOf(
        "Puri",
        "Khordha",
        "Cuttack",
        "Sambalpur",
        "Koraput",
        "Mayurbhanj",
        "Sundargarh"
    )

    val displayedPlaces = if (state.showSavedOnly) {
        state.savedPlaces.filter { place ->
            val matchesQuery = state.searchQuery.isBlank() ||
                place.name.contains(state.searchQuery, ignoreCase = true) ||
                (place.district?.contains(state.searchQuery, ignoreCase = true) == true)
            val matchesCat = state.selectedCategory == null || place.category.equals(state.selectedCategory, ignoreCase = true)
            val matchesDist = state.selectedDistrict == null || place.district?.equals(state.selectedDistrict, ignoreCase = true) == true
            matchesQuery && matchesCat && matchesDist
        }
    } else {
        state.places
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(Spacing.md)
    ) {
        Text(
            text = if (state.showSavedOnly) "Saved Places" else "Discover Destinations",
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary
        )
        Text(
            text = if (state.showSavedOnly) "${state.savedPlaces.size} Saved Destinations" else "${displayedPlaces.size} Verified Odisha Cultural & Natural Sites",
            style = MaterialTheme.typography.bodyMedium,
            color = OchreLight
        )

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Search Input Box
        OutlinedTextField(
            value = state.searchQuery,
            onValueChange = { viewModel.updateSearchQuery(it) },
            placeholder = { Text("Search by name, district, or temple...", color = TextMuted) },
            leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = "Search", tint = OchrePrimary)
            },
            trailingIcon = {
                if (state.searchQuery.isNotEmpty()) {
                    IconButton(onClick = { viewModel.updateSearchQuery("") }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear Search", tint = TextMuted)
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = OchrePrimary,
                unfocusedBorderColor = DarkBorder,
                focusedContainerColor = DarkSurface,
                unfocusedContainerColor = DarkSurface,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Filter Mode: All vs Saved
        Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            ContextChip(
                label = "All Verified",
                isSelected = !state.showSavedOnly,
                onClick = { viewModel.toggleSavedOnly(false) }
            )
            ContextChip(
                label = "Saved (${state.savedPlaces.size})",
                isSelected = state.showSavedOnly,
                onClick = { viewModel.toggleSavedOnly(true) }
            )
        }

        Spacer(modifier = Modifier.height(Spacing.xs))

        // Category Filter Chips
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(categories) { (catId, catLabel) ->
                ContextChip(
                    label = catLabel,
                    isSelected = state.selectedCategory == catId,
                    onClick = { viewModel.selectCategory(catId) }
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.xs))

        // District Filter Chips
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(districts) { districtName ->
                ContextChip(
                    label = districtName,
                    isSelected = state.selectedDistrict == districtName,
                    onClick = { viewModel.selectDistrict(districtName) }
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.md))

        if (state.isLoading && displayedPlaces.isEmpty()) {
            LoadingState(message = "Searching verified Odisha destinations...")
            return
        }

        if (state.errorMessage != null && displayedPlaces.isEmpty()) {
            ErrorState(
                message = state.errorMessage ?: "Search failed",
                onRetry = { viewModel.loadPlaces() }
            )
            return
        }

        if (displayedPlaces.isEmpty()) {
            if (state.showSavedOnly) {
                EmptyState(
                    title = "No Saved Places Yet",
                    subtitle = "Tap the bookmark icon on any destination to save it for your journey."
                )
            } else {
                EmptyState(
                    title = "No Destinations Found",
                    subtitle = "Try adjusting your search terms or clearing the category and district filters."
                )
            }
            return
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            items(displayedPlaces) { place ->
                val isSaved = state.savedPlaceIds.contains(place.id)
                PlaceListItemCard(
                    place = place,
                    isSaved = isSaved,
                    onPlaceClick = onPlaceClick,
                    onBookmarkClick = { viewModel.toggleBookmark(place) }
                )
            }
        }
    }
}

@Composable
private fun PlaceListItemCard(
    place: PlaceDetailDto,
    isSaved: Boolean,
    onPlaceClick: (String) -> Unit,
    onBookmarkClick: () -> Unit
) {
    OTCard(onClick = { onPlaceClick(place.id) }) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val rawImg = place.images.firstOrNull()?.thumbnailUrl ?: place.images.firstOrNull()?.url
            val img = com.otravelz.android.core.network.ApiConfig.resolveImageUrl(rawImg)
            if (!img.isNullOrBlank()) {
                AsyncImage(
                    model = img,
                    contentDescription = place.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(76.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
                Spacer(modifier = Modifier.width(Spacing.md))
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = place.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary
                )
                Text(
                    text = "${place.district ?: "Odisha"} • ${place.category.replace("_", " ").capitalize()}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OchreLight
                )
                if (!place.description.isNullOrBlank()) {
                    Text(
                        text = place.description,
                        style = MaterialTheme.typography.labelSmall,
                        color = TextMuted,
                        maxLines = 2
                    )
                }
            }

            IconButton(onClick = onBookmarkClick) {
                Icon(
                    imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                    contentDescription = if (isSaved) "Remove Bookmark" else "Save Place",
                    tint = if (isSaved) OchrePrimary else TextMuted
                )
            }
        }
    }
}
