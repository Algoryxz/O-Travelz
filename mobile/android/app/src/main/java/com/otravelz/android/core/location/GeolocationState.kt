package com.otravelz.android.core.location

sealed class GeolocationState {
    /**
     * Initial state when location has not been requested by the user.
     */
    object Idle : GeolocationState()

    /**
     * Actively querying GPS hardware for a real satellite lock.
     */
    object Requesting : GeolocationState()

    /**
     * Verified Real GPS Lock from device location provider.
     * Guaranteed to be genuine hardware telemetry.
     */
    data class RealGps(
        val lat: Double,
        val lon: Double,
        val accuracyMeters: Float? = null
    ) : GeolocationState()

    /**
     * Fallback / Reference Origin state when real GPS is unavailable, cold, or offline.
     * Strictly NOT the user's location. Used solely for reference-distance projections.
     */
    data class FallbackReference(
        val lat: Double = LocationManager.DEFAULT_FALLBACK_LAT,
        val lon: Double = LocationManager.DEFAULT_FALLBACK_LON,
        val referenceName: String = LocationManager.DEFAULT_FALLBACK_NAME
    ) : GeolocationState()

    /**
     * Explicitly denied by user.
     */
    data class Denied(
        val message: String = "Location permission denied. Utilizing Bhubaneswar Master Canteen reference origin."
    ) : GeolocationState()

    /**
     * GPS hardware unavailable or timed out.
     */
    data class Unavailable(
        val message: String = "GPS hardware unavailable. Utilizing Bhubaneswar Master Canteen reference origin."
    ) : GeolocationState()

    /**
     * Helper to determine if the state represents genuine real-time GPS telemetry.
     */
    val isRealGps: Boolean
        get() = this is RealGps

    /**
     * Helper to retrieve coordinates (either real GPS or reference origin).
     */
    val coordinatesOrFallback: Pair<Double, Double>
        get() = when (this) {
            is RealGps -> Pair(lat, lon)
            is FallbackReference -> Pair(lat, lon)
            is Denied -> Pair(LocationManager.DEFAULT_FALLBACK_LAT, LocationManager.DEFAULT_FALLBACK_LON)
            is Unavailable -> Pair(LocationManager.DEFAULT_FALLBACK_LAT, LocationManager.DEFAULT_FALLBACK_LON)
            is Idle -> Pair(LocationManager.DEFAULT_FALLBACK_LAT, LocationManager.DEFAULT_FALLBACK_LON)
            is Requesting -> Pair(LocationManager.DEFAULT_FALLBACK_LAT, LocationManager.DEFAULT_FALLBACK_LON)
        }
}
