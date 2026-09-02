package com.otravelz.android

import com.otravelz.android.data.local.room.SavedTripEntity
import com.otravelz.android.data.model.ItineraryDayDto
import com.otravelz.android.data.model.ItineraryPlanResponseDto
import com.otravelz.android.data.model.PlanningConstraintsDto
import com.otravelz.android.data.model.SyncTripItemDto
import kotlinx.serialization.json.Json
import org.junit.Assert.*
import org.junit.Test

class SavedTripsRoomMigrationTest {

    private val json = Json { ignoreUnknownKeys = true; isLenient = true }

    @Test
    fun testSavedTripEntity_toDtoAndFromDto_roundTripParity() {
        val plan = ItineraryPlanResponseDto(
            itineraryId = "plan_123",
            constraints = PlanningConstraintsDto(
                days = 2,
                interests = listOf("heritage", "temple"),
                start = "Bhubaneswar",
                pace = "moderate",
                budgetConscious = true
            ),
            days = listOf(
                ItineraryDayDto(
                    dayNumber = 1,
                    date = "2026-09-02",
                    theme = "Old Town Temples",
                    stops = emptyList(),
                    hops = emptyList()
                )
            ),
            explanation = "Bhubaneswar Heritage Odyssey"
        )

        val tripDto = SyncTripItemDto(
            id = "trip_abcd1234",
            title = "Bhubaneswar Heritage Odyssey",
            timestamp = 1700000000000L,
            updatedAt = 1700000000000L,
            isDeleted = false,
            itinerary = plan,
            constraints = null
        )

        val entity = SavedTripEntity.fromDto(tripDto, json = json)
        assertEquals("trip_abcd1234", entity.id)
        assertEquals("Bhubaneswar Heritage Odyssey", entity.title)
        assertEquals(1700000000000L, entity.timestamp)
        assertFalse(entity.isDeleted)

        val restoredDto = entity.toDto(json)
        assertEquals(tripDto.id, restoredDto.id)
        assertEquals(tripDto.title, restoredDto.title)
        assertEquals(tripDto.timestamp, restoredDto.timestamp)
        assertNotNull(restoredDto.itinerary)
        assertEquals("plan_123", restoredDto.itinerary?.itineraryId)
        assertEquals(1, restoredDto.itinerary?.days?.size)
        assertEquals("moderate", restoredDto.itinerary?.constraints?.pace)
    }

    @Test
    fun testSavedTripEntity_legacyJsonMigrationSimulation() {
        val legacyJson = """
            [
                {
                    "id": "trip_001",
                    "title": "Golden Triangle Tour",
                    "timestamp": 1690000000000,
                    "updated_at": 1690000000000,
                    "is_deleted": false
                }
            ]
        """.trimIndent()

        val legacyList = json.decodeFromString<List<SyncTripItemDto>>(legacyJson)
        assertEquals(1, legacyList.size)

        val entity = SavedTripEntity.fromDto(legacyList[0], json = json)
        assertEquals("trip_001", entity.id)
        assertEquals("Golden Triangle Tour", entity.title)

        val restored = entity.toDto(json)
        assertEquals("Golden Triangle Tour", restored.title)
        assertFalse(restored.isDeleted)
    }
}
