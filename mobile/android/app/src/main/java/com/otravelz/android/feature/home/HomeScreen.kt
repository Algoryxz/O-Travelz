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
import androidx.compose.material.icons.filled.*
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
import com.otravelz.android.core.i18n.LocalAppStrings
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
    val strings = LocalAppStrings.current
    var selectedCivicCategory by remember { mutableStateOf<CivicCategory?>(null) }

    val greeting = when (Calendar.getInstance().get(Calendar.HOUR_OF_DAY)) {
        in 4..11 -> "Shubha Sakala • Good Morning"
        in 12..16 -> "Shubha Madhyahna • Good Afternoon"
        else -> "Shubha Sandhya • Good Evening"
    }

    if (state.isLoading && state.places.isEmpty()) {
        LoadingState(modifier = modifier.fillMaxSize(), message = strings.loadingText)
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
        // 1. Hero Banner with Visual Anchor
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
                    .height(230.dp)
                    .clip(RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp))
                    .background(DarkSurface)
            ) {
                MediaHero(
                    title = strings.homeTitle,
                    tagline = "Odisha Travel Intelligence",
                    subtitle = greeting,
                    imageUrl = heroImage,
                    showBrandLogo = true,
                    modifier = Modifier.fillMaxSize()
                )

                // Top Bar Actions
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.md, vertical = Spacing.sm)
                        .align(Alignment.TopCenter)
                ) {
                    // Location Reference Pill
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
                                contentDescription = null,
                                tint = OchrePrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = strings.fromBhubaneswarReference,
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
                                    .size(40.dp)
                                    .background(DarkBackground.copy(alpha = 0.75f), CircleShape)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Search,
                                    contentDescription = "Search",
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
                                .size(40.dp)
                                .background(DarkBackground.copy(alpha = 0.75f), CircleShape)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = strings.notificationsTitle,
                                tint = SunTempleGold,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }

        // 2. Quick Search Bar
        if (onSearchClick != null) {
            item {
                Spacer(modifier = Modifier.height(Spacing.sm))
                Box(modifier = Modifier.padding(horizontal = Spacing.md)) {
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = DarkSurfaceElevated,
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .clickable { onSearchClick() }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = Spacing.md)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = "Search",
                                tint = OchrePrimary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(Spacing.sm))
                            Text(
                                text = strings.homeSearchPlaceholder,
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextMuted,
                                maxLines = 1
                            )
                        }
                    }
                }
            }
        }

        // 3. Ambient Weather Context Banner
        item {
            Spacer(modifier = Modifier.height(Spacing.sm))
            Column(modifier = Modifier.padding(horizontal = Spacing.md)) {
                val temp = state.weather?.current?.temperature
                val condition = state.weather?.current?.condition ?: "Pleasant"

                AmbientWeatherBanner(
                    tempCelsius = temp,
                    conditionText = condition,
                    isLive = state.weather?.dataTier == "live" || state.weather?.current != null,
                    locationLabel = state.weather?.locationName ?: strings.liveWeatherSubtitle
                )
            }
        }

        // 4. Recently Viewed Row (if any)
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
                            text = strings.recentlyViewedTitle,
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = strings.clearAction,
                        style = MaterialTheme.typography.labelSmall,
                        color = TextMuted,
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .clickable { viewModel.clearRecentlyViewed() }
                            .padding(4.dp)
                    )
                }
                Spacer(modifier = Modifier.height(Spacing.xs))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = Spacing.md),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.sm)
                ) {
                    items(state.recentlyViewed, key = { it.placeId }) { recent ->
                        RecentlyViewedChip(
                            entity = recent,
                            onClick = { onPlaceClick(recent.placeId) }
                        )
                    }
                }
            }
        }

        // 5. Curated Circuit Card
        item {
            Spacer(modifier = Modifier.height(Spacing.md))
            Box(modifier = Modifier.padding(horizontal = Spacing.md)) {
                CuratedCircuitCard(
                    onExploreClick = {
                        val firstPlace = state.places.firstOrNull { it.name.contains("Lingaraj", ignoreCase = true) }
                        if (firstPlace != null) {
                            onPlaceClick(firstPlace.id)
                        } else {
                            onExploreClick()
                        }
                    }
                )
            }
        }

        // 6. Quick Action Grid (4 Actions)
        item {
            Spacer(modifier = Modifier.height(Spacing.md))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md),
                horizontalArrangement = Arrangement.spacedBy(Spacing.sm)
            ) {
                QuickActionButton(
                    icon = Icons.Default.Map,
                    label = strings.quickActionMap,
                    onClick = { onMapClick?.invoke() ?: onExploreClick() },
                    modifier = Modifier.weight(1f)
                )
                QuickActionButton(
                    icon = Icons.Default.DirectionsBus,
                    label = strings.quickActionTransit,
                    onClick = { onTransitClick?.invoke() ?: onExploreClick() },
                    modifier = Modifier.weight(1f)
                )
                QuickActionButton(
                    icon = Icons.Default.LocalHospital,
                    label = strings.quickActionCivic,
                    onClick = { selectedCivicCategory = CivicCategory.HOSPITAL },
                    modifier = Modifier.weight(1f)
                )
                QuickActionButton(
                    icon = Icons.Default.Bookmark,
                    label = strings.quickActionSaved,
                    onClick = { onTripsClick?.invoke() ?: onExploreClick() },
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // 7. Verified Destinations Carousel
        item {
            Spacer(modifier = Modifier.height(Spacing.lg))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.md)
            ) {
                Column {
                    Text(
                        text = strings.popularDestinationsTitle,
                        style = MaterialTheme.typography.titleLarge,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = strings.popularDestinationsSubtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                }

                TextButton(onClick = onExploreClick) {
                    Text(strings.filterAll, color = OchrePrimary, fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(modifier = Modifier.height(Spacing.sm))
            LazyRow(
                contentPadding = PaddingValues(horizontal = Spacing.md),
                horizontalArrangement = Arrangement.spacedBy(Spacing.md)
            ) {
                items(state.places, key = { it.id }) { place ->
                    val isSaved = state.savedPlaceIds.contains(place.id)
                    DestinationCard(
                        name = place.name,
                        category = place.category,
                        district = place.district,
                        imageUrl = place.images.firstOrNull()?.url,
                        rating = place.rating,
                        isSaved = isSaved,
                        onSaveToggle = { viewModel.toggleBookmark(place) },
                        onClick = { onPlaceClick(place.id) }
                    )
                }
            }
            Spacer(modifier = Modifier.height(Spacing.xl))
        }
    }
}

@Composable
fun QuickActionButton(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = modifier
            .height(76.dp)
            .clip(RoundedCornerShape(14.dp))
            .clickable { onClick() }
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(4.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = OchrePrimary,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = TextPrimary,
                fontWeight = FontWeight.Medium,
                maxLines = 1
            )
        }
    }
}

