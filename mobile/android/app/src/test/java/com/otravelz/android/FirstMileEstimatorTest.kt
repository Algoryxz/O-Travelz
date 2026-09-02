package com.otravelz.android

import com.otravelz.android.core.location.FirstMileEstimator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FirstMileEstimatorTest {

    @Test
    fun testExactBoundary0Meters() {
        val result = FirstMileEstimator.getRecommendation(0.0)
        assertEquals(FirstMileEstimator.RECOMMENDATION_WALK, result)
        assertEquals("WALK", FirstMileEstimator.getModeCategory(0.0))
    }

    @Test
    fun testExactBoundary800Meters() {
        val result = FirstMileEstimator.getRecommendation(800.0)
        assertEquals(FirstMileEstimator.RECOMMENDATION_WALK, result)
        assertEquals("WALK", FirstMileEstimator.getModeCategory(800.0))
    }

    @Test
    fun testExactBoundary800Point1Meters() {
        val result = FirstMileEstimator.getRecommendation(800.1)
        assertEquals(FirstMileEstimator.RECOMMENDATION_WALK_OR_AUTO, result)
        assertEquals("WALK_AUTO", FirstMileEstimator.getModeCategory(800.1))
    }

    @Test
    fun testExactBoundary1500Meters() {
        val result = FirstMileEstimator.getRecommendation(1500.0)
        assertEquals(FirstMileEstimator.RECOMMENDATION_WALK_OR_AUTO, result)
        assertEquals("WALK_AUTO", FirstMileEstimator.getModeCategory(1500.0))
    }

    @Test
    fun testExactBoundary1500Point1Meters() {
        val result = FirstMileEstimator.getRecommendation(1500.1)
        assertEquals(FirstMileEstimator.RECOMMENDATION_AUTO_CAB, result)
        assertEquals("AUTO_CAB", FirstMileEstimator.getModeCategory(1500.1))
    }

    @Test
    fun testHighDistanceThreshold() {
        val result = FirstMileEstimator.getRecommendation(55000.0)
        assertEquals(FirstMileEstimator.RECOMMENDATION_AUTO_CAB, result)
        assertEquals("AUTO_CAB", FirstMileEstimator.getModeCategory(55000.0))
    }
}
