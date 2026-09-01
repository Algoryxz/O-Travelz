package com.otravelz.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Route
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import com.otravelz.android.core.design.*
import com.otravelz.android.feature.discover.DiscoverScreen
import com.otravelz.android.feature.home.HomeScreen
import com.otravelz.android.feature.home.HomeViewModel
import com.otravelz.android.feature.map.MapScreen
import com.otravelz.android.feature.place.PlaceDetailScreen
import com.otravelz.android.feature.place.PlaceDetailViewModel
import com.otravelz.android.feature.planner.PlannerScreen
import com.otravelz.android.feature.planner.PlannerViewModel
import com.otravelz.android.feature.transit.TransitScreen

class MainActivity : ComponentActivity() {

    private val homeViewModel: HomeViewModel by viewModels()
    private val placeDetailViewModel: PlaceDetailViewModel by viewModels()
    private val plannerViewModel: PlannerViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            OTravelzTheme {
                OTravelzAppNav(
                    homeViewModel = homeViewModel,
                    placeDetailViewModel = placeDetailViewModel,
                    plannerViewModel = plannerViewModel
                )
            }
        }
    }
}

sealed class Screen(val route: String, val title: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Discover : Screen("discover", "Discover", Icons.Default.Explore)
    object Planner : Screen("planner", "Planner", Icons.Default.Route)
    object Transit : Screen("transit", "Transit", Icons.Default.DirectionsBus)
    object Map : Screen("map", "Map", Icons.Default.Map)
}

@Composable
fun OTravelzAppNav(
    homeViewModel: HomeViewModel,
    placeDetailViewModel: PlaceDetailViewModel,
    plannerViewModel: PlannerViewModel
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomNavItems = listOf(
        Screen.Home,
        Screen.Discover,
        Screen.Planner,
        Screen.Transit,
        Screen.Map
    )

    val homeState by homeViewModel.uiState.collectAsState()

    Scaffold(
        bottomBar = {
            if (currentRoute != "place/{placeId}") {
                NavigationBar(
                    containerColor = DarkSurface,
                    contentColor = TextPrimary
                ) {
                    bottomNavItems.forEach { screen ->
                        NavigationBarItem(
                            icon = { Icon(screen.icon, contentDescription = screen.title) },
                            label = { Text(screen.title) },
                            selected = currentRoute == screen.route,
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = OchrePrimary,
                                selectedTextColor = OchrePrimary,
                                indicatorColor = DarkSurfaceVariant,
                                unselectedIconColor = TextMuted,
                                unselectedTextColor = TextMuted
                            ),
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        },
        containerColor = DarkBackground
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel = homeViewModel,
                    onPlaceClick = { placeId -> navController.navigate("place/$placeId") },
                    onExploreClick = { navController.navigate(Screen.Discover.route) }
                )
            }

            composable(Screen.Discover.route) {
                DiscoverScreen(
                    places = homeState.places,
                    onPlaceClick = { placeId -> navController.navigate("place/$placeId") }
                )
            }

            composable(Screen.Planner.route) {
                PlannerScreen(
                    viewModel = plannerViewModel,
                    onPlaceClick = { placeId -> navController.navigate("place/$placeId") }
                )
            }

            composable(Screen.Transit.route) {
                TransitScreen()
            }

            composable(Screen.Map.route) {
                MapScreen(
                    places = homeState.places,
                    onPlaceClick = { placeId -> navController.navigate("place/$placeId") }
                )
            }

            composable(
                route = "place/{placeId}",
                arguments = listOf(navArgument("placeId") { type = NavType.StringType }),
                deepLinks = listOf(navDeepLink { uriPattern = "otravelz://place?id={placeId}" })
            ) { backStackEntry ->
                val placeId = backStackEntry.arguments?.getString("placeId") ?: ""
                PlaceDetailScreen(
                    placeId = placeId,
                    viewModel = placeDetailViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
