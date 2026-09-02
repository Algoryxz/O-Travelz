package com.otravelz.android.data.local.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface CommunityDraftDao {

    @Query("SELECT * FROM community_drafts ORDER BY updatedAt DESC")
    fun getAllDrafts(): Flow<List<CommunityDraftEntity>>

    @Query("SELECT * FROM community_drafts WHERE id = :id LIMIT 1")
    suspend fun getDraftById(id: String): CommunityDraftEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(draft: CommunityDraftEntity)

    @Query("DELETE FROM community_drafts WHERE id = :id")
    suspend fun delete(id: String)

    @Query("DELETE FROM community_drafts")
    suspend fun clearAll()
}
