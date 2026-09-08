package com.otravelz.android.ui.screens

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.data.local.entity.SavedPlaceEntity
import com.otravelz.android.data.local.entity.TripProgressEntity
import com.otravelz.android.data.local.model.SavedTripWithStops
import com.otravelz.android.data.repository.PersistenceRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * ViewModel managing user-persisted trips, saved places, and active trip execution (Wave M14).
 */
class TripsViewModel(
    application: Application
) : AndroidViewModel(application) {

    private val persistenceRepo = PersistenceRepository.getInstance(application)

    val activeTripState: StateFlow<Pair<SavedTripWithStops, TripProgressEntity>?> =
        persistenceRepo.observeActiveTrip()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val savedTripsState: StateFlow<List<SavedTripWithStops>> =
        persistenceRepo.observeSavedTrips()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val savedPlacesState: StateFlow<List<SavedPlaceEntity>> =
        persistenceRepo.observeSavedPlaces()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun startTrip(tripId: String) {
        viewModelScope.launch {
            persistenceRepo.startTrip(tripId)
        }
    }

    fun markStopVisited(tripId: String, canonicalPlaceId: String) {
        viewModelScope.launch {
            persistenceRepo.markStopVisited(tripId, canonicalPlaceId)
        }
    }

    fun skipStop(tripId: String, canonicalPlaceId: String) {
        viewModelScope.launch {
            persistenceRepo.skipStop(tripId, canonicalPlaceId)
        }
    }

    fun endActiveTrip(tripId: String) {
        viewModelScope.launch {
            persistenceRepo.endActiveTrip(tripId)
        }
    }

    fun deleteTrip(tripId: String) {
        viewModelScope.launch {
            persistenceRepo.deleteTrip(tripId)
        }
    }

    fun unsavePlace(canonicalPlaceId: String) {
        viewModelScope.launch {
            persistenceRepo.unsavePlace(canonicalPlaceId)
        }
    }
}
