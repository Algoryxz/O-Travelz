package com.otravelz.android.data.local.room

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.otravelz.android.data.model.ItineraryPlanResponseDto
import com.otravelz.android.data.model.PlanningConstraintsDto
import com.otravelz.android.data.model.SyncTripItemDto
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Entity(tableName = "saved_trips")
data class SavedTripEntity(
    @PrimaryKey val id: String,
    val title: String,
    val timestamp: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val isDeleted: Boolean = false,
    val itineraryJson: String = "",
    val constraintsJson: String? = null
) {
    fun toDto(json: Json = defaultJson): SyncTripItemDto {
        val itinerary: ItineraryPlanResponseDto? = try {
            if (itineraryJson.isNotBlank()) json.decodeFromString(itineraryJson) else null
        } catch (_: Exception) {
            null
        }
        val constraints: PlanningConstraintsDto? = try {
            constraintsJson?.let { json.decodeFromString(it) }
        } catch (_: Exception) {
            null
        }
        return SyncTripItemDto(
            id = id,
            title = title,
            timestamp = timestamp,
            updatedAt = updatedAt,
            isDeleted = isDeleted,
            itinerary = itinerary,
            constraints = constraints
        )
    }

    companion object {
        private val defaultJson = Json { ignoreUnknownKeys = true; isLenient = true }

        fun fromDto(
            dto: SyncTripItemDto,
            json: Json = defaultJson
        ): SavedTripEntity {
            return SavedTripEntity(
                id = dto.id,
                title = dto.title,
                timestamp = dto.timestamp,
                updatedAt = dto.updatedAt,
                isDeleted = dto.isDeleted,
                itineraryJson = dto.itinerary?.let { json.encodeToString(it) } ?: "",
                constraintsJson = dto.constraints?.let { json.encodeToString(it) }
            )
        }
    }
}
