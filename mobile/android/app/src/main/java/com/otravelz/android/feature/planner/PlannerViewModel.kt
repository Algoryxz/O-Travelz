package com.otravelz.android.feature.planner

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.model.ItineraryPlanResponseDto
import com.otravelz.android.data.model.PlanningConstraintsDto
import com.otravelz.android.data.repository.PlannerRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PlannerUiState(
    val isLoading: Boolean = false,
    val itinerary: ItineraryPlanResponseDto? = null,
    val prompt: String = "Plan a 1 day trip in Bhubaneswar with temples and Mo Bus",
    val errorMessage: String? = null
)

class PlannerViewModel(
    private val plannerRepository: PlannerRepository = PlannerRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(PlannerUiState())
    val uiState: StateFlow<PlannerUiState> = _uiState.asStateFlow()

    fun updatePrompt(text: String) {
        _uiState.value = _uiState.value.copy(prompt = text)
    }

    fun generatePlan(durationDays: Int = 1) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val constraints = PlanningConstraintsDto(
                durationDays = durationDays,
                originLat = 20.2961,
                originLon = 85.8245,
                categories = listOf("temple", "monument", "market")
            )

            when (val res = plannerRepository.planItinerary(constraints)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        itinerary = res.data,
                        errorMessage = null
                    )
                }
                is NetworkResult.Error -> {
                    // Try AI fallback if deterministic endpoint returns error
                    val aiRes = plannerRepository.planWithAi(
                        message = _uiState.value.prompt,
                        constraints = constraints
                    )
                    if (aiRes is NetworkResult.Success && aiRes.data.itinerary != null) {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            itinerary = aiRes.data.itinerary,
                            errorMessage = null
                        )
                    } else {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = res.message
                        )
                    }
                }
                else -> {}
            }
        }
    }
}
