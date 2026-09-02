package com.otravelz.android.data.repository

import com.otravelz.android.core.error.AppError
import com.otravelz.android.core.network.NetworkClient
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.local.BundledCatalogProvider
import com.otravelz.android.data.model.DataProvenance
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.ProvenanceResult
import java.util.Collections

class PlacesRepository(
    private val apiService: ApiService = NetworkClient.apiService,
    private val bundledCatalogProvider: BundledCatalogProvider? = BundledCatalogProvider.getInstance()
) {
    private var memoryCachedPlaces: List<PlaceDetailDto>? = null

    // LRU Cache for place details (max 50 items)
    private val detailCache: MutableMap<String, PlaceDetailDto> = Collections.synchronizedMap(
        object : LinkedHashMap<String, PlaceDetailDto>(50, 0.75f, true) {
            override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, PlaceDetailDto>?): Boolean {
                return size > 50
            }
        }
    )

    suspend fun getPlacesWithProvenance(
        category: String? = null,
        district: String? = null
    ): NetworkResult<ProvenanceResult<List<PlaceDetailDto>>> {
        return try {
            val res = apiService.listPlaces(category = category, district = district)
            if (category == null && district == null) {
                memoryCachedPlaces = res
                // Pre-populate detail cache
                res.forEach { place -> detailCache[place.id] = place }
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
                    fallback.forEach { place -> detailCache[place.id] = place }
                    NetworkResult.Success(ProvenanceResult(fallback, DataProvenance.OFFLINE_FALLBACK))
                } else {
                    val appError = AppError.fromThrowable(e)
                    NetworkResult.Error(appError.message, cause = e)
                }
            } else {
                val appError = AppError.fromThrowable(e)
                NetworkResult.Error(appError.message, cause = e)
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
            res.forEach { place -> detailCache[place.id] = place }
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
                    fallback.forEach { place -> detailCache[place.id] = place }
                    return NetworkResult.Success(fallback)
                }
            }
            val appError = AppError.fromThrowable(e)
            NetworkResult.Error(appError.message, cause = e)
        }
    }

    suspend fun getPlaceById(id: String): NetworkResult<PlaceDetailDto> {
        // Fast LRU memory check
        detailCache[id]?.let { cached ->
            return NetworkResult.Success(cached)
        }

        return try {
            val res = apiService.getPlaceDetail(id)
            detailCache[id] = res
            NetworkResult.Success(res)
        } catch (e: retrofit2.HttpException) {
            // Check bundled fallback if 404 or server error
            bundledCatalogProvider?.getPlaceById(id)?.let {
                detailCache[id] = it
                return NetworkResult.Success(it)
            }
            val appError = AppError.fromThrowable(e)
            NetworkResult.Error(appError.message, cause = e)
        } catch (e: Exception) {
            // Check bundled fallback on offline/network exception
            bundledCatalogProvider?.getPlaceById(id)?.let {
                detailCache[id] = it
                return NetworkResult.Success(it)
            }
            val appError = AppError.fromThrowable(e)
            NetworkResult.Error(appError.message, cause = e)
        }
    }
}
