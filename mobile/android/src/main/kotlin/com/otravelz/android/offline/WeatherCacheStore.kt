package com.otravelz.android.offline

import android.content.Context
import android.content.SharedPreferences
import com.otravelz.android.data.network.adapter.WeatherState
import java.util.concurrent.ConcurrentHashMap

/**
 * Minimal last-known weather observation cache store.
 * - Stores temperature, condition, advice, and observation timestamp.
 * - Formats relative elapsed time without arbitrary hard TTLs.
 * - Cached observations are NEVER labeled as live.
 */
class WeatherCacheStore private constructor(context: Context?) {

    private val prefs: SharedPreferences? = try {
        context?.getSharedPreferences("otravelz_weather_cache", Context.MODE_PRIVATE)
    } catch (t: Throwable) {
        null
    }

    // In-memory fallback for headless unit tests or fast access
    private val memoryStore = ConcurrentHashMap<String, CachedObservation>()

    data class CachedObservation(
        val locationName: String,
        val temperatureC: Double,
        val condition: String,
        val advice: String?,
        val observedAtMillis: Long
    )

    private fun makeKey(lat: Double, lon: Double): String {
        // Round to 2 decimal places (~1.1 km) for regional weather cache key
        val latRound = String.format(java.util.Locale.US, "%.2f", lat)
        val lonRound = String.format(java.util.Locale.US, "%.2f", lon)
        return "weather_${latRound}_${lonRound}"
    }

    fun saveObservation(
        lat: Double,
        lon: Double,
        locationName: String,
        temperatureC: Double,
        condition: String,
        advice: String?,
        observedAtMillis: Long = System.currentTimeMillis()
    ) {
        val key = makeKey(lat, lon)
        val observation = CachedObservation(
            locationName = locationName,
            temperatureC = temperatureC,
            condition = condition,
            advice = advice,
            observedAtMillis = observedAtMillis
        )
        memoryStore[key] = observation

        prefs?.edit()?.apply {
            putString("${key}_name", locationName)
            putString("${key}_temp", temperatureC.toString())
            putString("${key}_cond", condition)
            putString("${key}_advice", advice ?: "")
            putLong("${key}_time", observedAtMillis)
            apply()
        }
    }

    fun getCachedObservation(
        lat: Double,
        lon: Double,
        nowMillis: Long = System.currentTimeMillis()
    ): WeatherState? {
        val key = makeKey(lat, lon)
        val mem = memoryStore[key]
        if (mem != null) {
            val relativeTime = formatRelativeTimeAgo(mem.observedAtMillis, nowMillis)
            return WeatherState.Cached(
                locationName = mem.locationName,
                temperatureC = mem.temperatureC,
                condition = mem.condition,
                advice = mem.advice,
                relativeTimeAgo = relativeTime
            )
        }

        val p = prefs ?: return null
        if (p.contains("${key}_time")) {
            val name = p.getString("${key}_name", "Odisha") ?: "Odisha"
            val tempStr = p.getString("${key}_temp", null) ?: return null
            val temp = tempStr.toDoubleOrNull() ?: return null
            val cond = p.getString("${key}_cond", "Clear") ?: "Clear"
            val adv = p.getString("${key}_advice", null)?.takeIf { it.isNotBlank() }
            val time = p.getLong("${key}_time", nowMillis)

            val observation = CachedObservation(name, temp, cond, adv, time)
            memoryStore[key] = observation

            val relativeTime = formatRelativeTimeAgo(time, nowMillis)
            return WeatherState.Cached(
                locationName = name,
                temperatureC = temp,
                condition = cond,
                advice = adv,
                relativeTimeAgo = relativeTime
            )
        }

        return null
    }

    fun formatRelativeTimeAgo(observedAtMillis: Long, nowMillis: Long): String {
        val diffMillis = (nowMillis - observedAtMillis).coerceAtLeast(0L)
        val diffMinutes = diffMillis / (1000 * 60)
        val diffHours = diffMinutes / 60
        val diffDays = diffHours / 24

        return when {
            diffMinutes < 1 -> "just now"
            diffMinutes < 60 -> "${diffMinutes}m"
            diffHours < 24 -> "${diffHours}h"
            else -> "${diffDays}d"
        }
    }

    companion object {
        @Volatile
        private var INSTANCE: WeatherCacheStore? = null

        fun getInstance(context: Context?): WeatherCacheStore {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: WeatherCacheStore(context?.applicationContext ?: context).also {
                    INSTANCE = it
                }
            }
        }

        fun createMock(): WeatherCacheStore = WeatherCacheStore(null)
    }
}
