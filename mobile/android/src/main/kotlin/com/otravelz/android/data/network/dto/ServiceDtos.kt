package com.otravelz.android.data.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ServiceItemDto(
    val id: String,
    val name: String,
    val category: String,
    val lat: Double? = null,
    val lon: Double? = null,
    @SerialName("distance_km") val distanceKm: Double? = null,
    val address: String? = null,
    val phone: String? = null
)

@Serializable
data class NearbyServicesResponseDto(
    @SerialName("query_lat") val queryLat: Double,
    @SerialName("query_lon") val queryLon: Double,
    val category: String? = null,
    @SerialName("requested_radius_km") val requestedRadiusKm: Double = 5.0,
    @SerialName("active_radius_km") val activeRadiusKm: Double = 5.0,
    @SerialName("is_expanded") val isExpanded: Boolean = false,
    val count: Int = 0,
    @SerialName("distance_semantics") val distanceSemantics: String? = null,
    val services: List<ServiceItemDto> = emptyList()
)
