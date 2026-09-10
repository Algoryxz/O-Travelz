package com.otravelz.android.ui.roots

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Login
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.otravelz.android.R
import com.otravelz.android.auth.AuthState
import com.otravelz.android.auth.AuthViewModel
import com.otravelz.android.navigation.NavDestination
import com.otravelz.android.ui.components.EssentialsSheet
import com.otravelz.android.ui.components.launchSafeDialer
import com.otravelz.android.ui.screens.EssentialsViewModel
import com.otravelz.android.ui.theme.*

/**
 * Redesigned "You" Personal Control Center for O-TRAVELZ Mobile V4.
 *
 * Reorganizes the previously cramped screen into a tranquil, spacious personal hub:
 * 1. Account & Identity Summary Card (Guest / Signed-in)
 * 2. High-Visibility Compact Emergency SOS Shortcut
 * 3. Your O-TRAVELZ (Living Heritage handoff, Saved Content)
 * 4. Travel Tools (Civic Facilities directory, Offline Storage footprint)
 * 5. Preferences (Bilingual Language, Appearance, Reminders)
 * 6. About O-TRAVELZ & Algoryxz Attribution
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun YouRoot(
    onPlaceClick: (String) -> Unit = {},
    onLivingHeritageClick: () -> Unit = {},
    modifier: Modifier = Modifier,
    viewModel: EssentialsViewModel = viewModel(),
    authViewModel: AuthViewModel = viewModel(factory = AuthViewModel.provideFactory(LocalContext.current))
) {
    val uiState by viewModel.uiState.collectAsState()
    val authState by authViewModel.authState.collectAsState()
    val context = LocalContext.current

    var showEssentialsSheet by remember { mutableStateOf(false) }
    var callConfirmTarget by remember { mutableStateOf<Pair<String, String>?>(null) }
    var showAboutDialog by remember { mutableStateOf(false) }

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
            contentPadding = PaddingValues(horizontal = Spacing.space4, vertical = Spacing.space2),
            verticalArrangement = Arrangement.spacedBy(Spacing.space4)
        ) {
            // ==========================================
            // 1. ACCOUNT & IDENTITY
            // ==========================================
            item(key = "you_account_summary") {
                AccountSummaryCard(
                    authState = authState,
                    authViewModel = authViewModel
                )
            }

            // ==========================================
            // 2. COMPACT EMERGENCY SOS SHORTCUT
            // ==========================================
            item(key = "you_emergency_shortcut") {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.15f)
                    ),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.35f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(Spacing.space3),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(36.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        Icons.Default.HealthAndSafety,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }

                            Column {
                                Text(
                                    text = "Emergency Quick Dial",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "National SOS (112) • Ambulance (108) • Police (100)",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            FilledTonalButton(
                                onClick = { callConfirmTarget = "National Emergency" to "112" },
                                colors = ButtonDefaults.filledTonalButtonColors(
                                    containerColor = MaterialTheme.colorScheme.error,
                                    contentColor = Color.White
                                ),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("112 SOS", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                            }

                            OutlinedIconButton(
                                onClick = {
                                    viewModel.loadServicesForCoordinates(uiState.centerLat, uiState.centerLon)
                                    showEssentialsSheet = true
                                },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(Icons.Default.LocalHospital, contentDescription = "More Essentials", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }
            }

            // ==========================================
            // 3. YOUR O-TRAVELZ
            // ==========================================
            item(key = "section_your_otravelz_header") {
                Text(
                    text = "Your O-TRAVELZ",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(top = Spacing.space1)
                )
            }

            item(key = "you_living_heritage_card") {
                YouMenuCard(
                    title = "Odisha Living Heritage",
                    subtitle = "Explore 12 craft traditions, GI enclaves & master weavers",
                    icon = Icons.Default.Palette,
                    accentColor = TerracottaAccent,
                    onClick = onLivingHeritageClick
                )
            }

            // ==========================================
            // 4. TRAVEL TOOLS & ESSENTIALS
            // ==========================================
            item(key = "section_travel_tools_header") {
                Text(
                    text = "Travel Tools",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(top = Spacing.space1)
                )
            }

            item(key = "you_civic_facilities_card") {
                YouMenuCard(
                    title = "Civic Essentials & Emergency Directory",
                    subtitle = "Verified district hospitals, police stations, fuel & ATMs",
                    icon = Icons.Default.LocalHospital,
                    accentColor = ChilikaBlueAccent,
                    onClick = {
                        viewModel.loadServicesForCoordinates(uiState.centerLat, uiState.centerLon)
                        showEssentialsSheet = true
                    }
                )
            }

            item(key = "you_offline_footprint_card") {
                YouMenuCard(
                    title = "Offline Atlas Footprint",
                    subtitle = "100% local-first storage • Saved places & itineraries stay on device",
                    icon = Icons.Default.CloudDone,
                    accentColor = ForestGreenAccent,
                    onClick = {}
                )
            }

            // ==========================================
            // 5. PREFERENCES
            // ==========================================
            item(key = "section_preferences_header") {
                Text(
                    text = "Preferences",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(top = Spacing.space1)
                )
            }

            item(key = "you_pref_language") {
                PreferenceRow(
                    title = stringResource(R.string.you_pref_language_title),
                    subtitle = stringResource(R.string.you_pref_language_value),
                    icon = Icons.Default.Language
                )
            }

            item(key = "you_pref_reminders") {
                PreferenceRow(
                    title = "Transit Timetable Reminders",
                    subtitle = "Calculated locally from published schedules without background tracking",
                    icon = Icons.Default.Notifications
                )
            }

            // ==========================================
            // 6. ABOUT & TRUST FOUNDATION
            // ==========================================
            item(key = "section_about_header") {
                Text(
                    text = "Trust & Provenance",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(top = Spacing.space1)
                )
            }

            item(key = "you_about_brand_card") {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showAboutDialog = true }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(Spacing.space4),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space3)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, TerracottaAccent.copy(alpha = 0.3f)),
                            modifier = Modifier.size(44.dp),
                            color = MaterialTheme.colorScheme.surfaceContainerHigh
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_otravelz_logo),
                                contentDescription = "O-TRAVELZ Logo",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "About O-TRAVELZ",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Modern Odisha Cultural Atlas • Built by Algoryxz",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "Version 4.0.0 • Verified Canonical Data",
                                style = MaterialTheme.typography.labelSmall,
                                color = TerracottaAccent
                            )
                        }

                        Icon(
                            Icons.Default.ChevronRight,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            item(key = "you_footer_spacing") {
                Spacer(modifier = Modifier.height(Spacing.space4))
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

    // Dial confirmation dialog
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

    // About Dialog
    if (showAboutDialog) {
        AlertDialog(
            onDismissRequest = { showAboutDialog = false },
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.size(36.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_otravelz_logo),
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }
                    Text("O-TRAVELZ V4", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Modern Odisha Cultural Atlas & Intelligent Travel Platform.",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "Built by Algoryxz with verified data and zero hallucinated transit telemetry.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                    Text(
                        text = "• 204 verified destinations across 30 districts\n• 154 Mo Bus & AMA Bus transit routes\n• 6 canonical living heritage artisan traditions\n• Zero synthetic/AI-generated tourist photography",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = MaterialTheme.typography.bodySmall.lineHeight * 1.3f
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showAboutDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}

@Composable
private fun YouMenuCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    accentColor: Color,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(Spacing.space3),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(Spacing.space3),
                modifier = Modifier.weight(1f)
            ) {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = accentColor.copy(alpha = 0.12f),
                    modifier = Modifier.size(40.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(icon, contentDescription = null, tint = accentColor, modifier = Modifier.size(20.dp))
                    }
                }

                Column {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

@Composable
private fun PreferenceRow(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(Spacing.space3),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.space3)
        ) {
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = MaterialTheme.colorScheme.surfaceContainerHigh,
                modifier = Modifier.size(36.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(18.dp))
                }
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

/**
 * Compact Account & Identity Summary Card.
 */
