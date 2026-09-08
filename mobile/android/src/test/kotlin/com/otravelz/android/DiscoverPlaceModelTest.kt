package com.otravelz.android

import com.otravelz.android.data.network.dto.LocalizedNamesDto
import com.otravelz.android.data.network.dto.PlaceDto
import com.otravelz.android.data.network.dto.PlaceImageDto
import com.otravelz.android.domain.model.toDiscoverPlace
import com.otravelz.android.domain.model.toDomainPhotos
import com.otravelz.android.domain.model.toPlaceDetail
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class DiscoverPlaceModelTest {

    @Test
    fun testPhotoDeduplicationResponsiveVariants() {
        // 3 responsive variants of the same source photo must evaluate to 1 distinct photo
        val rawImages = listOf(
            PlaceImageDto(
                url = "/static/images/places/place_bbsr_001/06a456469886/hero.webp",
                cardUrl = "/static/images/places/place_bbsr_001/06a456469886/card.webp",
                thumbnailUrl = "/static/images/places/place_bbsr_001/06a456469886/thumbnail.webp",
                status = "verified",
                isPrimary = true
            ),
            PlaceImageDto(
                url = "/static/images/places/place_bbsr_001/06a456469886/card.webp",
                status = "verified",
                isPrimary = false
            ),
            PlaceImageDto(
                url = "/static/images/places/place_bbsr_001/06a456469886/thumbnail.webp",
                status = "verified",
                isPrimary = false
            )
        )

        val photos = rawImages.toDomainPhotos()
        assertEquals("Responsive variants sharing same source folder must be deduplicated to 1", 1, photos.size)
        assertTrue(photos[0].isPrimary)
    }

    @Test
    fun testDistinctPhotosKept() {
        val rawImages = listOf(
            PlaceImageDto(
                url = "/static/images/places/place_bbsr_001/06a456469886/hero.webp",
                isPrimary = true
            ),
            PlaceImageDto(
                url = "/static/images/places/place_bbsr_001/99b123456789/hero.webp",
                isPrimary = false
            )
        )

        val photos = rawImages.toDomainPhotos()
        assertEquals("Distinct photographic assets must both be preserved", 2, photos.size)
    }

    @Test
    fun testPlaceDtoToDiscoverPlaceMapping() {
        val dto = PlaceDto(
            id = "place_bbsr_001",
            name = "Lingaraj Temple",
            category = "temple",
            district = "Khordha",
            region = "Bhubaneswar & Central",
            description = "Historic 11th century temple.",
            localizedNames = LocalizedNamesDto(en = "Lingaraj Temple", or = "ଲିଙ୍ଗରାଜ ମନ୍ଦିର"),
            images = listOf(
                PlaceImageDto(
                    url = "/static/images/places/place_bbsr_001/06a456469886/hero.webp",
                    cardUrl = "/static/images/places/place_bbsr_001/06a456469886/card.webp",
                    isPrimary = true
                )
            )
        )

        val discoverPlace = dto.toDiscoverPlace()
        assertEquals("place_bbsr_001", discoverPlace.id)
        assertEquals("Lingaraj Temple", discoverPlace.name)
        assertEquals("ଲିଙ୍ଗରାଜ ମନ୍ଦିର", discoverPlace.odiaName)
        assertEquals("temple", discoverPlace.category)
        assertEquals("Khordha", discoverPlace.district)
        assertNotNull(discoverPlace.primaryPhoto)
        assertEquals(1, discoverPlace.verifiedPhotoCount)
        assertTrue(discoverPlace.isEligibleLeisure)
    }

    @Test
    fun testNonLeisureExclusion() {
        val hospitalDto = PlaceDto(id = "h1", name = "AIIMS", category = "hospital")
        assertFalse(hospitalDto.toDiscoverPlace().isEligibleLeisure)

        val transitDto = PlaceDto(id = "t1", name = "Baramunda ISBT", category = "transit_hub")
        assertFalse(transitDto.toDiscoverPlace().isEligibleLeisure)

        val templeDto = PlaceDto(id = "p1", name = "Konark Sun Temple", category = "heritage")
        assertTrue(templeDto.toDiscoverPlace().isEligibleLeisure)
    }

    @Test
    fun testPlaceDetailNullPracticalFieldsHandling() {
        val dto = PlaceDto(
            id = "place_013",
            name = "Museum of Tribal Arts and Artifacts",
            category = "museum",
            lat = 20.2562,
            lon = 85.8415,
            description = "Museum presenting tribal arts."
        )

        val detail = dto.toPlaceDetail()
        assertTrue(detail.hasCoordinates)
        assertNull(detail.contactPhone)
        assertNull(detail.emergencyPhone)
        assertNull(detail.priceTier)
    }
}
