package com.otravelz.android.data.repository

import com.otravelz.android.core.network.NetworkClient
import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.model.AIPlanRequestDto
import com.otravelz.android.data.model.AIResponseDto
import com.otravelz.android.data.model.ItineraryPlanResponseDto
import com.otravelz.android.data.model.PlanningConstraintsDto

class PlannerRepository(private val apiService: ApiService = NetworkClient.apiService) {

    suspend fun planItinerary(constraints: PlanningConstraintsDto): NetworkResult<ItineraryPlanResponseDto> {
        return try {
            val res = apiService.planItinerary(constraints)
            NetworkResult.Success(res)
        } catch (e: Exception) {
            NetworkResult.Error("Deterministic planner service unavailable.", cause = e)
        }
    }

    suspend fun planWithAi(message: String, constraints: PlanningConstraintsDto? = null): NetworkResult<AIResponseDto> {
        return try {
            val res = apiService.planWithAi(AIPlanRequestDto(message = message, constraints = constraints))
            NetworkResult.Success(res)
        } catch (e: Exception) {
            NetworkResult.Error("AI Planner backend unreachable.", cause = e)
        }
    }
}
