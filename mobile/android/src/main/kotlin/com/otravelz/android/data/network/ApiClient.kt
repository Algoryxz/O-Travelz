package com.otravelz.android.data.network

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.coroutines.CancellationException
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.HttpException
import retrofit2.Retrofit
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import java.util.concurrent.TimeUnit

/**
 * Native HTTP client factory and safe API execution wrapper.
 */
object ApiClient {

    val json: Json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        isLenient = true
        encodeDefaults = true
    }

    fun createOkHttpClient(enableLogging: Boolean = false): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .connectTimeout(ApiConfig.CONNECT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(ApiConfig.READ_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(ApiConfig.WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)

        if (enableLogging) {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BASIC
            }
            builder.addInterceptor(logging)
        }

        return builder.build()
    }

    fun createService(
        baseUrl: String = ApiConfig.DEFAULT_BASE_URL,
        okHttpClient: OkHttpClient = createOkHttpClient()
    ): OTravelzApiService {
        val contentType = "application/json".toMediaType()
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(OTravelzApiService::class.java)
    }

    /**
     * Executes an API call safely, mapping transport and serialization errors into NetworkResult.
     */
    suspend fun <T> safeApiCall(block: suspend () -> T): NetworkResult<T> {
        return try {
            NetworkResult.Success(block())
        } catch (e: CancellationException) {
            NetworkResult.Failure(NetworkError.Cancelled)
        } catch (e: SocketTimeoutException) {
            NetworkResult.Failure(NetworkError.Timeout)
        } catch (e: UnknownHostException) {
            NetworkResult.Failure(NetworkError.NetworkUnavailable)
        } catch (e: HttpException) {
            val code = e.code()
            val errorBody = e.response()?.errorBody()?.string() ?: e.message()
            val networkError = when (code) {
                422 -> NetworkError.ValidationError(null, errorBody)
                in 400..499 -> NetworkError.HttpClientError(code, errorBody)
                in 500..599 -> NetworkError.HttpServerError(code, errorBody)
                else -> NetworkError.IncompatibleResponse("Unexpected HTTP $code: $errorBody")
            }
            NetworkResult.Failure(networkError)
        } catch (e: kotlinx.serialization.SerializationException) {
            NetworkResult.Failure(NetworkError.DecodingError("Failed to decode JSON: ${e.message}", e))
        } catch (e: IOException) {
            NetworkResult.Failure(NetworkError.NetworkUnavailable)
        } catch (e: Exception) {
            NetworkResult.Failure(NetworkError.IncompatibleResponse(e.message ?: "Unknown error"))
        }
    }
}
