package com.otravelz.android

import com.otravelz.android.data.local.room.RecentlyViewedEntity
import com.otravelz.android.data.model.PlaceDetailDto
import org.junit.Assert.*
import org.junit.Test

class RecentHistoryLogicTest {

    @Test
    fun testRecentlyViewedEntity_fromDtoConversion() {
        val dto = PlaceDetailDto(
            id = "dhauli_stupa",
            name = "Dhauli Shanti Stupa",
            category = "heritage",
            district = "Khordha"
        )

        val entity = RecentlyViewedEntity.fromDto(dto, viewedAt = 1700000000000L)
        assertEquals("dhauli_stupa", entity.placeId)
        assertEquals("Dhauli Shanti Stupa", entity.name)
        assertEquals("heritage", entity.category)
        assertEquals("Khordha", entity.district)
        assertEquals(1700000000000L, entity.viewedAt)
    }

    @Test
    fun testCapacityTrimming_simulatedList() {
        val list = (1..30).map {
            RecentlyViewedEntity(
                placeId = "place_$it",
                name = "Place $it",
                category = "temple",
                district = "Puri",
                imageUrl = null,
                viewedAt = it.toLong()
            )
        }

        // Simulating trim to max 20
        val sortedAndTrimmed = list.sortedByDescending { it.viewedAt }.take(20)
        assertEquals(20, sortedAndTrimmed.size)
        assertEquals("place_30", sortedAndTrimmed.first().placeId)
        assertEquals("place_11", sortedAndTrimmed.last().placeId)
    }
}
