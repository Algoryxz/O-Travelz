package com.otravelz.android.navigation

import androidx.annotation.StringRes
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Luggage
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Route
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Luggage
import androidx.compose.material.icons.outlined.Map
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Route
import androidx.compose.ui.graphics.vector.ImageVector
import com.otravelz.android.R

/**
 * Frozen 5-tab root navigation destinations for O-TRAVELZ Mobile V4.
 * Equipped with authentic Material 3 vector iconography.
 */
enum class NavDestination(
    val route: String,
    @StringRes val titleRes: Int,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    DISCOVER(
        route = "discover",
        titleRes = R.string.nav_discover,
        selectedIcon = Icons.Filled.Explore,
        unselectedIcon = Icons.Outlined.Explore
    ),
    MAP(
        route = "map",
        titleRes = R.string.nav_map,
        selectedIcon = Icons.Filled.Map,
        unselectedIcon = Icons.Outlined.Map
    ),
    PLAN(
        route = "plan",
        titleRes = R.string.nav_plan,
        selectedIcon = Icons.Filled.Route,
        unselectedIcon = Icons.Outlined.Route
    ),
    TRIPS(
        route = "trips",
        titleRes = R.string.nav_trips,
        selectedIcon = Icons.Filled.Luggage,
        unselectedIcon = Icons.Outlined.Luggage
    ),
    YOU(
        route = "you",
        titleRes = R.string.nav_you,
        selectedIcon = Icons.Filled.Person,
        unselectedIcon = Icons.Outlined.Person
    );

    companion object {
        val rootDestinations = entries.toList()
    }
}