package com.otravelz.android.data.repository

import com.otravelz.android.core.network.NetworkClient
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.model.WeatherResponseDto

class WeatherRepository(private val apiService: ApiService = NetworkClient.apiService) {

    private var cachedWeather: WeatherResponseDto? = null
    private var lastFetchTimestamp: Long = 0L
    private val cacheDurationMs: Long = 5 * 60 * 1000L // 5 minutes

    suspend fun getWeather(
        lat: Double = 20.2961,
        lon: Double = 85.8245,
        locationName: String? = "Bhubaneswar",
        forceRefresh: Boolean = false
    ): NetworkResult<WeatherResponseDto> {
        val now = System.currentTimeMillis()
        if (!forceRefresh && cachedWeather != null && (now - lastFetchTimestamp) < cacheDurationMs) {
            return NetworkResult.Success(cachedWeather!!)
        }

        return try {
            val res = apiService.getCurrentWeather(lat = lat, lon = lon, locationName = locationName)
            cachedWeather = res
            lastFetchTimestamp = now
            NetworkResult.Success(res)
        } catch (e: Exception) {
            // If network fails, return cached weather if available
            cachedWeather?.let {
                return NetworkResult.Success(it)
            }
            NetworkResult.Error("Live weather unavailable", cause = e)
        }
    }
}
