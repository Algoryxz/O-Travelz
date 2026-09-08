package com.otravelz.android.ui.roots

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.otravelz.android.R
import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.NetworkResult
import com.otravelz.android.domain.model.DiscoverPlace
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
 * Editorial Cultural Atlas Discover root screen for Android.
 * Implements M8 requirements:
 * - Direct connection to live canonical places catalog
 * - Sourced category filters and instant bilingual search
 * - Dignified cultural empty / error / loading states
 * - Adaptive layout: 1 column on compact, 2 columns on expanded
 */
@Composable
fun DiscoverRoot(
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var uiState by remember { mutableStateOf<DiscoverUiState>(DiscoverUiState.Loading) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

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
                val filtered = state.places.filter { place ->
                    val matchesCategory = selectedCategory == null || place.category.equals(selectedCategory, ignoreCase = true)
                    val q = searchQuery.trim().lowercase()
                    val matchesSearch = q.isEmpty() ||
                            place.name.lowercase().contains(q) ||
                            (place.odiaName?.contains(q) == true) ||
                            (place.district?.lowercase()?.contains(q) == true)
                    matchesCategory && matchesSearch
                }

                DiscoverContent(
                    allPlaces = state.places,
                    filteredPlaces = filtered,
                    searchQuery = searchQuery,
                    onSearchQueryChange = { searchQuery = it },
                    selectedCategory = selectedCategory,
                    onCategorySelected = { cat ->
                        selectedCategory = if (selectedCategory == cat) null else cat
                    },
                    onClearFilters = {
                        searchQuery = ""
                        selectedCategory = null
                    },
                    onPlaceClick = onPlaceClick
                )
            }
        }
    }
}

@Composable
private fun DiscoverContent(
    allPlaces: List<DiscoverPlace>,
    filteredPlaces: List<DiscoverPlace>,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    selectedCategory: String?,
    onCategorySelected: (String) -> Unit,
    onClearFilters: () -> Unit,
    onPlaceClick: (String) -> Unit
) {
    val categories = remember(allPlaces) {
        allPlaces.map { it.category }.distinct().sorted()
    }

    Column(modifier = Modifier.fillMaxSize()) {
        // Search bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchQueryChange,
            placeholder = {
                Text(
                    text = stringResource(R.string.search_places_hint),
                    style = MaterialTheme.typography.bodyMedium
                )
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

        // Category chips row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = Spacing.space5, vertical = Spacing.space2),
            horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
        ) {
            FilterChip(
                selected = selectedCategory == null,
                onClick = onClearFilters,
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
                    Button(
                        onClick = onClearFilters,
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
                    PlaceCard(
                        place = place,
                        onClick = { onPlaceClick(place.id) }
                    )
                }
            }
        }
    }
}
