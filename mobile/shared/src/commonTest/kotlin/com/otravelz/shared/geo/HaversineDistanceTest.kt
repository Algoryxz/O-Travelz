package com.otravelz.shared.geo

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class HaversineDistanceTest {

    @Test
    fun testDistanceZeroForIdenticalPoints() {
        val dist = HaversineDistance.calculateKm(20.2961, 85.8245, 20.2961, 85.8245)
        assertEquals(0.0, dist, 0.0001)

        val point = GeoPoint(20.2961, 85.8245)
        assertEquals(0.0, HaversineDistance.calculateKm(point, point), 0.0001)
        assertEquals(0.0, HaversineDistance.calculateMeters(point, point), 0.0001)
    }

    @Test
    fun testDistanceSymmetry() {
        val p1 = GeoPoint(20.2961, 85.8245) // Bhubaneswar
        val p2 = GeoPoint(19.8048, 85.8180) // Puri

        val d1to2 = HaversineDistance.calculateKm(p1, p2)
        val d2to1 = HaversineDistance.calculateKm(p2, p1)

        assertEquals(d1to2, d2to1, 0.00001)
    }

    @Test
    fun testKnownOdishaDistanceBhubaneswarToPuri() {
        // Bhubaneswar Master Canteen (20.2961, 85.8245) -> Puri Jagannath Temple (19.8048, 85.8180)
        val p1 = GeoPoint(20.2961, 85.8245)
        val p2 = GeoPoint(19.8048, 85.8180)

        val distKm = HaversineDistance.calculateKm(p1, p2)
        assertTrue(distKm in 53.0..57.0, "Expected BBS to Puri ~54.6 km, got $distKm km")
    }

    @Test
    fun testKnownOdishaDistanceBhubaneswarToCuttack() {
        // Bhubaneswar Master Canteen (20.2961, 85.8245) -> Cuttack SCB (20.4630, 85.8940)
        val p1 = GeoPoint(20.2961, 85.8245)
        val p2 = GeoPoint(20.4630, 85.8940)

        val distKm = HaversineDistance.calculateKm(p1, p2)
        assertTrue(distKm in 18.0..22.0, "Expected BBS to Cuttack ~20.0 km, got $distKm km")
    }

    @Test
    fun testKnownOdishaDistanceBhubaneswarToKonark() {
        // Bhubaneswar Master Canteen (20.2961, 85.8245) -> Konark Sun Temple (19.8876, 86.0945)
        val p1 = GeoPoint(20.2961, 85.8245)
        val p2 = GeoPoint(19.8876, 86.0945)

        val distKm = HaversineDistance.calculateKm(p1, p2)
        assertTrue(distKm in 51.0..56.0, "Expected BBS to Konark ~53.3 km, got $distKm km")
    }

    @Test
    fun testPoleToPoleDistance() {
        // Distance from North Pole to South Pole should be half Earth circumference ~ 20,015 km
        val northPole = GeoPoint(90.0, 0.0)
        val southPole = GeoPoint(-90.0, 0.0)

        val distKm = HaversineDistance.calculateKm(northPole, southPole)
        assertTrue(distKm in 20000.0..20030.0, "Expected North to South pole ~20,015 km, got $distKm km")
    }
}
