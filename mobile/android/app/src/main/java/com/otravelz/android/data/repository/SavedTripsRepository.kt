package com.otravelz.android.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.otravelz.android.core.network.NetworkClient
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.local.room.AppDatabase
import com.otravelz.android.data.local.room.SavedTripEntity
import com.otravelz.android.data.local.room.SavedTripsDao
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
import java.util.UUID

/**
 * Repository managing saved travel itineraries backed by Room Database
 * with auto-migration from legacy SharedPreferences and background sync via /api/v1/sync/trips.
 */
class SavedTripsRepository(
    context: Context,
    private val apiService: ApiService = NetworkClient.apiService,
    private val dao: SavedTripsDao = AppDatabase.getInstance(context).savedTripsDao(),
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
) {

    private val json = Json { ignoreUnknownKeys = true; isLenient = true }
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val _savedTrips = MutableStateFlow<List<SyncTripItemDto>>(emptyList())
    val savedTrips: StateFlow<List<SyncTripItemDto>> = _savedTrips.asStateFlow()

    init {
        coroutineScope.launch {
            migrateFromPreferencesIfEmpty()
            dao.getAllTripsFlow().collect { entities ->
                val dtos = entities.map { it.toDto(json) }
                _savedTrips.value = dtos
                // Keep SharedPreferences updated as secondary backup
                persistToLegacyBackup(dtos)
            }
        }
    }

    suspend fun migrateFromPreferencesIfEmpty() {
        try {
            val roomCount = dao.getCount()
            if (roomCount == 0) {
                val rawJson = prefs.getString(KEY_SAVED_TRIPS_JSON, null)
                if (!rawJson.isNullOrBlank()) {
                    val list = json.decodeFromString<List<SyncTripItemDto>>(rawJson)
                    val entities = list.map { SavedTripEntity.fromDto(it, json = json) }
                    dao.insertTrips(entities)
                }
            }
        } catch (_: Exception) {}
    }

    private fun persistToLegacyBackup(list: List<SyncTripItemDto>) {
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

        coroutineScope.launch {
            dao.insertTrip(SavedTripEntity.fromDto(item, json = json))
        }

        return item
    }

    /**
     * Removes a saved trip locally.
     */
    fun deleteTrip(tripId: String) {
        coroutineScope.launch {
            dao.deleteTrip(tripId)
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
        const val PREFS_NAME = "otravelz_saved_trips_storage"
        const val KEY_SAVED_TRIPS_JSON = "saved_trips_json_v1"
    }
}