@Composable
private fun AccountSummaryCard(
    authState: AuthState,
    authViewModel: AuthViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(Spacing.space4),
            verticalArrangement = Arrangement.spacedBy(Spacing.space3)
        ) {
            when (authState) {
                is AuthState.SignedOut -> {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space3)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = ChilikaBlueAccent.copy(alpha = 0.15f),
                            modifier = Modifier.size(44.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.Person,
                                    contentDescription = null,
                                    tint = ChilikaBlueAccent,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Guest Traveler",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Local-first storage active • Zero login walls",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        Button(
                            onClick = { authViewModel.initiateSignIn(context) },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = ChilikaBlueAccent)
                        ) {
                            Icon(Icons.AutoMirrored.Filled.Login, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Sign In with Google", style = MaterialTheme.typography.labelMedium)
                        }

                        OutlinedButton(
                            onClick = { authViewModel.devSignIn() },
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Dev Sign-In", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
                is AuthState.Authenticating -> {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space3)
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.5.dp,
                            color = ChilikaBlueAccent
                        )
                        Text(
                            text = "Authenticating session…",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
                is AuthState.SignedIn -> {
                    val user = authState.user
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space3)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = ForestGreenAccent.copy(alpha = 0.15f),
                            modifier = Modifier.size(44.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = user.displayName.take(1).uppercase(),
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = ForestGreenAccent
                                )
                            }
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = user.displayName,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = user.email,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        OutlinedButton(
                            onClick = { authViewModel.signOut() },
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text("Sign Out", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
                is AuthState.Error -> {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(Spacing.space2)
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                        Text(text = authState.message, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.error, modifier = Modifier.weight(1f))
                        TextButton(onClick = { authViewModel.signOut() }) {
                            Text("Dismiss", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
                is AuthState.Expired -> {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Session expired", style = MaterialTheme.typography.bodySmall, color = TerracottaAccent)
                        Button(onClick = { authViewModel.initiateSignIn(context) }) {
                            Text("Sign In Again", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }
        }
    }
}
