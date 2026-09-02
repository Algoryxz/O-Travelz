package com.otravelz.android.core.network

import com.otravelz.android.BuildConfig

object ApiConfig {
    // Production Render Backend URL (default fallback for Android release builds)
    const val PROD_BASE_URL = "https://otravelz-backend.onrender.com/"
    
    // Android Emulator / Local loopback (with adb reverse tcp:8000 tcp:8000)
    const val LOCAL_BASE_URL = "http://127.0.0.1:8000/"
    const val EMULATOR_LOCAL_BASE_URL = "http://10.0.2.2:8000/"

    // Active Base URL
    var activeBaseUrl: String = PROD_BASE_URL

    /**
     * Resolves relative image paths (e.g. /static/images/...) against activeBaseUrl.
     */
    fun resolveImageUrl(rawUrl: String?): String? {
        if (rawUrl.isNullOrBlank()) return null
        return if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            rawUrl
        } else {
            val base = activeBaseUrl.removeSuffix("/")
            val path = if (rawUrl.startsWith("/")) rawUrl else "/$rawUrl"
            "$base$path"
        }
    }
}
