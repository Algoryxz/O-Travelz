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

/**
 * Repository managing saved/bookmarked destinations with DPDP-compliant local storage
 * and background cloud sync via /api/v1/sync/saved-places.
 */
class SavedPlacesRepository(
    private val context: Context,
    private val apiService: ApiService = NetworkClient.apiService
) {

    private val json = Json { ignoreUnknownKeys = true; isLenient = true }
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val _savedPlaceIds = MutableStateFlow<Set<String>>(emptySet())
    val savedPlaceIds: StateFlow<Set<String>> = _savedPlaceIds.asStateFlow()

    private val _savedPlaces = MutableStateFlow<List<PlaceDetailDto>>(emptyList())
    val savedPlaces: StateFlow<List<PlaceDetailDto>> = _savedPlaces.asStateFlow()

    init {
        loadFromLocalStorage()
    }

    private fun loadFromLocalStorage() {
        try {
            val rawJson = prefs.getString(KEY_SAVED_PLACES_JSON, null)
            if (!rawJson.isNullOrBlank()) {
                val list = json.decodeFromString<List<PlaceDetailDto>>(rawJson)
                _savedPlaces.value = list
                _savedPlaceIds.value = list.map { it.id }.toSet()
            } else {
                _savedPlaces.value = emptyList()
                _savedPlaceIds.value = emptySet()
            }
        } catch (e: Exception) {
            _savedPlaces.value = emptyList()
            _savedPlaceIds.value = emptySet()
        }
    }

    private fun persistToLocalStorage(list: List<PlaceDetailDto>) {
        try {
            val rawJson = json.encodeToString(list)
            prefs.edit().putString(KEY_SAVED_PLACES_JSON, rawJson).apply()
        } catch (_: Exception) {}
    }

    fun isSaved(placeId: String): Boolean {
        return _savedPlaceIds.value.contains(placeId)
    }

    /**
     * Toggles bookmark state for a destination.
     * Returns true if newly bookmarked, false if unbookmarked.
     */
    fun toggleSave(place: PlaceDetailDto): Boolean {
        val currentList = _savedPlaces.value.toMutableList()
        val existingIndex = currentList.indexOfFirst { it.id == place.id }

        val isNowSaved = if (existingIndex >= 0) {
            currentList.removeAt(existingIndex)
            false
        } else {
            currentList.add(0, place)
            true
        }

        _savedPlaces.value = currentList
        _savedPlaceIds.value = currentList.map { it.id }.toSet()
        persistToLocalStorage(currentList)

        return isNowSaved
    }

    /**
     * Synchronizes local saved places with the backend sync endpoint.
     */
    suspend fun syncWithServer(): NetworkResult<SyncSavedPlacesResponseDto> {
        val now = System.currentTimeMillis()
        val items = _savedPlaces.value.map { place ->
            SyncPlaceItemDto(
                placeId = place.id,
                placeName = place.name,
                savedAt = now,
                updatedAt = now,
                isDeleted = false
            )
        }

        val request = SyncSavedPlacesRequestDto(items = items)

        return try {
            val response = apiService.syncSavedPlaces(request)
            NetworkResult.Success(response)
        } catch (e: Exception) {
            NetworkResult.Error("Saved places synced locally (cloud sync offline)", cause = e)
        }
    }

    companion object {
        private const val PREFS_NAME = "otravelz_saved_places_storage"
        private const val KEY_SAVED_PLACES_JSON = "saved_places_json_v1"
    }
}
