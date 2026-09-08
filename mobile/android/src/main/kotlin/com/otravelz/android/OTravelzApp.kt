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
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.lifecycle.viewmodel.compose.viewModel
import com.otravelz.android.navigation.NavDestination
import com.otravelz.android.ui.components.AdaptiveBox
import com.otravelz.android.ui.components.WindowSizeClassCategory
import com.otravelz.android.ui.roots.DiscoverRoot
import com.otravelz.android.ui.roots.MapRoot
import com.otravelz.android.ui.roots.PlanRoot
import com.otravelz.android.ui.roots.TripsRoot
import com.otravelz.android.ui.roots.YouRoot
import com.otravelz.android.ui.screens.PlaceDetailScreen
import com.otravelz.android.ui.screens.TransitDirectoryScreen
import com.otravelz.android.ui.screens.TransitViewModel

/**
 * Root composable hosting the 5 frozen root navigation tabs and nested Place Detail routing.
 * Dynamically adapts between Bottom NavigationBar (Compact width)
 * and Leading NavigationRail (Medium & Expanded widths).
 * Implements deterministic back navigation:
 * - If in Transit Directory/Detail -> return to Discover
 * - If in Place Detail -> return to Discover
 * - If on secondary tab -> return to Discover root
 * - If on Discover root -> exit app
 */
@Composable
fun OTravelzApp(
    transitViewModel: TransitViewModel = viewModel()
) {
    var currentTab by rememberSaveable { mutableStateOf(NavDestination.DISCOVER) }
    var selectedPlaceId by rememberSaveable { mutableStateOf<String?>(null) }
    var isTransitOpen by rememberSaveable { mutableStateOf(false) }

    val transitUiState by transitViewModel.uiState.collectAsState()

    // Intercept back navigation: Transit Route Detail -> Transit Directory -> Discover -> Exit
    BackHandler(enabled = isTransitOpen || selectedPlaceId != null || currentTab != NavDestination.DISCOVER) {
        when {
            transitUiState.selectedRouteDetail != null -> {
                transitViewModel.clearSelectedRoute()
            }
            isTransitOpen -> {
                isTransitOpen = false
            }
            selectedPlaceId != null -> {
                selectedPlaceId = null
            }
            else -> {
                currentTab = NavDestination.DISCOVER
            }
        }
    }

    if (isTransitOpen) {
        TransitDirectoryScreen(
            viewModel = transitViewModel,
            onBack = { isTransitOpen = false },
            onViewOnMap = { routeId ->
                isTransitOpen = false
                currentTab = NavDestination.MAP
            }
        )
    } else if (selectedPlaceId != null) {
        // Nested Place Detail view
        PlaceDetailScreen(
            placeId = selectedPlaceId!!,
            onBack = { selectedPlaceId = null }
        )
    } else {
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
                        onPlaceClick = { placeId -> selectedPlaceId = placeId },
                        onTransitClick = { isTransitOpen = true },
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
                            onPlaceClick = { placeId -> selectedPlaceId = placeId },
                            onTransitClick = { isTransitOpen = true },
                            modifier = Modifier.fillMaxSize()
                        )
                    }
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
    onPlaceClick: (String) -> Unit,
    onTransitClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    when (destination) {
        NavDestination.DISCOVER -> DiscoverRoot(
            onPlaceClick = onPlaceClick,
            onTransitClick = onTransitClick,
            modifier = modifier
        )
        NavDestination.MAP -> MapRoot(onPlaceClick = onPlaceClick, modifier = modifier)
        NavDestination.PLAN -> PlanRoot(modifier = modifier)
        NavDestination.TRIPS -> TripsRoot(modifier = modifier)
        NavDestination.YOU -> YouRoot(modifier = modifier)
    }
}
