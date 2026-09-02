package com.otravelz.shared.geo

import kotlin.math.asin
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Single canonical implementation of the Haversine great-circle distance formula.
 *
 * Computes the exact spherical distance ("as the crow flies") between two geographic coordinates
 * on Earth using the standard mean radius R = 6371.0 km (6,371,000 meters).
 */
object HaversineDistance {
    const val EARTH_RADIUS_KM: Double = 6371.0
    const val EARTH_RADIUS_METERS: Double = 6371000.0
    private const val DEG_TO_RAD: Double = kotlin.math.PI / 180.0

    /**
     * Calculates the great-circle distance in kilometers between two latitude/longitude pairs.
     */
    fun calculateKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        if (lat1 == lat2 && lon1 == lon2) return 0.0

        val dLat = (lat2 - lat1) * DEG_TO_RAD
        val dLon = (lon2 - lon1) * DEG_TO_RAD

        val lat1Rad = lat1 * DEG_TO_RAD
        val lat2Rad = lat2 * DEG_TO_RAD

        val sinHalfDLat = sin(dLat / 2.0)
        val sinHalfDLon = sin(dLon / 2.0)

        val a = sinHalfDLat * sinHalfDLat +
                cos(lat1Rad) * cos(lat2Rad) * sinHalfDLon * sinHalfDLon

        val c = 2.0 * asin(min(1.0, sqrt(a)))
        return EARTH_RADIUS_KM * c
    }

    /**
     * Calculates the great-circle distance in kilometers between two [GeoPoint] coordinates.
     */
    fun calculateKm(p1: GeoPoint, p2: GeoPoint): Double =
        calculateKm(p1.latitude, p1.longitude, p2.latitude, p2.longitude)

    /**
     * Calculates the great-circle distance in meters between two [GeoPoint] coordinates.
     */
    fun calculateMeters(p1: GeoPoint, p2: GeoPoint): Double =
        calculateKm(p1, p2) * 1000.0

    /**
     * Calculates the great-circle distance in meters between two latitude/longitude pairs.
     */
    fun calculateMeters(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double =
        calculateKm(lat1, lon1, lat2, lon2) * 1000.0
}
