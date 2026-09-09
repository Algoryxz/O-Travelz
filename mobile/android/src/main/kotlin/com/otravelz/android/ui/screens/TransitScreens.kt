package com.otravelz.android.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import android.os.Build
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import com.otravelz.android.notifications.ActiveReminderInfo
import com.otravelz.android.notifications.ReminderScheduleResult
import com.otravelz.android.R
import com.otravelz.android.domain.model.*
import com.otravelz.android.ui.theme.Spacing
import com.otravelz.shared.engine.FirstMileBand
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/**
 * Wave M12: Odisha Transit Directory screen.
 * Displays 154 routes across 5 regions with instant 6-tier search and regional filtering.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransitDirectoryScreen(
    viewModel: TransitViewModel,
    onBack: () -> Unit,
    onViewOnMap: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    if (uiState.selectedRouteDetail != null) {
        RouteDetailScreen(
            route = uiState.selectedRouteDetail!!,
            selectedDirectionIndex = uiState.selectedDirectionIndex,
            activeReminders = uiState.activeReminders,
            onDirectionSelected = { viewModel.selectDirection(it) },
            onStopClick = { viewModel.selectStop(it) },
            onScheduleReminder = { depTime, offset ->
                viewModel.scheduleDepartureReminder(
                    routeId = uiState.selectedRouteDetail!!.routeId,
                    routeNumber = uiState.selectedRouteDetail!!.routeNumber,
                    origin = uiState.selectedRouteDetail!!.origin,
                    departureTime = depTime,
                    offsetMinutes = offset
                )
            },
            onCancelReminder = { depTime ->
                viewModel.cancelDepartureReminder(
                    routeId = uiState.selectedRouteDetail!!.routeId,
                    departureTime = depTime
                )
            },
            onViewOnMap = onViewOnMap,
            onBack = { viewModel.clearSelectedRoute() }
        )

        uiState.selectedStopForSheet?.let { stop ->
            StopDetailSheet(
                stop = stop,
                userLat = uiState.userLat,
                userLon = uiState.userLon,
                isRealGps = uiState.isRealGps,
                onDismiss = { viewModel.dismissStopSheet() },
                onRouteClick = { routeNumber ->
                    viewModel.dismissStopSheet()
                    val target = uiState.allRoutes.firstOrNull { it.routeNumber.equals(routeNumber, ignoreCase = true) }
                    if (target != null) {
                        viewModel.selectRoute(target.routeId)
                    }
                }
            )
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = stringResource(R.string.transit_directory_title),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = stringResource(R.string.transit_directory_subtitle),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", style = MaterialTheme.typography.titleLarge)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Search Input
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.onSearchQueryChanged(it) },
                placeholder = {
                    Text(
                        stringResource(R.string.transit_search_hint),
                        style = MaterialTheme.typography.bodyMedium
                    )
                },
                trailingIcon = {
                    if (uiState.searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.onSearchQueryChanged("") }) {
                            Text("✕", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.space5, vertical = Spacing.space3)
            )

            // Regional Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = Spacing.space5, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = uiState.selectedRegion == null,
                    onClick = { viewModel.onRegionSelected(null) },
                    label = { Text(stringResource(R.string.transit_filter_all_regions)) }
                )
                TransitRegion.entries.forEach { region ->
                    val isSelected = uiState.selectedRegion == region
                    val labelRes = when (region) {
                        TransitRegion.CAPITAL_REGION -> R.string.transit_region_capital
                        TransitRegion.ROURKELA -> R.string.transit_region_rourkela
                        TransitRegion.SAMBALPUR -> R.string.transit_region_sambalpur
                        TransitRegion.BERHAMPUR -> R.string.transit_region_berhampur
                        TransitRegion.KEONJHAR -> R.string.transit_region_keonjhar
                    }
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.onRegionSelected(region) },
                        label = { Text(stringResource(labelRes)) }
                    )
                }
            }

            // Results Counter
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.space5, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.transit_routes_count, uiState.filteredRouteCount),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (uiState.hasActiveFilters) {
                    TextButton(onClick = { viewModel.clearFilters() }) {
                        Text(
                            stringResource(R.string.transit_action_clear_filters),
                            style = MaterialTheme.typography.labelSmall
                        )
                    }
                }
            }

            if (uiState.isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (uiState.filteredRoutes.isEmpty()) {
                // Zero results state
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(Spacing.space5),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = stringResource(R.string.transit_no_routes_found),
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = { viewModel.clearFilters() }) {
                            Text(stringResource(R.string.transit_action_clear_filters))
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(
                        horizontal = Spacing.space5,
                        vertical = Spacing.space3
                    ),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(uiState.filteredRoutes, key = { it.routeId }) { route ->
                        TransitRouteCard(
                            route = route,
                            onClick = { viewModel.selectRoute(route.routeId) }
                        )
                    }
                }
            }
        }
    }
}

/**
 * Route summary card for transit directory listing.
 */
