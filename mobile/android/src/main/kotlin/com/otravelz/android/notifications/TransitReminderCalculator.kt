package com.otravelz.android.notifications

import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeParseException

/**
 * Pure deterministic calculator for transit reminder trigger timestamps.
 * Enforces IST (Asia/Kolkata, UTC+05:30) timezone arithmetic and past-departure rejection.
 */
object TransitReminderCalculator {

    val ZONE_IST: ZoneId = ZoneId.of("Asia/Kolkata")

    /**
     * Calculates the exact epoch millisecond trigger timestamp for a reminder.
     *
     * @param departureTime Time string formatted as "HH:mm" in IST.
     * @param offsetMinutes Minutes before departure to trigger reminder (e.g. 10, 15, 30).
     * @param targetDate The date of the departure (defaults to today in IST).
     * @param nowEpochMs The current reference epoch timestamp (defaults to current system time).
     * @param zoneId Timezone of the timetable (strictly IST).
     * @return Trigger epoch milliseconds, or null if the departure is malformed or already passed.
     */
    fun calculateTriggerEpochMs(
        departureTime: String,
        offsetMinutes: Int,
        targetDate: LocalDate = LocalDate.now(ZONE_IST),
        nowEpochMs: Long = System.currentTimeMillis(),
        zoneId: ZoneId = ZONE_IST
    ): Long? {
        if (offsetMinutes < 0) return null

        val localTime = try {
            val parts = departureTime.trim().split(":")
            if (parts.size != 2) return null
            val hour = parts[0].toIntOrNull() ?: return null
            val minute = parts[1].toIntOrNull() ?: return null
            if (hour !in 0..23 || minute !in 0..59) return null
            LocalTime.of(hour, minute)
        } catch (e: Exception) {
            return null
        }

        val zonedDateTime = ZonedDateTime.of(targetDate, localTime, zoneId)
        val departureEpochMs = zonedDateTime.toInstant().toEpochMilli()
        val triggerEpochMs = departureEpochMs - (offsetMinutes * 60 * 1000L)

        // Strict rejection: if trigger time is in the past, cannot schedule
        if (triggerEpochMs <= nowEpochMs) {
            return null
        }

        return triggerEpochMs
    }

    /**
     * Checks if a departure has already passed relative to the current IST time.
     */
    fun isDeparturePassed(
        departureTime: String,
        targetDate: LocalDate = LocalDate.now(ZONE_IST),
        nowEpochMs: Long = System.currentTimeMillis(),
        zoneId: ZoneId = ZONE_IST
    ): Boolean {
        val triggerMs = calculateTriggerEpochMs(
            departureTime = departureTime,
            offsetMinutes = 0,
            targetDate = targetDate,
            nowEpochMs = nowEpochMs,
            zoneId = zoneId
        )
        return triggerMs == null
    }
}
