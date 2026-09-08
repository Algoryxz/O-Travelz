package com.otravelz.android.data.network

/**
 * Single source of truth for Android networking configuration.
 */
object ApiConfig {
    const val DEFAULT_BASE_URL: String = "https://otravelz-backend.onrender.com/"

    // Timeout specifications per policy
    const val CONNECT_TIMEOUT_SECONDS: Long = 10L
    const val READ_TIMEOUT_SECONDS: Long = 15L
    const val WRITE_TIMEOUT_SECONDS: Long = 15L

    const val FAST_TIMEOUT_SECONDS: Long = 5L
    const val AI_READ_TIMEOUT_SECONDS: Long = 30L
    const val ITINERARY_READ_TIMEOUT_SECONDS: Long = 25L
}
