package com.otravelz.android.core.notifications

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.otravelz.android.MainActivity

object NotificationHelper {
    const val CHANNEL_TRIP_ALERTS = "otravelz_trip_alerts"
    const val CHANNEL_TRANSIT_GUIDANCE = "otravelz_transit_guidance"

    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val tripChannel = NotificationChannel(
                CHANNEL_TRIP_ALERTS,
                "Trip Reminders & Alerts",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Contextual itinerary and milestone reminders"
            }

            val transitChannel = NotificationChannel(
                CHANNEL_TRANSIT_GUIDANCE,
                "Transit Guidance (Scheduled)",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Scheduled timetable and first-mile walking prompts"
            }

            notificationManager.createNotificationChannel(tripChannel)
            notificationManager.createNotificationChannel(transitChannel)
        }
    }

    fun showLocalNotification(
        context: Context,
        notificationId: Int,
        title: String,
        message: String,
        placeId: String? = null
    ) {
        // Android 13+ Runtime Permission Check
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    context,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                return
            }
        }

        val intent = if (placeId != null) {
            Intent(Intent.ACTION_VIEW, Uri.parse("otravelz://place?id=$placeId")).apply {
                setClass(context, MainActivity::class.java)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
        } else {
            Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, CHANNEL_TRIP_ALERTS)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        with(NotificationManagerCompat.from(context)) {
            notify(notificationId, builder.build())
        }
    }
}
