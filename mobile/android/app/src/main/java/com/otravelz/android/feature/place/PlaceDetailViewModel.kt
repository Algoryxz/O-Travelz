package com.otravelz.android.feature.place

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.repository.PlacesRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PlaceDetailUiState(
    val isLoading: Boolean = true,
    val place: PlaceDetailDto? = null,
    val errorMessage: String? = null
)

class PlaceDetailViewModel @JvmOverloads constructor(
    private val placesRepository: PlacesRepository = PlacesRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(PlaceDetailUiState())
    val uiState: StateFlow<PlaceDetailUiState> = _uiState.asStateFlow()

    fun loadPlace(placeId: String) {
        viewModelScope.launch {
            _uiState.value = PlaceDetailUiState(isLoading = true)
            when (val res = placesRepository.getPlaceById(placeId)) {
                is NetworkResult.Success -> {
                    _uiState.value = PlaceDetailUiState(isLoading = false, place = res.data)
                }
                is NetworkResult.Error -> {
                    _uiState.value = PlaceDetailUiState(isLoading = false, errorMessage = res.message)
                }
                else -> {}
            }
        }
    }
}
