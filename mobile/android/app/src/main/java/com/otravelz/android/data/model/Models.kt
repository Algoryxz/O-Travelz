package com.otravelz.android.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// TEMPORARY_OPENAPI_MIRROR: Mirrored strictly from shared/openapi/openapi.json

@Serializable
data class PlaceImageDto(
    val id: String? = null,
    val url: String,
    @SerialName("thumbnail_url") val thumbnailUrl: String? = null,
    @SerialName("card_url") val cardUrl: String? = null,
    @SerialName("alt_text") val altText: String? = null,
    @SerialName("is_primary") val isPrimary: Boolean = false
)

@Serializable
data class PlaceSummaryDto(
    val id: String,
    val name: String,
    val category: String,
    val location: String? = null,
    val lat: Double? = null,
    val lon: Double? = null,
    val description: String? = null
)

@Serializable
data class PlaceDetailDto(
    val id: String,
    val name: String,
    val category: String,
    val description: String? = null,
    val lat: Double? = null,
    val lon: Double? = null,
    val district: String? = null,
    val region: String? = null,
    @SerialName("avg_visit_minutes") val avgVisitMinutes: Int? = null,
    @SerialName("price_tier") val priceTier: String? = null,
    val rating: Double? = null,
    @SerialName("rating_count") val ratingCount: Int? = null,
    @SerialName("rating_source") val ratingSource: String? = null,
    @SerialName("verification_status") val verificationStatus: String? = null,
    @SerialName("contact_phone") val contactPhone: String? = null,
    @SerialName("emergency_phone") val emergencyPhone: String? = null,
    val address: String? = null,
    val images: List<PlaceImageDto> = emptyList(),
    val interests: List<String> = emptyList()
)

@Serializable
data class WeatherObservationDto(
    val temperature: Double? = null,
    @SerialName("apparent_temperature") val apparentTemperature: Double? = null,
    @SerialName("relative_humidity_2m") val relativeHumidity: Double? = null,
    @SerialName("weather_code") val weatherCode: Int? = null,
    val condition: String? = null,
    @SerialName("wind_speed_10m") val windSpeed: Double? = null,
    @SerialName("is_day") val isDay: Int? = null
)

@Serializable
data class WeatherResponseDto(
    @SerialName("location_name") val locationName: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val current: WeatherObservationDto? = null,
    @SerialName("data_tier") val dataTier: String = "unknown"
)

@Serializable
data class PlanningConstraintsDto(
    @SerialName("start_date") val startDate: String? = null,
    @SerialName("duration_days") val durationDays: Int = 1,
    @SerialName("origin_lat") val originLat: Double = 20.2961,
    @SerialName("origin_lon") val originLon: Double = 85.8245,
    val interests: List<String> = emptyList(),
    val categories: List<String> = emptyList(),
    @SerialName("max_travel_time_minutes") val maxTravelTimeMinutes: Int? = null
)

@Serializable
data class TransportLegDto(
    val mode: String,
    val detail: String,
    val provider: String? = null,
    val route: String? = null
)

@Serializable
data class TransportHopDto(
    @SerialName("from_sequence") val fromSequence: Int,
    @SerialName("to_sequence") val toSequence: Int,
    val mode: String,
    @SerialName("estimated_minutes") val estimatedMinutes: Int? = null,
    @SerialName("estimated_cost") val estimatedCost: Double? = null,
    val legs: List<TransportLegDto> = emptyList(),
    @SerialName("data_tier") val dataTier: String = "scheduled",
    val reason: String? = null
)

@Serializable
data class ItineraryStopDto(
    val sequence: Int,
    val place: PlaceSummaryDto,
    @SerialName("planned_arrival") val plannedArrival: String? = null,
    @SerialName("planned_departure") val plannedDeparture: String? = null,
    @SerialName("duration_minutes") val durationMinutes: Int? = null
)

@Serializable
data class ItineraryDayDto(
    @SerialName("day_number") val dayNumber: Int,
    val date: String? = null,
    val theme: String? = null,
    val stops: List<ItineraryStopDto> = emptyList(),
    val hops: List<TransportHopDto> = emptyList()
)

@Serializable
data class ItineraryPlanResponseDto(
    @SerialName("itinerary_id") val itineraryId: String,
    val constraints: PlanningConstraintsDto,
    val days: List<ItineraryDayDto> = emptyList(),
    val explanation: String
)

@Serializable
data class AIPlanRequestDto(
    val message: String,
    val constraints: PlanningConstraintsDto? = null
)

@Serializable
data class AIResponseDto(
    val message: String,
    val itinerary: ItineraryPlanResponseDto? = null,
    val status: String
)

@Serializable
data class ServingRouteDto(
    @SerialName("route_id") val routeId: String,
    @SerialName("route_number") val routeNumber: String,
    @SerialName("route_name") val routeName: String? = null,
    @SerialName("service_area") val serviceArea: String? = null
)

@Serializable
data class NearbyStopDto(
    @SerialName("stop_id") val stopId: String,
    val name: String,
    @SerialName("published_name") val publishedName: String? = null,
    val latitude: Double,
    val longitude: Double,
    @SerialName("distance_m") val distanceMeters: Double,
    @SerialName("walking_estimate_mins") val walkingEstimateMins: Int,
    @SerialName("routes_serving_stop") val routes: List<ServingRouteDto> = emptyList()
)

@Serializable
data class SyncPlaceItemDto(
    @SerialName("place_id") val placeId: String,
    @SerialName("place_name") val placeName: String? = null,
    @SerialName("saved_at") val savedAt: Long,
    @SerialName("updated_at") val updatedAt: Long,
    @SerialName("is_deleted") val isDeleted: Boolean = false
)

@Serializable
data class SyncSavedPlacesRequestDto(
    val items: List<SyncPlaceItemDto> = emptyList()
)

@Serializable
data class SyncSavedPlacesResponseDto(
    @SerialName("synced_count") val syncedCount: Int,
    val items: List<SyncPlaceItemDto> = emptyList()
)

@Serializable
data class CreateShareTripRequestDto(
    val title: String,
    val itinerary: ItineraryPlanResponseDto,
    val constraints: PlanningConstraintsDto? = null
)

@Serializable
data class CreateShareTripResponseDto(
    @SerialName("share_id") val shareId: String,
    @SerialName("share_url") val shareUrl: String,
    @SerialName("created_at") val createdAt: Long
)

@Serializable
data class SyncTripItemDto(
    val id: String,
    val title: String,
    val timestamp: Long,
    @SerialName("updated_at") val updatedAt: Long,
    @SerialName("is_deleted") val isDeleted: Boolean = false,
    val itinerary: ItineraryPlanResponseDto? = null,
    val constraints: PlanningConstraintsDto? = null
)

@Serializable
data class SyncTripsRequestDto(
    val items: List<SyncTripItemDto> = emptyList()
)

@Serializable
data class SyncTripsResponseDto(
    @SerialName("synced_count") val syncedCount: Int,
    val items: List<SyncTripItemDto> = emptyList()
)
