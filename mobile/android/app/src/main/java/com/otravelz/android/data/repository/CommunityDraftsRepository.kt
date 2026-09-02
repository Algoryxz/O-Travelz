package com.otravelz.android.data.repository

import android.content.Context
import com.otravelz.android.data.local.room.AppDatabase
import com.otravelz.android.data.local.room.CommunityDraftDao
import com.otravelz.android.data.local.room.CommunityDraftEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

class CommunityDraftsRepository(
    private val communityDraftDao: CommunityDraftDao? = null
) {
    fun getAllDrafts(): Flow<List<CommunityDraftEntity>> {
        return communityDraftDao?.getAllDrafts() ?: emptyFlow()
    }

    suspend fun getDraftById(id: String): CommunityDraftEntity? {
        return communityDraftDao?.getDraftById(id)
    }

    suspend fun saveDraft(draft: CommunityDraftEntity) {
        communityDraftDao?.insertOrUpdate(draft)
    }

    suspend fun deleteDraft(id: String) {
        communityDraftDao?.delete(id)
    }

    suspend fun clearAll() {
        communityDraftDao?.clearAll()
    }

    companion object {
        @Volatile
        private var INSTANCE: CommunityDraftsRepository? = null

        fun getInstance(context: Context): CommunityDraftsRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: CommunityDraftsRepository(
                    AppDatabase.getInstance(context).communityDraftDao()
                ).also { INSTANCE = it }
            }
        }
    }
}
