package com.otravelz.android.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.otravelz.android.data.local.dao.SavedPlaceDao
import com.otravelz.android.data.local.dao.SavedTripDao
import com.otravelz.android.data.local.dao.TripProgressDao
import com.otravelz.android.data.local.entity.SavedPlaceEntity
import com.otravelz.android.data.local.entity.SavedTripEntity
import com.otravelz.android.data.local.entity.SavedTripStopEntity
import com.otravelz.android.data.local.entity.TripProgressEntity

/**
 * Authoritative Room SQLite database for user persistence (Wave M14).
 * Enforces local-first user artifacts without mutating canonical reference assets.
 */
@Database(
    entities = [
        SavedPlaceEntity::class,
        SavedTripEntity::class,
        SavedTripStopEntity::class,
        TripProgressEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class OTravelzDatabase : RoomDatabase() {
    abstract fun savedPlaceDao(): SavedPlaceDao
    abstract fun savedTripDao(): SavedTripDao
    abstract fun tripProgressDao(): TripProgressDao

    companion object {
        private const val DATABASE_NAME = "otravelz_user_data.db"

        @Volatile
        private var INSTANCE: OTravelzDatabase? = null

        fun getInstance(context: Context): OTravelzDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    OTravelzDatabase::class.java,
                    DATABASE_NAME
                ).build().also { INSTANCE = it }
            }
        }

        /**
         * Test harness utility providing an isolated in-memory database instance.
         */
        fun createInMemory(context: Context): OTravelzDatabase {
            return Room.inMemoryDatabaseBuilder(
                context.applicationContext,
                OTravelzDatabase::class.java
            ).allowMainThreadQueries().build()
        }
    }
}
