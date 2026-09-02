package com.otravelz.android.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.otravelz.android.core.network.NetworkClient
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

/**
 * Repository managing saved travel itineraries with private local storage
 * and background cloud sync via /api/v1/sync/trips.
 */
class SavedTripsRepository(
    private val context: Context,
    private val apiService: ApiService = NetworkClient.apiService
) {

    private val json = Json { ignoreUnknownKeys = true; isLenient = true }
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val _savedTrips = MutableStateFlow<List<SyncTripItemDto>>(emptyList())
    val savedTrips: StateFlow<List<SyncTripItemDto>> = _savedTrips.asStateFlow()

    init {
        loadFromLocalStorage()
    }

    private fun loadFromLocalStorage() {
        try {
            val rawJson = prefs.getString(KEY_SAVED_TRIPS_JSON, null)
            if (!rawJson.isNullOrBlank()) {
                val list = json.decodeFromString<List<SyncTripItemDto>>(rawJson)
                _savedTrips.value = list.filter { !it.isDeleted }
            } else {
                _savedTrips.value = emptyList()
            }
        } catch (e: Exception) {
            _savedTrips.value = emptyList()
        }
    }

    private fun persistToLocalStorage(list: List<SyncTripItemDto>) {
        try {
            val rawJson = json.encodeToString(list)
            prefs.edit().putString(KEY_SAVED_TRIPS_JSON, rawJson).apply()
        } catch (_: Exception) {}
    }

    /**
     * Saves a generated itinerary locally.
     */
    fun saveTrip(
        title: String,
        itinerary: ItineraryPlanResponseDto,
        constraints: PlanningConstraintsDto? = null
    ): SyncTripItemDto {
        val now = System.currentTimeMillis()
        val tripId = "trip_" + UUID.randomUUID().toString().take(8)

        val item = SyncTripItemDto(
            id = tripId,
            title = title,
            timestamp = now,
            updatedAt = now,
            isDeleted = false,
            itinerary = itinerary,
            constraints = constraints
        )

        val currentList = _savedTrips.value.toMutableList()
        currentList.add(0, item)
        _savedTrips.value = currentList
        persistToLocalStorage(currentList)

        return item
    }

    /**
     * Removes a saved trip locally.
     */
    fun deleteTrip(tripId: String) {
        val currentList = _savedTrips.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == tripId }
        if (index >= 0) {
            currentList.removeAt(index)
            _savedTrips.value = currentList
            persistToLocalStorage(currentList)
        }
    }

    /**
     * Synchronizes local saved trips with the backend sync endpoint.
     */
    suspend fun syncWithServer(): NetworkResult<SyncTripsResponseDto> {
        val request = SyncTripsRequestDto(items = _savedTrips.value)
        return try {
            val response = apiService.syncSavedTrips(request)
            NetworkResult.Success(response)
        } catch (e: Exception) {
            NetworkResult.Error("Saved trips stored locally (cloud sync offline)", cause = e)
        }
    }

    companion object {
        private const val PREFS_NAME = "otravelz_saved_trips_storage"
        private const val KEY_SAVED_TRIPS_JSON = "saved_trips_json_v1"
    }
}
