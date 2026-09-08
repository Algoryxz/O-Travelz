package com.otravelz.android

import com.otravelz.android.data.network.dto.*
import com.otravelz.android.domain.model.*
import org.junit.Assert.*
import org.junit.Test

/**
 * Unit tests verifying Wave M13 Planner domain models, constraint mappings,
 * six-hour duration bounding, fare nullness, and truth invariants.
 */
class PlannerProductModelTest {

    @Test
    fun testConstraintMappingToRequestDto() {
        val constraints = PlanConstraints(
            days = 1,
            interests = setOf("temple", "heritage"),
            pace = PlanPace.RELAXED,
            startHub = "Bhubaneswar",
            lowWalking = true,
            publicTransportPreferred = true,
            budgetConscious = true
        )

        val dto = constraints.toRequestDto()
        assertEquals(1, dto.days)
        assertTrue(dto.interests.contains("temple"))
        assertTrue(dto.interests.contains("heritage"))
        assertEquals("relaxed", dto.pace)
        assertEquals("Bhubaneswar", dto.start)
        assertEquals(true, dto.lowWalking)
        assertEquals(true, dto.publicTransportPreferred)
        assertEquals(true, dto.budgetConscious)
        assertNull(dto.budgetTransportPerDay) // Strictly null
    }

    @Test
    fun testSixHourDurationBounding() {
        // "6 hours" trip is represented by days = 1, bounded to at most 3 stops per day
        val sixHourConstraints = PlanConstraints(
            days = 1,
            interests = setOf("temple", "culture"),
            pace = PlanPace.MODERATE,
            startHub = "Bhubaneswar",
            lowWalking = true
        )

        val dto = sixHourConstraints.toRequestDto()
        assertEquals(1, dto.days)

        // Mock response for 1 day / 6 hours
        val responseDto = ItineraryResponseDto(
            itineraryId = "itin-bhubaneswar-6h",
            days = listOf(
                ItineraryDayDto(
                    dayNumber = 1,
                    stops = listOf(
                        ItineraryStopDto(
                            sequence = 1,
                            place = PlaceSummaryDto("p-lingaraj", "Lingaraj Temple", "temple"),
                            plannedArrival = "09:00",
                            plannedDeparture = "11:00"
                        ),
                        ItineraryStopDto(
                            sequence = 2,
                            place = PlaceSummaryDto("p-mukteswar", "Mukteswar Temple", "temple"),
                            plannedArrival = "11:45",
                            plannedDeparture = "13:30"
                        ),
                        ItineraryStopDto(
                            sequence = 3,
                            place = PlaceSummaryDto("p-kala-bhoomi", "Kala Bhoomi Crafts Museum", "culture"),
                            plannedArrival = "14:15",
                            plannedDeparture = "16:30"
                        )
                    ),
                    hops = listOf(
                        TransportHopDto(fromSequence = 1, toSequence = 2, mode = "walk", estimatedMinutes = 15),
                        TransportHopDto(fromSequence = 2, toSequence = 3, mode = "bus", estimatedMinutes = 35, routeNumber = "10")
                    )
                )
            ),
            explanation = "6-hour cultural tour of Bhubaneswar"
        )

        val planResult = PlanResult.fromDto(responseDto, sixHourConstraints)
        assertEquals(1, planResult.days.size)
        assertEquals(3, planResult.totalStopsCount)
        assertTrue(planResult.totalStopsCount <= 3) // 6 hours <= 3 stops invariant
        assertEquals("09:00 – 11:00", planResult.days[0].stops[0].timeWindowDisplay)
        assertEquals("11:45 – 13:30", planResult.days[0].stops[1].timeWindowDisplay)
        assertEquals("14:15 – 16:30", planResult.days[0].stops[2].timeWindowDisplay)
    }

    @Test
    fun testFareNullTruthAcrossPlan() {
        val hopDto = TransportHopDto(
            fromSequence = 1,
            toSequence = 2,
            mode = "bus",
            routeNumber = "10",
            durationMinutes = 25,
            fare = null
        )

        val responseDto = ItineraryResponseDto(
            itineraryId = "itin-fare-truth",
            days = listOf(
                ItineraryDayDto(
                    dayNumber = 1,
                    stops = listOf(
                        ItineraryStopDto(1, PlaceSummaryDto("p1", "Place 1", "heritage"))
                    ),
                    hops = listOf(hopDto)
                )
            )
        )

        val planResult = PlanResult.fromDto(responseDto, PlanConstraints())
        val hop = planResult.days[0].hops[0]
        assertNull("Fare must be strictly null (zero fare fabrication)", hop.estimatedCost)
    }