@Composable
fun AmbientWeatherBanner(
    tempCelsius: Double?,
    conditionText: String,
    isLive: Boolean,
    locationLabel: String,
    modifier: Modifier = Modifier
) {
    val strings = LocalAppStrings.current

    Surface(
        shape = RoundedCornerShape(16.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.padding(horizontal = Spacing.md, vertical = 12.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = CircleShape,
                    color = SunTempleGold.copy(alpha = 0.15f),
                    modifier = Modifier.size(36.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.WbSunny,
                            contentDescription = null,
                            tint = SunTempleGold,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.width(Spacing.sm))
                Column {
                    Text(
                        text = if (tempCelsius != null) "${"%.1f".format(tempCelsius)}°C • $conditionText" else conditionText,
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = locationLabel,
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                }
            }

            TruthBadge(
                label = if (isLive) strings.badgeLive else strings.badgeCurated,
                backgroundColor = if (isLive) SimilipalEmerald.copy(alpha = 0.2f) else DarkSurfaceVariant,
                contentColor = if (isLive) SimilipalEmerald else SunTempleGold
            )
        }
    }
}

@Composable
fun CuratedCircuitCard(
    onExploreClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val strings = LocalAppStrings.current

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable { onExploreClick() }
    ) {
        Column(modifier = Modifier.padding(Spacing.md)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                TruthBadge(
                    label = strings.curatedCircuitBadge,
                    backgroundColor = OchrePrimary.copy(alpha = 0.2f),
                    contentColor = OchreLight
                )
                Text(
                    text = strings.curatedCircuitStops,
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(Spacing.xs))
            Text(
                text = strings.curatedCircuitTitle,
                style = MaterialTheme.typography.titleLarge,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = strings.curatedCircuitSubtitle,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(Spacing.sm))
            Button(
                onClick = onExploreClick,
                colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth().height(42.dp)
            ) {
                Text(strings.curatedCircuitAction, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun RecentlyViewedChip(
    entity: RecentlyViewedEntity,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = modifier.clickable { onClick() }
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Place,
                contentDescription = null,
                tint = OchrePrimary,
                modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = entity.name,
                style = MaterialTheme.typography.labelMedium,
                color = TextPrimary
            )
        }
    }
}
