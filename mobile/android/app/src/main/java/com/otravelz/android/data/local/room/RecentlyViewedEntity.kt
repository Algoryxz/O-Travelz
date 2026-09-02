package com.otravelz.android.data.local.room

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.otravelz.android.data.model.PlaceDetailDto

@Entity(tableName = "recently_viewed")
data class RecentlyViewedEntity(
    @PrimaryKey
    val placeId: String,
    val name: String,
    val category: String,
    val district: String?,
    val imageUrl: String?,
    val viewedAt: Long = System.currentTimeMillis()
) {
    companion object {
        fun fromDto(dto: PlaceDetailDto, viewedAt: Long = System.currentTimeMillis()): RecentlyViewedEntity {
            return RecentlyViewedEntity(
                placeId = dto.id,
                name = dto.name,
                category = dto.category,
                district = dto.district,
                imageUrl = dto.images.firstOrNull()?.url,
                viewedAt = viewedAt
            )
        }
    }
}
