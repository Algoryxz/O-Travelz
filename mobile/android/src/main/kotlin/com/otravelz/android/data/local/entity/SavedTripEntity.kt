package com.otravelz.android.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Immutable generated trip plan snapshot.
 */
@Entity(tableName = "saved_trips")
data class SavedTripEntity(
    @PrimaryKey
    val tripId: String,
    val title: String,
    val daysCount: Int = 1,
    val startHub: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val constraintsJson: String,
    val aiExplanation: String? = null,
    val schemaVersion: Int = 1
)
