package com.otravelz.android.core.ui.planner

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otravelz.android.core.design.*
import com.otravelz.android.data.model.ItineraryStopDto
import com.otravelz.android.data.model.TransportHopDto

@Composable
fun GuidedPlannerForm(
    originCities: List<Triple<String, Double, Double>>,
    selectedOrigin: String,
    onSelectOrigin: (String, Double, Double) -> Unit,
    durationDays: Int,
    onSelectDays: (Int) -> Unit,
    categories: List<Pair<String, String>>,
    selectedCategories: Set<String>,
    onToggleCategory: (String) -> Unit,
    onGenerate: () -> Unit,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(Spacing.md),
        modifier = modifier.fillMaxWidth()
    ) {
        // Origin Picker
        Column {
            Text(
                text = "Starting Hub / Origin City",
                style = MaterialTheme.typography.titleSmall,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(Spacing.xs))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(originCities) { (cityName, lat, lon) ->
                    ContextChip(
                        label = cityName,
                        isSelected = selectedOrigin == cityName,
                        onClick = { onSelectOrigin(cityName, lat, lon) }
                    )
                }
            }
        }

        // Duration Stepper / Chips
        Column {
            Text(
                text = "Trip Duration",
                style = MaterialTheme.typography.titleSmall,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(Spacing.xs))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(1, 2, 3, 5).forEach { days ->
                    ContextChip(
                        label = if (days == 1) "1 Day" else "$days Days",
                        isSelected = durationDays == days,
                        onClick = { onSelectDays(days) }
                    )
                }
            }
        }

        // Category Focus
        Column {
            Text(
                text = "Experience Focus",
                style = MaterialTheme.typography.titleSmall,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(Spacing.xs))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(categories) { (catKey, catLabel) ->
                    val isSelected = selectedCategories.contains(catKey)
                    ContextChip(
                        label = catLabel,
                        isSelected = isSelected,
                        onClick = { onToggleCategory(catKey) }
                    )
                }
            }
        }

        // Generate Action
        Button(
            onClick = onGenerate,
            enabled = !isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Icon(Icons.Default.Route, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = if (isLoading) "Generating Optimal Itinerary..." else "Build $durationDays-Day Itinerary",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }
    }
}

@Composable
fun AiPlannerForm(
    prompt: String,
    onPromptChange: (String) -> Unit,
    onGenerate: () -> Unit,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    val starters = listOf(
        "One day in Bhubaneswar",
        "Puri + Konark heritage",
        "Temples + local food",
        "Nature & wildlife weekend"
    )

    Column(
        verticalArrangement = Arrangement.spacedBy(Spacing.md),
        modifier = modifier.fillMaxWidth()
    ) {
        OutlinedTextField(
            value = prompt,
            onValueChange = onPromptChange,
            label = { Text("What kind of Odisha trip would you like?", color = TextMuted) },
            minLines = 3,
            maxLines = 4,
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = DarkSurfaceElevated,
                unfocusedContainerColor = DarkSurfaceElevated,
                focusedBorderColor = OchrePrimary,
                unfocusedBorderColor = DarkBorder,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        // Starter Chips
        Column {
            Text(
                text = "Suggested Prompts",
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(Spacing.xs))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(starters) { starter ->
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = DarkSurfaceElevated,
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
                        modifier = Modifier.clickable { onPromptChange(starter) }
                    ) {
                        Text(
                            text = starter,
                            style = MaterialTheme.typography.labelSmall,
                            color = OchreLight,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }
        }

        Button(
            onClick = onGenerate,
            enabled = !isLoading && prompt.isNotBlank(),
            colors = ButtonDefaults.buttonColors(containerColor = SunTempleGold, contentColor = DarkBackground),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = if (isLoading) "Synthesizing Grounded Plan..." else "Generate with AI Copilot",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }
    }
}

@Composable
fun ItineraryStopCard(
    stop: ItineraryStopDto,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(Spacing.md)
        ) {
            // Sequence Number Badge
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(OchrePrimary.copy(alpha = 0.2f))
                    .border(1.dp, OchrePrimary, CircleShape)
            ) {
                Text(
                    text = "${stop.sequence}",
                    style = MaterialTheme.typography.titleMedium,
                    color = OchrePrimary,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.width(Spacing.md))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = stop.place.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = stop.place.category.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = SunTempleGold,
                        fontWeight = FontWeight.SemiBold
                    )
                    if (!stop.plannedArrival.isNullOrBlank()) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "• ${stop.plannedArrival} - ${stop.plannedDeparture ?: ""}",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }
            }

            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = TextMuted,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
fun TransportHopCard(
    hop: TransportHopDto,
    modifier: Modifier = Modifier
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.lg, vertical = 4.dp)
    ) {
        // Vertical dashed line connector
        Box(
            modifier = Modifier
                .width(2.dp)
                .height(36.dp)
                .background(DarkBorder)
        )

        Spacer(modifier = Modifier.width(Spacing.md))

        Surface(
            shape = RoundedCornerShape(10.dp),
            color = DarkSurface,
            border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.DirectionsBus,
                    contentDescription = null,
                    tint = RaghurajpurTerracotta,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    val legDetail = hop.legs.firstOrNull()?.detail ?: "Scheduled Transit Connection"
                    Text(
                        text = legDetail,
                        style = MaterialTheme.typography.labelSmall,
                        color = TextPrimary,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "${hop.estimatedMinutes ?: 20} mins • ${hop.dataTier.uppercase()}",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextMuted
                    )
                }
            }
        }
    }
}
