package com.otravelz.android.data.local.model

import androidx.room.Embedded
import androidx.room.Relation
import com.otravelz.android.data.local.entity.SavedTripEntity
import com.otravelz.android.data.local.entity.SavedTripStopEntity
import com.otravelz.android.data.local.entity.TripProgressEntity

/**
 * Composite relation containing a saved trip with its ordered child stops and optional execution progress.
 */
data class SavedTripWithStops(
    @Embedded
    val trip: SavedTripEntity,
    @Relation(
        parentColumn = "tripId",
        entityColumn = "tripId"
    )
    val stops: List<SavedTripStopEntity>,
    @Relation(
        parentColumn = "tripId",
        entityColumn = "tripId"
    )
    val progress: TripProgressEntity? = null
) {
    /**
     * Stops sorted deterministically by day number and stop sequence.
     */
    val sortedStops: List<SavedTripStopEntity>
        get() = stops.sortedWith(compareBy({ it.dayNumber }, { it.stopSequence }))
}
