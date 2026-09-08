package com.otravelz.android.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.otravelz.android.R
import com.otravelz.android.domain.model.DiscoverPlace
import com.otravelz.android.ui.theme.Spacing
import com.otravelz.android.ui.theme.TruthVerifiedLight

/**
 * Production Place Card component adhering to ANDROID_A_ATLAS_MATERIAL.
 * Displays grounded canonical identity, verified image (or neutral cultural typography card),
 * Odia name, category, and district. Zero fake ratings or fake open status.
 */
@Composable
fun PlaceCard(
    place: DiscoverPlace,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainer
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            val photo = place.primaryPhoto
            if (photo != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(16f / 10f)
                        .background(MaterialTheme.colorScheme.surfaceContainerHigh)
                ) {
                    AsyncImage(
                        model = photo.resolvedCardUrl,
                        contentDescription = photo.altText ?: place.name,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )

                    // Distinct Photo Count Badge
                    if (place.verifiedPhotoCount > 0) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.BottomEnd)
                                .padding(Spacing.space3)
                                .background(
                                    MaterialTheme.colorScheme.surface.copy(alpha = 0.85f),
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(horizontal = Spacing.space3, vertical = Spacing.space1)
                        ) {
                            Text(
                                text = if (place.verifiedPhotoCount == 1) {
                                    stringResource(R.string.gallery_single_photo)
                                } else {
                                    stringResource(R.string.gallery_multiple_photos, place.verifiedPhotoCount)
                                },
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            } else {
                // Neutral cultural typography container for places undergoing photo verification
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(110.dp)
                        .background(MaterialTheme.colorScheme.surfaceContainerHigh)
                        .padding(Spacing.space5),
                    contentAlignment = Alignment.CenterStart
                ) {
                    Column {
                        Text(
                            text = place.category.replace('_', ' ').uppercase(),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(Spacing.space2))
                        Text(
                            text = place.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }

            // Card Body Information
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(Spacing.space5)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = place.category.replace('_', ' ').replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Medium
                    )

                    if (place.verificationStatus?.lowercase() == "verified") {
                        Text(
                            text = stringResource(R.string.badge_verified),
                            style = MaterialTheme.typography.labelSmall,
                            color = TruthVerifiedLight,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(Spacing.space2))

                // Primary Destination Name
                Text(
                    text = place.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                // Optional Canonical Odia Script Name
                if (!place.odiaName.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(Spacing.space1))
                    Text(
                        text = place.odiaName,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // District / Region
                val locationTag = listOfNotNull(place.district, place.region).joinToString(" • ")
                if (locationTag.isNotBlank()) {
                    Spacer(modifier = Modifier.height(Spacing.space2))
                    Text(
                        text = locationTag,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}
