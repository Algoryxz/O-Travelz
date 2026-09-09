package com.otravelz.android.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.os.Build
import androidx.core.content.ContextCompat

/**
 * Native Android scheduler for local transit departure reminders.
 * Utilizes AlarmManager with low-power safe idle execution.
 */
class TransitReminderScheduler(
    private val context: Context,
    private val reminderStore: ReminderStore = SharedPrefsReminderStore(context)
) {

    private val alarmManager: AlarmManager? =
        context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager

    /**
     * Schedules a local countdown departure reminder.
     */
    fun scheduleReminder(request: TransitReminderRequest): ReminderScheduleResult {
        // Calculate trigger timestamp
        val triggerEpochMs = TransitReminderCalculator.calculateTriggerEpochMs(
            departureTime = request.departureTime,
            offsetMinutes = request.offsetMinutes,
            targetDate = request.targetDate
        ) ?: return ReminderScheduleResult.PassedDeparture

        if (alarmManager == null) {
            return ReminderScheduleResult.Error("AlarmManager not available on device")
        }

        // Ensure notification channel is initialized
        NotificationChannels.ensureChannelsCreated(context)

        val intent = TransitReminderReceiver.createIntent(
            context = context,
            notificationId = request.notificationId,
            routeId = request.routeId,
            routeNumber = request.routeNumber,
            departureTime = request.departureTime,
            offsetMinutes = request.offsetMinutes
        )

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            request.notificationId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerEpochMs,
                    pendingIntent
                )
            } else {
                alarmManager.set(
                    AlarmManager.RTC_WAKEUP,
                    triggerEpochMs,
                    pendingIntent
                )
            }

            // Record in active reminder store
            reminderStore.saveReminder(
                ActiveReminderInfo(
                    id = request.notificationId,
                    routeId = request.routeId,
                    departureTime = request.departureTime,
                    offsetMinutes = request.offsetMinutes,
                    scheduledAtEpochMs = triggerEpochMs
                )
            )

            return ReminderScheduleResult.Success(
                notificationId = request.notificationId,
                scheduledEpochMs = triggerEpochMs,
                triggerMessage = "Reminder set for ${request.offsetMinutes}m before departure"
            )
        } catch (e: SecurityException) {
            return ReminderScheduleResult.Error("Permission denied: ${e.localizedMessage}")
        } catch (e: Exception) {
            return ReminderScheduleResult.Error("Failed to schedule reminder: ${e.localizedMessage}")
        }
    }

    /**
     * Cancels an existing scheduled departure reminder.
     */
    fun cancelReminder(routeId: String, departureTime: String) {
        val existing = reminderStore.getActiveReminder(routeId, departureTime) ?: return

        val intent = TransitReminderReceiver.createIntent(
            context = context,
            notificationId = existing.id,
            routeId = existing.routeId,
            routeNumber = "",
            departureTime = existing.departureTime,
            offsetMinutes = existing.offsetMinutes
        )

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            existing.id.hashCode(),
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )

        if (pendingIntent != null && alarmManager != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        }

        reminderStore.removeReminder(routeId, departureTime)
    }

    fun isReminderActive(routeId: String, departureTime: String): Boolean {
        return reminderStore.isReminderActive(routeId, departureTime)
    }

    fun getActiveReminder(routeId: String, departureTime: String): ActiveReminderInfo? {
        return reminderStore.getActiveReminder(routeId, departureTime)
    }
}
