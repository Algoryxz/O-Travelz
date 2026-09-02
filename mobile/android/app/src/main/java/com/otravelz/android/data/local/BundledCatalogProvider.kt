package com.otravelz.android.data.local

import android.content.Context
import com.otravelz.android.core.location.LocationManager
import com.otravelz.android.data.model.PlaceDetailDto
import kotlinx.serialization.json.Json
import java.io.InputStreamReader

/**
 * Offline provider for canonical places bundled statically with the application.
 * Guaranteed to provide canonical places even in 100% offline or airplane mode cold starts.
 */
class BundledCatalogProvider(private val context: Context) {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
    }

    private var cachedPlaces: List<PlaceDetailDto>? = null

    @Synchronized
    fun getBundledPlaces(): List<PlaceDetailDto> {
        cachedPlaces?.let { return it }

        return try {
            context.assets.open(FALLBACK_ASSET_NAME).use { inputStream ->
                InputStreamReader(inputStream, Charsets.UTF_8).use { reader ->
                    val rawJson = reader.readText()
                    val list = json.decodeFromString<List<PlaceDetailDto>>(rawJson)
                    cachedPlaces = list
                    list
                }
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun getPlaceById(id: String): PlaceDetailDto? {
        return getBundledPlaces().firstOrNull { it.id == id }
    }

    fun searchPlaces(
        search: String? = null,
        category: String? = null,
        district: String? = null,
        limit: Int = 50
    ): List<PlaceDetailDto> {
        return getBundledPlaces()
            .asSequence()
            .filter { place ->
                val matchesCategory = category.isNullOrBlank() || category.equals("All", ignoreCase = true) ||
                        place.category.equals(category, ignoreCase = true)
                val matchesDistrict = district.isNullOrBlank() ||
                        place.district?.contains(district, ignoreCase = true) == true
                val matchesSearch = search.isNullOrBlank() ||
                        place.name.contains(search, ignoreCase = true) ||
                        (place.description?.contains(search, ignoreCase = true) == true)
                matchesCategory && matchesDistrict && matchesSearch
            }
            .take(limit)
            .toList()
    }

    fun getNearbyPlaces(
        lat: Double,
        lon: Double,
        category: String? = null,
        limit: Int = 30
    ): List<Pair<PlaceDetailDto, Double>> {
        return getBundledPlaces()
            .asSequence()
            .filter { place ->
                place.lat != null && place.lon != null &&
                        (category.isNullOrBlank() || category.equals("All", ignoreCase = true) || place.category.equals(category, ignoreCase = true))
            }
            .map { place ->
                val distKm = LocationManager.haversineDistanceKm(lat, lon, place.lat!!, place.lon!!)
                place to distKm
            }
            .sortedBy { it.second }
            .take(limit)
            .toList()
    }

    companion object {
        const val FALLBACK_ASSET_NAME = "places_canonical_fallback.json"

        @Volatile
        private var INSTANCE: BundledCatalogProvider? = null

        fun initialize(context: Context): BundledCatalogProvider {
            return getInstance(context) ?: synchronized(this) {
                INSTANCE ?: BundledCatalogProvider(context.applicationContext).also { INSTANCE = it }
            }
        }

        fun getInstance(context: Context? = null): BundledCatalogProvider? {
            if (INSTANCE != null) return INSTANCE
            if (context == null) return null
            return synchronized(this) {
                INSTANCE ?: BundledCatalogProvider(context.applicationContext).also { INSTANCE = it }
            }
        }
    }
}
