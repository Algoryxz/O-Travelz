package com.otravelz.android

import com.otravelz.android.data.model.ItineraryPlanResponseDto
import com.otravelz.android.data.model.PlanningConstraintsDto
import com.otravelz.android.data.model.SyncTripItemDto
import org.junit.Assert.*
import org.junit.Test

class SavedTripsLogicTest {

    @Test
    fun testDuplicateTripSimulation() {
        val original = SyncTripItemDto(
            id = "trip_123",
            title = "Bhubaneswar Heritage Odyssey",
            timestamp = 1700000000000L,
            updatedAt = 1700000000000L,
            itinerary = ItineraryPlanResponseDto(
                itineraryId = "itin_123",
                constraints = PlanningConstraintsDto(days = 2),
                days = emptyList(),
                explanation = "Sample"
            )
        )

        val duplicated = SyncTripItemDto(
            id = "trip_456",
            title = "${original.title} (Copy)",
            timestamp = 1700000005000L,
            updatedAt = 1700000005000L,
            itinerary = original.itinerary,
            constraints = original.constraints
        )

        assertEquals("Bhubaneswar Heritage Odyssey (Copy)", duplicated.title)
        assertNotEquals(original.id, duplicated.id)
        assertEquals(original.itinerary?.itineraryId, duplicated.itinerary?.itineraryId)
        assertEquals(2, duplicated.itinerary?.constraints?.days)
    }
}
