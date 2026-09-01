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
    fun testFirstMileThresholds() {
        val walking = LocationManager.getFirstMileRecommendation(600.0)
        assertTrue(walking.contains("Walking"))
        assertTrue(walking.contains("≤ 800m"))

        val threshold800 = LocationManager.getFirstMileRecommendation(800.0)
        assertTrue(threshold800.contains("Walking"))

        val optional = LocationManager.getFirstMileRecommendation(1200.0)
        assertTrue(optional.contains("Walk or Short Auto"))

        val threshold1500 = LocationManager.getFirstMileRecommendation(1500.0)
        assertTrue(threshold1500.contains("Walk or Short Auto"))

        val auto = LocationManager.getFirstMileRecommendation(2500.0)
        assertTrue(auto.contains("Auto / Cab"))
    }
}
