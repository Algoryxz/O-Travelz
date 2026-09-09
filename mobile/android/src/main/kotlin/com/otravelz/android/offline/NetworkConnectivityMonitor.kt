package com.otravelz.android.offline

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Advisory, non-authoritative connectivity state.
 */
sealed interface NetworkState {
    data object Online : NetworkState
    data object Offline : NetworkState
    data object Unknown : NetworkState
}

/**
 * Lightweight, non-invasive network monitor.
 * - Uses ConnectivityManager.NetworkCallback.
 * - Zero polling loops, zero wake locks, zero background services, zero analytics.
 * - Fails safely in headless unit test environments.
 */
class NetworkConnectivityMonitor private constructor(context: Context?) {

    private val _networkState = MutableStateFlow<NetworkState>(NetworkState.Unknown)
    val networkState: StateFlow<NetworkState> = _networkState.asStateFlow()

    private var connectivityManager: ConnectivityManager? = null
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

    init {
        if (context != null) {
            try {
                connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
                checkInitialState()
                registerCallback()
            } catch (t: Throwable) {
                // Failsafe fallback for restricted or unit-test environments
                _networkState.value = NetworkState.Online
            }
        } else {
            _networkState.value = NetworkState.Online
        }
    }

    private fun checkInitialState() {
        val cm = connectivityManager ?: return
        val activeNetwork = cm.activeNetwork
        if (activeNetwork != null) {
            val caps = cm.getNetworkCapabilities(activeNetwork)
            val hasInternet = caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
            _networkState.value = if (hasInternet) NetworkState.Online else NetworkState.Offline
        } else {
            _networkState.value = NetworkState.Offline
        }
    }

    private fun registerCallback() {
        val cm = connectivityManager ?: return
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()

        networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                _networkState.value = NetworkState.Online
            }

            override fun onLost(network: Network) {
                // Check if any other networks are available before setting offline
                val activeNetwork = cm.activeNetwork
                if (activeNetwork != null) {
                    val caps = cm.getNetworkCapabilities(activeNetwork)
                    val hasInternet = caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
                    _networkState.value = if (hasInternet) NetworkState.Online else NetworkState.Offline
                } else {
                    _networkState.value = NetworkState.Offline
                }
            }

            override fun onUnavailable() {
                _networkState.value = NetworkState.Offline
            }
        }

        try {
            cm.registerNetworkCallback(request, networkCallback!!)
        } catch (t: Throwable) {
            _networkState.value = NetworkState.Online
        }
    }

    /**
     * Test seam to set state deterministically.
     */
    fun setSimulatedState(state: NetworkState) {
        _networkState.value = state
    }

    companion object {
        @Volatile
        private var INSTANCE: NetworkConnectivityMonitor? = null

        fun getInstance(context: Context?): NetworkConnectivityMonitor {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: NetworkConnectivityMonitor(context?.applicationContext ?: context).also {
                    INSTANCE = it
                }
            }
        }

        fun createMock(initialState: NetworkState = NetworkState.Online): NetworkConnectivityMonitor {
            val monitor = NetworkConnectivityMonitor(null)
            monitor.setSimulatedState(initialState)
            return monitor
        }
    }
}
