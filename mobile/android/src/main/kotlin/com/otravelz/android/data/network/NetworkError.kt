package com.otravelz.android.data.network

/**
 * Normalized network error hierarchy strictly separated from domain state.
 */
sealed class NetworkError(open val message: String) {
    data object NetworkUnavailable : NetworkError("No network connection or host unreachable.")
    data object Timeout : NetworkError("Network request timed out.")
    data class HttpClientError(val statusCode: Int, override val message: String) : NetworkError(message)
    data class HttpServerError(val statusCode: Int, override val message: String) : NetworkError(message)
    data class ValidationError(val field: String?, override val message: String) : NetworkError(message)
    data class DecodingError(override val message: String, val cause: Throwable? = null) : NetworkError(message)
    data class IncompatibleResponse(override val message: String) : NetworkError(message)
    data object Cancelled : NetworkError("Network operation was cancelled.")
}
