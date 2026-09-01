package com.otravelz.android.feature.discover

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.ViewList
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.otravelz.android.core.design.*
import com.otravelz.android.core.network.ApiConfig
import com.otravelz.android.data.model.PlaceDetailDto

@Composable
fun DiscoverScreen(
    viewModel: DiscoverViewModel,
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    var isGridView by remember { mutableStateOf(false) }

    val categories = listOf(
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
            .padding(horizontal = Spacing.md, vertical = Spacing.sm)
    ) {
        // Header & View Toggle
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column {
                Text(
                    text = if (state.showSavedOnly) "Saved Places" else "Discover Odisha",
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${displayedPlaces.size} Verified destinations",
                    style = MaterialTheme.typography.bodySmall,
                    color = OchreLight
                )
            }

            IconButton(
                onClick = { isGridView = !isGridView },
                modifier = Modifier
                    .background(DarkSurfaceElevated, RoundedCornerShape(12.dp))
                    .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
            ) {
                Icon(
                    imageVector = if (isGridView) Icons.Default.ViewList else Icons.Default.GridView,
                    contentDescription = "Switch View",
                    tint = TextPrimary
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Search Bar
        OutlinedTextField(
            value = state.searchQuery,
            onValueChange = { viewModel.updateSearchQuery(it) },
            placeholder = { Text("Search temples, waterfalls, heritage...", color = TextMuted) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = SunTempleGold) },
            trailingIcon = {
                if (state.searchQuery.isNotBlank()) {
                    IconButton(onClick = { viewModel.updateSearchQuery("") }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear", tint = TextSecondary)
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = DarkSurfaceElevated,
                unfocusedContainerColor = DarkSurface,
                focusedBorderColor = OchrePrimary,
                unfocusedBorderColor = DarkBorder,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Primary Category Chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(Spacing.xs)) {
            item {
                ContextChip(
                    label = "All",
                    isSelected = state.selectedCategory == null && !state.showSavedOnly,
                    onClick = {
                        if (state.showSavedOnly) viewModel.toggleSavedOnly(false)
                        viewModel.selectCategory(null)
                    }
                )
            }
            item {
                ContextChip(
                    label = "Saved",
                    isSelected = state.showSavedOnly,
                    icon = Icons.Default.Bookmark,
                    count = state.savedPlaces.size,
                    onClick = { viewModel.toggleSavedOnly(!state.showSavedOnly) }
                )
            }
            items(categories) { (catId, catLabel) ->
                ContextChip(
                    label = catLabel,
                    isSelected = state.selectedCategory.equals(catId, ignoreCase = true) && !state.showSavedOnly,
                    onClick = {
                        if (state.showSavedOnly) viewModel.toggleSavedOnly(false)
                        viewModel.selectCategory(if (state.selectedCategory == catId) null else catId)
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.xs))

        // Secondary District Filter Chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(Spacing.xs)) {
            items(districts) { district ->
                val isSelected = state.selectedDistrict.equals(district, ignoreCase = true)
                FilterChip(
                    selected = isSelected,
                    onClick = { viewModel.selectDistrict(if (isSelected) null else district) },
                    label = { Text(district, style = MaterialTheme.typography.labelMedium) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = OchreDark,
                        selectedLabelColor = TextPrimary,
                        containerColor = DarkSurface,
                        labelColor = TextSecondary
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        enabled = true,
                        selected = isSelected,
                        borderColor = DarkBorder,
                        selectedBorderColor = OchrePrimary
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Content Area (Grid or List)
        if (state.isLoading && displayedPlaces.isEmpty()) {
            LoadingState(modifier = Modifier.weight(1f), message = "Searching catalog...")
        } else if (state.errorMessage != null && displayedPlaces.isEmpty()) {
            ErrorState(
                message = state.errorMessage ?: "Failed to load places",
                onRetry = { viewModel.loadPlaces() },
                modifier = Modifier.weight(1f)
            )
        } else if (displayedPlaces.isEmpty()) {
            EmptyState(
                title = "No destinations found",
                subtitle = "Try adjusting your search query, category, or district filter.",
                actionText = "Clear Filters",
                onAction = {
                    viewModel.updateSearchQuery("")
                    viewModel.selectCategory(null)
                    viewModel.selectDistrict(null)
                },
                modifier = Modifier.weight(1f)
            )
        } else {
            if (isGridView) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
                    verticalArrangement = Arrangement.spacedBy(Spacing.sm),
                    modifier = Modifier.weight(1f)
                ) {
                    items(displayedPlaces, key = { it.id }) { place ->
                        val isSaved = state.savedPlaces.any { it.id == place.id }
                        DestinationCard(
                            name = place.name,
                            category = place.category,
                            district = place.district,
                            imageUrl = place.images.firstOrNull()?.thumbnailUrl ?: place.images.firstOrNull()?.url,
                            rating = place.rating,
                            isSaved = isSaved,
                            onSaveToggle = { viewModel.toggleBookmark(place) },
                            onClick = { onPlaceClick(place.id) },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(Spacing.sm),
                    modifier = Modifier.weight(1f)
                ) {
                    items(displayedPlaces, key = { it.id }) { place ->
                        val isSaved = state.savedPlaces.any { it.id == place.id }
                        DiscoverListItemCard(
                            place = place,
                            isSaved = isSaved,
                            onSaveToggle = { viewModel.toggleBookmark(place) },
                            onClick = { onPlaceClick(place.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DiscoverListItemCard(
    place: PlaceDetailDto,
    isSaved: Boolean,
    onSaveToggle: () -> Unit,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(Spacing.sm),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val rawImg = place.images.firstOrNull()?.thumbnailUrl ?: place.images.firstOrNull()?.url
            val img = ApiConfig.resolveImageUrl(rawImg)
            if (!img.isNullOrBlank()) {
                AsyncImage(
                    model = img,
                    contentDescription = place.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(10.dp))
                )
                Spacer(modifier = Modifier.width(Spacing.md))
            }

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = place.name,
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    TruthBadge(
                        label = "VERIFIED",
                        backgroundColor = LiveBadgeBg,
                        contentColor = LiveBadgeText
                    )
                }

                Spacer(modifier = Modifier.height(2.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = place.category.replace("_", " ").uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = OchreLight,
                        fontWeight = FontWeight.Bold
                    )
                    if (!place.district.isNullOrBlank()) {
                        Text(
                            text = " • ${place.district}",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                    }
                }

                if (place.rating != null) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Rating",
                            tint = SunTempleGold,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            text = "${place.rating} (${place.ratingCount ?: 100}+)",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }
            }

            IconButton(onClick = onSaveToggle) {
                Icon(
                    imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                    contentDescription = "Save",
                    tint = if (isSaved) SunTempleGold else TextSecondary
                )
            }
        }
    }
}
