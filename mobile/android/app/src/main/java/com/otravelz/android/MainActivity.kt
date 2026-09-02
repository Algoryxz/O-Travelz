package com.otravelz.android

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Route
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import com.otravelz.android.core.design.*
import com.otravelz.android.data.local.UserPreferencesDataStore
import com.otravelz.android.data.repository.RecentSearchesRepository
import com.otravelz.android.data.repository.SavedPlacesRepository
import com.otravelz.android.data.repository.SavedTripsRepository
import com.otravelz.android.feature.discover.DiscoverScreen
import com.otravelz.android.feature.discover.DiscoverViewModel
import com.otravelz.android.feature.home.HomeScreen
import com.otravelz.android.feature.home.HomeViewModel
import com.otravelz.android.feature.map.MapScreen
import com.otravelz.android.feature.place.PlaceDetailScreen
import com.otravelz.android.feature.place.PlaceDetailViewModel
import com.otravelz.android.feature.planner.PlannerScreen
import com.otravelz.android.feature.planner.PlannerViewModel
import com.otravelz.android.feature.profile.ProfileScreen
import com.otravelz.android.feature.search.GlobalSearchScreen
import com.otravelz.android.feature.search.GlobalSearchViewModel
import com.otravelz.android.feature.transit.TransitScreen
import com.otravelz.android.feature.trips.TripModeScreen
import com.otravelz.android.feature.trips.TripsScreen

class MainActivity : ComponentActivity() {

