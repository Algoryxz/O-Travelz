package com.otravelz.shared.engine

/**
 * Classification bands for first-mile multimodal transit access.
 */
enum class FirstMileBand {
    /**
     * Straight-line distance <= 800m. Pedestrian walking is reasonable for most travelers.
     */
    WALK_REASONABLE,

    /**
     * Straight-line distance > 800m and <= 1500m. Walking or a short auto-rickshaw connection is appropriate.
     */
    WALK_OR_SHORT_AUTO,

    /**
     * Straight-line distance > 1500m. Auto-rickshaw, taxi, or connecting public transit is recommended.
     */
    AUTO_OR_CAB_RECOMMENDED
}

/**
 * Pure domain result for first-mile multimodal guidance.
 */
data class FirstMileGuidance(
    val band: FirstMileBand,
    val distanceMeters: Double
)

/**
 * Canonical first-mile proximity classifier.
 *
 * Enforces single canonical thresholds across all platforms:
 * - <= 800m: WALK_REASONABLE
 * - 800m < d <= 1500m: WALK_OR_SHORT_AUTO
 * - > 1500m: AUTO_OR_CAB_RECOMMENDED
 *
 * CRITICAL INVARIANT:
 * Personalized first-mile recommendations are evaluated strictly when [isRealGps] is true.
 * When [isRealGps] is false (e.g. Reference Origin datum or permission denied), evaluation
 * returns `null` to prevent misleading walking recommendations against standard fallback coordinates.
 */
object FirstMileEngine {
    const val THRESHOLD_WALK_METERS: Double = 800.0
    const val THRESHOLD_SHORT_AUTO_METERS: Double = 1500.0

    /**
     * Evaluates first-mile guidance for a given distance in meters and GPS authenticity flag.
     *
     * @param distanceMeters The straight-line distance to the target in meters.
     * @param isRealGps True strictly when telemetry originates from live hardware GPS.
     * @return [FirstMileGuidance] when [isRealGps] is true; `null` otherwise.
     */
    fun evaluate(distanceMeters: Double, isRealGps: Boolean): FirstMileGuidance? {
        if (!isRealGps) return null

        require(!distanceMeters.isNaN() && distanceMeters >= 0.0) {
            "Distance in meters must be a non-negative number. Received: $distanceMeters"
        }

        val band = when {
            distanceMeters <= THRESHOLD_WALK_METERS -> FirstMileBand.WALK_REASONABLE
            distanceMeters <= THRESHOLD_SHORT_AUTO_METERS -> FirstMileBand.WALK_OR_SHORT_AUTO
            else -> FirstMileBand.AUTO_OR_CAB_RECOMMENDED
        }

        return FirstMileGuidance(band = band, distanceMeters = distanceMeters)
    }
}
