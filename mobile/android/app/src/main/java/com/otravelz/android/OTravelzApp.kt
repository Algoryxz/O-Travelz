package com.otravelz.android

import android.app.Application
import com.otravelz.android.core.notifications.NotificationHelper

class OTravelzApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize Notification Channels
        NotificationHelper.createNotificationChannels(this)
    }
}
