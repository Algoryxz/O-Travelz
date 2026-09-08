package com.otravelz.android.data.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TransitRouteDto(
    val id: String,
    @SerialName("route_number") val routeNumber: String? = null,
    val name: String? = null,
    val operator: String? = null,
    val origin: String? = null,
    val destination: String? = null,
    val via: List<String>? = null,
    @SerialName("stops_count") val stopsCount: Int? = null,
    @SerialName("total_distance_km") val totalDistanceKm: Double? = null
)

@Serializable
data class RouteListDto(
    val total: Int = 0,
    val limit: Int = 0,
    val offset: Int = 0,
    val routes: List<TransitRouteDto> = emptyList()
)

@Serializable
data class RouteGeometryDto(
    @SerialName("route_id") val routeId: String,
    val coordinates: List<List<Double>> = emptyList()
)

@Serializable
data class StopNearbyDto(
    @SerialName("stop_id") val stopId: String,
    val name: String,
    @SerialName("published_name") val publishedName: String? = null,
    @SerialName("canonical_stop_id") val canonicalStopId: String? = null,
    val city: String? = null,
    val district: String? = null,
    val locality: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    @SerialName("coordinate_status") val coordinateStatus: String? = null,
    @SerialName("distance_m") val distanceM: Double? = null,
    @SerialName("walking_estimate_mins") val walkingEstimateMins: Int? = null,
    @SerialName("routes_serving_stop") val routesServingStop: List<String> = emptyList()
)
