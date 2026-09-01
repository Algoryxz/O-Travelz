package com.otravelz.android

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
    fun testFirstMileThresholds() {
        val walking = LocationManager.getFirstMileRecommendation(600.0)
        assertTrue(walking.contains("Walking"))

        val optional = LocationManager.getFirstMileRecommendation(1200.0)
        assertTrue(optional.contains("Walk or Short Auto"))

        val auto = LocationManager.getFirstMileRecommendation(2500.0)
        assertTrue(auto.contains("Auto / Cab"))
    }
}
