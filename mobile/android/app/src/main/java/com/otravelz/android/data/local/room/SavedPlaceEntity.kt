package com.otravelz.android.data.local.room

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.PlaceImageDto
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Entity(tableName = "saved_places")
data class SavedPlaceEntity(
    @PrimaryKey val id: String,
    val name: String,
    val category: String,
    val description: String? = null,
    val lat: Double? = null,
    val lon: Double? = null,
    val district: String? = null,
    val region: String? = null,
    val rating: Double? = null,
    val imagesJson: String = "[]",
    val interestsJson: String = "[]",
    val savedAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val isDeleted: Boolean = false
) {
    fun toDto(json: Json = defaultJson): PlaceDetailDto {
        val images: List<PlaceImageDto> = try {
            json.decodeFromString(imagesJson)
        } catch (_: Exception) {
            emptyList()
        }
        val interests: List<String> = try {
            json.decodeFromString(interestsJson)
        } catch (_: Exception) {
            emptyList()
        }
        return PlaceDetailDto(
            id = id,
            name = name,
            category = category,
            description = description,
            lat = lat,
            lon = lon,
            district = district,
            region = region,
            rating = rating,
            images = images,
            interests = interests
        )
    }

    companion object {
        private val defaultJson = Json { ignoreUnknownKeys = true; isLenient = true }

        fun fromDto(
            dto: PlaceDetailDto,
            savedAt: Long = System.currentTimeMillis(),
            json: Json = defaultJson
        ): SavedPlaceEntity {
            return SavedPlaceEntity(
                id = dto.id,
                name = dto.name,
                category = dto.category,
                description = dto.description,
                lat = dto.lat,
                lon = dto.lon,
                district = dto.district,
                region = dto.region,
                rating = dto.rating,
                imagesJson = json.encodeToString(dto.images),
                interestsJson = json.encodeToString(dto.interests),
                savedAt = savedAt,
                updatedAt = System.currentTimeMillis(),
                isDeleted = false
            )
        }
    }
}
