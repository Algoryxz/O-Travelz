package com.otravelz.android

import com.otravelz.android.data.local.entity.SavedPlaceEntity
import com.otravelz.android.data.local.entity.SavedTripEntity
import com.otravelz.android.data.local.entity.SavedTripStopEntity
import com.otravelz.android.data.local.entity.TripProgressEntity
import com.otravelz.android.data.local.model.SavedTripWithStops
import com.otravelz.android.domain.model.*
import org.junit.Assert.*
import org.junit.Test
import java.util.UUID

/**
 * Unit tests verifying Wave M14 Room SQLite entity contracts, snapshot immutability,
 * sorted stop determinism, strictly-null hop fares, and trip progress transitions.
 */
class PersistenceProductModelTest {

    @Test
    fun testSavedPlaceEntityAttributes() {
        val place = SavedPlaceEntity(
            canonicalPlaceId = "puri-jagannath-temple",
            savedAt = 1725800000000L,
            placeName = "Jagannath Temple",
            category = "temple",
            district = "Puri",
            imageUrl = "/static/puri.webp",
            rating = 4.9
        )

        assertEquals("puri-jagannath-temple", place.canonicalPlaceId)
        assertEquals(1725800000000L, place.savedAt)
        assertEquals("Jagannath Temple", place.placeName)
        assertEquals("temple", place.category)
        assertEquals("Puri", place.district)
        assertEquals("/static/puri.webp", place.imageUrl)
        assertEquals(4.9, place.rating!!, 0.001)
    }

    @Test
    fun testSavedTripEntityDefaultsAndConstraints() {
        val tripId = UUID.randomUUID().toString()
        val constraintsJson = "{\"days\":2,\"pace\":\"MODERATE\",\"startHub\":\"Bhubaneswar\"}"
        val trip = SavedTripEntity(
            tripId = tripId,
            title = "2-Day Bhubaneswar Itinerary",
            daysCount = 2,
            startHub = "Bhubaneswar",
            createdAt = 1725800000000L,
            updatedAt = 1725800000000L,
            constraintsJson = constraintsJson,
            aiExplanation = "Balanced heritage route",
            schemaVersion = 1
        )

        assertEquals(tripId, trip.tripId)
        assertEquals(2, trip.daysCount)
        assertEquals("Bhubaneswar", trip.startHub)
        assertEquals(1, trip.schemaVersion)
        assertTrue(trip.constraintsJson.contains("\"days\":2"))
    }

    @Test
    fun testSavedTripStopEntityStrictlyNullFareInvariant() {
        val stop = SavedTripStopEntity(
            stopId = "stop-01",
            tripId = "trip-01",
            dayNumber = 1,
            stopSequence = 1,
            canonicalPlaceId = "lingaraj-temple",
            placeName = "Lingaraj Temple",
            category = "temple",
            plannedArrival = "09:00",
            plannedDeparture = "11:00",
            hopMode = "transit",
            hopMinutes = 25,
            hopDetail = "Mo Bus Route 10",
            hopFare = null // Invariant: must be null
        )

        assertNull("Wave M14 invariant: hopFare must remain strictly null", stop.hopFare)
        assertEquals("transit", stop.hopMode)
        assertEquals(25, stop.hopMinutes)
    }

    @Test
    fun testSavedTripWithStopsSortedDeterministically() {
        val tripEntity = SavedTripEntity(
            tripId = "trip-sort-test",
            title = "Golden Triangle",
            daysCount = 2,
            startHub = "Bhubaneswar",
            createdAt = 1000L,
            updatedAt = 1000L,
            constraintsJson = "{}",
            schemaVersion = 1
        )

        val stopDay2Seq1 = SavedTripStopEntity(
            stopId = "s3",
            tripId = "trip-sort-test",
            dayNumber = 2,
            stopSequence = 1,
            canonicalPlaceId = "puri-jagannath",
            placeName = "Jagannath Temple",
            category = "temple"
        )
        val stopDay1Seq2 = SavedTripStopEntity(
            stopId = "s2",
            tripId = "trip-sort-test",
            dayNumber = 1,
            stopSequence = 2,
            canonicalPlaceId = "mukteswar-temple",
            placeName = "Mukteswar Temple",
            category = "temple"
        )
        val stopDay1Seq1 = SavedTripStopEntity(
            stopId = "s1",
            tripId = "trip-sort-test",
            dayNumber = 1,
            stopSequence = 1,
            canonicalPlaceId = "lingaraj-temple",
            placeName = "Lingaraj Temple",
            category = "temple"
        )

        // Provide out of order
        val relation = SavedTripWithStops(
            trip = tripEntity,
            stops = listOf(stopDay2Seq1, stopDay1Seq2, stopDay1Seq1)
        )

        val sorted = relation.sortedStops
        assertEquals(3, sorted.size)
        assertEquals("s1", sorted[0].stopId) // Day 1, Seq 1
        assertEquals("s2", sorted[1].stopId) // Day 1, Seq 2
        assertEquals("s3", sorted[2].stopId) // Day 2, Seq 1
    }

    @Test
    fun testTripProgressEntityStateAndStopTransitions() {
        val progress = TripProgressEntity(
            tripId = "trip-progress-test",
            isActive = true,
            activeDay = 1,
            currentMilestoneIndex = 0,
            completedStopIdsJson = "[]",
            skippedStopIdsJson = "[]",
            startedAt = 1000L,
            lastUpdatedAt = 1000L,
            completionState = "IN_PROGRESS"
        )

        assertTrue(progress.isActive)
        assertEquals(1, progress.activeDay)
        assertEquals(0, progress.currentMilestoneIndex)
        assertEquals("IN_PROGRESS", progress.completionState)

        // Simulate visiting a stop
        val visitedList = mutableListOf("lingaraj-temple")
        val updatedProgress = progress.copy(
            completedStopIdsJson = "[\"lingaraj-temple\"]",
            currentMilestoneIndex = 1,
            lastUpdatedAt = 2000L
        )

        assertEquals("[\"lingaraj-temple\"]", updatedProgress.completedStopIdsJson)
        assertEquals(1, updatedProgress.currentMilestoneIndex)

        // Simulate completing the trip
        val completedProgress = updatedProgress.copy(
            isActive = false,
            completionState = "COMPLETED",
            lastUpdatedAt = 3000L
        )
        assertFalse(completedProgress.isActive)
        assertEquals("COMPLETED", completedProgress.completionState)
    }
}
