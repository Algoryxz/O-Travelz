package com.otravelz.shared.repository

import com.otravelz.shared.geo.GeoPoint
import com.otravelz.shared.i18n.LocalizedNames
import com.otravelz.shared.provenance.WeatherState

/**
 * Minimal domain model for a destination summary.
 */
data class PlaceSummary(
    val id: String,
    val name: String,
    val category: String,
    val district: String?,
    val coordinate: GeoPoint?,
    val description: String?,
    val isVerified: Boolean = false,
    val localizedNames: LocalizedNames? = null
)

/**
 * Minimal domain model for a transit stop.
 */
data class TransitStopSummary(
    val stopId: String,
    val name: String,
    val coordinate: GeoPoint?,
    val isInterchange: Boolean = false,
    val servedRoutes: List<String> = emptyList(),
    val localizedNames: LocalizedNames? = null
)

/**
 * Minimal domain model for an itinerary planning request.
 */
data class ItineraryPlanningRequest(
    val days: Int,
    val startOrigin: String = "Bhubaneswar",
    val interests: List<String> = emptyList(),
    val publicTransportPreferred: Boolean = false
)

/**
 * Repository interface for cultural destinations and places catalog.
 */
interface PlacesRepository {
    suspend fun getFeaturedPlaces(): List<PlaceSummary>
    suspend fun getPlaceById(id: String): PlaceSummary?
    suspend fun searchPlaces(query: String, district: String? = null, category: String? = null): List<PlaceSummary>
}

/**
 * Repository interface for public transit network and timetables.
 */
interface TransitRepository {
    suspend fun getAllStops(): List<TransitStopSummary>
    suspend fun getStopById(stopId: String): TransitStopSummary?
    suspend fun getDeparturesForRoute(routeNumber: String): List<String>
}

/**
 * Repository interface for live / fallback weather observations.
 */
interface WeatherRepository {
    suspend fun getWeather(coordinate: GeoPoint): WeatherState
}