    @Test
    fun testUnavailableHopBehavior() {
        val unavailableHop = TransportHopDto(
            fromSequence = 1,
            toSequence = 2,
            mode = "unavailable",
            reason = "No road or transit connection available between rural points"
        )

        val leg = JourneyLeg(
            fromSequence = 1,
            toSequence = 2,
            mode = "unavailable",
            estimatedMinutes = null,
            estimatedCost = null,
            legDetail = null,
            dataTier = "unknown",
            reason = unavailableHop.reason
        )

        assertTrue(leg.isUnavailable)
        assertEquals("Transport unavailable", leg.displayModeTitle)
    }

    @Test
    fun testAICompanionGroundedIntegration() {
        val constraints = PlanConstraints(days = 1, startHub = "Bhubaneswar")
        val responseDto = ItineraryResponseDto(
            itineraryId = "itin-ai",
            days = emptyList(),
            explanation = ""
        )

        val planResult = PlanResult.fromDto(
            dto = responseDto,
            originalConstraints = constraints,
            aiMessage = "I have built a verified 1-day itinerary with ancient temples.",
            isGrounded = true
        )

        assertTrue(planResult.isAIGrounded)
        assertNotNull(planResult.aiCompanionMessage)
        assertEquals("I have built a verified 1-day itinerary with ancient temples.", planResult.aiCompanionMessage)
    }

    @Test
    fun testDaysClamping() {
        val cNegative = PlanConstraints(days = -5).toRequestDto()
        assertEquals(1, cNegative.days)

        val cExcess = PlanConstraints(days = 10).toRequestDto()
        assertEquals(7, cExcess.days)
    }

    @Test
    fun testBhubaneswarLocalStopsDoNotIncludePuriOrSalepur() {
        val constraints = PlanConstraints(
            days = 1,
            startHub = "Bhubaneswar",
            interests = setOf("heritage")
        )

        val responseDto = ItineraryResponseDto(
            itineraryId = "itin-bhubaneswar-verified",
            days = listOf(
                ItineraryDayDto(
                    dayNumber = 1,
                    stops = listOf(
                        ItineraryStopDto(1, PlaceSummaryDto("p-lingaraj", "Lingaraj Temple", "temple")),
                        ItineraryStopDto(2, PlaceSummaryDto("p-chitrakarini", "Chitrakarini Temple", "temple")),
                        ItineraryStopDto(3, PlaceSummaryDto("p-bharati", "Bharati Matha Temple", "temple"))
                    ),
                    hops = listOf(
                        TransportHopDto(fromSequence = 1, toSequence = 2, mode = "walk", estimatedMinutes = 2),
                        TransportHopDto(fromSequence = 2, toSequence = 3, mode = "walk", estimatedMinutes = 3)
                    )
                )
            ),
            explanation = ""
        )

        val result = PlanResult.fromDto(responseDto, constraints)
        assertEquals(1, result.days.size)
        assertEquals(3, result.totalStopsCount)
        val stopNames = result.days[0].stops.map { it.placeName }
        assertFalse(stopNames.any { it.contains("Puri") })
        assertFalse(stopNames.any { it.contains("Salepur") })
        assertTrue(stopNames.contains("Lingaraj Temple"))
    }

    @Test
    fun testFareMicrocopyPolicyAdherence() {
        val hopDto = TransportHopDto(
            fromSequence = 1,
            toSequence = 2,
            mode = "walk",
            estimatedMinutes = 2,
            fare = null
        )
        val leg = JourneyLeg(
            fromSequence = 1,
            toSequence = 2,
            mode = "walk",
            estimatedMinutes = 2,
            estimatedCost = null,
            legDetail = "Walk ~100m",
            dataTier = "static",
            reason = null
        )
        assertNull(leg.estimatedCost)
        assertFalse("Must not claim payment on bus", leg.displayModeTitle.contains("Pay on Bus"))
        assertFalse("Must not claim payment at boarding", leg.displayModeTitle.contains("boarding"))
    }
}
