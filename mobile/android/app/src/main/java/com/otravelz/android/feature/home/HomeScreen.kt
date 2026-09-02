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
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LocalAtm
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocalPolice
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Route
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.otravelz.android.core.design.*
import com.otravelz.android.core.network.ApiConfig
import com.otravelz.android.core.notifications.NotificationHelper
import com.otravelz.android.data.local.room.RecentlyViewedEntity
import com.otravelz.android.data.repository.CivicCategory
import com.otravelz.android.feature.civic.CivicEssentialsSheet
import java.util.Calendar

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onPlaceClick: (String) -> Unit,
    onExploreClick: () -> Unit,
    onSearchClick: (() -> Unit)? = null,
    onPlanClick: (() -> Unit)? = null,
    onTripsClick: (() -> Unit)? = null,
    onTransitClick: (() -> Unit)? = null,
    onMapClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var selectedCivicCategory by remember { mutableStateOf<CivicCategory?>(null) }

    val greeting = when (Calendar.getInstance().get(Calendar.HOUR_OF_DAY)) {
        in 4..11 -> "Shubha Sakala • Good Morning"
        in 12..16 -> "Shubha Madhyahna • Good Afternoon"
        else -> "Shubha Sandhya • Good Evening"
    }

    if (state.isLoading && state.places.isEmpty()) {
        LoadingState(modifier = modifier.fillMaxSize(), message = "Discovering Odisha destinations...")
        return
    }

    if (state.errorMessage != null && state.places.isEmpty()) {
        ErrorState(
            message = state.errorMessage ?: "Service temporarily unavailable",
            onRetry = { viewModel.loadData() },
            modifier = modifier.fillMaxSize()
        )
        return
    }

    // Civic Essentials Bottom Sheet
    if (selectedCivicCategory != null) {
        CivicEssentialsSheet(
            initialCategory = selectedCivicCategory!!,
            onDismiss = { selectedCivicCategory = null }
        )
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // 1. Compact Contextual Header with Location & Actions
        item {
            val heroPlace = state.places.firstOrNull { 
                it.name.contains("Konark", ignoreCase = true) || 
                it.name.contains("Lingaraj", ignoreCase = true) || 
                it.name.contains("Jagannath", ignoreCase = true) ||
                it.name.contains("Puri", ignoreCase = true)
            } ?: state.places.firstOrNull { it.images.isNotEmpty() }
            val heroImage = heroPlace?.images?.firstOrNull()?.url

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
                    .clip(RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp))
                    .background(DarkSurface)
            ) {
                MediaHero(
                    title = "O-TRAVELZ",
                    subtitle = greeting,
                    imageUrl = heroImage,
                    modifier = Modifier.fillMaxSize()
                )

                // Top Bar Actions (Location Truth, Search & Notification Prompt)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.md, vertical = Spacing.sm)
                        .align(Alignment.TopCenter)
                ) {
                    // Location Truth Pill
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = DarkBackground.copy(alpha = 0.75f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = "Location State",
                                tint = OchrePrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "From Bhubaneswar reference point",
                                style = MaterialTheme.typography.labelSmall,
                                color = TextSecondary,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                        if (onSearchClick != null) {
                            IconButton(
                                onClick = onSearchClick,
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(DarkBackground.copy(alpha = 0.75f), CircleShape)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Search,
                                    contentDescription = "Global Search",
                                    tint = OchrePrimary,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }

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
                                .size(36.dp)
                                .background(DarkBackground.copy(alpha = 0.75f), CircleShape)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = "Notification Prompt",
                                tint = SunTempleGold,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }

        // 1.5 Quick Search Bar
        if (onSearchClick != null) {
            item {
                Spacer(modifier = Modifier.height(Spacing.sm))
                Box(modifier = Modifier.padding(horizontal = Spacing.md)) {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = DarkSurfaceElevated,
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSearchClick() }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = Spacing.md, vertical = 12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = "Search",
                                tint = OchrePrimary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(Spacing.sm))
                            Text(
                                text = "Search places, circuits, districts, trips...",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextMuted
                            )
                        }
                    }
                }
            }
        }

        // 2. Ambient Weather Context Banner with Weather-Aware Hint
        item {
            Spacer(modifier = Modifier.height(Spacing.sm))
            Column(modifier = Modifier.padding(horizontal = Spacing.md)) {
                val temp = state.weather?.current?.temperature
                val condition = state.weather?.current?.condition ?: "Pleasant"
                val weatherHint = when {
                    condition.contains("Rain", ignoreCase = true) -> "Rainy conditions • Ideal for scenic waterfall visits or museum tours"
                    temp != null && temp > 34.0 -> "Warm afternoon ($temp°C) • Best to explore air-conditioned museums or morning heritage trails"
                    temp != null && temp < 26.0 -> "Pleasant weather ($temp°C) • Excellent for open-air heritage and temple trails"
                    else -> "Optimal conditions for temple trails and coastal ecotourism across Odisha"
                }

                AmbientWeatherBanner(
                    tempCelsius = temp,
                    conditionText = condition,
                    isLive = state.weather?.dataTier == "live" || state.weather?.current != null,
                    locationLabel = state.weather?.locationName ?: "Bhubaneswar & Central Odisha"
                )

                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "💡 $weatherHint",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    modifier = Modifier.padding(horizontal = 4.dp)
                )
            }
        }

        // 2.5 Recently Viewed Row (if any)
        if (state.recentlyViewed.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(Spacing.md))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.md)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.History,
                            contentDescription = null,
                            tint = OchrePrimary,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Recently Viewed",
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = "Clear",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextMuted,
                        modifier = Modifier.clickable { viewModel.clearRecentlyViewed() }
                    )
                }
                Spacer(modifier = Modifier.height(Spacing.xs))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
                    contentPadding = PaddingValues(horizontal = Spacing.md),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(state.recentlyViewed, key = { it.placeId }) { recent ->
                        RecentlyViewedPlaceCard(
                            place = recent,
                            onClick = { onPlaceClick(recent.placeId) }
                        )
                    }
                }
            }
        }

        // 3. ONE Primary Action / Context Block
        item {
            Spacer(modifier = Modifier.height(Spacing.md))
            Column(modifier = Modifier.padding(horizontal = Spacing.md)) {
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = DarkSurfaceElevated,
                    border = androidx.compose.foundation.BorderStroke(1.dp, OchrePrimary.copy(alpha = 0.4f)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onPlanClick?.invoke() }
                ) {
                    Column(modifier = Modifier.padding(Spacing.md)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            TruthBadge(label = "CURATED ITINERARY", backgroundColor = OchrePrimary, contentColor = DarkBackground)
                            Text(
                                text = "1 DAY • 3 STOPS",
                                style = MaterialTheme.typography.labelSmall,
                                color = SunTempleGold,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(Spacing.xs))
                        Text(
                            text = "Ekamra Heritage Circuit",
                            style = MaterialTheme.typography.titleLarge,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Lingaraj • Mukteswar • Bindu Sagar with scheduled Mo Bus transit",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(Spacing.sm))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.End,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Button(
                                onClick = { onPlanClick?.invoke() },
                                colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground),
                                shape = RoundedCornerShape(10.dp),
                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                            ) {
                                Text("Explore Route", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }

        // 4. Quick Action Dock
        item {
            Spacer(modifier = Modifier.height(Spacing.md))
            Row(
                horizontalArrangement = Arrangement.SpaceEvenly,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md)
            ) {
                QuickActionItem(
                    title = "Plan",
                    icon = Icons.Default.Route,
                    color = OchrePrimary,
                    onClick = { onPlanClick?.invoke() }
                )
                QuickActionItem(
                    title = "Discover",
                    icon = Icons.Default.Explore,
                    color = TealSecondary,
                    onClick = onExploreClick
                )
                QuickActionItem(
                    title = "Saved",
                    icon = Icons.Default.Bookmark,
                    color = SunTempleGold,
                    onClick = { onTripsClick?.invoke() }
                )
                QuickActionItem(
                    title = "Transit",
                    icon = Icons.Default.DirectionsBus,
                    color = RaghurajpurTerracotta,
                    onClick = { onTransitClick?.invoke() ?: onExploreClick() }
                )
            }
        }

        // 5. Civic Essentials Strip
        item {
            Spacer(modifier = Modifier.height(Spacing.md))
            Column(modifier = Modifier.padding(horizontal = Spacing.md)) {
                Text(
                    text = "Civic Essentials",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(Spacing.xs))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    EssentialChip(
                        icon = Icons.Default.LocalHospital,
                        label = "Medical",
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedCivicCategory = CivicCategory.HOSPITAL }
                    )
                    EssentialChip(
                        icon = Icons.Default.LocalPolice,
                        label = "Police",
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedCivicCategory = CivicCategory.POLICE }
                    )
                    EssentialChip(
                        icon = Icons.Default.LocalGasStation,
                        label = "Fuel",
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedCivicCategory = CivicCategory.FUEL }
                    )
                    EssentialChip(
                        icon = Icons.Default.LocalAtm,
                        label = "ATM",
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedCivicCategory = CivicCategory.ATM }
                    )
                }
            }
        }

        // 6. Featured Destinations Carousel
        item {
            Spacer(modifier = Modifier.height(Spacing.lg))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md)
            ) {
                Text(
                    text = "Featured Destinations",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "See All",
                    style = MaterialTheme.typography.labelMedium,
                    color = SunTempleGold,
                    modifier = Modifier.clickable { onExploreClick() }
                )
            }
            Spacer(modifier = Modifier.height(Spacing.xs))
        }

        item {
            val featuredPlaces = state.places.take(8)
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(Spacing.md),
                contentPadding = PaddingValues(horizontal = Spacing.md),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(featuredPlaces, key = { it.id }) { place ->
                    DestinationCard(
                        name = place.name,
                        category = place.category,
                        district = place.district,
                        imageUrl = place.images.firstOrNull()?.url,
                        rating = place.rating,
                        onClick = { onPlaceClick(place.id) }
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(Spacing.xl))
        }
    }
}

@Composable
private fun RecentlyViewedPlaceCard(
    place: RecentlyViewedEntity,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = Modifier
            .width(140.dp)
            .clickable(onClick = onClick)
    ) {
        Column(modifier = Modifier.padding(8.dp)) {
            val resolvedUrl = place.imageUrl?.let { ApiConfig.resolveImageUrl(it) }
            if (resolvedUrl != null) {
                AsyncImage(
                    model = resolvedUrl,
                    contentDescription = place.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(80.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(80.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(DarkSurfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = OchrePrimary,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = place.name,
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.SemiBold,
                color = TextPrimary,
                maxLines = 1
            )
            Text(
                text = place.district ?: place.category,
                style = MaterialTheme.typography.labelSmall,
                color = TextMuted,
                maxLines = 1
            )
        }
    }
}

@Composable
fun QuickActionItem(
    title: String,
    icon: ImageVector,
    color: Color,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .size(54.dp)
                .background(color.copy(alpha = 0.15f), RoundedCornerShape(16.dp))
                .border(1.dp, color.copy(alpha = 0.3f), RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.labelSmall,
            color = TextSecondary,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun EssentialChip(
    icon: ImageVector,
    label: String,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = modifier
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = SunTempleGold,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = TextPrimary,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
