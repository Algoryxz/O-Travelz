package com.otravelz.android.core.location

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager as AndroidLocationManager
import androidx.core.content.ContextCompat
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.*

/**
 * DPDP (Digital Personal Data Protection Act) Compliant Location Manager.
 *
 * Invariants:
 * 1. Strictly in-memory state: Coordinates are never persisted to disk, Room, or SharedPreferences.
 * 2. Explicit User Consent: Location queries are triggered solely by direct user interaction.
 * 3. Right to Clear/Revoke: The clear() method immediately wipes in-memory coordinates back to Idle.
 * 4. Transparent Fallback: If GPS is unavailable or denied, sets explicit FallbackReference/Denied/Unavailable states
 *    and NEVER masquerades fallback coordinates as genuine GPS telemetry.
 */
class LocationManager(private val context: Context) {
    private val _state = MutableStateFlow<GeolocationState>(GeolocationState.Idle)
    val state: StateFlow<GeolocationState> = _state.asStateFlow()

    fun hasLocationPermission(): Boolean {
        val finePermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val coarsePermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        return finePermission || coarsePermission
    }

    @SuppressLint("MissingPermission")
    fun requestLocation() {
        if (!hasLocationPermission()) {
            _state.value = GeolocationState.Denied("Location permission not granted. Please grant permission under DPDP consent.")
            return
        }

        _state.value = GeolocationState.Requesting
        val androidLocationManager = context.getSystemService(Context.LOCATION_SERVICE) as? AndroidLocationManager
        if (androidLocationManager == null) {
            _state.value = GeolocationState.Unavailable("Location service not found on device.")
            return
        }

        try {
            val providers = androidLocationManager.getProviders(true)
            var bestLocation: Location? = null
            for (provider in providers) {
                val loc = androidLocationManager.getLastKnownLocation(provider) ?: continue
                if (bestLocation == null || loc.accuracy < bestLocation.accuracy) {
                    bestLocation = loc
                }
            }

            if (bestLocation != null) {
                _state.value = GeolocationState.RealGps(
                    lat = bestLocation.latitude,
                    lon = bestLocation.longitude,
                    accuracyMeters = bestLocation.accuracy
                )
            } else {
                // Explicit Fallback Reference state when GPS hardware is cold/offline
                _state.value = GeolocationState.FallbackReference(
                    lat = DEFAULT_FALLBACK_LAT,
                    lon = DEFAULT_FALLBACK_LON,
                    referenceName = DEFAULT_FALLBACK_NAME
                )
            }
        } catch (e: Exception) {
            _state.value = GeolocationState.Denied(e.message ?: "Permission denied or location query failed.")
        }
    }

    fun setDenied(message: String = "Location permission denied by user. Showing estimates from Bhubaneswar Master Canteen.") {
        _state.value = GeolocationState.Denied(message)
    }

    fun clear() {
        _state.value = GeolocationState.Idle
    }

    companion object {
        const val DEFAULT_FALLBACK_LAT = 20.2961
        const val DEFAULT_FALLBACK_LON = 85.8245
        const val DEFAULT_FALLBACK_NAME = "Bhubaneswar Master Canteen"

        /**
         * Calculates great-circle Haversine geodesic distance in kilometers between two coordinates.
         * Explicitly represents straight-line distance, not road or transit routing distance.
         */
        fun haversineDistanceKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
            val r = 6371.0 // Earth radius in km
            val dLat = Math.toRadians(lat2 - lat1)
            val dLon = Math.toRadians(lon2 - lon1)
            val a = sin(dLat / 2).pow(2) + cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLon / 2).pow(2)
            val c = 2 * atan2(sqrt(a), sqrt(1 - a))
            return r * c
        }

        /**
         * Computes first-mile multimodal transit connection guidance based on straight-line distance in meters.
         * Used ONLY when genuine Real GPS coordinates are locked.
         * Thresholds:
         * - <= 800m: Walking recommendation (proximity estimate)
         * - 800m - 1500m: Walk or Short Auto recommendation
         * - > 1500m: Auto / Cab Recommended
         */
        fun getFirstMileRecommendation(distanceMeters: Double): String {
            return when {
                distanceMeters <= 800 -> "Walking proximity (≤ 800m straight-line)"
                distanceMeters <= 1500 -> "Walk or Short Auto proximity (800m–1.5km)"
                else -> "Auto / Cab proximity (> 1.5km)"
            }
        }
    }
}
