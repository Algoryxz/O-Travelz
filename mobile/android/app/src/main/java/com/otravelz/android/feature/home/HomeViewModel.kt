package com.otravelz.android.feature.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.local.room.RecentlyViewedEntity
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.WeatherResponseDto
import com.otravelz.android.data.repository.PlacesRepository
import com.otravelz.android.data.repository.RecentlyViewedRepository
import com.otravelz.android.data.repository.WeatherRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val places: List<PlaceDetailDto> = emptyList(),
    val recentlyViewed: List<RecentlyViewedEntity> = emptyList(),
    val weather: WeatherResponseDto? = null,
    val selectedCategory: String = "temple",
    val errorMessage: String? = null
)

class HomeViewModel @JvmOverloads constructor(
    application: Application,
    private val placesRepository: PlacesRepository = PlacesRepository(),
    private val weatherRepository: WeatherRepository = WeatherRepository(),
    private val recentlyViewedRepository: RecentlyViewedRepository = RecentlyViewedRepository.getInstance(application)
) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadData()
        observeRecentlyViewed()
    }

    private fun observeRecentlyViewed() {
        viewModelScope.launch {
            recentlyViewedRepository.getRecentlyViewed(10).collect { list ->
                _uiState.value = _uiState.value.copy(recentlyViewed = list)
            }
        }
    }

    fun loadData(isRefresh: Boolean = false) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = !isRefresh && _uiState.value.places.isEmpty(),
                isRefreshing = isRefresh,
                errorMessage = null
            )

            coroutineScope {
                val weatherDeferred = async { weatherRepository.getWeather(forceRefresh = isRefresh) }
                val placesDeferred = async { placesRepository.getPlaces() }

                val weatherRes = weatherDeferred.await()
                val placesRes = placesDeferred.await()

                val weather = if (weatherRes is NetworkResult.Success) weatherRes.data else _uiState.value.weather
                if (placesRes is NetworkResult.Success) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        places = placesRes.data,
                        weather = weather,
                        errorMessage = null
                    )
                } else if (placesRes is NetworkResult.Error) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        weather = weather,
                        errorMessage = placesRes.message
                    )
                }
            }
        }
    }

    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
    }

    fun clearRecentlyViewed() {
        viewModelScope.launch {
            recentlyViewedRepository.clearHistory()
        }
    }
}
