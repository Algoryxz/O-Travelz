package com.otravelz.android.data.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CanonicalRouteRawDto(
    @SerialName("route_id") val routeId: String,
    @SerialName("route_number") val routeNumber: String,
    @SerialName("route_name") val routeName: String,
    val operator: String = "CRUT",
    @SerialName("network_type") val networkType: String = "AMA Bus",
    val origin: String = "",
    val destination: String? = null,
    val via: String? = null,
    val direction: String? = null,
    @SerialName("service_area") val serviceArea: String? = null,
    val cities: List<String> = emptyList(),
    @SerialName("total_stops") val totalStops: Int = 0,
    @SerialName("has_schedule") val hasSchedule: Boolean = false,
    @SerialName("source_document") val sourceDocument: String? = null,
    @SerialName("effective_date") val effectiveDate: String? = null,
    @SerialName("verification_status") val verificationStatus: String? = null
)

@Serializable
data class CanonicalScheduleRawDto(
    @SerialName("schedule_id") val scheduleId: String,
    @SerialName("route_id") val routeId: String,
    @SerialName("route_number") val routeNumber: String? = null,
    @SerialName("route_name") val routeName: String? = null,
    val direction: String? = null,
    val terminus: String? = null,
    val origin: String? = null,
    val destination: String? = null,
    @SerialName("departure_times") val departureTimes: List<String> = emptyList(),
    @SerialName("source_document") val sourceDocument: String? = null,
    @SerialName("effective_date") val effectiveDate: String? = null
)

@Serializable
data class CanonicalStopRefDto(
    val sequence: Int = 0,
    @SerialName("raw_stop_name") val rawStopName: String? = null,
    @SerialName("normalized_stop_name") val normalizedStopName: String? = null,
    @SerialName("stop_id") val stopId: String,
    @SerialName("resolution_status") val resolutionStatus: String? = null,
    @SerialName("coordinate_status") val coordinateStatus: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null
)

@Serializable
data class CanonicalRouteSequenceDto(
    @SerialName("sequence_id") val sequenceId: String,
    @SerialName("route_id") val routeId: String,
    @SerialName("route_number") val routeNumber: String? = null,
    val direction: String? = null,
    @SerialName("sequence_completeness") val sequenceCompleteness: String? = null,
    @SerialName("total_stops") val totalStops: Int = 0,
    val stops: List<CanonicalStopRefDto> = emptyList(),
    @SerialName("source_document") val sourceDocument: String? = null
)
