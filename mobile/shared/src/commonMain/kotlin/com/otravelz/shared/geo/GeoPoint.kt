package com.otravelz.shared.geo

/**
 * Immutable geographic coordinate representing a latitude/longitude pair on Earth.
 *
 * Enforces strict coordinate validation:
 * - Latitude must be within [-90.0, 90.0]
 * - Longitude must be within [-180.0, 180.0]
 */
data class GeoPoint(
    val latitude: Double,
    val longitude: Double
) {
    init {
        require(!latitude.isNaN() && latitude in -90.0..90.0) {
            "Latitude must be a valid number between -90.0 and 90.0. Received: $latitude"
        }
        require(!longitude.isNaN() && longitude in -180.0..180.0) {
            "Longitude must be a valid number between -180.0 and 180.0. Received: $longitude"
        }
    }

    /**
     * Calculates the straight-line Haversine spherical distance to another [GeoPoint] in kilometers.
     */
    fun distanceToKm(other: GeoPoint): Double =
        HaversineDistance.calculateKm(this, other)

    /**
     * Calculates the straight-line Haversine spherical distance to another [GeoPoint] in meters.
     */
    fun distanceToMeters(other: GeoPoint): Double =
        HaversineDistance.calculateMeters(this, other)

    override fun toString(): String =
        "GeoPoint(lat=$latitude, lon=$longitude)"
}
