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
            durationDays = 1,
            originLat = 20.2961,
            originLon = 85.8245,
            categories = listOf("temple", "monument")
        )
        val str = json.encodeToString(constraints)
        assertTrue(str.contains("\"duration_days\":1"))
        assertTrue(str.contains("\"origin_lat\":20.2961"))
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
