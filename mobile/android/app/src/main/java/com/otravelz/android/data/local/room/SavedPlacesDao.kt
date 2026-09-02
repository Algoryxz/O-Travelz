package com.otravelz.android.data.local.room

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface SavedPlacesDao {

    @Query("SELECT * FROM saved_places WHERE isDeleted = 0 ORDER BY savedAt DESC")
    fun getAllPlacesFlow(): Flow<List<SavedPlaceEntity>>

    @Query("SELECT * FROM saved_places WHERE isDeleted = 0 ORDER BY savedAt DESC")
    suspend fun getAllPlaces(): List<SavedPlaceEntity>

    @Query("SELECT * FROM saved_places WHERE id = :id AND isDeleted = 0 LIMIT 1")
    suspend fun getPlaceById(id: String): SavedPlaceEntity?

    @Query("SELECT id FROM saved_places WHERE isDeleted = 0")
    fun getAllPlaceIdsFlow(): Flow<List<String>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlace(place: SavedPlaceEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlaces(places: List<SavedPlaceEntity>)

    @Query("UPDATE saved_places SET isDeleted = 1, updatedAt = :updatedAt WHERE id = :id")
    suspend fun markDeleted(id: String, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM saved_places WHERE id = :id")
    suspend fun deletePlace(id: String)

    @Query("DELETE FROM saved_places")
    suspend fun deleteAll()

    @Query("SELECT COUNT(*) FROM saved_places WHERE isDeleted = 0")
    suspend fun getCount(): Int
}
