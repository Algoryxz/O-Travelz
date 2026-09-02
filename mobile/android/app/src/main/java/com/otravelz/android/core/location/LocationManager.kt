package com.otravelz.android.core.location

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager as AndroidLocationManager
import android.os.Bundle
import android.os.Looper
import androidx.core.content.ContextCompat
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.*

/**
 * Lifecycle-aware Geolocation Manager with transparent reference-origin fallback.
 *
 * Invariants:
 * 1. Strictly in-memory state: Coordinates are never persisted to disk, Room, or SharedPreferences.
 * 2. Explicit User Consent: Location queries are triggered solely by direct user interaction.
 * 3. Right to Clear/Revoke: The clear() method immediately wipes in-memory coordinates.
 * 4. Transparent Reference Origin: If GPS hardware is unavailable or denied, uses explicit ReferenceOrigin state.
 * 5. Lifecycle Management: Stops active GPS hardware polling when screens unmount to conserve battery.
 */
class LocationManager(private val context: Context) {
    private val _state = MutableStateFlow<GeolocationState>(GeolocationState.Idle)
    val state: StateFlow<GeolocationState> = _state.asStateFlow()

    private val androidLocationManager = context.getSystemService(Context.LOCATION_SERVICE) as? AndroidLocationManager
    private var activeListener: LocationListener? = null

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
            _state.value = GeolocationState.PermissionDenied("Location permission not granted. Using Bhubaneswar reference origin.")
            return
        }

        _state.value = GeolocationState.Requesting
        if (androidLocationManager == null) {
            _state.value = GeolocationState.GpsUnavailable("Location service not found on device.")
            return
        }

        try {
            // Check last known location first for immediate responsiveness
            var bestLocation: Location? = null
            val providers = androidLocationManager.getProviders(true)
            for (provider in providers) {
                val loc = androidLocationManager.getLastKnownLocation(provider) ?: continue
                if (bestLocation == null || loc.accuracy < bestLocation.accuracy) {
                    bestLocation = loc
                }
            }

            if (bestLocation != null) {
                _state.value = GeolocationState.LastKnownLocation(
                    lat = bestLocation.latitude,
                    lon = bestLocation.longitude,
                    accuracyMeters = bestLocation.accuracy,
                    timestamp = bestLocation.time
                )
            } else {
                _state.value = GeolocationState.ReferenceOrigin()
            }

            // Register active updates for live GPS fix
            startLocationUpdates()
        } catch (e: Exception) {
            _state.value = GeolocationState.PermissionDenied(e.message ?: "Permission denied or location query failed.")
        }
    }

    @SuppressLint("MissingPermission")
    fun startLocationUpdates() {
        if (!hasLocationPermission() || androidLocationManager == null) return
        stopLocationUpdates()

        val listener = object : LocationListener {
            override fun onLocationChanged(location: Location) {
                _state.value = GeolocationState.LiveLocation(
                    lat = location.latitude,
                    lon = location.longitude,
                    accuracyMeters = location.accuracy,
                    timestamp = location.time
                )
            }

            override fun onProviderEnabled(provider: String) {}
            override fun onProviderDisabled(provider: String) {
                if (_state.value is GeolocationState.LiveLocation) {
                    _state.value = GeolocationState.ReferenceOrigin()
                }
            }
            @Deprecated("Deprecated in Java")
            override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
        }

        activeListener = listener

        try {
            if (androidLocationManager.isProviderEnabled(AndroidLocationManager.GPS_PROVIDER)) {
                androidLocationManager.requestLocationUpdates(
                    AndroidLocationManager.GPS_PROVIDER,
                    5000L,
                    10f,
                    listener,
                    Looper.getMainLooper()
                )
            }
            if (androidLocationManager.isProviderEnabled(AndroidLocationManager.NETWORK_PROVIDER)) {
                androidLocationManager.requestLocationUpdates(
                    AndroidLocationManager.NETWORK_PROVIDER,
                    5000L,
                    10f,
                    listener,
                    Looper.getMainLooper()
                )
            }
        } catch (_: Exception) {}
    }

    fun stopLocationUpdates() {
        activeListener?.let { listener ->
            try {
                androidLocationManager?.removeUpdates(listener)
            } catch (_: Exception) {}
            activeListener = null
        }
    }

    fun setDenied(message: String = "Location permission denied by user.") {
        stopLocationUpdates()
        _state.value = GeolocationState.PermissionDenied(message)
    }

    fun clear() {
        stopLocationUpdates()
        _state.value = GeolocationState.Idle
    }

    companion object {
        const val DEFAULT_FALLBACK_LAT = 20.2961
        const val DEFAULT_FALLBACK_LON = 85.8245

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
         * Computes first-mile multimodal transit connection guidance based on distance in meters.
         * Delegates to standardized FirstMileEstimator.
         */
        fun getFirstMileRecommendation(distanceMeters: Double): String {
            return FirstMileEstimator.getRecommendation(distanceMeters)
        }
    }
}
