package com.otravelz.android.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.otravelz.android.data.network.NetworkError
import com.otravelz.android.data.network.NetworkResult
import com.otravelz.android.data.repository.PlannerRepository
import com.otravelz.android.domain.model.PlanConstraints
import com.otravelz.android.domain.model.PlanPace
import com.otravelz.android.domain.model.PlanResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class SaveTripState {
    UNSAVED,
    SAVING,
    SAVED,
    SAVE_FAILED
}

/**
 * Observable UI state for the Plan root.
 */
data class PlanUiState(
    val constraints: PlanConstraints = PlanConstraints(),
    val naturalLanguagePrompt: String = "",
    val isLoading: Boolean = false,
    val isAIExtracting: Boolean = false,
    val planResult: PlanResult? = null,
    val errorMessage: String? = null,
    val aiCompanionMessage: String? = null,
    val isAIGrounded: Boolean = false,
    val showConstraintsForm: Boolean = true,
    val saveTripState: SaveTripState = SaveTripState.UNSAVED
)

/**
 * MVI ViewModel powering constraint-aware itinerary generation and grounded AI companion interaction.
 */
class PlanViewModel(
    private val repository: PlannerRepository = PlannerRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(PlanUiState())
    val uiState: StateFlow<PlanUiState> = _uiState.asStateFlow()

    fun onDaysChanged(days: Int) {
        _uiState.update { current ->
            current.copy(constraints = current.constraints.copy(days = days.coerceIn(1, 7)))
        }
    }

    fun onInterestToggled(interestKey: String) {
        _uiState.update { current ->
            val updated = current.constraints.interests.toMutableSet()
            if (updated.contains(interestKey)) {
                if (updated.size > 1) updated.remove(interestKey)
            } else {
                updated.add(interestKey)
            }
            current.copy(constraints = current.constraints.copy(interests = updated))
        }
    }

    fun onPaceChanged(pace: PlanPace) {
        _uiState.update { current ->
            current.copy(constraints = current.constraints.copy(pace = pace))
        }
    }

    fun onStartHubChanged(hub: String) {
        _uiState.update { current ->
            current.copy(constraints = current.constraints.copy(startHub = hub))
        }
    }

    fun onLowWalkingToggled(enabled: Boolean) {
        _uiState.update { current ->
            current.copy(constraints = current.constraints.copy(lowWalking = enabled))
        }
    }

    fun onPublicTransportToggled(enabled: Boolean) {
        _uiState.update { current ->
            current.copy(constraints = current.constraints.copy(publicTransportPreferred = enabled))
        }
    }

    fun onPromptChanged(prompt: String) {
        _uiState.update { it.copy(naturalLanguagePrompt = prompt) }
    }

    /**
     * Interprets natural language note, updates structured constraints, and presents them for review.
     */
    fun extractConstraintsWithAI() {
        val prompt = _uiState.value.naturalLanguagePrompt.trim()
        if (prompt.isEmpty()) return

        _uiState.update { it.copy(isAIExtracting = true, errorMessage = null) }

        viewModelScope.launch {
            when (val result = repository.extractConstraintsWithAI(prompt, _uiState.value.constraints)) {
                is NetworkResult.Success -> {
                    val (extractedConstraints, aiResponse) = result.data
                    _uiState.update { current ->
                        current.copy(
                            constraints = extractedConstraints,
                            aiCompanionMessage = aiResponse.message,
                            isAIGrounded = aiResponse.isGrounded,
                            isAIExtracting = false
                        )
                    }
                }
                is NetworkResult.Failure -> {
                    val msg = when (result.error) {
                        is NetworkError.NetworkUnavailable -> "AI Assistant requires an internet connection. You can still view saved trips and edit local trip details."
                        is NetworkError.Timeout -> "AI request timed out"
                        else -> "Unable to extract constraints with AI"
                    }
                    _uiState.update { it.copy(isAIExtracting = false, errorMessage = msg) }
                }
            }
        }
    }

    /**
     * Executes deterministic plan generation based on reviewed constraints.
     */
    fun generatePlan() {
        _uiState.update { it.copy(isLoading = true, errorMessage = null) }

        viewModelScope.launch {
            when (val result = repository.planItinerary(_uiState.value.constraints)) {
                is NetworkResult.Success -> {
                    val plan = result.data
                    _uiState.update { current ->
                        current.copy(
                            planResult = plan.copy(
                                aiCompanionMessage = current.aiCompanionMessage ?: plan.aiCompanionMessage,
                                isAIGrounded = current.isAIGrounded
                            ),
                            isLoading = false,
                            showConstraintsForm = false,
                            errorMessage = null
                        )
                    }
                }
                is NetworkResult.Failure -> {
                    val msg = when (result.error) {
                        is NetworkError.NetworkUnavailable -> "Trip planning requires an internet connection. Your saved trips remain available offline."
                        is NetworkError.Timeout -> "Planner request timed out. Please try again."
                        is NetworkError.ValidationError -> "No feasible itinerary for selected constraints. Try adjusting starting hub."
                        else -> "Unable to generate itinerary. Please try again."
                    }
                    _uiState.update { it.copy(isLoading = false, errorMessage = msg) }
                }
            }
        }
    }

    fun modifyPlan() {
        _uiState.update { it.copy(showConstraintsForm = true) }
    }

    fun clearPlan() {
        _uiState.update {
            PlanUiState(
                constraints = PlanConstraints(),
                showConstraintsForm = true
            )
        }
    }

    fun saveCurrentPlan(context: android.content.Context) {
        val plan = _uiState.value.planResult ?: return
        _uiState.update { it.copy(saveTripState = SaveTripState.SAVING) }
        viewModelScope.launch {
            try {
                val repo = com.otravelz.android.data.repository.PersistenceRepository.getInstance(context)
                repo.savePlanResult(plan)
                _uiState.update { it.copy(saveTripState = SaveTripState.SAVED) }
            } catch (e: Exception) {
                _uiState.update { it.copy(saveTripState = SaveTripState.SAVE_FAILED) }
            }
        }
    }

    fun startCurrentPlan(context: android.content.Context, onStarted: () -> Unit) {
        val plan = _uiState.value.planResult ?: return
        viewModelScope.launch {
            try {
                val repo = com.otravelz.android.data.repository.PersistenceRepository.getInstance(context)
                val tripId = repo.savePlanResult(plan)
                repo.startTrip(tripId)
                _uiState.update { it.copy(saveTripState = SaveTripState.SAVED) }
                onStarted()
            } catch (e: Exception) {
                _uiState.update { it.copy(saveTripState = SaveTripState.SAVE_FAILED) }
            }
        }
    }
}
