package com.otravelz.android.core.location

sealed class GeolocationState {
    object Idle : GeolocationState()
    object Requesting : GeolocationState()
    data class Granted(val lat: Double, val lon: Double, val accuracyMeters: Float? = null) : GeolocationState()
    data class ReferenceOrigin(
        val lat: Double = 20.2961,
        val lon: Double = 85.8245,
        val label: String = "Bhubaneswar Hub (Reference Origin)"
    ) : GeolocationState()
    data class Denied(val message: String = "Location permission denied.") : GeolocationState()
    data class Unavailable(val message: String = "GPS hardware unavailable or timed out.") : GeolocationState()
}
