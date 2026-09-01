package com.otravelz.android.feature.discover

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.repository.PlacesRepository
import com.otravelz.android.data.repository.SavedPlacesRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class DiscoverUiState(
    val searchQuery: String = "",
    val selectedCategory: String? = null,
    val selectedDistrict: String? = null,
    val showSavedOnly: Boolean = false,
    val places: List<PlaceDetailDto> = emptyList(),
    val savedPlaces: List<PlaceDetailDto> = emptyList(),
    val savedPlaceIds: Set<String> = emptySet(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class DiscoverViewModel(
    application: Application,
    private val placesRepository: PlacesRepository = PlacesRepository(),
    private val savedPlacesRepository: SavedPlacesRepository = SavedPlacesRepository(application)
) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(DiscoverUiState())
    val uiState: StateFlow<DiscoverUiState> = _uiState.asStateFlow()

    private var searchJob: Job? = null

    init {
        // Collect saved places from repository reactively
        viewModelScope.launch {
            savedPlacesRepository.savedPlaces.collect { savedList ->
                _uiState.update { it.copy(savedPlaces = savedList) }
            }
        }
        viewModelScope.launch {
            savedPlacesRepository.savedPlaceIds.collect { savedIds ->
                _uiState.update { it.copy(savedPlaceIds = savedIds) }
            }
        }

        loadPlaces()
    }

    fun loadPlaces() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val state = _uiState.value
            when (val result = placesRepository.searchPlaces(
                search = state.searchQuery,
                category = state.selectedCategory,
                district = state.selectedDistrict
            )) {
                is NetworkResult.Success -> {
                    _uiState.update {
                        it.copy(
                            places = result.data,
                            isLoading = false,
                            errorMessage = null
                        )
                    }
                }
                is NetworkResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = result.message
                        )
                    }
                }
                else -> {}
            }
        }
    }

    fun updateSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(350) // Debounce network search
            loadPlaces()
        }
    }

    fun selectCategory(category: String?) {
        val newCategory = if (_uiState.value.selectedCategory == category) null else category
        _uiState.update { it.copy(selectedCategory = newCategory) }
        loadPlaces()
    }

    fun selectDistrict(district: String?) {
        val newDistrict = if (_uiState.value.selectedDistrict == district) null else district
        _uiState.update { it.copy(selectedDistrict = newDistrict) }
        loadPlaces()
    }

    fun toggleSavedOnly(showSaved: Boolean) {
        _uiState.update { it.copy(showSavedOnly = showSaved) }
    }

    fun toggleBookmark(place: PlaceDetailDto) {
        savedPlacesRepository.toggleSave(place)
        // Optionally trigger background sync
        viewModelScope.launch {
            savedPlacesRepository.syncWithServer()
        }
    }
}
