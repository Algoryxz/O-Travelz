package com.otravelz.android

import com.otravelz.android.data.model.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ModelsSerializationTest {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    @Test
    fun testPlanningConstraintsSerialization() {
        val constraints = PlanningConstraintsDto(
            days = 2,
            interests = listOf("temple", "heritage"),
            avoidCrowds = true,
            lowWalking = false,
            vegetarian = true,
            publicTransportPreferred = true
        )

        val jsonStr = json.encodeToString(constraints)
        assertTrue(jsonStr.contains("\"days\":2"))
        assertTrue(jsonStr.contains("\"interests\":[\"temple\",\"heritage\"]"))
        assertTrue(jsonStr.contains("\"avoid_crowds\":true"))
        assertTrue(jsonStr.contains("\"public_transport_preferred\":true"))
    }

    @Test
    fun testPlaceDetailDtoDeserialization() {
        val jsonStr = """
            {
                "id": "place_001",
                "name": "Lingaraj Temple",
                "category": "temple",
                "district": "Khordha",
                "lat": 20.2382,
                "lon": 85.8338,
                "description": "Historic 11th-century temple in Bhubaneswar.",
                "images": [{"url": "https://example.com/lingaraj.jpg", "caption": "Main sanctum", "is_primary": true}]
            }
        """.trimIndent()

        val dto = json.decodeFromString<PlaceDetailDto>(jsonStr)
        assertEquals("place_001", dto.id)
        assertEquals("Lingaraj Temple", dto.name)
        assertEquals(20.2382, dto.lat ?: 0.0, 0.0001)
        assertEquals(1, dto.images.size)
        assertEquals(true, dto.images.first().isPrimary)
    }

    @Test
    fun testItineraryPlanResponseDeserialization() {
        val jsonStr = """
            {
                "itinerary_id": "itin_bbsr_001",
                "constraints": {
                    "days": 1,
                    "interests": ["temple", "heritage"]
                },
                "explanation": "1-day spiritual & heritage circuit with scheduled Mo Bus connectivity.",
                "days": [
                    {
                        "day_number": 1,
                        "date": "2026-09-02",
                        "theme": "Old Town Heritage & Stupas",
                        "stops": [
                            {
                                "sequence": 1,
                                "place": {
                                    "id": "lingaraj_temple",
                                    "name": "Lingaraj Temple",
                                    "category": "temple"
                                },
                                "planned_arrival": "09:00",
                                "planned_departure": "10:30",
                                "duration_minutes": 90
                            }
                        ],
                        "hops": [
                            {
                                "from_sequence": 1,
                                "to_sequence": 2,
                                "mode": "mo_bus",
                                "estimated_minutes": 20,
                                "data_tier": "scheduled",
                                "legs": [
                                    {
                                        "mode": "mo_bus",
                                        "detail": "Take Route 10 from Lingaraj Stop to Dhauli",
                                        "provider": "CRUT Mo Bus",
                                        "route": "Route 10"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        """.trimIndent()

        val dto = json.decodeFromString<ItineraryPlanResponseDto>(jsonStr)
        assertEquals("itin_bbsr_001", dto.itineraryId)
        assertEquals(1, dto.days.size)

        val day1 = dto.days.first()
        assertEquals(1, day1.dayNumber)
        assertEquals(1, day1.stops.size)
        assertEquals("09:00", day1.stops.first().plannedArrival)
        assertEquals("10:30", day1.stops.first().plannedDeparture)
        assertEquals(90, day1.stops.first().durationMinutes)

        assertEquals(1, day1.hops.size)
        val hop = day1.hops.first()
        assertEquals("scheduled", hop.dataTier)
        assertNull("Fare must remain null when unpriced", hop.estimatedCost)
        assertEquals(1, hop.legs.size)
        assertEquals("CRUT Mo Bus", hop.legs.first().provider)
        assertEquals("Route 10", hop.legs.first().route)
    }

    @Test
    fun testAIResponseDeserialization() {
        val jsonStr = """
            {
                "message": "Here is your grounded 1-day itinerary with Mo Bus transit.",
                "status": "success",
                "itinerary": {
                    "itinerary_id": "ai_itin_002",
                    "constraints": {
                        "days": 1
                    },
                    "explanation": "AI Grounded itinerary with verified temples.",
                    "days": []
                }
            }
        """.trimIndent()

        val dto = json.decodeFromString<AIResponseDto>(jsonStr)
        assertEquals("success", dto.status)
        assertEquals("Here is your grounded 1-day itinerary with Mo Bus transit.", dto.message)
        assertNotNull(dto.itinerary)
        assertEquals("ai_itin_002", dto.itinerary?.itineraryId)
    }
}
