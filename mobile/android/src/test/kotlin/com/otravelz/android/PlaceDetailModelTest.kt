package com.otravelz.android

import com.otravelz.android.data.network.adapter.WeatherState
import com.otravelz.android.data.network.adapter.toDomain
import com.otravelz.android.data.network.dto.CurrentWeatherDto
import com.otravelz.android.data.network.dto.LocalizedNamesDto
import com.otravelz.android.data.network.dto.PlaceDto
import com.otravelz.android.data.network.dto.PlaceImageDto
import com.otravelz.android.data.network.dto.WeatherResponseDto
import com.otravelz.android.domain.model.extractSourceIdentity
import com.otravelz.android.domain.model.toDomainPhotos
import com.otravelz.android.domain.model.toPlaceDetail
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class PlaceDetailModelTest {

    @Test
    fun testFiveTierSourcePhotoIdentityDeduplication() {
        // 1. Same media_asset_id deduplicates regardless of differing URLs
        val dto1 = PlaceImageDto(
            mediaAssetId = "asset-uuid-1",
            contentSha256 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            url = "/static/images/hero.webp"
        )
        val dto2 = PlaceImageDto(
            mediaAssetId = "asset-uuid-1",
            contentSha256 = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            url = "/different/path/card.webp"
        )
        val list1 = listOf(dto1, dto2).toDomainPhotos()
        assertEquals("Same mediaAssetId must deduplicate to 1 photo", 1, list1.size)
        assertEquals("media_asset:asset-uuid-1", extractSourceIdentity(dto1))

        // 2. Same contentSha256 deduplicates when media_asset_id is absent
        val dto3 = PlaceImageDto(
            contentSha256 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            assetHash = "hash-1",
            url = "/static/path1/hero.webp"
        )
        val dto4 = PlaceImageDto(
            contentSha256 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            assetHash = "hash-2",
            url = "/static/path2/card.webp"
        )
        val list2 = listOf(dto3, dto4).toDomainPhotos()
        assertEquals("Same contentSha256 must deduplicate to 1 photo", 1, list2.size)
        assertEquals("sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", extractSourceIdentity(dto3))

        // 3. Same assetHash deduplicates when higher tiers absent
        val dto5 = PlaceImageDto(assetHash = "hash-xyz", url = "/a/b/c/hero.webp")
        val dto6 = PlaceImageDto(assetHash = "hash-xyz", url = "/x/y/z/card.webp")
        val list3 = listOf(dto5, dto6).toDomainPhotos()
        assertEquals("Same assetHash must deduplicate to 1 photo", 1, list3.size)
        assertEquals("hash:hash-xyz", extractSourceIdentity(dto5))

        // 4. Same canonical image record id deduplicates when hashes absent
        val dto7 = PlaceImageDto(id = "record-123", url = "/a/b/c/hero.webp")
        val dto8 = PlaceImageDto(id = "record-123", url = "/x/y/z/card.webp")
        val list4 = listOf(dto7, dto8).toDomainPhotos()
        assertEquals("Same record id must deduplicate to 1 photo", 1, list4.size)
        assertEquals("record_id:record-123", extractSourceIdentity(dto7))

        // 5. Normalized source URL fallback
        val dto9 = PlaceImageDto(url = "/static/images/places/lingaraj_temple/06a456469886/hero.webp")
        val dto10 = PlaceImageDto(url = "/static/images/places/lingaraj_temple/06a456469886/card.webp")
        val list5 = listOf(dto9, dto10).toDomainPhotos()
        assertEquals("Same URL folder prefix must deduplicate to 1 photo", 1, list5.size)
    }

    @Test
    fun testThreeDistinctSourcePhotosPreserved() {
        val photos = listOf(
            PlaceImageDto(mediaAssetId = "photo-1", url = "/img1/hero.webp", isPrimary = true),
            PlaceImageDto(mediaAssetId = "photo-2", url = "/img2/hero.webp"),
            PlaceImageDto(mediaAssetId = "photo-3", url = "/img3/hero.webp")
        ).toDomainPhotos()

        assertEquals("Three distinct source photos must evaluate to 3 domain photos", 3, photos.size)
        assertTrue(photos[0].isPrimary)
        assertEquals("photo-1", photos[0].mediaAssetId)
        assertEquals("photo-2", photos[1].mediaAssetId)
        assertEquals("photo-3", photos[2].mediaAssetId)
    }

    @Test
    fun testMissingMediaCulturalFallback() {
        val placeDto = PlaceDto(
            id = "place_no_photo",
            name = "Barabati Fort",
            category = "fort",
            district = "Cuttack",
            localizedNames = LocalizedNamesDto(en = "Barabati Fort", or = "ବାରବାଟୀ ଦୁର୍ଗ"),
            images = emptyList()
        )
        val detail = placeDto.toPlaceDetail()

        assertEquals(0, detail.photos.size)
        assertEquals(0, detail.distinctPhotoCount)
        assertFalse(detail.hasMultiplePhotos)
        assertNull(detail.primaryPhoto)
        assertEquals("ବାରବାଟୀ ଦୁର୍ଗ", detail.odiaName)
    }

    @Test
    fun testVideoAnd3DCapabilityGatingFalse() {
        val placeDto = PlaceDto(
            id = "place_konark",
            name = "Konark Sun Temple",
            category = "heritage",
            district = "Puri"
        )
        val detail = placeDto.toPlaceDetail()

        // Strict capability gating: no video stream, no 3D runtime models in M10
        assertFalse("Video capability must evaluate strictly to false", detail.hasVideo)
        assertFalse("3D capability must evaluate strictly to false", detail.has3d)
    }

    @Test
    fun testPracticalTruthNullOmission() {
        val sparsePlace = PlaceDto(
            id = "place_sparse",
            name = "Debrigarh Sanctuary",
            category = "wildlife",
            priceTier = null,
            address = null,
            contactPhone = null,
            emergencyPhone = null,
            avgVisitMinutes = null
        )
        val detail = sparsePlace.toPlaceDetail()

        // Null fee != free
        assertNull("Null price tier must remain null (not free)", detail.priceTier)
        assertNull("Null address must remain null", detail.address)
        assertNull("Null contact phone must remain null", detail.contactPhone)
        assertNull("Null emergency phone must remain null", detail.emergencyPhone)
        assertNull("Null avg visit minutes must remain null", detail.avgVisitMinutes)
    }

    @Test
    fun testWeatherAvailableMapping() {
        val weatherDto = WeatherResponseDto(
            locationName = "Puri",
            current = CurrentWeatherDto(
                locationName = "Puri",
                temperatureC = 28.5,
                condition = "Partly Cloudy",
                advice = "Pleasant coastal breeze"
            )
        )
        val state = weatherDto.toDomain()

        assertTrue("Valid weather response must map to Available", state is WeatherState.Available)
        val available = state as WeatherState.Available
        assertEquals("Puri", available.locationName)
        assertEquals(28.5, available.temperatureC, 0.01)
        assertEquals("Partly Cloudy", available.condition)
        assertEquals("Pleasant coastal breeze", available.advice)
    }

    @Test
    fun testWeatherNullTemperatureYieldsUnavailableNeverZero() {
        // Critical truth rule: null temperature must never default to 0°C or Sunny
        val malformedDto = WeatherResponseDto(
            locationName = "Bhubaneswar",
            current = CurrentWeatherDto(
                locationName = "Bhubaneswar",
                temperatureC = null,
                condition = "Sunny"
            )
        )
        val state = malformedDto.toDomain()

        assertTrue("Null temperature must map strictly to Unavailable", state is WeatherState.Unavailable)
    }

    @Test
    fun testWeatherNullConditionYieldsUnavailable() {
        val malformedDto = WeatherResponseDto(
            locationName = "Bhubaneswar",
            current = CurrentWeatherDto(
                locationName = "Bhubaneswar",
                temperatureC = 31.0,
                condition = null
            )
        )
        val state = malformedDto.toDomain()

        assertTrue("Null condition must map strictly to Unavailable", state is WeatherState.Unavailable)
    }

    @Test
    fun testInvalidCoordinatesSkipWeather() {
        val noCoordPlace = PlaceDto(
            id = "place_no_coords",
            name = "Tribal Art Collective",
            category = "arts_and_crafts",
            lat = null,
            lon = null
        )
        val detail = noCoordPlace.toPlaceDetail()

        assertFalse("Place without lat/lon hasCoordinates must be false", detail.hasCoordinates)
    }

    @Test
    fun testCanonicalPlaceIdNavigationPreserved() {
        val dto = PlaceDto(
            id = "place_similipal_99",
            name = "Similipal National Park",
            category = "nature"
        )
        val detail = dto.toPlaceDetail()

        assertEquals("place_similipal_99", detail.id)
    }
}
