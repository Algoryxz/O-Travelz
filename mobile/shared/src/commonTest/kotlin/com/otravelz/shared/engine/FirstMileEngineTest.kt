package com.otravelz.shared.engine

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class FirstMileEngineTest {

    @Test
    fun testExactThresholdBoundariesOnRealGps() {
        // Boundary 1: 0m -> WALK_REASONABLE
        val res0 = FirstMileEngine.evaluate(distanceMeters = 0.0, isRealGps = true)
        assertNotNull(res0)
        assertEquals(FirstMileBand.WALK_REASONABLE, res0.band)

        // Boundary 2: 799.9m -> WALK_REASONABLE
        val res799 = FirstMileEngine.evaluate(distanceMeters = 799.9, isRealGps = true)
        assertNotNull(res799)
        assertEquals(FirstMileBand.WALK_REASONABLE, res799.band)

        // Boundary 3: 800.0m exact -> WALK_REASONABLE
        val res800 = FirstMileEngine.evaluate(distanceMeters = 800.0, isRealGps = true)
        assertNotNull(res800)
        assertEquals(FirstMileBand.WALK_REASONABLE, res800.band)

        // Boundary 4: 800.1m -> WALK_OR_SHORT_AUTO
        val res800_1 = FirstMileEngine.evaluate(distanceMeters = 800.1, isRealGps = true)
        assertNotNull(res800_1)
        assertEquals(FirstMileBand.WALK_OR_SHORT_AUTO, res800_1.band)

        // Boundary 5: 1499.9m -> WALK_OR_SHORT_AUTO
        val res1499 = FirstMileEngine.evaluate(distanceMeters = 1499.9, isRealGps = true)
        assertNotNull(res1499)
        assertEquals(FirstMileBand.WALK_OR_SHORT_AUTO, res1499.band)

        // Boundary 6: 1500.0m exact -> WALK_OR_SHORT_AUTO
        val res1500 = FirstMileEngine.evaluate(distanceMeters = 1500.0, isRealGps = true)
        assertNotNull(res1500)
        assertEquals(FirstMileBand.WALK_OR_SHORT_AUTO, res1500.band)

        // Boundary 7: 1500.1m -> AUTO_OR_CAB_RECOMMENDED
        val res1500_1 = FirstMileEngine.evaluate(distanceMeters = 1500.1, isRealGps = true)
        assertNotNull(res1500_1)
        assertEquals(FirstMileBand.AUTO_OR_CAB_RECOMMENDED, res1500_1.band)

        // Long distance: 5000m -> AUTO_OR_CAB_RECOMMENDED
        val res5000 = FirstMileEngine.evaluate(distanceMeters = 5000.0, isRealGps = true)
        assertNotNull(res5000)
        assertEquals(FirstMileBand.AUTO_OR_CAB_RECOMMENDED, res5000.band)
    }

    @Test
    fun testEvaluatesToNullWhenRealGpsIsFalse() {
        // Must return null for all distances when isRealGps is false
        assertNull(FirstMileEngine.evaluate(distanceMeters = 0.0, isRealGps = false))
        assertNull(FirstMileEngine.evaluate(distanceMeters = 500.0, isRealGps = false))
        assertNull(FirstMileEngine.evaluate(distanceMeters = 800.0, isRealGps = false))
        assertNull(FirstMileEngine.evaluate(distanceMeters = 1200.0, isRealGps = false))
        assertNull(FirstMileEngine.evaluate(distanceMeters = 2500.0, isRealGps = false))
    }

    @Test
    fun testNegativeDistanceThrowsIllegalArgumentException() {
        assertFailsWith<IllegalArgumentException> {
            FirstMileEngine.evaluate(distanceMeters = -1.0, isRealGps = true)
        }
        assertFailsWith<IllegalArgumentException> {
            FirstMileEngine.evaluate(distanceMeters = Double.NaN, isRealGps = true)
        }
    }
}
