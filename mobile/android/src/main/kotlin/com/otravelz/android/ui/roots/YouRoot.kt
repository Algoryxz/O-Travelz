package com.otravelz.android.ui.roots

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.otravelz.android.R
import com.otravelz.android.domain.model.ArtisanCluster
import com.otravelz.android.domain.model.CivicCategory
import com.otravelz.android.domain.model.EmergencyHelpline
import com.otravelz.android.navigation.NavDestination
import com.otravelz.android.ui.components.EssentialsSheet
import com.otravelz.android.ui.components.launchSafeDialer
import com.otravelz.android.ui.screens.EssentialsViewModel
import com.otravelz.android.ui.theme.ChilikaBlueAccent
import com.otravelz.android.ui.theme.ForestGreenAccent
import com.otravelz.android.ui.theme.Spacing
import com.otravelz.android.ui.theme.TerracottaAccent

/**
 * Structural container for You root in Wave M15.
 * Contains:
 * 1. Emergency Helplines quick card with safe system dialer launcher
 * 2. Nearby Civic Facilities launcher opening EssentialsSheet
 * 3. Living Heritage & Artisan Clusters with GI-tagged craft histories
 * 4. App Preferences, Offline Storage footprint, and Platform Truth Transparency
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun YouRoot(
    onPlaceClick: (String) -> Unit = {},
    modifier: Modifier = Modifier,
    viewModel: EssentialsViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var showEssentialsSheet by remember { mutableStateOf(false) }
    var callConfirmTarget by remember { mutableStateOf<Pair<String, String>?>(null) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(NavDestination.YOU.titleRes),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.surface),
            contentPadding = PaddingValues(Spacing.space4),
            verticalArrangement = Arrangement.spacedBy(Spacing.space4)
        ) {
            // ==========================================
            // SECTION 1: EMERGENCY HELPLINES QUICK CARD
            // ==========================================
            item(key = "section_emergency_header") {
                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        Icon(
                            imageVector = Icons.Default.HealthAndSafety,
                            contentDescription = null,
                            tint = TerracottaAccent,
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = stringResource(R.string.you_section_emergency),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Text(
                        text = stringResource(R.string.you_section_emergency_desc),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            item(key = "section_emergency_card") {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.2f)),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(Spacing.space3),
                        verticalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        val quickHelplines = uiState.helplines.take(3)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                        ) {
                            quickHelplines.forEach { helpline ->
                                Button(
                                    onClick = { callConfirmTarget = helpline.label to helpline.number },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (helpline.number == "112") MaterialTheme.colorScheme.error else TerracottaAccent
                                    ),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.weight(1f),
                                    contentPadding = PaddingValues(horizontal = 6.dp, vertical = 6.dp)
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text(
                                            text = helpline.number,
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = helpline.label.substringBefore(" "),
                                            style = MaterialTheme.typography.labelSmall,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                }
                            }
                        }

                        Text(
                            text = "Calls use your device dialer with sanitized numbers. Zero background permissions.",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // ==========================================
            // SECTION 2: NEARBY CIVIC FACILITIES LAUNCHER
            // ==========================================
            item(key = "section_civic_facilities_launcher") {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            viewModel.loadServicesForCoordinates(uiState.centerLat, uiState.centerLon)
                            showEssentialsSheet = true
                        }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(Spacing.space3),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(Spacing.space3),
                            modifier = Modifier.weight(1f)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                                modifier = Modifier.size(40.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = Icons.Default.LocalHospital,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(22.dp)
                                    )
                                }
                            }

                            Column {
                                Text(
                                    text = stringResource(R.string.you_action_view_nearby_civic),
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Verified district hospitals, police stations, fuel & ATMs",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Icon(
                            imageVector = Icons.Default.ChevronRight,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // ==========================================
            // SECTION 3: LIVING HERITAGE & ARTISAN CLUSTERS
            // ==========================================
            item(key = "section_artisan_header") {
                Column(modifier = Modifier.padding(top = Spacing.space2)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Palette,
                            contentDescription = null,
                            tint = ChilikaBlueAccent,
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = stringResource(R.string.you_section_artisan_clusters),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Text(
                        text = stringResource(R.string.you_section_artisan_clusters_desc),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            items(uiState.artisanClusters, key = { it.id }) { cluster ->
                ArtisanClusterCard(
                    cluster = cluster,
                    onClick = {
                        cluster.canonicalPlaceId?.let { pid ->
                            onPlaceClick(pid)
                        }
                    }
                )
            }

            // ==========================================
            // SECTION 4: PREFERENCES & TRANSPARENCY
            // ==========================================
            item(key = "section_preferences_header") {
                Column(modifier = Modifier.padding(top = Spacing.space2)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = ForestGreenAccent,
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = stringResource(R.string.you_section_preferences),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            item(key = "pref_language") {
                PreferenceRow(
                    title = stringResource(R.string.you_pref_language_title),
                    subtitle = stringResource(R.string.you_pref_language_value)
                )
            }

            item(key = "pref_offline") {
                PreferenceRow(
                    title = stringResource(R.string.you_pref_offline_title),
                    subtitle = stringResource(R.string.you_pref_offline_desc)
                )
            }

            item(key = "pref_trust") {
                PreferenceRow(
                    title = stringResource(R.string.you_pref_trust_title),
                    subtitle = stringResource(R.string.you_pref_trust_desc)
                )
            }

            item(key = "app_provenance_footer") {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = Spacing.space4),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "O-TRAVELZ V4 • Modern Odisha Cultural Atlas",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Built by Algoryxz with verified data and zero hallucinated transit telemetry.",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.outlineVariant
                        )
                    }
                }
            }
        }
    }

    // Modal sheet for civic facilities
    if (showEssentialsSheet) {
        EssentialsSheet(
            onDismissRequest = { showEssentialsSheet = false },
            helplines = uiState.helplines,
            services = uiState.nearbyServices,
            selectedCategory = uiState.selectedCategory,
            onCategorySelected = { cat -> viewModel.selectCategory(cat) },
            isLoading = uiState.isLoadingServices
        )
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
private fun ArtisanClusterCard(
    cluster: ArtisanCluster,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier.padding(Spacing.space3),
            verticalArrangement = Arrangement.spacedBy(Spacing.space1)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = cluster.name,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "${cluster.craftName} • ${cluster.district}",
                        style = MaterialTheme.typography.labelSmall,
                        color = ChilikaBlueAccent,
                        fontWeight = FontWeight.Medium
                    )
                }

                if (cluster.giTagged) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = TerracottaAccent.copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, TerracottaAccent.copy(alpha = 0.4f))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(3.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Verified,
                                contentDescription = null,
                                tint = TerracottaAccent,
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = "GI Tag",
                                style = MaterialTheme.typography.labelSmall,
                                color = TerracottaAccent,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = cluster.description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            if (cluster.canonicalPlaceId != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Explore Destination",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.SemiBold
                    )
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun PreferenceRow(
    title: String,
    subtitle: String
) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.25f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(Spacing.space3)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