    private val homeViewModel: HomeViewModel by viewModels()
    private val discoverViewModel: DiscoverViewModel by viewModels()
    private val placeDetailViewModel: PlaceDetailViewModel by viewModels()
    private val plannerViewModel: PlannerViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        }
        enableEdgeToEdge()

        setContent {
            OTravelzTheme {
                OTravelzAppNav(
                    homeViewModel = homeViewModel,
                    discoverViewModel = discoverViewModel,
                    placeDetailViewModel = placeDetailViewModel,
                    plannerViewModel = plannerViewModel
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }
}

sealed class Screen(val route: String, val titleRes: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Discover : Screen("discover", "Discover", Icons.Default.Explore)
    object Planner : Screen("planner", "Plan", Icons.Default.Route)
    object Trips : Screen("trips", "Trips", Icons.Default.Bookmark)
    object You : Screen("you", "You", Icons.Default.Person)
    object Transit : Screen("transit", "Transit", Icons.Default.DirectionsBus)
    object Map : Screen("map", "Map", Icons.Default.Map)
}

@Composable
fun OTravelzAppNav(
    homeViewModel: HomeViewModel,
    discoverViewModel: DiscoverViewModel,
    placeDetailViewModel: PlaceDetailViewModel,
    plannerViewModel: PlannerViewModel
) {
    val context = LocalContext.current
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val preferencesDataStore = remember { UserPreferencesDataStore.getInstance(context) }
    val userPreferences by preferencesDataStore.userPreferencesFlow.collectAsState(
        initial = com.otravelz.android.data.local.UserPreferences()
    )

    val savedTripsRepo = remember {
        try {
            SavedTripsRepository(context)
        } catch (_: Exception) {
            null
        }
    }

    val savedPlacesRepo = remember {
        try {
            SavedPlacesRepository(context)
        } catch (_: Exception) {
            null
        }
    }

    val recentSearchesRepo = remember {
        try {
            RecentSearchesRepository.getInstance(context)
        } catch (_: Exception) {
            null
        }
    }

    // Ensure immediate deep-link navigation on new intent when app is already running/warm
    DisposableEffect(Unit) {
        val activity = context as? ComponentActivity
        val listener = androidx.core.util.Consumer<Intent> { intent ->
            navController.handleDeepLink(intent)
        }
        activity?.addOnNewIntentListener(listener)
        onDispose {
            activity?.removeOnNewIntentListener(listener)
        }
    }

    // Android 13+ POST_NOTIFICATIONS Runtime Permission Launcher
    var showPermissionRationale by remember { mutableStateOf(false) }
    var pendingActionAfterPermission by remember { mutableStateOf<(() -> Unit)?>(null) }

    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            pendingActionAfterPermission?.invoke()
        }
        pendingActionAfterPermission = null
    }

    val requestNotificationPermission: (onGranted: (() -> Unit)?) -> Unit = { onGranted ->
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val permissionStatus = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            )
            if (permissionStatus != PackageManager.PERMISSION_GRANTED) {
                pendingActionAfterPermission = onGranted
                showPermissionRationale = true
            } else {
                onGranted?.invoke()
            }
        } else {
            onGranted?.invoke()
        }
    }

    if (showPermissionRationale) {
        NotificationRationaleDialog(
            onConfirm = {
                showPermissionRationale = false
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                }
            },
            onDismiss = {
                showPermissionRationale = false
                pendingActionAfterPermission = null
            }
        )
    }

    val bottomNavItems = listOf(
        Screen.Home,
        Screen.Discover,
        Screen.Planner,
        Screen.Trips,
        Screen.You
    )

    fun getTabLabel(screen: Screen, lang: String): String {
        return when (lang) {
            "or" -> when (screen) {
                Screen.Home -> "ମୂଳପୃଷ୍ଠା"
                Screen.Discover -> "ଆବିଷ୍କାର"
                Screen.Planner -> "ଯୋଜନା"
                Screen.Trips -> "ଯାତ୍ରା"
                Screen.You -> "ଆପଣ"
                else -> screen.titleRes
            }
            "hi" -> when (screen) {
                Screen.Home -> "होम"
                Screen.Discover -> "खोजें"
                Screen.Planner -> "योजना"
                Screen.Trips -> "यात्राएं"
                Screen.You -> "आप"
                else -> screen.titleRes
            }
            else -> screen.titleRes
        }
    }

    val homeState by homeViewModel.uiState.collectAsState()

    val shouldShowBottomBar = currentRoute in listOf(
        Screen.Home.route,
        Screen.Discover.route,
        Screen.Planner.route,
        Screen.Trips.route,
        Screen.You.route
    )

    Scaffold(
        bottomBar = {
            if (shouldShowBottomBar) {
                NavigationBar(
                    containerColor = DarkSurfaceElevated,
                    contentColor = TextPrimary
                ) {
                    bottomNavItems.forEach { screen ->
                        val isSelected = currentRoute == screen.route
                        val label = getTabLabel(screen, userPreferences.preferredLanguage)
                        NavigationBarItem(
                            icon = { Icon(screen.icon, contentDescription = label) },
                            label = { Text(label) },
                            selected = isSelected,
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = SunTempleGold,
                                selectedTextColor = SunTempleGold,
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
                    onExploreClick = { navController.navigate(Screen.Discover.route) },
                    onSearchClick = { navController.navigate("global_search") },
                    onPlanClick = { navController.navigate(Screen.Planner.route) },
                    onTripsClick = { navController.navigate(Screen.Trips.route) },
                    onTransitClick = { navController.navigate(Screen.Transit.route) },
                    onMapClick = { navController.navigate(Screen.Map.route) }
                )
            }

            composable("global_search") {
                val searchVm = remember {
                    GlobalSearchViewModel(
                        savedPlacesRepository = savedPlacesRepo,
                        savedTripsRepository = savedTripsRepo,
                        recentSearchesRepository = recentSearchesRepo
                    )
                }
                GlobalSearchScreen(
                    viewModel = searchVm,
                    onBackClick = { navController.popBackStack() },
                    onPlaceClick = { placeId -> navController.navigate("place/$placeId") },
                    onTripClick = { tripId -> navController.navigate("trip_mode/$tripId") },
                    onCategoryClick = { cat ->
                        discoverViewModel.selectCategory(cat)
                        navController.navigate(Screen.Discover.route)
                    }
                )
            }

            composable(Screen.Discover.route) {
                DiscoverScreen(
                    viewModel = discoverViewModel,
                    onPlaceClick = { placeId -> navController.navigate("place/$placeId") },
                    onMapClick = { navController.navigate(Screen.Map.route) }
                )
            }

            composable(Screen.Planner.route) {
                PlannerScreen(
                    viewModel = plannerViewModel,
                    onPlaceClick = { placeId -> navController.navigate("place/$placeId") }
                )
            }

            composable(Screen.Trips.route) {
                TripsScreen(
                    onPlanNewTrip = { navController.navigate(Screen.Planner.route) },
                    onTripClick = { tripId -> navController.navigate("trip_mode/$tripId") },
                    onPlaceClick = { placeId -> navController.navigate("place/$placeId") },
                    onStartTripMode = { tripId -> navController.navigate("trip_mode/$tripId") },
                    onReplanTrip = { trip ->
                        plannerViewModel.loadFromTrip(trip)
                        navController.navigate(Screen.Planner.route)
                    }
                )
            }

            composable(
                route = "trip_mode/{tripId}",
                arguments = listOf(navArgument("tripId") { type = NavType.StringType }),
                deepLinks = listOf(
                    navDeepLink { uriPattern = "otravelz://trip/{tripId}" },
                    navDeepLink { uriPattern = "otravelz://trip?id={tripId}" }
                )
            ) { backStackEntry ->
                val tripId = backStackEntry.arguments?.getString("tripId") ?: ""
                val savedTrips by savedTripsRepo?.savedTrips?.collectAsState() ?: remember { mutableStateOf(emptyList()) }
                val currentTrip = savedTrips.firstOrNull { it.id == tripId } ?: savedTrips.firstOrNull()

                if (currentTrip != null) {
                    TripModeScreen(
                        trip = currentTrip,
                        onBackClick = { navController.popBackStack() },
                        onPlaceClick = { placeId -> navController.navigate("place/$placeId") },
                        onMapClick = { navController.navigate(Screen.Map.route) }
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(DarkBackground),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = OchrePrimary)
                    }
                }
            }

            composable(Screen.You.route) {
                ProfileScreen(
                    onNavigateToSavedPlaces = { navController.navigate(Screen.Discover.route) },
                    onNavigateToTrips = { navController.navigate(Screen.Trips.route) },
                    onNavigateToCommunityStaging = { navController.navigate("community_staging") }
                )
            }

            composable("community_staging") {
                com.otravelz.android.feature.community.CommunityStagingScreen(
                    onNavigateBack = { navController.popBackStack() }
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
                deepLinks = listOf(
                    navDeepLink { uriPattern = "otravelz://place/{placeId}" },
                    navDeepLink { uriPattern = "otravelz://place?id={placeId}" }
                )
            ) { backStackEntry ->
                val placeId = backStackEntry.arguments?.getString("placeId") ?: ""
                PlaceDetailScreen(
                    placeId = placeId,
                    viewModel = placeDetailViewModel,
                    onRequestNotificationPermission = requestNotificationPermission,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}

@Composable
fun NotificationRationaleDialog(
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Enable Trip Guidance",
                style = MaterialTheme.typography.titleMedium,
                color = TextPrimary
            )
        },
        text = {
            Text(
                text = "O-TRAVELZ uses notifications to deliver contextual destination arrival alerts, scheduled Mo Bus departure guidance, and live Open-Meteo weather updates along your route.",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )
        },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text("Allow Notifications", color = com.otravelz.android.core.design.OchrePrimary)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Not Now", color = TextSecondary)
            }
        },
        containerColor = DarkSurfaceElevated
    )
}
