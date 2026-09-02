package com.otravelz.android.core.design

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.otravelz.android.core.network.ApiConfig

object CategoryVisualHelper {
    fun getCategoryGradient(category: String): Brush {
        val cat = category.lowercase().trim()
        return when {
            cat.contains("temple") || cat.contains("mandir") -> Brush.linearGradient(
                colors = listOf(Color(0xFF451A03), Color(0xFF78350F), Color(0xFF1E1B18))
            )
            cat.contains("nature") || cat.contains("wildlife") || cat.contains("forest") -> Brush.linearGradient(
                colors = listOf(Color(0xFF064E3B), Color(0xFF065F46), Color(0xFF0F291E))
            )
            cat.contains("beach") || cat.contains("lake") || cat.contains("water") -> Brush.linearGradient(
                colors = listOf(Color(0xFF0C4A6E), Color(0xFF075985), Color(0xFF082F49))
            )
            cat.contains("heritage") || cat.contains("monument") || cat.contains("fort") -> Brush.linearGradient(
                colors = listOf(Color(0xFF3B0764), Color(0xFF581C87), Color(0xFF2E1065))
            )
            cat.contains("food") || cat.contains("dining") || cat.contains("restaurant") -> Brush.linearGradient(
                colors = listOf(Color(0xFF7C2D12), Color(0xFF9A3412), Color(0xFF3B1308))
            )
            cat.contains("museum") || cat.contains("art") -> Brush.linearGradient(
                colors = listOf(Color(0xFF374151), Color(0xFF4B5563), Color(0xFF1F2937))
            )
            else -> Brush.linearGradient(
                colors = listOf(DarkSurfaceVariant, DarkSurfaceElevated, DarkBackground)
            )
        }
    }

    fun getCategoryIcon(category: String): ImageVector {
        val cat = category.lowercase().trim()
        return when {
            cat.contains("temple") || cat.contains("mandir") -> Icons.Default.AccountBalance
            cat.contains("nature") || cat.contains("forest") || cat.contains("park") -> Icons.Default.Park
            cat.contains("beach") || cat.contains("lake") || cat.contains("water") -> Icons.Default.Water
            cat.contains("wildlife") -> Icons.Default.Pets
            cat.contains("heritage") || cat.contains("monument") -> Icons.Default.Fort
            cat.contains("food") || cat.contains("dining") -> Icons.Default.Restaurant
            cat.contains("museum") || cat.contains("art") -> Icons.Default.Museum
            else -> Icons.Default.Landscape
        }
    }
}

@Composable
fun CategoryThemedPlaceholder(
    category: String,
    modifier: Modifier = Modifier
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.background(CategoryVisualHelper.getCategoryGradient(category))
    ) {
        Icon(
            imageVector = CategoryVisualHelper.getCategoryIcon(category),
            contentDescription = null,
            tint = TextMuted.copy(alpha = 0.35f),
            modifier = Modifier.size(44.dp)
        )
    }
}

@Composable
fun OTButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    variant: ButtonVariant = ButtonVariant.Primary,
    leadingIcon: ImageVector? = null
) {
    val colors = when (variant) {
        ButtonVariant.Primary -> ButtonDefaults.buttonColors(
            containerColor = OchrePrimary,
            contentColor = DarkBackground,
            disabledContainerColor = OchreDark.copy(alpha = 0.5f),
            disabledContentColor = DarkBackground.copy(alpha = 0.5f)
        )
        ButtonVariant.Secondary -> ButtonDefaults.buttonColors(
            containerColor = DarkSurfaceElevated,
            contentColor = TextPrimary,
            disabledContainerColor = DarkSurfaceVariant.copy(alpha = 0.5f),
            disabledContentColor = TextSecondary.copy(alpha = 0.5f)
        )
        ButtonVariant.Outline -> ButtonDefaults.outlinedButtonColors(
            contentColor = OchrePrimary,
            disabledContentColor = OchreDark.copy(alpha = 0.5f)
        )
    }

    Button(
        onClick = onClick,
        enabled = enabled,
        shape = RoundedCornerShape(12.dp),
        colors = colors,
        modifier = modifier.height(48.dp)
    ) {
        if (leadingIcon != null) {
            Icon(
                imageVector = leadingIcon,
                contentDescription = null,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(Spacing.xs))
        }
        Text(
            text = text,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold
        )
    }
}

enum class ButtonVariant { Primary, Secondary, Outline }