@Composable
fun TransitRouteCard(
    route: TransitRouteSummary,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
        ),
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Route Number Badge
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = MaterialTheme.colorScheme.primaryContainer,
                modifier = Modifier.size(width = 56.dp, height = 48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = route.routeNumber,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                // Region & Network Tag
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = route.region.displayName,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text("•", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.outline)
                    Text(
                        text = route.networkType,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.height(2.dp))

                // Route Destination Line
                Text(
                    text = "${route.origin} → ${route.destination}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                // Via point
                if (!route.via.isNullOrBlank()) {
                    Text(
                        text = "via ${route.via}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            Text("›", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

/**
 * Route Detail screen showing stops timeline, scheduled timetables in IST, and directions.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RouteDetailScreen(
    route: TransitRouteDetail,
    selectedDirectionIndex: Int,
    activeReminders: Map<String, ActiveReminderInfo> = emptyMap(),
    onDirectionSelected: (Int) -> Unit,
    onStopClick: (TransitStop) -> Unit,
    onScheduleReminder: (departureTime: String, offsetMinutes: Int) -> ReminderScheduleResult = { _, _ -> ReminderScheduleResult.PassedDeparture },
    onCancelReminder: (departureTime: String) -> Unit = {},
    onViewOnMap: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val currentSchedule = route.schedules.getOrNull(selectedDirectionIndex)
        ?: route.schedules.firstOrNull()

    // Current time in IST (Asia/Kolkata)
    val nowIst = remember {
        try {
            val zt = LocalTime.now(ZoneId.of("Asia/Kolkata"))
            zt.format(DateTimeFormatter.ofPattern("HH:mm"))
        } catch (_: Exception) {
            "09:00"
        }
    }

    val departureResult = remember(currentSchedule, nowIst) {
        currentSchedule?.evaluateNextDeparture(nowIst)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.transit_route_detail_title),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", style = MaterialTheme.typography.titleLarge)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(Spacing.space5)
        ) {
            // Header Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.primaryContainer
                        ) {
                            Text(
                                text = route.routeNumber,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }

                        Text(
                            text = route.region.displayName,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = route.routeName,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = stringResource(R.string.transit_operator_crut),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    if (!route.via.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "via ${route.via}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // "View on Map" Button
                    OutlinedButton(
                        onClick = { onViewOnMap(route.routeId) },
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(stringResource(R.string.transit_action_view_on_map))
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Timetable Truth Disclaimer
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("ℹ", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSecondaryContainer)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = stringResource(R.string.transit_disclaimer_scheduled),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Direction Selector (if multiple schedules)
            if (route.schedules.size > 1) {
                Text(
                    text = stringResource(R.string.transit_direction_selector_title),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    route.schedules.forEachIndexed { idx, sched ->
                        FilterChip(
                            selected = idx == selectedDirectionIndex,
                            onClick = { onDirectionSelected(idx) },
                            label = { Text(sched.groupLabel.replace("from_", "From ").replace("_", " ")) }
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Next Scheduled Departure Card
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceContainer
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    if (departureResult != null && departureResult.nextDepartureTime != null) {
                        val nextTime = departureResult.nextDepartureTime!!
                        val waitText = departureResult.minutesUntilDeparture?.let { "in ${it}m" } ?: ""
                        val reminderKey = "${route.routeId}_$nextTime"
                        val activeReminder = activeReminders[reminderKey]

                        val context = LocalContext.current
                        var showPermissionExplanation by remember { mutableStateOf(false) }
                        var selectedOffset by remember { mutableIntStateOf(15) }
                        var feedbackMessage by remember { mutableStateOf<String?>(null) }

                        val permissionLauncher = rememberLauncherForActivityResult(
                            ActivityResultContracts.RequestPermission()
                        ) { isGranted ->
                            if (isGranted) {
                                val res = onScheduleReminder(nextTime, selectedOffset)
                                if (res is ReminderScheduleResult.PassedDeparture) {
                                    feedbackMessage = context.getString(R.string.transit_reminder_passed_error)
                                }
                            } else {
                                feedbackMessage = context.getString(R.string.transit_notifications_disabled)
                            }
                        }

                        fun requestAndSchedule(offset: Int) {
                            selectedOffset = offset
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                val hasPermission = ContextCompat.checkSelfPermission(
                                    context,
                                    android.Manifest.permission.POST_NOTIFICATIONS
                                ) == PackageManager.PERMISSION_GRANTED

                                if (!hasPermission) {
                                    showPermissionExplanation = true
                                } else {
                                    val res = onScheduleReminder(nextTime, offset)
                                    if (res is ReminderScheduleResult.PassedDeparture) {
                                        feedbackMessage = context.getString(R.string.transit_reminder_passed_error)
                                    }
                                }
                            } else {
                                val res = onScheduleReminder(nextTime, offset)
                                if (res is ReminderScheduleResult.PassedDeparture) {
                                    feedbackMessage = context.getString(R.string.transit_reminder_passed_error)
                                }
                            }
                        }

                        if (showPermissionExplanation) {
                            AlertDialog(
                                onDismissRequest = { showPermissionExplanation = false },
                                title = { Text(stringResource(R.string.transit_reminder_dialog_title)) },
                                text = { Text(stringResource(R.string.transit_reminder_dialog_desc)) },
                                confirmButton = {
                                    TextButton(onClick = {
                                        showPermissionExplanation = false
                                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                            permissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                                        }
                                    }) {
                                        Text(stringResource(android.R.string.ok))
                                    }
                                },
                                dismissButton = {
                                    TextButton(onClick = { showPermissionExplanation = false }) {
                                        Text(stringResource(android.R.string.cancel))
                                    }
                                }
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = stringResource(
                                    R.string.transit_next_departure_label,
                                    nextTime,
                                    waitText
                                ),
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )

                            if (activeReminder != null) {
                                AssistChip(
                                    onClick = { onCancelReminder(nextTime) },
                                    label = { Text(stringResource(R.string.transit_reminder_active, activeReminder.offsetMinutes)) },
                                    leadingIcon = { Text("🔔") },
                                    trailingIcon = { Text("✕") },
                                    colors = AssistChipDefaults.assistChipColors(
                                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                                        labelColor = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                )
                            } else {
                                OutlinedButton(
                                    onClick = { requestAndSchedule(15) },
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                ) {
                                    Text("🔔 " + stringResource(R.string.transit_action_remind_me))
                                }
                            }
                        }

                        if (feedbackMessage != null) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = feedbackMessage!!,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    } else if (departureResult?.isServiceFinishedForDay == true) {
                        Text(
                            text = stringResource(R.string.transit_service_finished_today),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    } else {
                        Text(
                            text = stringResource(R.string.transit_timetable_unavailable),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Scheduled Departure Times Flow
                    if (currentSchedule != null && currentSchedule.departureTimes.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = stringResource(R.string.transit_departure_times_title, currentSchedule.totalTrips),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            currentSchedule.departureTimes.forEach { time ->
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = if (time == departureResult?.nextDepartureTime)
                                        MaterialTheme.colorScheme.primaryContainer
                                    else
                                        MaterialTheme.colorScheme.surfaceContainerHighest
                                ) {
                                    Text(
                                        text = time,
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = if (time == departureResult?.nextDepartureTime) FontWeight.Bold else FontWeight.Normal,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Fare Pending Notice
            Text(
                text = stringResource(R.string.transit_fare_notice),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Stop Timeline
            Text(
                text = stringResource(R.string.transit_stop_timeline_title, route.totalStopsCount),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(10.dp))

            route.stops.forEachIndexed { index, stop ->
                StopTimelineItem(
                    stop = stop,
                    isFirst = index == 0,
                    isLast = index == route.stops.lastIndex,
                    onClick = { onStopClick(stop) }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

/**
 * Stop item in the route sequence timeline.
 */
@Composable
fun StopTimelineItem(
    stop: TransitStop,
    isFirst: Boolean,
    isLast: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Vertical timeline connector
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.width(28.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(14.dp)
                    .clip(CircleShape)
                    .background(
                        if (stop.isVerifiedPhysicalPole)
                            MaterialTheme.colorScheme.primary
                        else
                            MaterialTheme.colorScheme.outlineVariant
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (stop.isVerifiedPhysicalPole) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(10.dp))

        // Stop name and verification badge
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = stop.name,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(2.dp))

            // Truth badge
            if (stop.isVerifiedPhysicalPole) {
                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = Color(0xFFE8F5E9)
                ) {
                    Text(
                        text = stringResource(R.string.transit_badge_verified_stop),
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFF2E7D32),
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            } else {
                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = MaterialTheme.colorScheme.surfaceContainerHighest
                ) {
                    Text(
                        text = stringResource(R.string.transit_badge_locality_only),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }
        }

        Text("›", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

/**
 * Bottom Sheet for stop details, verified GPS coordinates, serving routes, and first-mile distance.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StopDetailSheet(
    stop: TransitStop,
    userLat: Double?,
    userLon: Double?,
    isRealGps: Boolean,
    onDismiss: () -> Unit,
    onRouteClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val firstMile = remember(stop, userLat, userLon, isRealGps) {
        stop.evaluateFirstMile(userLat, userLon, isRealGps)
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        modifier = modifier
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp)
        ) {
            // Stop Name
            Text(
                text = stop.name,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Verification Card
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (stop.isVerifiedPhysicalPole) Color(0xFFE8F5E9) else MaterialTheme.colorScheme.surfaceContainerHighest,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = if (stop.isVerifiedPhysicalPole)
                            stringResource(R.string.transit_badge_verified_stop)
                        else
                            stringResource(R.string.transit_badge_locality_only),
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (stop.isVerifiedPhysicalPole) Color(0xFF2E7D32) else MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (stop.isVerifiedPhysicalPole)
                            stringResource(R.string.transit_stop_verified_desc)
                        else
                            stringResource(R.string.transit_stop_locality_desc),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    if (stop.coordinate != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "GPS: %.5f, %.5f".format(stop.coordinate!!.lat, stop.coordinate!!.lon),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.outline
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // First-Mile Multimodal Guidance (Strictly gated)
            if (firstMile != null) {
                val guidanceText = when (firstMile.band) {
                    FirstMileBand.WALK_REASONABLE -> {
                        val mins = (firstMile.distanceMeters / 80.0).toInt().coerceAtLeast(1)
                        val distStr = if (firstMile.distanceMeters < 1000) "%d m".format(firstMile.distanceMeters.toInt())
                        else "%.1f km".format(firstMile.distanceMeters / 1000.0)
                        stringResource(R.string.transit_first_mile_walk, distStr, mins)
                    }
                    FirstMileBand.WALK_OR_SHORT_AUTO -> {
                        val distStr = "%.1f km".format(firstMile.distanceMeters / 1000.0)
                        stringResource(R.string.transit_first_mile_short_auto, distStr)
                    }
                    FirstMileBand.AUTO_OR_CAB_RECOMMENDED -> {
                        val distStr = "%.1f km".format(firstMile.distanceMeters / 1000.0)
                        stringResource(R.string.transit_first_mile_cab_auto, distStr)
                    }
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("🚶", style = MaterialTheme.typography.bodyMedium)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = guidanceText,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
                Spacer(modifier = Modifier.height(14.dp))
            }

            // Serving Routes
            if (stop.routesServing.isNotEmpty()) {
                Text(
                    text = stringResource(R.string.transit_serving_routes_title),
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    stop.routesServing.forEach { routeNum ->
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = MaterialTheme.colorScheme.primaryContainer,
                            modifier = Modifier.clickable { onRouteClick(routeNum) }
                        ) {
                            Text(
                                text = routeNum,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // External Navigation Button (strictly for verified physical poles)
            if (stop.allowsExternalNavigation) {
                Button(
                    onClick = {
                        val uri = Uri.parse("geo:${stop.latitude},${stop.longitude}?q=${stop.latitude},${stop.longitude}(${Uri.encode(stop.name)})")
                        val intent = Intent(Intent.ACTION_VIEW, uri)
                        context.startActivity(intent)
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(stringResource(R.string.transit_action_get_directions))
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
