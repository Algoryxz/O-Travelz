package com.otravelz.shared.geo

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class GeoPointTest {

    @Test
    fun testValidCoordinatesCreateSuccessfully() {
        val bbs = GeoPoint(latitude = 20.2961, longitude = 85.8245)
        assertEquals(20.2961, bbs.latitude)
        assertEquals(85.8245, bbs.longitude)

        val equatorPrime = GeoPoint(latitude = 0.0, longitude = 0.0)
        assertEquals(0.0, equatorPrime.latitude)
        assertEquals(0.0, equatorPrime.longitude)

        val northPole = GeoPoint(latitude = 90.0, longitude = 0.0)
        assertEquals(90.0, northPole.latitude)

        val southPole = GeoPoint(latitude = -90.0, longitude = 0.0)
        assertEquals(-90.0, southPole.latitude)
    }

    @Test
    fun testInvalidLatitudeThrowsIllegalArgumentException() {
        assertFailsWith<IllegalArgumentException> {
            GeoPoint(latitude = 90.001, longitude = 85.0)
        }
        assertFailsWith<IllegalArgumentException> {
            GeoPoint(latitude = -90.001, longitude = 85.0)
        }
        assertFailsWith<IllegalArgumentException> {
            GeoPoint(latitude = Double.NaN, longitude = 85.0)
        }
    }

    @Test
    fun testInvalidLongitudeThrowsIllegalArgumentException() {
        assertFailsWith<IllegalArgumentException> {
            GeoPoint(latitude = 20.0, longitude = 180.001)
        }
        assertFailsWith<IllegalArgumentException> {
            GeoPoint(latitude = 20.0, longitude = -180.001)
        }
        assertFailsWith<IllegalArgumentException> {
            GeoPoint(latitude = 20.0, longitude = Double.NaN)
        }
    }

    @Test
    fun testDistanceToHelpers() {
        val p1 = GeoPoint(latitude = 20.2961, longitude = 85.8245)
        val p2 = GeoPoint(latitude = 19.8048, longitude = 85.8180)

        val distKm = p1.distanceToKm(p2)
        val distMeters = p1.distanceToMeters(p2)

        assertTrue(distKm in 53.0..57.0)
        assertEquals(distKm * 1000.0, distMeters, 0.001)
    }
}
