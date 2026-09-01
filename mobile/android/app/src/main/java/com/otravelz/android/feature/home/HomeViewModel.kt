package com.otravelz.android.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.WeatherResponseDto
import com.otravelz.android.data.repository.PlacesRepository
import com.otravelz.android.data.repository.WeatherRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = true,
    val places: List<PlaceDetailDto> = emptyList(),
    val weather: WeatherResponseDto? = null,
    val selectedCategory: String = "temple",
    val errorMessage: String? = null
)

class HomeViewModel @JvmOverloads constructor(
    private val placesRepository: PlacesRepository = PlacesRepository(),
    private val weatherRepository: WeatherRepository = WeatherRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)

            val weatherRes = weatherRepository.getWeather()
            val placesRes = placesRepository.getPlaces()

            val weather = if (weatherRes is NetworkResult.Success) weatherRes.data else null
            if (placesRes is NetworkResult.Success) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    places = placesRes.data,
                    weather = weather,
                    errorMessage = null
                )
            } else if (placesRes is NetworkResult.Error) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    weather = weather,
                    errorMessage = placesRes.message
                )
            }
        }
    }

    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
    }
}
