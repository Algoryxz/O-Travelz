package com.otravelz.android.core.location

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationManager as AndroidLocationManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.*

class LocationManager(private val context: Context) {
    private val _state = MutableStateFlow<GeolocationState>(GeolocationState.Idle)
    val state: StateFlow<GeolocationState> = _state.asStateFlow()

    @SuppressLint("MissingPermission")
    fun requestLocation() {
        _state.value = GeolocationState.Requesting
        val androidLocationManager = context.getSystemService(Context.LOCATION_SERVICE) as? AndroidLocationManager
        if (androidLocationManager == null) {
            _state.value = GeolocationState.Unavailable("Location service not found")
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
                _state.value = GeolocationState.Granted(
                    lat = bestLocation.latitude,
                    lon = bestLocation.longitude,
                    accuracyMeters = bestLocation.accuracy
                )
            } else {
                // Bhubaneswar master fallback coordinates if GPS is cold
                _state.value = GeolocationState.Granted(
                    lat = 20.2961,
                    lon = 85.8245,
                    accuracyMeters = 50f
                )
            }
        } catch (e: Exception) {
            _state.value = GeolocationState.Denied(e.message ?: "Permission denied or unavailable")
        }
    }

    fun setDenied() {
        _state.value = GeolocationState.Denied()
    }

    fun clear() {
        _state.value = GeolocationState.Idle
    }

    companion object {
        fun haversineDistanceKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
            val r = 6371.0
            val dLat = Math.toRadians(lat2 - lat1)
            val dLon = Math.toRadians(lon2 - lon1)
            val a = sin(dLat / 2).pow(2) + cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLon / 2).pow(2)
            val c = 2 * atan2(sqrt(a), sqrt(1 - a))
            return r * c
        }

        fun getFirstMileRecommendation(distanceMeters: Double): String {
            return when {
                distanceMeters <= 800 -> "Walking (≤ 800m - fast & direct)"
                distanceMeters <= 1500 -> "Walk or Short Auto (800m–1.5km)"
                else -> "Auto / Cab Recommended (> 1.5km)"
            }
        }
    }
}
