package com.otravelz.android.data.repository

import com.otravelz.android.core.network.NetworkClient
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.model.PlaceDetailDto

class PlacesRepository(private val apiService: ApiService = NetworkClient.apiService) {

    suspend fun getPlaces(category: String? = null, district: String? = null): NetworkResult<List<PlaceDetailDto>> {
        return try {
            val res = apiService.listPlaces(category = category, district = district)
            NetworkResult.Success(res)
        } catch (e: Exception) {
            NetworkResult.Error("Unable to load places. Please check connectivity.", cause = e)
        }
    }

    suspend fun getPlaceById(id: String): NetworkResult<PlaceDetailDto> {
        return try {
            val res = apiService.getPlaceDetail(id)
            NetworkResult.Success(res)
        } catch (e: Exception) {
            NetworkResult.Error("Unable to load place details.", cause = e)
        }
    }
}
