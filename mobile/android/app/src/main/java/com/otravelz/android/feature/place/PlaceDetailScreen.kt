package com.otravelz.android.feature.place

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalAtm
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocalPolice
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.notifications.NotificationHelper
import com.otravelz.android.core.ui.place.*
import com.otravelz.android.data.repository.SavedPlacesRepository
import com.otravelz.android.feature.home.EssentialChip
import kotlinx.coroutines.launch

@Composable
fun PlaceDetailScreen(
    placeId: String,
    viewModel: PlaceDetailViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    onRequestNotificationPermission: (((onGranted: (() -> Unit)?) -> Unit))? = null
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val savedPlacesRepository = remember { SavedPlacesRepository(context) }
    val savedPlaceIds by savedPlacesRepository.savedPlaceIds.collectAsState()
    val state by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(placeId) {
        viewModel.loadPlace(placeId)
    }

    if (state.isLoading) {
        LoadingState(modifier = modifier.fillMaxSize(), message = "Loading place details...")
        return
    }

    if (state.errorMessage != null || state.place == null) {
        ErrorState(
            message = state.errorMessage ?: "Place details unavailable",
            onRetry = { viewModel.loadPlace(placeId) },
            modifier = modifier.fillMaxSize()
        )
        return
    }

    val place = state.place!!
    val isSaved = savedPlaceIds.contains(place.id)

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = DarkBackground,
        modifier = modifier.fillMaxSize()
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // 1. Hero Image Container
            PlaceHero(
                place = place,
                onBack = onBack
            )

            // 2. Identity, Actions & Cultural Body
            Column(
                verticalArrangement = Arrangement.spacedBy(Spacing.md),
                modifier = Modifier.padding(Spacing.md)
            ) {
                // Identity
                PlaceIdentity(place = place)

                // Action Bar
                PlaceActionBar(
                    isSaved = isSaved,
                    onSaveToggle = {
                        val savedNow = savedPlacesRepository.toggleSave(place)
                        coroutineScope.launch {
                            savedPlacesRepository.syncWithServer()
                            snackbarHostState.showSnackbar(
                                if (savedNow) "Saved to your bookmarks" else "Removed from bookmarks"
                            )
                        }
                    },
                    onPlanAdd = {
                        snackbarHostState.currentSnackbarData?.dismiss()
                        coroutineScope.launch {
                            snackbarHostState.showSnackbar("Added ${place.name} to trip plan builder.")
                        }
                    },
                    onShare = {
                        val sendIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(
                                Intent.EXTRA_TEXT,
                                "Discover ${place.name} in ${place.district ?: "Odisha"} on O-TRAVELZ travel intelligence."
                            )
                            type = "text/plain"
                        }
                        val shareIntent = Intent.createChooser(sendIntent, "Share Destination")
                        context.startActivity(shareIntent)
                    },
                    onRemind = {
                        val triggerAlert: () -> Unit = {
                            val posted = NotificationHelper.showTripReminder(context, place.id, place.name)
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar(
                                    if (posted) "Trip reminder posted to notification tray" else "Please grant notification permission"
                                )
                            }
                            Unit
                        }
                        if (onRequestNotificationPermission != null) {
                            onRequestNotificationPermission(triggerAlert)
                        } else {
                            triggerAlert()
                        }
                    }
                )

                // Cultural Story & Description
                if (!place.description.isNullOrBlank()) {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = DarkSurfaceElevated,
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorderSubtle),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(Spacing.md)) {
                            Text(
                                text = "Cultural Context",
                                style = MaterialTheme.typography.titleMedium,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(Spacing.xs))
                            Text(
                                text = place.description ?: "",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary,
                                lineHeight = 22.sp
                            )
                        }
                    }
                }

                // Visit Info & Essentials
                PlaceVisitInfo(place = place)

                // Transport Access & First-Mile Guidance
                PlaceTransportCard(
                    place = place,
                    onNavigateTransit = {}
                )

                // Civic Essentials
                Column {
                    Text(
                        text = "Nearby Civic Essentials",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(Spacing.xs))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        EssentialChip(icon = Icons.Default.LocalHospital, label = "Medical", modifier = Modifier.weight(1f))
                        EssentialChip(icon = Icons.Default.LocalPolice, label = "Police", modifier = Modifier.weight(1f))
                        EssentialChip(icon = Icons.Default.LocalGasStation, label = "Fuel", modifier = Modifier.weight(1f))
                        EssentialChip(icon = Icons.Default.LocalAtm, label = "ATM", modifier = Modifier.weight(1f))
                    }
                }

                Spacer(modifier = Modifier.height(Spacing.lg))
            }
        }
    }
}
