package com.otravelz.android

import com.otravelz.android.core.location.GeolocationState
import com.otravelz.android.core.location.LocationManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LocationAndMathTest {

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
    fun testFirstMileThresholdsExactBoundaries() {
        // Boundary: 0m
        val at0 = LocationManager.getFirstMileRecommendation(0.0)
        assertTrue("0m is Walking", at0.contains("Walking"))

        // Boundary: 800m
        val at800 = LocationManager.getFirstMileRecommendation(800.0)
        assertTrue("800m is Walking", at800.contains("Walking"))

        // Boundary: 800.1m
        val at800_1 = LocationManager.getFirstMileRecommendation(800.1)
        assertTrue("800.1m is Walk or Short Auto", at800_1.contains("Walk or Short Auto"))

        // Boundary: 1500m
        val at1500 = LocationManager.getFirstMileRecommendation(1500.0)
        assertTrue("1500m is Walk or Short Auto", at1500.contains("Walk or Short Auto"))

        // Boundary: 1500.1m
        val at1500_1 = LocationManager.getFirstMileRecommendation(1500.1)
        assertTrue("1500.1m is Auto / Cab", at1500_1.contains("Auto / Cab"))
    }

    @Test
    fun testGeolocationStateReferenceOrigin() {
        val origin = GeolocationState.ReferenceOrigin()
        assertEquals(20.2961, origin.lat, 0.0001)
        assertEquals(85.8245, origin.lon, 0.0001)
        assertTrue(origin.label.contains("Bhubaneswar"))
    }
}
