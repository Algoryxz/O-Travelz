package com.otravelz.android.notifications

import android.content.Context
import android.content.SharedPreferences

interface ReminderStore {
    fun saveReminder(info: ActiveReminderInfo)
    fun removeReminder(routeId: String, departureTime: String)
    fun removeReminderById(notificationId: String)
    fun isReminderActive(routeId: String, departureTime: String): Boolean
    fun getActiveReminder(routeId: String, departureTime: String): ActiveReminderInfo?
    fun getAllReminders(): List<ActiveReminderInfo>
}

/**
 * Lightweight SharedPreferences-backed active reminder store.
 * Eliminates Room schema migration overhead while maintaining fast synchronous UI state.
 */
class SharedPrefsReminderStore(context: Context) : ReminderStore {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "otravelz_active_reminders"
        private const val KEY_PREFIX = "rem_"
    }

    override fun saveReminder(info: ActiveReminderInfo) {
        val serialized = "${info.id}|${info.routeId}|${info.departureTime}|${info.offsetMinutes}|${info.scheduledAtEpochMs}"
        val key = keyFor(info.routeId, info.departureTime)
        prefs.edit().putString(key, serialized).apply()
    }

    override fun removeReminder(routeId: String, departureTime: String) {
        prefs.edit().remove(keyFor(routeId, departureTime)).apply()
    }

    override fun removeReminderById(notificationId: String) {
        val entry = prefs.all.entries.firstOrNull { (_, value) ->
            val str = value as? String ?: return@firstOrNull false
            str.startsWith("$notificationId|")
        }
        if (entry != null) {
            prefs.edit().remove(entry.key).apply()
        }
    }

    override fun isReminderActive(routeId: String, departureTime: String): Boolean {
        return prefs.contains(keyFor(routeId, departureTime))
    }

    override fun getActiveReminder(routeId: String, departureTime: String): ActiveReminderInfo? {
        val raw = prefs.getString(keyFor(routeId, departureTime), null) ?: return null
        return parse(raw)
    }

    override fun getAllReminders(): List<ActiveReminderInfo> {
        return prefs.all.values.mapNotNull {
            val raw = it as? String ?: return@mapNotNull null
            parse(raw)
        }
    }

    private fun keyFor(routeId: String, departureTime: String): String =
        "$KEY_PREFIX${routeId}_${departureTime.replace(":", "")}"

    private fun parse(raw: String): ActiveReminderInfo? {
        val parts = raw.split("|")
        if (parts.size != 5) return null
        return ActiveReminderInfo(
            id = parts[0],
            routeId = parts[1],
            departureTime = parts[2],
            offsetMinutes = parts[3].toIntOrNull() ?: 15,
            scheduledAtEpochMs = parts[4].toLongOrNull() ?: 0L
        )
    }
}

/**
 * Fast in-memory implementation of ReminderStore for unit testing.
 */
class InMemoryReminderStore : ReminderStore {
    private val memory = mutableMapOf<String, ActiveReminderInfo>()

    override fun saveReminder(info: ActiveReminderInfo) {
        memory[keyFor(info.routeId, info.departureTime)] = info
    }

    override fun removeReminder(routeId: String, departureTime: String) {
        memory.remove(keyFor(routeId, departureTime))
    }

    override fun removeReminderById(notificationId: String) {
        memory.values.firstOrNull { it.id == notificationId }?.let {
            memory.remove(keyFor(it.routeId, it.departureTime))
        }
    }

    override fun isReminderActive(routeId: String, departureTime: String): Boolean {
        return memory.containsKey(keyFor(routeId, departureTime))
    }

    override fun getActiveReminder(routeId: String, departureTime: String): ActiveReminderInfo? {
        return memory[keyFor(routeId, departureTime)]
    }

    override fun getAllReminders(): List<ActiveReminderInfo> {
        return memory.values.toList()
    }

    private fun keyFor(routeId: String, departureTime: String): String =
        "${routeId}_${departureTime.replace(":", "")}"
}
