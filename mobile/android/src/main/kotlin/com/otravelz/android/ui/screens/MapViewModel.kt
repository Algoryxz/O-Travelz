package com.otravelz.android.ui.screens

import android.annotation.SuppressLint
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.otravelz.android.BuildConfig
import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.domain.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class MapUiState(
    val productState: MapProductState = MapProductState.Loading,
    val layers: MapLayersState = MapLayersState(),
    val destinations: List<DiscoverPlace> = emptyList(),
    val verifiedStops: List<TransitStopMarker> = emptyList(),
    val candidateStops: List<TransitStopMarker> = emptyList(),
    val civicServices: List<CivicServiceMarker> = emptyList(),
    val selectedRoute: TransitRouteGeometry? = null,
    val selectedEntity: SelectedMapEntity = SelectedMapEntity.None,
    val locationStatus: LocationStatus = LocationStatus.Unknown,
    val searchQuery: String = "",
    val selectedDistrict: String? = null,
    val isListAlternativeVisible: Boolean = false,
    val cameraTarget: GeoCoordinate = GeoCoordinate.ODISHA_CENTER,
    val cameraZoom: Float = 7.2f
) {
    /**
     * Filtered destinations according to search query, selected district, and layers.
     */
    val visibleDestinations: List<DiscoverPlace>
        get() {
            if (!layers.showDestinations) return emptyList()
            var result = destinations
            if (selectedDistrict != null) {
                result = result.filter { it.normalizedDistrict.equals(selectedDistrict, ignoreCase = true) }
            }
            if (searchQuery.isNotBlank()) {
                val q = searchQuery.trim().lowercase()
                result = result.filter { place ->
                    place.name.lowercase().contains(q) ||
                    (place.odiaName?.lowercase()?.contains(q) == true) ||
                    place.category.lowercase().contains(q) ||
                    (place.district?.lowercase()?.contains(q) == true)
                }
            }
            return result
        }

    val visibleStops: List<TransitStopMarker>
        get() {
            val list = mutableListOf<TransitStopMarker>()
            if (layers.showVerifiedStops) {
                list.addAll(verifiedStops.filter { it.canRenderMarker })
            }
            if (layers.showCandidateStops) {
                list.addAll(candidateStops.filter { it.canRenderCandidateMarker })
            }
            return list
        }

    val visibleServices: List<CivicServiceMarker>
        get() = if (layers.showEssentials) civicServices else emptyList()
}

class MapViewModel : ViewModel() {

    private val apiService = ApiClient.createService()
    private val _uiState = MutableStateFlow(MapUiState())
    val uiState: StateFlow<MapUiState> = _uiState.asStateFlow()

    init {
        checkProviderAndLoadData()
    }

    fun checkProviderAndLoadData() {
        val key = BuildConfig.MAPS_API_KEY
        if (key.isBlank()) {
            _uiState.update {
                it.copy(
                    productState = MapProductState.ProviderUnavailable(
                        "Google Maps API key is unconfigured. Set MAPS_API_KEY in local.properties or environment."
                    )
                )
            }
        }
        loadDestinations()
    }

    fun loadDestinations() {
        viewModelScope.launch {
            try {
                val dtos = apiService.getPlaces(limit = 250)
                val places = dtos.map { it.toDiscoverPlace() }
                    .filter { it.isEligibleLeisure && it.hasCoordinates }
                _uiState.update { current ->
                    current.copy(
                        destinations = places,
                        productState = if (BuildConfig.MAPS_API_KEY.isBlank()) {
                            current.productState
                        } else {
                            MapProductState.Ready
                        }
                    )
                }
            } catch (e: Exception) {
                _uiState.update { current ->
                    if (current.destinations.isEmpty()) {
                        current.copy(productState = MapProductState.DataUnavailable(e.message ?: "Failed to load destinations"))
                    } else {
                        current
                    }
                }
            }
        }
    }

    fun toggleDestinationsLayer() {
        _uiState.update { it.copy(layers = it.layers.toggleDestinations()) }
    }

    fun toggleEssentialsLayer() {
        val nextLayers = _uiState.value.layers.toggleEssentials()
        _uiState.update { it.copy(layers = nextLayers) }
        if (nextLayers.showEssentials && _uiState.value.civicServices.isEmpty()) {
            loadNearbyServices(_uiState.value.cameraTarget.lat, _uiState.value.cameraTarget.lon)
        }
    }

