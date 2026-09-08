package com.otravelz.android.data.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ItineraryPlanRequestDto(
    val days: Int,
    val interests: List<String> = emptyList(),
    val pace: String? = null,
    val start: String? = null,
    @SerialName("budget_transport_per_day") val budgetTransportPerDay: Double? = null,
    @SerialName("low_walking") val lowWalking: Boolean? = null,
    val vegetarian: Boolean? = null,
    @SerialName("avoid_crowds") val avoidCrowds: Boolean? = null,
    @SerialName("public_transport_preferred") val publicTransportPreferred: Boolean? = null,
    @SerialName("budget_conscious") val budgetConscious: Boolean? = null
)

@Serializable
data class PlaceSummaryDto(
    val id: String,
    val name: String,
    val category: String
)

@Serializable
data class TransportLegDto(
    val mode: String? = null,
    val detail: String? = null,
    val provider: String? = null,
    val route: String? = null
)

@Serializable
data class TransportHopDto(
    @SerialName("from_sequence") val fromSequence: Int? = null,
    @SerialName("to_sequence") val toSequence: Int? = null,
    val mode: String? = null,
    @SerialName("estimated_minutes") val estimatedMinutes: Int? = null,
    @SerialName("estimated_cost") val estimatedCost: Double? = null,
    val legs: List<TransportLegDto> = emptyList(),
    @SerialName("data_tier") val dataTier: String? = null,
    val reason: String? = null,
    @SerialName("from_stop_id") val fromStopId: String? = null,
    @SerialName("to_stop_id") val toStopId: String? = null,
    @SerialName("route_number") val routeNumber: String? = null,
    @SerialName("duration_minutes") val durationMinutes: Int? = null,
    val fare: Double? = null
)

@Serializable
data class ItineraryStopDto(
    val sequence: Int,
    val place: PlaceSummaryDto,
    @SerialName("planned_arrival") val plannedArrival: String? = null,
    @SerialName("planned_departure") val plannedDeparture: String? = null
)

@Serializable
data class ItineraryDayDto(
    @SerialName("day_number") val dayNumber: Int,
    val date: String? = null,
    val stops: List<ItineraryStopDto> = emptyList(),
    val hops: List<TransportHopDto> = emptyList()
)

@Serializable
data class ItineraryResponseDto(
    @SerialName("itinerary_id") val itineraryId: String,
    val days: List<ItineraryDayDto> = emptyList(),
    val explanation: String = ""
)
