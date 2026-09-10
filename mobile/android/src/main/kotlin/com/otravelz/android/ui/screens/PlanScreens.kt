package com.otravelz.android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.otravelz.android.R
import com.otravelz.android.domain.model.*
import com.otravelz.android.ui.theme.*

/**
 * Primary structured constraints form for trip planning.
 */
@OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
fun PlanConstraintsForm(
    uiState: PlanUiState,
    onDaysChanged: (Int) -> Unit,
    onInterestToggled: (String) -> Unit,
    onPaceChanged: (PlanPace) -> Unit,
    onStartHubChanged: (String) -> Unit,
    onLowWalkingToggled: (Boolean) -> Unit,
    onPublicTransportToggled: (Boolean) -> Unit,
    onPromptChanged: (String) -> Unit,
    onExtractWithAI: () -> Unit,
    onGeneratePlan: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    var isAiPromptExpanded by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(uiState.naturalLanguagePrompt.isNotBlank()) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(horizontal = Spacing.space4, vertical = Spacing.space2),
        verticalArrangement = Arrangement.spacedBy(Spacing.space4)
    ) {
        // Form Intro Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(Spacing.space4),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "Odisha Trip Planner",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Build a multi-day itinerary grounded on verified cultural destinations and scheduled Mo Bus connections.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // ==========================================
        // STEP 1: STARTING HUB & DURATION
        // ==========================================
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(Spacing.space4),
                verticalArrangement = Arrangement.spacedBy(Spacing.space3)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        shape = CircleShape,
                        color = TerracottaAccent.copy(alpha = 0.15f),
                        modifier = Modifier.size(28.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("1", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = TerracottaAccent)
                        }
                    }
                    Text(
                        text = "Origin & Duration",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                // Starting Hub
                Text(
                    text = "Starting Hub",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                ) {
                    PlannerHubs.POPULAR_HUBS.forEach { hub ->
                        val isSelected = uiState.constraints.startHub?.equals(hub, ignoreCase = true) == true
                        FilterChip(
                            selected = isSelected,
                            onClick = { onStartHubChanged(hub) },
                            label = { Text(hub, style = MaterialTheme.typography.labelMedium) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ChilikaBlueAccent,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                // Duration
                Text(
                    text = "Trip Length",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
                val durations = listOf(
                    1 to stringResource(R.string.plan_duration_1_day),
                    2 to stringResource(R.string.plan_duration_2_days),
                    3 to stringResource(R.string.plan_duration_3_days),
                    5 to stringResource(R.string.plan_duration_5_days)
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                ) {
                    durations.forEach { (days, label) ->
                        val isSelected = uiState.constraints.days == days
                        FilterChip(
                            selected = isSelected,
                            onClick = { onDaysChanged(days) },
                            label = { Text(label, style = MaterialTheme.typography.labelMedium) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = TerracottaAccent,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }
            }
        }

        // ==========================================
        // STEP 2: THEMES & INTERESTS
        // ==========================================
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(Spacing.space4),
                verticalArrangement = Arrangement.spacedBy(Spacing.space3)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        shape = CircleShape,
                        color = TerracottaAccent.copy(alpha = 0.15f),
                        modifier = Modifier.size(28.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("2", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = TerracottaAccent)
                        }
                    }
                    Text(
                        text = "Interests & Themes",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                androidx.compose.foundation.layout.FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(Spacing.space2),
                    verticalArrangement = Arrangement.spacedBy(Spacing.space2),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    PlanInterest.entries.forEach { interest ->
                        val isSelected = uiState.constraints.interests.contains(interest.key)
                        FilterChip(
                            selected = isSelected,
                            onClick = { onInterestToggled(interest.key) },
                            label = { Text(interest.displayName, style = MaterialTheme.typography.labelMedium) },
                            leadingIcon = if (isSelected) {
                                { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                            } else null,
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = TerracottaAccent,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }
            }
        }

        // ==========================================
        // STEP 3: MOBILITY & PACE
        // ==========================================
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(Spacing.space4),
                verticalArrangement = Arrangement.spacedBy(Spacing.space3)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        shape = CircleShape,
                        color = TerracottaAccent.copy(alpha = 0.15f),
                        modifier = Modifier.size(28.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("3", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = TerracottaAccent)
                        }
                    }
                    Text(
                        text = "Travel Preferences",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                // Pace Selection
                Text(
                    text = "Travel Pace",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
                Row(horizontalArrangement = Arrangement.spacedBy(Spacing.space2)) {
                    PlanPace.entries.forEach { pace ->
                        val isSelected = uiState.constraints.pace == pace
                        val label = when (pace) {
                            PlanPace.RELAXED -> stringResource(R.string.plan_pace_relaxed)
                            PlanPace.MODERATE -> stringResource(R.string.plan_pace_moderate)
                            PlanPace.FAST -> stringResource(R.string.plan_pace_fast)
                        }
                        FilterChip(
                            selected = isSelected,
                            onClick = { onPaceChanged(pace) },
                            label = { Text(label, style = MaterialTheme.typography.labelMedium) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ForestGreenAccent,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                // Transit & Walking Toggles
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                ) {
                    FilterChip(
                        selected = uiState.constraints.publicTransportPreferred,
                        onClick = { onPublicTransportToggled(!uiState.constraints.publicTransportPreferred) },
                        label = { Text("Mo Bus Preferred", style = MaterialTheme.typography.labelSmall) },
                        leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null, modifier = Modifier.size(16.dp)) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = ChilikaBlueAccent,
                            selectedLabelColor = Color.White
                        )
                    )
                    FilterChip(
                        selected = uiState.constraints.lowWalking,
                        onClick = { onLowWalkingToggled(!uiState.constraints.lowWalking) },
                        label = { Text("Reduced Walking", style = MaterialTheme.typography.labelSmall) },
                        leadingIcon = { Icon(Icons.Default.Info, contentDescription = null, modifier = Modifier.size(16.dp)) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = ForestGreenAccent,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
        }

        // ==========================================
        // STEP 4: OPTIONAL AI ASSISTANT NOTE (ACCORDION)
        // ==========================================
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceContainer
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(Spacing.space3)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { isAiPromptExpanded = !isAiPromptExpanded }
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text("✨", style = MaterialTheme.typography.titleSmall)
                        Column {
                            Text(
                                text = "Special Request or Custom Note (Optional)",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Have specific timing constraints or requests? Describe in plain English",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Icon(
                        if (isAiPromptExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = if (isAiPromptExpanded) "Collapse" else "Expand",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                androidx.compose.animation.AnimatedVisibility(visible = isAiPromptExpanded) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = Spacing.space3),
                        verticalArrangement = Arrangement.spacedBy(Spacing.space3)
                    ) {
                        OutlinedTextField(
                            value = uiState.naturalLanguagePrompt,
                            onValueChange = onPromptChanged,
                            placeholder = {
                                Text(
                                    text = "e.g. 6 hours in Bhubaneswar, want ancient temples and less walking...",
                                    style = MaterialTheme.typography.bodySmall
                                )
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            maxLines = 3
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End
                        ) {
                            Button(
                                onClick = onExtractWithAI,
                                enabled = uiState.naturalLanguagePrompt.isNotBlank() && !uiState.isAIExtracting,
                                colors = ButtonDefaults.buttonColors(containerColor = TerracottaAccent),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                if (uiState.isAIExtracting) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp,
                                        color = Color.White
                                    )
                                    Spacer(modifier = Modifier.width(Spacing.space2))
                                    Text(stringResource(R.string.plan_extracting_loading), style = MaterialTheme.typography.labelMedium)
                                } else {
                                    Text(stringResource(R.string.plan_action_extract_ai), style = MaterialTheme.typography.labelMedium)
                                }
                            }
                        }
                    }
                }
            }
        }

        // Error message if any
        if (uiState.errorMessage != null) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.errorContainer,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(Spacing.space3),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                ) {
                    Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                    Text(
                        text = uiState.errorMessage,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
        }

        // Generate Primary Action
        Button(
            onClick = onGeneratePlan,
            enabled = !uiState.isLoading,
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = TerracottaAccent),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.5.dp,
                    color = Color.White
                )
                Spacer(modifier = Modifier.width(Spacing.space3))
                Text(stringResource(R.string.plan_generating_loading), style = MaterialTheme.typography.labelLarge)
            } else {
                Text(stringResource(R.string.plan_action_generate), style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(Spacing.space6))
    }
}

/**
 * Displays validated itinerary days, stops, intermediate legs, and grounded disclosures.
 */
@Composable
fun PlanItineraryView(
    plan: PlanResult,
    onModifyPlan: () -> Unit,
    onPlaceClick: (String) -> Unit,
    onViewOnMap: () -> Unit,
    saveTripState: SaveTripState = SaveTripState.UNSAVED,
    onSaveTrip: () -> Unit = {},
    onStartTrip: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(Spacing.space5),
        verticalArrangement = Arrangement.spacedBy(Spacing.space4)
    ) {
        // Summary Header Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(Spacing.space4),
                verticalArrangement = Arrangement.spacedBy(Spacing.space3)
            ) {
                Text(
                    text = stringResource(
                        R.string.plan_result_summary,
                        plan.constraints.days,
                        plan.constraints.startHub ?: "Odisha"
                    ),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = stringResource(R.string.plan_stops_count, plan.totalStopsCount),
                    style = MaterialTheme.typography.bodyMedium,
                    color = TerracottaAccent,
                    fontWeight = FontWeight.SemiBold
                )

                // Persistence Actions (Wave M14)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.space2),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = onSaveTrip,
                        enabled = saveTripState != SaveTripState.SAVING && saveTripState != SaveTripState.SAVED,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (saveTripState == SaveTripState.SAVED) ForestGreenAccent else MaterialTheme.colorScheme.primary
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        when (saveTripState) {
                            SaveTripState.SAVING -> {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    color = Color.White,
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(stringResource(R.string.plan_saving_trip), style = MaterialTheme.typography.labelMedium)
                            }
                            SaveTripState.SAVED -> {
                                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(stringResource(R.string.plan_trip_saved), style = MaterialTheme.typography.labelMedium)
                            }
                            else -> {
                                Icon(Icons.Default.Bookmark, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(stringResource(R.string.plan_action_save_trip), style = MaterialTheme.typography.labelMedium)
                            }
                        }
                    }

                    FilledTonalButton(
                        onClick = onStartTrip,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(stringResource(R.string.trips_action_start_trip), style = MaterialTheme.typography.labelMedium)
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onModifyPlan) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(stringResource(R.string.plan_action_modify), style = MaterialTheme.typography.labelMedium)
                    }

                    OutlinedButton(
                        onClick = onViewOnMap,
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Place, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(stringResource(R.string.plan_view_itinerary_map), style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
        }

        // AI Companion Explanation (if available)
        if (!plan.aiCompanionMessage.isNullOrBlank()) {
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = ChilikaBlueAccent.copy(alpha = 0.08f),
                border = androidx.compose.foundation.BorderStroke(1.dp, ChilikaBlueAccent.copy(alpha = 0.2f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(Spacing.space4),
                    verticalArrangement = Arrangement.spacedBy(Spacing.space2)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        Text(
                            text = stringResource(R.string.plan_ai_companion_title),
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = ChilikaBlueAccent
                        )
                        Spacer(modifier = Modifier.weight(1f))
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = ForestGreenAccent.copy(alpha = 0.12f)
                        ) {
                            Text(
                                text = stringResource(R.string.plan_ai_grounded_badge),
                                style = MaterialTheme.typography.labelSmall,
                                color = ForestGreenAccent,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(
                        text = plan.aiCompanionMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }

        // Days Schedule Timeline
        plan.days.forEach { day ->
            Text(
                text = "Day ${day.dayNumber}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            // Stops and Hops interleaved
            day.stops.forEachIndexed { index, stop ->
                // Connecting hop before stop
                val hop = day.hops.find { it.toSequence == stop.sequence }
                if (hop != null) {
                    HopTimelineCard(hop = hop)
                }

                // Stop Card
                StopTimelineCard(
                    stop = stop,
                    onClick = { onPlaceClick(stop.placeId) }
                )
            }
        }

        // Disclosures & Truth Notice Banner
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(Spacing.space3),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = stringResource(R.string.plan_disclaimer_title),
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.outline
                )
                Text(
                    text = "• " + stringResource(R.string.plan_disclaimer_hours),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "• " + stringResource(R.string.plan_disclaimer_fares),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.space6))
    }
}

@Composable
private fun StopTimelineCard(
    stop: PlanStop,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .padding(Spacing.space4)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.space3)
        ) {
            // Sequence Number Badge
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(TerracottaAccent),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "${stop.sequence}",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = stop.placeName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(Spacing.space2),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Text(
                            text = stop.category.replaceFirstChar { it.uppercase() },
                            style = MaterialTheme.typography.labelSmall,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    if (stop.timeWindowDisplay != null) {
                        Text(
                            text = stop.timeWindowDisplay ?: "",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Icon(
                Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.outline
            )
        }
    }
}

@Composable
private fun HopTimelineCard(
    hop: JourneyLeg,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .padding(start = 20.dp, top = 2.dp, bottom = 2.dp)
            .fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
    ) {
        Box(
            modifier = Modifier
                .width(2.dp)
                .height(30.dp)
                .background(MaterialTheme.colorScheme.outlineVariant)
        )
        Spacer(modifier = Modifier.width(Spacing.space1))

        Icon(
            imageVector = if (hop.mode.equals("walk", ignoreCase = true)) Icons.Default.Info else Icons.Default.LocationOn,
            contentDescription = null,
            modifier = Modifier.size(16.dp),
            tint = if (hop.isUnavailable) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
        )

        Text(
            text = hop.legDetail ?: hop.displayModeTitle,
            style = MaterialTheme.typography.bodySmall,
            color = if (hop.isUnavailable) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
