package com.otravelz.shared.geo

/**
 * Coarse geographic bounding box helper covering the state of Odisha, India.
 *
 * Geographic Extents:
 * - Latitude: 17.8°N to 22.6°N
 * - Longitude: 81.4°E to 87.5°E
 *
 * NOTE: This bounding box is a coarse product and geospatial UI helper (e.g. for map viewport
 * framing, camera clamping, and regional sanity filtering). It is NOT an authoritative truth oracle
 * for legal territorial boundaries or exact place validity.
 */
object OdishaBounds {
    const val MIN_LATITUDE: Double = 17.8
    const val MAX_LATITUDE: Double = 22.6
    const val MIN_LONGITUDE: Double = 81.4
    const val MAX_LONGITUDE: Double = 87.5

    /**
     * Canonical reference origin: Master Canteen, Bhubaneswar.
     */
    val MASTER_CANTEEN: GeoPoint = GeoPoint(latitude = 20.2961, longitude = 85.8245)

    /**
     * Coarse center coordinate of Odisha for default overview camera framing.
     */
    val STATE_CENTER: GeoPoint = GeoPoint(latitude = 20.5, longitude = 84.5)

    /**
     * Checks if a given [GeoPoint] lies within the coarse Odisha bounding box.
     */
    fun contains(point: GeoPoint): Boolean =
        contains(point.latitude, point.longitude)

    /**
     * Checks if a given (latitude, longitude) pair lies within the coarse Odisha bounding box.
     */
    fun contains(latitude: Double, longitude: Double): Boolean =
        latitude in MIN_LATITUDE..MAX_LATITUDE && longitude in MIN_LONGITUDE..MAX_LONGITUDE
}
