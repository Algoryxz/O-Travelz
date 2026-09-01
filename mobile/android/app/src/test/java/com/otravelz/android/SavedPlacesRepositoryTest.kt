package com.otravelz.android

import com.otravelz.android.data.model.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.*
import org.junit.Test

class SavedPlacesRepositoryTest {

    private val json = Json { ignoreUnknownKeys = true; isLenient = true }

    @Test
    fun testSyncPlaceItemDtoSerialization() {
        val item = SyncPlaceItemDto(
            placeId = "konark-sun-temple",
            placeName = "Konark Sun Temple",
            savedAt = 1700000000000L,
            updatedAt = 1700000000000L,
            isDeleted = false
        )

        val encoded = json.encodeToString(item)
        assertTrue(encoded.contains("\"place_id\":\"konark-sun-temple\""))
        assertTrue(encoded.contains("\"place_name\":\"Konark Sun Temple\""))
        assertTrue(encoded.contains("\"saved_at\":1700000000000"))
        assertTrue(encoded.contains("\"is_deleted\":false"))

        val decoded = json.decodeFromString<SyncPlaceItemDto>(encoded)
        assertEquals(item.placeId, decoded.placeId)
        assertEquals(item.placeName, decoded.placeName)
        assertEquals(item.savedAt, decoded.savedAt)
        assertFalse(decoded.isDeleted)
    }

    @Test
    fun testSyncSavedPlacesRequestAndResponse() {
        val items = listOf(
            SyncPlaceItemDto(
                placeId = "jagannath-temple-puri",
                placeName = "Jagannath Temple",
                savedAt = 1700000001000L,
                updatedAt = 1700000001000L
            ),
            SyncPlaceItemDto(
                placeId = "chilika-lake",
                placeName = "Chilika Lake",
                savedAt = 1700000002000L,
                updatedAt = 1700000002000L
            )
        )

        val request = SyncSavedPlacesRequestDto(items = items)
        val requestEncoded = json.encodeToString(request)
        val requestDecoded = json.decodeFromString<SyncSavedPlacesRequestDto>(requestEncoded)
        assertEquals(2, requestDecoded.items.size)

        val response = SyncSavedPlacesResponseDto(syncedCount = 2, items = items)
        val responseEncoded = json.encodeToString(response)
        val responseDecoded = json.decodeFromString<SyncSavedPlacesResponseDto>(responseEncoded)
        assertEquals(2, responseDecoded.syncedCount)
        assertEquals("jagannath-temple-puri", responseDecoded.items[0].placeId)
    }

    @Test
    fun testPlaceDetailDtoWithRichMetadata() {
        val place = PlaceDetailDto(
            id = "dhauli-shanti-stupa",
            name = "Dhauli Shanti Stupa",
            category = "monument",
            district = "Khordha",
            avgVisitMinutes = 45,
            priceTier = "free",
            rating = 4.6,
            ratingCount = 1250,
            ratingSource = "verified_catalog",
            contactPhone = "+91-674-2391234",
            emergencyPhone = "112"
        )

        assertEquals("dhauli-shanti-stupa", place.id)
        assertEquals(45, place.avgVisitMinutes)
        assertEquals("free", place.priceTier)
        assertEquals(4.6, place.rating!!, 0.01)
        assertEquals("112", place.emergencyPhone)
    }
}