    fun toggleVerifiedStopsLayer() {
        val next = !_uiState.value.layers.showVerifiedStops
        _uiState.update { it.copy(layers = it.layers.copy(showVerifiedStops = next)) }
        if (next && _uiState.value.verifiedStops.isEmpty()) {
            loadNearbyStops(_uiState.value.cameraTarget.lat, _uiState.value.cameraTarget.lon)
        }
    }

    fun toggleCandidateStopsLayer() {
        val next = !_uiState.value.layers.showCandidateStops
        _uiState.update { it.copy(layers = it.layers.copy(showCandidateStops = next)) }
    }

    fun selectEntity(entity: SelectedMapEntity) {
        _uiState.update { current ->
            when (entity) {
                is SelectedMapEntity.Destination -> {
                    val coord = GeoCoordinate.fromOrNull(entity.place.lat, entity.place.lon)
                    current.copy(
                        selectedEntity = entity,
                        cameraTarget = coord ?: current.cameraTarget,
                        cameraZoom = if (coord != null) 14.0f else current.cameraZoom
                    )
                }
                is SelectedMapEntity.TransitStop -> {
                    current.copy(
                        selectedEntity = entity,
                        cameraTarget = entity.stop.coordinate ?: current.cameraTarget,
                        cameraZoom = if (entity.stop.coordinate != null) 15.0f else current.cameraZoom
                    )
                }
                is SelectedMapEntity.CivicService -> {
                    current.copy(
                        selectedEntity = entity,
                        cameraTarget = entity.service.coordinate,
                        cameraZoom = 15.0f
                    )
                }
                is SelectedMapEntity.TransitRoute -> {
                    current.copy(
                        selectedEntity = entity,
                        selectedRoute = entity.route
                    )
                }
                SelectedMapEntity.None -> current.copy(selectedEntity = entity)
            }
        }
    }

    fun clearSelection() {
        _uiState.update { it.copy(selectedEntity = SelectedMapEntity.None) }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun onDistrictSelected(district: String?) {
        _uiState.update { it.copy(selectedDistrict = district) }
    }

    fun toggleListAlternative() {
        _uiState.update { it.copy(isListAlternativeVisible = !it.isListAlternativeVisible) }
    }

    fun loadNearbyServices(lat: Double, lon: Double) {
        if (!GeoCoordinate.isValid(lat, lon)) return
        viewModelScope.launch {
            try {
                val response = apiService.getNearbyServices(lat = lat, lon = lon, radiusKm = 25.0)
                val services = response.services.mapNotNull { CivicServiceMarker.fromDto(it) }
                _uiState.update { it.copy(civicServices = services) }
            } catch (_: Exception) {
                // Calm degradation; empty services list
            }
        }
    }

    fun loadNearbyStops(lat: Double, lon: Double) {
        if (!GeoCoordinate.isValid(lat, lon)) return
        viewModelScope.launch {
            try {
                val list = apiService.getNearbyStops(lat = lat, lon = lon, radiusMeters = 5000)
                val stops = list.map { TransitStopMarker.fromDto(it) }
                val verified = stops.filter { it.tier.isVerifiedPhysicalPole }
                val candidates = stops.filter { it.tier.isCandidate }
                _uiState.update { it.copy(verifiedStops = verified, candidateStops = candidates) }
            } catch (_: Exception) {
                // Calm degradation; empty stops list
            }
        }
    }

    fun onLocationPermissionDenied() {
        _uiState.update {
            it.copy(
                locationStatus = LocationStatus.PermissionDenied,
                layers = it.layers.copy(showUserLocation = false)
            )
        }
    }

    @SuppressLint("MissingPermission")
    fun requestUserLocation(context: Context) {
        try {
            val fusedClient = LocationServices.getFusedLocationProviderClient(context)
            fusedClient.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, null)
                .addOnSuccessListener { loc ->
                    if (loc != null && GeoCoordinate.isValid(loc.latitude, loc.longitude)) {
                        val live = LocationStatus.Live(loc.latitude, loc.longitude, loc.accuracy)
                        _uiState.update {
                            it.copy(
                                locationStatus = live,
                                layers = it.layers.copy(showUserLocation = true),
                                cameraTarget = GeoCoordinate(loc.latitude, loc.longitude),
                                cameraZoom = 13.5f
                            )
                        }
                    } else {
                        _uiState.update { it.copy(locationStatus = LocationStatus.LocationUnavailable) }
                    }
                }
                .addOnFailureListener {
                    _uiState.update { it.copy(locationStatus = LocationStatus.LocationUnavailable) }
                }
        } catch (_: SecurityException) {
            _uiState.update { it.copy(locationStatus = LocationStatus.PermissionDenied) }
        }
    }
}
