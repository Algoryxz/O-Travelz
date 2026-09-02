package com.otravelz.android.core.design

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otravelz.android.core.error.AppError
import com.otravelz.android.core.error.AppErrorCode

/**
 * Unified error state component displaying contextual error cards
 * according to the canonical AppError taxonomy.
 */
@Composable
fun ErrorStateCard(
    error: AppError,
    modifier: Modifier = Modifier,
    onActionClick: (() -> Unit)? = null
) {
    val (icon, iconColor, borderColor) = when (error.code) {
        AppErrorCode.OFFLINE -> Triple(Icons.Default.CloudOff, OchrePrimary, OchrePrimary.copy(alpha = 0.4f))
        AppErrorCode.TIMEOUT -> Triple(Icons.Default.HourglassBottom, OchrePrimary, OchrePrimary.copy(alpha = 0.4f))
        AppErrorCode.SERVER_ERROR -> Triple(Icons.Default.Dns, StatusError, StatusError.copy(alpha = 0.4f))
        AppErrorCode.NOT_FOUND -> Triple(Icons.Default.SearchOff, TextMuted, DarkSurfaceBorder)
        AppErrorCode.RATE_LIMITED -> Triple(Icons.Default.Speed, OchrePrimary, OchrePrimary.copy(alpha = 0.4f))
        AppErrorCode.SERIALIZATION_ERROR -> Triple(Icons.Default.CodeOff, StatusError, StatusError.copy(alpha = 0.4f))
        AppErrorCode.AUTH_REQUIRED -> Triple(Icons.Default.Lock, OchrePrimary, OchrePrimary.copy(alpha = 0.4f))
        AppErrorCode.LOCATION_PERMISSION_DENIED -> Triple(Icons.Default.LocationOff, OchrePrimary, OchrePrimary.copy(alpha = 0.4f))
        AppErrorCode.GPS_UNAVAILABLE -> Triple(Icons.Default.GpsOff, OchrePrimary, OchrePrimary.copy(alpha = 0.4f))
        AppErrorCode.EMPTY_RESULTS -> Triple(Icons.Default.ExploreOff, TextMuted, DarkSurfaceBorder)
        AppErrorCode.WEATHER_UNAVAILABLE -> Triple(Icons.Default.WbCloudy, OchrePrimary, OchrePrimary.copy(alpha = 0.4f))
        AppErrorCode.MEDIA_UNAVAILABLE -> Triple(Icons.Default.VideocamOff, TextMuted, DarkSurfaceBorder)
        AppErrorCode.TRANSIT_DATA_UNAVAILABLE -> Triple(Icons.Default.DirectionsBus, OchrePrimary, OchrePrimary.copy(alpha = 0.4f))
        AppErrorCode.UNKNOWN -> Triple(Icons.Default.Warning, StatusError, StatusError.copy(alpha = 0.4f))
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = Spacing.sm)
            .border(1.dp, borderColor, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(Spacing.lg),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = error.title,
                tint = iconColor,
                modifier = Modifier.size(36.dp)
            )

            Spacer(modifier = Modifier.height(Spacing.sm))

            Text(
                text = error.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(Spacing.xs))

            Text(
                text = error.message,
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary,
                textAlign = TextAlign.Center
            )

            if (onActionClick != null && !error.actionLabel.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(Spacing.md))
                OTButton(
                    text = error.actionLabel,
                    onClick = onActionClick,
                    variant = ButtonVariant.Secondary,
                    modifier = Modifier.height(38.dp)
                )
            }
        }
    }
}

/**
 * Top-level offline banner showing transient connectivity fallback.
 */
@Composable
fun OfflineBanner(
    modifier: Modifier = Modifier,
    message: String = "Offline Mode — displaying local verified catalog",
    onRetry: (() -> Unit)? = null
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(DarkSurfaceElevated)
            .border(1.dp, OchrePrimary.copy(alpha = 0.3f))
            .padding(horizontal = Spacing.md, vertical = Spacing.xs),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f, fill = false)
        ) {
            Icon(
                imageVector = Icons.Default.CloudOff,
                contentDescription = "Offline",
                tint = OchrePrimary,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(Spacing.xs))
            Text(
                text = message,
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary,
                maxLines = 1
            )
        }

        if (onRetry != null) {
            TextButton(
                onClick = onRetry,
                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp),
                modifier = Modifier.height(28.dp)
            ) {
                Text(
                    text = "Retry",
                    style = MaterialTheme.typography.labelSmall,
                    color = OchrePrimary,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

/**
 * Generic empty state illustration card.
 */
@Composable
fun EmptyStateCard(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    icon: ImageVector = Icons.Default.ExploreOff,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(Spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = title,
            tint = TextMuted,
            modifier = Modifier.size(48.dp)
        )

        Spacer(modifier = Modifier.height(Spacing.md))

        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = TextPrimary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        Text(
            text = subtitle,
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary,
            textAlign = TextAlign.Center
        )

        if (actionLabel != null && onAction != null) {
            Spacer(modifier = Modifier.height(Spacing.lg))
            OTButton(
                text = actionLabel,
                onClick = onAction,
                variant = ButtonVariant.Secondary
            )
        }
    }
}

/**
 * Loading skeleton placeholder simulating card loading with subtle pulse.
 */
@Composable
fun LoadingSkeletonCard(
    modifier: Modifier = Modifier,
    height: Int = 180
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(height.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(DarkSurfaceElevated)
            .border(1.dp, DarkSurfaceBorder, RoundedCornerShape(16.dp))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(Spacing.md),
            verticalArrangement = Arrangement.Bottom
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.6f)
                    .height(18.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(DarkSurfaceVariant)
            )
            Spacer(modifier = Modifier.height(Spacing.xs))
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.4f)
                    .height(14.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(DarkSurfaceVariant.copy(alpha = 0.7f))
            )
        }
    }
}
