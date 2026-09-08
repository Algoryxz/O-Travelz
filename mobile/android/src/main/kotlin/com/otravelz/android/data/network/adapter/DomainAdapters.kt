package com.otravelz.android.data.network.adapter

import com.otravelz.android.data.network.dto.StopNearbyDto
import com.otravelz.android.data.network.dto.WeatherResponseDto

sealed interface WeatherState {
    data class Available(
        val locationName: String,
        val temperatureC: Double,
        val condition: String,
        val advice: String?
    ) : WeatherState

    data class Unavailable(val reason: String = "Sensor readings currently unavailable") : WeatherState
}

fun WeatherResponseDto.toDomain(): WeatherState {
    val temp = current?.temperatureC
    val cond = current?.condition
    return if (temp != null && cond != null) {
        WeatherState.Available(
            locationName = current.locationName ?: locationName ?: "Odisha",
            temperatureC = temp,
            condition = cond,
            advice = current.advice
        )
    } else {
        WeatherState.Unavailable()
    }
}

sealed interface TransitStopTruth {
    data class Exact(
        val stopId: String,
        val name: String,
        val latitude: Double,
        val longitude: Double,
        val distanceM: Double?
    ) : TransitStopTruth

    data class LocalityOnly(
        val stopId: String,
        val name: String,
        val locality: String,
        val city: String
    ) : TransitStopTruth
}

fun StopNearbyDto.toDomain(): TransitStopTruth {
    val lat = latitude
    val lon = longitude
    val isCandidate = coordinateStatus?.lowercase() == "candidate"

    return if (!isCandidate && lat != null && lon != null) {
        TransitStopTruth.Exact(
            stopId = stopId,
            name = name,
            latitude = lat,
            longitude = lon,
            distanceM = distanceM
        )
    } else {
        TransitStopTruth.LocalityOnly(
            stopId = stopId,
            name = name,
            locality = locality ?: "Unknown",
            city = city ?: "Odisha"
        )
    }
}
