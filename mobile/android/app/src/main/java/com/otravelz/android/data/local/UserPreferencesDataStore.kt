package com.otravelz.android.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.userPreferencesDataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

data class UserPreferences(
    val tripAlertsEnabled: Boolean = true,
    val weatherAlertsEnabled: Boolean = true,
    val transitGuidanceEnabled: Boolean = true,
    val highContrastMode: Boolean = false,
    val preferredLanguage: String = "en",
    val allowLocationAccess: Boolean = false
)

class UserPreferencesDataStore(private val context: Context) {

    private val dataStore = context.userPreferencesDataStore

    val userPreferencesFlow: Flow<UserPreferences> = dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            UserPreferences(
                tripAlertsEnabled = preferences[KEY_TRIP_ALERTS] ?: true,
                weatherAlertsEnabled = preferences[KEY_WEATHER_ALERTS] ?: true,
                transitGuidanceEnabled = preferences[KEY_TRANSIT_GUIDANCE] ?: true,
                highContrastMode = preferences[KEY_HIGH_CONTRAST] ?: false,
                preferredLanguage = preferences[KEY_PREFERRED_LANGUAGE] ?: "en",
                allowLocationAccess = preferences[KEY_ALLOW_LOCATION] ?: false
            )
        }

    suspend fun setTripAlertsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[KEY_TRIP_ALERTS] = enabled
        }
    }

    suspend fun setWeatherAlertsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[KEY_WEATHER_ALERTS] = enabled
        }
    }

    suspend fun setTransitGuidanceEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[KEY_TRANSIT_GUIDANCE] = enabled
        }
    }

    suspend fun setHighContrastMode(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[KEY_HIGH_CONTRAST] = enabled
        }
    }

    suspend fun setPreferredLanguage(language: String) {
        dataStore.edit { preferences ->
            preferences[KEY_PREFERRED_LANGUAGE] = language
        }
    }

    suspend fun setAllowLocationAccess(allowed: Boolean) {
        dataStore.edit { preferences ->
            preferences[KEY_ALLOW_LOCATION] = allowed
        }
    }

    companion object {
        val KEY_TRIP_ALERTS = booleanPreferencesKey("trip_alerts_enabled")
        val KEY_WEATHER_ALERTS = booleanPreferencesKey("weather_alerts_enabled")
        val KEY_TRANSIT_GUIDANCE = booleanPreferencesKey("transit_guidance_enabled")
        val KEY_HIGH_CONTRAST = booleanPreferencesKey("high_contrast_mode")
        val KEY_PREFERRED_LANGUAGE = stringPreferencesKey("preferred_language")
        val KEY_ALLOW_LOCATION = booleanPreferencesKey("allow_location_access")

        @Volatile
        private var INSTANCE: UserPreferencesDataStore? = null

        fun getInstance(context: Context): UserPreferencesDataStore {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: UserPreferencesDataStore(context.applicationContext).also { INSTANCE = it }
            }
        }
    }
}
