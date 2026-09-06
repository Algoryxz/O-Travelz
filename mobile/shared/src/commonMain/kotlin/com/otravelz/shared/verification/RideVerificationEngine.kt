package com.otravelz.shared.verification

import com.otravelz.shared.geo.GeoPoint
import com.otravelz.shared.provenance.LocationState

/**
 * Stop observation types supported during ride verification and local confirmation.
 */
enum class ObservationType {
    BOARDING,
    ALIGHTING,
    BUS_STOPPED,
    LOCAL_CONFIRMATION
}

/**
 * High-frequency GPS sample captured during an active ride.
 */
data class RideTelemetrySample(
    val timestampMillis: Long,
    val point: GeoPoint,
    val accuracyMeters: Double,
    val speedMps: Double? = null,
    val headingDeg: Double? = null
)

/**
 * Explicit transit event captured during or outside a ride.
 */
data class StopObservationEvent(
    val type: ObservationType,
    val point: GeoPoint,
    val accuracyMeters: Double,
    val timestampMillis: Long,
    val stopId: String? = null,
    val note: String? = null
)

/**
 * Rider verification state machine.
 */
sealed class VerificationSessionState {
    object Idle : VerificationSessionState()

    data class Recording(
        val sessionId: String,
        val routeNumber: String,
        val direction: String,
        val sampleCount: Int,
        val eventsCount: Int,
        val startedAtMillis: Long,
        val lastPoint: GeoPoint? = null
    ) : VerificationSessionState()

    data class Completed(
        val sessionId: String,
        val routeNumber: String,
        val sampleCount: Int,
        val eventsCount: Int
    ) : VerificationSessionState()
}

/**
 * Mobile client engine managing the lifecycle of a verification ride session.
 *
 * Enforces:
 * - Live hardware GPS gating (Reference origins and denied permissions are strictly rejected).
 * - Single-tap action logging without keyboard typing while in motion.
 * - Local telemetry buffering.
 */
class RideVerificationEngine {
    private var state: VerificationSessionState = VerificationSessionState.Idle
    private val samples = mutableListOf<RideTelemetrySample>()
    private val events = mutableListOf<StopObservationEvent>()

    fun currentState(): VerificationSessionState = state
    fun getBufferedSamples(): List<RideTelemetrySample> = samples.toList()
    fun getBufferedEvents(): List<StopObservationEvent> = events.toList()

    fun startSession(
        sessionId: String,
        routeNumber: String,
        direction: String = "forward",
        timestampMillis: Long
    ): VerificationSessionState {
        samples.clear()
        events.clear()
        state = VerificationSessionState.Recording(
            sessionId = sessionId,
            routeNumber = routeNumber,
            direction = direction,
            sampleCount = 0,
            eventsCount = 0,
            startedAtMillis = timestampMillis
        )
        return state
    }

    fun recordSample(
        locationState: LocationState,
        timestampMillis: Long,
        speedMps: Double? = null,
        headingDeg: Double? = null
    ): Boolean {
        val recording = state as? VerificationSessionState.Recording ?: return false
        // STRICT INVARIANT: Only genuine live GPS is accepted, NEVER fixed reference datums!
        if (locationState !is LocationState.LiveDeviceLocation) {
            return false
        }
        val acc = locationState.accuracyMeters ?: 10.0
        // Reject noisy samples
        if (acc > 40.0) return false

        val sample = RideTelemetrySample(
            timestampMillis = timestampMillis,
            point = locationState.point,
            accuracyMeters = acc,
            speedMps = speedMps,
            headingDeg = headingDeg
        )
        samples.add(sample)
        state = recording.copy(
            sampleCount = samples.size,
            lastPoint = locationState.point
        )
        return true
    }

    fun recordEvent(
        type: ObservationType,
        locationState: LocationState,
        timestampMillis: Long,
        stopId: String? = null,
        note: String? = null
    ): Boolean {
        val recording = state as? VerificationSessionState.Recording ?: return false
        if (locationState !is LocationState.LiveDeviceLocation) {
            return false
        }
        val event = StopObservationEvent(
            type = type,
            point = locationState.point,
            accuracyMeters = locationState.accuracyMeters ?: 10.0,
            timestampMillis = timestampMillis,
            stopId = stopId,
            note = note
        )
        events.add(event)
        state = recording.copy(
            eventsCount = events.size
        )
        return true
    }

    fun finishSession(): VerificationSessionState {
        val recording = state as? VerificationSessionState.Recording ?: return state
        state = VerificationSessionState.Completed(
            sessionId = recording.sessionId,
            routeNumber = recording.routeNumber,
            sampleCount = samples.size,
            eventsCount = events.size
        )
        return state
    }
}
