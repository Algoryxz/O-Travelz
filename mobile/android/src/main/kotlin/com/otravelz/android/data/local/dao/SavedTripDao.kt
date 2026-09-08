package com.otravelz.android.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import com.otravelz.android.data.local.entity.SavedTripEntity
import com.otravelz.android.data.local.entity.SavedTripStopEntity
import com.otravelz.android.data.local.model.SavedTripWithStops
import kotlinx.coroutines.flow.Flow

@Dao
interface SavedTripDao {
    @Transaction
    @Query("SELECT * FROM saved_trips ORDER BY updatedAt DESC")
    fun observeAllTripsWithStops(): Flow<List<SavedTripWithStops>>

    @Transaction
    @Query("SELECT * FROM saved_trips ORDER BY updatedAt DESC")
    suspend fun getAllTripsWithStops(): List<SavedTripWithStops>

    @Transaction
    @Query("SELECT * FROM saved_trips WHERE tripId = :tripId LIMIT 1")
    suspend fun getTripWithStops(tripId: String): SavedTripWithStops?

    @Transaction
    @Query("SELECT * FROM saved_trips WHERE tripId = :tripId LIMIT 1")
    fun observeTripWithStops(tripId: String): Flow<SavedTripWithStops?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrip(trip: SavedTripEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStops(stops: List<SavedTripStopEntity>)

    @Transaction
    suspend fun saveTripWithStops(trip: SavedTripEntity, stops: List<SavedTripStopEntity>) {
        insertTrip(trip)
        insertStops(stops)
    }

    @Query("DELETE FROM saved_trips WHERE tripId = :tripId")
    suspend fun deleteTrip(tripId: String): Int

    @Query("DELETE FROM saved_trips")
    suspend fun deleteAllTrips(): Int
}
