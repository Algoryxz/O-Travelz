package com.otravelz.android.data.repository

import com.otravelz.android.core.network.NetworkClient
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.local.BundledCatalogProvider
import com.otravelz.android.data.model.DataProvenance
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.ProvenanceResult

class PlacesRepository(
    private val apiService: ApiService = NetworkClient.apiService,
    private val bundledCatalogProvider: BundledCatalogProvider? = BundledCatalogProvider.getInstance()
) {
    private var memoryCachedPlaces: List<PlaceDetailDto>? = null

    suspend fun getPlacesWithProvenance(
        category: String? = null,
        district: String? = null
    ): NetworkResult<ProvenanceResult<List<PlaceDetailDto>>> {
        return try {
            val res = apiService.listPlaces(category = category, district = district)
            if (category == null && district == null) {
                memoryCachedPlaces = res
            }
            NetworkResult.Success(ProvenanceResult(res, DataProvenance.LIVE))
        } catch (e: Exception) {
            // Check memory cache
            val cached = memoryCachedPlaces
            if (cached != null && cached.isNotEmpty()) {
                val filtered = cached.filter { place ->
                    val matchCat = category.isNullOrBlank() || category.equals("All", ignoreCase = true) ||
                            place.category.equals(category, ignoreCase = true)
                    val matchDist = district.isNullOrBlank() ||
                            place.district?.contains(district, ignoreCase = true) == true
                    matchCat && matchDist
                }
                NetworkResult.Success(ProvenanceResult(filtered, DataProvenance.CACHED))
            } else if (bundledCatalogProvider != null) {
                // Offline bundled fallback
                val fallback = bundledCatalogProvider.searchPlaces(category = category, district = district)
                if (fallback.isNotEmpty()) {
                    NetworkResult.Success(ProvenanceResult(fallback, DataProvenance.OFFLINE_FALLBACK))
                } else {
                    NetworkResult.Error("Unable to load places. Please check connectivity.", cause = e)
                }
            } else {
                NetworkResult.Error("Unable to load places. Please check connectivity.", cause = e)
            }
        }
    }

    suspend fun getPlaces(category: String? = null, district: String? = null): NetworkResult<List<PlaceDetailDto>> {
        return when (val res = getPlacesWithProvenance(category, district)) {
            is NetworkResult.Success -> NetworkResult.Success(res.data.data)
            is NetworkResult.Error -> NetworkResult.Error(res.message, cause = res.cause)
            is NetworkResult.Loading -> NetworkResult.Loading
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
            if (bundledCatalogProvider != null) {
                val fallback = bundledCatalogProvider.searchPlaces(
                    search = search,
                    category = category,
                    district = district,
                    limit = limit
                )
                if (fallback.isNotEmpty()) {
                    return NetworkResult.Success(fallback)
                }
            }
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
            // Check bundled fallback if 404 or server error
            bundledCatalogProvider?.getPlaceById(id)?.let {
                return NetworkResult.Success(it)
            }
            val msg = if (e.code() == 404) "Place not found." else "Place details temporarily unavailable (HTTP ${e.code()})."
            NetworkResult.Error(msg, cause = e)
        } catch (e: Exception) {
            // Check bundled fallback on offline/network exception
            bundledCatalogProvider?.getPlaceById(id)?.let {
                return NetworkResult.Success(it)
            }
            android.util.Log.e("PlacesRepository", "Place detail failed for id='$id' [${e.javaClass.simpleName}]: ${e.message}", e)
            NetworkResult.Error("Unable to load place details (${e.javaClass.simpleName}: ${e.message})", cause = e)
        }
    }
}
