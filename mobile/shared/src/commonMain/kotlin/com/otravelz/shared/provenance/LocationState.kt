package com.otravelz.shared.provenance

import com.otravelz.shared.geo.GeoPoint
import com.otravelz.shared.geo.OdishaBounds

/**
 * Domain representation of mobile location state.
 *
 * Enforces strict separation between genuine live device GPS telemetry and fixed geographic
 * reference datums (e.g. Master Canteen).
 *
 * CRITICAL INVARIANT:
 * A reference datum coordinate must NEVER masquerade as live GPS or deceive the user into believing
 * it represents their physical position.
 */
sealed class LocationState {
    /**
     * True strictly when telemetry originates from active hardware GPS.
     */
    abstract val isLiveDeviceLocation: Boolean

    /**
     * Returns live device coordinates when active, or the canonical Bhubaneswar Master Canteen
     * reference origin ($20.2961^\circ\text{N}, 85.8245^\circ\text{E}$) for all non-GPS states.
     */
    abstract fun coordinatesOrFallback(): GeoPoint

    /**
     * Genuine device hardware GPS lock.
     */
    data class LiveDeviceLocation(
        val point: GeoPoint,
        val accuracyMeters: Double? = null
    ) : LocationState() {
        override val isLiveDeviceLocation: Boolean = true
        override fun coordinatesOrFallback(): GeoPoint = point
    }

    /**
     * Fixed reference datum (e.g. Master Canteen). Used when GPS is uninitialized or explicitly in datum mode.
     */
    data class ReferenceOrigin(
        val point: GeoPoint = OdishaBounds.MASTER_CANTEEN,
        val label: String = "Bhubaneswar Master Canteen"
    ) : LocationState() {
        override val isLiveDeviceLocation: Boolean = false
        override fun coordinatesOrFallback(): GeoPoint = point
    }

    /**
     * Explicit runtime permission denial by the user.
     */
    data class PermissionDenied(
        val fallbackPoint: GeoPoint = OdishaBounds.MASTER_CANTEEN,
        val message: String = "Location permission denied. Distances measured from Bhubaneswar Master Canteen reference datum."
    ) : LocationState() {
        override val isLiveDeviceLocation: Boolean = false
        override fun coordinatesOrFallback(): GeoPoint = fallbackPoint
    }

    /**
     * Hardware GPS sensor is disabled, offline, or timed out.
     */
    data class Unavailable(
        val fallbackPoint: GeoPoint = OdishaBounds.MASTER_CANTEEN,
        val message: String = "GPS hardware unavailable. Distances measured from Bhubaneswar Master Canteen reference datum."
    ) : LocationState() {
        override val isLiveDeviceLocation: Boolean = false
        override fun coordinatesOrFallback(): GeoPoint = fallbackPoint
    }
}
