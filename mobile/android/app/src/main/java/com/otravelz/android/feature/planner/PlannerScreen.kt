package com.otravelz.android.feature.planner

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.notifications.NotificationHelper
import com.otravelz.android.core.ui.planner.*
import com.otravelz.android.data.model.SyncTripItemDto
import kotlinx.coroutines.launch

@Composable
fun PlannerScreen(
    viewModel: PlannerViewModel,
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val state by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    var selectedPlannerMode by remember { mutableStateOf(0) } // 0: Guided, 1: AI Copilot
    var selectedDayIndex by remember { mutableStateOf(0) }

    val originCities = listOf(
        Triple("Bhubaneswar", 20.2961, 85.8245),
        Triple("Puri", 19.8049, 85.8179),
        Triple("Cuttack", 20.4625, 85.8828),
        Triple("Sambalpur", 21.4669, 83.9812)
    )

    val interestCategories = listOf(
        "temple" to "Temples",
        "monument" to "Heritage",
        "nature" to "Nature & Wildlife",
        "beach" to "Beaches",
        "market" to "Handicrafts"
    )

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = DarkBackground,
        modifier = modifier.fillMaxSize()
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = Spacing.md, vertical = Spacing.sm)
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight()
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Trip Planner",
                        style = MaterialTheme.typography.headlineMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Deterministic Routing with Mo Bus Schedules",
                        style = MaterialTheme.typography.bodySmall,
                        color = SunTempleGold
                    )
                }

                Spacer(modifier = Modifier.width(Spacing.sm))

                // Mode Tabs (Guided vs AI)
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = DarkSurfaceElevated,
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(3.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(9.dp),
                            color = if (selectedPlannerMode == 0) OchrePrimary else androidx.compose.ui.graphics.Color.Transparent,
                            modifier = Modifier.clickable { selectedPlannerMode = 0 }
                        ) {
                            Text(
                                text = "Guided",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (selectedPlannerMode == 0) DarkBackground else TextSecondary,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                        Surface(
                            shape = RoundedCornerShape(9.dp),
                            color = if (selectedPlannerMode == 1) SunTempleGold else androidx.compose.ui.graphics.Color.Transparent,
                            modifier = Modifier.clickable { selectedPlannerMode = 1 }
                        ) {
                            Text(
                                text = "AI Copilot",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (selectedPlannerMode == 1) DarkBackground else TextSecondary,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(Spacing.md))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(Spacing.md),
                modifier = Modifier.fillMaxSize()
            ) {
                // 1. Planner Input Form
                item {
                    if (selectedPlannerMode == 0) {
                        GuidedPlannerForm(
                            originCities = originCities,
                            selectedOrigin = state.selectedOriginName,
                            onSelectOrigin = { name, lat, lon -> viewModel.setOrigin(name, lat, lon) },
                            durationDays = state.durationDays,
                            onSelectDays = { viewModel.setDurationDays(it) },
                            categories = interestCategories,
                            selectedCategories = state.selectedCategories,
                            onToggleCategory = { viewModel.toggleCategory(it) },
                            onGenerate = { viewModel.generatePlan() },
                            isLoading = state.isLoading
                        )
                    } else {
                        AiPlannerForm(
                            prompt = state.prompt,
                            onPromptChange = { viewModel.updatePrompt(it) },
                            onGenerate = { viewModel.generatePlan() },
                            isLoading = state.isLoading
                        )
                    }
                }

                // 2. Loading State
                if (state.isLoading) {
                    item {
                        LoadingState(
                            message = "Computing optimal itinerary with scheduled transit connections...",
                            modifier = Modifier.fillMaxWidth().padding(Spacing.lg)
                        )
                    }
                }

                // 3. Error State
                if (state.errorMessage != null && state.itinerary == null) {
                    item {
                        ErrorState(
                            message = state.errorMessage ?: "Planning failed. Please try again.",
                            onRetry = { viewModel.generatePlan() }
                        )
                    }
                }

                // 4. Generated Itinerary Overview & Timeline
                val itinerary = state.itinerary
                if (itinerary != null && !state.isLoading) {
                    item {
                        // Plan Header & Action Card
                        Surface(
                            shape = RoundedCornerShape(18.dp),
                            color = DarkSurfaceElevated,
                            border = androidx.compose.foundation.BorderStroke(1.dp, OchrePrimary.copy(alpha = 0.5f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(Spacing.md)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    TruthBadge(label = "GROUNDED ITINERARY", backgroundColor = OchrePrimary, contentColor = DarkBackground)
                                    Text(
                                        text = "${itinerary.days.size} Day • ${itinerary.days.sumOf { it.stops.size }} Stops",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = SunTempleGold,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Spacer(modifier = Modifier.height(Spacing.xs))
                                Text(
                                    text = itinerary.explanation,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextSecondary
                                )

                                Spacer(modifier = Modifier.height(Spacing.md))

                                // Save, Share, Remind Action Row
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Button(
                                        onClick = {
                                            viewModel.saveCurrentPlan()
                                            coroutineScope.launch {
                                                snackbarHostState.showSnackbar("Saved on this device.")
                                            }
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground),
                                        shape = RoundedCornerShape(10.dp),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Icon(Icons.Default.Bookmark, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Save Trip", fontWeight = FontWeight.Bold, maxLines = 1)
                                    }

                                    OutlinedButton(
                                        onClick = {
                                            val shareText = "My ${state.selectedOriginName} ${itinerary.days.size}-Day Itinerary:\n" +
                                                itinerary.days.flatMap { it.stops }.joinToString("\n") { "• ${it.place.name}" }
                                            val sendIntent = Intent().apply {
                                                action = Intent.ACTION_SEND
                                                putExtra(Intent.EXTRA_TEXT, shareText)
                                                type = "text/plain"
                                            }
                                            context.startActivity(Intent.createChooser(sendIntent, "Share Itinerary"))
                                        },
                                        shape = RoundedCornerShape(10.dp),
                                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Share")
                                    }

                                    IconButton(
                                        onClick = {
                                            val firstStop = itinerary.days.firstOrNull()?.stops?.firstOrNull()
                                            if (firstStop != null) {
                                                NotificationHelper.showTripReminder(context, firstStop.place.id, firstStop.place.name)
                                                coroutineScope.launch {
                                                    snackbarHostState.showSnackbar("Trip reminder posted to notification tray")
                                                }
                                            }
                                        },
                                        modifier = Modifier
                                            .size(40.dp)
                                            .background(DarkSurfaceVariant, RoundedCornerShape(10.dp))
                                    ) {
                                        Icon(Icons.Default.Notifications, contentDescription = "Remind", tint = SunTempleGold, modifier = Modifier.size(18.dp))
                                    }
                                }
                            }
                        }
                    }

                    // Day Tabs
                    if (itinerary.days.size > 1) {
                        item {
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(itinerary.days.indices.toList()) { index ->
                                    ContextChip(
                                        label = "Day ${index + 1}",
                                        isSelected = selectedDayIndex == index,
                                        onClick = { selectedDayIndex = index }
                                    )
                                }
                            }
                        }
                    }

                    // Sequential Stop Cards with Connectors
                    val currentDay = itinerary.days.getOrNull(selectedDayIndex) ?: itinerary.days.firstOrNull()
                    if (currentDay != null) {
                        item {
                            Text(
                                text = "Day ${currentDay.dayNumber}: ${currentDay.theme ?: "Heritage & Discovery"}",
                                style = MaterialTheme.typography.titleMedium,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        items(currentDay.stops, key = { "${currentDay.dayNumber}_${it.sequence}" }) { stop ->
                            ItineraryStopCard(
                                stop = stop,
                                onClick = { onPlaceClick(stop.place.id) }
                            )

                            // Check for hop connecting this stop to the next stop
                            val hop = currentDay.hops.firstOrNull { it.fromSequence == stop.sequence }
                            if (hop != null) {
                                TransportHopCard(hop = hop)
                            }
                        }
                    }

                    item {
                        Spacer(modifier = Modifier.height(Spacing.xl))
                    }
                }
            }
        }
    }
}
