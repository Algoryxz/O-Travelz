package com.otravelz.android.data.local.room

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface SavedTripsDao {

    @Query("SELECT * FROM saved_trips WHERE isDeleted = 0 ORDER BY timestamp DESC")
    fun getAllTripsFlow(): Flow<List<SavedTripEntity>>

    @Query("SELECT * FROM saved_trips WHERE isDeleted = 0 ORDER BY timestamp DESC")
    suspend fun getAllTrips(): List<SavedTripEntity>

    @Query("SELECT * FROM saved_trips WHERE id = :id AND isDeleted = 0 LIMIT 1")
    suspend fun getTripById(id: String): SavedTripEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrip(trip: SavedTripEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrips(trips: List<SavedTripEntity>)

    @Query("UPDATE saved_trips SET isDeleted = 1, updatedAt = :updatedAt WHERE id = :id")
    suspend fun markDeleted(id: String, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM saved_trips WHERE id = :id")
    suspend fun deleteTrip(id: String)

    @Query("DELETE FROM saved_trips")
    suspend fun deleteAll()

    @Query("SELECT COUNT(*) FROM saved_trips WHERE isDeleted = 0")
    suspend fun getCount(): Int
}
