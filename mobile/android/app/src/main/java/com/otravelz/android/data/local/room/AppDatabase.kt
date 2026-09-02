package com.otravelz.android.data.local.room

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        SavedPlaceEntity::class,
        SavedTripEntity::class,
        RecentlyViewedEntity::class,
        RecentSearchEntity::class,
        CommunityDraftEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun savedPlacesDao(): SavedPlacesDao
    abstract fun savedTripsDao(): SavedTripsDao
    abstract fun recentlyViewedDao(): RecentlyViewedDao
    abstract fun recentSearchDao(): RecentSearchDao
    abstract fun communityDraftDao(): CommunityDraftDao

    companion object {
        private const val DATABASE_NAME = "otravelz_database.db"

        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    DATABASE_NAME
                )
                .fallbackToDestructiveMigration()
                .build()
                .also { INSTANCE = it }
            }
        }
    }
}
