package com.otravelz.android.core.notifications

import android.Manifest
import android.content.Context
import android.os.Build
import androidx.activity.compose.ManagedActivityResultLauncher
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext

/**
 * State holder for notification permission status and request handling.
 */
@Stable
class NotificationPermissionState(
    val hasPermission: Boolean,
    val requiresRuntimePermission: Boolean,
    val launcher: ManagedActivityResultLauncher<String, Boolean>?,
    private val context: Context,
    private val onPermissionResult: ((Boolean) -> Unit)? = null
) {
    var showRationaleDialog by mutableStateOf(false)

    fun requestPermission() {
        if (!requiresRuntimePermission) {
            onPermissionResult?.invoke(hasPermission)
            return
        }

        if (hasPermission) {
            onPermissionResult?.invoke(true)
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            launcher?.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }
}

/**
 * Composable helper that encapsulates POST_NOTIFICATIONS permission request using rememberLauncherForActivityResult.
 * Supports Android 13+ (API 33+) runtime permissions and gracefully resolves on API 26-32.
 */
@Composable
fun rememberNotificationPermissionState(
    onPermissionGranted: (() -> Unit)? = null,
    onPermissionDenied: (() -> Unit)? = null
): NotificationPermissionState {
    val context = LocalContext.current
    var hasPermission by remember {
        mutableStateOf(NotificationHelper.hasNotificationPermission(context))
    }

    val requiresRuntimePermission = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU

    val launcher = if (requiresRuntimePermission) {
        rememberLauncherForActivityResult(
            contract = ActivityResultContracts.RequestPermission()
        ) { isGranted ->
            hasPermission = isGranted && NotificationHelper.hasNotificationPermission(context)
            if (hasPermission) {
                onPermissionGranted?.invoke()
            } else {
                onPermissionDenied?.invoke()
            }
        }
    } else {
        null
    }

    return remember(hasPermission, requiresRuntimePermission, launcher) {
        NotificationPermissionState(
            hasPermission = hasPermission,
            requiresRuntimePermission = requiresRuntimePermission,
            launcher = launcher,
            context = context,
            onPermissionResult = { granted ->
                if (granted) onPermissionGranted?.invoke() else onPermissionDenied?.invoke()
            }
        )
    }
}
