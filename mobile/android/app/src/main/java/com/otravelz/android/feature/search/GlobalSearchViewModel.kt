package com.otravelz.android.feature.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.SyncTripItemDto
import com.otravelz.android.data.repository.PlacesRepository
import com.otravelz.android.data.repository.RecentSearchesRepository
import com.otravelz.android.data.repository.SavedPlacesRepository
import com.otravelz.android.data.repository.SavedTripsRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class GlobalSearchUiState(
    val query: String = "",
    val isLoading: Boolean = false,
    val recentSearches: List<String> = emptyList(),
    val matchingPlaces: List<PlaceDetailDto> = emptyList(),
    val matchingSavedPlaces: List<PlaceDetailDto> = emptyList(),
    val matchingSavedTrips: List<SyncTripItemDto> = emptyList(),
    val matchingDistricts: List<String> = emptyList(),
    val matchingCategories: List<String> = emptyList()
)

class GlobalSearchViewModel(
    private val placesRepository: PlacesRepository = PlacesRepository(),
    private val savedPlacesRepository: SavedPlacesRepository? = null,
    private val savedTripsRepository: SavedTripsRepository? = null,
    private val recentSearchesRepository: RecentSearchesRepository? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(GlobalSearchUiState())
    val uiState: StateFlow<GlobalSearchUiState> = _uiState.asStateFlow()

    private var allPlaces: List<PlaceDetailDto> = emptyList()
    private var allSavedPlaces: List<PlaceDetailDto> = emptyList()
    private var allSavedTrips: List<SyncTripItemDto> = emptyList()
    private var searchJob: Job? = null

    init {
        loadData()
        observeRecentSearches()
        observeSavedData()
    }

    private fun loadData() {
        viewModelScope.launch {
            val res = placesRepository.getPlaces()
            if (res is NetworkResult.Success) {
                allPlaces = res.data
                performSearch(_uiState.value.query)
            }
        }
    }

    private fun observeRecentSearches() {
        if (recentSearchesRepository == null) return
        viewModelScope.launch {
            recentSearchesRepository.getRecentSearches(10).collect { list ->
                _uiState.value = _uiState.value.copy(
                    recentSearches = list.map { it.query }
                )
            }
        }
    }

    private fun observeSavedData() {
        savedPlacesRepository?.let { repo ->
            viewModelScope.launch {
                repo.savedPlaces.collect { places ->
                    allSavedPlaces = places
                    performSearch(_uiState.value.query)
                }
            }
        }

        savedTripsRepository?.let { repo ->
            viewModelScope.launch {
                repo.savedTrips.collect { trips ->
                    allSavedTrips = trips
                    performSearch(_uiState.value.query)
                }
            }
        }
    }

    fun updateQuery(newQuery: String) {
        _uiState.value = _uiState.value.copy(query = newQuery)
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(150)
            performSearch(newQuery)
        }
    }

    fun submitSearch(query: String) {
        val trimmed = query.trim()
        if (trimmed.isNotBlank()) {
            viewModelScope.launch {
                recentSearchesRepository?.addSearch(trimmed)
            }
        }
    }

    fun removeRecentSearch(query: String) {
        viewModelScope.launch {
            recentSearchesRepository?.removeSearch(query)
        }
    }

    fun clearRecentSearches() {
        viewModelScope.launch {
            recentSearchesRepository?.clearAll()
        }
    }

    private fun performSearch(q: String) {
        val trimmed = q.trim()
        if (trimmed.isBlank()) {
            _uiState.value = _uiState.value.copy(
                matchingPlaces = emptyList(),
                matchingSavedPlaces = emptyList(),
                matchingSavedTrips = emptyList(),
                matchingDistricts = emptyList(),
                matchingCategories = emptyList(),
                isLoading = false
            )
            return
        }

        val placeMatches = allPlaces.filter { place ->
            place.name.contains(trimmed, ignoreCase = true) ||
            place.category.contains(trimmed, ignoreCase = true) ||
            (place.district?.contains(trimmed, ignoreCase = true) == true) ||
            place.interests.any { it.contains(trimmed, ignoreCase = true) }
        }.take(15)

        val savedPlaceMatches = allSavedPlaces.filter { place ->
            place.name.contains(trimmed, ignoreCase = true) ||
            place.category.contains(trimmed, ignoreCase = true)
        }.take(5)

        val savedTripMatches = allSavedTrips.filter { trip ->
            trip.title.contains(trimmed, ignoreCase = true)
        }.take(5)

        val allDistricts = allPlaces.mapNotNull { it.district }.distinct()
        val districtMatches = allDistricts.filter { it.contains(trimmed, ignoreCase = true) }.take(5)

        val allCategories = allPlaces.map { it.category }.distinct()
        val categoryMatches = allCategories.filter { it.contains(trimmed, ignoreCase = true) }.take(5)

        _uiState.value = _uiState.value.copy(
            matchingPlaces = placeMatches,
            matchingSavedPlaces = savedPlaceMatches,
            matchingSavedTrips = savedTripMatches,
            matchingDistricts = districtMatches,
            matchingCategories = categoryMatches,
            isLoading = false
        )
    }
}
