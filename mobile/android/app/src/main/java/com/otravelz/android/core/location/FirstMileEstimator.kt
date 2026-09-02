package com.otravelz.android.core.location

/**
 * Centralized First-Mile Multimodal Connection Guidance Engine.
 *
 * Standardized Thresholds:
 * - <= 800m: Walking (fast & direct)
 * - > 800m and <= 1500m: Walk or Short Auto (800m–1.5km)
 * - > 1500m: Auto / Cab Recommended (> 1.5km)
 */
object FirstMileEstimator {

    const val WALK_THRESHOLD_METERS = 800.0
    const val SHORT_AUTO_THRESHOLD_METERS = 1500.0

    const val RECOMMENDATION_WALK = "Walking (≤ 800m - fast & direct)"
    const val RECOMMENDATION_WALK_OR_AUTO = "Walk or Short Auto (800m–1.5km)"
    const val RECOMMENDATION_AUTO_CAB = "Auto / Cab Recommended (> 1.5km)"

    /**
     * Returns the standardized first-mile transit recommendation string for a given distance in meters.
     */
    fun getRecommendation(distanceMeters: Double): String {
        return when {
            distanceMeters <= WALK_THRESHOLD_METERS -> RECOMMENDATION_WALK
            distanceMeters <= SHORT_AUTO_THRESHOLD_METERS -> RECOMMENDATION_WALK_OR_AUTO
            else -> RECOMMENDATION_AUTO_CAB
        }
    }

    /**
     * Returns a short category label for first-mile mode.
     */
    fun getModeCategory(distanceMeters: Double): String {
        return when {
            distanceMeters <= WALK_THRESHOLD_METERS -> "WALK"
            distanceMeters <= SHORT_AUTO_THRESHOLD_METERS -> "WALK_AUTO"
            else -> "AUTO_CAB"
        }
    }
}
