package com.otravelz.android.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

/**
 * Persisted execution state for an active or completed trip.
 */
@Entity(
    tableName = "trip_progress",
    foreignKeys = [
        ForeignKey(
            entity = SavedTripEntity::class,
            parentColumns = ["tripId"],
            childColumns = ["tripId"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class TripProgressEntity(
    @PrimaryKey
    val tripId: String,
    val isActive: Boolean = false,
    val activeDay: Int = 1,
    val currentMilestoneIndex: Int = 0,
    val completedStopIdsJson: String = "[]",
    val skippedStopIdsJson: String = "[]",
    val startedAt: Long? = null,
    val lastUpdatedAt: Long = System.currentTimeMillis(),
    val completionState: String = "IN_PROGRESS"
)
