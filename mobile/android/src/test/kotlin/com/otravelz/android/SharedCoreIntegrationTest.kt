package com.otravelz.android

import com.otravelz.shared.geo.GeoPoint
import com.otravelz.shared.geo.HaversineDistance
import com.otravelz.shared.geo.OdishaBounds
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Proves that Android module compiles against and correctly invokes
 * deterministic logic from :shared KMP core.
 */
class SharedCoreIntegrationTest {

    @Test
    fun testOdishaBoundsEvaluationFromAndroid() {
        val bbsr = GeoPoint(20.2961, 85.8245)
        assertTrue(
            "Bhubaneswar coordinates must evaluate as within Odisha bounds",
            OdishaBounds.contains(bbsr)
        )
    }

    @Test
    fun testHaversineDistanceEvaluationFromAndroid() {
        val bbsr = GeoPoint(20.2961, 85.8245)
        val puri = GeoPoint(19.8135, 85.8312)
        val distanceKm = HaversineDistance.calculateKm(bbsr, puri)
        assertTrue(
            "Bhubaneswar to Puri distance must be ~53-54 km",
            distanceKm in 50.0..60.0
        )
    }
}