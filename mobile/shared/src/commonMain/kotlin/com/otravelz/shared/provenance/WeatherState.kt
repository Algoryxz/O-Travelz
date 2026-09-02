package com.otravelz.shared.provenance

/**
 * Domain representation of weather observation state.
 *
 * CRITICAL INVARIANT:
 * Missing weather observations must remain explicitly `null` with [dataTier] = [DataTier.UNAVAILABLE].
 * Missing weather must NEVER default to 0°C, 0% rain, or fake "clear" skies.
 */
data class WeatherState(
    val temperatureC: Double? = null,
    val apparentTemperatureC: Double? = null,
    val relativeHumidityPercent: Double? = null,
    val weatherCode: Int? = null,
    val conditionName: String? = null,
    val windSpeedKmh: Double? = null,
    val isDay: Boolean? = null,
    val dataTier: DataTier = DataTier.UNAVAILABLE,
    val locationName: String? = null
) {
    /**
     * True strictly when valid, non-null temperature observation data is present.
     */
    val hasValidObservation: Boolean
        get() = temperatureC != null && dataTier != DataTier.UNAVAILABLE

    companion object {
        /**
         * Standard unavailable state representing missing weather telemetry.
         */
        val UNAVAILABLE: WeatherState = WeatherState(dataTier = DataTier.UNAVAILABLE)
    }
}
