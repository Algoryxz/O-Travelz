package com.otravelz.android.core.network

import android.content.Context
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.otravelz.android.data.api.ApiService
import kotlinx.serialization.json.Json
import okhttp3.Cache
import okhttp3.CacheControl
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.io.File
import java.util.concurrent.TimeUnit

object NetworkClient {
    private var appContext: Context? = null
    private var okHttpClientInstance: OkHttpClient? = null
    private var apiServiceInstance: ApiService? = null

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        isLenient = true
        encodeDefaults = true
    }

    fun initialize(context: Context) {
        appContext = context.applicationContext
        // Reset client so it rebuilds with disk cache
        okHttpClientInstance = null
        apiServiceInstance = null
    }

    private fun getOkHttpClient(): OkHttpClient {
        return okHttpClientInstance ?: synchronized(this) {
            okHttpClientInstance ?: buildOkHttpClient().also { okHttpClientInstance = it }
        }
    }

    private fun buildOkHttpClient(): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val builder = OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)

        appContext?.let { ctx ->
            val cacheSize = 10L * 1024 * 1024 // 10 MB disk cache
            val cacheDir = File(ctx.cacheDir, "http_response_cache")
            builder.cache(Cache(cacheDir, cacheSize))

            // Cache-Control Interceptor for transparent GET caching
            builder.addNetworkInterceptor(Interceptor { chain ->
                val response: Response = chain.proceed(chain.request())
                if (chain.request().method == "GET") {
                    val cacheControl = CacheControl.Builder()
                        .maxAge(5, TimeUnit.MINUTES)
                        .build()
                    response.newBuilder()
                        .header("Cache-Control", cacheControl.toString())
                        .removeHeader("Pragma")
                        .build()
                } else {
                    response
                }
            })
        }

        return builder.build()
    }

    val apiService: ApiService
        get() {
            return apiServiceInstance ?: synchronized(this) {
                apiServiceInstance ?: buildApiService().also { apiServiceInstance = it }
            }
        }

    private fun buildApiService(): ApiService {
        val contentType = "application/json".toMediaType()
        return Retrofit.Builder()
            .baseUrl(ApiConfig.activeBaseUrl)
            .client(getOkHttpClient())
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(ApiService::class.java)
    }
}
