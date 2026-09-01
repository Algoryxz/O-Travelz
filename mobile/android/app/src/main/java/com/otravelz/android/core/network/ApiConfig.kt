package com.otravelz.android.core.network

object ApiConfig {
    // Production Render Backend URL (default fallback for Android physical & emulator)
    const val PROD_BASE_URL = "https://otravelz-backend.onrender.com/"
    
    // Android Emulator loopback alias for 127.0.0.1
    const val EMULATOR_LOCAL_BASE_URL = "http://10.0.2.2:8000/"

    // Active Base URL
    var activeBaseUrl: String = PROD_BASE_URL
}
