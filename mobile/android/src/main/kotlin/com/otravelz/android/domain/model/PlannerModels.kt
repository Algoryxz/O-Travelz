package com.otravelz.android.domain.model

import com.otravelz.android.data.network.dto.ItineraryDayDto
import com.otravelz.android.data.network.dto.ItineraryPlanRequestDto
import com.otravelz.android.data.network.dto.ItineraryResponseDto
import com.otravelz.android.data.network.dto.ItineraryStopDto
import com.otravelz.android.data.network.dto.TransportHopDto

/**
 * Standard travel themes recognized by catalog ranking and planner.
 */
enum class PlanInterest(val key: String, val displayName: String) {
    HERITAGE("heritage", "Heritage"),
    TEMPLE("temple", "Temples"),
    NATURE("nature", "Nature"),
    BEACH("beach", "Beaches"),
    CULTURE("culture", "Culture"),
    CRAFTS("crafts", "Handicrafts"),
    FOOD("food", "Culinary")
}

/**
 * Pace of daily itinerary stops.
 */
enum class PlanPace(val value: String) {
    RELAXED("relaxed"),
    MODERATE("moderate"),
    FAST("fast")
}

/**
 * Verified hubs available for origin resolution.
 */
object PlannerHubs {
    val POPULAR_HUBS = listOf(
        "Bhubaneswar",
        "Puri",
        "Cuttack",
        "Rourkela",
        "Sambalpur",
        "Berhampur",
        "Konark"
    )
}

/**
 * Typed, constraint-aware user planning configuration.
 */
data class PlanConstraints(
    val days: Int = 1,
    val interests: Set<String> = setOf("heritage", "temple"),
    val pace: PlanPace = PlanPace.MODERATE,
    val startHub: String? = "Bhubaneswar",
    val lowWalking: Boolean = false,
    val publicTransportPreferred: Boolean = false,
    val budgetTransportPerDay: Double? = null,
    val budgetConscious: Boolean = false
) {
    fun toRequestDto(): ItineraryPlanRequestDto {
        return ItineraryPlanRequestDto(
            days = days.coerceIn(1, 7),
            interests = interests.toList(),
            pace = pace.value,
            start = startHub?.trim()?.ifEmpty { null },
            budgetTransportPerDay = budgetTransportPerDay,
            lowWalking = if (lowWalking) true else null,
            vegetarian = null,
            avoidCrowds = null,
            publicTransportPreferred = if (publicTransportPreferred) true else null,
            budgetConscious = if (budgetConscious) true else null
        )
    }

    companion object {
        fun fromRequestDto(dto: ItineraryPlanRequestDto): PlanConstraints {
            val p = when (dto.pace?.lowercase()) {
                "relaxed" -> PlanPace.RELAXED
                "fast" -> PlanPace.FAST
                else -> PlanPace.MODERATE
            }
            return PlanConstraints(
                days = dto.days.coerceIn(1, 7),
                interests = dto.interests.toSet(),
                pace = p,
                startHub = dto.start,
                lowWalking = dto.lowWalking == true,
                publicTransportPreferred = dto.publicTransportPreferred == true,
                budgetTransportPerDay = dto.budgetTransportPerDay,
                budgetConscious = dto.budgetConscious == true
            )
        }
    }
}

/**
 * Confirmed itinerary destination visit with planned arrival/departure times.
 */
data class PlanStop(
    val sequence: Int,
    val placeId: String,
    val placeName: String,
    val category: String,
    val plannedArrival: String?,
    val plannedDeparture: String?
) {
    val timeWindowDisplay: String?
        get() = if (plannedArrival != null && plannedDeparture != null) {
            "$plannedArrival – $plannedDeparture"
        } else plannedArrival ?: plannedDeparture
}

/**
 * Grounded journey leg connecting stops.
 */
data class JourneyLeg(
    val fromSequence: Int,
    val toSequence: Int,
    val mode: String,
    val estimatedMinutes: Int?,
    val estimatedCost: Double?,
    val legDetail: String?,
    val dataTier: String?,
    val reason: String?
) {
    val isUnavailable: Boolean
        get() = mode.equals("unavailable", ignoreCase = true) || reason != null

    val displayModeTitle: String
        get() {
            if (isUnavailable) return "Transport unavailable"
            val mins = estimatedMinutes?.let { "$it min " } ?: ""
            return when (mode.lowercase()) {
                "walk" -> "${mins}walk"
                "bus", "transit" -> "Scheduled Transit ${if (mins.isNotEmpty()) "(${mins.trim()})" else ""}"
                else -> "${mode.replaceFirstChar { it.uppercase() }} $mins"
            }.trim()
        }
}

/**
 * Itinerary partition grouping stops and hops for one calendar day.
 */
data class PlanDay(
    val dayNumber: Int,
    val date: String?,
    val stops: List<PlanStop>,
    val hops: List<JourneyLeg>
)

/**
 * Validated, immutable plan result.
 */
data class PlanResult(
    val itineraryId: String,
    val constraints: PlanConstraints,
    val days: List<PlanDay>,
    val explanation: String,
    val aiCompanionMessage: String? = null,
    val isAIGrounded: Boolean = true,
    val warnings: List<String> = emptyList()
) {
    val totalStopsCount: Int
        get() = days.sumOf { it.stops.size }

    companion object {
        fun fromDto(
            dto: ItineraryResponseDto,
            originalConstraints: PlanConstraints,
            aiMessage: String? = null,
            isGrounded: Boolean = true,
            warnings: List<String> = emptyList()
        ): PlanResult {
            val mappedDays = dto.days.map { dayDto ->
                val stops = dayDto.stops.map { stopDto ->
                    PlanStop(
                        sequence = stopDto.sequence,
                        placeId = stopDto.place.id,
                        placeName = stopDto.place.name,
                        category = stopDto.place.category,
                        plannedArrival = stopDto.plannedArrival,
                        plannedDeparture = stopDto.plannedDeparture
                    )
                }

                val hops = dayDto.hops.map { hopDto ->
                    val detail = hopDto.legs.firstOrNull()?.detail
                        ?: hopDto.legs.firstOrNull()?.mode
                        ?: hopDto.routeNumber?.let { "Route $it" }

                    JourneyLeg(
                        fromSequence = hopDto.fromSequence ?: 0,
                        toSequence = hopDto.toSequence ?: 1,
                        mode = hopDto.mode ?: "walk",
                        estimatedMinutes = hopDto.estimatedMinutes ?: hopDto.durationMinutes,
                        estimatedCost = null, // Fares strictly null
                        legDetail = detail,
                        dataTier = hopDto.dataTier ?: "scheduled",
                        reason = hopDto.reason
                    )
                }

                PlanDay(
                    dayNumber = dayDto.dayNumber,
                    date = dayDto.date,
                    stops = stops,
                    hops = hops
                )
            }

            return PlanResult(
                itineraryId = dto.itineraryId,
                constraints = originalConstraints,
                days = mappedDays,
                explanation = dto.explanation,
                aiCompanionMessage = aiMessage,
                isAIGrounded = isGrounded,
                warnings = warnings
            )
        }
    }
}
