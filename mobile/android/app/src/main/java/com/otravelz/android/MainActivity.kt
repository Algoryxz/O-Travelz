package com.otravelz.android

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import com.otravelz.android.core.i18n.AppStrings
import com.otravelz.android.core.i18n.LocalAppStrings
import com.otravelz.android.core.i18n.getAppStrings
import com.otravelz.android.data.local.UserPreferencesDataStore
import com.otravelz.android.data.model.SyncTripItemDto
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

sealed class Screen(val route: String, val titleRes: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Discover : Screen("discover", "Discover", Icons.Default.Explore)
    object Planner : Screen("planner", "Planner", Icons.Default.Route)
    object Trips : Screen("trips", "Trips", Icons.Default.Bookmark)
    object You : Screen("you", "You", Icons.Default.Person)
    object Transit : Screen("transit", "Transit", Icons.Default.DirectionsBus)
    object Map : Screen("map", "Map", Icons.Default.Map)
}

class MainActivity : ComponentActivity() {
    private val homeViewModel: HomeViewModel by viewModels()
    private val discoverViewModel: DiscoverViewModel by viewModels()
    private val plannerViewModel: PlannerViewModel by viewModels()
    private val placeDetailViewModel: PlaceDetailViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            OTravelzTheme {
                OTravelzMainApp(
                    homeViewModel = homeViewModel,
                    discoverViewModel = discoverViewModel,
                    plannerViewModel = plannerViewModel,
                    placeDetailViewModel = placeDetailViewModel,
                    intent = intent
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }
}

@Composable
fun OTravelzMainApp(
    homeViewModel: HomeViewModel,
    discoverViewModel: DiscoverViewModel,
    plannerViewModel: PlannerViewModel,
    placeDetailViewModel: PlaceDetailViewModel,
    intent: Intent? = null
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val context = LocalContext.current
    val savedPlacesRepo = remember { SavedPlacesRepository(context) }
    val savedTripsRepo = remember { SavedTripsRepository(context) }
    val recentSearchesRepo = remember { RecentSearchesRepository.getInstance(context) }
    val userPrefs = remember { UserPreferencesDataStore(context) }
    val userPreferences by userPrefs.userPreferencesFlow.collectAsState(
        initial = com.otravelz.android.data.local.UserPreferences()
    )

    val currentStrings = getAppStrings(userPreferences.preferredLanguage)

    // Handle deep link / notification click intent
    LaunchedEffect(intent) {
        intent?.let { deepIntent ->
            val targetPlaceId = deepIntent.getStringExtra("TARGET_PLACE_ID")
            val targetTripId = deepIntent.getStringExtra("TARGET_TRIP_ID")

            if (!targetPlaceId.isNullOrBlank()) {
                navController.navigate("place/$targetPlaceId") {
                    launchSingleTop = true
                }
            } else if (!targetTripId.isNullOrBlank()) {
                navController.navigate("trip_mode/$targetTripId") {
                    launchSingleTop = true
                }
            }
        }
    }

    var isSplashVisible by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(1200)
        isSplashVisible = false
    }

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

    val requestNotificationPermission: (((() -> Unit)?) -> Unit) = { onGranted ->
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

    fun getTabLabel(screen: Screen, strings: AppStrings): String {
        return when (screen) {
            Screen.Home -> strings.tabHome
            Screen.Discover -> strings.tabDiscover
            Screen.Planner -> strings.tabPlanner
            Screen.Trips -> strings.tabTrips
            Screen.You -> strings.tabYou
            Screen.Map -> strings.tabMap
            Screen.Transit -> strings.tabTransit
            else -> screen.titleRes
        }
    }

    val homeState by homeViewModel.uiState.collectAsState()

    val shouldShowBottomBar = currentRoute in listOf(
        Screen.Home.route,
        Screen.Discover.route,
        Screen.Planner.route,
        Screen.Trips.route,
        Screen.You.route,
        Screen.Transit.route,
        Screen.Map.route
    )

    CompositionLocalProvider(LocalAppStrings provides currentStrings) {
        Scaffold(
            bottomBar = {
                if (shouldShowBottomBar) {
                    NavigationBar(
                        containerColor = DarkSurfaceElevated,
                        contentColor = TextPrimary
                    ) {
                        bottomNavItems.forEach { screen ->
                            val isSelected = currentRoute == screen.route
                            val label = getTabLabel(screen, currentStrings)
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
                    arguments = listOf(navArgument("tripId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val tripId = backStackEntry.arguments?.getString("tripId") ?: ""
                    var targetTrip by remember { mutableStateOf<SyncTripItemDto?>(null) }
                    LaunchedEffect(tripId) {
                        targetTrip = savedTripsRepo.getTripById(tripId)
                    }

                    val activeTrip = targetTrip
                    if (activeTrip != null) {
                        TripModeScreen(
                            trip = activeTrip,
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

        androidx.compose.animation.AnimatedVisibility(
            visible = isSplashVisible,
            enter = androidx.compose.animation.fadeIn(),
            exit = androidx.compose.animation.fadeOut(animationSpec = androidx.compose.animation.core.tween(500)),
            modifier = Modifier.fillMaxSize()
        ) {
            OTravelzSplashScreen()
        }
    }
}

@Composable
fun OTravelzSplashScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(Spacing.xl)
        ) {
            Surface(
                shape = RoundedCornerShape(22.dp),
                color = DarkSurfaceElevated,
                border = androidx.compose.foundation.BorderStroke(1.5.dp, SunTempleGold.copy(alpha = 0.5f)),
                modifier = Modifier.size(92.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        painter = androidx.compose.ui.res.painterResource(id = com.otravelz.android.R.drawable.ic_otravelz_logo),
                        contentDescription = "O-TRAVELZ Logo Mark",
                        tint = androidx.compose.ui.graphics.Color.Unspecified,
                        modifier = Modifier.size(64.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(Spacing.lg))

            Text(
                text = "O-TRAVELZ",
                style = MaterialTheme.typography.headlineMedium,
                color = TextPrimary,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 2.sp
            )

            Spacer(modifier = Modifier.height(Spacing.xs))

            Text(
                text = "ODISHA TRAVEL INTELLIGENCE",
                style = MaterialTheme.typography.labelMedium,
                color = SunTempleGold,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(Spacing.xs))

            Text(
                text = "Safe • Secure • Smart",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )
        }

        // Bottom Brand Signature
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 36.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Crafted by Algoryxz",
                style = MaterialTheme.typography.labelSmall,
                color = TextMuted,
                fontWeight = FontWeight.Medium,
                letterSpacing = 0.8.sp
            )
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
