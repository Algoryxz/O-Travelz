package com.otravelz.android.core.ui.place

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.otravelz.android.core.design.*
import com.otravelz.android.core.network.ApiConfig
import com.otravelz.android.data.model.PlaceDetailDto

@Composable
fun PlaceHero(
    place: PlaceDetailDto,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val imageUrl = ApiConfig.resolveImageUrl(place.images.firstOrNull()?.url)

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(260.dp)
            .background(DarkSurfaceVariant)
    ) {
        if (!imageUrl.isNullOrBlank()) {
            AsyncImage(
                model = imageUrl,
                contentDescription = place.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        } else {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.fillMaxSize()
            ) {
                Icon(
                    imageVector = Icons.Default.Landscape,
                    contentDescription = null,
                    tint = TextMuted,
                    modifier = Modifier.size(56.dp)
                )
            }
        }

        // Gradient Scrim
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            DarkBackground.copy(alpha = 0.6f),
                            Color.Transparent,
                            DarkBackground.copy(alpha = 0.95f)
                        )
                    )
                )
        )

        // Top Navigation Bar (Back Arrow)
        IconButton(
            onClick = onBack,
            modifier = Modifier
                .padding(Spacing.md)
                .align(Alignment.TopStart)
                .size(40.dp)
                .background(DarkBackground.copy(alpha = 0.7f), CircleShape)
        ) {
            Icon(
                imageVector = Icons.Default.ArrowBack,
                contentDescription = "Back",
                tint = TextPrimary
            )
        }
    }
}

@Composable
fun PlaceIdentity(
    place: PlaceDetailDto,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = OchrePrimary.copy(alpha = 0.9f)
                ) {
                    Text(
                        text = place.category.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = DarkBackground,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
                if (!place.district.isNullOrBlank()) {
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = DarkSurfaceElevated
                    ) {
                        Text(
                            text = place.district ?: "",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextPrimary,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            TruthBadge(
                label = "VERIFIED CANONICAL",
                backgroundColor = SimilipalEmerald.copy(alpha = 0.2f),
                contentColor = SimilipalEmerald
            )
        }

        Spacer(modifier = Modifier.height(Spacing.xs))
        Text(
            text = place.name,
            style = MaterialTheme.typography.headlineLarge,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )

        if (place.rating != null) {
            Spacer(modifier = Modifier.height(2.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = null,
                    tint = SunTempleGold,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "%.1f".format(place.rating),
                    style = MaterialTheme.typography.labelMedium,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                if (place.ratingCount != null) {
                    Text(
                        text = " (${place.ratingCount} reviews)",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextMuted
                    )
                }
            }
        }
    }
}

@Composable
fun PlaceActionBar(
    isSaved: Boolean,
    onSaveToggle: () -> Unit,
    onPlanAdd: () -> Unit,
    onShare: () -> Unit,
    onRemind: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier.fillMaxWidth()
    ) {
        Button(
            onClick = onPlanAdd,
            colors = ButtonDefaults.buttonColors(containerColor = OchrePrimary, contentColor = DarkBackground),
            shape = RoundedCornerShape(12.dp),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 10.dp),
            modifier = Modifier.weight(1.2f)
        ) {
            Icon(Icons.Default.Route, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text("Plan Visit", fontWeight = FontWeight.Bold, maxLines = 1)
        }

        OutlinedButton(
            onClick = onSaveToggle,
            shape = RoundedCornerShape(12.dp),
            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 10.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = if (isSaved) SunTempleGold else TextPrimary
            ),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (isSaved) SunTempleGold else DarkBorderSubtle
            ),
            modifier = Modifier.weight(1f)
        ) {
            Icon(
                imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                contentDescription = null,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(if (isSaved) "Saved" else "Save", maxLines = 1)
        }

        IconButton(
            onClick = onShare,
            modifier = Modifier
                .size(42.dp)
                .background(DarkSurfaceElevated, RoundedCornerShape(12.dp))
                .border(1.dp, DarkBorderSubtle, RoundedCornerShape(12.dp))
        ) {
            Icon(Icons.Default.Share, contentDescription = "Share", tint = TextSecondary, modifier = Modifier.size(18.dp))
        }

        IconButton(
            onClick = onRemind,
            modifier = Modifier
                .size(42.dp)
                .background(DarkSurfaceElevated, RoundedCornerShape(12.dp))
                .border(1.dp, DarkBorderSubtle, RoundedCornerShape(12.dp))
        ) {
            Icon(Icons.Default.Notifications, contentDescription = "Remind", tint = SunTempleGold, modifier = Modifier.size(18.dp))
        }
    }
}

@Composable
fun PlaceVisitInfo(
    place: PlaceDetailDto,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(Spacing.md)) {
            Text(
                text = "Visit Essentials",
                style = MaterialTheme.typography.titleMedium,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(Spacing.sm))

            // Duration & Price Row
            Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                if (place.avgVisitMinutes != null) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(DarkSurfaceVariant)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Default.Schedule, contentDescription = null, tint = TextMuted, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "~${place.avgVisitMinutes} mins visit",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }

                if (!place.priceTier.isNullOrBlank()) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(DarkSurfaceVariant)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = place.priceTier.uppercase(),
                            style = MaterialTheme.typography.labelSmall,
                            color = TealSecondary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // Coordinates
            if (place.lat != null && place.lon != null) {
                Spacer(modifier = Modifier.height(Spacing.sm))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = OchrePrimary, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Lat: ${"%.4f".format(place.lat)}, Lon: ${"%.4f".format(place.lon)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                }
            }
        }
    }
}

@Composable
fun PlaceTransportCard(
    place: PlaceDetailDto,
    onNavigateTransit: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(Spacing.md)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.DirectionsBus, contentDescription = null, tint = RaghurajpurTerracotta, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Getting There",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }
                TruthBadge(label = "SCHEDULED", backgroundColor = DarkSurfaceVariant, contentColor = SunTempleGold)
            }

            Spacer(modifier = Modifier.height(Spacing.xs))
            Text(
                text = "Connected via Mo Bus & Ama Bus regional network. Timetables available at Master Canteen, Kalpana Square, and Baramunda ISBT.",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(Spacing.sm))
            // First-Mile walking indicator
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = DarkSurfaceVariant
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Icon(Icons.Default.DirectionsWalk, contentDescription = null, tint = TextMuted, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "First-mile: Walk / short auto to nearest stop",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextSecondary
                    )
                }
            }
        }
    }
}
