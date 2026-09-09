package com.otravelz.android

import com.otravelz.android.data.local.entity.SavedPlaceEntity
import com.otravelz.android.data.network.adapter.WeatherState
import com.otravelz.android.domain.model.PlaceDetail
import com.otravelz.android.domain.model.PlacePhoto
import com.otravelz.android.offline.NetworkConnectivityMonitor
import com.otravelz.android.offline.NetworkState
import com.otravelz.android.offline.WeatherCacheStore
import org.junit.Assert.*
import org.junit.Test
import java.io.File

/**
 * Wave M18 Offline Product Model & Capability Tests.
 */
class OfflineProductModelTest {

    @Test
    fun testNetworkStateTransitions() {
        val monitor = NetworkConnectivityMonitor.createMock(NetworkState.Online)
        assertEquals(NetworkState.Online, monitor.networkState.value)

        monitor.setSimulatedState(NetworkState.Offline)
        assertEquals(NetworkState.Offline, monitor.networkState.value)

        monitor.setSimulatedState(NetworkState.Unknown)
        assertEquals(NetworkState.Unknown, monitor.networkState.value)
    }

    @Test
    fun testWeatherCacheStoreRelativeTimeAndObservation() {
        val store = WeatherCacheStore.createMock()
        val now = 1757400000000L

        // Just now
        assertEquals("just now", store.formatRelativeTimeAgo(now - 30_000L, now))
        // 45 minutes ago
        assertEquals("45m", store.formatRelativeTimeAgo(now - (45 * 60 * 1000L), now))
        // 3 hours ago
        assertEquals("3h", store.formatRelativeTimeAgo(now - (3 * 3600 * 1000L), now))
        // 2 days ago
        assertEquals("2d", store.formatRelativeTimeAgo(now - (48 * 3600 * 1000L), now))

        // Save observation
        store.saveObservation(
            lat = 20.2961,
            lon = 85.8245,
            locationName = "Bhubaneswar",
            temperatureC = 29.5,
            condition = "Partly Cloudy",
            advice = "Light breeze",
            observedAtMillis = now - (3 * 3600 * 1000L)
        )

        val cached = store.getCachedObservation(20.2961, 85.8245, nowMillis = now)
        assertNotNull("Observation must be retrieved from cache", cached)
        assertTrue("Cached observation must map to WeatherState.Cached", cached is WeatherState.Cached)

        val cachedWeather = cached as WeatherState.Cached
        assertEquals("Bhubaneswar", cachedWeather.locationName)
        assertEquals(29.5, cachedWeather.temperatureC, 0.01)
        assertEquals("Partly Cloudy", cachedWeather.condition)
        assertEquals("3h", cachedWeather.relativeTimeAgo)
        assertEquals("Light breeze", cachedWeather.advice)

        // Missing observation must return null, never fabricate 0°C or Sunny
        val missing = store.getCachedObservation(19.00, 84.00, nowMillis = now)
        assertNull("Uncached coordinates must return null", missing)
    }

    @Test
    fun testSavedPlaceOfflineSnapshotConstruction() {
        val saved = SavedPlaceEntity(
            canonicalPlaceId = "place_bbsr_001",
            savedAt = 1757300000000L,
            placeName = "Lingaraj Temple",
            category = "temple",
            district = "Khordha",
            imageUrl = "https://images.otravelz.com/lingaraj_hero.webp",
            rating = 4.8
        )

        val photoList = listOf(
            PlacePhoto(
                id = "photo_${saved.canonicalPlaceId}",
                url = saved.imageUrl!!,
                cardUrl = saved.imageUrl,
                thumbnailUrl = saved.imageUrl,
                altText = saved.placeName,
                title = saved.placeName,
                sourceName = "Verified Editorial Catalog",
                license = "Editorial Verification",
                attribution = null,
                isPrimary = true
            )
        )

        val snapshot = PlaceDetail(
            id = saved.canonicalPlaceId,
            name = saved.placeName,
            odiaName = null,
            category = saved.category,
            district = saved.district ?: "Odisha",
            region = null,
            description = null,
            lat = null,
            lon = null,
            avgVisitMinutes = null,
            priceTier = null,
            address = null,
            contactPhone = null,
            emergencyPhone = null,
            source = "Local Offline Snapshot",
            sourceUrl = null,
            verifiedAt = null,
            verificationStatus = "Verified Offline Snapshot",
            photos = photoList
        )

        assertEquals("place_bbsr_001", snapshot.id)
        assertEquals("Lingaraj Temple", snapshot.name)
        assertEquals("temple", snapshot.category)
        assertEquals("Khordha", snapshot.district)
        assertNull("Lat must be null in offline snapshot", snapshot.lat)
        assertNull("Lon must be null in offline snapshot", snapshot.lon)
        assertNull("Contact phone must be null in offline snapshot", snapshot.contactPhone)
        assertEquals(1, snapshot.photos.size)
        assertEquals("https://images.otravelz.com/lingaraj_hero.webp", snapshot.photos.first().url)
    }

    @Test
    fun testTransitAssetsBundledAndVerified() {
        val routesFile = File("src/main/assets/transit/routes.json")
        val schedulesFile = File("src/main/assets/transit/schedules.json")
        val routeStopsFile = File("src/main/assets/transit/route_stops.json")

        assertTrue("routes.json must exist in assets", routesFile.exists())
        assertTrue("schedules.json must exist in assets", schedulesFile.exists())
        assertTrue("route_stops.json must exist in assets", routeStopsFile.exists())

        assertTrue("routes.json must not be empty", routesFile.length() > 50_000L)
        assertTrue("schedules.json must not be empty", schedulesFile.length() > 100_000L)
        assertTrue("route_stops.json must not be empty", routeStopsFile.length() > 200_000L)
    }

    @Test
    fun testStageG1CandidatesQuarantined() {
        // Assert no unpromoted candidate crosswalks or geoBoundaries in assets
        val assetsDir = File("src/main/assets")
        val candidateFiles = assetsDir.walkTopDown().filter {
            it.name.contains("geoboundaries", ignoreCase = true) ||
            it.name.contains("crosswalk", ignoreCase = true)
        }.toList()

        assertTrue("Staged candidate assets must remain quarantined outside production assets", candidateFiles.isEmpty())
    }
}
