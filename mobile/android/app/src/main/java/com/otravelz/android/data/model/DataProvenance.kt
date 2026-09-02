package com.otravelz.android.data.model

import androidx.compose.ui.graphics.Color
import com.otravelz.android.core.design.OchreLight
import com.otravelz.android.core.design.StatusInfo
import com.otravelz.android.core.design.StatusSuccess

/**
 * Data provenance indicator representing the truth source of displayed catalog and transit data.
 */
enum class DataProvenance(val label: String, val badgeText: String) {
    /** Fresh live network response directly from backend / Open-Meteo / CRUT API */
    LIVE("Live Network", "LIVE"),

    /** Cached local response from recent successful network session */
    CACHED("Local Cache", "CACHED"),

    /** Bundled canonical static fallback bundled within APK assets */
    OFFLINE_FALLBACK("Offline Fallback", "OFFLINE FALLBACK");

    fun getBadgeColor(): Color {
        return when (this) {
            LIVE -> StatusSuccess
            CACHED -> StatusInfo
            OFFLINE_FALLBACK -> OchreLight
        }
    }
}

/**
 * Wrapper holding a list or item result along with its verifiable provenance.
 */
data class ProvenanceResult<T>(
    val data: T,
    val provenance: DataProvenance,
    val isFresh: Boolean = provenance == DataProvenance.LIVE
)
