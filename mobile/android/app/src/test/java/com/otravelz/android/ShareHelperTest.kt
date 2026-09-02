package com.otravelz.android

import com.otravelz.android.core.util.ShareHelper
import com.otravelz.android.data.model.ItineraryDayDto
import com.otravelz.android.data.model.ItineraryPlanResponseDto
import com.otravelz.android.data.model.ItineraryStopDto
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.PlaceSummaryDto
import com.otravelz.android.data.model.PlanningConstraintsDto
import com.otravelz.android.data.model.SyncTripItemDto
import org.junit.Assert.*
import org.junit.Test

class ShareHelperTest {

    @Test
    fun testBuildPlaceShareText_containsAllRequiredFields() {
        val place = PlaceDetailDto(
            id = "konark_sun_temple",
            name = "Konark Sun Temple",
            category = "temple",
            district = "Puri",
            description = "UNESCO World Heritage 13th-century Sun Temple.",
            rating = 4.8
        )

        val text = ShareHelper.buildPlaceShareText(place)
        assertTrue(text.contains("Konark Sun Temple"))
        assertTrue(text.contains("(Puri)"))
        assertTrue(text.contains("[TEMPLE]"))
        assertTrue(text.contains("4.8★"))
        assertTrue(text.contains("otravelz://place/konark_sun_temple"))
        assertTrue(text.contains("Verified Odisha Destination Record"))
    }

    @Test
    fun testBuildTripShareText_containsStopsAndTransitDisclaimer() {
        val trip = SyncTripItemDto(
            id = "golden_triangle",
            title = "Golden Triangle of Odisha",
            timestamp = 1700000000000L,
            updatedAt = 1700000000000L,
            itinerary = ItineraryPlanResponseDto(
                itineraryId = "it_1",
                constraints = PlanningConstraintsDto(),
                days = listOf(
                    ItineraryDayDto(
                        dayNumber = 1,
                        stops = listOf(
                            ItineraryStopDto(
                                sequence = 1,
                                place = PlaceSummaryDto(id = "p1", name = "Lingaraj Temple", category = "temple")
                            ),
                            ItineraryStopDto(
                                sequence = 2,
                                place = PlaceSummaryDto(id = "p2", name = "Dhauli Shanti Stupa", category = "heritage")
                            )
                        )
                    )
                ),
                explanation = "Classic heritage circuit"
            )
        )

        val text = ShareHelper.buildTripShareText(trip)
        assertTrue(text.contains("Golden Triangle of Odisha"))
        assertTrue(text.contains("1 Day"))
        assertTrue(text.contains("Lingaraj Temple"))
        assertTrue(text.contains("Dhauli Shanti Stupa"))
        assertTrue(text.contains("scheduled Mo Bus & Ama Bus timetables"))
        assertTrue(text.contains("otravelz://trip/golden_triangle"))
    }
}
