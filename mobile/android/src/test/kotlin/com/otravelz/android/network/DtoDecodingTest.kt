package com.otravelz.android.network

import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.adapter.TransitStopTruth
import com.otravelz.android.data.network.adapter.WeatherState
import com.otravelz.android.data.network.adapter.toDomain
import com.otravelz.android.data.network.dto.*
import kotlinx.serialization.decodeFromString
import org.junit.Assert.*
import org.junit.Test

class DtoDecodingTest {

    @Test
    fun testDecodeHealthResponse() {
        val json = """
            {
                "status": "ok",
                "version": "4.0.0",
                "git_sha": "4affea9fba7ac49acbad6eacd0d017c68818385d",
                "alembic_version": "0020_transit_ride_observations",
                "database": "connected"
            }
        """.trimIndent()

        val dto = ApiClient.json.decodeFromString<HealthResponseDto>(json)
        assertEquals("ok", dto.status)
        assertEquals("4.0.0", dto.version)
        assertEquals("connected", dto.database)
        assertEquals("4affea9fba7ac49acbad6eacd0d017c68818385d", dto.gitSha)
    }

    @Test
    fun testDecodePlacesList() {
        val json = """
            [
                {
                    "id": "puri-jagannath-temple",
                    "name": "Jagannath Temple",
                    "category": "temple",
                    "lat": 19.8049,
                    "lon": 85.8179,
                    "district": "Puri",
                    "images": [
                        {
                            "url": "/static/images/puri_jagannath.webp",
                            "attribution": "OTDC"
                        }
                    ]
                }
            ]
        """.trimIndent()

        val list = ApiClient.json.decodeFromString<List<PlaceDto>>(json)
        assertEquals(1, list.size)
        val place = list[0]
        assertEquals("puri-jagannath-temple", place.id)
        assertEquals("Jagannath Temple", place.name)
        assertEquals(19.8049, place.lat!!, 0.001)
        assertEquals(1, place.images.size)
    }

    @Test
    fun testWeatherTruthAdapterPreservesAbsence() {
        // Temperature is NULL; must NOT map to 0.0 degrees C!
        val json = """
            {
                "location_name": "Bhubaneswar",
                "current": {
                    "location_name": "Bhubaneswar",
                    "temperature_c": null,
                    "condition": null
                }
            }
        """.trimIndent()

        val dto = ApiClient.json.decodeFromString<WeatherResponseDto>(json)
        assertNull(dto.current?.temperatureC)

        val domain = dto.toDomain()
        assertTrue("Null temperature must map to WeatherState.Unavailable", domain is WeatherState.Unavailable)
    }

    @Test
    fun testWeatherTruthAdapterAvailable() {
        val json = """
            {
                "location_name": "Bhubaneswar",
                "current": {
                    "location_name": "Bhubaneswar",
                    "temperature_c": 31.4,
                    "condition": "Mainly clear",
                    "advice": "Pleasant day"
                }
            }
        """.trimIndent()

        val dto = ApiClient.json.decodeFromString<WeatherResponseDto>(json)
        val domain = dto.toDomain()
        assertTrue(domain is WeatherState.Available)
        val available = domain as WeatherState.Available
        assertEquals(31.4, available.temperatureC, 0.01)
        assertEquals("Mainly clear", available.condition)
    }

    @Test
    fun testTransitCandidateStopNotGivenExactCoordinates() {
        val json = """
            {
                "stop_id": "cand-stop-101",
                "name": "Candidate Stop X",
                "locality": "Patia",
                "city": "Bhubaneswar",
                "latitude": 20.35,
                "longitude": 85.81,
                "coordinate_status": "candidate"
            }
        """.trimIndent()

        val dto = ApiClient.json.decodeFromString<StopNearbyDto>(json)
        val domain = dto.toDomain()

        assertTrue("Candidate stop must map to LocalityOnly, never Exact", domain is TransitStopTruth.LocalityOnly)
        val localityOnly = domain as TransitStopTruth.LocalityOnly
        assertEquals("Patia", localityOnly.locality)
    }

    @Test
    fun testServicesNearbyDecoding() {
        val json = """
            {
                "query_lat": 20.2961,
                "query_lon": 85.8245,
                "category": "hospital",
                "requested_radius_km": 5.0,
                "active_radius_km": 5.0,
                "count": 1,
                "services": [
                    {
                        "id": "aiims-bbsr",
                        "name": "AIIMS Bhubaneswar",
                        "category": "hospital",
                        "lat": 20.2312,
                        "lon": 85.7765,
                        "distance_km": 4.2
                    }
                ]
            }
        """.trimIndent()

        val dto = ApiClient.json.decodeFromString<NearbyServicesResponseDto>(json)
        assertEquals(1, dto.count)
        assertEquals("AIIMS Bhubaneswar", dto.services[0].name)
        assertEquals(4.2, dto.services[0].distanceKm!!, 0.01)
    }
}
