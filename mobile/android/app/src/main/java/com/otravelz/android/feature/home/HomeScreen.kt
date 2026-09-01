package com.otravelz.android.feature.home

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.notifications.NotificationHelper
import java.util.Calendar

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onPlaceClick: (String) -> Unit,
    onExploreClick: () -> Unit,
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
        "nature" to "Nature & Hills",
        "beach" to "Beaches",
        "waterfall" to "Waterfalls",
        "monument" to "Heritage"
    )

    if (state.isLoading) {
        LoadingState(modifier = modifier.fillMaxSize(), message = "Connecting to O-TRAVELZ backend...")
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
        // Hero Section
        item {
            val heroImage = state.places.firstOrNull { it.images.isNotEmpty() }?.images?.firstOrNull()?.url
            MediaHero(
                title = "O-TRAVELZ",
                subtitle = "Explore the Soul of Incredible Odisha",
                imageUrl = heroImage
            )
        }

        // Time of Day Greeting & Weather Card
        item {
            Column(modifier = Modifier.padding(Spacing.md)) {
                Text(
                    text = greeting,
                    style = MaterialTheme.typography.titleMedium,
                    color = OchreLight
                )
                Spacer(modifier = Modifier.height(Spacing.xs))
                Text(
                    text = "Grounded Travel & Transit Companion",
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary
                )

                Spacer(modifier = Modifier.height(Spacing.md))

                // Weather Pill Card
                OTCard {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.WbSunny,
                                contentDescription = "Weather",
                                tint = OchrePrimary,
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(Spacing.sm))
                            Column {
                                val temp = state.weather?.current?.temperature
                                val condition = state.weather?.current?.condition
                                val weatherTitle = if (temp != null) {
                                    "${temp.toInt()}°C in ${state.weather?.locationName ?: "Bhubaneswar"}"
                                } else {
                                    "Weather temporarily unavailable"
                                }
                                val weatherSubtitle = if (condition != null && condition.isNotBlank()) {
                                    "$condition • Label: ${state.weather?.dataTier?.uppercase() ?: "LIVE"}"
                                } else {
                                    "Station data pending • Label: ESTIMATED"
                                }
                                Text(
                                    text = weatherTitle,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = TextPrimary
                                )
                                Text(
                                    text = weatherSubtitle,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextSecondary
                                )
                            }
                        }

                        // Local Notification Trigger Demo
                        IconButton(onClick = {
                            NotificationHelper.showLocalNotification(
                                context = context,
                                notificationId = 101,
                                title = "Welcome to Odisha",
                                message = "Mo Bus Route 10 and 11 available near Master Canteen.",
                                placeId = state.places.firstOrNull()?.id ?: "9b27a5dd-1d0a-5844-9fe3-d721289202c0"
                            )
                        }) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = "Test Notification",
                                tint = OchrePrimary
                            )
                        }
                    }
                }
            }
        }

        // Category Filter Chips
        item {
            Column(modifier = Modifier.padding(horizontal = Spacing.md)) {
                Text(
                    text = "Featured Experiences",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(Spacing.sm))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                    items(categories) { (catId, catLabel) ->
                        ContextChip(
                            label = catLabel,
                            isSelected = state.selectedCategory == catId,
                            onClick = { viewModel.selectCategory(catId) }
                        )
                    }
                }
            }
        }

        // Horizontal Destination Carousel
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
                        onClick = { onPlaceClick(place.id) }
                    )
                }
            }
            Spacer(modifier = Modifier.height(Spacing.xl))
        }
    }
}
