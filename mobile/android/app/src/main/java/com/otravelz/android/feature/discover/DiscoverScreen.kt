package com.otravelz.android.feature.discover

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.otravelz.android.core.design.*
import com.otravelz.android.data.model.PlaceDetailDto

@Composable
fun DiscoverScreen(
    places: List<PlaceDetailDto>,
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }

    val filtered = places.filter {
        searchQuery.isBlank() || it.name.contains(searchQuery, ignoreCase = true) || (it.district?.contains(searchQuery, ignoreCase = true) == true)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(Spacing.md)
    ) {
        Text(
            text = "Discover Destinations",
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary
        )
        Text(
            text = "${places.size} Verified Odisha Cultural & Natural Sites",
            style = MaterialTheme.typography.bodyMedium,
            color = OchreLight
        )

        Spacer(modifier = Modifier.height(Spacing.md))

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search by name, district, or temple...", color = TextMuted) },
            singleLine = true,
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

        Spacer(modifier = Modifier.height(Spacing.md))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            items(filtered) { place ->
                OTCard(onClick = { onPlaceClick(place.id) }) {
                    Row(modifier = Modifier.fillMaxWidth()) {
                        val img = place.images.firstOrNull()?.thumbnailUrl ?: place.images.firstOrNull()?.url
                        if (!img.isNullOrBlank()) {
                            AsyncImage(
                                model = img,
                                contentDescription = place.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .size(72.dp)
                                    .clip(RoundedCornerShape(8.dp))
                            )
                            Spacer(modifier = Modifier.width(Spacing.md))
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = place.name,
                                style = MaterialTheme.typography.titleMedium,
                                color = TextPrimary
                            )
                            Text(
                                text = "${place.district ?: "Odisha"} • ${place.category.replace("_", " ").capitalize()}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                            if (!place.description.isNullOrBlank()) {
                                Text(
                                    text = place.description,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextMuted,
                                    maxLines = 2
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
