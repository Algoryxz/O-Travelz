package com.otravelz.android.feature.planner

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import com.otravelz.android.data.model.ItineraryStopDto
import com.otravelz.android.data.model.TransportHopDto

@Composable
fun PlannerScreen(
    viewModel: PlannerViewModel,
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(Spacing.md)
    ) {
        Text(
            text = "AI Trip & Transit Planner",
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary
        )
        Text(
            text = "Grounded Itinerary with Mo Bus & Ama Bus Routing",
            style = MaterialTheme.typography.bodyMedium,
            color = OchreLight
        )

        Spacer(modifier = Modifier.height(Spacing.md))

        OutlinedTextField(
            value = state.prompt,
            onValueChange = { viewModel.updatePrompt(it) },
            label = { Text("Trip Request / Prompt", color = TextMuted) },
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = OchrePrimary,
                unfocusedBorderColor = DarkBorder,
                focusedContainerColor = DarkSurface,
                unfocusedContainerColor = DarkSurface,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(Spacing.sm))

        Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            OTButton(
                text = "Generate 1-Day Plan",
                onClick = { viewModel.generatePlan(1) },
                modifier = Modifier.weight(1f)
            )
            OTButton(
                text = "2-Day Plan",
                onClick = { viewModel.generatePlan(2) },
                variant = ButtonVariant.Secondary,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(Spacing.md))

        if (state.isLoading) {
            LoadingState(message = "Computing optimal route & verified stops...")
            return
        }

        if (state.errorMessage != null && state.itinerary == null) {
            ErrorState(
                message = state.errorMessage ?: "Planning failed",
                onRetry = { viewModel.generatePlan(1) }
            )
            return
        }

        val itinerary = state.itinerary
        if (itinerary != null) {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
                item {
                    OTCard {
                        Text(
                            text = "Grounded Plan Overview",
                            style = MaterialTheme.typography.titleMedium,
                            color = OchrePrimary
                        )
                        Spacer(modifier = Modifier.height(Spacing.xs))
                        Text(
                            text = itinerary.explanation,
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                    }
                }

                itinerary.days.forEach { day ->
                    item {
                        Text(
                            text = "Day ${day.dayNumber}: ${day.theme ?: "Heritage & City Discovery"}",
                            style = MaterialTheme.typography.titleLarge,
                            color = TextPrimary,
                            modifier = Modifier.padding(vertical = Spacing.xs)
                        )
                    }

                    items(day.stops) { stop ->
                        ItineraryStopCard(stop = stop, onPlaceClick = onPlaceClick)
                    }

                    items(day.hops) { hop ->
                        TransportHopCard(hop = hop)
                    }
                }
            }
        } else {
            EmptyState(
                title = "Ready to Plan",
                subtitle = "Tap 'Generate 1-Day Plan' to compute a deterministic travel itinerary."
            )
        }
    }
}

@Composable
fun ItineraryStopCard(stop: ItineraryStopDto, onPlaceClick: (String) -> Unit) {
    OTCard(onClick = { onPlaceClick(stop.place.id) }) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Place, contentDescription = null, tint = OchrePrimary)
            Spacer(modifier = Modifier.width(Spacing.sm))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "${stop.sequence}. ${stop.place.name}",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary
                )
                Text(
                    text = "Planned Arrival: ${stop.plannedArrival ?: "09:00"} • Duration: ${stop.durationMinutes ?: 60} mins",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            }
        }
    }
}

@Composable
fun TransportHopCard(hop: TransportHopDto) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceVariant),
        modifier = Modifier.fillMaxWidth().padding(horizontal = Spacing.sm)
    ) {
        Row(
            modifier = Modifier.padding(Spacing.sm),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val icon = if (hop.mode.contains("bus", ignoreCase = true)) Icons.Default.DirectionsBus else Icons.Default.DirectionsWalk
            Icon(icon, contentDescription = null, tint = TealLight, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(Spacing.sm))
            Column {
                Text(
                    text = "Hop ${hop.fromSequence} ➔ ${hop.toSequence}: ${hop.mode.uppercase()} (~${hop.estimatedMinutes ?: 15} mins)",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TealLight,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "Data Tier: ${hop.dataTier.uppercase()} • First-Mile: Walking/Auto",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted
                )
            }
        }
    }
}
