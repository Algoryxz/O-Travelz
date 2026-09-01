package com.otravelz.android.core.network

sealed class NetworkResult<out T> {
    data class Success<out T>(val data: T) : NetworkResult<T>()
    data class Error(val message: String, val isRetryable: Boolean = true, val cause: Throwable? = null) : NetworkResult<Nothing>()
    object Loading : NetworkResult<Nothing>()
}

enum class NetworkFailureCategory {
    OFFLINE,
    TIMEOUT_OR_COLD_START,
    DNS_OR_UNRESOLVED,
    HTTP_ERROR,
    UNKNOWN
}

data class NetworkDiagnostic(
    val category: NetworkFailureCategory,
    val message: String,
    val isRetryable: Boolean
)
