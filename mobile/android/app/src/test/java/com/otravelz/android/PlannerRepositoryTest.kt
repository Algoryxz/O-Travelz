package com.otravelz.android

import com.otravelz.android.data.model.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.*
import org.junit.Test

class PlannerRepositoryTest {

    private val json = Json { ignoreUnknownKeys = true; isLenient = true }

    private val sampleItinerary = ItineraryPlanResponseDto(
        itineraryId = "itin_puri_konark_123",
        constraints = PlanningConstraintsDto(
            days = 2,
            interests = listOf("temple", "beach"),
            start = "Bhubaneswar"
        ),
        days = listOf(
            ItineraryDayDto(
                dayNumber = 1,
                theme = "Heritage & Sacred Temples",
                stops = listOf(
                    ItineraryStopDto(
                        sequence = 1,
                        place = PlaceSummaryDto(
                            id = "lingaraj-temple",
                            name = "Lingaraj Temple",
                            category = "temple",
                            lat = 20.2382,
                            lon = 85.8338
                        ),
                        plannedArrival = "09:00",
                        plannedDeparture = "10:30",
                        durationMinutes = 90
                    )
                ),
                hops = listOf(
                    TransportHopDto(
                        fromSequence = 1,
                        toSequence = 2,
                        mode = "mo_bus",
                        estimatedMinutes = 25,
                        dataTier = "scheduled"
                    )
                )
            )
        ),
        explanation = "Deterministic 2-day plan connecting Bhubaneswar and Puri via Mo Bus Network."
    )

    @Test
    fun testCreateShareTripRequestAndResponseSerialization() {
        val request = CreateShareTripRequestDto(
            title = "Bhubaneswar Heritage 2-Day Tour",
            itinerary = sampleItinerary
        )

        val encodedRequest = json.encodeToString(request)
        assertTrue(encodedRequest.contains("\"title\":\"Bhubaneswar Heritage 2-Day Tour\""))
        assertTrue(encodedRequest.contains("\"itinerary_id\":\"itin_puri_konark_123\""))

        val response = CreateShareTripResponseDto(
            shareId = "share_abc123",
            shareUrl = "https://otravelz.com/trips/shared/share_abc123",
            createdAt = 1700000000000L
        )

        val encodedResponse = json.encodeToString(response)
        assertTrue(encodedResponse.contains("\"share_id\":\"share_abc123\""))
        assertTrue(encodedResponse.contains("\"share_url\":\"https://otravelz.com/trips/shared/share_abc123\""))

        val decodedResponse = json.decodeFromString<CreateShareTripResponseDto>(encodedResponse)
        assertEquals("share_abc123", decodedResponse.shareId)
        assertEquals(1700000000000L, decodedResponse.createdAt)
    }

    @Test
    fun testSyncTripsSerialization() {
        val tripItem = SyncTripItemDto(
            id = "trip_456",
            title = "Puri & Konark 2-Day Plan",
            timestamp = 1700000000000L,
            updatedAt = 1700000000000L,
            isDeleted = false,
            itinerary = sampleItinerary
        )

        val request = SyncTripsRequestDto(items = listOf(tripItem))
        val encoded = json.encodeToString(request)
        assertTrue(encoded.contains("\"id\":\"trip_456\""))
        assertTrue(encoded.contains("\"title\":\"Puri & Konark 2-Day Plan\""))

        val response = SyncTripsResponseDto(
            syncedCount = 1,
            items = listOf(tripItem)
        )
        val encodedRes = json.encodeToString(response)
        val decodedRes = json.decodeFromString<SyncTripsResponseDto>(encodedRes)
        assertEquals(1, decodedRes.syncedCount)
        assertEquals("trip_456", decodedRes.items[0].id)
    }

    @Test
    fun testPlanningConstraintsCustomOrigins() {
        val constraints = PlanningConstraintsDto(
            days = 3,
            interests = listOf("temple", "beach", "monument"),
            start = "Puri Hub",
            publicTransportPreferred = true
        )

        assertEquals(3, constraints.days)
        assertEquals("Puri Hub", constraints.start)
        assertEquals(3, constraints.interests.size)
        assertTrue(constraints.publicTransportPreferred == true)
    }

    @Test
    fun testPublicSharedTripResponseDtoSerialization() {
        val publicResponse = PublicSharedTripResponseDto(
            shareId = "share_xyz789",
            title = "Puri Coastal Journey",
            itinerary = sampleItinerary,
            createdAt = 1700000000000L,
            expiresAt = 1705000000000L,
            constraints = sampleItinerary.constraints
        )

        val encoded = json.encodeToString(publicResponse)
        assertTrue(encoded.contains("\"share_id\":\"share_xyz789\""))
        assertTrue(encoded.contains("\"title\":\"Puri Coastal Journey\""))
        assertTrue(encoded.contains("\"expires_at\":1705000000000"))

        val decoded = json.decodeFromString<PublicSharedTripResponseDto>(encoded)
        assertEquals("share_xyz789", decoded.shareId)
        assertEquals(1705000000000L, decoded.expiresAt)
        assertEquals("itin_puri_konark_123", decoded.itinerary.itineraryId)
    }
}
