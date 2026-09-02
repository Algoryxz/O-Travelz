package com.otravelz.android.core.notifications

import android.content.Context
import android.content.SharedPreferences

/**
 * Data holder for user travel notification preferences.
 */
data class NotificationPreferencesData(
    val tripAlertsEnabled: Boolean = true,
    val transitGuidanceEnabled: Boolean = true,
    val weatherAlertsEnabled: Boolean = true
)

/**
 * Preferences manager for notification toggles and user privacy controls.
 */
object NotificationPreferences {

    private const val PREFS_NAME = "otravelz_notification_preferences"
    private const val KEY_TRIP_ALERTS = "pref_trip_alerts_enabled"
    private const val KEY_TRANSIT_GUIDANCE = "pref_transit_guidance_enabled"
    private const val KEY_WEATHER_ALERTS = "pref_weather_alerts_enabled"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun getPreferences(context: Context): NotificationPreferencesData {
        val prefs = getPrefs(context)
        return NotificationPreferencesData(
            tripAlertsEnabled = prefs.getBoolean(KEY_TRIP_ALERTS, true),
            transitGuidanceEnabled = prefs.getBoolean(KEY_TRANSIT_GUIDANCE, true),
            weatherAlertsEnabled = prefs.getBoolean(KEY_WEATHER_ALERTS, true)
        )
    }

    fun setTripAlertsEnabled(context: Context, enabled: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_TRIP_ALERTS, enabled).apply()
    }

    fun setTransitGuidanceEnabled(context: Context, enabled: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_TRANSIT_GUIDANCE, enabled).apply()
    }

    fun setWeatherAlertsEnabled(context: Context, enabled: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_WEATHER_ALERTS, enabled).apply()
    }
}
