package com.otravelz.android.data.repository

import com.otravelz.android.core.network.NetworkClient
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.model.NearbyStopDto

class TransitRepository(private val apiService: ApiService = NetworkClient.apiService) {

    suspend fun getNearbyStops(
        lat: Double,
        lon: Double,
        radiusM: Int = 3000,
        limit: Int = 10
    ): NetworkResult<List<NearbyStopDto>> {
        return try {
            val res = apiService.getNearbyStops(lat = lat, lon = lon, radiusM = radiusM, limit = limit)
            NetworkResult.Success(res)
        } catch (e: Exception) {
            NetworkResult.Error("Unable to fetch nearby Mo Bus stops", cause = e)
        }
    }
}