@Composable
fun OTCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = DarkSurfaceElevated,
    borderColor: Color = DarkBorder,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val cardModifier = if (onClick != null) {
        modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).clickable { onClick() }
    } else {
        modifier.fillMaxWidth()
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        border = androidx.compose.foundation.BorderStroke(1.dp, borderColor),
        modifier = cardModifier
    ) {
        Column(
            modifier = Modifier.padding(Spacing.md),
            content = content
        )
    }
}

@Composable
fun TruthBadge(
    label: String,
    modifier: Modifier = Modifier,
    backgroundColor: Color = DarkSurfaceVariant.copy(alpha = 0.85f),
    contentColor: Color = OchreLight
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(backgroundColor)
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = contentColor,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )
    }
}

@Composable
fun ContextChip(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    count: Int? = null
) {
    val animatedBg by animateColorAsState(
        targetValue = if (isSelected) OchrePrimary else DarkSurfaceElevated,
        animationSpec = tween(200),
        label = "chipBg"
    )
    val animatedContent by animateColorAsState(
        targetValue = if (isSelected) DarkBackground else TextSecondary,
        animationSpec = tween(200),
        label = "chipContent"
    )

    Surface(
        shape = RoundedCornerShape(20.dp),
        color = animatedBg,
        border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = modifier
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = ripple(bounded = true),
                onClick = onClick
            )
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = animatedContent,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
            }
            Text(
                text = label,
                style = MaterialTheme.typography.labelLarge,
                color = animatedContent,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
            )
            if (count != null && count > 0) {
                Spacer(modifier = Modifier.width(6.dp))
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(if (isSelected) DarkBackground.copy(alpha = 0.2f) else DarkSurfaceVariant)
                        .padding(horizontal = 6.dp, vertical = 1.dp)
                ) {
                    Text(
                        text = count.toString(),
                        style = MaterialTheme.typography.labelSmall,
                        color = animatedContent,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
fun DestinationCard(
    name: String,
    category: String,
    district: String?,
    imageUrl: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    rating: Double? = null,
    distanceKm: Double? = null,
    isSaved: Boolean = false,
    onSaveToggle: (() -> Unit)? = null
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceElevated),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = modifier
            .width(220.dp)
            .clip(RoundedCornerShape(16.dp))
            .clickable { onClick() }
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(136.dp)
            ) {
                val resolved = ApiConfig.resolveImageUrl(imageUrl)
                if (!resolved.isNullOrBlank()) {
                    AsyncImage(
                        model = resolved,
                        contentDescription = name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    CategoryThemedPlaceholder(
                        category = category,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                // Gradient Scrim
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, DarkSurfaceElevated.copy(alpha = 0.9f)),
                                startY = 60f
                            )
                        )
                )

                // Category Tag
                Box(
                    modifier = Modifier
                        .padding(8.dp)
                        .align(Alignment.TopStart)
                        .clip(RoundedCornerShape(6.dp))
                        .background(DarkBackground.copy(alpha = 0.85f))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = category.replace("_", " ").uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = OchreLight,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Bookmark Icon
                if (onSaveToggle != null) {
                    IconButton(
                        onClick = onSaveToggle,
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(4.dp)
                            .size(32.dp)
                            .background(DarkBackground.copy(alpha = 0.65f), CircleShape)
                    ) {
                        Icon(
                            imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                            contentDescription = "Save",
                            tint = if (isSaved) SunTempleGold else TextPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            Column(modifier = Modifier.padding(Spacing.sm)) {
                Text(
                    text = name,
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (!district.isNullOrBlank()) {
                        Text(
                            text = district,
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary,
                            maxLines = 1,
                            modifier = Modifier.weight(1f, fill = false)
                        )
                    }
                    if (distanceKm != null) {
                        Text(
                            text = "${"%.1f".format(distanceKm)} km",
                            style = MaterialTheme.typography.labelSmall,
                            color = TealLight,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MediaHero(
    title: String,
    subtitle: String,
    imageUrl: String?,
    modifier: Modifier = Modifier,
    showBrandLogo: Boolean = false,
    tagline: String? = null
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(240.dp)
            .clip(RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp))
            .background(DarkSurface)
    ) {
        val resolved = ApiConfig.resolveImageUrl(imageUrl)
        if (!resolved.isNullOrBlank()) {
            AsyncImage(
                model = resolved,
                contentDescription = title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        } else {
            CategoryThemedPlaceholder(
                category = title,
                modifier = Modifier.fillMaxSize()
            )
        }

        // Gradient Scrim
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, DarkBackground.copy(alpha = 0.85f), DarkBackground),
                        startY = 60f
                    )
                )
        )

        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(Spacing.md)
        ) {
            if (showBrandLogo) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = DarkSurfaceElevated.copy(alpha = 0.9f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SunTempleGold.copy(alpha = 0.4f)),
                        modifier = Modifier.size(38.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                painter = androidx.compose.ui.res.painterResource(id = com.otravelz.android.R.drawable.ic_otravelz_logo),
                                contentDescription = "O-TRAVELZ Logo Mark",
                                tint = Color.Unspecified,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }

                    Column {
                        Text(
                            text = title,
                            style = MaterialTheme.typography.titleLarge,
                            color = TextPrimary,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp
                        )
                        if (!tagline.isNullOrBlank()) {
                            Text(
                                text = tagline,
                                style = MaterialTheme.typography.labelSmall,
                                color = SunTempleGold,
                                fontWeight = FontWeight.SemiBold,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                }
            } else {
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )
        }
    }
}

@Composable
fun OTBrandedEmptyState(
    title: String,
    message: String,
    modifier: Modifier = Modifier,
    actionText: String? = null,
    onAction: (() -> Unit)? = null
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(Spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Surface(
            shape = CircleShape,
            color = DarkSurfaceElevated,
            border = androidx.compose.foundation.BorderStroke(1.dp, SunTempleGold.copy(alpha = 0.25f)),
            modifier = Modifier.size(60.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    painter = androidx.compose.ui.res.painterResource(id = com.otravelz.android.R.drawable.ic_otravelz_logo),
                    contentDescription = null,
                    tint = Color.Unspecified,
                    modifier = Modifier.size(36.dp)
                )
            }
        }
        Spacer(modifier = Modifier.height(Spacing.md))
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        Spacer(modifier = Modifier.height(Spacing.xs))
        Text(
            text = message,
            style = MaterialTheme.typography.bodySmall,
            color = TextMuted,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        if (actionText != null && onAction != null) {
            Spacer(modifier = Modifier.height(Spacing.md))
            OTButton(
                text = actionText,
                onClick = onAction,
                variant = ButtonVariant.Secondary
            )
        }
    }
}

@Composable
fun OfflineBanner(
    isOffline: Boolean,
    modifier: Modifier = Modifier,
    message: String = "Offline mode • Serving cached and bundled offline data",
    onRetry: (() -> Unit)? = null
) {
    AnimatedVisibility(
        visible = isOffline,
        modifier = modifier
    ) {
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(10.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.md, vertical = Spacing.xs)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = SunTempleGold,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = message,
                        style = MaterialTheme.typography.bodySmall,
                        color = TextPrimary
                    )
                }
                if (onRetry != null) {
                    TextButton(
                        onClick = onRetry,
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                        modifier = Modifier.height(28.dp)
                    ) {
                        Text("Retry", style = MaterialTheme.typography.labelSmall, color = SunTempleGold)
                    }
                }
            }
        }
    }
}

