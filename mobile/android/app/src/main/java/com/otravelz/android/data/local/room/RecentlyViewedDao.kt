package com.otravelz.android.data.local.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface RecentlyViewedDao {

    @Query("SELECT * FROM recently_viewed ORDER BY viewedAt DESC LIMIT :limit")
    fun getRecentlyViewed(limit: Int = 20): Flow<List<RecentlyViewedEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(entity: RecentlyViewedEntity)

    @Query("DELETE FROM recently_viewed WHERE placeId NOT IN (SELECT placeId FROM recently_viewed ORDER BY viewedAt DESC LIMIT :maxCount)")
    suspend fun trimHistory(maxCount: Int = 20)

    @Query("DELETE FROM recently_viewed")
    suspend fun clearAll()

    @Query("SELECT COUNT(*) FROM recently_viewed")
    suspend fun getCount(): Int
}
