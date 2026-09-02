package com.otravelz.android.feature.place

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.local.BundledCatalogProvider
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.WeatherObservationDto
import com.otravelz.android.data.repository.PlacesRepository
import com.otravelz.android.data.repository.RecentlyViewedRepository
import com.otravelz.android.data.repository.SavedPlacesRepository
import com.otravelz.android.data.repository.WeatherRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PlaceDetailUiState(
    val isLoading: Boolean = true,
    val place: PlaceDetailDto? = null,
    val isSaved: Boolean = false,
    val weather: WeatherObservationDto? = null,
    val errorMessage: String? = null
)

class PlaceDetailViewModel @JvmOverloads constructor(
    application: Application,
    private val placesRepository: PlacesRepository = PlacesRepository(
        bundledCatalogProvider = BundledCatalogProvider.getInstance(application)
    ),
    private val savedPlacesRepository: SavedPlacesRepository = SavedPlacesRepository(application),
    private val recentlyViewedRepository: RecentlyViewedRepository = RecentlyViewedRepository.getInstance(application),
    private val weatherRepository: WeatherRepository = WeatherRepository()
) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(PlaceDetailUiState())
    val uiState: StateFlow<PlaceDetailUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            savedPlacesRepository.savedPlaceIds.collect { savedIds ->
                val currentPlaceId = _uiState.value.place?.id
                if (currentPlaceId != null) {
                    _uiState.value = _uiState.value.copy(isSaved = savedIds.contains(currentPlaceId))
                }
            }
        }
    }

    fun loadPlace(placeId: String) {
        viewModelScope.launch {
            _uiState.value = PlaceDetailUiState(isLoading = true)
            when (val res = placesRepository.getPlaceById(placeId)) {
                is NetworkResult.Success -> {
                    val place = res.data
                    val isSaved = savedPlacesRepository.isPlaceSaved(place.id)
                    _uiState.value = PlaceDetailUiState(
                        isLoading = false,
                        place = place,
                        isSaved = isSaved
                    )

                    // Record view history locally
                    recentlyViewedRepository.recordView(place)

                    // Fetch live weather if coordinates exist
                    if (place.lat != null && place.lon != null) {
                        fetchPlaceWeather(place.lat, place.lon)
                    }
                }
                is NetworkResult.Error -> {
                    _uiState.value = PlaceDetailUiState(isLoading = false, errorMessage = res.message)
                }
                else -> {}
            }
        }
    }

    private fun fetchPlaceWeather(lat: Double, lon: Double) {
        viewModelScope.launch {
            when (val weatherRes = weatherRepository.getWeather(lat, lon)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(weather = weatherRes.data.current)
                }
                else -> {}
            }
        }
    }

    fun toggleSave() {
        val place = _uiState.value.place ?: return
        val newSavedState = savedPlacesRepository.toggleSave(place)
        _uiState.value = _uiState.value.copy(isSaved = newSavedState)
        viewModelScope.launch {
            savedPlacesRepository.syncWithServer()
        }
    }
}
