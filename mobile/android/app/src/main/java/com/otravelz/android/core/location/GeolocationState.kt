package com.otravelz.android.core.location

/**
 * Authoritative Geolocation State Taxonomy for O-TRAVELZ Mobile V3.
 * Strictly separates genuine hardware Live GPS telemetry from explicit Reference Origin fallbacks.
 */
sealed class GeolocationState {
    object Idle : GeolocationState()
    object Requesting : GeolocationState()
    object RequestingPermission : GeolocationState()

    data class LiveLocation(
        val lat: Double,
        val lon: Double,
        val accuracyMeters: Float,
        val timestamp: Long = System.currentTimeMillis()
    ) : GeolocationState()

    data class LastKnownLocation(
        val lat: Double,
        val lon: Double,
        val accuracyMeters: Float,
        val timestamp: Long = System.currentTimeMillis()
    ) : GeolocationState()

    data class ReferenceOrigin(
        val lat: Double = 20.2961,
        val lon: Double = 85.8245,
        val label: String = "Bhubaneswar Reference Point (20.2961°N, 85.8245°E)"
    ) : GeolocationState()

    data class PermissionDenied(val message: String = "Location permission denied.") : GeolocationState()
    data class GpsUnavailable(val message: String = "GPS hardware unavailable or timed out.") : GeolocationState()

    // Backward compatibility aliases
    data class Granted(
        val lat: Double,
        val lon: Double,
        val accuracyMeters: Float? = null
    ) : GeolocationState()

    data class Denied(val message: String = "Location permission denied.") : GeolocationState()
    data class Unavailable(val message: String = "GPS hardware unavailable or timed out.") : GeolocationState()

    val currentLat: Double
        get() = when (this) {
            is LiveLocation -> lat
            is LastKnownLocation -> lat
            is Granted -> lat
            is ReferenceOrigin -> lat
            else -> 20.2961
        }

    val currentLon: Double
        get() = when (this) {
            is LiveLocation -> lon
            is LastKnownLocation -> lon
            is Granted -> lon
            is ReferenceOrigin -> lon
            else -> 85.8245
        }

    val isLiveGps: Boolean
        get() = this is LiveLocation

    val isReferenceOrigin: Boolean
        get() = this is ReferenceOrigin || this is Idle || this is Denied || this is PermissionDenied || this is Unavailable || this is GpsUnavailable
}
