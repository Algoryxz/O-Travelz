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

    @Test
    fun testKendujharNormalization() {
        val place = com.otravelz.android.domain.model.DiscoverPlace(
            id = "test_kj",
            name = "Khandadhar Waterfall",
            category = "waterfall",
            district = "Kendujhar"
        )
        assertEquals("Keonjhar", place.normalizedDistrict)
    }

    @Test
    fun testHaversineDistanceCalculationAndFormatting() {
        // Lingaraj Temple in Bhubaneswar: 20.2382, 85.8335
        // Master Canteen (Bhubaneswar Railway Station): 20.2667, 85.8436
        // Approximate distance: ~3.3 km
        val place = com.otravelz.android.domain.model.DiscoverPlace(
            id = "lingaraj",
            name = "Lingaraj Temple",
            category = "temple",
            district = "Khordha",
            lat = 20.2382,
            lon = 85.8335
        )

        val dist = place.distanceKmFrom(20.2667, 85.8436)
        assertNotNull(dist)
        assertTrue("Distance between station and Lingaraj should be ~3.3 km", dist!! in 3.0..3.6)

        // Test formatting
        val formattedKm = place.formattedDistance(dist)
        assertTrue(formattedKm.endsWith("km away"))

        val closeFormatted = place.formattedDistance(0.45)
        assertEquals("450 m away", closeFormatted)
    }

    @Test
    fun testSearchEngineTieredRanking() {
        val p1 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "p1",
            name = "Puri",
            category = "beach",
            district = "Puri"
        )
        val p2 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "p2",
            name = "Puriswara Temple",
            category = "temple",
            district = "Ganjam"
        )
        val p3 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "p3",
            name = "Jagannath Temple",
            category = "temple",
            district = "Puri"
        )
        val p4 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "p4",
            name = "Gopalpur-on-Sea",
            category = "beach",
            district = "Ganjam"
        )

        val catalog = listOf(p3, p4, p2, p1)
        val results = com.otravelz.android.domain.model.DiscoverSearchEngine.filterAndRank(
            catalog = catalog,
            query = "Puri"
        )

        // Exact match (p1) must be first (Score 1000)
        assertEquals("Exact match should be first", "p1", results[0].id)
        // Prefix match (p2) must be second (Score 800)
        assertEquals("Prefix match should be second", "p2", results[1].id)
        // District match (p3) should be third (Score 400)
        assertEquals("District match should be third", "p3", results[2].id)
        // p4 does not match "Puri" at all, so excluded
        assertEquals(3, results.size)
    }

    @Test
    fun testOdiaScriptSearch() {
        val p1 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "konark",
            name = "Konark Sun Temple",
            odiaName = "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
            category = "heritage",
            district = "Puri"
        )
        val p2 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "lingaraj",
            name = "Lingaraj Temple",
            odiaName = "ଲିଙ୍ଗରାଜ ମନ୍ଦିର",
            category = "temple",
            district = "Khordha"
        )

        val catalog = listOf(p1, p2)
        val results = com.otravelz.android.domain.model.DiscoverSearchEngine.filterAndRank(
            catalog = catalog,
            query = "କୋଣାର୍କ"
        )

        assertEquals(1, results.size)
        assertEquals("konark", results[0].id)
    }

    @Test
    fun testMultiFilterCombination() {
        val p1 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "p1",
            name = "Dhauli Shanti Stupa",
            category = "heritage",
            district = "Khordha"
        )
        val p2 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "p2",
            name = "Lingaraj Temple",
            category = "temple",
            district = "Khordha"
        )
        val p3 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "p3",
            name = "Konark Sun Temple",
            category = "heritage",
            district = "Puri"
        )

        val catalog = listOf(p1, p2, p3)

        // Filter by category heritage AND district Khordha
        val results = com.otravelz.android.domain.model.DiscoverSearchEngine.filterAndRank(
            catalog = catalog,
            category = "heritage",
            district = "Khordha"
        )

        assertEquals(1, results.size)
        assertEquals("p1", results[0].id)
    }

    @Test
    fun testProximitySortingWhenNearMeActive() {
        // User at Bhubaneswar Railway Station (20.2667, 85.8436)
        // p1: Lingaraj Temple (20.2382, 85.8335) ~ 3.3 km
        // p2: Dhauli Stupa (20.1923, 85.8394) ~ 8.3 km
        // p3: Konark Sun Temple (19.8876, 86.0945) ~ 50+ km
        val p1 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "lingaraj",
            name = "Lingaraj Temple",
            category = "temple",
            district = "Khordha",
            lat = 20.2382,
            lon = 85.8335
        )
        val p2 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "dhauli",
            name = "Dhauli Shanti Stupa",
            category = "heritage",
            district = "Khordha",
            lat = 20.1923,
            lon = 85.8394
        )
        val p3 = com.otravelz.android.domain.model.DiscoverPlace(
            id = "konark",
            name = "Konark Sun Temple",
            category = "heritage",
            district = "Puri",
            lat = 19.8876,
            lon = 86.0945
        )

        val catalog = listOf(p3, p2, p1)
        val results = com.otravelz.android.domain.model.DiscoverSearchEngine.filterAndRank(
            catalog = catalog,
            userLat = 20.2667,
            userLon = 85.8436,
            isNearbyEnabled = true
        )

        assertEquals("Closest place must be first", "lingaraj", results[0].id)
        assertEquals("Second closest must be second", "dhauli", results[1].id)
        assertEquals("Furthest must be last", "konark", results[2].id)
    }
}
