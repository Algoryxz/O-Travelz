package com.otravelz.android.data.repository

import android.content.Context
import com.otravelz.android.data.local.room.AppDatabase
import com.otravelz.android.data.local.room.RecentlyViewedDao
import com.otravelz.android.data.local.room.RecentlyViewedEntity
import com.otravelz.android.data.model.PlaceDetailDto
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

class RecentlyViewedRepository(
    private val recentlyViewedDao: RecentlyViewedDao? = null
) {
    fun getRecentlyViewed(limit: Int = 20): Flow<List<RecentlyViewedEntity>> {
        return recentlyViewedDao?.getRecentlyViewed(limit) ?: emptyFlow()
    }

    suspend fun recordView(dto: PlaceDetailDto) {
        if (recentlyViewedDao == null) return
        val entity = RecentlyViewedEntity.fromDto(dto)
        recentlyViewedDao.insertOrUpdate(entity)
        recentlyViewedDao.trimHistory(20)
    }

    suspend fun clearHistory() {
        recentlyViewedDao?.clearAll()
    }

    suspend fun getCount(): Int {
        return recentlyViewedDao?.getCount() ?: 0
    }

    companion object {
        @Volatile
        private var INSTANCE: RecentlyViewedRepository? = null

        fun getInstance(context: Context): RecentlyViewedRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: RecentlyViewedRepository(
                    AppDatabase.getInstance(context).recentlyViewedDao()
                ).also { INSTANCE = it }
            }
        }
    }
}
