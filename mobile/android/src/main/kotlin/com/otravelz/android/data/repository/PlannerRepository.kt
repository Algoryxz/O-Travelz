package com.otravelz.android.data.repository

import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.NetworkError
import com.otravelz.android.data.network.NetworkResult
import com.otravelz.android.data.network.OTravelzApiService
import com.otravelz.android.data.network.dto.AIConverseRequestDto
import com.otravelz.android.data.network.dto.AIConverseResponseDto
import com.otravelz.android.data.network.dto.ChatMessageDto
import com.otravelz.android.domain.model.PlanConstraints
import com.otravelz.android.domain.model.PlanResult

/**
 * Repository orchestrating deterministic itinerary generation and grounded AI companion queries.
 */
class PlannerRepository(
    private val apiService: OTravelzApiService = ApiClient.createService()
) {

    /**
     * Executes deterministic facts-only itinerary generation via POST /itinerary/plan.
     */
    suspend fun planItinerary(constraints: PlanConstraints): NetworkResult<PlanResult> {
        val requestDto = constraints.toRequestDto()
        return when (val result = ApiClient.safeApiCall { apiService.planItinerary(requestDto) }) {
            is NetworkResult.Success -> {
                val planResult = PlanResult.fromDto(
                    dto = result.data,
                    originalConstraints = constraints
                )
                NetworkResult.Success(planResult)
            }
            is NetworkResult.Failure -> {
                result
            }
        }
    }

    /**
     * Interprets traveler intent in plain language and extracts structured planning constraints.
     */
    suspend fun extractConstraintsWithAI(
        userNote: String,
        currentConstraints: PlanConstraints
    ): NetworkResult<Pair<PlanConstraints, AIConverseResponseDto>> {
        val requestDto = AIConverseRequestDto(
            messages = listOf(ChatMessageDto(role = "user", content = userNote)),
            constraints = currentConstraints.toRequestDto()
        )

        return when (val result = ApiClient.safeApiCall { apiService.converseWithAI(requestDto) }) {
            is NetworkResult.Success -> {
                val response = result.data
                val extracted = response.constraints?.let {
                    PlanConstraints.fromRequestDto(it)
                } ?: currentConstraints

                NetworkResult.Success(Pair(extracted, response))
            }
            is NetworkResult.Failure -> {
                result
            }
        }
    }
}
