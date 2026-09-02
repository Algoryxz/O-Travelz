package com.otravelz.shared.engine

import com.otravelz.shared.provenance.DataTier

/**
 * Result of a deterministic timetable lookup.
 */
data class ScheduledDepartureResult(
    val nextDepartureTime: String?,
    val isServiceFinishedForDay: Boolean,
    val minutesUntilDeparture: Int?,
    val dataTier: DataTier,
    val displayLabel: String
)

/**
 * Pure deterministic transit timetable engine.
 *
 * Evaluates published CRUT / Mo Bus timetable departure sequences against reference clock times.
 *
 * CRITICAL INVARIANT:
 * Departure results are strictly bound to [DataTier.SCHEDULED].
 * Under no circumstances does this engine claim or synthesize live vehicle tracking.
 */
object TimetableEngine {

    /**
     * Finds the next scheduled departure time from an ordered list of `HH:MM` 24-hour departure timestamps.
     *
     * @param departures Ordered list of `HH:MM` departure strings (e.g. `["06:30", "07:00", "07:30"]`).
     * @param currentTime Current reference time in `HH:MM` 24-hour format (e.g. `"07:15"`).
     * @return [ScheduledDepartureResult] detailing the next departure and wait duration.
     */
    fun getNextScheduledDeparture(
        departures: List<String>,
        currentTime: String
    ): ScheduledDepartureResult {
        if (departures.isEmpty()) {
            return ScheduledDepartureResult(
                nextDepartureTime = null,
                isServiceFinishedForDay = false,
                minutesUntilDeparture = null,
                dataTier = DataTier.UNAVAILABLE,
                displayLabel = "Schedule unavailable"
            )
        }

        val normalizedCurrent = normalizeTime(currentTime)
        val upcoming = departures.firstOrNull { normalizeTime(it) >= normalizedCurrent }

        return if (upcoming != null) {
            val waitMinutes = calculateMinutesBetween(normalizedCurrent, normalizeTime(upcoming))
            ScheduledDepartureResult(
                nextDepartureTime = upcoming,
                isServiceFinishedForDay = false,
                minutesUntilDeparture = waitMinutes,
                dataTier = DataTier.SCHEDULED,
                displayLabel = "Next scheduled departure: $upcoming IST"
            )
        } else {
            ScheduledDepartureResult(
                nextDepartureTime = null,
                isServiceFinishedForDay = true,
                minutesUntilDeparture = null,
                dataTier = DataTier.SCHEDULED,
                displayLabel = "Service finished for today"
            )
        }
    }

    /**
     * Normalizes a time string to strict 2-digit `HH:MM` format.
     */
    fun normalizeTime(time: String): String {
        val parts = time.trim().split(":")
        require(parts.size == 2) { "Time must be in HH:MM format. Received: $time" }
        val hours = parts[0].toIntOrNull()
        val minutes = parts[1].toIntOrNull()
        require(hours != null && hours in 0..23) { "Invalid hours (0-23) in time: $time" }
        require(minutes != null && minutes in 0..59) { "Invalid minutes (0-59) in time: $time" }

        val hh = if (hours < 10) "0$hours" else "$hours"
        val mm = if (minutes < 10) "0$minutes" else "$minutes"
        return "$hh:$mm"
    }

    /**
     * Calculates the elapsed minutes from [fromTime] to [toTime] on the same day.
     */
    fun calculateMinutesBetween(fromTime: String, toTime: String): Int {
        val fromParts = normalizeTime(fromTime).split(":").map { it.toInt() }
        val toParts = normalizeTime(toTime).split(":").map { it.toInt() }

        val fromTotal = fromParts[0] * 60 + fromParts[1]
        val toTotal = toParts[0] * 60 + toParts[1]

        val diff = toTotal - fromTotal
        return if (diff >= 0) diff else (1440 + diff) // handles midnight rollover
    }
}
