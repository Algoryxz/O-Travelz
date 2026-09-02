package com.otravelz.android.feature.civic

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocalAtm
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocalPolice
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otravelz.android.core.design.*
import com.otravelz.android.data.repository.CivicCategory
import com.otravelz.android.data.repository.CivicEssentialItem
import com.otravelz.android.data.repository.CivicEssentialsRepository

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CivicEssentialsSheet(
    initialCategory: CivicCategory = CivicCategory.HOSPITAL,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val repository = remember { CivicEssentialsRepository() }
    var selectedCategory by remember { mutableStateOf(initialCategory) }

    // Reference origin: Bhubaneswar (20.2961, 85.8245)
    val itemsWithDistance = remember(selectedCategory) {
        repository.getItemsSortedByDistance(
            category = selectedCategory,
            originLat = 20.2961,
            originLon = 85.8245
        )
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = DarkSurface,
        dragHandle = { BottomSheetDefaults.DragHandle(color = TextMuted) },
        modifier = modifier
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.md)
                .padding(bottom = Spacing.xl)
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    Text(
                        text = "Civic & Emergency Essentials",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Verified Odisha emergency and civic contacts",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextMuted
                    )
                }

                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = TextMuted
                    )
                }
            }

            Spacer(modifier = Modifier.height(Spacing.sm))

            // Category Selector Chips
            Row(
                horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
                modifier = Modifier.fillMaxWidth()
            ) {
                CivicCategory.entries.forEach { cat ->
                    val isSelected = cat == selectedCategory
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isSelected) OchrePrimary else DarkSurfaceElevated,
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isSelected) OchrePrimary else DarkBorder
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedCategory = cat }
                    ) {
                        Text(
                            text = when (cat) {
                                CivicCategory.HOSPITAL -> "Hospital"
                                CivicCategory.POLICE -> "Police"
                                CivicCategory.FUEL -> "Fuel"
                                CivicCategory.ATM -> "ATM"
                            },
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) DarkBackground else TextSecondary,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(Spacing.sm))

            // Truthfulness notice
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = DarkBackground,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Distances are straight-line estimates from Bhubaneswar reference point.",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(Spacing.sm))

            // Items List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(Spacing.sm),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(itemsWithDistance) { (item, distKm) ->
                    CivicItemCard(
                        item = item,
                        distKm = distKm,
                        onCall = {
                            if (!item.phoneNumber.isNullOrBlank()) {
                                val intent = Intent(Intent.ACTION_DIAL).apply {
                                    data = Uri.parse("tel:${item.phoneNumber}")
                                }
                                context.startActivity(intent)
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun CivicItemCard(
    item: CivicEssentialItem,
    distKm: Double,
    onCall: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = DarkSurfaceElevated,
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(Spacing.sm)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(
                        when (item.category) {
                            CivicCategory.HOSPITAL -> StatusError.copy(alpha = 0.15f)
                            CivicCategory.POLICE -> TealSecondary.copy(alpha = 0.15f)
                            CivicCategory.FUEL -> SunTempleGold.copy(alpha = 0.15f)
                            CivicCategory.ATM -> SimilipalEmerald.copy(alpha = 0.15f)
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when (item.category) {
                        CivicCategory.HOSPITAL -> Icons.Default.LocalHospital
                        CivicCategory.POLICE -> Icons.Default.LocalPolice
                        CivicCategory.FUEL -> Icons.Default.LocalGasStation
                        CivicCategory.ATM -> Icons.Default.LocalAtm
                    },
                    contentDescription = null,
                    tint = when (item.category) {
                        CivicCategory.HOSPITAL -> StatusError
                        CivicCategory.POLICE -> TealSecondary
                        CivicCategory.FUEL -> SunTempleGold
                        CivicCategory.ATM -> SimilipalEmerald
                    },
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(Spacing.sm))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "${item.district} • ${"%.1f".format(distKm)} km straight-line",
                    style = MaterialTheme.typography.labelSmall,
                    color = OchrePrimary
                )
                Text(
                    text = item.address,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextMuted,
                    maxLines = 1
                )
            }

            if (!item.phoneNumber.isNullOrBlank()) {
                IconButton(
                    onClick = onCall,
                    modifier = Modifier
                        .size(36.dp)
                        .background(SimilipalEmerald.copy(alpha = 0.2f), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = "Call",
                        tint = SimilipalEmerald,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}
