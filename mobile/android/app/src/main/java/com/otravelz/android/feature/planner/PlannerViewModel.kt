package com.otravelz.android.feature.planner

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.model.*
import com.otravelz.android.data.repository.PlannerRepository
import com.otravelz.android.data.repository.SavedTripsRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class PlannerTab {
    CREATE_PLAN,
    SAVED_TRIPS
}

data class PlannerUiState(
    val activeTab: PlannerTab = PlannerTab.CREATE_PLAN,
    val isLoading: Boolean = false,
    val isSharing: Boolean = false,
    val itinerary: ItineraryPlanResponseDto? = null,
    val prompt: String = "Plan a culturally rich trip with temples, heritage, and Mo Bus connectivity",
    val durationDays: Int = 1,
    val selectedOriginName: String = "Bhubaneswar",
    val originLat: Double = 20.2961,
    val originLon: Double = 85.8245,
    val selectedCategories: Set<String> = setOf("temple", "monument", "market"),
    val savedTrips: List<SyncTripItemDto> = emptyList(),
    val sharedTripUrl: String? = null,
    val savedConfirmation: String? = null,
    val errorMessage: String? = null
)

class PlannerViewModel(
    application: Application,
    private val plannerRepository: PlannerRepository = PlannerRepository(),
    private val savedTripsRepository: SavedTripsRepository? = null
) : AndroidViewModel(application) {

    constructor(application: Application) : this(
        application,
        PlannerRepository(),
        try { SavedTripsRepository(application) } catch (_: Exception) { null }
    )

    private val _uiState = MutableStateFlow(PlannerUiState())
    val uiState: StateFlow<PlannerUiState> = _uiState.asStateFlow()

    init {
        savedTripsRepository?.let { repo ->
            viewModelScope.launch {
                repo.savedTrips.collect { trips ->
                    _uiState.update { it.copy(savedTrips = trips) }
                }
            }
        }
    }

    fun setActiveTab(tab: PlannerTab) {
        _uiState.update { it.copy(activeTab = tab) }
    }

    fun updatePrompt(text: String) {
        _uiState.update { it.copy(prompt = text) }
    }

    fun setDurationDays(days: Int) {
        _uiState.update { it.copy(durationDays = days) }
    }

    fun setOrigin(name: String, lat: Double, lon: Double) {
        _uiState.update {
            it.copy(
                selectedOriginName = name,
                originLat = lat,
                originLon = lon
            )
        }
    }

    fun toggleCategory(category: String) {
        val current = _uiState.value.selectedCategories.toMutableSet()
        if (current.contains(category)) {
            if (current.size > 1) { // Keep at least one category
                current.remove(category)
            }
        } else {
            current.add(category)
        }
        _uiState.update { it.copy(selectedCategories = current) }
    }

    fun generatePlan() {
        viewModelScope.launch {
            val state = _uiState.value
            _uiState.update { it.copy(isLoading = true, errorMessage = null, savedConfirmation = null) }

            val constraints = PlanningConstraintsDto(
                days = state.durationDays,
                interests = state.selectedCategories.toList(),
                start = state.selectedOriginName,
                publicTransportPreferred = true
            )

            when (val res = plannerRepository.planItinerary(constraints)) {
                is NetworkResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            itinerary = res.data,
                            errorMessage = null
                        )
                    }
                }
                is NetworkResult.Error -> {
                    // AI Fallback when deterministic planner returns error
                    val aiRes = plannerRepository.planWithAi(
                        message = state.prompt,
                        constraints = constraints
                    )
                    if (aiRes is NetworkResult.Success && aiRes.data.itinerary != null) {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                itinerary = aiRes.data.itinerary,
                                errorMessage = null
                            )
                        }
                    } else {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = res.message
                            )
                        }
                    }
                }
                else -> {}
            }
        }
    }

    fun saveCurrentPlan() {
        val itinerary = _uiState.value.itinerary ?: return
        val title = "${_uiState.value.selectedOriginName} ${_uiState.value.durationDays}-Day Cultural Journey"
        val constraints = PlanningConstraintsDto(
            days = _uiState.value.durationDays,
            interests = _uiState.value.selectedCategories.toList(),
            start = _uiState.value.selectedOriginName,
            publicTransportPreferred = true
        )
        savedTripsRepository?.saveTrip(title = title, itinerary = itinerary, constraints = constraints)
        _uiState.update { it.copy(savedConfirmation = "Itinerary saved to My Saved Trips!") }

        viewModelScope.launch {
            savedTripsRepository?.syncWithServer()
        }
    }

    fun loadSavedPlan(trip: SyncTripItemDto) {
        if (trip.itinerary != null) {
            _uiState.update {
                it.copy(
                    itinerary = trip.itinerary,
                    activeTab = PlannerTab.CREATE_PLAN,
                    savedConfirmation = "Loaded saved plan: ${trip.title}"
                )
            }
        }
    }

    fun deleteSavedPlan(tripId: String) {
        savedTripsRepository?.deleteTrip(tripId)
        viewModelScope.launch {
            savedTripsRepository?.syncWithServer()
        }
    }

    fun shareCurrentPlan() {
        val itinerary = _uiState.value.itinerary ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isSharing = true) }
            val title = "${_uiState.value.selectedOriginName} ${_uiState.value.durationDays}-Day Trip"
            when (val res = plannerRepository.shareTrip(
                title = title,
                itinerary = itinerary
            )) {
                is NetworkResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isSharing = false,
                            sharedTripUrl = res.data.shareUrl
                        )
                    }
                }
                is NetworkResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isSharing = false,
                            errorMessage = res.message
                        )
                    }
                }
                else -> {}
            }
        }
    }

    fun clearShareUrl() {
        _uiState.update { it.copy(sharedTripUrl = null) }
    }
}
