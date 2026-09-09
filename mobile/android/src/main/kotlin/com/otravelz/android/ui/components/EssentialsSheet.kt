package com.otravelz.android.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.LocalPolice
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Atm
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.otravelz.android.R
import com.otravelz.android.domain.model.CivicCategory
import com.otravelz.android.domain.model.CivicServiceItem
import com.otravelz.android.domain.model.EmergencyHelpline
import com.otravelz.android.ui.theme.ChilikaBlueAccent
import com.otravelz.android.ui.theme.ForestGreenAccent
import com.otravelz.android.ui.theme.Spacing
import com.otravelz.android.ui.theme.TerracottaAccent

/**
 * Material 3 ModalBottomSheet displaying verified emergency helplines and nearby civic amenities.
 * Strictly adheres to android-intent-security with safe ACTION_DIAL and sanitized phone URIs.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EssentialsSheet(
    onDismissRequest: () -> Unit,
    helplines: List<EmergencyHelpline>,
    services: List<CivicServiceItem>,
    selectedCategory: CivicCategory,
    onCategorySelected: (CivicCategory) -> Unit,
    isLoading: Boolean = false,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var callConfirmTarget by remember { mutableStateOf<Pair<String, String>?>(null) } // Label to Number

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        modifier = modifier,
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.space4)
                .padding(bottom = Spacing.space6)
        ) {
            Text(
                text = stringResource(R.string.essentials_sheet_title),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = stringResource(R.string.essentials_sheet_subtitle),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(Spacing.space3))

            // Category filter chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(Spacing.space2),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(CivicCategory.entries) { category ->
                    val isSelected = selectedCategory == category
                    FilterChip(
                        selected = isSelected,
                        onClick = { onCategorySelected(category) },
                        label = { Text(category.displayName, style = MaterialTheme.typography.labelSmall) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = TerracottaAccent,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(Spacing.space3))

            if (isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressView()
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(Spacing.space2),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 420.dp)
                ) {
                    // Show emergency helplines when ALL or POLICE or HEALTHCARE is selected
                    if (selectedCategory == CivicCategory.ALL) {
                        item(key = "header_helplines") {
                            Text(
                                text = stringResource(R.string.essentials_state_helplines_title),
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = TerracottaAccent,
                                modifier = Modifier.padding(top = Spacing.space2, bottom = 4.dp)
                            )
                        }
                        items(helplines, key = { it.id }) { helpline ->
                            HelplineRowCard(
                                helpline = helpline,
                                onDialClick = { callConfirmTarget = helpline.label to helpline.number }
                            )
                        }

                        item(key = "header_services") {
                            Text(
                                text = stringResource(R.string.essentials_nearby_facilities_title),
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.padding(top = Spacing.space3, bottom = 4.dp)
                            )
                        }
                    }

                    if (services.isEmpty() && selectedCategory != CivicCategory.ALL) {
                        item(key = "empty_services") {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = Spacing.space6),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = stringResource(R.string.essentials_empty_services),
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }

                    items(services, key = { it.id }) { service ->
                        CivicServiceRowCard(
                            service = service,
                            onDialClick = {
                                service.phone?.let { p ->
                                    callConfirmTarget = service.name to p
                                }
                            }
                        )
                    }
                }
            }
        }
    }

    // Confirmation dialog before launching system dialer
    if (callConfirmTarget != null) {
        val (name, number) = callConfirmTarget!!
        AlertDialog(
            onDismissRequest = { callConfirmTarget = null },
            title = { Text(stringResource(R.string.essentials_dial_confirm_title)) },
            text = {
                Text(stringResource(R.string.essentials_dial_confirm_msg, name, number))
            },
            confirmButton = {
                Button(
                    onClick = {
                        launchSafeDialer(context, number)
                        callConfirmTarget = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = ForestGreenAccent)
                ) {
                    Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(stringResource(R.string.essentials_action_dial))
                }
            },
            dismissButton = {
                TextButton(onClick = { callConfirmTarget = null }) {
                    Text(stringResource(R.string.transit_action_close))
                }
            }
        )
    }
}

@Composable
private fun HelplineRowCard(
    helpline: EmergencyHelpline,
    onDialClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(horizontal = Spacing.space3, vertical = Spacing.space2),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = helpline.label,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    if (helpline.is24x7) {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = ForestGreenAccent.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "24x7",
                                style = MaterialTheme.typography.labelSmall,
                                color = ForestGreenAccent,
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
                Text(
                    text = helpline.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Button(
                onClick = onDialClick,
                colors = ButtonDefaults.buttonColors(containerColor = TerracottaAccent),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(helpline.number, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun CivicServiceRowCard(
    service: CivicServiceItem,
    onDialClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(Spacing.space3),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(Spacing.space2),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = getCategoryIcon(service.category),
                    contentDescription = null,
                    tint = TerracottaAccent,
                    modifier = Modifier.size(22.dp)
                )
                Column {
                    Text(
                        text = service.name,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = service.address.ifEmpty { service.category.displayName },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (service.distanceFormatted.isNotEmpty()) {
                        Text(
                            text = service.distanceFormatted,
                            style = MaterialTheme.typography.labelSmall,
                            color = ChilikaBlueAccent
                        )
                    }
                }
            }

            if (!service.phone.isNullOrBlank()) {
                IconButton(onClick = onDialClick) {
                    Icon(
                        Icons.Default.Call,
                        contentDescription = stringResource(R.string.essentials_action_dial),
                        tint = ForestGreenAccent
                    )
                }
            }
        }
    }
}

private fun getCategoryIcon(category: CivicCategory): ImageVector {
    return when (category) {
        CivicCategory.HEALTHCARE -> Icons.Default.LocalHospital
        CivicCategory.POLICE -> Icons.Default.LocalPolice
        CivicCategory.FUEL -> Icons.Default.LocalGasStation
        CivicCategory.ATM -> Icons.Default.Atm
        CivicCategory.TRANSIT -> Icons.Default.DirectionsBus
        CivicCategory.ALL -> Icons.Default.LocalHospital
    }
}

@Composable
private fun CircularProgressView() {
    CircularProgressIndicator(
        color = TerracottaAccent,
        modifier = Modifier.size(36.dp),
        strokeWidth = 3.dp
    )
}

/**
 * Launches the system dialer with a sanitized phone URI.
 * Strictly uses Intent.ACTION_DIAL to avoid requiring CALL_PHONE permission.
 */
fun launchSafeDialer(context: Context, rawNumber: String) {
    val sanitized = rawNumber.filter { it.isDigit() || it == '+' }
    if (sanitized.isNotEmpty()) {
        val dialIntent = Intent(Intent.ACTION_DIAL).apply {
            data = Uri.parse("tel:$sanitized")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        try {
            context.startActivity(dialIntent)
        } catch (_: Exception) {
            // Gracefully handled if no dialer is installed
        }
    }
}
