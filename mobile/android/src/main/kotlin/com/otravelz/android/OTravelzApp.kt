package com.otravelz.android

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import com.otravelz.android.navigation.NavDestination
import com.otravelz.android.ui.components.AdaptiveBox
import com.otravelz.android.ui.components.WindowSizeClassCategory
import com.otravelz.android.ui.roots.DiscoverRoot
import com.otravelz.android.ui.roots.MapRoot
import com.otravelz.android.ui.roots.PlanRoot
import com.otravelz.android.ui.roots.TripsRoot
import com.otravelz.android.ui.roots.YouRoot

/**
 * Root composable hosting the 5 frozen root navigation tabs.
 * Dynamically adapts between Bottom NavigationBar (Compact width)
 * and Leading NavigationRail (Medium & Expanded widths).
 * Implements deterministic back navigation (returns to DISCOVER before exit).
 */
@Composable
fun OTravelzApp() {
    var currentTab by rememberSaveable { mutableStateOf(NavDestination.DISCOVER) }

    // Intercept back navigation: Return to Discover root if currently on another tab
    BackHandler(enabled = currentTab != NavDestination.DISCOVER) {
        currentTab = NavDestination.DISCOVER
    }

    AdaptiveBox { windowSizeClass ->
        when (windowSizeClass) {
            WindowSizeClassCategory.COMPACT -> {
                // Phone portrait / compact width: Scaffold with bottom NavigationBar
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        NavigationBar(
                            containerColor = MaterialTheme.colorScheme.surfaceContainer
                        ) {
                            NavDestination.rootDestinations.forEach { destination ->
                                val selected = currentTab == destination
                                NavigationBarItem(
                                    selected = selected,
                                    onClick = {
                                        // Tab selection / reselection is idempotent
                                        currentTab = destination
                                    },
                                    icon = {
                                        Text(
                                            text = destination.name.take(1),
                                            style = MaterialTheme.typography.labelLarge,
                                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                        )
                                    },
                                    label = {
                                        Text(
                                            text = stringResource(destination.titleRes),
                                            style = MaterialTheme.typography.labelSmall
                                        )
                                    }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    RootContentHost(
                        destination = currentTab,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    )
                }
            }
            WindowSizeClassCategory.MEDIUM,
            WindowSizeClassCategory.EXPANDED -> {
                // Tablet / foldable unfolded / expanded width: Row with leading NavigationRail
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.surface)
                ) {
                    NavigationRail(
                        modifier = Modifier.fillMaxHeight(),
                        containerColor = MaterialTheme.colorScheme.surfaceContainer
                    ) {
                        NavDestination.rootDestinations.forEach { destination ->
                            val selected = currentTab == destination
                            NavigationRailItem(
                                selected = selected,
                                onClick = {
                                    // Tab selection / reselection is idempotent
                                    currentTab = destination
                                },
                                icon = {
                                    Text(
                                        text = destination.name.take(1),
                                        style = MaterialTheme.typography.labelLarge,
                                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                    )
                                },
                                label = {
                                    Text(
                                        text = stringResource(destination.titleRes),
                                        style = MaterialTheme.typography.labelSmall
                                    )
                                }
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .weight(1f)
                    ) {
                        RootContentHost(
                            destination = currentTab,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }
            }
        }
    }
}

/**
 * Structural container router hosting the respective root destination composables.
 */
@Composable
private fun RootContentHost(
    destination: NavDestination,
    modifier: Modifier = Modifier
) {
    when (destination) {
        NavDestination.DISCOVER -> DiscoverRoot(modifier = modifier)
        NavDestination.MAP -> MapRoot(modifier = modifier)
        NavDestination.PLAN -> PlanRoot(modifier = modifier)
        NavDestination.TRIPS -> TripsRoot(modifier = modifier)
        NavDestination.YOU -> YouRoot(modifier = modifier)
    }
}