@Composable
fun LoadingState(
    modifier: Modifier = Modifier,
    message: String = "Loading verified destinations..."
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.padding(Spacing.xl)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            CircularProgressIndicator(
                color = OchrePrimary,
                modifier = Modifier.size(36.dp),
                strokeWidth = 3.dp
            )
            Spacer(modifier = Modifier.height(Spacing.md))
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )
        }
    }
}

@Composable
fun ErrorState(
    message: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.padding(Spacing.xl)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = StatusError,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(Spacing.md))
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary,
                modifier = Modifier.padding(horizontal = Spacing.lg)
            )
            Spacer(modifier = Modifier.height(Spacing.md))
            OTButton(
                text = "Retry",
                onClick = onRetry,
                variant = ButtonVariant.Secondary
            )
        }
    }
}

@Composable
fun EssentialChip(
    icon: ImageVector,
    label: String,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null
) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
        modifier = if (onClick != null) modifier.clip(RoundedCornerShape(10.dp)).clickable { onClick() } else modifier
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = OchrePrimary,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = TextPrimary,
                maxLines = 1
            )
        }
    }
}

@Composable
fun EmptyState(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    icon: ImageVector = Icons.Default.Info,
    actionText: String? = null,
    onAction: (() -> Unit)? = null
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier
            .fillMaxWidth()
            .padding(Spacing.xl)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = TextMuted,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(Spacing.sm))
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(Spacing.xs))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )
            if (actionText != null && onAction != null) {
                Spacer(modifier = Modifier.height(Spacing.md))
                OTButton(text = actionText, onClick = onAction)
            }
        }
    }
}
