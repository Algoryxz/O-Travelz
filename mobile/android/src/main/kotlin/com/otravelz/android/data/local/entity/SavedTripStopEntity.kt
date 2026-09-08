package com.otravelz.android.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Normalized child row for a confirmed itinerary stop within a SavedTrip.
 */
@Entity(
    tableName = "saved_trip_stops",
    foreignKeys = [
        ForeignKey(
            entity = SavedTripEntity::class,
            parentColumns = ["tripId"],
            childColumns = ["tripId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["tripId"]),
        Index(value = ["tripId", "dayNumber", "stopSequence"])
    ]
)
data class SavedTripStopEntity(
    @PrimaryKey
    val stopId: String,
    val tripId: String,
    val dayNumber: Int,
    val stopSequence: Int,
    val canonicalPlaceId: String,
    val placeName: String,
    val category: String,
    val plannedArrival: String? = null,
    val plannedDeparture: String? = null,
    val hopMode: String? = null,
    val hopMinutes: Int? = null,
    val hopDetail: String? = null,
    val hopFare: Double? = null // Strictly null
)
