package com.otravelz.android

import com.otravelz.android.data.local.room.SavedPlaceEntity
import com.otravelz.android.data.model.PlaceDetailDto
import com.otravelz.android.data.model.PlaceImageDto
import kotlinx.serialization.json.Json
import org.junit.Assert.*
import org.junit.Test

class SavedPlacesRoomMigrationTest {

    private val json = Json { ignoreUnknownKeys = true; isLenient = true }

    @Test
    fun testSavedPlaceEntity_toDtoAndFromDto_roundTripParity() {
        val dto = PlaceDetailDto(
            id = "konark_sun_temple",
            name = "Konark Sun Temple",
            category = "temple",
            description = "13th-century CE Sun Temple at Konark, UNESCO World Heritage Site.",
            lat = 19.8876,
            lon = 86.0945,
            district = "Puri",
            region = "Central Odisha",
            rating = 4.8,
            images = listOf(
                PlaceImageDto(
                    url = "https://images.unsplash.com/photo-konark",
                    altText = "Konark Wheel",
                    isPrimary = true
                )
            ),
            interests = listOf("history", "architecture")
        )

        val entity = SavedPlaceEntity.fromDto(dto, savedAt = 1700000000000L, json = json)
        assertEquals("konark_sun_temple", entity.id)
        assertEquals("Konark Sun Temple", entity.name)
        assertEquals("temple", entity.category)
        assertEquals(19.8876, entity.lat ?: 0.0, 0.0001)
        assertEquals(86.0945, entity.lon ?: 0.0, 0.0001)
        assertEquals(1700000000000L, entity.savedAt)
        assertFalse(entity.isDeleted)

        val restoredDto = entity.toDto(json)
        assertEquals(dto.id, restoredDto.id)
        assertEquals(dto.name, restoredDto.name)
        assertEquals(dto.category, restoredDto.category)
        assertEquals(dto.description, restoredDto.description)
        assertEquals(dto.lat, restoredDto.lat)
        assertEquals(dto.lon, restoredDto.lon)
        assertEquals(dto.district, restoredDto.district)
        assertEquals(dto.region, restoredDto.region)
        assertEquals(1, restoredDto.images.size)
        assertEquals("https://images.unsplash.com/photo-konark", restoredDto.images[0].url)
        assertEquals(2, restoredDto.interests.size)
    }

    @Test
    fun testSavedPlaceEntity_legacyJsonMigrationSimulation() {
        val legacyJson = """
            [
                {
                    "id": "lingaraj_temple",
                    "name": "Lingaraj Temple",
                    "category": "temple",
                    "district": "Khordha",
                    "lat": 20.2382,
                    "lon": 85.8336,
                    "images": [],
                    "interests": ["temple", "heritage"]
                },
                {
                    "id": "dhauli_shanti_stupa",
                    "name": "Dhauli Shanti Stupa",
                    "category": "heritage",
                    "district": "Khordha",
                    "lat": 20.1925,
                    "lon": 85.8394,
                    "images": [],
                    "interests": ["peace", "buddhism"]
                }
            ]
        """.trimIndent()

        val legacyList = json.decodeFromString<List<PlaceDetailDto>>(legacyJson)
        assertEquals(2, legacyList.size)

        val entities = legacyList.map { SavedPlaceEntity.fromDto(it, json = json) }
        assertEquals(2, entities.size)
        assertEquals("lingaraj_temple", entities[0].id)
        assertEquals("dhauli_shanti_stupa", entities[1].id)

        val restoredPlaces = entities.map { it.toDto(json) }
        assertEquals("Lingaraj Temple", restoredPlaces[0].name)
        assertEquals("Dhauli Shanti Stupa", restoredPlaces[1].name)
    }
}
