package com.otravelz.android

import android.app.Application
import com.otravelz.android.core.network.NetworkClient
import com.otravelz.android.core.notifications.NotificationHelper
import com.otravelz.android.data.local.BundledCatalogProvider

class OTravelzApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize Notification Channels
        NotificationHelper.createNotificationChannels(this)
        // Initialize Bundled Catalog Fallback
        BundledCatalogProvider.initialize(this)
        // Initialize Network Cache
        NetworkClient.initialize(this)
    }
}
