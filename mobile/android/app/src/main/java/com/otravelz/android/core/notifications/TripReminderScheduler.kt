package com.otravelz.android.core.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.otravelz.android.core.location.FirstMileEstimator

/**
 * BroadcastReceiver triggered by AlarmManager to post scheduled contextual trip reminders.
 */
class TripAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val placeId = intent.getStringExtra(EXTRA_PLACE_ID) ?: return
        val placeName = intent.getStringExtra(EXTRA_PLACE_NAME) ?: "Odisha Destination"
        val customMessage = intent.getStringExtra(EXTRA_MESSAGE)

        NotificationHelper.showTripReminder(
            context = context,
            placeId = placeId,
            placeName = placeName,
            customMessage = customMessage
        )
    }

    companion object {
        const val EXTRA_PLACE_ID = "extra_place_id"
        const val EXTRA_PLACE_NAME = "extra_place_name"
        const val EXTRA_MESSAGE = "extra_message"
    }
}

/**
 * Scheduler for contextual departure reminders, transit prompts, and weather alerts.
 */
object TripReminderScheduler {

    /**
     * Schedules a future departure reminder for a saved trip / place via AlarmManager.
     */
    fun scheduleTripReminder(
        context: Context,
        placeId: String,
        placeName: String,
        triggerAtMillis: Long,
        customMessage: String? = null
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return

        val intent = Intent(context, TripAlarmReceiver::class.java).apply {
            putExtra(TripAlarmReceiver.EXTRA_PLACE_ID, placeId)
            putExtra(TripAlarmReceiver.EXTRA_PLACE_NAME, placeName)
            if (customMessage != null) {
                putExtra(TripAlarmReceiver.EXTRA_MESSAGE, customMessage)
            }
        }

        val requestCode = placeId.hashCode() and 0xFFFF
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pendingIntent = PendingIntent.getBroadcast(context, requestCode, intent, flags)

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
            } else {
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
            }
        } catch (_: SecurityException) {
            // Fallback to immediate notification if exact alarm permission is restricted
            NotificationHelper.showTripReminder(context, placeId, placeName, customMessage)
        }
    }

    /**
     * Cancels a scheduled departure reminder.
     */
    fun cancelScheduledReminder(context: Context, placeId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(context, TripAlarmReceiver::class.java)
        val requestCode = placeId.hashCode() and 0xFFFF
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pendingIntent = PendingIntent.getBroadcast(context, requestCode, intent, flags)
        alarmManager.cancel(pendingIntent)
    }

    /**
     * Dispatches immediate live weather advisory notification context.
     */
    fun triggerImmediateWeatherAdvisory(
        context: Context,
        placeName: String,
        condition: String,
        tempCelsius: Double,
        placeId: String? = null
    ): Boolean {
        val summary = "$condition, %.1f°C".format(tempCelsius)
        return NotificationHelper.showWeatherAlert(
            context = context,
            placeName = placeName,
            weatherSummary = summary,
            placeId = placeId
        )
    }

    /**
     * Dispatches first-mile transit walking prompt for scheduled Mo Bus departures.
     */
    fun triggerFirstMileTransitPrompt(
        context: Context,
        stopName: String,
        routeNumber: String,
        distanceMeters: Double,
        placeId: String? = null
    ): Boolean {
        val guidance = FirstMileEstimator.getRecommendation(distanceMeters)
        val advice = "Distance: %.0fm · Recommendation: %s".format(distanceMeters, guidance)
        return NotificationHelper.showTransitGuidance(
            context = context,
            stopName = stopName,
            routeName = "Mo Bus Route $routeNumber",
            advice = advice,
            placeId = placeId
        )
    }
}
