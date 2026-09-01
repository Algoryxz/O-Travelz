package com.otravelz.android

import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.PlanningConstraintsDto
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ModelsSerializationTest {

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    @Test
    fun testPlanningConstraintsSerialization() {
        val constraints = PlanningConstraintsDto(
            days = 1,
            interests = listOf("temple", "monument"),
            start = "Bhubaneswar",
            publicTransportPreferred = true
        )
        val str = json.encodeToString(constraints)
        assertTrue(str.contains("\"days\":1"))
        assertTrue(str.contains("\"start\":\"Bhubaneswar\""))
        assertTrue(str.contains("\"public_transport_preferred\":true"))
    }

    @Test
    fun testPlaceDetailDeserialization() {
        val jsonStr = """
            {
                "id": "lingaraj_temple",
                "name": "Lingaraj Temple",
                "category": "temple",
                "district": "Khordha",
                "lat": 20.2382,
                "lon": 85.8336,
                "images": []
            }
        """.trimIndent()

        val dto = json.decodeFromString<PlaceDetailDto>(jsonStr)
        assertEquals("lingaraj_temple", dto.id)
        assertEquals("Lingaraj Temple", dto.name)
        assertEquals(20.2382, dto.lat!!, 0.0001)
    }
}
