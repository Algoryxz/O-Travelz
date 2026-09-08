package com.otravelz.android.data.repository

import android.content.Context
import com.otravelz.android.data.local.OTravelzDatabase
import com.otravelz.android.data.local.entity.SavedPlaceEntity
import com.otravelz.android.data.local.entity.SavedTripEntity
import com.otravelz.android.data.local.entity.SavedTripStopEntity
import com.otravelz.android.data.local.entity.TripProgressEntity
import com.otravelz.android.data.local.model.SavedTripWithStops
import com.otravelz.android.domain.model.PlanResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import java.util.UUID

/**
 * Single, cohesive repository coordinating Room SQLite user persistence (Wave M14).
 * Truth boundary: User persistence strictly references canonical entities without mutating them.
 */
class PersistenceRepository(
    private val database: OTravelzDatabase
) {
    private val savedPlaceDao = database.savedPlaceDao()
    private val savedTripDao = database.savedTripDao()
    private val tripProgressDao = database.tripProgressDao()

    companion object {
        @Volatile
        private var INSTANCE: PersistenceRepository? = null

        fun getInstance(context: Context): PersistenceRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: PersistenceRepository(
                    OTravelzDatabase.getInstance(context)
                ).also { INSTANCE = it }
            }
        }
    }

    // ==========================================
    // 1. SAVED PLACES (BOOKMARKS)
    // ==========================================

    fun observeSavedPlaces(): Flow<List<SavedPlaceEntity>> {
        return savedPlaceDao.observeAll().flowOn(Dispatchers.IO)
    }

    suspend fun getSavedPlaces(): List<SavedPlaceEntity> = withContext(Dispatchers.IO) {
        savedPlaceDao.getAll()
    }

    fun isPlaceSaved(placeId: String): Flow<Boolean> {
        return savedPlaceDao.isPlaceSaved(placeId).flowOn(Dispatchers.IO)
    }

    suspend fun checkIsPlaceSaved(placeId: String): Boolean = withContext(Dispatchers.IO) {
        savedPlaceDao.checkIsPlaceSaved(placeId)
    }

    suspend fun savePlace(
        canonicalPlaceId: String,
        placeName: String,
        category: String,
        district: String? = null,
        imageUrl: String? = null,
        rating: Double? = null
    ) = withContext(Dispatchers.IO) {
        val entity = SavedPlaceEntity(
            canonicalPlaceId = canonicalPlaceId,
            savedAt = System.currentTimeMillis(),
            placeName = placeName,
            category = category,
            district = district,
            imageUrl = imageUrl,
            rating = rating
        )
        savedPlaceDao.insert(entity)
    }

    suspend fun unsavePlace(canonicalPlaceId: String) = withContext(Dispatchers.IO) {
        savedPlaceDao.deleteByPlaceId(canonicalPlaceId)
    }

    // ==========================================
    // 2. SAVED TRIPS (ITINERARIES)
    // ==========================================

    fun observeSavedTrips(): Flow<List<SavedTripWithStops>> {
        return savedTripDao.observeAllTripsWithStops().flowOn(Dispatchers.IO)
    }

    suspend fun getAllSavedTrips(): List<SavedTripWithStops> = withContext(Dispatchers.IO) {
        savedTripDao.getAllTripsWithStops()
    }

    suspend fun getTrip(tripId: String): SavedTripWithStops? = withContext(Dispatchers.IO) {
        savedTripDao.getTripWithStops(tripId)
    }

    fun observeTrip(tripId: String): Flow<SavedTripWithStops?> {
        return savedTripDao.observeTripWithStops(tripId).flowOn(Dispatchers.IO)
    }

    /**
     * Persists a validated PlanResult as an immutable snapshot in Room.
     * Idempotent: Uses tripId (or generates a deterministic or UUID identity).
     */
    suspend fun savePlanResult(
        plan: PlanResult,
        customTitle: String? = null
    ): String = withContext(Dispatchers.IO) {
        val tripId = if (plan.itineraryId.isNotBlank() && !plan.itineraryId.startsWith("itin-local-")) {
            plan.itineraryId
        } else {
            UUID.randomUUID().toString()
        }

        val title = customTitle ?: "${plan.constraints.days}-Day ${plan.constraints.startHub ?: "Odisha"} Itinerary"

        val constraintsJson = buildString {
            append("{")
            append("\"days\":${plan.constraints.days},")
            append("\"pace\":\"${plan.constraints.pace.name}\",")
            append("\"startHub\":${plan.constraints.startHub?.let { "\"$it\"" } ?: "null"},")
            append("\"lowWalking\":${plan.constraints.lowWalking},")
            append("\"publicTransportPreferred\":${plan.constraints.publicTransportPreferred},")
            append("\"budgetConscious\":${plan.constraints.budgetConscious},")
            val interestsJoined = plan.constraints.interests.joinToString(",") { "\"$it\"" }
            append("\"interests\":[$interestsJoined]")
            append("}")
        }

        val tripEntity = SavedTripEntity(
            tripId = tripId,
            title = title,
            daysCount = plan.constraints.days,
            startHub = plan.constraints.startHub,
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis(),
            constraintsJson = constraintsJson,
            aiExplanation = plan.aiCompanionMessage,
            schemaVersion = 1
        )

        val stopEntities = mutableListOf<SavedTripStopEntity>()
        plan.days.forEach { day ->
            day.stops.forEachIndexed { index, stop ->
                val associatedHop = day.hops.getOrNull(index)
                stopEntities.add(
                    SavedTripStopEntity(
                        stopId = UUID.randomUUID().toString(),
                        tripId = tripId,
                        dayNumber = day.dayNumber,
                        stopSequence = stop.sequence,
                        canonicalPlaceId = stop.placeId,
                        placeName = stop.placeName,
                        category = stop.category,
                        plannedArrival = stop.plannedArrival,
                        plannedDeparture = stop.plannedDeparture,
                        hopMode = associatedHop?.mode,
                        hopMinutes = associatedHop?.estimatedMinutes,
                        hopDetail = associatedHop?.legDetail,
                        hopFare = null // Strictly null
                    )
                )
            }
        }

        savedTripDao.saveTripWithStops(tripEntity, stopEntities)
        tripId
    }

    suspend fun deleteTrip(tripId: String): Int = withContext(Dispatchers.IO) {
        savedTripDao.deleteTrip(tripId)
    }

    // ==========================================
    // 3. ACTIVE TRIP EXECUTION & PROGRESS
    // ==========================================

    /**
     * Observes the currently active trip alongside its progress state.
     */
    fun observeActiveTrip(): Flow<Pair<SavedTripWithStops, TripProgressEntity>?> {
        return combine(
            savedTripDao.observeAllTripsWithStops(),
            tripProgressDao.observeActiveProgress()
        ) { trips, progress ->
            if (progress == null || !progress.isActive) null
            else {
                val matchingTrip = trips.firstOrNull { it.trip.tripId == progress.tripId }
                if (matchingTrip != null) matchingTrip to progress else null
            }
        }.flowOn(Dispatchers.IO)
    }

    suspend fun startTrip(tripId: String) = withContext(Dispatchers.IO) {
        tripProgressDao.setActiveTrip(tripId)
    }

    suspend fun markStopVisited(
        tripId: String,
        canonicalPlaceId: String
    ) = withContext(Dispatchers.IO) {
        val current = tripProgressDao.getProgressForTrip(tripId) ?: return@withContext
        val visited = parseJsonList(current.completedStopIdsJson).toMutableList()
        val skipped = parseJsonList(current.skippedStopIdsJson).toMutableList()

        if (!visited.contains(canonicalPlaceId)) {
            visited.add(canonicalPlaceId)
        }
        skipped.remove(canonicalPlaceId)

        val updated = current.copy(
            completedStopIdsJson = toJsonList(visited),
            skippedStopIdsJson = toJsonList(skipped),
            currentMilestoneIndex = current.currentMilestoneIndex + 1,
            lastUpdatedAt = System.currentTimeMillis()
        )
        tripProgressDao.upsertProgress(updated)
    }

    suspend fun skipStop(
        tripId: String,
        canonicalPlaceId: String
    ) = withContext(Dispatchers.IO) {
        val current = tripProgressDao.getProgressForTrip(tripId) ?: return@withContext
        val visited = parseJsonList(current.completedStopIdsJson).toMutableList()
        val skipped = parseJsonList(current.skippedStopIdsJson).toMutableList()

        if (!skipped.contains(canonicalPlaceId)) {
            skipped.add(canonicalPlaceId)
        }
        visited.remove(canonicalPlaceId)

        val updated = current.copy(
            completedStopIdsJson = toJsonList(visited),
            skippedStopIdsJson = toJsonList(skipped),
            currentMilestoneIndex = current.currentMilestoneIndex + 1,
            lastUpdatedAt = System.currentTimeMillis()
        )
        tripProgressDao.upsertProgress(updated)
    }

    suspend fun setActiveDay(tripId: String, dayNumber: Int) = withContext(Dispatchers.IO) {
        val current = tripProgressDao.getProgressForTrip(tripId) ?: return@withContext
        val updated = current.copy(
            activeDay = dayNumber,
            currentMilestoneIndex = 0,
            lastUpdatedAt = System.currentTimeMillis()
        )
        tripProgressDao.upsertProgress(updated)
    }

    suspend fun endActiveTrip(tripId: String) = withContext(Dispatchers.IO) {
        val current = tripProgressDao.getProgressForTrip(tripId) ?: return@withContext
        val updated = current.copy(
            isActive = false,
            completionState = "COMPLETED",
            lastUpdatedAt = System.currentTimeMillis()
        )
        tripProgressDao.upsertProgress(updated)
    }

    suspend fun cancelActiveTrip(tripId: String) = withContext(Dispatchers.IO) {
        val current = tripProgressDao.getProgressForTrip(tripId) ?: return@withContext
        val updated = current.copy(
            isActive = false,
            completionState = "CANCELLED",
            lastUpdatedAt = System.currentTimeMillis()
        )
        tripProgressDao.upsertProgress(updated)
    }

    // ==========================================
    // JSON LIST SERIALIZATION HELPERS
    // ==========================================

    private fun parseJsonList(json: String): List<String> {
        val trimmed = json.trim()
        if (trimmed.length <= 2) return emptyList()
        val inner = trimmed.substring(1, trimmed.length - 1)
        if (inner.isBlank()) return emptyList()
        return inner.split(",").map {
            it.trim().trim('\"')
        }.filter { it.isNotBlank() }
    }

    private fun toJsonList(list: List<String>): String {
        return "[${list.joinToString(",") { "\"$it\"" }}]"
    }
}
