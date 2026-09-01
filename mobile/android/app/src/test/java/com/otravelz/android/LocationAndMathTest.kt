package com.otravelz.android

import com.otravelz.android.core.location.GeolocationState
import com.otravelz.android.core.location.LocationManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class LocationAndMathTest {

    @Test
    fun testGeolocationStateRealGpsVsFallbackDistinction() {
        val realGps = GeolocationState.RealGps(lat = 20.2961, lon = 85.8245, accuracyMeters = 10f)
        assertTrue("RealGps must be identified as real GPS", realGps.isRealGps)
        assertEquals(20.2961, realGps.lat, 0.0001)

        val fallback = GeolocationState.FallbackReference(
            lat = LocationManager.DEFAULT_FALLBACK_LAT,
            lon = LocationManager.DEFAULT_FALLBACK_LON,
            referenceName = LocationManager.DEFAULT_FALLBACK_NAME
        )
        assertFalse("FallbackReference must NOT be identified as real GPS", fallback.isRealGps)
        assertEquals("Bhubaneswar Master Canteen", fallback.referenceName)

        val idle = GeolocationState.Idle
        assertFalse("Idle must NOT be identified as real GPS", idle.isRealGps)

        val denied = GeolocationState.Denied()
        assertFalse("Denied must NOT be identified as real GPS", denied.isRealGps)

        val unavailable = GeolocationState.Unavailable()
        assertFalse("Unavailable must NOT be identified as real GPS", unavailable.isRealGps)
    }

    @Test
    fun testCoordinatesOrFallbackHelper() {
        val realGps = GeolocationState.RealGps(lat = 19.8135, lon = 85.8312)
        val (realLat, realLon) = realGps.coordinatesOrFallback
        assertEquals(19.8135, realLat, 0.0001)
        assertEquals(85.8312, realLon, 0.0001)

        val idle = GeolocationState.Idle
        val (idleLat, idleLon) = idle.coordinatesOrFallback
        assertEquals(LocationManager.DEFAULT_FALLBACK_LAT, idleLat, 0.0001)
        assertEquals(LocationManager.DEFAULT_FALLBACK_LON, idleLon, 0.0001)
    }

    @Test
    fun testHaversineDistanceZeroForSameCoords() {
        val dist = LocationManager.haversineDistanceKm(20.2961, 85.8245, 20.2961, 85.8245)
        assertEquals(0.0, dist, 0.001)
    }

    @Test
    fun testHaversineDistanceBhubaneswarToPuri() {
        // Bhubaneswar (20.2961, 85.8245) to Puri Jagannath Temple (19.8049, 85.8179) ~ 54-56 km
        val dist = LocationManager.haversineDistanceKm(20.2961, 85.8245, 19.8049, 85.8179)
        assertTrue("Distance should be ~54-56 km", dist in 53.0..57.0)
    }

    @Test
    fun testHaversineDistanceBhubaneswarToCuttack() {
        // Bhubaneswar (20.2961, 85.8245) to Cuttack SCB (20.4735, 85.8828) ~ 20-22 km
        val dist = LocationManager.haversineDistanceKm(20.2961, 85.8245, 20.4735, 85.8828)
        assertTrue("Distance should be ~20-22 km", dist in 19.0..23.0)
    }

    @Test
    fun testFirstMileThresholdsOnRealGps() {
        val walking = LocationManager.getFirstMileRecommendation(600.0)
        assertTrue(walking.contains("Walking proximity"))
        assertTrue(walking.contains("≤ 800m straight-line"))

        val threshold800 = LocationManager.getFirstMileRecommendation(800.0)
        assertTrue(threshold800.contains("Walking proximity"))

        val optional = LocationManager.getFirstMileRecommendation(1200.0)
        assertTrue(optional.contains("Walk or Short Auto proximity"))

        val threshold1500 = LocationManager.getFirstMileRecommendation(1500.0)
        assertTrue(threshold1500.contains("Walk or Short Auto proximity"))

        val auto = LocationManager.getFirstMileRecommendation(2500.0)
        assertTrue(auto.contains("Auto / Cab proximity"))
        assertTrue(auto.contains("> 1.5km"))
    }

    @Test
    fun testFirstMileDisabledWhenRealGpsInactive() {
        val idleState: GeolocationState = GeolocationState.Idle
        val fallbackState: GeolocationState = GeolocationState.FallbackReference()

        val guidanceForIdle = if (idleState.isRealGps) {
            LocationManager.getFirstMileRecommendation(500.0)
        } else null

        val guidanceForFallback = if (fallbackState.isRealGps) {
            LocationManager.getFirstMileRecommendation(500.0)
        } else null

        assertNull("First-mile recommendation must be disabled when state is Idle", guidanceForIdle)
        assertNull("First-mile recommendation must be disabled when state is FallbackReference", guidanceForFallback)
    }
}
