package com.otravelz.android.feature.planner

import android.app.Application
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.model.*
import com.otravelz.android.data.repository.PlannerRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.io.IOException

@OptIn(ExperimentalCoroutinesApi::class)
class PlannerViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private val samplePlace1 = PlaceSummaryDto(
        id = "lingaraj_temple",
        name = "Lingaraj Temple",
        category = "temple",
        location = "Bhubaneswar",
        lat = 20.2382,
        lon = 85.8338
    )

    private val samplePlace2 = PlaceSummaryDto(
        id = "dhauli_shanti_stupa",
        name = "Dhauli Shanti Stupa",
        category = "monument",
        location = "Bhubaneswar",
        lat = 20.1923,
        lon = 85.8394
    )

    private val sampleHop = TransportHopDto(
        fromSequence = 1,
        toSequence = 2,
        mode = "mo_bus",
        estimatedMinutes = 25,
        estimatedCost = null, // Zero invented fares
        dataTier = "scheduled",
        legs = listOf(
            TransportLegDto(
                mode = "mo_bus",
                detail = "Board Route 10 at Lingaraj Stop to Dhauli Square",
                provider = "CRUT Mo Bus",
                route = "Route 10"
            )
        )
    )

    private val sampleItinerary = ItineraryPlanResponseDto(
        itineraryId = "itin_test_001",
        constraints = PlanningConstraintsDto(days = 1),
        explanation = "Deterministic 1-day heritage tour connecting Lingaraj and Dhauli via Mo Bus.",
        days = listOf(
            ItineraryDayDto(
                dayNumber = 1,
                date = "2026-09-02",
                theme = "Heritage & Peace Stupa",
                stops = listOf(
                    ItineraryStopDto(
                        sequence = 1,
                        place = samplePlace1,
                        plannedArrival = "09:00",
                        plannedDeparture = "10:30",
                        durationMinutes = 90
                    ),
                    ItineraryStopDto(
                        sequence = 2,
                        place = samplePlace2,
                        plannedArrival = "11:00",
                        plannedDeparture = "12:30",
                        durationMinutes = 90
                    )
                ),
                hops = listOf(sampleHop)
            )
        )
    )

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun testInitialUiState() {
        val fakeApi = FakeApiService()
        val repository = PlannerRepository(fakeApi)
        val viewModel = PlannerViewModel(
            application = Application(),
            plannerRepository = repository
        )

        val state = viewModel.uiState.value
        assertFalse("Initial loading must be false", state.isLoading)
        assertNull("Initial itinerary must be null", state.itinerary)
        assertNull("Initial error must be null", state.errorMessage)
        assertTrue("Prompt should have default text", state.prompt.isNotEmpty())
    }

    @Test
    fun testUpdatePrompt() {
        val fakeApi = FakeApiService()
        val viewModel = PlannerViewModel(
            application = Application(),
            plannerRepository = PlannerRepository(fakeApi)
        )

        viewModel.updatePrompt("Custom trip in Puri with beaches")
        assertEquals("Custom trip in Puri with beaches", viewModel.uiState.value.prompt)
    }

    @Test
    fun testSuccessfulDeterministicPlanning() = runTest(testDispatcher) {
        val fakeApi = FakeApiService().apply {
            deterministicResponse = sampleItinerary
        }
        val viewModel = PlannerViewModel(
            application = Application(),
            plannerRepository = PlannerRepository(fakeApi)
        )

        viewModel.generatePlan()
        testDispatcher.scheduler.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertFalse("Loading must be false after completion", state.isLoading)
        assertNotNull("Itinerary must be present", state.itinerary)
        assertEquals("itin_test_001", state.itinerary?.itineraryId)
        assertEquals(1, state.itinerary?.days?.size)
        assertEquals(2, state.itinerary?.days?.first()?.stops?.size)
        assertEquals(1, state.itinerary?.days?.first()?.hops?.size)
        assertNull("No error should be set", state.errorMessage)
    }

    @Test
    fun testDeterministicErrorWithAiFallbackRecovery() = runTest(testDispatcher) {
        val fakeApi = FakeApiService().apply {
            shouldFailDeterministic = true
            aiResponse = AIResponseDto(
                message = "AI Copilot generated a grounded plan matching your prompt.",
                itinerary = sampleItinerary,
                status = "success"
            )
        }
        val viewModel = PlannerViewModel(
            application = Application(),
            plannerRepository = PlannerRepository(fakeApi)
        )

        viewModel.generatePlan()
        testDispatcher.scheduler.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertFalse("Loading must be false", state.isLoading)
        assertNotNull("Itinerary must be recovered via AI fallback", state.itinerary)
        assertEquals("itin_test_001", state.itinerary?.itineraryId)
        assertNull("Error message should be null on recovered success", state.errorMessage)
    }

    @Test
    fun testBothDeterministicAndAiFail() = runTest(testDispatcher) {
        val fakeApi = FakeApiService().apply {
            shouldFailDeterministic = true
            shouldFailAi = true
        }
        val viewModel = PlannerViewModel(
            application = Application(),
            plannerRepository = PlannerRepository(fakeApi)
        )

        viewModel.generatePlan()
        testDispatcher.scheduler.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertFalse("Loading must be false", state.isLoading)
        assertNull("Itinerary must remain null on total failure", state.itinerary)
        assertNotNull("Error message must be present", state.errorMessage)
    }

    /**
     * Fake implementation of ApiService for hermetic unit tests.
     */
    private class FakeApiService : ApiService {
        var shouldFailDeterministic = false
        var shouldFailAi = false
        var deterministicResponse: ItineraryPlanResponseDto? = null
        var aiResponse: AIResponseDto? = null

        override suspend fun listPlaces(
            category: String?,
            district: String?,
            search: String?,
            limit: Int
        ): List<PlaceDetailDto> = emptyList()

        override suspend fun getPlaceDetail(placeId: String): PlaceDetailDto {
            throw NotImplementedError()
        }

        override suspend fun getCurrentWeather(
            lat: Double?,
            lon: Double?,
            locationName: String?
        ): WeatherResponseDto {
            throw NotImplementedError()
        }

        override suspend fun planItinerary(constraints: PlanningConstraintsDto): ItineraryPlanResponseDto {
            if (shouldFailDeterministic) {
                throw IOException("Deterministic endpoint HTTP 503 Service Unavailable")
            }
            return deterministicResponse ?: throw IllegalStateException("No deterministic response configured")
        }

        override suspend fun planWithAi(request: AIPlanRequestDto): AIResponseDto {
            if (shouldFailAi) {
                throw IOException("AI endpoint HTTP 500 Internal Server Error")
            }
            return aiResponse ?: throw IllegalStateException("No AI response configured")
        }

        override suspend fun getNearbyStops(
            lat: Double,
            lon: Double,
            radiusM: Int,
            limit: Int
        ): List<NearbyStopDto> = emptyList()

        override suspend fun getSavedPlaces(): SyncSavedPlacesResponseDto {
            return SyncSavedPlacesResponseDto(syncedCount = 0, items = emptyList())
        }

        override suspend fun syncSavedPlaces(request: SyncSavedPlacesRequestDto): SyncSavedPlacesResponseDto {
            return SyncSavedPlacesResponseDto(syncedCount = 0, items = emptyList())
        }

        override suspend fun shareTrip(request: CreateShareTripRequestDto): CreateShareTripResponseDto {
            return CreateShareTripResponseDto(shareId = "test_share", shareUrl = "https://otravelz.app/s/test", createdAt = 0L)
        }

        override suspend fun getSharedTrip(shareId: String): PublicSharedTripResponseDto {
            throw NotImplementedError()
        }

        override suspend fun getSavedTrips(): SyncTripsResponseDto {
            return SyncTripsResponseDto(syncedCount = 0, items = emptyList())
        }

        override suspend fun syncSavedTrips(request: SyncTripsRequestDto): SyncTripsResponseDto {
            return SyncTripsResponseDto(syncedCount = 0, items = emptyList())
        }
    }
}
