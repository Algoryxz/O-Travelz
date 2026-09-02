package com.otravelz.shared.provenance

import com.otravelz.shared.geo.GeoPoint
import com.otravelz.shared.geo.OdishaBounds
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class LocationStateTest {

    @Test
    fun testLiveDeviceLocationState() {
        val gpsPoint = GeoPoint(20.3000, 85.8300)
        val state = LocationState.LiveDeviceLocation(point = gpsPoint, accuracyMeters = 8.5)

        assertTrue(state.isLiveDeviceLocation)
        assertEquals(gpsPoint, state.coordinatesOrFallback())
        assertEquals(8.5, state.accuracyMeters)
    }

    @Test
    fun testReferenceOriginState() {
        val state = LocationState.ReferenceOrigin()

        assertFalse(state.isLiveDeviceLocation)
        assertEquals(OdishaBounds.MASTER_CANTEEN, state.coordinatesOrFallback())
        assertEquals("Bhubaneswar Master Canteen", state.label)
    }

    @Test
    fun testPermissionDeniedState() {
        val state = LocationState.PermissionDenied()

        assertFalse(state.isLiveDeviceLocation)
        assertEquals(OdishaBounds.MASTER_CANTEEN, state.coordinatesOrFallback())
    }

    @Test
    fun testUnavailableState() {
        val state = LocationState.Unavailable()

        assertFalse(state.isLiveDeviceLocation)
        assertEquals(OdishaBounds.MASTER_CANTEEN, state.coordinatesOrFallback())
    }
}
