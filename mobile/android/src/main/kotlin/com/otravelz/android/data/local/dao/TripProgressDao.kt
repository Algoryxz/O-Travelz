package com.otravelz.android.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import com.otravelz.android.data.local.entity.TripProgressEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TripProgressDao {
    @Query("SELECT * FROM trip_progress WHERE isActive = 1 LIMIT 1")
    fun observeActiveProgress(): Flow<TripProgressEntity?>

    @Query("SELECT * FROM trip_progress WHERE isActive = 1 LIMIT 1")
    suspend fun getActiveProgress(): TripProgressEntity?

    @Query("SELECT * FROM trip_progress WHERE tripId = :tripId LIMIT 1")
    suspend fun getProgressForTrip(tripId: String): TripProgressEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertProgress(progress: TripProgressEntity): Long

    @Query("UPDATE trip_progress SET isActive = 0 WHERE isActive = 1")
    suspend fun deactivateAll(): Int

    @Transaction
    suspend fun setActiveTrip(tripId: String) {
        deactivateAll()
        val existing = getProgressForTrip(tripId)
        if (existing != null) {
            upsertProgress(existing.copy(isActive = true, lastUpdatedAt = System.currentTimeMillis()))
        } else {
            upsertProgress(
                TripProgressEntity(
                    tripId = tripId,
                    isActive = true,
                    activeDay = 1,
                    currentMilestoneIndex = 0,
                    startedAt = System.currentTimeMillis(),
                    lastUpdatedAt = System.currentTimeMillis(),
                    completionState = "IN_PROGRESS"
                )
            )
        }
    }

    @Query("DELETE FROM trip_progress WHERE tripId = :tripId")
    suspend fun deleteProgress(tripId: String): Int
}
