package com.otravelz.android.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.otravelz.android.R
import com.otravelz.android.data.network.ApiConfig
import com.otravelz.android.data.repository.EssentialsRepository
import com.otravelz.android.domain.model.ArtisanCluster
import com.otravelz.android.ui.theme.*

/**
 * Dedicated editorial screen for Odisha's Living Heritage & Artisan Traditions.
 * Elevates Odisha's 12 craft traditions, GI-tagged enclaves, and master weavers
 * with authentic photography, cultural provenance, and destination links.
 * 
 * Truth Invariants:
 * - Strictly distinguishes GI products and artisan clusters from commercial listings.
 * - Zero fake ratings, reviews, inventory, prices, or store hours.
 * - Sourced directly from verified canonical cultural research.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LivingHeritageScreen(
    onBack: () -> Unit,
    onPlaceClick: (String) -> Unit,
    modifier: Modifier = Modifier,
    repository: EssentialsRepository = remember { EssentialsRepository.getInstance() }
) {
    val clusters = remember { repository.getArtisanClusters() }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Living Heritage of Odisha",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Craft Enclaves & GI Traditions",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.action_back)
                        )
                    }
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
            // Editorial Header Card
            item(key = "living_heritage_intro") {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceContainer
                    ),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(Spacing.space4),
                        verticalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = TerracottaAccent.copy(alpha = 0.15f),
                                modifier = Modifier.size(36.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        Icons.Default.Palette,
                                        contentDescription = null,
                                        tint = TerracottaAccent,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                            Column {
                                Text(
                                    text = "Centuries of Living Craft",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Odisha Cultural Provenance",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Text(
                            text = "Odisha's living heritage lives not just in stone temples, but in unbroken lineages of master craftspeople. From Pattachitra painters of Raghurajpur to Tarakasi silversmiths of Cuttack, explore canonical craft traditions recognized under national and international Geographical Indication (GI) registries.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = MaterialTheme.typography.bodySmall.lineHeight * 1.25f
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = TerracottaAccent.copy(alpha = 0.12f)
                            ) {
                                Text(
                                    text = "${clusters.count { it.giTagged }} GI Tagged Traditions",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = TerracottaAccent,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }

                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = ChilikaBlueAccent.copy(alpha = 0.12f)
                            ) {
                                Text(
                                    text = "${clusters.size} Canonical Clusters",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = ChilikaBlueAccent,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Cluster Cards Feed
            items(clusters, key = { it.id }) { cluster ->
                LivingHeritageClusterCard(
                    cluster = cluster,
                    onExploreClick = {
                        cluster.canonicalPlaceId?.let { pid ->
                            onPlaceClick(pid)
                        }
                    }
                )
            }

            // Provenance Footer
            item(key = "living_heritage_footer") {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = Spacing.space3),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Verified under Algoryxz Cultural Atlas Documentation Protocol",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun LivingHeritageClusterCard(
    cluster: ArtisanCluster,
    onExploreClick: () -> Unit
) {
    val imageUrl = remember(cluster.heroImageUrl) {
        cluster.heroImageUrl?.let { raw ->
            if (raw.startsWith("http://") || raw.startsWith("https://")) raw
            else "${ApiConfig.DEFAULT_BASE_URL.trimEnd('/')}/${raw.trimStart('/')}"
        }
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = cluster.canonicalPlaceId != null, onClick = onExploreClick)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Optional authentic photo
            if (imageUrl != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                        .background(MaterialTheme.colorScheme.surfaceContainerHigh)
                ) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = "${cluster.craftName} - ${cluster.name}",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )

                    // Overlay GI tag badge if applicable
                    if (cluster.giTagged) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.92f),
                            border = BorderStroke(1.dp, TerracottaAccent.copy(alpha = 0.5f)),
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(10.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    Icons.Default.Verified,
                                    contentDescription = null,
                                    tint = TerracottaAccent,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = "GI TAGGED",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = TerracottaAccent
                                )
                            }
                        }
                    }
                }
            }

            Column(
                modifier = Modifier.padding(Spacing.space4),
                verticalArrangement = Arrangement.spacedBy(Spacing.space2)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = cluster.craftName,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = ChilikaBlueAccent
                        )
                        Text(
                            text = cluster.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (cluster.odiaName.isNotBlank()) {
                            Text(
                                text = cluster.odiaName,
                                style = MaterialTheme.typography.bodySmall,
                                color = TerracottaAccent,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceContainerHigh,
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
                    ) {
                        Text(
                            text = cluster.district,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }

                Text(
                    text = cluster.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = MaterialTheme.typography.bodySmall.lineHeight * 1.3f
                )

                if (cluster.canonicalPlaceId != null) {
                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = Spacing.space1),
                        color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Explore in Cultural Atlas",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = TerracottaAccent
                        )
                        Icon(
                            Icons.Default.ChevronRight,
                            contentDescription = null,
                            tint = TerracottaAccent,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}
