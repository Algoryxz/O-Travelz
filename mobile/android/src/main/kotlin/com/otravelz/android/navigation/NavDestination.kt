package com.otravelz.android.navigation

import androidx.annotation.StringRes
import com.otravelz.android.R

/**
 * Frozen 5-tab root navigation destinations for O-TRAVELZ Mobile V4.
 */
enum class NavDestination(
    val route: String,
    @StringRes val titleRes: Int
) {
    DISCOVER("discover", R.string.nav_discover),
    MAP("map", R.string.nav_map),
    PLAN("plan", R.string.nav_plan),
    TRIPS("trips", R.string.nav_trips),
    YOU("you", R.string.nav_you);

    companion object {
        val rootDestinations = entries.toList()
    }
}