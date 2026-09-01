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

    suspend fun shareTrip(
        title: String,
        itinerary: ItineraryPlanResponseDto,
        constraints: PlanningConstraintsDto? = null
    ): NetworkResult<CreateShareTripResponseDto> {
        return try {
            val request = CreateShareTripRequestDto(
                title = title,
                itinerary = itinerary,
                constraints = constraints
            )
            val res = apiService.shareTrip(request)
            NetworkResult.Success(res)
        } catch (e: Exception) {
            NetworkResult.Error("Unable to create shareable trip link.", cause = e)
        }
    }

    suspend fun getSharedTrip(shareId: String): NetworkResult<CreateShareTripRequestDto> {
        return try {
            val res = apiService.getSharedTrip(shareId)
            NetworkResult.Success(res)
        } catch (e: Exception) {
            NetworkResult.Error("Unable to load shared trip.", cause = e)
        }
    }
}
