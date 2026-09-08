package com.otravelz.android.data.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CurrentWeatherDto(
    @SerialName("location_name") val locationName: String? = null,
    val lat: Double? = null,
    val lon: Double? = null,
    @SerialName("observed_at") val observedAt: String? = null,
    @SerialName("temperature_c") val temperatureC: Double? = null,
    @SerialName("apparent_temperature_c") val apparentTemperatureC: Double? = null,
    val condition: String? = null,
    @SerialName("condition_code") val conditionCode: Int? = null,
    @SerialName("is_day") val isDay: Int? = null,
    @SerialName("humidity_pct") val humidityPct: Int? = null,
    @SerialName("precipitation_probability_pct") val precipitationProbabilityPct: Int? = null,
    @SerialName("precipitation_mm") val precipitationMm: Double? = null,
    @SerialName("wind_speed_kmh") val windSpeedKmh: Double? = null,
    val advice: String? = null,
    val provider: String? = null,
    val status: String? = null,
    @SerialName("error_reason") val errorReason: String? = null
)

@Serializable
data class DailyForecastDto(
    val date: String,
    @SerialName("temperature_max_c") val temperatureMaxC: Double? = null,
    @SerialName("temperature_min_c") val temperatureMinC: Double? = null,
    @SerialName("apparent_temperature_max_c") val apparentTemperatureMaxC: Double? = null,
    @SerialName("apparent_temperature_min_c") val apparentTemperatureMinC: Double? = null,
    val condition: String? = null,
    @SerialName("condition_code") val conditionCode: Int? = null,
    @SerialName("precipitation_probability_pct") val precipitationProbabilityPct: Int? = null,
    @SerialName("precipitation_sum_mm") val precipitationSumMm: Double? = null,
    val sunrise: String? = null,
    val sunset: String? = null
)

@Serializable
data class WeatherResponseDto(
    @SerialName("location_name") val locationName: String? = null,
    val current: CurrentWeatherDto? = null,
    @SerialName("forecast_daily") val forecastDaily: List<DailyForecastDto> = emptyList()
)
