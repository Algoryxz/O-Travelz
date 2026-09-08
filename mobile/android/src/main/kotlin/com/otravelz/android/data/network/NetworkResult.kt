package com.otravelz.android.data.network

/**
 * Functional result envelope for network operations.
 */
sealed interface NetworkResult<out T> {
    data class Success<out T>(val data: T) : NetworkResult<T>
    data class Failure(val error: NetworkError) : NetworkResult<Nothing>

    val isSuccess: Boolean get() = this is Success
    val isFailure: Boolean get() = this is Failure

    fun getOrNull(): T? = when (this) {
        is Success -> data
        is Failure -> null
    }
}

inline fun <T, R> NetworkResult<T>.map(transform: (T) -> R): NetworkResult<R> = when (this) {
    is NetworkResult.Success -> NetworkResult.Success(transform(data))
    is NetworkResult.Failure -> this
}
