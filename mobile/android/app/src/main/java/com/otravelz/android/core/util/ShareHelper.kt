package com.otravelz.android.core.util

import android.content.Context
import android.content.Intent
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.SyncTripItemDto

object ShareHelper {

    fun buildPlaceShareText(place: PlaceDetailDto): String {
        val districtPart = if (!place.district.isNullOrBlank()) " (${place.district})" else ""
        val categoryPart = "[${place.category.uppercase()}]"
        val ratingPart = if (place.rating != null) " • Rating: ${place.rating}★" else ""
        val descPart = if (!place.description.isNullOrBlank()) "\n\n${place.description.take(200)}..." else ""
        val deepLink = "otravelz://place/${place.id}"

        return """
            🏛️ ${place.name}$districtPart
            $categoryPart$ratingPart
            $descPart
            
            📍 Explore in O-TRAVELZ (Odisha Cultural & Transit Guide):
            $deepLink
            
            (Verified Odisha Destination Record • WGS-84)
        """.trimIndent()
    }

    fun buildTripShareText(trip: SyncTripItemDto): String {
        val dayCount = trip.itinerary?.days?.size ?: 1
        val stopNames = trip.itinerary?.days?.flatMap { day ->
            day.stops.map { "  • Day ${day.dayNumber}: ${it.place.name}" }
        } ?: emptyList()
        val stopsFormatted = if (stopNames.isNotEmpty()) stopNames.joinToString("\n") else "  • Multi-destination Odisha itinerary"
        val deepLink = "otravelz://trip/${trip.id}"

        return """
            🗺️ ${trip.title} ($dayCount Day${if (dayCount > 1) "s" else ""})
            
            Itinerary Highlights:
            $stopsFormatted
            
            🚌 Transit Notice: Transit connections utilize scheduled Mo Bus & Ama Bus timetables.
            
            📲 Open in O-TRAVELZ:
            $deepLink
        """.trimIndent()
    }

    fun sharePlace(context: Context, place: PlaceDetailDto) {
        val text = buildPlaceShareText(place)
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, "Odisha Destination: ${place.name}")
            putExtra(Intent.EXTRA_TEXT, text)
        }
        context.startActivity(Intent.createChooser(intent, "Share ${place.name}"))
    }

    fun shareTrip(context: Context, trip: SyncTripItemDto) {
        val text = buildTripShareText(trip)
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, "Odisha Trip Itinerary: ${trip.title}")
            putExtra(Intent.EXTRA_TEXT, text)
        }
        context.startActivity(Intent.createChooser(intent, "Share Itinerary"))
    }
}
