package com.otravelz.android.core.error

import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import retrofit2.HttpException

/**
 * Canonical user-facing error taxonomy for O-TRAVELZ Mobile.
 * Distinguishes known network, domain, and permission states
 * without exposing raw technical exceptions or stack traces to the user.
 */
enum class AppErrorCode {
    OFFLINE,
    TIMEOUT,
    SERVER_ERROR,
    NOT_FOUND,
    RATE_LIMITED,
    SERIALIZATION_ERROR,
    AUTH_REQUIRED,
    LOCATION_PERMISSION_DENIED,
    GPS_UNAVAILABLE,
    EMPTY_RESULTS,
    WEATHER_UNAVAILABLE,
    MEDIA_UNAVAILABLE,
    TRANSIT_DATA_UNAVAILABLE,
    UNKNOWN
}

data class AppError(
    val code: AppErrorCode,
    val title: String,
    val message: String,
    val actionLabel: String? = "Retry",
    val isTransient: Boolean = true,
    val technicalDetails: String? = null
) {
    companion object {
        fun fromThrowable(t: Throwable?): AppError {
            if (t == null) {
                return AppError(
                    code = AppErrorCode.UNKNOWN,
                    title = "Something went wrong",
                    message = "An unexpected condition occurred. Please try again.",
                    actionLabel = "Retry"
                )
            }

            return when (t) {
                is UnknownHostException -> AppError(
                    code = AppErrorCode.OFFLINE,
                    title = "Offline Mode",
                    message = "You are currently offline. Showing local verified data where available.",
                    actionLabel = "Retry Connection",
                    isTransient = true,
                    technicalDetails = t.message
                )
                is SocketTimeoutException -> AppError(
                    code = AppErrorCode.TIMEOUT,
                    title = "Connection Timed Out",
                    message = "The request took too long to complete. The server may be warming up.",
                    actionLabel = "Try Again",
                    isTransient = true,
                    technicalDetails = t.message
                )
                is HttpException -> {
                    val code = t.code()
                    when (code) {
                        401, 403 -> AppError(
                            code = AppErrorCode.AUTH_REQUIRED,
                            title = "Authentication Required",
                            message = "Please sign in or refresh your session to proceed.",
                            actionLabel = "Sign In",
                            isTransient = false,
                            technicalDetails = "HTTP $code: ${t.message()}"
                        )
                        404 -> AppError(
                            code = AppErrorCode.NOT_FOUND,
                            title = "Not Found",
                            message = "The requested destination or resource could not be found.",
                            actionLabel = "Go Back",
                            isTransient = false,
                            technicalDetails = "HTTP 404"
                        )
                        429 -> AppError(
                            code = AppErrorCode.RATE_LIMITED,
                            title = "Too Many Requests",
                            message = "Request limit reached. Please wait a moment before trying again.",
                            actionLabel = "Wait & Retry",
                            isTransient = true,
                            technicalDetails = "HTTP 429"
                        )
                        in 500..599 -> AppError(
                            code = AppErrorCode.SERVER_ERROR,
                            title = "Server Error",
                            message = "The backend service is temporarily experiencing difficulties. (HTTP $code)",
                            actionLabel = "Retry",
                            isTransient = true,
                            technicalDetails = "HTTP $code: ${t.message()}"
                        )
                        else -> AppError(
                            code = AppErrorCode.UNKNOWN,
                            title = "Request Failed",
                            message = "Unable to complete request (HTTP $code).",
                            actionLabel = "Retry",
                            isTransient = true,
                            technicalDetails = "HTTP $code"
                        )
                    }
                }
                is kotlinx.serialization.SerializationException -> AppError(
                    code = AppErrorCode.SERIALIZATION_ERROR,
                    title = "Data Parsing Error",
                    message = "Received unexpected data format from the server. Using local cache.",
                    actionLabel = "Reload",
                    isTransient = false,
                    technicalDetails = t.message
                )
                is IOException -> AppError(
                    code = AppErrorCode.OFFLINE,
                    title = "Network Issue",
                    message = "Unable to connect to O-TRAVELZ servers. Check your internet connection.",
                    actionLabel = "Retry",
                    isTransient = true,
                    technicalDetails = t.message
                )
                else -> AppError(
                    code = AppErrorCode.UNKNOWN,
                    title = "Notice",
                    message = t.message?.takeIf { it.isNotBlank() } ?: "Unable to complete operation. Please retry.",
                    actionLabel = "Retry",
                    isTransient = true,
                    technicalDetails = t.javaClass.simpleName
                )
            }
        }

        fun locationPermissionDenied(): AppError = AppError(
            code = AppErrorCode.LOCATION_PERMISSION_DENIED,
            title = "Location Permission Required",
            message = "Location access was denied. Using Bhubaneswar reference point for distances.",
            actionLabel = "Grant Permission",
            isTransient = false
        )

        fun gpsUnavailable(): AppError = AppError(
            code = AppErrorCode.GPS_UNAVAILABLE,
            title = "GPS Signal Unavailable",
            message = "Unable to acquire accurate GPS fix. Using Bhubaneswar reference point.",
            actionLabel = "Retry Location",
            isTransient = true
        )

        fun emptyResults(query: String? = null): AppError = AppError(
            code = AppErrorCode.EMPTY_RESULTS,
            title = "No Destinations Found",
            message = if (query.isNullOrBlank()) "No destinations match the selected filters." else "No destinations found matching \"$query\".",
            actionLabel = "Clear Filters",
            isTransient = false
        )

        fun weatherUnavailable(): AppError = AppError(
            code = AppErrorCode.WEATHER_UNAVAILABLE,
            title = "Weather Unavailable",
            message = "Live weather telemetry is temporarily unreachable. Open-Meteo fallback active.",
            actionLabel = "Refresh Weather",
            isTransient = true
        )

        fun mediaUnavailable(): AppError = AppError(
            code = AppErrorCode.MEDIA_UNAVAILABLE,
            title = "Media Unavailable",
            message = "Verified media or video stream is currently offline.",
            actionLabel = "Reload Media",
            isTransient = true
        )

        fun transitDataUnavailable(): AppError = AppError(
            code = AppErrorCode.TRANSIT_DATA_UNAVAILABLE,
            title = "Transit Timetable Unavailable",
            message = "Mo Bus / Ama Bus scheduled routes could not be loaded. Showing walking estimates.",
            actionLabel = "Retry Transit",
            isTransient = true
        )
    }
}
