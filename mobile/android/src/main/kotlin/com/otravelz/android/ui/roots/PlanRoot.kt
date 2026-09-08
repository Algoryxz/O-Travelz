package com.otravelz.android.ui.roots

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.lifecycle.viewmodel.compose.viewModel
import com.otravelz.android.R
import com.otravelz.android.navigation.NavDestination
import com.otravelz.android.ui.screens.PlanConstraintsForm
import com.otravelz.android.ui.screens.PlanItineraryView
import com.otravelz.android.ui.screens.PlanViewModel

/**
 * Structural container for Plan root.
 * Integrates constraint-aware itinerary builder, deterministic generation, and grounded AI assistant.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlanRoot(
    modifier: Modifier = Modifier,
    onPlaceClick: (String) -> Unit = {},
    onViewOnMap: () -> Unit = {},
    viewModel: PlanViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    // Back handling: if viewing an itinerary result, back returns to constraints editor
    BackHandler(enabled = !uiState.showConstraintsForm && uiState.planResult != null) {
        viewModel.modifyPlan()
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = if (!uiState.showConstraintsForm && uiState.planResult != null) {
                            stringResource(R.string.plan_result_summary, uiState.constraints.days, uiState.constraints.startHub ?: "Odisha")
                        } else {
                            stringResource(NavDestination.PLAN.titleRes)
                        },
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    if (!uiState.showConstraintsForm && uiState.planResult != null) {
                        IconButton(onClick = { viewModel.modifyPlan() }) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = stringResource(R.string.action_back)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (uiState.showConstraintsForm || uiState.planResult == null) {
                PlanConstraintsForm(
                    uiState = uiState,
                    onDaysChanged = { viewModel.onDaysChanged(it) },
                    onInterestToggled = { viewModel.onInterestToggled(it) },
                    onPaceChanged = { viewModel.onPaceChanged(it) },
                    onStartHubChanged = { viewModel.onStartHubChanged(it) },
                    onLowWalkingToggled = { viewModel.onLowWalkingToggled(it) },
                    onPublicTransportToggled = { viewModel.onPublicTransportToggled(it) },
                    onPromptChanged = { viewModel.onPromptChanged(it) },
                    onExtractWithAI = { viewModel.extractConstraintsWithAI() },
                    onGeneratePlan = { viewModel.generatePlan() }
                )
            } else {
                PlanItineraryView(
                    plan = uiState.planResult!!,
                    onModifyPlan = { viewModel.modifyPlan() },
                    onPlaceClick = onPlaceClick,
                    onViewOnMap = onViewOnMap
                )
            }
        }
    }
}
