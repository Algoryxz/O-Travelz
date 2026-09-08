package com.otravelz.android.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.otravelz.android.data.local.entity.SavedPlaceEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SavedPlaceDao {
    @Query("SELECT * FROM saved_places ORDER BY savedAt DESC")
    fun observeAll(): Flow<List<SavedPlaceEntity>>

    @Query("SELECT * FROM saved_places ORDER BY savedAt DESC")
    suspend fun getAll(): List<SavedPlaceEntity>

    @Query("SELECT EXISTS(SELECT 1 FROM saved_places WHERE canonicalPlaceId = :placeId)")
    fun isPlaceSaved(placeId: String): Flow<Boolean>

    @Query("SELECT EXISTS(SELECT 1 FROM saved_places WHERE canonicalPlaceId = :placeId)")
    suspend fun checkIsPlaceSaved(placeId: String): Boolean

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(place: SavedPlaceEntity): Long

    @Query("DELETE FROM saved_places WHERE canonicalPlaceId = :placeId")
    suspend fun deleteByPlaceId(placeId: String): Int

    @Query("DELETE FROM saved_places")
    suspend fun deleteAll(): Int
}
