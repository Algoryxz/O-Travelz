package com.otravelz.android.notifications

import java.time.LocalDate

/**
 * Representation of a user-requested scheduled transit departure reminder.
 */
data class TransitReminderRequest(
    val routeId: String,
    val routeNumber: String,
    val origin: String,
    val departureTime: String, // HH:mm in IST
    val offsetMinutes: Int = 15,
    val targetDate: LocalDate = LocalDate.now(TransitReminderCalculator.ZONE_IST)
) {
    val notificationId: String
        get() = "rem_tr_${routeId}_${departureTime.replace(":", "")}_${offsetMinutes}m"

    val title: String
        get() = "Route $routeNumber — Scheduled departure in $offsetMinutes min"

    val body: String
        get() = "$departureTime IST from $origin. Scheduled timetable only; check operator before travel."

    val deepLinkUri: String
        get() = "otravelz://route/$routeId"
}

/**
 * Result of attempting to schedule a reminder.
 */
sealed interface ReminderScheduleResult {
    data class Success(
        val notificationId: String,
        val scheduledEpochMs: Long,
        val triggerMessage: String
    ) : ReminderScheduleResult

    data object PassedDeparture : ReminderScheduleResult
    data object PermissionDenied : ReminderScheduleResult
    data class Error(val message: String) : ReminderScheduleResult
}

/**
 * Lightweight representation of an actively scheduled reminder for UI presentation.
 */
data class ActiveReminderInfo(
    val id: String,
    val routeId: String,
    val departureTime: String,
    val offsetMinutes: Int,
    val scheduledAtEpochMs: Long
)
