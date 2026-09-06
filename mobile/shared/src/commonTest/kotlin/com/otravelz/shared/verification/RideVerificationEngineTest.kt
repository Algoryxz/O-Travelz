package com.otravelz.shared.verification

import com.otravelz.shared.geo.GeoPoint
import com.otravelz.shared.provenance.LocationState
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class RideVerificationEngineTest {

    @Test
    fun testLifecycleAndGating() {
        val engine = RideVerificationEngine()
        assertTrue(engine.currentState() is VerificationSessionState.Idle)

        // Start session
        engine.startSession("sess-1", "09", "forward", 1000L)
        val recState = engine.currentState() as VerificationSessionState.Recording
        assertEquals("sess-1", recState.sessionId)
        assertEquals("09", recState.routeNumber)
        assertEquals(0, recState.sampleCount)

        // Reject fixed reference datum (Master Canteen)
        val datumLocation = LocationState.ReferenceOrigin()
        val acceptedDatum = engine.recordSample(datumLocation, 1001L)
        assertFalse(acceptedDatum, "Fixed reference datum must NEVER be accepted as ride GPS telemetry")

        // Reject permission denied state
        val deniedLocation = LocationState.PermissionDenied()
        val acceptedDenied = engine.recordSample(deniedLocation, 1002L)
        assertFalse(acceptedDenied, "Permission denied fallback datum must NEVER be accepted as ride telemetry")

        // Reject degraded accuracy (> 40m)
        val noisyGps = LocationState.LiveDeviceLocation(GeoPoint(20.2961, 85.8245), accuracyMeters = 85.0)
        val acceptedNoisy = engine.recordSample(noisyGps, 1003L)
        assertFalse(acceptedNoisy, "Degraded GPS (> 40m) must be filtered out")

        // Accept genuine live GPS fix
        val cleanGps = LocationState.LiveDeviceLocation(GeoPoint(20.2961, 85.8245), accuracyMeters = 7.5)
        val acceptedClean = engine.recordSample(cleanGps, 1004L, speedMps = 5.2)
        assertTrue(acceptedClean)
        assertEquals(1, (engine.currentState() as VerificationSessionState.Recording).sampleCount)

        // Record single-tap boarding event
        val boardingAccepted = engine.recordEvent(ObservationType.BOARDING, cleanGps, 1005L, stopId = "stop_09_1")
        assertTrue(boardingAccepted)
        assertEquals(1, (engine.currentState() as VerificationSessionState.Recording).eventsCount)

        // Finish session
        val finishedState = engine.finishSession() as VerificationSessionState.Completed
        assertEquals(1, finishedState.sampleCount)
        assertEquals(1, finishedState.eventsCount)
    }
}
