package com.otravelz.android.ui.screens

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.data.repository.TransitRepository
import com.otravelz.android.data.repository.TransitRepositoryImpl
import com.otravelz.android.domain.model.TransitRegion
import com.otravelz.android.domain.model.TransitRouteDetail
import com.otravelz.android.domain.model.TransitRouteSummary
import com.otravelz.android.domain.model.TransitSearchEngine
import com.otravelz.android.domain.model.TransitStop
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class TransitUiState(
    val isLoading: Boolean = true,
    val allRoutes: List<TransitRouteSummary> = emptyList(),
    val filteredRoutes: List<TransitRouteSummary> = emptyList(),
    val searchQuery: String = "",
    val selectedRegion: TransitRegion? = null,
    val selectedRouteDetail: TransitRouteDetail? = null,
    val isRouteDetailLoading: Boolean = false,
    val selectedDirectionIndex: Int = 0,
    val selectedStopForSheet: TransitStop? = null,
    val userLat: Double? = null,
    val userLon: Double? = null,
    val isRealGps: Boolean = false
) {
    val totalRouteCount: Int
        get() = allRoutes.size

    val filteredRouteCount: Int
        get() = filteredRoutes.size

    val hasActiveFilters: Boolean
        get() = searchQuery.isNotBlank() || selectedRegion != null
}

class TransitViewModel(
    application: Application,
    private val repository: TransitRepository = TransitRepositoryImpl(application)
) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(TransitUiState())
    val uiState: StateFlow<TransitUiState> = _uiState.asStateFlow()

    init {
        loadRoutes()
    }

    fun loadRoutes() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val routes = repository.getRoutes()
            val filtered = TransitSearchEngine.filterAndRank(
                routes = routes,
                query = _uiState.value.searchQuery,
                selectedRegion = _uiState.value.selectedRegion
            )
            _uiState.update {
                it.copy(
                    isLoading = false,
                    allRoutes = routes,
                    filteredRoutes = filtered
                )
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.update { current ->
            val filtered = TransitSearchEngine.filterAndRank(
                routes = current.allRoutes,
                query = query,
                selectedRegion = current.selectedRegion
            )
            current.copy(searchQuery = query, filteredRoutes = filtered)
        }
    }

    fun onRegionSelected(region: TransitRegion?) {
        _uiState.update { current ->
            val nextRegion = if (current.selectedRegion == region) null else region
            val filtered = TransitSearchEngine.filterAndRank(
                routes = current.allRoutes,
                query = current.searchQuery,
                selectedRegion = nextRegion
            )
            current.copy(selectedRegion = nextRegion, filteredRoutes = filtered)
        }
    }

    fun clearFilters() {
        _uiState.update { current ->
            val filtered = TransitSearchEngine.filterAndRank(
                routes = current.allRoutes,
                query = "",
                selectedRegion = null
            )
            current.copy(searchQuery = "", selectedRegion = null, filteredRoutes = filtered)
        }
    }

    fun selectRoute(routeId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isRouteDetailLoading = true, selectedDirectionIndex = 0) }
            val detail = repository.getRouteDetail(routeId)
            _uiState.update {
                it.copy(
                    isRouteDetailLoading = false,
                    selectedRouteDetail = detail
                )
            }
        }
    }

    fun clearSelectedRoute() {
        _uiState.update { it.copy(selectedRouteDetail = null, selectedStopForSheet = null) }
    }

    fun selectDirection(index: Int) {
        _uiState.update { it.copy(selectedDirectionIndex = index) }
    }

    fun selectStop(stop: TransitStop) {
        _uiState.update { it.copy(selectedStopForSheet = stop) }
    }

    fun dismissStopSheet() {
        _uiState.update { it.copy(selectedStopForSheet = null) }
    }

    fun updateUserLocation(lat: Double?, lon: Double?, isReal: Boolean) {
        _uiState.update { it.copy(userLat = lat, userLon = lon, isRealGps = isReal) }
    }
}
