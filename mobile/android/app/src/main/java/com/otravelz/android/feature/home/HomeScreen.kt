package com.otravelz.android.feature.home

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Route
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.notifications.NotificationHelper
import java.util.Calendar

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onPlaceClick: (String) -> Unit,
    onExploreClick: () -> Unit,
    onPlanClick: (() -> Unit)? = null,
    onTripsClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    val greeting = when (Calendar.getInstance().get(Calendar.HOUR_OF_DAY)) {
        in 4..11 -> "Shubha Sakala • Good Morning"
        in 12..16 -> "Shubha Madhyahna • Good Afternoon"
        else -> "Shubha Sandhya • Good Evening"
    }

    val categories = listOf(
        "temple" to "Temples",
        "heritage" to "Heritage",
        "nature" to "Nature & Hills",
        "beach" to "Beaches",
        "waterfall" to "Waterfalls",
        "food" to "Odia Cuisine"
    )

    if (state.isLoading && state.places.isEmpty()) {
        LoadingState(modifier = modifier.fillMaxSize(), message = "Discovering Odisha destinations...")
        return
    }

    if (state.errorMessage != null && state.places.isEmpty()) {
        ErrorState(
            message = state.errorMessage ?: "Failed to connect to backend",
            onRetry = { viewModel.loadData() },
            modifier = modifier.fillMaxSize()
        )
        return
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // 1. Cinematic Hero Header
        item {
            val heroImage = state.places.firstOrNull { it.images.isNotEmpty() }?.images?.firstOrNull()?.url
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp)
                    .clip(RoundedCornerShape(bottomStart = 28.dp, bottomEnd = 28.dp))
                    .background(DarkSurface)
            ) {
                MediaHero(
                    title = "O-TRAVELZ",
                    subtitle = greeting,
                    imageUrl = heroImage,
                    modifier = Modifier.fillMaxSize()
                )

                // Quick Notification Trigger Badge (Top-Right)
                IconButton(
                    onClick = {
                        val samplePlace = state.places.firstOrNull()
                        NotificationHelper.showLocalNotification(
                            context = context,
                            notificationId = 101,
                            title = "Trip Guidance • Odisha",
                            message = "Scheduled Mo Bus Route 10 and 11 available near Master Canteen.",
                            placeId = samplePlace?.id ?: "9b27a5dd-1d0a-5844-9fe3-d721289202c0"
                        )
                    },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(Spacing.md)
                        .background(DarkBackground.copy(alpha = 0.65f), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "Notification Prompt",
                        tint = SunTempleGold
                    )
                }
            }
        }

        // 2. Ambient Weather Context Banner
        item {
            Spacer(modifier = Modifier.height(Spacing.md))
            Column(modifier = Modifier.padding(horizontal = Spacing.md)) {
                AmbientWeatherBanner(
                    tempCelsius = state.weather?.current?.temperature,
                    conditionText = state.weather?.current?.condition ?: "Tropical Clear",
                    isLive = state.weather?.dataTier == "live" || state.weather?.current != null,
                    locationLabel = state.weather?.locationName ?: "Bhubaneswar & Central"
                )
            }
        }

        // 3. Quick Action Dock
        item {
            Spacer(modifier = Modifier.height(Spacing.md))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                QuickActionItem(
                    icon = Icons.Default.Route,
                    label = "Plan",
                    tint = OchrePrimary,
                    onClick = { onPlanClick?.invoke() ?: onExploreClick() }
                )
                QuickActionItem(
                    icon = Icons.Default.Explore,
                    label = "Discover",
                    tint = ChilikaAzure,
                    onClick = onExploreClick
                )
                QuickActionItem(
                    icon = Icons.Default.Bookmark,
                    label = "Saved",
                    tint = SimilipalEmerald,
                    onClick = { onTripsClick?.invoke() ?: onExploreClick() }
                )
                QuickActionItem(
                    icon = Icons.Default.DirectionsBus,
                    label = "Transit",
                    tint = SunTempleGold,
                    onClick = onExploreClick
                )
            }
        }

        // 4. Suggested Odisha Travel Circuits
        item {
            Spacer(modifier = Modifier.height(Spacing.lg))
            Column(modifier = Modifier.padding(horizontal = Spacing.md)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Curated Circuits",
                        style = MaterialTheme.typography.titleLarge,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    TruthBadge(label = "CURATED", backgroundColor = DarkSurfaceVariant, contentColor = TextSecondary)
                }
                Spacer(modifier = Modifier.height(Spacing.xs))
                Text(
                    text = "Classic day itineraries verified with scheduled transit",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
            }
            Spacer(modifier = Modifier.height(Spacing.sm))
            LazyRow(
                contentPadding = PaddingValues(horizontal = Spacing.md),
                horizontalArrangement = Arrangement.spacedBy(Spacing.md)
            ) {
                item {
                    CircuitCard(
                        title = "Ekamra Heritage Circuit",
                        subtitle = "Lingaraj • Mukteswar • Bindu Sagar",
                        tag = "1 Day · 3 Stops",
                        accentColor = RaghurajpurTerracotta,
                        onClick = { onPlanClick?.invoke() ?: onExploreClick() }
                    )
                }
                item {
                    CircuitCard(
                        title = "Golden Triangle",
                        subtitle = "Bhubaneswar • Puri • Konark",
                        tag = "2 Days · Coastal",
                        accentColor = SunTempleGold,
                        onClick = { onPlanClick?.invoke() ?: onExploreClick() }
                    )
                }
                item {
                    CircuitCard(
                        title = "Chilika Ecotourism Trail",
                        subtitle = "Mangalajodi • Satapada • Kalijai",
                        tag = "1 Day · Wetland",
                        accentColor = ChilikaAzure,
                        onClick = { onPlanClick?.invoke() ?: onExploreClick() }
                    )
                }
            }
        }

        // 5. Category Filter Row
        item {
            Spacer(modifier = Modifier.height(Spacing.lg))
            Column(modifier = Modifier.padding(horizontal = Spacing.md)) {
                Text(
                    text = "Featured Experiences",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(Spacing.sm))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                    items(categories) { (catId, catLabel) ->
                        ContextChip(
                            label = catLabel,
                            isSelected = state.selectedCategory.equals(catId, ignoreCase = true),
                            onClick = { viewModel.selectCategory(catId) }
                        )
                    }
                }
            }
        }

        // 6. Horizontal Destination Showcase
        item {
            val filtered = state.places.filter { it.category.equals(state.selectedCategory, ignoreCase = true) }
                .ifEmpty { state.places }

            Spacer(modifier = Modifier.height(Spacing.md))
            LazyRow(
                contentPadding = PaddingValues(horizontal = Spacing.md),
                horizontalArrangement = Arrangement.spacedBy(Spacing.md)
            ) {
                items(filtered) { place ->
                    val imgUrl = place.images.firstOrNull()?.cardUrl ?: place.images.firstOrNull()?.url
                    DestinationCard(
                        name = place.name,
                        category = place.category,
                        district = place.district,
                        imageUrl = imgUrl,
                        rating = place.rating,
                        onClick = { onPlaceClick(place.id) }
                    )
                }
            }
            Spacer(modifier = Modifier.height(Spacing.xl))
        }
    }
}

@Composable
private fun QuickActionItem(
    icon: ImageVector,
    label: String,
    tint: Color,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(Spacing.xs)
    ) {
        Box(
            modifier = Modifier
                .size(52.dp)
                .background(DarkSurfaceElevated, RoundedCornerShape(16.dp))
                .border(1.dp, DarkBorder, RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = label, tint = tint, modifier = Modifier.size(24.dp))
        }
        Spacer(modifier = Modifier.height(Spacing.xs))
        Text(text = label, style = MaterialTheme.typography.labelMedium, color = TextPrimary, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun CircuitCard(
    title: String,
    subtitle: String,
    tag: String,
    accentColor: Color,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = Modifier
            .width(260.dp)
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(Spacing.md)) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(accentColor.copy(alpha = 0.2f))
                    .padding(horizontal = 8.dp, vertical = 2.dp)
            ) {
                Text(
                    text = tag.uppercase(),
                    style = MaterialTheme.typography.labelSmall,
                    color = accentColor,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.height(Spacing.sm))
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = TextPrimary,
                fontWeight = FontWeight.Bold,
                maxLines = 1
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary,
                maxLines = 2
            )
        }
    }
}
