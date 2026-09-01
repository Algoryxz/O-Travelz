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
    fun testProductionPlaceDetailDeserializationWithImages() {
        val jsonStr = """
            {
              "id": "cb5cfba0-f0c4-5801-af66-266d78b3d051",
              "research_id": "place_bbsr_004",
              "name": "Ananta Vasudeva Temple",
              "category": "temple",
              "description": "Historic 13th-century Vaishnavite temple on Bindu Sagar bank.",
              "lat": 20.2422,
              "lon": 85.8344,
              "district": "Khordha",
              "region": "Bhubaneswar & Central",
              "avg_visit_minutes": 45,
              "price_tier": "free",
              "rating": 4.6,
              "rating_count": 820,
              "rating_source": "Google Places",
              "verification_status": "VERIFIED",
              "contact_phone": null,
              "emergency_phone": null,
              "address": "Bindu Sagar Road, Old Town, Bhubaneswar 751002",
              "cuisine": null,
              "dietary_tags": null,
              "speciality_dishes": null,
              "images": [
                {
                  "storage_key": "place_bbsr_004/b91e7a5f0092",
                  "url": "/static/images/places/place_bbsr_004/b91e7a5f0092/hero.webp",
                  "thumbnail_url": "/static/images/places/place_bbsr_004/b91e7a5f0092/thumbnail.webp",
                  "card_url": "/static/images/places/place_bbsr_004/b91e7a5f0092/card.webp",
                  "alt_text": "Authentic photograph of Ananta Vasudeva Temple in Odisha",
                  "is_primary": true,
                  "id": "9d5cf1ae-566a-4e40-b7b4-4ffee25d263b"
                }
              ],
              "interests": ["temple", "heritage"]
            }
        """.trimIndent()

        val dto = json.decodeFromString<PlaceDetailDto>(jsonStr)
        assertEquals("cb5cfba0-f0c4-5801-af66-266d78b3d051", dto.id)
        assertEquals("Ananta Vasudeva Temple", dto.name)
        assertEquals("temple", dto.category)
        assertEquals(1, dto.images.size)
        assertEquals("/static/images/places/place_bbsr_004/b91e7a5f0092/hero.webp", dto.images[0].url)
        assertTrue(dto.images[0].isPrimary)
    }

    @Test
    fun testApiConfigResolveImageUrl() {
        val relative = "/static/images/hero.webp"
        val resolved = com.otravelz.android.core.network.ApiConfig.resolveImageUrl(relative)
        assertEquals("https://otravelz-backend.onrender.com/static/images/hero.webp", resolved)

        val absolute = "https://example.com/photo.jpg"
        assertEquals(absolute, com.otravelz.android.core.network.ApiConfig.resolveImageUrl(absolute))

        assertEquals(null, com.otravelz.android.core.network.ApiConfig.resolveImageUrl(null))
        assertEquals(null, com.otravelz.android.core.network.ApiConfig.resolveImageUrl(""))
    }
}
