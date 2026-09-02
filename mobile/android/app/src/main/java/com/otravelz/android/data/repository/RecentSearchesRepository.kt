package com.otravelz.android.data.repository

import android.content.Context
import com.otravelz.android.data.local.room.AppDatabase
import com.otravelz.android.data.local.room.RecentSearchDao
import com.otravelz.android.data.local.room.RecentSearchEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

class RecentSearchesRepository(
    private val recentSearchDao: RecentSearchDao? = null
) {
    fun getRecentSearches(limit: Int = 10): Flow<List<RecentSearchEntity>> {
        return recentSearchDao?.getRecentSearches(limit) ?: emptyFlow()
    }

    suspend fun addSearch(query: String) {
        val trimmed = query.trim()
        if (trimmed.isBlank() || recentSearchDao == null) return
        recentSearchDao.insertOrUpdate(RecentSearchEntity(query = trimmed, timestamp = System.currentTimeMillis()))
    }

    suspend fun removeSearch(query: String) {
        recentSearchDao?.delete(query)
    }

    suspend fun clearAll() {
        recentSearchDao?.clearAll()
    }

    companion object {
        @Volatile
        private var INSTANCE: RecentSearchesRepository? = null

        fun getInstance(context: Context): RecentSearchesRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: RecentSearchesRepository(
                    AppDatabase.getInstance(context).recentSearchDao()
                ).also { INSTANCE = it }
            }
        }
    }
}
