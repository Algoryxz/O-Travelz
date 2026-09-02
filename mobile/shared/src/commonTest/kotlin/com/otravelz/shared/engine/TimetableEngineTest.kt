package com.otravelz.shared.engine

import com.otravelz.shared.provenance.DataTier
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class TimetableEngineTest {

    private val route10Departures = listOf("06:30", "07:00", "07:30", "08:15", "09:00", "18:00", "20:30")

    @Test
    fun testFindsUpcomingDepartureInMorning() {
        val result = TimetableEngine.getNextScheduledDeparture(route10Departures, "07:15")

        assertEquals("07:30", result.nextDepartureTime)
        assertFalse(result.isServiceFinishedForDay)
        assertEquals(15, result.minutesUntilDeparture)
        assertEquals(DataTier.SCHEDULED, result.dataTier)
        assertEquals("Next scheduled departure: 07:30 IST", result.displayLabel)
    }

    @Test
    fun testFindsExactDepartureMatch() {
        val result = TimetableEngine.getNextScheduledDeparture(route10Departures, "07:00")

        assertEquals("07:00", result.nextDepartureTime)
        assertFalse(result.isServiceFinishedForDay)
        assertEquals(0, result.minutesUntilDeparture)
        assertEquals(DataTier.SCHEDULED, result.dataTier)
    }

    @Test
    fun testServiceFinishedAfterLastBus() {
        val result = TimetableEngine.getNextScheduledDeparture(route10Departures, "21:00")

        assertNull(result.nextDepartureTime)
        assertTrue(result.isServiceFinishedForDay)
        assertNull(result.minutesUntilDeparture)
        assertEquals(DataTier.SCHEDULED, result.dataTier)
        assertEquals("Service finished for today", result.displayLabel)
    }

    @Test
    fun testEmptyDeparturesReturnsUnavailable() {
        val result = TimetableEngine.getNextScheduledDeparture(emptyList(), "12:00")

        assertNull(result.nextDepartureTime)
        assertFalse(result.isServiceFinishedForDay)
        assertNull(result.minutesUntilDeparture)
        assertEquals(DataTier.UNAVAILABLE, result.dataTier)
        assertEquals("Schedule unavailable", result.displayLabel)
    }

    @Test
    fun testCalculateMinutesBetween() {
        assertEquals(15, TimetableEngine.calculateMinutesBetween("07:15", "07:30"))
        assertEquals(90, TimetableEngine.calculateMinutesBetween("07:00", "08:30"))
        assertEquals(0, TimetableEngine.calculateMinutesBetween("12:00", "12:00"))
        // Rollover over midnight: 23:45 to 00:15 is 30 mins
        assertEquals(30, TimetableEngine.calculateMinutesBetween("23:45", "00:15"))
    }
}
