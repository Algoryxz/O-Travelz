package com.otravelz.android.feature.community

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

@Serializable
data class HometownRecommendationDraft(
    val id: String = UUID.randomUUID().toString().take(8),
    val destinationName: String,
    val district: String,
    val category: String,
    val description: String,
    val imageUrl: String = "",
    val contributorNotes: String = "",
    val createdAtMillis: Long = System.currentTimeMillis()
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CommunityStagingScreen(
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val json = remember { Json { ignoreUnknownKeys = true; isLenient = true } }
    val prefs = remember { context.getSharedPreferences("community_hometown_drafts", Context.MODE_PRIVATE) }

    var drafts by remember {
        mutableStateOf(
            try {
                val raw = prefs.getString("local_drafts_json", null)
                if (!raw.isNullOrBlank()) json.decodeFromString<List<HometownRecommendationDraft>>(raw)
                else emptyList()
            } catch (_: Exception) {
                emptyList()
            }
        )
    }

    fun saveDrafts(newDrafts: List<HometownRecommendationDraft>) {
        drafts = newDrafts
        try {
            prefs.edit().putString("local_drafts_json", json.encodeToString(newDrafts)).apply()
        } catch (_: Exception) {}
    }

    var isAddingDraft by remember { mutableStateOf(false) }
    var destinationName by remember { mutableStateOf("") }
    var district by remember { mutableStateOf("Khordha") }
    var category by remember { mutableStateOf("heritage") }
    var description by remember { mutableStateOf("") }
    var imageUrl by remember { mutableStateOf("") }
    var contributorNotes by remember { mutableStateOf("") }
    var validationError by remember { mutableStateOf<String?>(null) }

    val odishaDistricts = listOf(
        "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
        "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur",
        "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar",
        "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
        "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
    )

    val categories = listOf("heritage", "temple", "nature", "wildlife", "craft", "beach", "food")

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = Spacing.md, vertical = Spacing.sm)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                }
                Spacer(modifier = Modifier.width(Spacing.xs))
                Column {
                    Text(
                        text = "Hometown Staging",
                        style = MaterialTheme.typography.titleLarge,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Community Cultural Recommendations",
                        style = MaterialTheme.typography.bodySmall,
                        color = OchreLight
                    )
                }
            }

            IconButton(
                onClick = { isAddingDraft = !isAddingDraft },
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isAddingDraft) OchrePrimary else DarkSurfaceElevated)
            ) {
                Icon(
                    imageVector = if (isAddingDraft) Icons.Default.Close else Icons.Default.Add,
                    contentDescription = if (isAddingDraft) "Close" else "Add Draft",
                    tint = if (isAddingDraft) DarkBackground else OchrePrimary
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.xs))

        // Truthfulness Banner
        OTCard {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Info, contentDescription = null, tint = SunTempleGold)
                Spacer(modifier = Modifier.width(Spacing.sm))
                Column {
                    Text(
                        text = "Local Draft Staging Only",
                        style = MaterialTheme.typography.labelMedium,
                        color = SunTempleGold,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Drafts are stored strictly on this device. No remote staging API exists in backend schema.",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextMuted
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(Spacing.sm))

        if (isAddingDraft) {
            // New Recommendation Form
            OTCard {
                Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                    Text(
                        text = "New Hometown Place Draft",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )

                    OutlinedTextField(
                        value = destinationName,
                        onValueChange = { destinationName = it },
                        label = { Text("Destination Name *") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = OchrePrimary,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        singleLine = true
                    )

                    // District Selector Chips
                    Text(text = "District ($district)", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        odishaDistricts.forEach { dist ->
                            ContextChip(
                                label = dist,
                                isSelected = district == dist,
                                onClick = { district = dist }
                            )
                        }
                    }

                    // Category Selector Chips
                    Text(text = "Category ($category)", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        categories.forEach { cat ->
                            ContextChip(
                                label = cat.replaceFirstChar { it.uppercase() },
                                isSelected = category == cat,
                                onClick = { category = cat }
                            )
                        }
                    }

                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Cultural Description *") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = OchrePrimary,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        )
                    )

                    OutlinedTextField(
                        value = imageUrl,
                        onValueChange = { imageUrl = it },
                        label = { Text("Verified Image Reference URL (Optional)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = OchrePrimary,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = contributorNotes,
                        onValueChange = { contributorNotes = it },
                        label = { Text("Local Tips / Best Visiting Time (Optional)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = OchrePrimary,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        singleLine = true
                    )

                    if (validationError != null) {
                        Text(
                            text = validationError!!,
                            color = StatusError,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    Button(
                        onClick = {
                            if (destinationName.isBlank()) {
                                validationError = "Destination name is required."
                                return@Button
                            }
                            if (description.isBlank()) {
                                validationError = "Cultural description is required."
                                return@Button
                            }

                            val newDraft = HometownRecommendationDraft(
                                destinationName = destinationName.trim(),
                                district = district,
                                category = category,
                                description = description.trim(),
                                imageUrl = imageUrl.trim(),
                                contributorNotes = contributorNotes.trim()
                            )

                            saveDrafts(listOf(newDraft) + drafts)
                            // Reset form
                            destinationName = ""
                            description = ""
                            imageUrl = ""
                            contributorNotes = ""
                            validationError = null
                            isAddingDraft = false
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = OchrePrimary,
                            contentColor = DarkBackground
                        )
                    ) {
                        Text("Save Draft Locally", fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(Spacing.sm))
        }

        // List of Staged Local Drafts
        Text(
            text = "Locally Staged Recommendations (${drafts.size})",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(Spacing.xs))

        if (drafts.isEmpty()) {
            EmptyState(
                title = "No staged drafts",
                subtitle = "Share your hometown knowledge of hidden shrines, crafts, or scenic spots in Odisha."
            )
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(Spacing.sm)
            ) {
                items(drafts, key = { it.id }) { draft ->
                    OTCard {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    TruthBadge(
                                        label = "Draft saved locally",
                                        backgroundColor = DarkSurfaceVariant,
                                        contentColor = OchreLight
                                    )
                                }
                                IconButton(
                                    onClick = {
                                        saveDrafts(drafts.filter { it.id != draft.id })
                                    },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Delete,
                                        contentDescription = "Delete Draft",
                                        tint = TextMuted,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(Spacing.xs))

                            Text(
                                text = draft.destinationName,
                                style = MaterialTheme.typography.titleMedium,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )

                            Text(
                                text = "${draft.district} • ${draft.category.uppercase()}",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondary
                            )

                            Spacer(modifier = Modifier.height(Spacing.xs))

                            Text(
                                text = draft.description,
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextPrimary
                            )

                            if (draft.contributorNotes.isNotBlank()) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Tip: ${draft.contributorNotes}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = TealLight
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
