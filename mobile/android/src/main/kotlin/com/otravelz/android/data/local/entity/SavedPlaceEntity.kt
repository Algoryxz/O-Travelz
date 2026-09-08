package com.otravelz.android.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Persisted place bookmark referencing canonical place truth.
 * Display snapshot fields allow graceful offline rendering.
 */
@Entity(tableName = "saved_places")
data class SavedPlaceEntity(
    @PrimaryKey
    val canonicalPlaceId: String,
    val savedAt: Long = System.currentTimeMillis(),
    val placeName: String,
    val category: String,
    val district: String? = null,
    val imageUrl: String? = null,
    val rating: Double? = null
)
