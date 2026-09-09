package com.otravelz.android.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.data.repository.EssentialsRepository
import com.otravelz.android.domain.model.ArtisanCluster
import com.otravelz.android.domain.model.CivicCategory
import com.otravelz.android.domain.model.CivicServiceItem
import com.otravelz.android.domain.model.EmergencyHelpline
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class EssentialsUiState(
    val helplines: List<EmergencyHelpline> = emptyList(),
    val artisanClusters: List<ArtisanCluster> = emptyList(),
    val selectedCategory: CivicCategory = CivicCategory.ALL,
    val nearbyServices: List<CivicServiceItem> = emptyList(),
    val isLoadingServices: Boolean = false,
    val errorMessage: String? = null,
    val centerLat: Double = 20.2961, // Default to Bhubaneswar hub
    val centerLon: Double = 85.8245
)

class EssentialsViewModel(
    private val repository: EssentialsRepository = EssentialsRepository.getInstance()
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        EssentialsUiState(
            helplines = repository.getEmergencyHelplines(),
            artisanClusters = repository.getArtisanClusters()
        )
    )
    val uiState: StateFlow<EssentialsUiState> = _uiState.asStateFlow()

    fun loadServicesForCoordinates(lat: Double, lon: Double, category: CivicCategory = _uiState.value.selectedCategory) {
        _uiState.value = _uiState.value.copy(
            centerLat = lat,
            centerLon = lon,
            selectedCategory = category,
            isLoadingServices = true,
            errorMessage = null
        )

        viewModelScope.launch {
            val result = repository.getNearbyServices(lat, lon, category)
            result.onSuccess { services ->
                _uiState.value = _uiState.value.copy(
                    nearbyServices = services,
                    isLoadingServices = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    isLoadingServices = false,
                    errorMessage = error.localizedMessage ?: "Unable to fetch nearby services"
                )
            }
        }
    }

    fun selectCategory(category: CivicCategory) {
        if (_uiState.value.selectedCategory == category) return
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        loadServicesForCoordinates(
            lat = _uiState.value.centerLat,
            lon = _uiState.value.centerLon,
            category = category
        )
    }
}
