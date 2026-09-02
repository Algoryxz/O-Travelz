package com.otravelz.android.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.otravelz.android.core.network.NetworkClient
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.local.room.AppDatabase
import com.otravelz.android.data.local.room.SavedPlaceEntity
import com.otravelz.android.data.local.room.SavedPlacesDao
import com.otravelz.android.data.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Repository managing saved/bookmarked destinations backed by Room Database
 * with auto-migration from legacy SharedPreferences and background sync via /api/v1/sync/saved-places.
 */
class SavedPlacesRepository(
    context: Context,
    private val apiService: ApiService = NetworkClient.apiService,
    private val dao: SavedPlacesDao = AppDatabase.getInstance(context).savedPlacesDao(),
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
) {

    private val json = Json { ignoreUnknownKeys = true; isLenient = true }
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val _savedPlaceIds = MutableStateFlow<Set<String>>(emptySet())
    val savedPlaceIds: StateFlow<Set<String>> = _savedPlaceIds.asStateFlow()

    private val _savedPlaces = MutableStateFlow<List<PlaceDetailDto>>(emptyList())
    val savedPlaces: StateFlow<List<PlaceDetailDto>> = _savedPlaces.asStateFlow()

    init {
        coroutineScope.launch {
            migrateFromPreferencesIfEmpty()
            dao.getAllPlacesFlow().collect { entities ->
                val dtos = entities.map { it.toDto(json) }
                _savedPlaces.value = dtos
                _savedPlaceIds.value = dtos.map { it.id }.toSet()
                // Keep SharedPreferences updated as secondary backup
                persistToLegacyBackup(dtos)
            }
        }
    }

    suspend fun migrateFromPreferencesIfEmpty() {
        try {
            val roomCount = dao.getCount()
            if (roomCount == 0) {
                val rawJson = prefs.getString(KEY_SAVED_PLACES_JSON, null)
                if (!rawJson.isNullOrBlank()) {
                    val list = json.decodeFromString<List<PlaceDetailDto>>(rawJson)
                    val entities = list.map { SavedPlaceEntity.fromDto(it, json = json) }
                    dao.insertPlaces(entities)
                }
            }
        } catch (_: Exception) {}
    }

    private fun persistToLegacyBackup(list: List<PlaceDetailDto>) {
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
        val currentlySaved = isSaved(place.id)
        coroutineScope.launch {
            if (currentlySaved) {
                dao.deletePlace(place.id)
            } else {
                dao.insertPlace(SavedPlaceEntity.fromDto(place, json = json))
            }
        }
        return !currentlySaved
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
        const val PREFS_NAME = "otravelz_saved_places_storage"
        const val KEY_SAVED_PLACES_JSON = "saved_places_json_v1"
    }
}
