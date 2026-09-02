package com.otravelz.android

import com.otravelz.android.core.network.NetworkResult
import com.otravelz.android.data.api.ApiService
import com.otravelz.android.data.model.DataProvenance
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.repository.PlacesRepository
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

class OfflineProvenanceTest {

    private val samplePlace = PlaceDetailDto(
        id = "test_01",
        name = "Konark Sun Temple",
        category = "heritage",
        description = "13th-century CE Sun temple at Konark",
        lat = 19.8876,
        lon = 86.0945,
        district = "Puri"
    )

    @Test
    fun testLiveProvenanceWhenApiSucceeds() = runBlocking {
        val mockApi = object : ApiServiceMock() {
            override suspend fun listPlaces(
                category: String?,
                district: String?,
                search: String?,
                limit: Int
            ): List<PlaceDetailDto> {
                return listOf(samplePlace)
            }
        }

        val repository = PlacesRepository(apiService = mockApi)
        val result = repository.getPlacesWithProvenance()

        assertTrue(result is NetworkResult.Success)
        val provResult = (result as NetworkResult.Success).data
        assertEquals(DataProvenance.LIVE, provResult.provenance)
        assertEquals(1, provResult.data.size)
        assertEquals("Konark Sun Temple", provResult.data[0].name)
    }

    @Test
    fun testCachedProvenanceWhenApiFailsAfterSuccess() = runBlocking {
        var throwError = false
        val mockApi = object : ApiServiceMock() {
            override suspend fun listPlaces(
                category: String?,
                district: String?,
                search: String?,
                limit: Int
            ): List<PlaceDetailDto> {
                if (throwError) throw IOException("Network unreachable")
                return listOf(samplePlace)
            }
        }

        val repository = PlacesRepository(apiService = mockApi)

        // 1. Initial success
        val res1 = repository.getPlacesWithProvenance()
        assertEquals(DataProvenance.LIVE, (res1 as NetworkResult.Success).data.provenance)

        // 2. Subsequent offline failure -> falls back to memory CACHED
        throwError = true
        val res2 = repository.getPlacesWithProvenance()
        assertTrue(res2 is NetworkResult.Success)
        val provResult = (res2 as NetworkResult.Success).data
        assertEquals(DataProvenance.CACHED, provResult.provenance)
        assertEquals(1, provResult.data.size)
    }
}

open class ApiServiceMock : ApiService {
    override suspend fun listPlaces(category: String?, district: String?, search: String?, limit: Int): List<PlaceDetailDto> = emptyList()
    override suspend fun getPlaceDetail(placeId: String): PlaceDetailDto = throw NotImplementedError()
    override suspend fun getCurrentWeather(lat: Double?, lon: Double?, locationName: String?) = throw NotImplementedError()
    override suspend fun planItinerary(constraints: com.otravelz.android.data.model.PlanningConstraintsDto) = throw NotImplementedError()
    override suspend fun planWithAi(request: com.otravelz.android.data.model.AIPlanRequestDto) = throw NotImplementedError()
    override suspend fun getNearbyStops(lat: Double, lon: Double, radiusM: Int, limit: Int) = emptyList<com.otravelz.android.data.model.NearbyStopDto>()
    override suspend fun getSavedPlaces() = throw NotImplementedError()
    override suspend fun syncSavedPlaces(request: com.otravelz.android.data.model.SyncSavedPlacesRequestDto) = throw NotImplementedError()
    override suspend fun shareTrip(request: com.otravelz.android.data.model.CreateShareTripRequestDto) = throw NotImplementedError()
    override suspend fun getSharedTrip(shareId: String) = throw NotImplementedError()
    override suspend fun getSavedTrips() = throw NotImplementedError()
    override suspend fun syncSavedTrips(request: com.otravelz.android.data.model.SyncTripsRequestDto) = throw NotImplementedError()
}
