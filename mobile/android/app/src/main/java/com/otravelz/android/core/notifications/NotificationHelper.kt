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

/**
 * NotificationHelper manages notification channels, deep link pending intents,
 * and dispatching of contextual trip reminders, scheduled transit guidance, and weather alerts.
 * Fully compatible from API 26 (Android 8.0) through API 34 (Android 14).
 */
object NotificationHelper {

    // Notification Channel IDs
    const val CHANNEL_TRIP_ALERTS = "otravelz_trip_alerts"
    const val CHANNEL_TRANSIT_GUIDANCE = "otravelz_transit_guidance"
    const val CHANNEL_WEATHER_ALERTS = "otravelz_weather_alerts"

    // Deep link constants
    const val DEEP_LINK_SCHEME = "otravelz"
    const val DEEP_LINK_HOST_PLACE = "place"
    const val DEEP_LINK_URI_PREFIX = "otravelz://place?id="

    // Notification ID bases
    const val NOTIFICATION_ID_BASE_TRIP = 1000
    const val NOTIFICATION_ID_BASE_TRANSIT = 2000
    const val NOTIFICATION_ID_BASE_WEATHER = 3000

    /**
     * Initializes all required notification channels on Android 8.0+ (API 26+).
     */
    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                ?: return

            val tripChannel = NotificationChannel(
                CHANNEL_TRIP_ALERTS,
                "Trip Reminders & Alerts",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Contextual destination reminders and saved travel alerts"
                enableLights(true)
                setShowBadge(true)
            }

            val transitChannel = NotificationChannel(
                CHANNEL_TRANSIT_GUIDANCE,
                "Transit Guidance (Scheduled)",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Scheduled Mo Bus / Ama Bus timetables and first-mile walking prompts"
                setShowBadge(false)
            }

            val weatherChannel = NotificationChannel(
                CHANNEL_WEATHER_ALERTS,
                "Live Weather Updates",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Live Open-Meteo regional weather condition advisories"
                setShowBadge(false)
            }

            notificationManager.createNotificationChannel(tripChannel)
            notificationManager.createNotificationChannel(transitChannel)
            notificationManager.createNotificationChannel(weatherChannel)
        }
    }

    /**
     * Checks if notification permission is currently granted and enabled.
     * Compatible with API 26 through API 34.
     */
    fun hasNotificationPermission(context: Context): Boolean {
        val areNotificationsEnabled = NotificationManagerCompat.from(context).areNotificationsEnabled()
        if (!areNotificationsEnabled) return false

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    /**
     * Builds the canonical deep link URI string for a place.
     */
    fun buildPlaceDeepLinkUriString(placeId: String): String {
        return "$DEEP_LINK_URI_PREFIX$placeId"
    }

    /**
     * Builds the canonical deep link URI for a place.
     */
    fun buildPlaceDeepLinkUri(placeId: String): Uri {
        return Uri.parse(buildPlaceDeepLinkUriString(placeId))
    }

    /**
     * Creates an Intent configured for deep linking into a place or the main home screen.
     */
    fun createPlaceDeepLinkIntent(context: Context, placeId: String?): Intent {
        return if (!placeId.isNullOrBlank()) {
            Intent(Intent.ACTION_VIEW, buildPlaceDeepLinkUri(placeId)).apply {
                setClass(context, MainActivity::class.java)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
        } else {
            Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
        }
    }

    /**
     * Generates an immutable PendingIntent targeting MainActivity with deep link payload.
     */
    fun createPendingIntent(context: Context, notificationId: Int, placeId: String?): PendingIntent {
        val intent = createPlaceDeepLinkIntent(context, placeId)
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        return PendingIntent.getActivity(context, notificationId, intent, flags)
    }

    /**
     * Dispatches a local notification with deep link PendingIntent.
     * Returns true if successfully posted, or false if permissions are absent.
     */
    fun showLocalNotification(
        context: Context,
        notificationId: Int,
        title: String,
        message: String,
        placeId: String? = null,
        channelId: String = CHANNEL_TRIP_ALERTS,
        subText: String? = null
    ): Boolean {
        if (!hasNotificationPermission(context)) {
            return false
        }

        val pendingIntent = createPendingIntent(context, notificationId, placeId)

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(
                if (channelId == CHANNEL_TRIP_ALERTS) NotificationCompat.PRIORITY_DEFAULT
                else NotificationCompat.PRIORITY_LOW
            )
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        if (!subText.isNullOrBlank()) {
            builder.setSubText(subText)
        }

        return try {
            with(NotificationManagerCompat.from(context)) {
                notify(notificationId, builder.build())
            }
            true
        } catch (e: SecurityException) {
            false
        }
    }

    /**
     * Dispatches a contextual trip reminder for a specific destination.
     */
    fun showTripReminder(
        context: Context,
        placeId: String,
        placeName: String,
        customMessage: String? = null
    ): Boolean {
        val notificationId = NOTIFICATION_ID_BASE_TRIP + (placeId.hashCode() and 0xFFFF)
        val title = "Trip Reminder: $placeName"
        val message = customMessage
            ?: "Your saved destination in Odisha is ready to explore. Tap to view verified coordinates and first-mile transit."
        return showLocalNotification(
            context = context,
            notificationId = notificationId,
            title = title,
            message = message,
            placeId = placeId,
            channelId = CHANNEL_TRIP_ALERTS,
            subText = "Verified Destination"
        )
    }

    /**
     * Dispatches scheduled transit guidance (honestly labeled Scheduled).
     */
    fun showTransitGuidance(
        context: Context,
        stopName: String,
        routeName: String,
        advice: String,
        placeId: String? = null
    ): Boolean {
        val notificationId = NOTIFICATION_ID_BASE_TRANSIT + (stopName.hashCode() and 0xFFFF)
        val title = "Transit Guidance: $routeName"
        val message = "Scheduled stop: $stopName. $advice"
        return showLocalNotification(
            context = context,
            notificationId = notificationId,
            title = title,
            message = message,
            placeId = placeId,
            channelId = CHANNEL_TRANSIT_GUIDANCE,
            subText = "Scheduled Timetable"
        )
    }

    /**
     * Dispatches live weather alert context.
     */
    fun showWeatherAlert(
        context: Context,
        placeName: String,
        weatherSummary: String,
        placeId: String? = null
    ): Boolean {
        val notificationId = NOTIFICATION_ID_BASE_WEATHER + (placeName.hashCode() and 0xFFFF)
        val title = "Weather Alert: $placeName"
        val message = "Current conditions: $weatherSummary. Plan your transit accordingly."
        return showLocalNotification(
            context = context,
            notificationId = notificationId,
            title = title,
            message = message,
            placeId = placeId,
            channelId = CHANNEL_WEATHER_ALERTS,
            subText = "Live Open-Meteo"
        )
    }

    /**
     * Cancels a specific notification by ID.
     */
    fun cancelNotification(context: Context, notificationId: Int) {
        with(NotificationManagerCompat.from(context)) {
            cancel(notificationId)
        }
    }

    /**
     * Cancels all notifications issued by O-Travelz.
     */
    fun cancelAll(context: Context) {
        with(NotificationManagerCompat.from(context)) {
            cancelAll()
        }
    }
}
