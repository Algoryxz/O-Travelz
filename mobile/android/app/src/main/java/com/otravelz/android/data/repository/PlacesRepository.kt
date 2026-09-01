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

    suspend fun searchPlaces(
        search: String? = null,
        category: String? = null,
        district: String? = null,
        limit: Int = 50
    ): NetworkResult<List<PlaceDetailDto>> {
        return try {
            val res = apiService.listPlaces(
                category = category?.ifBlank { null },
                district = district?.ifBlank { null },
                search = search?.ifBlank { null },
                limit = limit
            )
            NetworkResult.Success(res)
        } catch (e: Exception) {
            NetworkResult.Error("Unable to search places. Please check connectivity.", cause = e)
        }
    }

    suspend fun getPlaceById(id: String): NetworkResult<PlaceDetailDto> {
        return try {
            android.util.Log.d("PlacesRepository", "Fetching place detail for id='$id'")
            val res = apiService.getPlaceDetail(id)
            android.util.Log.d("PlacesRepository", "Successfully fetched place detail: ${res.name}")
            NetworkResult.Success(res)
        } catch (e: retrofit2.HttpException) {
            val errorBody = e.response()?.errorBody()?.string()
            android.util.Log.e("PlacesRepository", "Place detail HTTP ${e.code()} for id='$id'. Body: $errorBody", e)
            val msg = if (e.code() == 404) "Place not found." else "Place details temporarily unavailable (HTTP ${e.code()})."
            NetworkResult.Error(msg, cause = e)
        } catch (e: kotlinx.serialization.SerializationException) {
            android.util.Log.e("PlacesRepository", "Place detail JSON deserialization failed for id='$id'", e)
            NetworkResult.Error("Place data format error: ${e.message}", cause = e)
        } catch (e: Exception) {
            android.util.Log.e("PlacesRepository", "Place detail failed for id='$id' [${e.javaClass.simpleName}]: ${e.message}", e)
            NetworkResult.Error("Unable to load place details (${e.javaClass.simpleName}: ${e.message})", cause = e)
        }
    }
}
