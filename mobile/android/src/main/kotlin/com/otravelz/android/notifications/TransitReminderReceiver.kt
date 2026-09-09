package com.otravelz.android.notifications

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.app.NotificationCompat
import com.otravelz.android.MainActivity

/**
 * Explicit BroadcastReceiver invoked by AlarmManager when a departure reminder triggers.
 * Builds and presents the truthful scheduled transit notification.
 */
class TransitReminderReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val routeId = intent.getStringExtra(EXTRA_ROUTE_ID) ?: return
        val routeNumber = intent.getStringExtra(EXTRA_ROUTE_NUMBER) ?: "Bus"
        val departureTime = intent.getStringExtra(EXTRA_DEPARTURE_TIME) ?: ""
        val offsetMinutes = intent.getIntExtra(EXTRA_OFFSET_MINUTES, 15)
        val notificationId = intent.getStringExtra(EXTRA_NOTIFICATION_ID)
            ?: "rem_tr_${routeId}_${departureTime}_${offsetMinutes}m"

        // Ensure notification channel exists
        NotificationChannels.ensureChannelsCreated(context)

        // Construct explicit deep-link intent to MainActivity
        val deepLinkIntent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = Uri.parse("otravelz://route/$routeId")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId.hashCode(),
            deepLinkIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = "Route $routeNumber — Scheduled departure in $offsetMinutes min"
        val body = "$departureTime IST. Scheduled timetable only; check operator before travel."

        val notification = NotificationCompat.Builder(context, NotificationChannels.CHANNEL_TRAVEL_REMINDERS)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        notificationManager?.notify(notificationId.hashCode(), notification)

        // Prune from active reminder store
        val store = SharedPrefsReminderStore(context)
        store.removeReminderById(notificationId)
    }

    companion object {
        const val EXTRA_NOTIFICATION_ID = "extra_notification_id"
        const val EXTRA_ROUTE_ID = "extra_route_id"
        const val EXTRA_ROUTE_NUMBER = "extra_route_number"
        const val EXTRA_DEPARTURE_TIME = "extra_departure_time"
        const val EXTRA_OFFSET_MINUTES = "extra_offset_minutes"

        fun createIntent(
            context: Context,
            notificationId: String,
            routeId: String,
            routeNumber: String,
            departureTime: String,
            offsetMinutes: Int
        ): Intent {
            return Intent(context, TransitReminderReceiver::class.java).apply {
                putExtra(EXTRA_NOTIFICATION_ID, notificationId)
                putExtra(EXTRA_ROUTE_ID, routeId)
                putExtra(EXTRA_ROUTE_NUMBER, routeNumber)
                putExtra(EXTRA_DEPARTURE_TIME, departureTime)
                putExtra(EXTRA_OFFSET_MINUTES, offsetMinutes)
            }
        }
    }
}
