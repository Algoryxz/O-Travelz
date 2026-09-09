package com.otravelz.android.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

/**
 * Android Notification Channel configuration for O-TRAVELZ Mobile V4.
 * Enforces Ponytail minimalism: a single dedicated channel for high-value travel reminders.
 */
object NotificationChannels {

    const val CHANNEL_TRAVEL_REMINDERS = "travel_reminders"

    fun ensureChannelsCreated(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                ?: return

            val channel = NotificationChannel(
                CHANNEL_TRAVEL_REMINDERS,
                "Travel & Transit Reminders",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Timely countdown reminders for scheduled Mo Bus and Ama Bus departures."
                enableVibration(true)
                setShowBadge(true)
            }

            notificationManager.createNotificationChannel(channel)
        }
    }
}
